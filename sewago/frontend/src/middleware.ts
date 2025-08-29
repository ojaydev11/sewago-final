import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if demos are enabled
  const demosEnabled = process.env.NEXT_PUBLIC_ENABLE_DEMOS === 'true';
  
  // Block demo routes if demos are disabled
  if (!demosEnabled && pathname.startsWith('/demo')) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // everything EXCEPT api, next assets & favicon
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
