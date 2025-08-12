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
    await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 3000 });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to connect to MongoDB", error);
    throw error;
  }
}


