import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from './src/lib/rate-limit-adapters';
import { getPolicyForRoute, shouldRateLimitRoute } from './src/lib/rate-policies';
import { getIdentifier, getLogIdentifier, getRequestMetadata } from './src/lib/request-identity';

// Edge runtime configuration
export const runtime = 'edge';

// Matcher configuration to exclude static assets and Next.js internal routes
export const config = {
  matcher: [
    // Match all routes except static assets
    '/((?!.+\\.(?:png|jpg|jpeg|gif|webp|ico|svg|css|js|map|woff|woff2|ttf|eot)$).*)',
    // Match all routes except Next.js internal routes
    '/((?!_next|favicon.ico|sitemap.xml|robots.txt|vercel).*)'
  ]
};

export async function middleware(request: NextRequest): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;
  
  // Skip rate limiting for static assets and internal routes
  if (!shouldRateLimitRoute(pathname)) {
    return null;
  }
  
  try {
    // Get request metadata
    const metadata = getRequestMetadata(request);
    const identifier = metadata.identifier;
    const logIdentifier = metadata.logIdentifier;
    
    // Get rate limit policy for this route
    const policy = getPolicyForRoute(pathname);
    
    // Check rate limit
    const result = await checkRateLimit(identifier, policy);
    
    // Log rate limit check (info level for all, warn for denials)
    const logData = {
      ts: new Date().toISOString(),
      policy: getPolicyName(pathname),
      route: pathname,
      idHash: logIdentifier,
      method: metadata.method,
      success: result.success,
      remaining: result.remaining,
      resetAt: new Date(result.resetTime).toISOString(),
      userAgent: metadata.userAgent.substring(0, 100) // Truncate for log safety
    };
    
    if (result.success) {
      console.log(JSON.stringify({ level: 'info', ...logData }));
    } else {
      console.warn(JSON.stringify({ level: 'warn', ...logData }));
    }
    
    if (!result.success) {
      // Rate limit exceeded - return 429 response
      const retryAfter = result.retryAfter || 0;
      
      const response = new Response(
        JSON.stringify({
          error: 'rate_limited',
          message: 'Too many requests. Please try again later.',
          retryAfter,
          resetTime: new Date(result.resetTime).toISOString(),
          policy: getPolicyName(pathname)
        }),
        {
          status: 429,
          headers: {
            'content-type': 'application/json',
            ...result.headers
          }
        }
      );
      
      return response;
    }
    
    // Rate limit not exceeded - continue with request
    // Add rate limit headers to response
    const response = NextResponse.next();
    
    // Set rate limit headers
    Object.entries(result.headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    return response;
    
  } catch (error) {
    // Log error but don't block the request (fail open)
    console.error('Rate limiting middleware error:', {
      ts: new Date().toISOString(),
      route: pathname,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // Allow request to continue if rate limiting fails
    return null;
  }
}

// Helper function to get policy name for logging
function getPolicyName(pathname: string): string {
  if (pathname.startsWith('/api/auth/')) return 'auth';
  if (pathname.startsWith('/api/messages') || pathname.startsWith('/api/chat')) return 'chatSend';
  if (pathname.startsWith('/api/ai/')) return 'aiHandle';
  if (pathname.startsWith('/api/uploads/')) return 'uploads';
  if (pathname.startsWith('/api/payments/')) return 'payments';
  if (pathname.startsWith('/api/contact') || pathname.startsWith('/api/support')) return 'contact';
  if (pathname.startsWith('/api/reviews') || pathname.startsWith('/api/comments')) return 'reviews';
  if (pathname.startsWith('/api/services') || pathname.startsWith('/api/search')) return 'publicApi';
  return 'default';
}

// Export for testing
export { middleware as rateLimitMiddleware };
