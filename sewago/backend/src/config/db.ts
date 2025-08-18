import mongoose from "mongoose";
import { env } from "../config/env.js";

export async function connectToDatabase(): Promise<void> {
  mongoose.set("strictQuery", true);

  const shouldUseMemory = env.nodeEnv === "test" || !process.env.MONGODB_URI;

  if (shouldUseMemory) {
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    const mem = await MongoMemoryServer.create();
    const uri = mem.getUri("sewago_e2e");
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    (globalThis as any).__MMS__ = mem;
    // eslint-disable-next-line no-console
    console.log("MongoMemoryServer connected");
    return;
  }

  try {
    // Production-optimized MongoDB connection settings for high traffic
    await mongoose.connect(env.mongoUri, {
      // Connection timeout and server selection
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      
      // Connection pooling for high traffic
      maxPoolSize: 50, // Maximum number of connections
      minPoolSize: 5,  // Minimum number of connections
      maxIdleTimeMS: 30000, // Close connections after 30s of inactivity
      
      // Buffering and write concerns for production
      bufferMaxEntries: 0, // Disable mongoose buffering
      retryWrites: true,
      retryReads: true,
      
      // Monitoring and heartbeat
      heartbeatFrequencyMS: 10000,
      serverSelectionRetryDelayMS: 2000,
      
      // Additional production settings
      compressors: ['zlib'], // Enable compression
      zlibCompressionLevel: 6,
    });
    
    // Connection event handlers for monitoring
    mongoose.connection.on('connected', () => {
      console.log('✓ MongoDB connected successfully');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('✗ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠ MongoDB disconnected');
    });
    
    // Graceful shutdown handler
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
    throw error;
  }
}


