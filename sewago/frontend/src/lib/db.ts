import { PrismaClient } from '@prisma/client';

// Production database client
let db: PrismaClient;

try {
  if (process.env.DATABASE_URL) {
    db = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
    console.log('✅ Using Prisma database client with MongoDB Atlas');
  } else {
    throw new Error('DATABASE_URL environment variable is required for production');
  }
} catch (error) {
  console.error('❌ Failed to initialize Prisma database client:', error);
  throw error;
}

export { db };
