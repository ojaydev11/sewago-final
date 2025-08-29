<<<<<<< HEAD
export const locales = ['en','ne'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';
=======
// Temporarily disabled for deployment to prevent build issues
// import { getRequestConfig } from 'next-intl/server';
// import { notFound } from 'next/navigation';

// Can be imported from a shared config
export const locales = ['en', 'ne'] as const;
export const defaultLocale = 'en' as const;

export type Locale = (typeof locales)[number];

// Prevent this config from running during build phase
const getConfig = () => {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    // Return empty config during build
    return { messages: {}, locale: 'en' };
  } else {
    // Return a no-op config that doesn't use next-intl
    return { messages: {}, locale: 'en' };
  }
};

export default getConfig;

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
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
