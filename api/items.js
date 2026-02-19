// Upstash Redis REST API 直接调用
const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

async function redisGet(key) {
  try {
    const res = await fetch(`${UPSTASH_URL}/get/${key}`, {
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` }
    });
    const data = await res.json();
    
    if (!data.result) return [];
    
    // 解析存储的 JSON 字符串
    const parsed = JSON.parse(data.result);
    
    // 确保返回的是数组
    if (Array.isArray(parsed)) {
      return parsed;
    }
    
    // 如果不是数组，返回空数组
    console.error('Redis data is not an array:', parsed);
    return [];
  } catch (error) {
    console.error('Redis get error:', error);
    return [];
  }
}

async function redisSet(key, value) {
  await fetch(`${UPSTASH_URL}/set/${key}`, {
    method: 'POST',
    headers: { 
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ value: JSON.stringify(value) })
  });
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    switch (req.method) {
      case 'GET': {
        const items = await redisGet('items');
        return res.status(200).json(items);
      }

      case 'POST': {
        const { name, price, condition, category, categoryValue, desc, image, status } = req.body;
        const items = await redisGet('items');
        
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
          createdAt: new Date().toISOString()
        };
        
        items.unshift(newItem);
        await redisSet('items', items);
        
        return res.status(201).json(newItem);
      }

      case 'PUT': {
        const { id, ...updateData } = req.body;
        let items = await redisGet('items');
        
        const idx = items.findIndex(i => i._id === id);
        if (idx >= 0) {
          items[idx] = { ...items[idx], ...updateData, updatedAt: new Date().toISOString() };
          await redisSet('items', items);
        }
        return res.status(200).json({ success: true });
      }

      case 'DELETE': {
        const { id } = req.query;
        let items = await redisGet('items');
        const filtered = items.filter(i => i._id !== id);
        await redisSet('items', filtered);
        return res.status(200).json({ success: true });
      }

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
};
