'use client';

import { useContext } from 'react';
import { AudioFeedbackContext } from '@/contexts/AudioFeedbackContext';

// Re-export the hook from context for backward compatibility and easier importing
export function useSoundDesign() {
  const context = useContext(AudioFeedbackContext);
  if (!context) {
    throw new Error('useSoundDesign must be used within an AudioFeedbackProvider');
  }
  return context;
}

// Alias for consistency
export const useAudioFeedback = useSoundDesign;