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
if (typeof global !== 'undefined') {
  if (!global.document) {
    global.document = {};
  }
  
  // Mock all essential document methods
  global.document.querySelector = global.document.querySelector || (() => null);
  global.document.getElementById = global.document.getElementById || (() => null);
  global.document.createElement = global.document.createElement || (() => ({}));
  global.document.head = global.document.head || {};
  global.document.body = global.document.body || {};
  global.document.title = global.document.title || '';
  global.document.cookie = global.document.cookie || '';
  global.document.readyState = global.document.readyState || 'complete';
  global.document.hidden = global.document.hidden || false;
  global.document.documentElement = global.document.documentElement || {};
  
  // Mock document methods that might be called
  global.document.addEventListener = global.document.addEventListener || (() => {});
  global.document.removeEventListener = global.document.removeEventListener || (() => {});
  global.document.contains = global.document.contains || (() => false);
  
  // Mock documentElement properties
  global.document.documentElement.scrollTop = global.document.documentElement.scrollTop || 0;
  global.document.documentElement.scrollHeight = global.document.documentElement.scrollHeight || 1000;
  
  // Mock body methods
  global.document.body.appendChild = global.document.body.appendChild || (() => {});
  global.document.body.removeChild = global.document.body.removeChild || (() => {});
  global.document.body.classList = global.document.body.classList || {
    add: () => {},
    remove: () => {}
  };
  
  // Mock head methods
  global.document.head.appendChild = global.document.head.appendChild || (() => {});
  global.document.head.removeChild = global.document.head.removeChild || (() => {});
  global.document.head.contains = global.document.head.contains || (() => false);
}

console.log('Global polyfills loaded successfully');
