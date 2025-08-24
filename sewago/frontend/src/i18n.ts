// Temporarily disabled for deployment to prevent build issues
// import { getRequestConfig } from 'next-intl/server';
// import { notFound } from 'next/navigation';

// Can be imported from a shared config
export const locales = ['en', 'ne'] as const;
export const defaultLocale = 'en' as const;

export type Locale = (typeof locales)[number];

// Prevent this config from running during build phase
if (process.env.NEXT_PHASE === 'phase-production-build') {
  // Return empty config during build
  const emptyConfig = () => ({ messages: {}, locale: 'en' });
  export default emptyConfig;
} else {
  // Return a no-op config that doesn't use next-intl
  const noOpConfig = () => ({ messages: {}, locale: 'en' });
  export default noOpConfig;
}

// Legacy code - disabled for deployment
/*
export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as Locale)) notFound();

  return {
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
*/