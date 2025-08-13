import { RateLimitPolicy } from './rate-limit-adapters';

// Rate limit policies for different routes
export const ratePolicies = {
  // Authentication - strict limits to prevent brute force
  auth: { 
    limit: 5, 
    windowSec: 60 
  } as const, // 5 attempts per minute for login/signup
  
  // Chat sending - moderate limits to prevent spam
  chatSend: { 
    limit: 30, 
    windowSec: 60 
  } as const, // 30 messages per minute
  
  // AI handling - moderate limits to prevent abuse
  aiHandle: { 
    limit: 20, 
    windowSec: 60 
  } as const, // 20 AI requests per minute
  
  // File uploads - conservative limits to prevent storage abuse
  uploads: { 
    limit: 10, 
    windowSec: 300 
  } as const, // 10 uploads per 5 minutes
  
  // Public API - generous limits for read operations
  publicApi: { 
    limit: 120, 
    windowSec: 60 
  } as const, // 120 requests per minute for services, search, etc.
  
  // Payment attempts - strict limits to prevent fraud
  payments: { 
    limit: 3, 
    windowSec: 1800 
  } as const, // 3 payment attempts per 30 minutes
  
  // Password reset - very strict to prevent abuse
  passwordReset: { 
    limit: 3, 
    windowSec: 3600 
  } as const, // 3 attempts per hour
  
  // OTP verification - moderate limits
  otp: { 
    limit: 5, 
    windowSec: 600 
  } as const, // 5 attempts per 10 minutes
  
  // Contact form - prevent spam
  contact: { 
    limit: 3, 
    windowSec: 86400 
  } as const, // 3 submissions per day
  
  // Reviews and comments - moderate limits
  reviews: { 
    limit: 10, 
    windowSec: 3600 
  } as const, // 10 reviews per hour
  
  // Default policy for unspecified routes
  default: { 
    limit: 100, 
    windowSec: 60 
  } as const // 100 requests per minute
} as const;

// Type for policy names
export type PolicyName = keyof typeof ratePolicies;

// Route to policy mapping
export const routePolicyMap: Record<string, PolicyName> = {
  // Authentication routes
  '/api/auth/login': 'auth',
  '/api/auth/register': 'auth',
  '/api/auth/logout': 'auth',
  '/api/auth/refresh': 'auth',
  '/api/auth/password-reset': 'passwordReset',
  '/api/auth/otp': 'otp',
  
  // Chat routes
  '/api/messages': 'chatSend',
  '/api/chat': 'chatSend',
  
  // AI routes
  '/api/ai/handle': 'aiHandle',
  '/api/ai/chat': 'aiHandle',
  '/api/ai/process': 'aiHandle',
  
  // Upload routes
  '/api/uploads/sign': 'uploads',
  '/api/uploads/upload': 'uploads',
  '/api/uploads/complete': 'uploads',
  
  // Payment routes
  '/api/payments/create': 'payments',
  '/api/payments/confirm': 'payments',
  '/api/payments/webhook': 'payments',
  
  // Contact and support
  '/api/contact': 'contact',
  '/api/support': 'contact',
  
  // Reviews and comments
  '/api/reviews': 'reviews',
  '/api/comments': 'reviews',
  
  // Public API routes (generous limits)
  '/api/services': 'publicApi',
  '/api/search': 'publicApi',
  '/api/categories': 'publicApi',
  '/api/cities': 'publicApi',
  '/api/providers': 'publicApi',
  '/api/bookings': 'publicApi',
  
  // Health and status endpoints (very generous)
  '/api/health': 'default',
  '/api/status': 'default'
};

// Function to get policy for a route
export function getPolicyForRoute(pathname: string): RateLimitPolicy {
  // Check for exact matches first
  if (routePolicyMap[pathname]) {
    return ratePolicies[routePolicyMap[pathname]];
  }
  
  // Check for path patterns
  for (const [pattern, policyName] of Object.entries(routePolicyMap)) {
    if (pathname.startsWith(pattern)) {
      return ratePolicies[policyName];
    }
  }
  
  // Return default policy
  return ratePolicies.default;
}

// Function to get policy name for a route
export function getPolicyNameForRoute(pathname: string): PolicyName {
  // Check for exact matches first
  if (routePolicyMap[pathname]) {
    return routePolicyMap[pathname];
  }
  
  // Check for path patterns
  for (const [pattern, policyName] of Object.entries(routePolicyMap)) {
    if (pathname.startsWith(pattern)) {
      return policyName;
    }
  }
  
  // Return default policy
  return 'default';
}

// Function to check if a route should be rate limited
export function shouldRateLimitRoute(pathname: string): boolean {
  // Don't rate limit static assets
  if (pathname.match(/\.(png|jpg|jpeg|gif|webp|ico|svg|css|js|map|woff|woff2|ttf|eot)$/)) {
    return false;
  }
  
  // Don't rate limit Next.js internal routes
  if (pathname.startsWith('/_next/') || 
      pathname.startsWith('/api/_next/') ||
      pathname === '/favicon.ico' ||
      pathname === '/sitemap.xml' ||
      pathname === '/robots.txt' ||
      pathname.startsWith('/vercel')) {
    return false;
  }
  
  // Rate limit all other routes
  return true;
}

// Export individual policies for direct use
export const {
  auth,
  chatSend,
  aiHandle,
  uploads,
  publicApi,
  payments,
  passwordReset,
  otp,
  contact,
  reviews,
  default: defaultPolicy
} = ratePolicies;
