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
    await mongoose.connect(env.mongoUri, { 
      serverSelectionTimeoutMS: 10000,
      retryWrites: true,
      retryReads: true,
      maxPoolSize: 10,
      bufferCommands: false
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    console.error("MongoDB URI (masked):", env.mongoUri.replace(/\/\/.*@/, "//***:***@"));
    console.error("Please check:");
    console.error("1. MongoDB Atlas IP whitelist includes Railway IPs");
    console.error("2. Database credentials are correct");
    console.error("3. Network access is properly configured");
    throw error;
  }
}


