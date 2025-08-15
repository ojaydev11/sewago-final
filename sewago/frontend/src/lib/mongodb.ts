import mongoose from 'mongoose';

declare global {
  var mongooseConnection: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  } | undefined;
}

export async function dbConnect(): Promise<typeof mongoose | null> {
  // Skip database connection during build time or when no URI is provided
  if (!process.env.MONGODB_URI) {
    // During build time, this is expected and not an error
    if (process.env.NODE_ENV === 'production' && process.env.VERCEL) {
      // We're in Vercel build environment, skip connection
      return null;
    }
    
    // Local development without URI
    console.warn('MONGODB_URI not set, skipping database connection');
    return null;
  }

  if (!global.mongooseConnection) {
    global.mongooseConnection = {
      conn: null,
      promise: null,
    };
  }

  if (global.mongooseConnection.conn) {
    return global.mongooseConnection.conn;
  }

  if (!global.mongooseConnection.promise) {
    const opts = {
      bufferCommands: false,
    };

    global.mongooseConnection.promise = mongoose.connect(process.env.MONGODB_URI, opts);
  }

  try {
    global.mongooseConnection.conn = await global.mongooseConnection.promise;
  } catch (e) {
    global.mongooseConnection.promise = null;
    throw e;
  }

  return global.mongooseConnection.conn;
}

export function getMongoClient() {
  if (!process.env.MONGODB_URI) {
    return null;
  }
  return mongoose.connection.getClient();
}

// Alias for backward compatibility
export const connectToDatabase = dbConnect;
