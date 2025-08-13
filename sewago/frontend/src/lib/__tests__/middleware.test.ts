import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { rateLimitMiddleware } from '../../../middleware';

// Mock the rate limiting functions
vi.mock('../rate-limit-adapters', () => ({
  checkRateLimit: vi.fn()
}));

vi.mock('../rate-policies', () => ({
  getPolicyForRoute: vi.fn(),
  shouldRateLimitRoute: vi.fn()
}));

vi.mock('../request-identity', () => ({
  getRequestMetadata: vi.fn()
}));

import { checkRateLimit } from '../rate-limit-adapters';
import { getPolicyForRoute, shouldRateLimitRoute } from '../rate-policies';
import { getRequestMetadata } from '../request-identity';

describe('Rate Limit Middleware', () => {
  let mockRequest: NextRequest;
  let mockCheckRateLimit: ReturnType<typeof vi.fn>;
  let mockGetPolicyForRoute: ReturnType<typeof vi.fn>;
  let mockShouldRateLimitRoute: ReturnType<typeof vi.fn>;
  let mockGetRequestMetadata: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Get mocked functions
    mockCheckRateLimit = vi.mocked(checkRateLimit);
    mockGetPolicyForRoute = vi.mocked(getPolicyForRoute);
    mockShouldRateLimitRoute = vi.mocked(shouldRateLimitRoute);
    mockGetRequestMetadata = vi.mocked(getRequestMetadata);

    // Create mock request
    mockRequest = {
      nextUrl: { pathname: '/api/test' },
      headers: new Map([['user-agent', 'test-agent']]),
      cookies: new Map(),
      ip: '127.0.0.1'
    } as any as NextRequest;
  });

  describe('Route Filtering', () => {
    it('should skip rate limiting for non-rate-limited routes', async () => {
      mockShouldRateLimitRoute.mockReturnValue(false);

      const result = await rateLimitMiddleware(mockRequest);

      expect(result).toBeNull();
      expect(mockCheckRateLimit).not.toHaveBeenCalled();
    });

    it('should apply rate limiting for rate-limited routes', async () => {
      mockShouldRateLimitRoute.mockReturnValue(true);
      mockGetRequestMetadata.mockReturnValue({
        identifier: 'test:user',
        logIdentifier: 'test:user',
        ip: '127.0.0.1',
        userAgent: 'test-agent',
        method: 'GET',
        pathname: '/api/test'
      });
      mockGetPolicyForRoute.mockReturnValue({ limit: 10, windowSec: 60 });
      mockCheckRateLimit.mockResolvedValue({
        success: true,
        limit: 10,
        remaining: 9,
        resetTime: Date.now() + 60000,
        headers: {
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': '9',
          'X-RateLimit-Reset': new Date(Date.now() + 60000).toISOString()
        }
      });

      const result = await rateLimitMiddleware(mockRequest);

      expect(result).not.toBeNull();
      expect(mockCheckRateLimit).toHaveBeenCalledWith('test:user', { limit: 10, windowSec: 60 });
    });
  });

  describe('Rate Limit Checking', () => {
    beforeEach(() => {
      mockShouldRateLimitRoute.mockReturnValue(true);
      mockGetRequestMetadata.mockReturnValue({
        identifier: 'test:user',
        logIdentifier: 'test:user',
        ip: '127.0.0.1',
        userAgent: 'test-agent',
        method: 'GET',
        pathname: '/api/test'
      });
      mockGetPolicyForRoute.mockReturnValue({ limit: 5, windowSec: 60 });
    });

    it('should allow request when within rate limit', async () => {
      mockCheckRateLimit.mockResolvedValue({
        success: true,
        limit: 5,
        remaining: 4,
        resetTime: Date.now() + 60000,
        headers: {
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': '4',
          'X-RateLimit-Reset': new Date(Date.now() + 60000).toISOString()
        }
      });

      const result = await rateLimitMiddleware(mockRequest);

      expect(result).not.toBeNull();
      expect(result?.status).toBeUndefined(); // NextResponse.next() doesn't have status
      expect(result?.headers.get('X-RateLimit-Limit')).toBe('5');
      expect(result?.headers.get('X-RateLimit-Remaining')).toBe('4');
    });

    it('should block request when rate limit exceeded', async () => {
      const resetTime = Date.now() + 30000;
      mockCheckRateLimit.mockResolvedValue({
        success: false,
        limit: 5,
        remaining: 0,
        resetTime,
        retryAfter: 30,
        headers: {
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(resetTime).toISOString(),
          'Retry-After': '30'
        }
      });

      const result = await rateLimitMiddleware(mockRequest);

      expect(result).not.toBeNull();
      expect(result?.status).toBe(429);
      
      const body = await result?.json();
      expect(body.error).toBe('rate_limited');
      expect(body.retryAfter).toBe(30);
      expect(body.policy).toBe('default');
      
      expect(result?.headers.get('X-RateLimit-Limit')).toBe('5');
      expect(result?.headers.get('X-RateLimit-Remaining')).toBe('0');
      expect(result?.headers.get('Retry-After')).toBe('30');
    });
  });

  describe('Error Handling', () => {
    it('should handle rate limiting errors gracefully', async () => {
      mockShouldRateLimitRoute.mockReturnValue(true);
      mockGetRequestMetadata.mockImplementation(() => {
        throw new Error('Test error');
      });

      const result = await rateLimitMiddleware(mockRequest);

      expect(result).toBeNull();
    });

    it('should handle checkRateLimit errors gracefully', async () => {
      mockShouldRateLimitRoute.mockReturnValue(true);
      mockGetRequestMetadata.mockReturnValue({
        identifier: 'test:user',
        logIdentifier: 'test:user',
        ip: '127.0.0.1',
        userAgent: 'test-agent',
        method: 'GET',
        pathname: '/api/test'
      });
      mockGetPolicyForRoute.mockReturnValue({ limit: 5, windowSec: 60 });
      mockCheckRateLimit.mockRejectedValue(new Error('Redis connection failed'));

      const result = await rateLimitMiddleware(mockRequest);

      expect(result).toBeNull();
    });
  });

  describe('Logging', () => {
    let consoleSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      mockShouldRateLimitRoute.mockReturnValue(true);
      mockGetRequestMetadata.mockReturnValue({
        identifier: 'test:user',
        logIdentifier: 'test:user',
        ip: '127.0.0.1',
        userAgent: 'test-agent',
        method: 'GET',
        pathname: '/api/test'
      });
      mockGetPolicyForRoute.mockReturnValue({ limit: 5, windowSec: 60 });
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('should log successful rate limit checks', async () => {
      mockCheckRateLimit.mockResolvedValue({
        success: true,
        limit: 5,
        remaining: 4,
        resetTime: Date.now() + 60000,
        headers: {}
      });

      await rateLimitMiddleware(mockRequest);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('"level":"info"')
      );
    });

    it('should log rate limit denials', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      mockCheckRateLimit.mockResolvedValue({
        success: false,
        limit: 5,
        remaining: 0,
        resetTime: Date.now() + 30000,
        retryAfter: 30,
        headers: {}
      });

      await rateLimitMiddleware(mockRequest);

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('"level":"warn"')
      );
      
      warnSpy.mockRestore();
    });
  });

  describe('Header Generation', () => {
    beforeEach(() => {
      mockShouldRateLimitRoute.mockReturnValue(true);
      mockGetRequestMetadata.mockReturnValue({
        identifier: 'test:user',
        logIdentifier: 'test:user',
        ip: '127.0.0.1',
        userAgent: 'test-agent',
        method: 'GET',
        pathname: '/api/test'
      });
      mockGetPolicyForRoute.mockReturnValue({ limit: 10, windowSec: 60 });
    });

    it('should set rate limit headers on successful requests', async () => {
      const resetTime = Date.now() + 60000;
      mockCheckRateLimit.mockResolvedValue({
        success: true,
        limit: 10,
        remaining: 9,
        resetTime,
        headers: {
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': '9',
          'X-RateLimit-Reset': new Date(resetTime).toISOString()
        }
      });

      const result = await rateLimitMiddleware(mockRequest);

      expect(result?.headers.get('X-RateLimit-Limit')).toBe('10');
      expect(result?.headers.get('X-RateLimit-Remaining')).toBe('9');
      expect(result?.headers.get('X-RateLimit-Reset')).toBeDefined();
    });

    it('should set rate limit headers on blocked requests', async () => {
      const resetTime = Date.now() + 30000;
      mockCheckRateLimit.mockResolvedValue({
        success: false,
        limit: 10,
        remaining: 0,
        resetTime,
        retryAfter: 30,
        headers: {
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(resetTime).toISOString(),
          'Retry-After': '30'
        }
      });

      const result = await rateLimitMiddleware(mockRequest);

      expect(result?.headers.get('X-RateLimit-Limit')).toBe('10');
      expect(result?.headers.get('X-RateLimit-Remaining')).toBe('0');
      expect(result?.headers.get('Retry-After')).toBe('30');
    });
  });
});
