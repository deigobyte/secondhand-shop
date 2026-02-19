// 纯内存存储（简化版）
let memoryStore = [];

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case 'GET':
        // 获取聊天消息
        const { itemId, buyerId } = req.query;
        
        if (itemId && buyerId) {
          const chats = memoryStore.filter(c => c.itemId === itemId && c.buyerId === buyerId);
          return res.status(200).json(chats);
        } else if (itemId) {
          const chats = memoryStore.filter(c => c.itemId === itemId);
          return res.status(200).json(chats);
        } else {
          return res.status(200).json(memoryStore);
        }

      case 'POST':
        const body = req.body;
        
        if (body.action === 'markRead') {
          const { itemId: mid, buyerId: bid } = body;
          memoryStore = memoryStore.map(c => {
            if (c.itemId === mid && c.buyerId === bid && !c.isSeller) {
              return { ...c, read: true };
            }
            return c;
          });
          return res.status(200).json({ success: true });
        }
        
        // 发送新消息
        const { itemId, buyerId, buyerName, message, isSeller } = body;
        
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
        
        memoryStore.push(newMessage);
        
        return res.status(201).json(newMessage);

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Chat API Error:', error);
    return res.status(500).json({ error: error.message });
  }
};
