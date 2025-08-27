'use client';

import { Suspense } from 'react';
import { GamificationDashboard } from '@/components/gamification/GamificationDashboard';
import { LoadingSpinner } from '@/components/LoadingSpinner';

// Force dynamic rendering to prevent build-time pre-rendering
export const dynamic = 'force-dynamic';

export default function RewardsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <GamificationDashboard locale="en" />
    </Suspense>
  );
}