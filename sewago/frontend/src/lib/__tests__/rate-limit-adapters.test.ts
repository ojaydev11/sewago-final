import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  MemoryAdapter, 
  RedisAdapter, 
  getLimiter, 
  checkRateLimit,
  type RateLimitResult,
  type RateLimitPolicy
} from '../rate-limit-adapters';

// Mock Redis for testing
vi.mock('@upstash/redis', () => ({
  Redis: vi.fn().mockImplementation(() => ({
    pipeline: vi.fn().mockReturnValue({
      incr: vi.fn().mockReturnThis(),
      expire: vi.fn().mockReturnThis(),
      exec: vi.fn().mockResolvedValue([1, 1])
    }),
    del: vi.fn().mockResolvedValue(1)
  }))
}));

describe('Rate Limit Adapters', () => {
  describe('MemoryAdapter', () => {
    let adapter: MemoryAdapter;

    beforeEach(() => {
      adapter = new MemoryAdapter();
    });

    afterEach(() => {
      adapter.destroy();
    });

    it('should allow requests within limit', async () => {
      const policy: RateLimitPolicy = { limit: 5, windowSec: 60 };
      const identifier = 'test:user1';

      // Make 5 requests (within limit)
      for (let i = 0; i < 5; i++) {
        const result = await adapter.checkLimit(identifier, policy);
        expect(result.success).toBe(true);
        expect(result.remaining).toBe(4 - i);
        expect(result.limit).toBe(5);
        expect(result.headers).toBeDefined();
        expect(result.headers['X-RateLimit-Limit']).toBe('5');
      }
    });

    it('should block requests after limit is exceeded', async () => {
      const policy: RateLimitPolicy = { limit: 3, windowSec: 60 };
      const identifier = 'test:user2';

      // Make 3 requests (at limit)
      for (let i = 0; i < 3; i++) {
        const result = await adapter.checkLimit(identifier, policy);
        expect(result.success).toBe(true);
      }

      // 4th request should be blocked
      const blockedResult = await adapter.checkLimit(identifier, policy);
      expect(blockedResult.success).toBe(false);
      expect(blockedResult.remaining).toBe(0);
      expect(blockedResult.retryAfter).toBeGreaterThan(0);
      expect(blockedResult.headers['Retry-After']).toBeDefined();
    });

    it('should reset after window expires', async () => {
      const policy: RateLimitPolicy = { limit: 2, windowSec: 1 }; // 1 second for testing
      const identifier = 'test:user3';

      // Make 2 requests
      await adapter.checkLimit(identifier, policy);
      await adapter.checkLimit(identifier, policy);

      // 3rd request should be blocked
      const blockedResult = await adapter.checkLimit(identifier, policy);
      expect(blockedResult.success).toBe(false);

      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Request should be allowed again
      const allowedResult = await adapter.checkLimit(identifier, policy);
      expect(allowedResult.success).toBe(true);
      expect(allowedResult.remaining).toBe(1);
    });

    it('should generate correct headers', async () => {
      const policy: RateLimitPolicy = { limit: 10, windowSec: 60 };
      const identifier = 'test:headers';

      const result = await adapter.checkLimit(identifier, policy);

      expect(result.headers['X-RateLimit-Limit']).toBe('10');
      expect(result.headers['X-RateLimit-Remaining']).toBe('9');
      expect(result.headers['X-RateLimit-Reset']).toBeDefined();
    });

    it('should reset rate limit for specific identifier', async () => {
      const policy: RateLimitPolicy = { limit: 2, windowSec: 60 };
      const identifier = 'test:reset';

      // Make a request
      await adapter.checkLimit(identifier, policy);

      // Reset the rate limit
      const resetResult = await adapter.resetLimit(identifier, policy);
      expect(resetResult).toBe(true);

      // Check that it's reset by making another request
      const result = await adapter.checkLimit(identifier, policy);
      expect(result.remaining).toBe(1); // Should start fresh
    });
  });

  describe('RedisAdapter', () => {
    let adapter: RedisAdapter;

    beforeEach(() => {
      // Set environment variables for testing
      process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io';
      process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';
      
      adapter = new RedisAdapter();
    });

    afterEach(() => {
      delete process.env.UPSTASH_REDIS_REST_URL;
      delete process.env.UPSTASH_REDIS_REST_TOKEN;
    });

    it('should throw error if Redis credentials are missing', () => {
      delete process.env.UPSTASH_REDIS_REST_URL;
      delete process.env.UPSTASH_REDIS_REST_TOKEN;
      
      expect(() => new RedisAdapter()).toThrow(
        'UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set for Redis adapter'
      );
    });

    it('should check rate limit with Redis', async () => {
      const policy: RateLimitPolicy = { limit: 5, windowSec: 60 };
      const identifier = 'test:redis';

      const result = await adapter.checkLimit(identifier, policy);
      
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(4);
      expect(result.limit).toBe(5);
      expect(result.headers).toBeDefined();
    });

    it('should reset rate limit with Redis', async () => {
      const policy: RateLimitPolicy = { limit: 5, windowSec: 60 };
      const identifier = 'test:redis-reset';

      const result = await adapter.resetLimit(identifier, policy);
      expect(result).toBe(true);
    });
  });

  describe('getLimiter Factory', () => {
    it('should return MemoryAdapter when Redis credentials are not set', () => {
      delete process.env.UPSTASH_REDIS_REST_URL;
      delete process.env.UPSTASH_REDIS_REST_TOKEN;
      
      const limiter = getLimiter();
      expect(limiter).toBeInstanceOf(MemoryAdapter);
    });

    it('should return RedisAdapter when Redis credentials are set', () => {
      process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io';
      process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';
      
      const limiter = getLimiter();
      expect(limiter).toBeInstanceOf(RedisAdapter);
      
      // Clean up
      delete process.env.UPSTASH_REDIS_REST_URL;
      delete process.env.UPSTASH_REDIS_REST_TOKEN;
    });
  });

  describe('checkRateLimit Helper', () => {
    it('should check rate limit with appropriate adapter', async () => {
      const policy: RateLimitPolicy = { limit: 10, windowSec: 60 };
      const identifier = 'test:helper';

      const result = await checkRateLimit(identifier, policy);
      
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(9);
      expect(result.limit).toBe(10);
      expect(result.headers).toBeDefined();
    });

    it('should handle errors gracefully and fail open', async () => {
      const policy: RateLimitPolicy = { limit: 10, windowSec: 60 };
      const identifier = 'test:error';

      // Mock a failure scenario
      const originalGetLimiter = getLimiter;
      vi.stubGlobal('getLimiter', vi.fn().mockImplementation(() => ({
        checkLimit: vi.fn().mockRejectedValue(new Error('Test error'))
      })));

      const result = await checkRateLimit(identifier, policy);
      
      // Should fail open - allow request
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(10);

      // Restore original function
      vi.unstubAllGlobals();
    });
  });

  describe('Edge Cases', () => {
    let adapter: MemoryAdapter;

    beforeEach(() => {
      adapter = new MemoryAdapter();
    });

    afterEach(() => {
      adapter.destroy();
    });

    it('should handle zero limit', async () => {
      const policy: RateLimitPolicy = { limit: 0, windowSec: 60 };
      const identifier = 'test:zero';

      const result = await adapter.checkLimit(identifier, policy);
      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should handle very large window', async () => {
      const policy: RateLimitPolicy = { limit: 1, windowSec: 365 * 24 * 60 * 60 }; // 1 year
      const identifier = 'test:large-window';

      const result = await adapter.checkLimit(identifier, policy);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(0);
    });

    it('should handle concurrent requests', async () => {
      const policy: RateLimitPolicy = { limit: 5, windowSec: 60 };
      const identifier = 'test:concurrent';

      // Make multiple concurrent requests
      const promises = Array.from({ length: 10 }, () => 
        adapter.checkLimit(identifier, policy)
      );

      const results = await Promise.all(promises);

      // Count successful and failed requests
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      expect(successful).toBe(5);
      expect(failed).toBe(5);
    });
  });

  describe('Header Generation', () => {
    let adapter: MemoryAdapter;

    beforeEach(() => {
      adapter = new MemoryAdapter();
    });

    afterEach(() => {
      adapter.destroy();
    });

    it('should generate correct headers for successful requests', async () => {
      const policy: RateLimitPolicy = { limit: 10, windowSec: 60 };
      const identifier = 'test:headers-success';

      const result = await adapter.checkLimit(identifier, policy);

      expect(result.headers['X-RateLimit-Limit']).toBe('10');
      expect(result.headers['X-RateLimit-Remaining']).toBe('9');
      expect(result.headers['X-RateLimit-Reset']).toBeDefined();
    });

    it('should generate correct headers for blocked requests', async () => {
      const policy: RateLimitPolicy = { limit: 1, windowSec: 60 };
      const identifier = 'test:headers-blocked';

      // First request should succeed
      await adapter.checkLimit(identifier, policy);

      // Second request should be blocked
      const result = await adapter.checkLimit(identifier, policy);

      expect(result.success).toBe(false);
      expect(result.headers['X-RateLimit-Limit']).toBe('1');
      expect(result.headers['X-RateLimit-Remaining']).toBe('0');
      expect(result.headers['Retry-After']).toBeDefined();
    });
  });
});
