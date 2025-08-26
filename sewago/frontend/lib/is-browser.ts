// Safe browser environment detection
export const isBrowser = () => {
  try {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
  } catch {
    return false;
  }
};

export const isClient = () => {
  try {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
  } catch {
    return false;
  }
};

// Safe DOM access helpers
export const safeWindow = () => {
  try {
    return typeof window !== 'undefined' ? window : null;
  } catch {
    return null;
  }
};

export const safeDocument = () => {
  try {
    return typeof document !== 'undefined' ? document : null;
  } catch {
    return null;
  }
};

export const safeLocalStorage = () => {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
};
