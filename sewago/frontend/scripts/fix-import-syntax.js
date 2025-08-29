#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script to fix import syntax errors caused by incorrectly placed dynamic directives
 * This moves the dynamic directive to the correct location after imports
 */

const appDir = path.join(__dirname, '..', 'src', 'app');

function fixImportSyntax(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check if there's a dynamic directive inside import statements
<<<<<<< HEAD
    if (content.includes('import {\n\n// Force dynamic rendering') || 
        content.includes('import {\n  // Force dynamic rendering')) {
=======
    if (content.includes('import {\n  // Force dynamic rendering') || 
        content.includes('import {\n\n// Force dynamic rendering')) {
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
      console.log(`🔧 Fixing import syntax in: ${filePath}`);
      
      // Remove the dynamic directive from inside imports
      let newContent = content.replace(
        /import \{\s*\n\s*\/\/ Force dynamic rendering to prevent build-time issues\s*\nexport const dynamic = ['"]force-dynamic['"];?\s*\n\s*/g,
        'import {\n  '
      );
      
      // Also fix cases where there might be extra newlines
      newContent = newContent.replace(
        /import \{\s*\n\s*\/\/ Force dynamic rendering to prevent build-time issues\s*\nexport const dynamic = ['"]force-dynamic['"];?\s*\n\s*\n\s*/g,
        'import {\n  '
      );
      
      // Add the dynamic directive after all imports
      const importEndIndex = newContent.lastIndexOf('}');
      if (importEndIndex !== -1) {
        const beforeImports = newContent.substring(0, importEndIndex + 1);
        const afterImports = newContent.substring(importEndIndex + 1);
        
        newContent = beforeImports + '\n\n// Force dynamic rendering to prevent build-time issues\nexport const dynamic = "force-dynamic";' + afterImports;
      }
      
      fs.writeFileSync(filePath, newContent);
      console.log(`✅ Fixed import syntax: ${filePath}`);
    } else {
      console.log(`✅ No import syntax issues found: ${filePath}`);
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
      fixImportSyntax(fullPath);
    }
  }
}

console.log('🔧 Fixing import syntax errors in all files...\n');
processDirectory(appDir);
console.log('\n✨ Done! All import syntax errors have been fixed.');
