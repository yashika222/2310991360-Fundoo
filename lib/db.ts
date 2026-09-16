import mongoose from 'mongoose';
import { logger } from '@/lib/logger';

type Cache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: Cache | undefined;
}

const cache: Cache = global.mongooseCache || { conn: null, promise: null };
global.mongooseCache = cache;
// learn it
mongoose.set('bufferCommands', false);

export async function connectDB() {
  if (cache.conn && mongoose.connection.readyState === 1) {
    return cache.conn;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set');
  }

  if (!cache.promise) {
    logger.info('MongoDB connecting');
    cache.promise = Promise.race([
      mongoose.connect(uri, {
        dbName: process.env.MONGODB_DB || 'fundoonotes',
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
        socketTimeoutMS: 20000,
        maxPoolSize: 5,
        bufferCommands: false,
      }),
      new Promise<typeof mongoose>((_, reject) => {
        setTimeout(() => reject(new Error('MongoDB connection timed out after 8s')), 8000);
      }),
    ]);
  }

  try {
    cache.conn = await cache.promise;
    logger.info('MongoDB connected');
    return cache.conn;
  } catch (error) {
    cache.promise = null;
    cache.conn = null;
    throw error;
  }
}

export function dbStatus() {
  return mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
}
