import mongoose from "mongoose";
import { env } from "../config/env.js";

export async function connectToDatabase(): Promise<void> {
  mongoose.set("strictQuery", true);
  try {
    await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 3000 });
  } catch (err) {
    if (env.nodeEnv === "test") {
      const { MongoMemoryServer } = await import("mongodb-memory-server");
      const mem = await MongoMemoryServer.create();
      const uri = mem.getUri("sewago_e2e");
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
      // Expose for teardown if desired
      (globalThis as any).__MMS__ = mem;
    } else {
      throw err;
    }
  }
}


