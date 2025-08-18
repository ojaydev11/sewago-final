import { Request, Response, NextFunction } from 'express';

// Simple in-memory rate limiter (for production, use Redis-based solution)
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
  skip?: (req: Request) => boolean;
}

export const createRateLimit = (options: RateLimitOptions) => {
  const {
    windowMs,
    max,
    message = 'Too many requests, please try again later',
    keyGenerator = (req: Request) => req.ip || 'unknown',
    skip = () => false,
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    if (skip(req)) {
      return next();
    }

    const key = keyGenerator(req);
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean up expired entries
    for (const k in store) {
      if (store[k].resetTime < windowStart) {
        delete store[k];
      }
    }

    const current = store[key];
    
    if (!current || current.resetTime < windowStart) {
      // First request in window or window expired
      store[key] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return next();
    }

    if (current.count >= max) {
      // Rate limit exceeded
      const remainingTime = Math.ceil((current.resetTime - now) / 1000);
      
      return res.status(429).json({
        success: false,
        message,
        retryAfter: remainingTime,
      });
    }

    // Increment count
    current.count += 1;
    next();
  };
};

// Predefined rate limiters
export const generalRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
});

export const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes  
  max: 5, // 5 login attempts per window
  message: 'Too many login attempts, please try again later',
  keyGenerator: (req: Request) => `auth:${req.ip}:${req.body?.email || 'unknown'}`,
});

export const paymentRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // 3 payment requests per minute
  message: 'Payment rate limit exceeded, please wait before trying again',
});

export const bookingRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 bookings per minute
  message: 'Too many booking requests, please slow down',
});
