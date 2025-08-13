'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { FEATURE_FLAGS } from '@/lib/feature-flags';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Only render SessionProvider when AUTH_ENABLED is true
  if (!FEATURE_FLAGS.AUTH_ENABLED) {
    return <>{children}</>;
  }

  return <SessionProvider>{children}</SessionProvider>;
}
