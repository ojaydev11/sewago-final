'use client';

import React, { ReactNode } from 'react';
import { HapticFeedbackProvider } from '@/contexts/HapticFeedbackContext';
import { AudioFeedbackProvider } from '@/contexts/AudioFeedbackContext';
import { ContextualIntelligenceProvider } from '@/contexts/ContextualIntelligenceContext';
import VoiceGuidanceSystem from './VoiceGuidanceSystem';

interface PremiumUXProviderProps {
  children: ReactNode;
  enabled?: boolean;
  features?: {
    hapticFeedback?: boolean;
    audioFeedback?: boolean;
    voiceGuidance?: boolean;
    contextualIntelligence?: boolean;
    culturalUX?: boolean;
    accessibilityEnhancements?: boolean;
    performanceOptimization?: boolean;
  };
  userRole?: 'customer' | 'provider' | 'admin' | 'guest';
  culturalContext?: boolean;
}

/**
 * Premium UX Provider - Wraps the entire application with premium UX features
 * This component integrates all UX enhancements including haptic feedback, 
 * audio design, voice guidance, contextual intelligence, and cultural elements.
 */
export const PremiumUXProvider: React.FC<PremiumUXProviderProps> = ({
  children,
  enabled = true,
  features = {
    hapticFeedback: true,
    audioFeedback: true,
    voiceGuidance: true,
    contextualIntelligence: true,
    culturalUX: true,
    accessibilityEnhancements: true,
    performanceOptimization: true
  },
  userRole = 'customer',
  culturalContext = true
}) => {
  if (!enabled) {
    return <>{children}</>;
  }

  // Determine navigation context based on current page
  const getNavigationContext = () => {
    if (typeof window === 'undefined') return undefined;
    
    const path = window.location.pathname;
    let currentPage = 'home';
    
    if (path.includes('/services')) currentPage = 'services';
    else if (path.includes('/booking')) currentPage = 'booking';
    else if (path.includes('/dashboard')) currentPage = 'dashboard';
    else if (path.includes('/profile') || path.includes('/account')) currentPage = 'profile';
    else if (path.includes('/payment')) currentPage = 'payment';
    
    return {
      currentPage,
      userRole,
      actionContext: path
    };
  };

  const navigationContext = getNavigationContext();

  return (
    <HapticFeedbackProvider>
      <AudioFeedbackProvider>
        {features.contextualIntelligence ? (
          <ContextualIntelligenceProvider>
            <VoiceGuidanceSystem
              enabled={features.voiceGuidance}
              navigationContext={navigationContext}
            >
              {children}
            </VoiceGuidanceSystem>
          </ContextualIntelligenceProvider>
        ) : (
          <VoiceGuidanceSystem
            enabled={features.voiceGuidance}
            navigationContext={navigationContext}
          >
            {children}
          </VoiceGuidanceSystem>
        )}
      </AudioFeedbackProvider>
    </HapticFeedbackProvider>
  );
};

export default PremiumUXProvider;