import { MongoClient } from 'mongodb';

async function testConnection() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskzen';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Successfully connected to MongoDB');
    
    // Test database and collection
    const db = client.db('taskzen');
    const collections = await db.listCollections().toArray();
    console.log('📋 Collections:', collections.map(c => c.name));
    
    // Create users collection if it doesn't exist
    if (!collections.some(c => c.name === 'users')) {
      await db.createCollection('users');
      console.log('✅ Created users collection');
    }
    
    // Create tasks collection if it doesn't exist
    if (!collections.some(c => c.name === 'tasks')) {
      await db.createCollection('tasks');
      console.log('✅ Created tasks collection');
    }
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
  } finally {
    await client.close();
  }
}

testConnection();
