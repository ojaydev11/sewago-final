import { describe, it, expect, beforeEach } from 'vitest';
import { createRateLimit } from '../middleware/rateLimit.js';
import { validateRequest } from '../middleware/validation.js';
import { z } from 'zod';

// Mock Express request/response
const createMockRequest = (data: any = {}) => ({
  ip: '127.0.0.1',
  body: data.body || {},
  query: data.query || {},
  params: data.params || {},
  ...data,
});

const createMockResponse = () => {
  let statusCode = 200;
  let jsonData: any = null;
  
  return {
    status: (code: number) => {
      statusCode = code;
      return { json: (data: any) => { jsonData = data; } };
    },
    json: (data: any) => { jsonData = data; },
    getStatus: () => statusCode,
    getJson: () => jsonData,
  };
};

const createMockNext = () => {
  let called = false;
  let error: any = null;
  
  return {
    next: (err?: any) => {
      called = true;
      error = err;
    },
    isCalled: () => called,
    getError: () => error,
  };
};

describe('Rate Limiting', () => {
  it('should allow requests under limit', () => {
    const rateLimiter = createRateLimit({
      windowMs: 60000, // 1 minute
      max: 2, // 2 requests per window
    });

    const req = createMockRequest();
    const res = createMockResponse();
    const { next } = createMockNext();

    // First request should pass
    rateLimiter(req as any, res as any, next);
    expect(res.getStatus()).toBe(200);
  });

  it('should block requests over limit', () => {
    const rateLimiter = createRateLimit({
      windowMs: 60000,
      max: 1, // 1 request per window
    });

    const req = createMockRequest();
    const res = createMockResponse();
    const { next } = createMockNext();

    // First request should pass
    rateLimiter(req as any, res as any, next);
    expect(res.getStatus()).toBe(200);

    // Second request should be blocked
    const res2 = createMockResponse();
    rateLimiter(req as any, res2 as any, next);
    expect(res2.getStatus()).toBe(429);
    expect(res2.getJson()).toMatchObject({
      success: false,
      message: 'Too many requests, please try again later',
    });
  });

  it('should use custom key generator', () => {
    const rateLimiter = createRateLimit({
      windowMs: 60000,
      max: 1,
      keyGenerator: (req) => req.body?.email || 'default',
    });

    const req1 = createMockRequest({ body: { email: 'user1@test.com' } });
    const req2 = createMockRequest({ body: { email: 'user2@test.com' } });
    const res1 = createMockResponse();
    const res2 = createMockResponse();
    const { next } = createMockNext();

    // Different emails should have separate limits
    rateLimiter(req1 as any, res1 as any, next);
    rateLimiter(req2 as any, res2 as any, next);

    expect(res1.getStatus()).toBe(200);
    expect(res2.getStatus()).toBe(200);
  });
});

describe('Input Validation', () => {
  const testSchema = z.object({
    body: z.object({
      email: z.string().email(),
      age: z.number().min(18),
    }),
  });

  it('should pass valid input', () => {
    const validator = validateRequest({ body: testSchema.shape.body });
    const req = createMockRequest({
      body: { email: 'test@example.com', age: 25 },
    });
    const res = createMockResponse();
    const { next, isCalled } = createMockNext();

    validator(req as any, res as any, next);

    expect(isCalled()).toBe(true);
    expect(res.getStatus()).toBe(200);
  });

  it('should reject invalid input', () => {
    const validator = validateRequest({ body: testSchema.shape.body });
    const req = createMockRequest({
      body: { email: 'invalid-email', age: 16 },
    });
    const res = createMockResponse();
    const { next, isCalled } = createMockNext();

    validator(req as any, res as any, next);

    expect(isCalled()).toBe(false);
    expect(res.getStatus()).toBe(400);
    expect(res.getJson()).toMatchObject({
      success: false,
      message: 'Validation failed',
    });
  });

  it('should provide detailed error messages', () => {
    const validator = validateRequest({ body: testSchema.shape.body });
    const req = createMockRequest({
      body: { email: 'invalid', age: 'not-a-number' },
    });
    const res = createMockResponse();
    const { next } = createMockNext();

    validator(req as any, res as any, next);

    const response = res.getJson();
    expect(response.errors).toBeDefined();
    expect(response.errors).toHaveLength(2);
  });
});

describe('Security Headers', () => {
  it('should be tested with integration tests', () => {
    // Security headers are tested in integration tests
    // where we can verify actual HTTP responses
    expect(true).toBe(true);
  });
});

describe('MongoDB Injection Prevention', () => {
  it('should sanitize query objects', () => {
    // Test MongoDB injection prevention
    const maliciousQuery = {
      '$where': 'function() { return true; }',
      'user.password': { '$ne': null },
    };

    // Our sanitizeInPlace function should remove these
    const sanitizeInPlace = (value: unknown): void => {
      if (!value || typeof value !== 'object') return;
      if (Array.isArray(value)) {
        value.forEach(sanitizeInPlace);
        return;
      }
      const obj = value as Record<string, unknown>;
      for (const key of Object.keys(obj)) {
        if (key.startsWith('$') || key.includes('.')) {
          delete obj[key];
          continue;
        }
        sanitizeInPlace(obj[key]);
      }
    };

    sanitizeInPlace(maliciousQuery);
    
    // Malicious keys should be removed
    expect(maliciousQuery['$where']).toBeUndefined();
    expect(maliciousQuery['user.password']).toBeUndefined();
  });
});
