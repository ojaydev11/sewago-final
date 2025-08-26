import { useState, useEffect } from 'react';

export function useClientOnly() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}

export function useSafeLocalStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const item = localStorage.getItem(key);
      if (item !== null) {
        setValue(JSON.parse(item));
      }
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
    }
  }, [key]);

  const setStoredValue = (newValue: T) => {
    setValue(newValue);
    if (isClient) {
      try {
        localStorage.setItem(key, JSON.stringify(newValue));
      } catch (error) {
        console.error('Failed to write to localStorage:', error);
      }
    }
  };

  return [value, setStoredValue] as const;
}

export function safeDownloadFile(data: string, filename: string, mimeType: string = 'text/csv') {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    console.warn('Download attempted on server side');
    return;
  }

  try {
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download failed:', error);
  }
}
