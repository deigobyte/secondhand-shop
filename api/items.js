const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) return cachedDb;
  await client.connect();
  const db = client.db('secondhand');
  cachedDb = db;
  return db;
}

module.exports = async (req, res) => {
  // 设置 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const db = await connectToDatabase();
    const items = db.collection('items');

    switch (req.method) {
      case 'GET':
        // 获取所有商品
        const allItems = await items.find({}).sort({ createdAt: -1 }).toArray();
        return res.status(200).json(allItems);

      case 'POST':
        // 创建商品
        const { name, price, condition, category, categoryValue, desc, image, status } = req.body;
        const newItem = {
          name,
          price: parseInt(price),
          condition,
          category,
          categoryValue,
          desc,
          image,
          status: status || 'active',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        const result = await items.insertOne(newItem);
        return res.status(201).json({ ...newItem, _id: result.insertedId });

      case 'PUT':
        // 更新商品
        const { id, ...updateData } = req.body;
        await items.updateOne(
          { _id: new ObjectId(id) },
          { 
            $set: { 
              ...updateData, 
              updatedAt: new Date() 
            } 
          }
        );
        return res.status(200).json({ success: true });

      case 'DELETE':
        // 删除商品
        const { id: deleteId } = req.query;
        await items.deleteOne({ _id: new ObjectId(deleteId) });
        return res.status(200).json({ success: true });

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
};
