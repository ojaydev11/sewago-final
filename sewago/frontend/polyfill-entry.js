// Polyfill entry point - loaded before any other webpack entries
// This ensures globals are available during the entire build process

(function() {
  'use strict';
  
  // Get the global scope
  var globalScope;
  
  if (typeof globalThis !== 'undefined') {
    globalScope = globalThis;
  } else if (typeof global !== 'undefined') {
    globalScope = global;
  } else if (typeof window !== 'undefined') {
    globalScope = window;
  } else if (typeof self !== 'undefined') {
    globalScope = self;
  } else {
    globalScope = {};
  }
  
  // Set up essential globals
  try {
    if (!globalScope.self) globalScope.self = globalScope;
  } catch (e) {}
  
  try {
    if (!globalScope.window) globalScope.window = globalScope;
  } catch (e) {}
  
  try {
    if (!globalScope.document) globalScope.document = {};
  } catch (e) {}
  
  try {
    if (!globalScope.navigator) globalScope.navigator = {};
  } catch (e) {}
  
  try {
    if (!globalScope.location) globalScope.location = {};
  } catch (e) {}
  
  // Also ensure they exist on the global object specifically
  if (typeof global !== 'undefined' && global !== globalScope) {
    try {
      if (!global.self) global.self = global;
      if (!global.window) global.window = global;
      if (!global.document) global.document = {};
      if (!global.navigator) global.navigator = {};
      if (!global.location) global.location = {};
    } catch (e) {}
  }
  
  // Export for module compatibility
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = globalScope;
  }
  
  return globalScope;
})();

console.log('Polyfill entry loaded successfully');
