'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook that debounces a value
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook that provides a debounced callback function
 * @param callback - The function to debounce
 * @param delay - The delay in milliseconds
 * @param deps - Dependencies array for the callback
 * @returns The debounced callback function
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T {
  const [debouncedCallback, setDebouncedCallback] = useState<T>();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCallback(() => callback);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [callback, delay, ...deps]);

  return debouncedCallback || callback;
}

/**
 * Custom hook for debouncing with immediate execution option
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds
 * @param immediate - Whether to execute immediately on first call
 * @returns Object with debounced value and immediate value
 */
export function useAdvancedDebounce<T>(
  value: T,
  delay: number,
  immediate: boolean = false
): {
  debouncedValue: T;
  immediateValue: T;
  isPending: boolean;
} {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const [isPending, setIsPending] = useState<boolean>(false);

  useEffect(() => {
    if (immediate && debouncedValue !== value) {
      setDebouncedValue(value);
      setIsPending(false);
      return;
    }

    setIsPending(true);
    
    const handler = setTimeout(() => {
      setDebouncedValue(value);
      setIsPending(false);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay, immediate]);

  return {
    debouncedValue,
    immediateValue: value,
    isPending
  };
}