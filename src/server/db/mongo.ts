import type { Db } from 'mongodb';
import clientPromise from '@/lib/mongodb';

const DB_NAME = process.env.MONGODB_DB || 'taskzen';

export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db(DB_NAME);
}

