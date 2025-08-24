'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface AccessibilityPreferences {
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  colorBlindnessType: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  screenReaderEnabled: boolean;
  keyboardNavigation: boolean;
}

interface AccessibilityState extends AccessibilityPreferences {
  isLoading: boolean;
  supportsHover: boolean;
  supportsTouch: boolean;
  prefersReducedMotion: boolean;
  prefersHighContrast: boolean;
  focusVisible: boolean;
}

export function useAccessibility() {
  const [state, setState] = useState<AccessibilityState>({
    reducedMotion: false,
    highContrast: false,
    fontSize: 'medium',
    colorBlindnessType: 'none',
    screenReaderEnabled: false,
    keyboardNavigation: false,
    isLoading: true,
    supportsHover: false,
    supportsTouch: false,
    prefersReducedMotion: false,
    prefersHighContrast: false,
    focusVisible: false
  });

  const announcementRef = useRef<HTMLDivElement>(null);

  // Initialize accessibility preferences
  useEffect(() => {
    const initializeAccessibility = () => {
      // Check system preferences
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
      const supportsHover = window.matchMedia('(hover: hover)').matches;
      const supportsTouch = 'ontouchstart' in window;

      // Load saved preferences
      const savedPrefs = localStorage.getItem('accessibility-preferences');
      const preferences: Partial<AccessibilityPreferences> = savedPrefs ? JSON.parse(savedPrefs) : {};

      // Check for screen reader
      const screenReaderEnabled = checkScreenReaderUsage();

      setState(prev => ({
        ...prev,
        ...preferences,
        prefersReducedMotion,
        prefersHighContrast,
        supportsHover,
        supportsTouch,
        screenReaderEnabled,
        reducedMotion: preferences.reducedMotion ?? prefersReducedMotion,
        highContrast: preferences.highContrast ?? prefersHighContrast,
        isLoading: false
      }));

      // Apply initial accessibility settings
      applyAccessibilitySettings({
        reducedMotion: preferences.reducedMotion ?? prefersReducedMotion,
        highContrast: preferences.highContrast ?? prefersHighContrast,
        fontSize: preferences.fontSize ?? 'medium',
        colorBlindnessType: preferences.colorBlindnessType ?? 'none'
      });
    };

    initializeAccessibility();

    // Listen for system preference changes
    const motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastMediaQuery = window.matchMedia('(prefers-contrast: high)');

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setState(prev => ({ ...prev, prefersReducedMotion: e.matches }));
      if (!localStorage.getItem('accessibility-preferences')) {
        updatePreference('reducedMotion', e.matches);
      }
    };

    const handleContrastChange = (e: MediaQueryListEvent) => {
      setState(prev => ({ ...prev, prefersHighContrast: e.matches }));
      if (!localStorage.getItem('accessibility-preferences')) {
        updatePreference('highContrast', e.matches);
      }
    };

    motionMediaQuery.addEventListener('change', handleMotionChange);
    contrastMediaQuery.addEventListener('change', handleContrastChange);

    // Focus visibility detection
    let hadKeyboardEvent = false;
    const keyboardThrottleTimeout = 100;

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' || e.key === 'ArrowUp' || e.key === 'ArrowDown' || 
          e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        hadKeyboardEvent = true;
        setState(prev => ({ ...prev, focusVisible: true, keyboardNavigation: true }));
      }
    };

    const handleMousedown = () => {
      hadKeyboardEvent = false;
      setTimeout(() => {
        if (!hadKeyboardEvent) {
          setState(prev => ({ ...prev, focusVisible: false }));
        }
      }, keyboardThrottleTimeout);
    };

    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('mousedown', handleMousedown);

    return () => {
      motionMediaQuery.removeEventListener('change', handleMotionChange);
      contrastMediaQuery.removeEventListener('change', handleContrastChange);
      document.removeEventListener('keydown', handleKeydown);
      document.removeEventListener('mousedown', handleMousedown);
    };
  }, []);

  const checkScreenReaderUsage = (): boolean => {
    // Check for common screen reader indicators
    if (navigator.userAgent.includes('NVDA') || 
        navigator.userAgent.includes('JAWS') || 
        navigator.userAgent.includes('WindowEyes')) {
      return true;
    }

    // Check for screen reader APIs
    if ('speechSynthesis' in window && window.speechSynthesis.getVoices().length > 0) {
      return true;
    }

    // Check for high contrast or other accessibility preferences
    if (window.matchMedia('(prefers-contrast: high)').matches ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return true;
    }

    return false;
  };

  const applyAccessibilitySettings = (settings: Partial<AccessibilityPreferences>) => {
    const root = document.documentElement;

    // Apply reduced motion
    if (settings.reducedMotion !== undefined) {
      if (settings.reducedMotion) {
        root.classList.add('reduce-motion');
        root.style.setProperty('--animation-duration', '0.01s');
      } else {
        root.classList.remove('reduce-motion');
        root.style.removeProperty('--animation-duration');
      }
    }

    // Apply high contrast
    if (settings.highContrast !== undefined) {
      if (settings.highContrast) {
        root.classList.add('high-contrast');
      } else {
        root.classList.remove('high-contrast');
      }
    }

    // Apply font size
    if (settings.fontSize) {
      const fontScales = {
        'small': '0.875',
        'medium': '1',
        'large': '1.125',
        'extra-large': '1.25'
      };
      root.style.setProperty('--font-size-scale', fontScales[settings.fontSize]);
      root.setAttribute('data-font-size', settings.fontSize);
    }

    // Apply color blindness filters
    if (settings.colorBlindnessType && settings.colorBlindnessType !== 'none') {
      const filters = {
        protanopia: 'url(#protanopia-filter)',
        deuteranopia: 'url(#deuteranopia-filter)',
        tritanopia: 'url(#tritanopia-filter)'
      };
      root.style.filter = filters[settings.colorBlindnessType];
      addColorBlindnessFilters();
    } else {
      root.style.removeProperty('filter');
    }
  };

  const addColorBlindnessFilters = () => {
    if (document.getElementById('colorblind-filters')) return;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = 'colorblind-filters';
    svg.style.position = 'absolute';
    svg.style.width = '0';
    svg.style.height = '0';
    
    svg.innerHTML = `
      <defs>
        <filter id="protanopia-filter">
          <feColorMatrix values="0.567,0.433,0,0,0 0.558,0.442,0,0,0 0,0.242,0.758,0,0 0,0,0,1,0"/>
        </filter>
        <filter id="deuteranopia-filter">
          <feColorMatrix values="0.625,0.375,0,0,0 0.7,0.3,0,0,0 0,0.3,0.7,0,0 0,0,0,1,0"/>
        </filter>
        <filter id="tritanopia-filter">
          <feColorMatrix values="0.95,0.05,0,0,0 0,0.433,0.567,0,0 0,0.475,0.525,0,0 0,0,0,1,0"/>
        </filter>
      </defs>
    `;
    
    document.body.appendChild(svg);
  };

  const updatePreference = useCallback(<K extends keyof AccessibilityPreferences>(
    key: K,
    value: AccessibilityPreferences[K]
  ) => {
    setState(prev => {
      const newState = { ...prev, [key]: value };
      
      // Save to localStorage
      const preferences: AccessibilityPreferences = {
        reducedMotion: newState.reducedMotion,
        highContrast: newState.highContrast,
        fontSize: newState.fontSize,
        colorBlindnessType: newState.colorBlindnessType,
        screenReaderEnabled: newState.screenReaderEnabled,
        keyboardNavigation: newState.keyboardNavigation
      };
      
      localStorage.setItem('accessibility-preferences', JSON.stringify(preferences));
      
      // Apply the setting
      applyAccessibilitySettings({ [key]: value });
      
      return newState;
    });
  }, []);

  const announceToScreenReader = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!state.screenReaderEnabled) return;

    if (announcementRef.current) {
      announcementRef.current.textContent = '';
      announcementRef.current.setAttribute('aria-live', priority);
      
      setTimeout(() => {
        if (announcementRef.current) {
          announcementRef.current.textContent = message;
        }
      }, 100);
    }
  }, [state.screenReaderEnabled]);

  const skipToContent = useCallback(() => {
    const mainContent = document.querySelector('main, [role="main"], #main-content');
    if (mainContent) {
      (mainContent as HTMLElement).focus();
      announceToScreenReader('Skipped to main content');
    }
  }, [announceToScreenReader]);

  const navigateByHeading = useCallback((direction: 'next' | 'previous' = 'next') => {
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    const currentElement = document.activeElement;
    
    let currentIndex = -1;
    for (let i = 0; i < headings.length; i++) {
      if (headings[i].contains(currentElement) || headings[i] === currentElement) {
        currentIndex = i;
        break;
      }
    }

    let targetIndex: number;
    if (direction === 'next') {
      targetIndex = currentIndex < headings.length - 1 ? currentIndex + 1 : 0;
    } else {
      targetIndex = currentIndex > 0 ? currentIndex - 1 : headings.length - 1;
    }

    if (headings[targetIndex]) {
      (headings[targetIndex] as HTMLElement).focus();
      announceToScreenReader(`Navigated to heading: ${headings[targetIndex].textContent}`);
    }
  }, [announceToScreenReader]);

  const getContrastRatio = useCallback((foreground: string, background: string): number => {
    const getLuminance = (color: string): number => {
      const rgb = parseInt(color.replace('#', ''), 16);
      const r = (rgb >> 16) & 255;
      const g = (rgb >> 8) & 255;
      const b = rgb & 255;
      
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const l1 = getLuminance(foreground);
    const l2 = getLuminance(background);
    
    return l1 > l2 ? (l1 + 0.05) / (l2 + 0.05) : (l2 + 0.05) / (l1 + 0.05);
  }, []);

  const validateAccessibility = useCallback((element: HTMLElement): {
    score: number;
    issues: string[];
    suggestions: string[];
  } => {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    // Check for alt text on images
    const images = element.querySelectorAll('img');
    images.forEach(img => {
      if (!img.alt) {
        issues.push('Image missing alt text');
        suggestions.push('Add descriptive alt text to images');
        score -= 10;
      }
    });

    // Check for proper heading structure
    const headings = Array.from(element.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    for (let i = 1; i < headings.length; i++) {
      const current = parseInt(headings[i].tagName[1]);
      const previous = parseInt(headings[i - 1].tagName[1]);
      
      if (current > previous + 1) {
        issues.push('Heading structure skips levels');
        suggestions.push('Use proper heading hierarchy (h1, h2, h3, etc.)');
        score -= 15;
        break;
      }
    }

    // Check for keyboard accessibility
    const interactiveElements = element.querySelectorAll(
      'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    interactiveElements.forEach(el => {
      if (!el.hasAttribute('tabindex') && el.tagName !== 'A' && el.tagName !== 'BUTTON' && 
          el.tagName !== 'INPUT' && el.tagName !== 'SELECT' && el.tagName !== 'TEXTAREA') {
        issues.push('Interactive element not keyboard accessible');
        suggestions.push('Add tabindex="0" or use semantic HTML elements');
        score -= 5;
      }
    });

    // Check for ARIA labels
    const customElements = element.querySelectorAll('[role], [aria-label], [aria-labelledby]');
    if (customElements.length === 0 && interactiveElements.length > 0) {
      suggestions.push('Consider adding ARIA labels for better screen reader support');
    }

    return { score: Math.max(0, score), issues, suggestions };
  }, []);

  // Screen reader announcement element creation
  const createAnnouncementElement = useCallback(() => {
    const element = document.createElement('div');
    element.className = 'sr-only';
    element.setAttribute('aria-live', 'polite');
    element.setAttribute('aria-atomic', 'true');
    element.setAttribute('role', 'status');
    return element;
  }, []);

  return {
    ...state,
    updatePreference,
    announceToScreenReader,
    skipToContent,
    navigateByHeading,
    getContrastRatio,
    validateAccessibility,
    createAnnouncementElement
  };
}