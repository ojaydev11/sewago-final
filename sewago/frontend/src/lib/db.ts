// Lazy database connection utility
// This prevents database connections from running during build time

import mongoose from 'mongoose';

let conn: typeof mongoose | null = null;

export async function getDb() {
  // Don't connect during build phase
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    throw new Error('Database connections not allowed during build phase');
  }
  
  if (!conn) {
    try {
      const mongoUri = process.env.MONGODB_URI;
      if (!mongoUri) {
        throw new Error('MONGODB_URI environment variable is not set');
      }
      
      conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
      });
      
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }
  
  return conn;
}

export async function closeDb() {
  if (conn) {
    await mongoose.disconnect();
    conn = null;
    console.log('Disconnected from MongoDB');
  }
}

// Export connection status for health checks
export function getConnectionStatus() {
  return {
    connected: conn !== null,
    readyState: mongoose.connection.readyState,
  };
}
