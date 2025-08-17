import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './src/i18n';

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
    '/',
    '/(en|ne)/:path*',
    '/services/:path*/book',
    '/bookings'
  ]
};
