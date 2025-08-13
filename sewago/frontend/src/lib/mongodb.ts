import mongoose from 'mongoose';

declare global {
  var mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

if (!global.mongoose) {
  global.mongoose = {
    conn: null,
    promise: null,
  };
}

export async function dbConnect(): Promise<typeof mongoose | null> {
  // Skip database connection during build time if no URI is provided
  if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
    console.warn('Build time detected without MONGODB_URI, skipping database connection');
    return null;
  }
  
  if (!process.env.MONGODB_URI) {
    console.warn('MONGODB_URI not set, skipping database connection');
    return null;
  }

  if (global.mongoose.conn) {
    return global.mongoose.conn;
  }

  if (!global.mongoose.promise) {
    const opts = {
      bufferCommands: false,
    };

    global.mongoose.promise = mongoose.connect(process.env.MONGODB_URI, opts);
  }

  try {
    global.mongoose.conn = await global.mongoose.promise;
  } catch (e) {
    global.mongoose.promise = null;
    throw e;
  }

  return global.mongoose.conn;
}

export function getMongoClient() {
  if (!process.env.MONGODB_URI) {
    return null;
  }
  return mongoose.connection.getClient();
}
