// Re-export the rate limiting utilities
export { 
  type RateLimitResult, 
  type RateLimitPolicy, 
  type RateLimitAdapter,
  MemoryAdapter,
  RedisAdapter,
  getLimiter,
  checkRateLimit
} from './rate-limit-adapters';

// Convenience function for API routes
export async function rateLimit(request: Request, policy?: { limit?: number; windowSec?: number }) {
  const defaultPolicy = {
    limit: 100,
    windowSec: 60,
    ...policy
  };

  // Get client identifier (IP address or user ID)
  const clientId = getClientIdentifier(request);
  
  const { checkRateLimit } = await import('./rate-limit-adapters');
  return await checkRateLimit(clientId, defaultPolicy);
}

// Extract client identifier from request
function getClientIdentifier(request: Request): string {
  // Try to get IP from various headers
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfIp = request.headers.get('cf-connecting-ip');
  
  // Use the first available IP or fallback
  const ip = forwarded?.split(',')[0] || realIp || cfIp || 'unknown';
  return ip.trim();
}

// Rate limit policies for different endpoints
export const AI_RATE_LIMITS = {
  SEARCH_PREDICT: { limit: 60, windowSec: 60 }, // 60 requests per minute
  VOICE_PROCESS: { limit: 30, windowSec: 60 },  // 30 requests per minute  
  SMART_NOTIFICATIONS: { limit: 100, windowSec: 60 }, // 100 requests per minute
  FORM_AUTOFILL: { limit: 120, windowSec: 60 }, // 120 requests per minute
  SEARCH_ANALYTICS: { limit: 20, windowSec: 60 }, // 20 requests per minute
} as const;