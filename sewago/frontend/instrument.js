// Instrumentation file for global polyfills - runs before any other code
// This is loaded automatically by Next.js

// Comprehensive global polyfill for server environments
if (typeof global !== 'undefined') {
  try {
    if (typeof global.self === 'undefined') global.self = global;
    if (typeof global.window === 'undefined') global.window = global;
    if (typeof global.document === 'undefined') global.document = {};
    if (typeof global.navigator === 'undefined') global.navigator = {};
    if (typeof global.location === 'undefined') global.location = {};
  } catch (error) {
    // Silently handle any assignment errors
  }
}

// Also handle globalThis specifically
if (typeof globalThis !== 'undefined') {
  try {
    if (typeof globalThis.self === 'undefined') globalThis.self = globalThis;
    if (typeof globalThis.window === 'undefined') globalThis.window = globalThis;
    if (typeof globalThis.document === 'undefined') globalThis.document = {};
    if (typeof globalThis.navigator === 'undefined') globalThis.navigator = {};
    if (typeof globalThis.location === 'undefined') globalThis.location = {};
  } catch (error) {
    // Silently handle any assignment errors
  }
}

// Create a mock document object with essential methods
if (typeof global !== 'undefined' && typeof global.document === 'object') {
  if (!global.document.querySelector) {
    global.document.querySelector = () => null;
  }
  if (!global.document.getElementById) {
    global.document.getElementById = () => null;
  }
  if (!global.document.createElement) {
    global.document.createElement = () => ({});
  }
  if (!global.document.head) {
    global.document.head = {};
  }
  if (!global.document.body) {
    global.document.body = {};
  }
}

console.log('Global polyfills loaded successfully');
