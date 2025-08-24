'use client';

import { useContext } from 'react';
import { ContextualIntelligenceContext } from '@/contexts/ContextualIntelligenceContext';

// Re-export the hook from context for backward compatibility and easier importing
export function useContextualIntelligence() {
  const context = useContext(ContextualIntelligenceContext);
  if (!context) {
    throw new Error('useContextualIntelligence must be used within a ContextualIntelligenceProvider');
  }
  return context;
}