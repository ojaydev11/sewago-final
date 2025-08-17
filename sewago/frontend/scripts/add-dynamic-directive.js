#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script to add 'export const dynamic = "force-dynamic";' to all page files
 * This prevents Next.js from trying to build static content during build time
 */

const appDir = path.join(__dirname, '..', 'src', 'app');

function addDynamicDirective(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Skip if already has dynamic directive
    if (content.includes('export const dynamic = "force-dynamic"')) {
      console.log(`✅ Already has dynamic directive: ${filePath}`);
      return;
    }
    
    // Skip if it's a client component (has 'use client')
    if (content.includes("'use client'")) {
      console.log(`⚠️  Skipping client component: ${filePath}`);
      return;
    }
    
    // Add dynamic directive after imports
    const importMatch = content.match(/(import.*?;?\s*\n)/s);
    if (importMatch) {
      const newContent = content.replace(
        importMatch[0],
        importMatch[0] + '\n// Force dynamic rendering to prevent build-time issues\nexport const dynamic = "force-dynamic";\n\n'
      );
      
      fs.writeFileSync(filePath, newContent);
      console.log(`✅ Added dynamic directive: ${filePath}`);
    } else {
      console.log(`⚠️  No imports found, skipping: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

function processDirectory(dir) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
      // Only process page files
      if (item === 'page.tsx' || item === 'page.ts' || item === 'layout.tsx' || item === 'layout.ts') {
        addDynamicDirective(fullPath);
      }
    }
  }
}

console.log('🚀 Adding dynamic directive to all page files...\n');
processDirectory(appDir);
console.log('\n✨ Done! All page files now have the dynamic directive.');
