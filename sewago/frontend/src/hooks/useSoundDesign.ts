'use client';

import { useAudioFeedback } from '@/contexts/AudioFeedbackContext';

// Re-export the hook from context for backward compatibility and easier importing
export function useSoundDesign() {
  return useAudioFeedback();
}

// Alias for consistency
// Re-export for backward compatibility
export { useSoundDesign as useAudioFeedback };