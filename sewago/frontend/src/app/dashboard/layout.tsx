import { ReactNode } from 'react';

// Force all dashboard pages to use dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}