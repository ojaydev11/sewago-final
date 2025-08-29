'use client';
import 'client-only';

/**
 * Safe DOM utilities that check for browser environment
 */
export const isBrowser = () => typeof window !== 'undefined' && typeof document !== 'undefined';

export const q = <T extends Element = Element>(sel: string) =>
  isBrowser() ? (document.querySelector(sel) as T | null) : null;

export const on = (el: any, ev: string, fn: any) => {
  if (!isBrowser() || !el) return;
  el.addEventListener(ev, fn);
  return () => el.removeEventListener(ev, fn);
};
