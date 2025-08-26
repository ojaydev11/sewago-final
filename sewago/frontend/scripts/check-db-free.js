#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function checkFileForDBImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('mongoose') || line.includes('mongodb') || 
          line.includes('@prisma/client') || line.includes('prisma')) {
        // Skip commented lines
        if (!line.trim().startsWith('//') && !line.trim().startsWith('*')) {
          return `${filePath}:${i + 1}: ${line.trim()}`;
        }
      }
    }
    return null;
  } catch (error) {
    return null; // Skip files that can't be read
  }
}

function checkDirectory(dirPath, excludeDirs = ['node_modules', '.next']) {
  const results = [];
  
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      if (excludeDirs.includes(item)) continue;
      
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        results.push(...checkDirectory(fullPath, excludeDirs));
      } else if (item.endsWith('.ts') || item.endsWith('.tsx') || 
                 item.endsWith('.js') || item.endsWith('.jsx')) {
        const result = checkFileForDBImports(fullPath);
        if (result) {
          results.push(result);
        }
      }
    }
  } catch (error) {
    // Skip directories that can't be read
  }
  
  return results;
}

// Check src directory
const srcPath = path.join(__dirname, '..', 'src');
const dbImports = checkDirectory(srcPath);

if (dbImports.length > 0) {
  console.log('❌ DB import found:');
  dbImports.forEach(function(importItem) { console.log(importItem); });
  process.exit(1);
} else {
  console.log('✅ DB-free');
}
