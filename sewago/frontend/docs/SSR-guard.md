# SSR DOM Guard Implementation

## Overview
This repository implements strict server/client boundaries to prevent DOM access during SSR, ensuring production builds complete successfully.

## What Changed

### 1. Server-Only Sentinels
- **app/layout.tsx** and **app/not-found.tsx**: Added `import 'server-only';`
- **All API routes**: Added `import 'server-only';` to prevent client imports

### 2. Client Module Conversion
- **src/lib/performance-optimizer.ts**: Converted to `'use client'` + `import 'client-only'`
- **src/components/ClientProviders.tsx**: Created as explicit client component

### 3. SSR DOM Guard
- **scripts/ssr-dom-guard.cjs**: Traps DOM globals on server, throws with clean stack
- **next.config.ts**: Injects guard into server entries, skips legacy pages/ runtime and Edge runtimes

### 4. Import Chain Tracer
- **DomUseTracerPlugin**: Webpack plugin that logs import chains for DOM usage in server bundle
- Helps identify which modules are pulling client code into server builds

### 5. AST Scanner
- **scripts/scan-dom-top-level.cjs**: Detects top-level DOM usage using TypeScript AST
- **npm run scan:ssr**: Script to run the scanner

### 6. ESLint Rules
- **no-restricted-globals**: Blocks DOM globals by default
- **Override**: Allows DOM in `**/*.client.*` and component directories

## How to Add New Client Code Safely

### For Components Using DOM/Browser APIs
```tsx
'use client';
import 'client-only';

import { useEffect } from 'react';

export default function MyComponent() {
  useEffect(() => {
    // DOM access here is safe
    const element = document.querySelector('#my-element');
  }, []);
  
  return <div>...</div>;
}
```

### For Utilities with DOM Dependencies
Split into server/client versions:

**utils.server.ts** (no DOM):
```ts
export function serverSafeFunction() {
  // No DOM access
  return 'server result';
}
```

**utils.client.ts** (DOM allowed):
```ts
'use client';
import 'client-only';

export function clientFunction() {
  return document.title;
}
```

### For Providers in app/layout.tsx
```tsx
// app/layout.tsx (server component)
import 'server-only';
import dynamic from 'next/dynamic';

const ClientProviders = dynamic(() => import('@/components/ClientProviders'), { 
  ssr: false 
});

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
```

## CI Integration
- **GitHub Action**: Runs `npm run build` and `npm run scan:ssr` on push/PR
- **Pre-commit**: Consider adding `npm run scan:ssr` to pre-commit hooks

## Commands
```bash
# Build with SSR guard
npm run build

# Scan for top-level DOM usage
npm run scan:ssr

# Check server-only sentinels
npm run check:sentinels

# All three must pass for CI
```

## Runtime Verification

### Diagnostic Routes
Two test routes verify the guard works correctly on different runtimes:

- **`/api/diag/node`** (Node.js runtime): Tests that DOM access throws from SSR guard
- **`/api/diag/edge`** (Edge runtime): Tests that guard is NOT injected (no DOM trap)

### Expected Behavior
- **Node.js**: `{ "runtime": "nodejs", "guardOk": true }` - DOM access blocked
- **Edge**: `{ "runtime": "edge", "edgeOk": true }` - No guard, DOM undefined

## Hardening Features

### Edge Runtime Compatibility
- **SSR DOM Guard**: Automatically disabled for Edge runtimes (`process.env.NEXT_RUNTIME?.includes('edge')`)
- **Build ID**: Removed static `'static-build'` to allow proper cache busting across deploys
- **Runtime Detection**: Guard and tracer only activate for Node.js server builds

### Enhanced Security
- **Server Bundle Deny-List**: Blocks common DOM-only libraries (`firebase/app`, `react-dom/client`, `three`, etc.)
- **Barrel Guardrail**: ESLint rule prevents server files from importing `*.client` modules
- **Pre-commit Hooks**: Automatic validation before commits

## Troubleshooting

### Build Fails with SSR DOM Guard Error
1. Check the stack trace for the offending file
2. Look for `[SSR DOM TRACE]` logs to see import chains
3. Convert the file to client or split server/client versions

### Scanner Finds Top-Level DOM
1. Move DOM access into functions/effects
2. Add `'use client'` and `import 'client-only'` if needed
3. Split into `.server.ts` and `.client.ts` if shared

### Import Chain Issues
- Check barrel exports (index.ts) for client modules
- Ensure server components don't import client utilities
- Use dynamic imports with `{ ssr: false }` for client-only code

## Adding browser code safely
- Put browser-only code in `*.client.tsx` (or inside `components/` as client components).
- Start the file with:
  ```ts
  'use client';
  import 'client-only';
  ```
- Never re-export client modules from server barrels. Use parallel index.client.ts / index.server.ts if needed.

## Dependencies Added
- **ts-morph**: TypeScript AST manipulation for scanner
- **glob**: File pattern matching for scanner

## Files Modified
- `next.config.ts`: SSR guard injection (gated from Edge runtimes), tracer plugin, removed pinned generateBuildId
- `eslint.config.mjs`: DOM globals restriction
- `package.json`: Added scan:ssr and check:sentinels scripts
- All API routes: Added server-only sentinel
- Core layout files: Added server-only sentinel
- Performance utilities: Converted to client modules
- Added pre-commit hooks with Husky
