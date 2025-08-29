#!/usr/bin/env node

// Custom build script to handle 'self is not defined' errors
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Set global polyfills before any other code runs
global.self = global;
global.window = global;
global.document = {};
global.navigator = {};
global.location = {};

console.log('🚀 Starting Next.js build with polyfills...');

try {
  // Run the actual Next.js build
  execSync('npx next build', { 
    stdio: 'inherit',
    env: { 
      ...process.env,
      NODE_ENV: 'production',
      SKIP_PREFLIGHT_CHECK: 'true'
    }
  });
  
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
