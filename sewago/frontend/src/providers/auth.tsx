'use client';

<<<<<<< HEAD
import { SessionProvider } from 'next-auth/react';
=======
// Mock SessionProvider - replace with actual backend integration
const SessionProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
import { ReactNode } from 'react';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Temporarily hardcode AUTH_ENABLED to true to fix deployment
  // TODO: Set NEXT_PUBLIC_AUTH_ENABLED=true in Vercel environment variables
  return <SessionProvider>{children}</SessionProvider>;
}
