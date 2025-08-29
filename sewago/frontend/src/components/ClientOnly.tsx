'use client';
import useIsClient from '../../hooks/useIsClient';

export default function ClientOnly({ children }: { children: React.ReactNode }) {
  const isClient = useIsClient();
  if (!isClient) return null;
  return <>{children}</>;
}
