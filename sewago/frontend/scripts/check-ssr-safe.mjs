import { readdirSync, readFileSync, statSync } from 'fs';
import { join, extname } from 'path';

const ROOT = join(process.cwd(), 'src');
const BAD = /\b(document|window|localStorage|sessionStorage|matchMedia|ResizeObserver)\b/;
const SSR_SAFE_PATTERNS = [
  /typeof\s+(window|document)\s*!==\s*['"]undefined['"]/, // typeof window !== 'undefined'
  /typeof\s+(window|document)\s*===\s*['"]undefined['"]/,  // typeof window === 'undefined'
  /typeof\s+(window|document)\s*!==\s*undefined/,          // typeof window !== undefined
  /typeof\s+(window|document)\s*===\s*undefined/,          // typeof window === undefined
];
const results = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p);
    else if (st.isFile() && ['.ts', '.tsx'].includes(extname(p))) {
      const s = readFileSync(p, 'utf8');
      
      // Remove comments to avoid false positives
      const lines = s.split('\n');
      const codeLines = lines.filter(line => {
        const trimmed = line.trim();
        return !trimmed.startsWith('//') && !trimmed.startsWith('*') && !trimmed.startsWith('/*');
      }).join('\n');
      
      const hasDom = BAD.test(codeLines);
      const isClient = /^\s*['"]use client['"]\s*;?/m.test(s);
      // allow pages that explicitly disable SSR
      const hasSSRFalse = /dynamic\([\s\S]*?{[\s\S]*?ssr:\s*false[\s\S]*?}\)/m.test(s);
      
      if (hasDom && !isClient && !hasSSRFalse) {
        // Check if the DOM usage is wrapped in SSR-safe patterns
        const hasSSRSafePattern = SSR_SAFE_PATTERNS.some(pattern => pattern.test(codeLines));
        
        if (!hasSSRSafePattern) {
          // Double-check by looking at actual usage patterns
          const domUsage = codeLines.match(BAD);
          if (domUsage) {
            results.push(`${p} (${domUsage[0]})`);
          }
        }
      }
    }
  }
}
walk(ROOT);

if (results.length) {
  console.error('❌ DOM usage found in server files (missing "use client" or ssr:false):');
  for (const r of results) console.error(' -', r);
  process.exit(1);
} else {
  console.log('✅ No server-side DOM usage detected.');
}
