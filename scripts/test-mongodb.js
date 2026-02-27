const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '../.env.local' });

async function testConnection() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskzen';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Successfully connected to MongoDB');
    
    // List all databases
    const adminDb = client.db().admin();
    const dbs = await adminDb.listDatabases();
    console.log('Available databases:', dbs.databases.map(db => db.name));
    
    // Check if our database exists
    const dbName = new URL(uri).pathname.replace(/^\//, '');
    const dbExists = dbs.databases.some(db => db.name === dbName);
    
    if (!dbExists) {
      console.log(`\n⚠️  Database '${dbName}' doesn't exist. It will be created when you first insert data.`);
    } else {
      console.log(`\n✅ Database '${dbName}' exists`);
      // List collections in our database
      const db = client.db(dbName);
      const collections = await db.listCollections().toArray();
      console.log('Collections:', collections.map(c => c.name));
    }
    
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    console.log('\nTroubleshooting steps:');
    console.log('1. Make sure MongoDB is installed and running');
    console.log('2. Check if the MongoDB service is running (services.msc)');
    console.log('3. Verify your MONGODB_URI in .env.local is correct');
    console.log('4. If using authentication, make sure to include username/password in the URI');
  } finally {
    await client.close();
  }
}

testConnection();
