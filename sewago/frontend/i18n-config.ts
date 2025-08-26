// Temporarily disabled for deployment to prevent build issues
// import { getRequestConfig } from 'next-intl/server';

// Prevent this config from running during build phase
const config = process.env.NEXT_PHASE === 'phase-production-build'
  ? () => ({ messages: {}, locale: 'en' })
  : () => ({ messages: {}, locale: 'en' });

export default config;

// Legacy code - disabled for deployment
/*
export default getRequestConfig(async ({ locale }) => {
  // Handle undefined or invalid locales gracefully
  if (!locale || !['en', 'ne'].includes(locale)) {
    locale = 'en'; // Default to English
  }
  
  try {
    const messages = (await import(`./messages/${locale}.json`)).default;
    return { 
      messages,
      locale: locale // Explicitly return the locale
    };
  } catch (error) {
    // Fallback to English if the locale file doesn't exist
    console.warn(`Failed to load messages for locale: ${locale}, falling back to English`);
    const fallbackMessages = (await import('./messages/en.json')).default;
    return { 
      messages: fallbackMessages,
      locale: 'en' // Explicitly return the locale
    };
  }
});
*/

export const locales = ['en', 'ne'] as const;
export const defaultLocale = 'en' as const;
