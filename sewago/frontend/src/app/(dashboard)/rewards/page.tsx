'use client';

import { Suspense } from 'react';
import { GamificationDashboard } from '@/components/gamification/GamificationDashboard';
import { LoadingSpinner } from '@/components/LoadingSpinner';

// Force dynamic rendering to prevent build-time pre-rendering
export const dynamic = 'force-dynamic';

interface RewardsPageProps {
  params: Promise<{ locale?: string }>;
}

export default async function RewardsPage({ params }: RewardsPageProps) {
  const resolvedParams = await params;
  const locale = resolvedParams?.locale || 'en';

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <GamificationDashboard locale={locale} />
    </Suspense>
  );
}