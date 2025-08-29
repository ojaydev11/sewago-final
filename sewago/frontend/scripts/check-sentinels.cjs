// scripts/check-sentinels.cjs
// Ensures server-only sentinel exists where required
const { globSync } = require('glob');
const fs = require('fs');

const mustHave = [
  'app/layout.tsx',
  'app/not-found.tsx',
  ...globSync('app/**/route.{ts,tsx}', { ignore: ['**/node_modules/**'] })
];

let bad = [];
for (const file of mustHave) {
  if (!fs.existsSync(file)) continue;
  const src = fs.readFileSync(file, 'utf8');
  // allow BOM/whitespace, but sentinel must be in the first 5 non-empty lines
  const lines = src.split(/\r?\n/).filter(l => l.trim().length > 0).slice(0, 5).join('\n');
  if (!/import\s+['"]server-only['"]/.test(lines)) {
    bad.push(file);
  }
}

if (bad.length) {
  console.error('[sentinel] Missing `import "server-only";` in:\n - ' + bad.join('\n - '));
  process.exit(1);
} else {
  console.log('[sentinel] OK');
}
