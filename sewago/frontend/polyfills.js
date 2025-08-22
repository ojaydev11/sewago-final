// Global polyfills for server-side rendering
// This file prevents 'self is not defined' errors during Next.js build

const createGlobalScope = () => {
  const scope = typeof globalThis !== 'undefined' ? globalThis : 
                typeof global !== 'undefined' ? global : 
                typeof window !== 'undefined' ? window : {};
  
  // Add missing globals
  if (!scope.self) scope.self = scope;
  if (!scope.window) scope.window = scope;
  if (!scope.document) scope.document = {};
  if (!scope.navigator) scope.navigator = {};
  if (!scope.location) scope.location = {};
  
  return scope;
};

const globalScope = createGlobalScope();

// Export for module resolution
module.exports = globalScope;
module.exports.default = globalScope;

// Also set on global for immediate use
if (typeof global !== 'undefined') {
  global.self = global;
  global.window = global;
  global.document = global.document || {};
  global.navigator = global.navigator || {};
  global.location = global.location || {};
}
