import { MongoClient, MongoClientOptions } from 'mongodb';
import { getEnvVar } from './env';

// Get MongoDB URI from environment variables
const uri = getEnvVar('MONGODB_URI', 'mongodb://localhost:27017/taskzen');
const options: MongoClientOptions = {
  // Add any MongoDB options here
  // For example, to enable the new URL parser and the new server discovery and monitoring engine
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
};

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!uri) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable to preserve the connection across hot-reloads
  if (!global._mongoClientPromise) {
    console.log('Creating new MongoDB client');
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect().catch((err) => {
      console.error('Failed to connect to MongoDB:', err);
      throw err;
    });
  } else {
    console.log('Using existing MongoDB client');
  }
  clientPromise = global._mongoClientPromise!;
} else {
  // In production mode, avoid using a global variable
  console.log('Creating production MongoDB client');
  client = new MongoClient(uri, options);
  clientPromise = client.connect().catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    throw err;
  });
}

// Export a module-scoped MongoClient promise
// This ensures the client is shared across functions
// and prevents creating new connections on every request
export default clientPromise;
