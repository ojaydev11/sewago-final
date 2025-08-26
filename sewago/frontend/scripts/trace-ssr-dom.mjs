import { build } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import pc from 'picocolors';

const ROOT = process.cwd();
const ENTRIES = [
  'src/app/layout.tsx',
  'src/app/not-found.tsx',
  'src/app/error.tsx',
  'src/app/global-error.tsx',
].map(p => path.resolve(ROOT, p));

const EXTERNAL = [/^next(\/|$)/, /^react(\/|$)/, /^node:/, /^@next\//, /^@vercel\//];

const LOADERS = {
  '.css': 'empty', '.scss': 'empty', '.sass': 'empty', '.less': 'empty',
  '.svg': 'empty', '.png': 'empty', '.jpg': 'empty', '.jpeg': 'empty',
  '.gif': 'empty', '.webp': 'empty', '.avif': 'empty', '.woff': 'empty',
  '.woff2': 'empty', '.ttf': 'empty',
};

const DOM_GLOBALS = new Set(['document', 'window', 'navigator', 'localStorage']);
const isCodeFile = p => /\.(ts|tsx|js|jsx)$/.test(p);

function pretty(p) { return path.relative(ROOT, p); }

async function bundle(entry) {
  const result = await build({
    entryPoints: [entry],
    bundle: true,
    platform: 'node',
    format: 'esm',
    metafile: true,
    write: false,
    logLevel: 'silent',
    external: EXTERNAL.map(r => r.source ?? r),
    loader: LOADERS,
    resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.mjs'],
    mainFields: ['module', 'main'],
    conditions: ['node'],
    treeShaking: false,
    ignoreAnnotations: true,
  });
  return result.metafile;
}

function inputFiles(meta) {
  return Object.keys(meta.inputs)
    .map(p => path.resolve(ROOT, p))
    .filter(p => fs.existsSync(p) && isCodeFile(p));
}

function topLevelDomUses(file) {
  const code = fs.readFileSync(file, 'utf8');
  if (!/\b(document|window|navigator|localStorage)\b/.test(code)) return [];
  const ast = parser.parse(code, { sourceType: 'module', plugins: ['typescript', 'jsx'] });

  const hits = [];
  const isInFn = (p) => p.getFunctionParent() || p.findParent(pp => pp.isClassMethod() || pp.isClassPrivateMethod());

  traverse.default(ast, {
    Identifier(p) {
      const name = p.node.name;
      if (!DOM_GLOBALS.has(name)) return;
      const parent = p.parentPath;
      if (parent?.isUnaryExpression() && parent.node.operator === 'typeof') return; // allow guards
      if (!isInFn(p)) {
        const { line, column } = p.node.loc.start;
        hits.push({ name, line, column });
      }
    },
  });
  return hits;
}

(async () => {
  let total = 0;
  for (const entry of ENTRIES) {
    if (!fs.existsSync(entry)) continue;
    const meta = await bundle(entry);
    const files = inputFiles(meta);

    const offenders = [];
    for (const f of files) {
      const hits = topLevelDomUses(f);
      if (hits.length) offenders.push({ f, hits });
    }

    if (offenders.length) {
      console.log(pc.bold(pc.yellow(`\n[SSR DOM] Entry: ${pretty(entry)}`)));
      for (const o of offenders) {
        console.log(pc.red(`  ${pretty(o.f)}`));
        o.hits.forEach(h => console.log(pc.dim(`    - ${h.name} @ ${h.line}:${h.column}`)));
      }
      total += offenders.length;
    } else {
      console.log(pc.green(`\n[SSR DOM] Entry: ${pretty(entry)} — clean`));
    }
  }
  if (total) {
    console.log(pc.bold(pc.red(`\nFound ${total} file(s) with module-scope DOM usage in the server graph.`)));
    process.exit(1);
  } else {
    console.log(pc.bold(pc.green(`\nAll clear.`)));
  }
})().catch(e => { console.error(e); process.exit(1); });
