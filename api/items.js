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

const ITEMS_KEY = 'secondhand:items';

module.exports = async (req, res) => {
  // 设置 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 判断使用哪种存储
    const useRedis = redis !== null;

    switch (req.method) {
      case 'GET':
        // 获取所有商品
        let items;
        if (useRedis) {
          items = await redis.get(ITEMS_KEY) || [];
        } else {
          items = memoryStore;
        }
        return res.status(200).json(items);

      case 'POST':
        // 创建商品
        const { name, price, condition, category, categoryValue, desc, image, status } = req.body;
        let currentItems = useRedis ? (await redis.get(ITEMS_KEY) || []) : memoryStore;
        
        const newItem = {
          _id: Date.now().toString(),
          name,
          price: parseInt(price),
          condition,
          category,
          categoryValue,
          desc,
          image,
          status: status || 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        currentItems.unshift(newItem);
        
        if (useRedis) {
          await redis.set(ITEMS_KEY, currentItems);
        } else {
          memoryStore = currentItems;
        }
        
        return res.status(201).json(newItem);

      case 'PUT':
        // 更新商品
        const { id, ...updateData } = req.body;
        let itemsToUpdate = useRedis ? (await redis.get(ITEMS_KEY) || []) : memoryStore;
        
        const itemIndex = itemsToUpdate.findIndex(i => i._id === id);
        if (itemIndex >= 0) {
          itemsToUpdate[itemIndex] = { 
            ...itemsToUpdate[itemIndex], 
            ...updateData, 
            updatedAt: new Date().toISOString() 
          };
          
          if (useRedis) {
            await redis.set(ITEMS_KEY, itemsToUpdate);
          } else {
            memoryStore = itemsToUpdate;
          }
        }
        return res.status(200).json({ success: true });

      case 'DELETE':
        // 删除商品
        const { id: deleteId } = req.query;
        let itemsToDelete = useRedis ? (await redis.get(ITEMS_KEY) || []) : memoryStore;
        
        const filteredItems = itemsToDelete.filter(i => i._id !== deleteId);
        
        if (useRedis) {
          await redis.set(ITEMS_KEY, filteredItems);
        } else {
          memoryStore = filteredItems;
        }
        
        return res.status(200).json({ success: true });

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
};
