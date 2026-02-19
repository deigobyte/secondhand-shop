const { Redis } = require('@upstash/redis');

// 内存存储作为 fallback
let memoryStore = [];

// 检查是否有 Redis 配置
const hasRedis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

// 如果有配置就创建 Redis 客户端
let redis = null;
if (hasRedis) {
  try {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  } catch (e) {
    console.error('Redis init error:', e);
  }
}

const CHATS_KEY = 'secondhand:chats';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 判断使用哪种存储
    const useRedis = redis !== null;

    switch (req.method) {
      case 'GET':
        // 获取聊天消息
        const { itemId, buyerId } = req.query;
        let allChats;
        
        if (useRedis) {
          allChats = await redis.get(CHATS_KEY) || [];
        } else {
          allChats = memoryStore;
        }
        
        if (itemId && buyerId) {
          // 获取特定买家和商品的聊天记录
          const chats = allChats.filter(c => c.itemId === itemId && c.buyerId === buyerId);
          return res.status(200).json(chats);
        } else if (itemId) {
          // 获取商品的所有聊天
          const chats = allChats.filter(c => c.itemId === itemId);
          return res.status(200).json(chats);
        } else {
          // 获取所有聊天（管理后台用）
          return res.status(200).json(allChats);
        }

      case 'POST':
        // 发送消息或标记已读
        const body = req.body;
        
        if (body.action === 'markRead') {
          // 标记已读
          const { itemId: mid, buyerId: bid } = body;
          let chatsToUpdate;
          
          if (useRedis) {
            chatsToUpdate = await redis.get(CHATS_KEY) || [];
          } else {
            chatsToUpdate = memoryStore;
          }
          
          chatsToUpdate = chatsToUpdate.map(c => {
            if (c.itemId === mid && c.buyerId === bid && !c.isSeller) {
              return { ...c, read: true };
            }
            return c;
          });
          
          if (useRedis) {
            await redis.set(CHATS_KEY, chatsToUpdate);
          } else {
            memoryStore = chatsToUpdate;
          }
          
          return res.status(200).json({ success: true });
        }
        
        // 发送新消息
        const { itemId, buyerId, buyerName, message, isSeller } = body;
        let chats;
        
        if (useRedis) {
          chats = await redis.get(CHATS_KEY) || [];
        } else {
          chats = [...memoryStore];
        }
        
        const newMessage = {
          _id: Date.now().toString(),
          itemId,
          buyerId: buyerId || 'seller',
          buyerName: buyerName || (isSeller ? '卖家' : '买家'),
          message,
          isSeller: isSeller || false,
          read: isSeller ? true : false,
          createdAt: new Date().toISOString()
        };
        
        chats.push(newMessage);
        
        if (useRedis) {
          await redis.set(CHATS_KEY, chats);
        } else {
          memoryStore = chats;
        }
        
        return res.status(201).json(newMessage);

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Chat API Error:', error);
    return res.status(500).json({ error: error.message });
  }
};
