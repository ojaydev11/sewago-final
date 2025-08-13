import { 
  rateLimit, 
  rateLimitWithConfig, 
  isRateLimitExceeded, 
  getRetryDelay, 
  getRateLimitHeaders,
  resetRateLimit,
  getRateLimitStatus,
  getAllRateLimits,
  cleanupExpiredEntries,
  shutdownRateLimit
} from '../rate-limit';

describe('Rate Limiting System', () => {
  beforeEach(() => {
    // Reset the rate limit store before each test
    shutdownRateLimit();
  });

  afterEach(() => {
    // Clean up after each test
    shutdownRateLimit();
  });

  describe('Basic Rate Limiting', () => {
    it('should allow requests within limit', async () => {
      const identifier = 'test:user1';
      const limit = 5;
      const windowMs = 1000; // 1 second

      // Make 5 requests (within limit)
      for (let i = 0; i < 5; i++) {
        const result = await rateLimit(identifier, limit, windowMs);
        expect(result.success).toBe(true);
        expect(result.remaining).toBe(4 - i);
        expect(result.limit).toBe(limit);
      }
    });

    it('should block requests after limit is exceeded', async () => {
      const identifier = 'test:user2';
      const limit = 3;
      const windowMs = 1000; // 1 second

      // Make 3 requests (at limit)
      for (let i = 0; i < 3; i++) {
        const result = await rateLimit(identifier, limit, windowMs);
        expect(result.success).toBe(true);
      }

      // 4th request should be blocked
      const blockedResult = await rateLimit(identifier, limit, windowMs);
      expect(blockedResult.success).toBe(false);
      expect(blockedResult.remaining).toBe(0);
      expect(blockedResult.retryAfter).toBeGreaterThan(0);
    });

    it('should reset after window expires', async () => {
      const identifier = 'test:user3';
      const limit = 2;
      const windowMs = 100; // 100ms for faster testing

      // Make 2 requests
      await rateLimit(identifier, limit, windowMs);
      await rateLimit(identifier, limit, windowMs);

      // 3rd request should be blocked
      const blockedResult = await rateLimit(identifier, limit, windowMs);
      expect(blockedResult.success).toBe(false);

      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 150));

      // Request should be allowed again
      const allowedResult = await rateLimit(identifier, limit, windowMs);
      expect(allowedResult.success).toBe(true);
      expect(allowedResult.remaining).toBe(1);
    });
  });

  describe('Rate Limiting with Configuration', () => {
    it('should work with configuration object', async () => {
      const config = {
        limit: 3,
        windowMs: 1000,
        identifier: 'test:config',
        skipSuccessfulRequests: false,
        skipFailedRequests: false
      };

      const result = await rateLimitWithConfig(config);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(2);
    });

    it('should handle errors gracefully', async () => {
      const config = {
        limit: 3,
        windowMs: 1000
      };

      // Mock a failure scenario
      const originalRateLimit = rateLimit;
      (global as any).rateLimit = jest.fn().mockRejectedValue(new Error('Test error'));

      const result = await rateLimitWithConfig(config);
      expect(result.success).toBe(true); // Should fail open

      // Restore original function
      (global as any).rateLimit = originalRateLimit;
    });
  });

  describe('Utility Functions', () => {
    it('should correctly identify rate limit exceeded', () => {
      const exceededResult = { success: false, limit: 5, remaining: 0, resetTime: Date.now() + 1000 };
      const allowedResult = { success: true, limit: 5, remaining: 3, resetTime: Date.now() + 1000 };

      expect(isRateLimitExceeded(exceededResult)).toBe(true);
      expect(isRateLimitExceeded(allowedResult)).toBe(false);
    });

    it('should return correct retry delay', () => {
      const result = { 
        success: false, 
        limit: 5, 
        remaining: 0, 
        resetTime: Date.now() + 5000,
        retryAfter: 5
      };

      expect(getRetryDelay(result)).toBe(5);
    });

    it('should return rate limit headers', () => {
      const result = {
        success: true,
        limit: 10,
        remaining: 7,
        resetTime: Date.now() + 1000,
        headers: {
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': '7'
        }
      };

      const headers = getRateLimitHeaders(result);
      expect(headers['X-RateLimit-Limit']).toBe('10');
      expect(headers['X-RateLimit-Remaining']).toBe('7');
    });
  });

  describe('Rate Limit Management', () => {
    it('should reset rate limit for specific identifier', async () => {
      const identifier = 'test:reset';
      const limit = 2;
      const windowMs = 1000;

      // Make a request
      await rateLimit(identifier, limit, windowMs);

      // Check that entry exists
      const status = getRateLimitStatus(identifier);
      expect(status).not.toBeNull();

      // Reset the rate limit
      const resetResult = resetRateLimit(identifier);
      expect(resetResult).toBe(true);

      // Check that entry is gone
      const statusAfterReset = getRateLimitStatus(identifier);
      expect(statusAfterReset).toBeNull();
    });

    it('should get rate limit status', async () => {
      const identifier = 'test:status';
      const limit = 3;
      const windowMs = 1000;

      // Make a request
      const result = await rateLimit(identifier, limit, windowMs);

      // Get status
      const status = getRateLimitStatus(identifier);
      expect(status).not.toBeNull();
      expect(status?.count).toBe(1);
      expect(status?.resetTime).toBe(result.resetTime);
    });

    it('should get all active rate limits', async () => {
      const identifiers = ['test:all1', 'test:all2', 'test:all3'];
      const limit = 2;
      const windowMs = 1000;

      // Create rate limits for multiple identifiers
      for (const identifier of identifiers) {
        await rateLimit(identifier, limit, windowMs);
      }

      const allLimits = getAllRateLimits();
      expect(allLimits.size).toBeGreaterThanOrEqual(identifiers.length);

      // Check that our test identifiers are present
      for (const identifier of identifiers) {
        expect(allLimits.has(identifier)).toBe(true);
      }
    });
  });

  describe('Cleanup and Memory Management', () => {
    it('should cleanup expired entries', async () => {
      const identifier = 'test:cleanup';
      const limit = 1;
      const windowMs = 50; // Very short window for testing

      // Make a request
      await rateLimit(identifier, limit, windowMs);

      // Wait for it to expire
      await new Promise(resolve => setTimeout(resolve, 100));

      // Check that entry is expired
      const status = getRateLimitStatus(identifier);
      expect(status).toBeNull();

      // Cleanup should remove expired entries
      const deletedCount = cleanupExpiredEntries();
      expect(deletedCount).toBeGreaterThanOrEqual(0);
    });

    it('should handle graceful shutdown', () => {
      const identifier = 'test:shutdown';
      const limit = 1;
      const windowMs = 1000;

      // Create a rate limit
      rateLimit(identifier, limit, windowMs);

      // Check that it exists
      const status = getRateLimitStatus(identifier);
      expect(status).not.toBeNull();

      // Shutdown
      shutdownRateLimit();

      // Check that it's gone
      const statusAfterShutdown = getRateLimitStatus(identifier);
      expect(statusAfterShutdown).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero limit', async () => {
      const identifier = 'test:zero';
      const limit = 0;
      const windowMs = 1000;

      const result = await rateLimit(identifier, limit, windowMs);
      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should handle very large window', async () => {
      const identifier = 'test:large-window';
      const limit = 1;
      const windowMs = 365 * 24 * 60 * 60 * 1000; // 1 year

      const result = await rateLimit(identifier, limit, windowMs);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(0);
    });

    it('should handle concurrent requests', async () => {
      const identifier = 'test:concurrent';
      const limit = 5;
      const windowMs = 1000;

      // Make multiple concurrent requests
      const promises = Array.from({ length: 10 }, () => 
        rateLimit(identifier, limit, windowMs)
      );

      const results = await Promise.all(promises);

      // Count successful and failed requests
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      expect(successful).toBe(limit);
      expect(failed).toBe(10 - limit);
    });
  });

  describe('Header Generation', () => {
    it('should generate correct headers for successful requests', async () => {
      const identifier = 'test:headers';
      const limit = 10;
      const windowMs = 1000;

      const result = await rateLimit(identifier, limit, windowMs);

      expect(result.headers).toBeDefined();
      expect(result.headers!['X-RateLimit-Limit']).toBe(limit.toString());
      expect(result.headers!['X-RateLimit-Remaining']).toBe('9');
      expect(result.headers!['X-RateLimit-Reset']).toBeDefined();
    });

    it('should generate correct headers for blocked requests', async () => {
      const identifier = 'test:blocked-headers';
      const limit = 1;
      const windowMs = 1000;

      // First request should succeed
      await rateLimit(identifier, limit, windowMs);

      // Second request should be blocked
      const result = await rateLimit(identifier, limit, windowMs);

      expect(result.success).toBe(false);
      expect(result.headers).toBeDefined();
      expect(result.headers!['X-RateLimit-Limit']).toBe(limit.toString());
      expect(result.headers!['X-RateLimit-Remaining']).toBe('0');
      expect(result.headers!['Retry-After']).toBeDefined();
    });
  });
});
