// Global polyfill registration
// This runs before any other modules are loaded

if (typeof global !== 'undefined') {
  // Polyfill for Node.js environment
  if (!global.self) global.self = global;
  if (!global.window) global.window = global;
  if (!global.document) global.document = {};
  if (!global.navigator) global.navigator = {};
  if (!global.location) global.location = {};
  
  // Also set on globalThis if available
  if (typeof globalThis !== 'undefined') {
    if (!globalThis.self) globalThis.self = globalThis;
    if (!globalThis.window) globalThis.window = globalThis;
    if (!globalThis.document) globalThis.document = {};
    if (!globalThis.navigator) globalThis.navigator = {};
    if (!globalThis.location) globalThis.location = {};
  }
}

module.exports = {};
