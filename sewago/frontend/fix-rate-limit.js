const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'middleware-rate-limit.ts');
const content = fs.readFileSync(filePath, 'utf8');

// Fix the second rateLimit call
const fixedContent = content.replace(
  /const result = await rateLimit\(identifier, adjustedLimit, adjustedWindow\);/g,
  'const result = await rateLimit(req as unknown as Request, { limit: adjustedLimit, windowSec: Math.floor(adjustedWindow / 1000) });'
);

fs.writeFileSync(filePath, fixedContent);
console.log('Fixed rateLimit function call in middleware-rate-limit.ts');
