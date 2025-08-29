export const FEATURE_FLAGS = {
  BOOKING_ENABLED: process.env.NEXT_PUBLIC_BOOKING_ENABLED === 'true',
  AUTH_ENABLED: process.env.NEXT_PUBLIC_AUTH_ENABLED === 'true',
  I18N_ENABLED: process.env.NEXT_PUBLIC_I18N_ENABLED === 'true',
  SEWAAI_ENABLED: process.env.NEXT_PUBLIC_SEWAAI_ENABLED === 'true',
  QUOTE_ESTIMATOR_ENABLED: process.env.NEXT_PUBLIC_QUOTE_ESTIMATOR_ENABLED === 'true',
  PAYMENTS_ESEWA_ENABLED: process.env.NEXT_PUBLIC_PAYMENTS_ESEWA_ENABLED === 'true',
  REVIEWS_ENABLED: process.env.NEXT_PUBLIC_REVIEWS_ENABLED === 'true',
  WARRANTY_BADGE_ENABLED: process.env.NEXT_PUBLIC_WARRANTY_BADGE_ENABLED === 'true',

  // Batch 8 feature flags
  SURGE_ENABLED: process.env.NEXT_PUBLIC_SURGE_ENABLED === 'true',
  PROMOS_ENABLED: process.env.NEXT_PUBLIC_PROMOS_ENABLED === 'true',
  WALLET_ENABLED: process.env.NEXT_PUBLIC_WALLET_ENABLED === 'true',
  PARTNER_API_ENABLED: process.env.NEXT_PUBLIC_PARTNER_API_ENABLED === 'true',
  WEBHOOKS_ENABLED: process.env.NEXT_PUBLIC_WEBHOOKS_ENABLED === 'true',
  SEARCH_ENABLED: process.env.NEXT_PUBLIC_SEARCH_ENABLED === 'true',
<<<<<<< HEAD
=======
  TRAINING_HUB_ENABLED: process.env.NEXT_PUBLIC_TRAINING_HUB_ENABLED === 'true',
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
} as const;

export type FeatureFlag = keyof typeof FEATURE_FLAGS;

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return FEATURE_FLAGS[flag];
}