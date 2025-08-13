
/**
 * SewaGo Feature Flags - Batch 7
 * Centralized configuration for all feature toggles
 */

export const FEATURE_FLAGS = {
  // Payment & Core
  PAYMENTS_ESEWA_ENABLED: process.env.NEXT_PUBLIC_PAYMENTS_ESEWA_ENABLED === 'true' || false,
  PAYMENTS_COD_ENABLED: true, // Always enabled
  
  // Existing features from previous batches
  BOOKING_ENABLED: process.env.NEXT_PUBLIC_BOOKING_ENABLED === 'true' || true,
  AUTH_ENABLED: process.env.NEXT_PUBLIC_AUTH_ENABLED === 'true' || true,
  I18N_ENABLED: process.env.NEXT_PUBLIC_I18N_ENABLED === 'true' || true,
  SEWAAI_ENABLED: process.env.NEXT_PUBLIC_SEWAAI_ENABLED === 'true' || true,
  QUOTE_ESTIMATOR_ENABLED: process.env.NEXT_PUBLIC_QUOTE_ESTIMATOR_ENABLED === 'true' || true,
  
  // Batch 7 - Quality & Trust Engine
  RISK_GATES_ENABLED: process.env.NEXT_PUBLIC_RISK_GATES_ENABLED === 'true' || true,
  OTP_REVERIFY_ENABLED: process.env.NEXT_PUBLIC_OTP_REVERIFY_ENABLED === 'true' || true,
  DISPUTES_ENABLED: process.env.NEXT_PUBLIC_DISPUTES_ENABLED === 'true' || true,
  TRAINING_HUB_ENABLED: process.env.NEXT_PUBLIC_TRAINING_HUB_ENABLED === 'true' || true,
  PERSONALIZATION_ENABLED: process.env.NEXT_PUBLIC_PERSONALIZATION_ENABLED === 'true' || true,
  SUPPORT_CENTER_ENABLED: process.env.NEXT_PUBLIC_SUPPORT_CENTER_ENABLED === 'true' || true,
  
  // SLA & Automation
  SLA_AUTOMATION_ENABLED: process.env.NEXT_PUBLIC_SLA_AUTOMATION_ENABLED === 'true' || true,
  AUTO_REASSIGN_ENABLED: process.env.NEXT_PUBLIC_AUTO_REASSIGN_ENABLED === 'true' || true,
  
  // Observability & Security
  SENTRY_ENABLED: process.env.NEXT_PUBLIC_SENTRY_ENABLED === 'true' || false,
  AUDIT_LOGS_ENABLED: process.env.NEXT_PUBLIC_AUDIT_LOGS_ENABLED === 'true' || true,
  CSRF_PROTECTION_ENABLED: true, // Always enabled for security
  
  // Performance & A11y
  PERFORMANCE_MONITORING_ENABLED: process.env.NEXT_PUBLIC_PERFORMANCE_MONITORING_ENABLED === 'true' || true,
  ACCESSIBILITY_FEATURES_ENABLED: process.env.NEXT_PUBLIC_ACCESSIBILITY_FEATURES_ENABLED === 'true' || true,
} as const;

// SLA Configuration
export const SLA_CONFIG = {
  PROVIDER_ACCEPT_TIMEOUT_MINUTES: parseInt(process.env.NEXT_PUBLIC_SLA_ACCEPT_TIMEOUT || '15'),
  LATE_THRESHOLD_MINUTES: parseInt(process.env.NEXT_PUBLIC_SLA_LATE_THRESHOLD || '30'),
  AUTO_REASSIGN_ATTEMPTS: parseInt(process.env.NEXT_PUBLIC_SLA_REASSIGN_ATTEMPTS || '3'),
} as const;

// Risk Scoring Configuration
export const RISK_CONFIG = {
  HIGH_RISK_THRESHOLD: 75,
  MEDIUM_RISK_THRESHOLD: 50,
  RATE_LIMIT_BOOKINGS_PER_HOUR: 5,
  RATE_LIMIT_CONTACT_FORMS_PER_HOUR: 3,
  BLACKLIST_CHECK_ENABLED: true,
} as const;

// Performance Budgets
export const PERFORMANCE_BUDGETS = {
  MAX_JS_SIZE_KB: 160,
  MAX_CLS_SCORE: 0.05,
  MAX_IMAGE_SIZE_KB: 200,
  TARGET_LIGHTHOUSE_PERFORMANCE: 90,
  TARGET_LIGHTHOUSE_ACCESSIBILITY: 95,
  TARGET_LIGHTHOUSE_BEST_PRACTICES: 95,
  TARGET_LIGHTHOUSE_SEO: 95,
} as const;

export type FeatureFlag = keyof typeof FEATURE_FLAGS;
export type SLAConfigKey = keyof typeof SLA_CONFIG;
export type RiskConfigKey = keyof typeof RISK_CONFIG;
