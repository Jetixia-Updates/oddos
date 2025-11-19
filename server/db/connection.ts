import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
  console.warn('⚠️  MONGODB_URI not defined. Database features will be unavailable.');
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;
let connectionError: Error | null = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined');
  }

  if (connectionError) {
    throw connectionError;
  }

  try {
    const client = await MongoClient.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
      maxPoolSize: 10,
      retryWrites: true,
      retryReads: true,
    });
    const db = client.db('odoos_erp');

    cachedClient = client;
    cachedDb = db;

    console.log('✅ Connected to MongoDB');

    return { client, db };
  } catch (error) {
    connectionError = error as Error;
    console.error('❌ MongoDB connection failed:', error);
    throw error;
  }
}

export async function getDatabase(): Promise<Db> {
  try {
    const { db } = await connectToDatabase();
    return db;
  } catch (error) {
    console.error('❌ Failed to get database:', error);
    throw error;
  }
}
