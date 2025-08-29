// scripts/scan-dom-top-level.cjs
// Run: node scripts/scan-dom-top-level.cjs
const { Project, Node, SyntaxKind } = require('ts-morph');
const { globSync } = require('glob');
const path = require('path');
const fs = require('fs');

const roots = ['app', 'src', 'components', 'lib'];
const files = roots.flatMap(r =>
  globSync(`${r}/**/*.{ts,tsx,js,jsx}`, {
    ignore: [
      '**/node_modules/**',
      '**/*.d.ts',
      '**/__tests__/**',
      '**/*.test.*',
      '**/*.spec.*',
    ],
  })
);

const project = new Project({
  tsConfigFilePath: fs.existsSync('tsconfig.json') ? 'tsconfig.json' : undefined,
});
project.addSourceFilesAtPaths(files);

const DOM = new Set(['document', 'window', 'navigator', 'localStorage']);

// helpers
const isFunctionLike = (n) =>
  [
    SyntaxKind.FunctionDeclaration,
    SyntaxKind.FunctionExpression,
    SyntaxKind.ArrowFunction,
    SyntaxKind.MethodDeclaration,
    SyntaxKind.Constructor,
  ].includes(n.getKind());

const isClassLike = (n) =>
  n.getKind() === SyntaxKind.ClassDeclaration || n.getKind() === SyntaxKind.ClassExpression;

function isInterfaceOrTypePropertyName(id) {
  const p = id.getParent();
  if (!p) return false;
  const k = p.getKind();

  // interface Foo { window: string }
  if (k === SyntaxKind.PropertySignature) return true;

  // type T = { window: string }
  if (k === SyntaxKind.PropertyAssignment || k === SyntaxKind.ShorthandPropertyAssignment) {
    const objLit = p.getFirstAncestorByKind(SyntaxKind.ObjectLiteralExpression);
    const inType = !!p.getFirstAncestorByKind(SyntaxKind.TypeLiteral);
    return Boolean(objLit && inType) || inType;
  }

  // enum Window { window = 1 }
  if (k === SyntaxKind.EnumMember) return true;

  return false;
}

const offenders = [];
for (const sf of project.getSourceFiles()) {
  const filePath = sf.getFilePath();
  
  // skip test files
  if (filePath.includes('__tests__') || filePath.includes('.test.') || filePath.includes('.spec.')) {
    continue;
  }
  
  const text = sf.getFullText();

  // skip client files entirely
  const firstMeaningful = text.match(/^\s*('use client'|"use client");/);
  if (firstMeaningful) continue;

  let hit = false;
  sf.forEachDescendant((node) => {
    if (hit) return;

    if (Node.isIdentifier(node) && DOM.has(node.getText())) {
      // ignore import/type contexts and property names in types
      const parent = node.getParent();
      if (!parent) return;

      // import/type/ts-ignore contexts
      const isImportish =
        Node.isImportClause(parent) ||
        Node.isNamedImports(parent) ||
        Node.isImportSpecifier(parent);
      if (isImportish) return;

      const inType =
        !!node.getFirstAncestorByKind(SyntaxKind.TypeAliasDeclaration) ||
        !!node.getFirstAncestorByKind(SyntaxKind.InterfaceDeclaration) ||
        !!node.getFirstAncestorByKind(SyntaxKind.TypeLiteral);
      if (inType && isInterfaceOrTypePropertyName(node)) return;

      // top-level only (not inside functions/classes)
      const wrapped = node.getFirstAncestor((a) => isFunctionLike(a) || isClassLike(a));
      const topLevel = !wrapped;

      if (topLevel) {
        offenders.push({
          file: path.relative(process.cwd(), sf.getFilePath()),
          line: node.getStartLineNumber(),
          id: node.getText(),
        });
        hit = true;
      }
    }
  });
}

if (offenders.length) {
  console.log('--- TOP-LEVEL DOM OFFENDERS ---');
  for (const o of offenders) console.log(`${o.file}:${o.line}  -> ${o.id}`);
  process.exitCode = 1;
} else {
  console.log('No top-level DOM usage detected.');
}
