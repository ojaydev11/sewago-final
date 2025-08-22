// Instrumentation file for global polyfills - runs before any other code
// This is loaded automatically by Next.js

// Comprehensive global polyfill for server environments
if (typeof global !== 'undefined' && typeof self === 'undefined') {
  try {
    global.self = global;
    global.window = global;
    global.document = global.document || {};
    global.navigator = global.navigator || {};
    global.location = global.location || {};
  } catch (error) {
    // Silently handle any assignment errors
  }
}

// Also handle globalThis specifically
if (typeof globalThis !== 'undefined' && typeof globalThis.self === 'undefined') {
  try {
    globalThis.self = globalThis;
    globalThis.window = globalThis.window || globalThis;
    globalThis.document = globalThis.document || {};
    globalThis.navigator = globalThis.navigator || {};
    globalThis.location = globalThis.location || {};
  } catch (error) {
    // Silently handle any assignment errors
  }
}

console.log('Global polyfills loaded successfully');
