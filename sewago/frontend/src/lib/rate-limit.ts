interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessfulRequests?: boolean; // Skip rate limiting for successful requests
  skipFailedRequests?: boolean; // Skip rate limiting for failed requests
  keyGenerator?: (req: any) => string; // Custom key generator
  handler?: (req: any, res: any) => void; // Custom handler for rate limit exceeded
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = {
      windowMs: 15 * 60 * 1000, // 15 minutes default
      maxRequests: 100, // 100 requests per window default
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      ...config,
    };
  }

  /**
   * Check if request is within rate limit
   */
  check(key: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // Clean up expired entries
    this.cleanup();

    // Get or create rate limit entry
    if (!this.store[key] || this.store[key].resetTime < now) {
      this.store[key] = {
        count: 0,
        resetTime: now + this.config.windowMs,
      };
    }

    const entry = this.store[key];
    const remaining = Math.max(0, this.config.maxRequests - entry.count);

    if (entry.count >= this.config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
      };
    }

    // Increment count
    entry.count++;

    return {
      allowed: true,
      remaining: remaining - 1,
      resetTime: entry.resetTime,
    };
  }

  /**
   * Reset rate limit for a specific key
   */
  reset(key: string): void {
    delete this.store[key];
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    Object.keys(this.store).forEach((key) => {
      if (this.store[key].resetTime < windowStart) {
        delete this.store[key];
      }
    });
  }

  /**
   * Get current rate limit status for a key
   */
  getStatus(key: string): { count: number; remaining: number; resetTime: number } | null {
    const entry = this.store[key];
    if (!entry) {
      return null;
    }

    return {
      count: entry.count,
      remaining: Math.max(0, this.config.maxRequests - entry.count),
      resetTime: entry.resetTime,
    };
  }

  /**
   * Get store statistics
   */
  getStats(): { totalKeys: number; totalRequests: number } {
    const totalKeys = Object.keys(this.store).length;
    const totalRequests = Object.values(this.store).reduce((sum, entry) => sum + entry.count, 0);

    return { totalKeys, totalRequests };
  }
}

// Default rate limiter instances
export const defaultRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per window
});

export const strictRateLimiter = new RateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  maxRequests: 10, // 10 requests per minute
});

export const authRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 auth attempts per 15 minutes
});

// Rate limiting middleware for Next.js API routes
export function withRateLimit(
  handler: Function,
  rateLimiter: RateLimiter = defaultRateLimiter,
  keyGenerator?: (req: any) => string
) {
  return async (req: any, res: any) => {
    try {
      // Generate rate limit key
      const key = keyGenerator ? keyGenerator(req) : getDefaultKey(req);
      
      // Check rate limit
      const rateLimit = rateLimiter.check(key);
      
      if (!rateLimit.allowed) {
        res.setHeader('X-RateLimit-Limit', rateLimiter['config'].maxRequests);
        res.setHeader('X-RateLimit-Remaining', rateLimit.remaining);
        res.setHeader('X-RateLimit-Reset', rateLimit.resetTime);
        res.setHeader('Retry-After', Math.ceil((rateLimit.resetTime - Date.now()) / 1000));
        
        return res.status(429).json({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
        });
      }

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', rateLimiter['config'].maxRequests);
      res.setHeader('X-RateLimit-Remaining', rateLimit.remaining);
      res.setHeader('X-RateLimit-Reset', rateLimit.resetTime);

      // Call the original handler
      return handler(req, res);
    } catch (error) {
      console.error('Rate limiting error:', error);
      // If rate limiting fails, allow the request to proceed
      return handler(req, res);
    }
  };
}

// Default key generator
function getDefaultKey(req: any): string {
  // Use IP address as default key
  const ip = req.headers['x-forwarded-for'] || 
             req.headers['x-real-ip'] || 
             req.connection?.remoteAddress || 
             req.socket?.remoteAddress || 
             'unknown';
  
  return `rate_limit:${ip}`;
}

// Custom key generators
export const keyGenerators = {
  // Rate limit by IP address
  byIP: (req: any) => `rate_limit:ip:${getDefaultKey(req)}`,
  
  // Rate limit by user ID (if authenticated)
  byUser: (req: any) => {
    const userId = req.session?.user?.id || 'anonymous';
    return `rate_limit:user:${userId}`;
  },
  
  // Rate limit by API key
  byAPIKey: (req: any) => {
    const apiKey = req.headers['x-api-key'] || 'no-key';
    return `rate_limit:api:${apiKey}`;
  },
  
  // Rate limit by endpoint
  byEndpoint: (req: any) => {
    const endpoint = req.url || req.path || 'unknown';
    const ip = getDefaultKey(req);
    return `rate_limit:endpoint:${endpoint}:${ip}`;
  },
};

// Utility functions
export function createRateLimiter(config: RateLimitConfig): RateLimiter {
  return new RateLimiter(config);
}

export function isRateLimited(key: string, rateLimiter: RateLimiter = defaultRateLimiter): boolean {
  const result = rateLimiter.check(key);
  return !result.allowed;
}

export function getRateLimitStatus(key: string, rateLimiter: RateLimiter = defaultRateLimiter) {
  return rateLimiter.getStatus(key);
}

export function resetRateLimit(key: string, rateLimiter: RateLimiter = defaultRateLimiter): void {
  rateLimiter.reset(key);
}
