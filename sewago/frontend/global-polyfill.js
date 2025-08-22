// Immediate global polyfill - runs before any other code
(function() {
  'use strict';
  
  // Get the global scope
  var globalScope = (function() {
    if (typeof globalThis !== 'undefined') return globalThis;
    if (typeof global !== 'undefined') return global;
    if (typeof window !== 'undefined') return window;
    if (typeof self !== 'undefined') return self;
    return this || {};
  })();
  
  // Add missing globals
  if (typeof globalScope.self === 'undefined') {
    globalScope.self = globalScope;
  }
  if (typeof globalScope.window === 'undefined') {
    globalScope.window = globalScope;
  }
  if (typeof globalScope.document === 'undefined') {
    globalScope.document = {};
  }
  if (typeof globalScope.navigator === 'undefined') {
    globalScope.navigator = {};
  }
  if (typeof globalScope.location === 'undefined') {
    globalScope.location = {};
  }
  
  // For Node.js environments, ensure globals are available
  if (typeof global !== 'undefined') {
    try {
      if (!global.self) global.self = global;
    } catch (e) {}
    try {
      if (!global.window) global.window = global;
    } catch (e) {}
    try {
      if (!global.document) global.document = {};
    } catch (e) {}
    try {
      if (!global.navigator) global.navigator = {};
    } catch (e) {}
    try {
      if (!global.location) global.location = {};
    } catch (e) {}
  }
})();
