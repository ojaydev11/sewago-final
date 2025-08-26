export const isBrowser = () => {
  return typeof window !== 'undefined';
};

export const isClient = () => {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
};
