export const dynamic = 'force-dynamic';
export const revalidate = 0;

import DashboardHeader from '@/components/DashboardHeader';

// Force dynamic rendering to prevent build-time issues

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DashboardHeader />
      {children}
    </>
  );
}
