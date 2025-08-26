#!/usr/bin/env node

/**
 * Simple script to clean up some common unused imports
 * This is a temporary solution to reduce ESLint warnings during build
 */

const fs = require('fs');
const path = require('path');

// Common unused imports to remove
const unusedImports = [
  'useRouter',
  'useState',
  'useEffect',
  'useCallback',
  'useMemo',
  'useRef',
  'useSession',
  'signIn',
  'getServerSession',
  'authOptions',
  'router',
  'error',
  'Button',
  'Card',
  'CardContent',
  'CardDescription',
  'CardHeader',
  'CardTitle',
  'Input',
  'Label',
  'Textarea',
  'Select',
  'SelectContent',
  'SelectItem',
  'SelectTrigger',
  'SelectValue',
  'Badge',
  'Progress',
  'Separator',
  'Tabs',
  'TabsContent',
  'TabsList',
  'TabsTrigger',
  'CheckCircleIcon',
  'Clock',
  'MapPin',
  'Mail',
  'AlertCircle',
  'CheckCircle',
  'XCircle',
  'format',
  'toast',
  'Star',
  'Shield',
  'Users',
  'Globe',
  'MessageSquare',
  'Zap',
  'Target',
  'TrendingUp',
  'Bookmark',
  'CreditCard',
  'Award',
  'ChevronRight',
  'Filter',
  'Calendar',
  'Eye',
  'FileCheck',
  'Briefcase',
  'Phone',
  'User',
  'Plus',
  'X',
  'AcademicCapIcon',
  'BellSlashIcon',
  'AlertTriangle',
  'SkipForward',
  'Volume2',
  'VolumeX',
  'Play',
  'Pause',
  'Settings',
  'Navigation',
  'Layers',
  'Route',
  'Camera',
  'MessageCircle',
  'Heart',
  'ShoppingCart',
  'Percent',
  'Sparkles',
  'Gift',
  'Crown',
  'TrendingDown',
  'ExclamationCircleIcon',
  'Loader2',
  'QuestionMarkCircleIcon',
  'ChatBubbleLeftRightIcon',
  'DocumentTextIcon',
  'IndianRupee',
  'Tag'
];

function cleanFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Remove unused imports
    unusedImports.forEach(importName => {
      const importRegex = new RegExp(`\\b${importName}\\b`, 'g');
      if (importRegex.test(content)) {
        // Check if it's actually used in the file
        const usageRegex = new RegExp(`\\b${importName}\\b(?!\\s*[,}])`, 'g');
        const matches = content.match(usageRegex);
        if (matches && matches.length <= 1) {
          // Only one occurrence, likely unused import
          content = content.replace(importRegex, '');
          modified = true;
        }
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`Cleaned: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      walkDir(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      cleanFile(filePath);
    }
  });
}

// Start cleaning from src directory
const srcDir = path.join(__dirname, '..', 'src');
if (fs.existsSync(srcDir)) {
  console.log('Cleaning unused imports...');
  walkDir(srcDir);
  console.log('Cleanup complete!');
} else {
  console.log('src directory not found');
}
