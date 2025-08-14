'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Temporarily hardcode AUTH_ENABLED to true to fix deployment
  // TODO: Set NEXT_PUBLIC_AUTH_ENABLED=true in Vercel environment variables
  return <SessionProvider>{children}</SessionProvider>;
}
