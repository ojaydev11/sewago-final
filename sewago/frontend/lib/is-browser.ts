// Safe browser environment detection utilities
// These functions safely check for browser APIs without causing SSR issues

/**
 * Check if code is running in a browser environment
 * Safe for SSR - returns false on server, true in browser
 */
export const isBrowser = (): boolean => {
  try {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
  } catch {
    return false;
  }
};

/**
 * Check if code is running on the client side
 * Safe for SSR - returns false on server, true in browser
 */
export const isClient = (): boolean => {
  try {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
  } catch {
    return false;
  }
};

/**
 * Get a safe reference to the window object
 * Returns null on server, window object in browser
 */
export const safeWindow = (): Window | null => {
  try {
    return typeof window !== 'undefined' ? window : null;
  } catch {
    return null;
  }
};

/**
 * Get a safe reference to the document object
 * Returns null on server, document object in browser
 */
export const safeDocument = (): Document | null => {
  try {
    return typeof document !== 'undefined' ? document : null;
  } catch {
    return null;
  }
};

/**
 * Get a safe reference to localStorage
 * Returns null on server, localStorage object in browser
 */
export const safeLocalStorage = (): Storage | null => {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
};

/**
 * Check if a specific browser API is available
 * Safe for SSR - returns false if API is not available
 */
export const hasAPI = (apiName: string): boolean => {
  try {
    if (typeof window === 'undefined') return false;
    return apiName in window;
  } catch {
    return false;
  }
};

/**
 * Execute a function only in browser environment
 * Safe for SSR - function is not called on server
 */
export const browserOnly = <T>(fn: () => T): T | undefined => {
  if (isBrowser()) {
    try {
      return fn();
    } catch {
      return undefined;
    }
  }
  return undefined;
};
