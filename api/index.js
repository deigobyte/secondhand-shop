const crypto = require('crypto');

// Upstash Redis REST API
const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

async function redisGet(key) {
  try {
    const res = await fetch(`${UPSTASH_URL}/get/${key}`, {
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` }
    });
    const data = await res.json();
    if (!data.result) return null;
    const parsed = JSON.parse(data.result);
    if (parsed.value && typeof parsed.value === 'string') {
      return JSON.parse(parsed.value);
    }
    return parsed;
  } catch (e) {
    return null;
  }
}

async function redisSet(key, value) {
  await fetch(`${UPSTASH_URL}/set/${key}`, {
    method: 'POST',
    headers: { 
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(value)
  });
}

// 密码哈希
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// 生成Token
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') return res.status(200).end();

  const path = req.url.split('?')[0];

  try {
    // ===== 用户注册 =====
    if (path === '/api/auth/register' && req.method === 'POST') {
      const { username, password, shopName } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: '用户名和密码必填' });
      }

      // 检查用户是否已存在
      const users = await redisGet('users') || [];
      if (users.find(u => u.username === username)) {
        return res.status(400).json({ error: '用户名已存在' });
      }

      const newUser = {
        _id: Date.now().toString(),
        username,
        passwordHash: hashPassword(password),
        shopName: shopName || username + '的店铺',
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      await redisSet('users', users);

      return res.status(201).json({ 
        success: true, 
        userId: newUser._id,
        shopName: newUser.shopName 
      });
    }

    // ===== 用户登录 =====
    if (path === '/api/auth/login' && req.method === 'POST') {
      const { username, password } = req.body;
      
      const users = await redisGet('users') || [];
      const user = users.find(u => u.username === username);
      
      if (!user || user.passwordHash !== hashPassword(password)) {
        return res.status(401).json({ error: '用户名或密码错误' });
      }

      const token = generateToken();
      
      // 保存token
      const tokens = await redisGet('tokens') || {};
      tokens[token] = { userId: user._id, createdAt: Date.now() };
      await redisSet('tokens', tokens);

      return res.status(200).json({
        success: true,
        token,
        user: {
          _id: user._id,
          username: user.username,
          shopName: user.shopName
        }
      });
    }

    // ===== 获取当前用户信息 =====
    if (path === '/api/auth/me' && req.method === 'GET') {
      const authHeader = req.headers.authorization;
      if (!authHeader) return res.status(401).json({ error: '未登录' });

      const token = authHeader.replace('Bearer ', '');
      const tokens = await redisGet('tokens') || {};
      const tokenData = tokens[token];
      
      if (!tokenData) return res.status(401).json({ error: '登录已过期' });

      const users = await redisGet('users') || [];
      const user = users.find(u => u._id === tokenData.userId);
      
      if (!user) return res.status(404).json({ error: '用户不存在' });

      return res.status(200).json({
        _id: user._id,
        username: user.username,
        shopName: user.shopName
      });
    }

    // ===== 获取所有店铺列表 =====
    if (path === '/api/shops' && req.method === 'GET') {
      const users = await redisGet('users') || [];
      const items = await redisGet('items') || [];
      
      const shops = users.map(user => {
        const userItems = items.filter(item => item.userId === user._id && item.status === 'active');
        return {
          _id: user._id,
          shopName: user.shopName,
          username: user.username,
          itemCount: userItems.length,
          createdAt: user.createdAt
        };
      }).filter(shop => shop.itemCount > 0);

      return res.status(200).json(shops);
    }

    // ===== 获取指定店铺的商品 =====
    if (path === '/api/shop/items' && req.method === 'GET') {
      const { userId } = req.query;
      if (!userId) return res.status(400).json({ error: '缺少店铺ID' });

      const items = await redisGet('items') || [];
      const users = await redisGet('users') || [];
      const user = users.find(u => u._id === userId);
      
      if (!user) return res.status(404).json({ error: '店铺不存在' });

      const shopItems = items.filter(item => item.userId === userId && item.status === 'active');
      
      return res.status(200).json({
        shop: {
          _id: user._id,
          shopName: user.shopName,
          username: user.username,
          announcement: user.announcement || ''
        },
        items: shopItems
      });
    }

    // ===== 更新店铺公告（需要登录） =====
    if (path === '/api/shop/announcement' && req.method === 'PUT') {
      const authHeader = req.headers.authorization;
      if (!authHeader) return res.status(401).json({ error: '请先登录' });

      const token = authHeader.replace('Bearer ', '');
      const tokens = await redisGet('tokens') || {};
      const tokenData = tokens[token];
      
      if (!tokenData) return res.status(401).json({ error: '登录已过期' });

      const { announcement } = req.body;
      
      let users = await redisGet('users') || [];
      const userIndex = users.findIndex(u => u._id === tokenData.userId);
      
      if (userIndex === -1) return res.status(404).json({ error: '用户不存在' });

      users[userIndex].announcement = announcement || '';
      await redisSet('users', users);
      
      return res.status(200).json({ success: true, announcement: users[userIndex].announcement });
    }

    // ===== 商品操作（需要登录） =====
    if (path === '/api/items') {
      // 验证登录
      const authHeader = req.headers.authorization;
      let currentUserId = null;
      
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        const tokens = await redisGet('tokens') || {};
        const tokenData = tokens[token];
        if (tokenData) currentUserId = tokenData.userId;
      }

      // GET - 获取商品（公开）
      if (req.method === 'GET') {
        const items = await redisGet('items') || [];
        return res.status(200).json(items.filter(i => i.status === 'active'));
      }

      // POST - 添加商品（需要登录）
      if (req.method === 'POST') {
        if (!currentUserId) return res.status(401).json({ error: '请先登录' });

        const { name, price, condition, category, categoryValue, desc, image } = req.body;
        const items = await redisGet('items') || [];
        
        const newItem = {
          _id: Date.now().toString(),
          userId: currentUserId,
          name,
          price: parseInt(price),
          condition,
          category,
          categoryValue,
          desc,
          image,
          status: 'active',
          createdAt: new Date().toISOString()
        };

        items.unshift(newItem);
        await redisSet('items', items);
        
        return res.status(201).json(newItem);
      }

      // PUT - 更新商品（需要是自己的商品）
      if (req.method === 'PUT') {
        if (!currentUserId) return res.status(401).json({ error: '请先登录' });

        const { id, ...updateData } = req.body;
        let items = await redisGet('items') || [];
        
        const item = items.find(i => i._id === id);
        if (!item) return res.status(404).json({ error: '商品不存在' });
        if (item.userId !== currentUserId) return res.status(403).json({ error: '无权修改此商品' });

        const idx = items.findIndex(i => i._id === id);
        items[idx] = { ...item, ...updateData, updatedAt: new Date().toISOString() };
        await redisSet('items', items);
        
        return res.status(200).json({ success: true });
      }

      // DELETE - 删除商品
      if (req.method === 'DELETE') {
        if (!currentUserId) return res.status(401).json({ error: '请先登录' });

        const { id } = req.query;
        let items = await redisGet('items') || [];
        
        const item = items.find(i => i._id === id);
        if (!item) return res.status(404).json({ error: '商品不存在' });
        if (item.userId !== currentUserId) return res.status(403).json({ error: '无权删除此商品' });

        items = items.filter(i => i._id !== id);
        await redisSet('items', items);
        
        return res.status(200).json({ success: true });
      }
    }

    return res.status(404).json({ error: '接口不存在' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
};
