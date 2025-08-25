'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAudioFeedback } from '@/contexts/AudioFeedbackContext';

interface VoiceGuidanceOptions {
  immediate?: boolean;
  priority?: 'low' | 'medium' | 'high';
  language?: 'en-US' | 'ne-NP';
  interrupt?: boolean;
  delay?: number;
}

interface NavigationContext {
  currentPage: string;
  previousPage?: string;
  userRole: 'customer' | 'provider' | 'admin' | 'guest';
  actionContext?: string;
}

interface VoiceGuidanceSystemProps {
  enabled?: boolean;
  navigationContext?: NavigationContext;
  children: React.ReactNode;
}

// Localized voice guidance messages
const VOICE_MESSAGES = {
  'en-US': {
    // Navigation
    navigation: {
      page_loaded: 'Page loaded successfully',
      form_validation_error: 'Please check the form for errors',
      booking_initiated: 'Starting your booking process',
      payment_initiated: 'Redirecting to payment',
      search_results: 'Search results loaded',
      profile_updated: 'Profile updated successfully'
    },
    // Actions
    actions: {
      button_clicked: 'Button activated',
      form_submitted: 'Form submitted',
      file_uploaded: 'File uploaded successfully',
      booking_confirmed: 'Booking confirmed successfully',
      payment_completed: 'Payment completed successfully',
      review_submitted: 'Review submitted successfully'
    },
    // Errors
    errors: {
      network_error: 'Network error. Please try again',
      validation_error: 'Please correct the highlighted fields',
      payment_failed: 'Payment failed. Please try again',
      booking_failed: 'Booking failed. Please contact support',
      file_upload_failed: 'File upload failed. Please try again'
    },
    // Accessibility
    accessibility: {
      modal_opened: 'Dialog opened. Press Escape to close',
      modal_closed: 'Dialog closed',
      menu_opened: 'Menu opened. Use arrow keys to navigate',
      menu_closed: 'Menu closed',
      tab_changed: 'Tab changed',
      page_section: 'Navigated to new section'
    },
    // Cultural context
    cultural: {
      festival_greeting: 'Happy festivals! Special offers available',
      nepali_new_year: 'Naya Barsa ko subhakamana! New Year blessings',
      dashain_greeting: 'Dashain ko subhakamana! Festival cleaning services available',
      tihar_greeting: 'Tihar ko subhakamana! Festival decoration services available'
    }
  },
  'ne-NP': {
    // Navigation (Nepali)
    navigation: {
      page_loaded: 'पृष्ठ सफलतापूर्वक लोड भयो',
      form_validation_error: 'कृपया त्रुटिहरूको लागि फारम जाँच गर्नुहोस्',
      booking_initiated: 'तपाईंको बुकिंग प्रक्रिया सुरु गर्दै',
      payment_initiated: 'भुक्तानीमा रिडाइरेक्ट गर्दै',
      search_results: 'खोज परिणामहरू लोड भए',
      profile_updated: 'प्रोफाइल सफलतापूर्वक अपडेट भयो'
    },
    // Actions (Nepali)
    actions: {
      button_clicked: 'बटन सक्रिय भयो',
      form_submitted: 'फारम पेश गरियो',
      file_uploaded: 'फाइल सफलतापूर्वक अपलोड भयो',
      booking_confirmed: 'बुकिंग सफलतापूर्वक पुष्टि भयो',
      payment_completed: 'भुक्तानी सफलतापूर्वक पूरा भयो',
      review_submitted: 'समीक्षा सफलतापूर्वक पेश गरियो'
    },
    // Errors (Nepali)
    errors: {
      network_error: 'नेटवर्क त्रुटि। कृपया फेरि प्रयास गर्नुहोस्',
      validation_error: 'कृपया हाइलाइट गरिएका फिल्डहरू सच्याउनुहोस्',
      payment_failed: 'भुक्तानी असफल। कृपया फेरि प्रयास गर्नुहोस्',
      booking_failed: 'बुकिंग असफल। कृपया सहयोगसँग सम्पर्क गर्नुहोस्',
      file_upload_failed: 'फाइल अपलोड असफल। कृपया फेरि प्रयास गर्नुहोस्'
    },
    // Accessibility (Nepali)
    accessibility: {
      modal_opened: 'संवाद खोलियो। बन्द गर्न Escape थिच्नुहोस्',
      modal_closed: 'संवाद बन्द भयो',
      menu_opened: 'मेनु खोलियो। नेभिगेट गर्न तीर कुञ्जीहरू प्रयोग गर्नुहोस्',
      menu_closed: 'मेनु बन्द भयो',
      tab_changed: 'ट्याब परिवर्तन भयो',
      page_section: 'नयाँ सेक्सनमा नेभिगेट गरियो'
    },
    // Cultural context (Nepali)
    cultural: {
      festival_greeting: 'चाडपर्वको शुभकामना! विशेष अफरहरू उपलब्ध छ',
      nepali_new_year: 'नयाँ वर्षको शुभकामना! आशीर्वाद सहित',
      dashain_greeting: 'दशैंको शुभकामना! चाडको सरसफाइ सेवा उपलब्ध छ',
      tihar_greeting: 'तिहारको शुभकामना! चाडको सजावट सेवा उपलब्ध छ'
    }
  }
};

const VoiceGuidanceSystem: React.FC<VoiceGuidanceSystemProps> = ({
  enabled = true,
  navigationContext,
  children
}) => {
  const { speakText, preferences } = useAudioFeedback();
  const [guidanceQueue, setGuidanceQueue] = useState<Array<{
    message: string;
    options: VoiceGuidanceOptions;
    timestamp: number;
  }>>([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'en-US' | 'ne-NP'>('en-US');
  const lastAnnouncementRef = useRef<string>('');
  const queueTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Only detect language on client side to prevent hydration mismatch
    if (typeof navigator !== 'undefined') {
      const browserLang = navigator.language;
      if (browserLang.startsWith('ne') || browserLang.includes('Nepal')) {
        setCurrentLanguage('ne-NP');
      }
    }
  }, []);

  useEffect(() => {
    if (!enabled || !preferences?.voiceGuidance) return;

    // Announce page navigation
    if (navigationContext?.currentPage) {
      announcePageNavigation(navigationContext);
    }
  }, [enabled, preferences?.voiceGuidance, navigationContext]);

  const announcePageNavigation = useCallback((context: NavigationContext) => {
    let message = '';
    const messages = VOICE_MESSAGES[currentLanguage];

    // Generate contextual navigation message
    switch (context.currentPage) {
      case 'home':
        message = 'Welcome to Sewago. Home page loaded.';
        break;
      case 'services':
        message = 'Services page. Browse available services.';
        break;
      case 'booking':
        message = messages.navigation.booking_initiated;
        break;
      case 'profile':
        message = 'Profile page. Manage your account settings.';
        break;
      case 'dashboard':
        const roleMessage = context.userRole === 'provider' 
          ? 'Provider dashboard loaded.'
          : context.userRole === 'admin'
          ? 'Admin dashboard loaded.'
          : 'User dashboard loaded.';
        message = roleMessage;
        break;
      default:
        message = messages.navigation.page_loaded;
    }

    // Add cultural context if applicable
    if (shouldAddCulturalGreeting()) {
      const culturalMessage = getCulturalGreeting();
      if (culturalMessage) {
        message += ` ${culturalMessage}`;
      }
    }

    announce(message, { priority: 'medium', delay: 500 });
  }, [currentLanguage]);

  const announce = useCallback((
    messageKey: string, 
    options: VoiceGuidanceOptions = {}
  ) => {
    if (!enabled || !preferences?.voiceGuidance) return;

    const messages = VOICE_MESSAGES[currentLanguage];
    let message = messageKey;

    // Try to get localized message
    const pathParts = messageKey.split('.');
    if (pathParts.length > 1) {
      let current: any = messages;
      for (const part of pathParts) {
        current = current?.[part];
      }
      if (current && typeof current === 'string') {
        message = current;
      }
    }

    // Prevent duplicate announcements
    if (lastAnnouncementRef.current === message && !options.immediate) {
      return;
    }

    const queueItem = {
      message,
      options: {
        language: currentLanguage,
        ...options
      },
      timestamp: Date.now()
    };

    setGuidanceQueue(prev => {
      const filtered = prev.filter(item => 
        item.options.priority !== 'low' || 
        Date.now() - item.timestamp < 5000
      );
      
      // Handle priority queue insertion
      if (options.priority === 'high') {
        return [queueItem, ...filtered];
      } else if (options.priority === 'medium') {
        const highPriorityCount = filtered.filter(item => item.options.priority === 'high').length;
        filtered.splice(highPriorityCount, 0, queueItem);
        return filtered;
      } else {
        return [...filtered, queueItem];
      }
    });

    if (!isProcessingQueue) {
      processGuidanceQueue();
    }
  }, [enabled, preferences?.voiceGuidance, currentLanguage, isProcessingQueue]);

  const processGuidanceQueue = useCallback(async () => {
    if (isProcessingQueue) return;

    setIsProcessingQueue(true);

    while (guidanceQueue.length > 0) {
      const item = guidanceQueue[0];
      setGuidanceQueue(prev => prev.slice(1));

      // Check if item is still relevant (not too old)
      if (Date.now() - item.timestamp > 30000 && item.options.priority === 'low') {
        continue;
      }

      // Handle interruption
      if (item.options.interrupt && typeof speechSynthesis !== 'undefined') {
        speechSynthesis.cancel();
      }

      // Apply delay
      if (item.options.delay) {
        await new Promise(resolve => setTimeout(resolve, item.options.delay));
      }

      // Speak the message
      await speakText(item.message, {
        language: item.options.language,
        rate: currentLanguage === 'ne-NP' ? 0.9 : 1.0, // Slower for Nepali
        pitch: 1.0,
        volume: 80
      });

      lastAnnouncementRef.current = item.message;

      // Small pause between announcements
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    setIsProcessingQueue(false);
  }, [guidanceQueue, isProcessingQueue, speakText, currentLanguage]);

  const shouldAddCulturalGreeting = (): boolean => {
    if (!preferences?.culturalSounds) return false;
    
    const now = new Date();
    const nepaliDate = convertToNepaliDate(now);
    
    // Check for major festivals (simplified logic)
    const month = now.getMonth();
    const day = now.getDate();
    
    // Dashain (September-October)
    if (month === 8 || month === 9) return true;
    
    // Tihar (October-November)  
    if (month === 9 || month === 10) return true;
    
    // Nepali New Year (April)
    if (month === 3 && day >= 13 && day <= 15) return true;
    
    return false;
  };

  const getCulturalGreeting = (): string => {
    const messages = VOICE_MESSAGES[currentLanguage].cultural;
    const now = new Date();
    const month = now.getMonth();
    
    if (month === 3) return messages.nepali_new_year;
    if (month === 8 || month === 9) return messages.dashain_greeting;
    if (month === 9 || month === 10) return messages.tihar_greeting;
    
    return messages.festival_greeting;
  };

  const convertToNepaliDate = (date: Date): any => {
    // Simplified Nepali date conversion (would need proper BS date library)
    return {
      year: date.getFullYear() + 57, // Approximate BS year
      month: date.getMonth(),
      day: date.getDate()
    };
  };

  // Expose announcement methods to child components
  const voiceGuidanceApi = {
    announce,
    announceAction: (action: string) => announce(`actions.${action}`),
    announceError: (error: string) => announce(`errors.${error}`, { priority: 'high', interrupt: true }),
    announceAccessibility: (event: string) => announce(`accessibility.${event}`, { priority: 'medium' }),
    setLanguage: (lang: 'en-US' | 'ne-NP') => setCurrentLanguage(lang),
    isEnabled: enabled && !!preferences?.voiceGuidance
  };

  return (
    <VoiceGuidanceContext.Provider value={voiceGuidanceApi}>
      {children}
    </VoiceGuidanceContext.Provider>
  );
};

// Context for child components to access voice guidance
const VoiceGuidanceContext = React.createContext<{
  announce: (message: string, options?: VoiceGuidanceOptions) => void;
  announceAction: (action: string) => void;
  announceError: (error: string) => void;
  announceAccessibility: (event: string) => void;
  setLanguage: (lang: 'en-US' | 'ne-NP') => void;
  isEnabled: boolean;
} | null>(null);

export const useVoiceGuidance = () => {
  const context = React.useContext(VoiceGuidanceContext);
  if (!context) {
    throw new Error('useVoiceGuidance must be used within VoiceGuidanceSystem');
  }
  return context;
};

// HOC for automatic voice guidance
export function withVoiceGuidance<T extends object>(
  Component: React.ComponentType<T>,
  options?: {
    announceOnMount?: string;
    announceOnUnmount?: string;
    trackInteractions?: boolean;
  }
) {
  return function VoiceGuidedComponent(props: T) {
    const voiceGuidance = useVoiceGuidance();

    useEffect(() => {
      if (options?.announceOnMount && voiceGuidance.isEnabled) {
        voiceGuidance.announce(options.announceOnMount);
      }

      return () => {
        if (options?.announceOnUnmount && voiceGuidance.isEnabled) {
          voiceGuidance.announce(options.announceOnUnmount);
        }
      };
    }, [voiceGuidance]);

    // Wrap component with interaction tracking if enabled
    if (options?.trackInteractions) {
      return (
        <div
          onFocus={(e) => {
            const element = e.target as HTMLElement;
            if (element.getAttribute('aria-label')) {
              voiceGuidance.announce(element.getAttribute('aria-label')!);
            }
          }}
        >
          <Component {...props} />
        </div>
      );
    }

    return <Component {...props} />;
  };
}

export default VoiceGuidanceSystem;