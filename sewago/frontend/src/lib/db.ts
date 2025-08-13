import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

// Skip database connection during build time or when no URI is provided
if (!MONGODB_URI) {
  // During build time, this is expected and not an error
  if (process.env.NODE_ENV === 'production' && process.env.VERCEL) {
    // We're in Vercel build environment, skip connection
    console.warn('Build time detected, skipping MongoDB connection');
  } else {
    // Local development without URI
    console.warn('MONGODB_URI not set, skipping database connection');
  }
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  // Skip connection if no URI is available
  if (!MONGODB_URI) {
    return null;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export { dbConnect as connectToDB };
export default dbConnect;
