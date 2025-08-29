import { Redis } from '@upstash/redis';

// Rate limit result interface
export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
  headers: Record<string, string>;
}

// Rate limit policy interface
export interface RateLimitPolicy {
  limit: number;
  windowSec: number;
}

// Base adapter interface
export interface RateLimitAdapter {
  checkLimit(identifier: string, policy: RateLimitPolicy): Promise<RateLimitResult>;
  resetLimit(identifier: string, policy: RateLimitPolicy): Promise<boolean>;
}

// In-memory adapter for local development
export class MemoryAdapter implements RateLimitAdapter {
  private store = new Map<string, { count: number; resetTime: number }>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.store.entries()) {
        if (entry.resetTime < now) {
          this.store.delete(key);
        }
      }
    }, 60000);
  }

  async checkLimit(identifier: string, policy: RateLimitPolicy): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = Math.floor(now / (policy.windowSec * 1000)) * (policy.windowSec * 1000);
    const key = `${identifier}:${windowStart}`;
    
    const entry = this.store.get(key);
    
    if (!entry || entry.resetTime < now) {
      // Create new entry or reset expired one
      const newEntry = {
        count: 1,
        resetTime: windowStart + (policy.windowSec * 1000)
      };
      this.store.set(key, newEntry);
      
      return {
        success: true,
        limit: policy.limit,
        remaining: policy.limit - 1,
        resetTime: newEntry.resetTime,
        headers: this.generateHeaders(policy.limit, policy.limit - 1, newEntry.resetTime)
      };
    }

    if (entry.count >= policy.limit) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      return {
        success: false,
        limit: policy.limit,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter,
        headers: this.generateHeaders(policy.limit, 0, entry.resetTime, retryAfter)
      };
    }

    entry.count++;
    
    return {
      success: true,
      limit: policy.limit,
      remaining: policy.limit - entry.count,
      resetTime: entry.resetTime,
      headers: this.generateHeaders(policy.limit, policy.limit - entry.count, entry.resetTime)
    };
  }

  async resetLimit(identifier: string, policy: RateLimitPolicy): Promise<boolean> {
    const now = Date.now();
    const windowStart = Math.floor(now / (policy.windowSec * 1000)) * (policy.windowSec * 1000);
    const key = `${identifier}:${windowStart}`;
    
    return this.store.delete(key);
  }

  private generateHeaders(limit: number, remaining: number, resetTime: number, retryAfter?: number): Record<string, string> {
    // Ensure resetTime is a valid number
    const validResetTime = Math.max(resetTime, Date.now() + 1000);
    
    const headers: Record<string, string> = {
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': new Date(validResetTime).toISOString()
    };
    
    if (retryAfter !== undefined) {
      headers['Retry-After'] = retryAfter.toString();
    }
    
    return headers;
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.store.clear();
  }
}

// Redis adapter for production using Upstash
export class RedisAdapter implements RateLimitAdapter {
  private redis: Redis;

  constructor() {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    
    if (!url || !token) {
      throw new Error('UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set for Redis adapter');
    }
    
    this.redis = new Redis({
      url,
      token
    });
  }

  async checkLimit(identifier: string, policy: RateLimitPolicy): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = Math.floor(now / (policy.windowSec * 1000)) * (policy.windowSec * 1000);
    const key = `rl:${identifier}:${windowStart}`;
    
    try {
      // Use Redis pipeline for atomic operations
      const pipeline = this.redis.pipeline();
      
      // Increment the counter
      pipeline.incr(key);
      
      // Set expiry if key doesn't exist
      pipeline.expire(key, policy.windowSec);
      
      // Execute pipeline
      const results = await pipeline.exec();
      
      if (!results || results.length < 2) {
        throw new Error('Redis pipeline failed');
      }
      
      const count = results[0] as number;
      const resetTime = windowStart + (policy.windowSec * 1000);
      
      if (count > policy.limit) {
        const retryAfter = Math.ceil((resetTime - now) / 1000);
        return {
          success: false,
          limit: policy.limit,
          remaining: 0,
          resetTime,
          retryAfter,
          headers: this.generateHeaders(policy.limit, 0, resetTime, retryAfter)
        };
      }
      
      return {
        success: true,
        limit: policy.limit,
        remaining: policy.limit - count,
        resetTime,
        headers: this.generateHeaders(policy.limit, policy.limit - count, resetTime)
      };
      
    } catch (error) {
      console.error('Redis rate limiting error:', error);
      // Fail open - allow request if Redis fails
      return {
        success: true,
        limit: policy.limit,
        remaining: policy.limit,
        resetTime: now + (policy.windowSec * 1000),
        headers: this.generateHeaders(policy.limit, policy.limit, now + (policy.windowSec * 1000))
      };
    }
  }

  async resetLimit(identifier: string, policy: RateLimitPolicy): Promise<boolean> {
    try {
      const now = Date.now();
      const windowStart = Math.floor(now / (policy.windowSec * 1000)) * (policy.windowSec * 1000);
      const key = `rl:${identifier}:${windowStart}`;
      
      const result = await this.redis.del(key);
      return result > 0;
    } catch (error) {
      console.error('Redis reset error:', error);
      return false;
    }
  }

  private generateHeaders(limit: number, remaining: number, resetTime: number, retryAfter?: number): Record<string, string> {
    // Ensure resetTime is a valid number
    const validResetTime = Math.max(resetTime, Date.now() + 1000);
    
    const headers: Record<string, string> = {
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': new Date(validResetTime).toISOString()
    };
    
    if (retryAfter !== undefined) {
      headers['Retry-After'] = retryAfter.toString();
    }
    
    return headers;
  }
}

// Factory function to get the appropriate adapter
export function getLimiter(): RateLimitAdapter {
  // Always use memory adapter for client-side, Redis is handled server-side via API
  return new MemoryAdapter();
}

// Helper function to get rate limit result with proper error handling
export async function checkRateLimit(
  identifier: string, 
  policy: RateLimitPolicy
): Promise<RateLimitResult> {
  try {
    const limiter = getLimiter();
    return await limiter.checkLimit(identifier, policy);
  } catch (error) {
    console.error('Rate limiting error:', error);
    // Fail open - allow request if rate limiting fails
    return {
      success: true,
      limit: policy.limit,
      remaining: policy.limit,
      resetTime: Date.now() + (policy.windowSec * 1000),
      headers: {
        'X-RateLimit-Limit': policy.limit.toString(),
        'X-RateLimit-Remaining': policy.limit.toString(),
        'X-RateLimit-Reset': new Date(Date.now() + (policy.windowSec * 1000)).toISOString()
      }
    };
  }
}
