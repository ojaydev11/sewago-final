
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define locales directly to avoid Edge Runtime issues  
const locales = ['en', 'ne'] as const;
const defaultLocale = 'en' as const;

export function middleware(request: NextRequest) {
  // Get pathname from request URL
  const pathname = request.nextUrl.pathname;
  
  // Check if pathname already includes a locale
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    const locale = getLocale(request);
    
    // Don't add locale prefix for default locale unless needed
    if (locale === defaultLocale && pathname === '/') {
      return NextResponse.next();
    }
    
    return NextResponse.redirect(
      new URL(`/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`, request.url)
    );
  }
  
  return NextResponse.next();
}

function getLocale(request: NextRequest): string {
  // Try to get locale from Accept-Language header
  const acceptLanguage = request.headers.get('accept-language');
  
  if (acceptLanguage) {
    // Simple locale detection from Accept-Language
    if (acceptLanguage.includes('ne')) return 'ne';
    if (acceptLanguage.includes('en')) return 'en';
  }
  
  return defaultLocale;
}

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(ne|en)/:path*']
};
