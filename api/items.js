// 纯内存存储
let memoryStore = [
  {
    _id: '1',
    name: 'iPhone 12 Pro 手机壳套装',
    price: 299,
    condition: '95新',
    category: '电子产品',
    categoryValue: 'electronics',
    desc: '买了没多久，换手机了所以出掉。包含3个壳子+贴膜，原价599买的。',
    image: 'https://images.unsplash.com/photo-1603313011101-320f26a4f6f6?w=400&h=400&fit=crop',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    _id: '2',
    name: '宜家书桌 白色',
    price: 150,
    condition: '8成新',
    category: '家具',
    categoryValue: 'furniture',
    desc: '尺寸 120x60cm，用了两年，搬家带不走。',
    image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&h=400&fit=crop',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    _id: '3',
    name: 'JavaScript高级程序设计',
    price: 50,
    condition: '9成新',
    category: '书籍',
    categoryValue: 'books',
    desc: '就翻过几次，几乎全新。',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop',
    status: 'sold',
    createdAt: new Date().toISOString()
  }
];

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case 'GET':
        return res.status(200).json(memoryStore);

      case 'POST':
        const { name, price, condition, category, categoryValue, desc, image, status } = req.body;
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
        memoryStore.unshift(newItem);
        return res.status(201).json(newItem);

      case 'PUT':
        const { id, ...updateData } = req.body;
        const itemIndex = memoryStore.findIndex(i => i._id === id);
        if (itemIndex >= 0) {
          memoryStore[itemIndex] = { 
            ...memoryStore[itemIndex], 
            ...updateData, 
            updatedAt: new Date().toISOString() 
          };
        }
        return res.status(200).json({ success: true });

      case 'DELETE':
        const { id: deleteId } = req.query;
        memoryStore = memoryStore.filter(i => i._id !== deleteId);
        return res.status(200).json({ success: true });

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
};
