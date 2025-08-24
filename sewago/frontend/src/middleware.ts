
import createMiddleware from 'next-intl/middleware';

// Define locales directly to avoid imports that might cause Edge Runtime issues
const locales = ['en', 'ne'] as const;
const defaultLocale = 'en' as const;
 
export default createMiddleware({
  // A list of all locales that are supported
  locales,
 
  // Used when no locale matches
  defaultLocale,
  
  // Don't add locale prefix for default locale
  localePrefix: 'as-needed'
});
 
export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(ne|en)/:path*'],
  
  // Explicitly specify Edge Runtime to avoid bundling issues
  runtime: 'edge'
};
