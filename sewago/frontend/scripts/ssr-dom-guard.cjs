/* scripts/ssr-dom-guard.cjs
 * Injected into every SERVER entry during build only.
 * It throws with a readable stack whenever server code touches DOM at module scope.
 */
(function () {
  const isNode = typeof window === 'undefined' && typeof process !== 'undefined';
  const phase = process.env.NEXT_PHASE || '';
  const isBuild = phase.includes('production-build') || process.env.NODE_ENV === 'production';
  if (!isNode || !isBuild) return;

  function boom(objName, prop) {
    const e = new Error(`[SSR DOM GUARD] ${objName}.${String(prop)} accessed during SSR`);
    if (e.stack) {
      e.stack = e.stack
        .split('\n')
        .filter(l => !l.includes('ssr-dom-guard') && !l.includes('node:internal'))
        .join('\n');
    }
    throw e;
  }
  const trap = (objName) => new Proxy({}, {
    get(_t, prop) {
      if (prop === 'toString' || prop === Symbol.toStringTag) return () => objName;
      if (prop === 'prototype' || prop === 'constructor') return undefined;
      boom(objName, prop);
    },
    apply() { boom(objName, '(call)'); }
  });

  if (typeof global.window === 'undefined') global.window = trap('window');
  if (typeof global.document === 'undefined') global.document = trap('document');
  if (typeof global.navigator === 'undefined') global.navigator = trap('navigator');
  if (typeof global.localStorage === 'undefined') global.localStorage = trap('localStorage');
})();
