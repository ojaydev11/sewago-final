import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from './lib/rate-limit';

// Rate limit configuration for different endpoints
const RATE_LIMIT_CONFIG = {
  // API endpoints
  '/api/auth/login': { limit: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  '/api/auth/register': { limit: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
  '/api/auth/password-reset': { limit: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
  '/api/auth/otp': { limit: 5, windowMs: 10 * 60 * 1000 }, // 5 attempts per 10 minutes
  
  // Search and queries
  '/api/search': { limit: 50, windowMs: 5 * 60 * 1000 }, // 50 searches per 5 minutes
  '/api/services': { limit: 100, windowMs: 15 * 60 * 1000 }, // 100 requests per 15 minutes
  
  // Booking and payments
  '/api/bookings': { limit: 20, windowMs: 60 * 60 * 1000 }, // 20 bookings per hour
  '/api/payments': { limit: 10, windowMs: 30 * 60 * 1000 }, // 10 payment attempts per 30 minutes
  
  // File uploads
  '/api/upload': { limit: 10, windowMs: 60 * 60 * 1000 }, // 10 uploads per hour
  
  // Contact and support
  '/api/contact': { limit: 3, windowMs: 24 * 60 * 60 * 1000 }, // 3 submissions per day
  '/api/support': { limit: 5, windowMs: 60 * 60 * 1000 }, // 5 requests per hour
  
  // Comments and reviews
  '/api/reviews': { limit: 10, windowMs: 60 * 60 * 1000 }, // 10 reviews per hour
  '/api/comments': { limit: 20, windowMs: 60 * 60 * 1000 }, // 20 comments per hour
  
  // Default rate limit for all other API endpoints
  'default': { limit: 100, windowMs: 15 * 60 * 1000 } // 100 requests per 15 minutes
};

// Get rate limit configuration for a specific path
function getRateLimitConfig(path: string): { limit: number; windowMs: number } {
  // Check for exact path matches first
  if (RATE_LIMIT_CONFIG[path as keyof typeof RATE_LIMIT_CONFIG]) {
    return RATE_LIMIT_CONFIG[path as keyof typeof RATE_LIMIT_CONFIG];
  }
  
  // Check for path patterns
  for (const [pattern, config] of Object.entries(RATE_LIMIT_CONFIG)) {
    if (pattern === 'default') continue;
    
    if (path.startsWith(pattern)) {
      return config;
    }
  }
  
  // Return default configuration
  return RATE_LIMIT_CONFIG.default;
}

// Generate identifier for rate limiting
function generateIdentifier(req: NextRequest): string {
<<<<<<< HEAD
  const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
=======
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
  const userAgent = req.headers.get('user-agent') || 'unknown';
  const path = req.nextUrl.pathname;
  
  // For authenticated users, use their ID if available
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // In a real implementation, you'd decode the JWT to get the user ID
    // For now, we'll use a hash of the token
    const token = authHeader.substring(7);
    const userId = Buffer.from(token).toString('base64').substring(0, 8);
    return `user:${userId}:${path}`;
  }
  
  // For unauthenticated users, use IP + user agent + path
  return `ip:${ip}:${Buffer.from(userAgent).toString('base64').substring(0, 8)}:${path}`;
}

// Rate limiting middleware
export async function rateLimitMiddleware(req: NextRequest): Promise<NextResponse | null> {
  // Only apply rate limiting to API routes
  if (!req.nextUrl.pathname.startsWith('/api/')) {
    return null;
  }
  
  try {
    const path = req.nextUrl.pathname;
    const config = getRateLimitConfig(path);
    const identifier = generateIdentifier(req);
    
    // Apply rate limiting
<<<<<<< HEAD
    const result = await rateLimit(identifier, config.limit, config.windowMs);
=======
    const result = await rateLimit(req as unknown as Request, { limit: config.limit, windowSec: Math.floor(config.windowMs / 1000) });
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
    
    if (!result.success) {
      // Rate limit exceeded
      const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
      
      const response = NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
          retryAfter,
          resetTime: new Date(result.resetTime).toISOString()
        },
        { status: 429 }
      );
      
      // Add rate limit headers
      response.headers.set('X-RateLimit-Limit', config.limit.toString());
      response.headers.set('X-RateLimit-Remaining', '0');
      response.headers.set('X-RateLimit-Reset', new Date(result.resetTime).toISOString());
      response.headers.set('Retry-After', retryAfter.toString());
      
      return response;
    }
    
    // Rate limit not exceeded, continue with request
    // Add rate limit headers to response
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', config.limit.toString());
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(result.resetTime).toISOString());
    
    return response;
    
  } catch (error) {
    console.error('Rate limiting error:', error);
    // If rate limiting fails, allow the request to continue
    // This prevents rate limiting from breaking the application
    return null;
  }
}

// Enhanced middleware with more granular control
export async function advancedRateLimitMiddleware(req: NextRequest): Promise<NextResponse | null> {
  // Only apply rate limiting to API routes
  if (!req.nextUrl.pathname.startsWith('/api/')) {
    return null;
  }
  
  try {
    const path = req.nextUrl.pathname;
    const method = req.method;
    const config = getRateLimitConfig(path);
    
    // Adjust limits based on HTTP method
    let adjustedLimit = config.limit;
    let adjustedWindow = config.windowMs;
    
    if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
      // More restrictive for state-changing operations
      adjustedLimit = Math.floor(config.limit * 0.5);
      adjustedWindow = Math.floor(config.windowMs * 1.5);
    } else if (method === 'GET') {
      // More permissive for read operations
      adjustedLimit = Math.floor(config.limit * 1.2);
    }
    
    const identifier = generateIdentifier(req);
<<<<<<< HEAD
    const result = await rateLimit(identifier, adjustedLimit, adjustedWindow);
=======
    const result = await rateLimit(req as unknown as Request, { limit: adjustedLimit, windowSec: Math.floor(adjustedWindow / 1000) });
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
    
    if (!result.success) {
      const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
      
      // Different error messages based on the type of rate limit
      let errorMessage = 'Too many requests. Please try again later.';
      if (path.includes('/auth/')) {
        errorMessage = 'Too many authentication attempts. Please wait before trying again.';
      } else if (path.includes('/upload/')) {
        errorMessage = 'Too many file uploads. Please wait before uploading more files.';
      } else if (path.includes('/payment/')) {
        errorMessage = 'Too many payment attempts. Please wait before trying again.';
      }
      
      const response = NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: errorMessage,
          retryAfter,
          resetTime: new Date(result.resetTime).toISOString(),
          type: 'rate_limit_exceeded'
        },
        { status: 429 }
      );
      
      // Add rate limit headers
      response.headers.set('X-RateLimit-Limit', adjustedLimit.toString());
      response.headers.set('X-RateLimit-Remaining', '0');
      response.headers.set('X-RateLimit-Reset', new Date(result.resetTime).toISOString());
      response.headers.set('Retry-After', retryAfter.toString());
      
      return response;
    }
    
    // Rate limit not exceeded, continue with request
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', adjustedLimit.toString());
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(result.resetTime).toISOString());
    
    return response;
    
  } catch (error) {
    console.error('Advanced rate limiting error:', error);
    // If rate limiting fails, allow the request to continue
    return null;
  }
}

// Export the middleware function for use in Next.js
export default rateLimitMiddleware;
