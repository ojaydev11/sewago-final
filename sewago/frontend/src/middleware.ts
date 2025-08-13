
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { FEATURE_FLAGS } from '@/config/flags';

// Rate limiting storage (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// CSRF token storage (in production, use secure session storage)
const csrfTokens = new Map<string, { token: string; expires: number }>();

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Apply security headers
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // CSP for production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;"
    );
  }

  // Rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    const rateLimitKey = `${ip}:${pathname}`;
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    let limit = 60; // default 60 requests per minute
    
    // Stricter limits for sensitive endpoints
    if (pathname.includes('/api/auth/') || 
        pathname.includes('/api/support/') ||
        pathname.includes('/api/risk/')) {
      limit = 10; // 10 requests per minute
    }
    
    const current = rateLimitMap.get(rateLimitKey);
    
    if (current && now < current.resetTime) {
      if (current.count >= limit) {
        return new NextResponse(
          JSON.stringify({ error: 'Rate limit exceeded' }),
          { 
            status: 429, 
            headers: { 
              'Content-Type': 'application/json',
              'Retry-After': Math.ceil((current.resetTime - now) / 1000).toString()
            }
          }
        );
      }
      current.count++;
    } else {
      rateLimitMap.set(rateLimitKey, { count: 1, resetTime: now + windowMs });
    }
    
    // Clean up old entries
    if (Math.random() < 0.01) { // 1% chance to clean up
      for (const [key, value] of rateLimitMap.entries()) {
        if (now > value.resetTime) {
          rateLimitMap.delete(key);
        }
      }
    }
  }

  // CSRF protection for state-changing requests
  if (FEATURE_FLAGS.CSRF_PROTECTION_ENABLED && 
      pathname.startsWith('/api/') &&
      ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    
    const csrfToken = request.headers.get('x-csrf-token');
    const sessionToken = await getToken({ req: request });
    
    if (sessionToken) {
      const expectedToken = csrfTokens.get(sessionToken.sub || '');
      const now = Date.now();
      
      if (!expectedToken || 
          expectedToken.token !== csrfToken || 
          now > expectedToken.expires) {
        return new NextResponse(
          JSON.stringify({ error: 'Invalid CSRF token' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
  }

  // Protect admin routes
  if (pathname.startsWith('/admin/')) {
    const token = await getToken({ req: request });
    
    if (!token || token.role !== 'admin') {
      return NextResponse.redirect(new URL('/account/login', request.url));
    }
  }

  // Protect provider routes
  if (pathname.startsWith('/provider/') || pathname.startsWith('/dashboard/provider/')) {
    const token = await getToken({ req: request });
    
    if (!token || !['provider', 'admin'].includes(token.role as string)) {
      return NextResponse.redirect(new URL('/account/login', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
