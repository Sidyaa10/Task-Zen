import { ObjectId } from 'mongodb';
import { getDb } from '@/server/db/mongo';

export type UserDocument = {
  _id: ObjectId;
  name: string;
  email: string;
  hashedPassword: string;
  profilePicture: string | null;
  createdAt: string;
};

const USERS_COLLECTION = 'users';
let indexesReady = false;

export async function ensureUserIndexes(): Promise<void> {
  if (indexesReady) return;
  const db = await getDb();
  await db.collection<UserDocument>(USERS_COLLECTION).createIndex({ email: 1 }, { unique: true, name: 'users_email_unique' });
  indexesReady = true;
}

export async function findUserByEmail(email: string): Promise<UserDocument | null> {
  const db = await getDb();
  return db.collection<UserDocument>(USERS_COLLECTION).findOne({ email: email.toLowerCase().trim() });
}

export async function findUserById(userId: string): Promise<UserDocument | null> {
  if (!ObjectId.isValid(userId)) return null;
  const db = await getDb();
  return db.collection<UserDocument>(USERS_COLLECTION).findOne({ _id: new ObjectId(userId) });
}

export async function createUser(input: {
  name: string;
  email: string;
  hashedPassword: string;
  profilePicture?: string | null;
}) {
  const db = await getDb();
  const now = new Date().toISOString();
  const doc = {
    name: input.name.trim(),
    email: input.email.toLowerCase().trim(),
    hashedPassword: input.hashedPassword,
    profilePicture: input.profilePicture ?? null,
    createdAt: now,
  };
  const result = await db.collection(USERS_COLLECTION).insertOne(doc);
  return { _id: result.insertedId.toString(), ...doc };
}

