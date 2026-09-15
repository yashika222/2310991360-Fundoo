import mongoose from 'mongoose';
import { logger } from '@/lib/logger';

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

mongoose.set('bufferCommands', false);

const cached: MongooseCache =
  global.mongooseCache ?? {
    conn: null,
    promise: null,
  };

global.mongooseCache = cached;

const CONNECT_OPTIONS: mongoose.ConnectOptions = {
  dbName: process.env.MONGODB_DB || 'fundoonotes',
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 5000,
  socketTimeoutMS: 15000,
  maxPoolSize: 5,
  bufferCommands: false,
};

export async function connectDB(): Promise<typeof mongoose> {
  if (
    cached.conn &&
    mongoose.connection.readyState === 1
  ) {
    return cached.conn;
  }

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not set');
  }

  if (!cached.promise) {
    logger.info('MongoDB connection starting');

    cached.promise = mongoose.connect(
      uri,
      CONNECT_OPTIONS
    );
  }

  try {
    cached.conn = await cached.promise;

    logger.info('MongoDB connected');

    return cached.conn;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;

    const message =
      error instanceof Error
        ? error.message
        : 'Unknown error';

    logger.error(
      `MongoDB connection failed: ${message}`
    );

    throw error;
  }
}

export function getDbState():
  | 'connected'
  | 'connecting'
  | 'disconnected' {
  switch (mongoose.connection.readyState) {
    case 1:
      return 'connected';

    case 2:
      return 'connecting';

    default:
      return 'disconnected';
  }
}