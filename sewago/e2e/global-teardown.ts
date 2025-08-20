import { FullConfig } from '@playwright/test';
import mongoose from 'mongoose';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting E2E Test Teardown...');

  try {
    // Clean up database connections
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('💾 Disconnected from test database');
    }
    
    console.log('✅ E2E Teardown completed successfully');
  } catch (error) {
    console.error('❌ E2E Teardown failed:', error);
    // Don't throw here as it might prevent test results from being saved
  }
}

export default globalTeardown;