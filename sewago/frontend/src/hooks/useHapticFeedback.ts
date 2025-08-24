'use client';

import { useContext } from 'react';
import { HapticFeedbackContext } from '@/contexts/HapticFeedbackContext';

// Re-export the hook from context for backward compatibility and easier importing
export function useHapticFeedback() {
  const context = useContext(HapticFeedbackContext);
  if (!context) {
    throw new Error('useHapticFeedback must be used within a HapticFeedbackProvider');
  }
  return context;
}