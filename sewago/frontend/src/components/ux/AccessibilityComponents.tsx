'use client';

import React, { useState, useEffect, useRef, ReactNode, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHapticFeedback } from '@/contexts/HapticFeedbackContext';
import { useAudioFeedback } from '@/contexts/AudioFeedbackContext';
import { useVoiceGuidance } from '@/components/ux/VoiceGuidanceSystem';

// Enhanced Screen Reader Announcement Component
interface ScreenReaderAnnouncementProps {
  message: string;
  priority?: 'polite' | 'assertive' | 'off';
  clearOnUnmount?: boolean;
}

export const ScreenReaderAnnouncement: React.FC<ScreenReaderAnnouncementProps> = ({
  message,
  priority = 'polite',
  clearOnUnmount = true
}) => {
  const [announcement, setAnnouncement] = useState(message);

  useEffect(() => {
    setAnnouncement(message);
  }, [message]);

  useEffect(() => {
    return () => {
      if (clearOnUnmount) {
        setAnnouncement('');
      }
    };
  }, [clearOnUnmount]);

  return (
    <div
      className="sr-only"
      aria-live={priority}
      aria-atomic="true"
      role="status"
    >
      {announcement}
    </div>
  );
};

// Enhanced Focus Management Component
interface FocusManagementProps {
  children: ReactNode;
  autoFocus?: boolean;
  trapFocus?: boolean;
  restoreFocus?: boolean;
  className?: string;
}

export const FocusManagement: React.FC<FocusManagementProps> = ({
  children,
  autoFocus = false,
  trapFocus = false,
  restoreFocus = true,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [focusableElements, setFocusableElements] = useState<HTMLElement[]>([]);

  useEffect(() => {
    if (autoFocus || restoreFocus) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    }

    if (autoFocus && containerRef.current) {
      const firstFocusable = getFocusableElements(containerRef.current)[0];
      if (firstFocusable) {
        firstFocusable.focus();
      }
    }

    return () => {
      if (restoreFocus && previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [autoFocus, restoreFocus]);

  useEffect(() => {
    if (trapFocus && containerRef.current) {
      const elements = getFocusableElements(containerRef.current);
      setFocusableElements(elements);
    }
  }, [trapFocus, children]);

  const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
    const selector = [
      'button:not([disabled])',
      'input:not([disabled])',
      'textarea:not([disabled])',
      'select:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable]',
      'audio[controls]',
      'video[controls]'
    ].join(', ');

    return Array.from(container.querySelectorAll(selector)) as HTMLElement[];
  };

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!trapFocus || focusableElements.length === 0) return;

    if (event.key === 'Tab') {
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement as HTMLElement;

      if (event.shiftKey) {
        if (activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  }, [trapFocus, focusableElements]);

  return (
    <div
      ref={containerRef}
      className={className}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      {children}
    </div>
  );
};

// High Contrast Mode Toggle
interface HighContrastToggleProps {
  onToggle?: (enabled: boolean) => void;
  initialState?: boolean;
}

export const HighContrastToggle: React.FC<HighContrastToggleProps> = ({
  onToggle,
  initialState = false
}) => {
  const [isHighContrast, setIsHighContrast] = useState(initialState);
  const { triggerHaptic, preferences: hapticPrefs } = useHapticFeedback();
  const { playSound, preferences: audioPrefs } = useAudioFeedback();
  const voiceGuidance = useVoiceGuidance();

  useEffect(() => {
    const savedState = localStorage.getItem('high-contrast-mode');
    if (savedState) {
      const enabled = JSON.parse(savedState);
      setIsHighContrast(enabled);
      applyHighContrast(enabled);
    }
  }, []);

  const applyHighContrast = (enabled: boolean) => {
    if (enabled) {
      document.documentElement.classList.add('high-contrast');
      document.documentElement.style.setProperty('--accessibility-mode', 'high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
      document.documentElement.style.removeProperty('--accessibility-mode');
    }
  };

  const handleToggle = async () => {
    const newState = !isHighContrast;
    setIsHighContrast(newState);
    applyHighContrast(newState);
    localStorage.setItem('high-contrast-mode', JSON.stringify(newState));

    // Provide feedback
    if (hapticPrefs?.hapticEnabled) {
      await triggerHaptic('selection');
    }

    if (audioPrefs?.soundEnabled) {
      await playSound('ui_click', { volume: 40 });
    }

    const message = newState 
      ? 'High contrast mode enabled. Colors have been adjusted for better visibility.'
      : 'High contrast mode disabled. Default colors restored.';
    
    voiceGuidance.announce(message);
    onToggle?.(newState);
  };

  return (
    <motion.button
      className={`
        relative inline-flex items-center px-4 py-2 rounded-lg font-medium text-sm
        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
        ${isHighContrast 
          ? 'bg-gray-900 text-white border-2 border-yellow-400 focus:ring-yellow-400' 
          : 'bg-gray-100 text-gray-700 border-2 border-gray-300 focus:ring-blue-500'
        }
      `}
      onClick={handleToggle}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      aria-label={`${isHighContrast ? 'Disable' : 'Enable'} high contrast mode`}
      aria-pressed={isHighContrast}
    >
      <motion.div
        className="mr-2"
        animate={{ rotate: isHighContrast ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2L13.09 8.26L20 9L14 14.74L15.18 21.02L10 17.77L4.82 21.02L6 14.74L0 9L6.91 8.26L10 2Z" />
        </svg>
      </motion.div>
      High Contrast
      {isHighContrast && (
        <motion.div
          className="ml-2 w-2 h-2 bg-yellow-400 rounded-full"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 }}
        />
      )}
    </motion.button>
  );
};

// Keyboard Navigation Helper
interface KeyboardNavigationProps {
  children: ReactNode;
  onNavigate?: (direction: 'up' | 'down' | 'left' | 'right' | 'enter' | 'escape') => void;
  className?: string;
}

export const KeyboardNavigation: React.FC<KeyboardNavigationProps> = ({
  children,
  onNavigate,
  className = ''
}) => {
  const { triggerHaptic, preferences: hapticPrefs } = useHapticFeedback();
  const { playSound, preferences: audioPrefs } = useAudioFeedback();
  const voiceGuidance = useVoiceGuidance();

  const handleKeyDown = async (event: React.KeyboardEvent) => {
    const { key, ctrlKey, altKey, shiftKey } = event;
    
    // Navigation keys
    const navigationMap: Record<string, 'up' | 'down' | 'left' | 'right' | 'enter' | 'escape'> = {
      'ArrowUp': 'up',
      'ArrowDown': 'down',
      'ArrowLeft': 'left',
      'ArrowRight': 'right',
      'Enter': 'enter',
      'Escape': 'escape',
      ' ': 'enter' // Space bar
    };

    if (navigationMap[key]) {
      event.preventDefault();
      const direction = navigationMap[key];
      
      // Provide feedback
      if (hapticPrefs?.hapticEnabled) {
        await triggerHaptic('selection', { intensity: 25 });
      }

      if (audioPrefs?.soundEnabled && direction !== 'escape') {
        await playSound('ui_hover', { volume: 20 });
      }

      // Voice guidance for navigation
      const directionMessages = {
        up: 'Navigating up',
        down: 'Navigating down',
        left: 'Navigating left',
        right: 'Navigating right',
        enter: 'Activating item',
        escape: 'Closing or going back'
      };

      if (voiceGuidance.isEnabled && direction !== 'enter') {
        voiceGuidance.announce(directionMessages[direction]);
      }

      onNavigate?.(direction);
    }

    // Accessibility shortcuts
    if (altKey && key === 'k') {
      // Skip navigation shortcut
      event.preventDefault();
      voiceGuidance.announce('Skip navigation activated');
      const mainContent = document.querySelector('main, [role="main"]') as HTMLElement;
      if (mainContent) {
        mainContent.focus();
      }
    }

    if (ctrlKey && key === 'h') {
      // Heading navigation
      event.preventDefault();
      voiceGuidance.announce('Heading navigation activated');
      navigateToNextHeading();
    }
  };

  const navigateToNextHeading = () => {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const currentFocus = document.activeElement;
    
    let nextHeading: Element | null = null;
    let found = false;

    for (const heading of headings) {
      if (found) {
        nextHeading = heading;
        break;
      }
      if (heading.contains(currentFocus)) {
        found = true;
      }
    }

    if (!nextHeading && headings.length > 0) {
      nextHeading = headings[0];
    }

    if (nextHeading) {
      (nextHeading as HTMLElement).focus();
      voiceGuidance.announce(`Navigated to heading: ${nextHeading.textContent}`);
    }
  };

  return (
    <div
      className={className}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      {children}
    </div>
  );
};

// Reduced Motion Toggle
interface ReducedMotionToggleProps {
  onToggle?: (enabled: boolean) => void;
  initialState?: boolean;
}

export const ReducedMotionToggle: React.FC<ReducedMotionToggleProps> = ({
  onToggle,
  initialState = false
}) => {
  const [isReducedMotion, setIsReducedMotion] = useState(initialState);
  const { triggerHaptic, preferences: hapticPrefs } = useHapticFeedback();
  const voiceGuidance = useVoiceGuidance();

  useEffect(() => {
    // Check system preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches || initialState);

    const savedState = localStorage.getItem('reduced-motion');
    if (savedState) {
      const enabled = JSON.parse(savedState);
      setIsReducedMotion(enabled);
      applyReducedMotion(enabled);
    }

    // Listen for system preference changes
    const handleChange = (event: MediaQueryListEvent) => {
      if (!savedState) { // Only apply system preference if no user preference saved
        setIsReducedMotion(event.matches);
        applyReducedMotion(event.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [initialState]);

  const applyReducedMotion = (enabled: boolean) => {
    if (enabled) {
      document.documentElement.classList.add('reduced-motion');
      document.documentElement.style.setProperty('--animation-duration', '0.01s');
      document.documentElement.style.setProperty('--transition-duration', '0.01s');
    } else {
      document.documentElement.classList.remove('reduced-motion');
      document.documentElement.style.removeProperty('--animation-duration');
      document.documentElement.style.removeProperty('--transition-duration');
    }
  };

  const handleToggle = async () => {
    const newState = !isReducedMotion;
    setIsReducedMotion(newState);
    applyReducedMotion(newState);
    localStorage.setItem('reduced-motion', JSON.stringify(newState));

    // Provide feedback
    if (hapticPrefs?.hapticEnabled) {
      await triggerHaptic('selection');
    }

    const message = newState 
      ? 'Reduced motion enabled. Animations have been minimized.'
      : 'Reduced motion disabled. Full animations restored.';
    
    voiceGuidance.announce(message);
    onToggle?.(newState);
  };

  return (
    <motion.button
      className={`
        relative inline-flex items-center px-4 py-2 rounded-lg font-medium text-sm
        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
        ${isReducedMotion 
          ? 'bg-blue-600 text-white focus:ring-blue-500' 
          : 'bg-gray-100 text-gray-700 focus:ring-blue-500'
        }
      `}
      onClick={handleToggle}
      animate={!isReducedMotion ? { scale: [1, 1.02, 1] } : {}}
      transition={{ duration: 0.2 }}
      aria-label={`${isReducedMotion ? 'Disable' : 'Enable'} reduced motion`}
      aria-pressed={isReducedMotion}
    >
      <motion.div
        className="mr-2"
        animate={!isReducedMotion ? { rotate: [0, 10, -10, 0] } : {}}
        transition={{ duration: 0.5, repeat: isReducedMotion ? 0 : Infinity, repeatDelay: 2 }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </motion.div>
      Reduce Motion
      {isReducedMotion && (
        <div className="ml-2 w-2 h-2 bg-green-400 rounded-full" />
      )}
    </motion.button>
  );
};

// Font Size Controller
interface FontSizeControllerProps {
  onSizeChange?: (size: 'small' | 'medium' | 'large' | 'extra-large') => void;
  initialSize?: 'small' | 'medium' | 'large' | 'extra-large';
}

export const FontSizeController: React.FC<FontSizeControllerProps> = ({
  onSizeChange,
  initialSize = 'medium'
}) => {
  const [fontSize, setFontSize] = useState(initialSize);
  const { triggerHaptic, preferences: hapticPrefs } = useHapticFeedback();
  const { playSound, preferences: audioPrefs } = useAudioFeedback();
  const voiceGuidance = useVoiceGuidance();

  const fontSizes = {
    'small': { scale: 0.875, label: 'Small', class: 'text-sm' },
    'medium': { scale: 1, label: 'Medium', class: 'text-base' },
    'large': { scale: 1.125, label: 'Large', class: 'text-lg' },
    'extra-large': { scale: 1.25, label: 'Extra Large', class: 'text-xl' }
  };

  useEffect(() => {
    const savedSize = localStorage.getItem('font-size-preference');
    if (savedSize && savedSize in fontSizes) {
      const size = savedSize as keyof typeof fontSizes;
      setFontSize(size);
      applyFontSize(size);
    }
  }, []);

  const applyFontSize = (size: keyof typeof fontSizes) => {
    const scale = fontSizes[size].scale;
    document.documentElement.style.setProperty('--font-size-scale', scale.toString());
    document.documentElement.setAttribute('data-font-size', size);
  };

  const handleSizeChange = async (newSize: keyof typeof fontSizes) => {
    setFontSize(newSize);
    applyFontSize(newSize);
    localStorage.setItem('font-size-preference', newSize);

    // Provide feedback
    if (hapticPrefs?.hapticEnabled) {
      await triggerHaptic('selection');
    }

    if (audioPrefs?.soundEnabled) {
      await playSound('ui_click', { volume: 30 });
    }

    voiceGuidance.announce(`Font size changed to ${fontSizes[newSize].label}`);
    onSizeChange?.(newSize);
  };

  return (
    <div className="flex items-center space-x-3">
      <span className="text-sm font-medium text-gray-700">Font Size:</span>
      <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
        {(Object.keys(fontSizes) as Array<keyof typeof fontSizes>).map((size) => (
          <motion.button
            key={size}
            className={`
              px-3 py-1 text-xs font-medium rounded-md transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500
              ${fontSize === size 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-gray-600 hover:bg-gray-200'
              }
            `}
            onClick={() => handleSizeChange(size)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={`Set font size to ${fontSizes[size].label}`}
            aria-pressed={fontSize === size}
          >
            <span className={fontSizes[size].class}>
              Aa
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

// ARIA Live Region for Dynamic Content
interface AriaLiveRegionProps {
  message: string;
  priority?: 'polite' | 'assertive';
  atomic?: boolean;
  relevant?: 'additions' | 'removals' | 'text' | 'all';
  className?: string;
}

export const AriaLiveRegion: React.FC<AriaLiveRegionProps> = ({
  message,
  priority = 'polite',
  atomic = true,
  relevant = 'all',
  className = 'sr-only'
}) => {
  const [currentMessage, setCurrentMessage] = useState('');

  useEffect(() => {
    // Clear the message first, then set it to ensure screen readers announce it
    setCurrentMessage('');
    const timeout = setTimeout(() => {
      setCurrentMessage(message);
    }, 10);

    return () => clearTimeout(timeout);
  }, [message]);

  return (
    <div
      className={className}
      aria-live={priority}
      aria-atomic={atomic}
      aria-relevant={relevant}
      role="status"
    >
      {currentMessage}
    </div>
  );
};

// Skip Links Component
interface SkipLinksProps {
  links: Array<{
    href: string;
    label: string;
  }>;
}

export const SkipLinks: React.FC<SkipLinksProps> = ({ links }) => {
  const [isVisible, setIsVisible] = useState(false);
  const { playSound, preferences: audioPrefs } = useAudioFeedback();

  const handleFocus = async () => {
    setIsVisible(true);
    if (audioPrefs?.soundEnabled) {
      await playSound('ui_hover', { volume: 25 });
    }
  };

  const handleBlur = () => {
    setIsVisible(false);
  };

  return (
    <div className="sr-only focus-within:not-sr-only">
      <AnimatePresence>
        {isVisible && (
          <motion.nav
            className="fixed top-4 left-4 z-50 bg-white shadow-lg rounded-lg p-4 border-2 border-blue-500"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            aria-label="Skip navigation links"
          >
            <h2 className="text-lg font-semibold mb-2 text-gray-900">
              Skip to:
            </h2>
            <ul className="space-y-2">
              {links.map((link, index) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="block px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
};