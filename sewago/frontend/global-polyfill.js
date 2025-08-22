// Global polyfill replacement for globalThis resolution issues
(function() {
  'use strict';
  
  // Create or get the global scope
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
  
  // Ensure essential globals exist
  if (!globalScope.self) {
    try { globalScope.self = globalScope; } catch (e) {}
  }
  if (!globalScope.window) {
    try { globalScope.window = globalScope; } catch (e) {}
  }
  if (!globalScope.document) {
    try { globalScope.document = {}; } catch (e) {}
  }
  if (!globalScope.navigator) {
    try { globalScope.navigator = {}; } catch (e) {}
  }
  if (!globalScope.location) {
    try { globalScope.location = {}; } catch (e) {}
  }
  
  // For Node.js environments specifically
  if (typeof global !== 'undefined' && global !== globalScope) {
    try { if (!global.self) global.self = global; } catch (e) {}
    try { if (!global.window) global.window = global; } catch (e) {}
    try { if (!global.document) global.document = {}; } catch (e) {}
    try { if (!global.navigator) global.navigator = {}; } catch (e) {}
    try { if (!global.location) global.location = {}; } catch (e) {}
  }
  
  return globalScope;
})();

// Export for module compatibility
module.exports = (function() {
  if (typeof globalThis !== 'undefined') return globalThis;
  if (typeof global !== 'undefined') return global;
  if (typeof window !== 'undefined') return window;
  return {};
})();

module.exports.default = module.exports;
