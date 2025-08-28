'use client';
import 'client-only';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface NavigatorConnection {
  connection: {
    effectiveType?: string;
  };
}

interface LiteModeContextType {
  isLiteMode: boolean;
  setLiteMode: (enabled: boolean) => void;
  toggleLiteMode: () => void;
  connectionSpeed: 'fast' | 'slow' | 'unknown';
}

const LiteModeContext = createContext<LiteModeContextType | undefined>(undefined);

export function useLiteMode() {
  const context = useContext(LiteModeContext);
  if (context === undefined) {
    throw new Error('useLiteMode must be used within a LiteModeProvider');
  }
  return context;
}

interface LiteModeProviderProps {
  children: React.ReactNode;
}

export function LiteModeProvider({ children }: LiteModeProviderProps) {
  const [isLiteMode, setIsLiteMode] = useState(false);
  const [connectionSpeed, setConnectionSpeed] = useState<'fast' | 'slow' | 'unknown'>('unknown');

  const setLiteMode = useCallback((enabled: boolean) => {
    setIsLiteMode(enabled);
    localStorage.setItem('sewago-lite-mode', JSON.stringify(enabled));
  }, []);

  const suggestLiteMode = useCallback(() => {
    // Only suggest if user hasn't explicitly set a preference
    const savedLiteMode = localStorage.getItem('sewago-lite-mode');
    if (savedLiteMode === null && !isLiteMode) {
      // Show a subtle notification suggesting lite mode
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          const shouldEnable = window.confirm(
            'We detected a slower internet connection. Enable Lite Mode for better performance?'
          );
          if (shouldEnable) {
            setLiteMode(true);
          }
        }, 2000);
      }
    }
  }, [isLiteMode, setLiteMode]);

  const detectConnectionSpeed = useCallback(async () => {
    try {
      // Check Network Information API (if available)
      if ('connection' in navigator) {
        const connection = (navigator as unknown as NavigatorConnection).connection;
        const effectiveType = connection?.effectiveType;
        
        if (effectiveType === '2g' || effectiveType === 'slow-2g') {
          setConnectionSpeed('slow');
          // Auto-enable lite mode for very slow connections
          if (!isLiteMode) {
            setLiteMode(true);
          }
        } else if (effectiveType === '3g') {
          setConnectionSpeed('slow');
        } else {
          setConnectionSpeed('fast');
        }
        return;
      }

      // Fallback: Use a simple speed test
      const startTime = Date.now();
      const testImage = new Image();
      
      testImage.onload = () => {
        const loadTime = Date.now() - startTime;
        // If it takes more than 3 seconds to load a small image, consider it slow
        if (loadTime > 3000) {
          setConnectionSpeed('slow');
          // Auto-suggest lite mode for slow connections
          suggestLiteMode();
        } else {
          setConnectionSpeed('fast');
        }
      };

      testImage.onerror = () => {
        setConnectionSpeed('slow');
        suggestLiteMode();
      };

      // Use a small test image (1x1 pixel)
      testImage.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    } catch (error) {
      console.warn('Could not detect connection speed:', error);
      setConnectionSpeed('unknown');
    }
  }, [isLiteMode, setLiteMode, suggestLiteMode]);

  const toggleLiteMode = useCallback(() => {
    setLiteMode(!isLiteMode);
  }, [isLiteMode, setLiteMode]);

  useEffect(() => {
    // Load lite mode preference from localStorage
    const savedLiteMode = localStorage.getItem('sewago-lite-mode');
    if (savedLiteMode !== null) {
      setIsLiteMode(JSON.parse(savedLiteMode));
    }

    // Detect network connection speed
    detectConnectionSpeed();
  }, [detectConnectionSpeed]);

  const value: LiteModeContextType = {
    isLiteMode,
    setLiteMode,
    toggleLiteMode,
    connectionSpeed,
  };

  return (
    <LiteModeContext.Provider value={value}>
      {children}
    </LiteModeContext.Provider>
  );
}

// Hook for components to apply lite mode optimizations
export function useLiteOptimizations() {
  const { isLiteMode } = useLiteMode();
  
  return {
    // Image optimizations
    imageQuality: isLiteMode ? 60 : 85,
    imageFormat: isLiteMode ? 'webp' : 'auto',
    lazyLoading: isLiteMode ? 'eager' : 'lazy', // Disable lazy loading in lite mode
    
    // Animation preferences
    reduceAnimations: isLiteMode,
    
    // Data loading preferences
    enablePagination: isLiteMode, // Load smaller chunks
    prefetchNext: !isLiteMode, // Don't prefetch in lite mode
    
    // UI preferences
    showThumbnails: !isLiteMode,
    enableSearch: !isLiteMode, // Disable live search in lite mode
    
    // CSS classes for conditional styling
    liteModeClass: isLiteMode ? 'lite-mode' : '',
  };
}
