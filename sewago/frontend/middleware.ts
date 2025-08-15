import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n-config';

// Create the internationalization middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always'
});

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  
  // Handle internationalization first
  const response = intlMiddleware(req);
  
  // If the intl middleware handled the request, return it
  if (response) {
    return response;
  }
  
  // Handle authentication for protected routes
  const needAuth = url.pathname.includes('/book') || url.pathname.startsWith('/bookings');
  const isAuthed = req.cookies.get('sg_session');
  
  if (needAuth && !isAuthed) {
    url.pathname = '/signin';
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

export const config = { 
  matcher: [
    // Enable internationalization for all locales
    '/((?!api|_next|_vercel|site.webmanifest|.*\\..*).*)',
    // Also match API routes that need authentication
    '/services/:path*/book',
    '/bookings'
  ]
};
