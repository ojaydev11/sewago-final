import { chromium, FullConfig } from '@playwright/test';
import { seedTestData } from '../scripts/seed.test.js';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting E2E Test Setup...');

  try {
    // Wait for servers to be ready
    console.log('⏳ Waiting for test servers to start...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Seed test data
    console.log('🌱 Seeding test database...');
    await seedTestData();
    
    console.log('✅ E2E Setup completed successfully');
  } catch (error) {
    console.error('❌ E2E Setup failed:', error);
    throw error;
  }
}

export default globalSetup;