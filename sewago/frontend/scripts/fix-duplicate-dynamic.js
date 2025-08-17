#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script to remove duplicate dynamic directives from all files
 * This fixes the compilation error caused by duplicate declarations
 */

const appDir = path.join(__dirname, '..', 'src', 'app');

function fixDuplicateDynamic(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Count how many dynamic directives exist
    const dynamicMatches = content.match(/export const dynamic = ['"]force-dynamic['"];?/g);
    
    if (dynamicMatches && dynamicMatches.length > 1) {
      console.log(`🔧 Fixing duplicate dynamic directives in: ${filePath}`);
      
      // Keep only the first occurrence, remove all others
      let newContent = content;
      let firstFound = false;
      
      newContent = newContent.replace(/export const dynamic = ['"]force-dynamic['"];?/g, (match) => {
        if (!firstFound) {
          firstFound = true;
          return match;
        } else {
          return '';
        }
      });
      
      // Clean up extra newlines that might be left
      newContent = newContent.replace(/\n\s*\n\s*\n/g, '\n\n');
      
      fs.writeFileSync(filePath, newContent);
      console.log(`✅ Fixed duplicate dynamic directives: ${filePath}`);
    } else {
      console.log(`✅ No duplicates found: ${filePath}`);
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
      fixDuplicateDynamic(fullPath);
    }
  }
}

console.log('🔧 Fixing duplicate dynamic directives in all files...\n');
processDirectory(appDir);
console.log('\n✨ Done! All duplicate dynamic directives have been removed.');
