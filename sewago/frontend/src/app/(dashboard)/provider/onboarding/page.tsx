'use client';

import ProviderOnboardingClient from './onboarding-client';

// Force dynamic rendering to prevent build-time pre-rendering
export const dynamic = 'force-dynamic';

export default function ProviderOnboardingPage() {
  return <ProviderOnboardingClient />;
}
