import { 
  rateLimit, 
  rateLimitWithConfig, 
  isRateLimitExceeded, 
  getRetryDelay, 
  getRateLimitHeaders,
  resetRateLimit,
  getRateLimitStatus,
  getAllRateLimits,
  cleanupExpiredEntries
} from './rate-limit';

// Example 1: Basic rate limiting for API endpoints
export async function rateLimitAPIRequest(
  userId: string, 
  endpoint: string
): Promise<{ allowed: boolean; retryAfter?: number; headers?: Record<string, string> }> {
  const identifier = `api:${userId}:${endpoint}`;
  const limit = 100; // 100 requests
  const windowMs = 15 * 60 * 1000; // 15 minutes
  
  const result = await rateLimit(identifier, limit, windowMs);
  
  if (isRateLimitExceeded(result)) {
    return {
      allowed: false,
      retryAfter: getRetryDelay(result),
      headers: getRateLimitHeaders(result)
    };
  }
  
  return {
    allowed: true,
    headers: getRateLimitHeaders(result)
  };
}

// Example 2: Rate limiting with configuration
export async function rateLimitWithConfigExample(
  userId: string,
  action: string
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const config = {
    limit: 10, // 10 attempts
    windowMs: 60 * 1000, // 1 minute
    identifier: `action:${userId}:${action}`,
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  };
  
  const result = await rateLimitWithConfig(config);
  
  if (isRateLimitExceeded(result)) {
    return {
      allowed: false,
      retryAfter: getRetryDelay(result)
    };
  }
  
  return { allowed: true };
}

// Example 3: Rate limiting for authentication attempts
export async function rateLimitLoginAttempts(
  identifier: string, // Could be IP, email, or username
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): Promise<{ allowed: boolean; remainingAttempts: number; lockedUntil?: Date }> {
  const result = await rateLimit(identifier, maxAttempts, windowMs);
  
  if (isRateLimitExceeded(result)) {
    return {
      allowed: false,
      remainingAttempts: 0,
      lockedUntil: new Date(result.resetTime)
    };
  }
  
  return {
    allowed: true,
    remainingAttempts: result.remaining
  };
}

// Example 4: Rate limiting for file uploads
export async function rateLimitFileUpload(
  userId: string,
  maxUploads: number = 10,
  windowMs: number = 60 * 60 * 1000 // 1 hour
): Promise<{ allowed: boolean; remainingUploads: number }> {
  const identifier = `upload:${userId}`;
  const result = await rateLimit(identifier, maxUploads, windowMs);
  
  return {
    allowed: result.success,
    remainingUploads: result.remaining
  };
}

// Example 5: Rate limiting for search queries
export async function rateLimitSearchQueries(
  userId: string,
  maxQueries: number = 50,
  windowMs: number = 5 * 60 * 1000 // 5 minutes
): Promise<{ allowed: boolean; remainingQueries: number }> {
  const identifier = `search:${userId}`;
  const result = await rateLimit(identifier, maxQueries, windowMs);
  
  return {
    allowed: result.success,
    remainingQueries: result.remaining
  };
}

// Example 6: Rate limiting for payment attempts
export async function rateLimitPaymentAttempts(
  userId: string,
  maxAttempts: number = 3,
  windowMs: number = 30 * 60 * 1000 // 30 minutes
): Promise<{ allowed: boolean; remainingAttempts: number; lockedUntil?: Date }> {
  const identifier = `payment:${userId}`;
  const result = await rateLimit(identifier, maxAttempts, windowMs);
  
  if (isRateLimitExceeded(result)) {
    return {
      allowed: false,
      remainingAttempts: 0,
      lockedUntil: new Date(result.resetTime)
    };
  }
  
  return {
    allowed: true,
    remainingAttempts: result.remaining
  };
}

// Example 7: Rate limiting for contact form submissions
export async function rateLimitContactForm(
  identifier: string, // Could be IP or email
  maxSubmissions: number = 3,
  windowMs: number = 24 * 60 * 60 * 1000 // 24 hours
): Promise<{ allowed: boolean; remainingSubmissions: number }> {
  const result = await rateLimit(identifier, maxSubmissions, windowMs);
  
  return {
    allowed: result.success,
    remainingSubmissions: result.remaining
  };
}

// Example 8: Rate limiting for password reset requests
export async function rateLimitPasswordReset(
  email: string,
  maxRequests: number = 3,
  windowMs: number = 60 * 60 * 1000 // 1 hour
): Promise<{ allowed: boolean; remainingRequests: number; retryAfter?: number }> {
  const identifier = `password-reset:${email}`;
  const result = await rateLimit(identifier, maxRequests, windowMs);
  
  if (isRateLimitExceeded(result)) {
    return {
      allowed: false,
      remainingRequests: 0,
      retryAfter: getRetryDelay(result)
    };
  }
  
  return {
    allowed: true,
    remainingRequests: result.remaining
  };
}

// Example 9: Rate limiting for OTP verification
export async function rateLimitOTPVerification(
  phoneNumber: string,
  maxAttempts: number = 5,
  windowMs: number = 10 * 60 * 1000 // 10 minutes
): Promise<{ allowed: boolean; remainingAttempts: number; lockedUntil?: Date }> {
  const identifier = `otp:${phoneNumber}`;
  const result = await rateLimit(identifier, maxAttempts, windowMs);
  
  if (isRateLimitExceeded(result)) {
    return {
      allowed: false,
      remainingAttempts: 0,
      lockedUntil: new Date(result.resetTime)
    };
  }
  
  return {
    allowed: true,
    remainingAttempts: result.remaining
  };
}

// Example 10: Rate limiting for comment posting
export async function rateLimitComments(
  userId: string,
  maxComments: number = 20,
  windowMs: number = 60 * 60 * 1000 // 1 hour
): Promise<{ allowed: boolean; remainingComments: number }> {
  const identifier = `comments:${userId}`;
  const result = await rateLimit(identifier, maxComments, windowMs);
  
  return {
    allowed: result.success,
    remainingComments: result.remaining
  };
}

// Utility functions for monitoring and management
export function getRateLimitStats(): {
  totalActiveLimits: number;
  totalEntries: number;
  cleanupCount: number;
} {
  const activeLimits = getAllRateLimits();
  const cleanupCount = cleanupExpiredEntries();
  
  return {
    totalActiveLimits: activeLimits.size,
    totalEntries: activeLimits.size,
    cleanupCount
  };
}

export function resetUserRateLimits(userId: string): {
  success: boolean;
  resetCount: number;
} {
  const activeLimits = getAllRateLimits();
  let resetCount = 0;
  
  for (const [key] of activeLimits.entries()) {
    if (key.includes(userId)) {
      if (resetRateLimit(key)) {
        resetCount++;
      }
    }
  }
  
  return {
    success: resetCount > 0,
    resetCount
  };
}

// Example usage in middleware or API routes
export async function applyRateLimit(
  req: any,
  res: any,
  next: any,
  options: {
    type: 'api' | 'auth' | 'upload' | 'search' | 'payment' | 'contact' | 'password-reset' | 'otp' | 'comments';
    identifier: string;
    customLimit?: number;
    customWindow?: number;
  }
): Promise<void> {
  try {
    let result;
    
    switch (options.type) {
      case 'api':
        result = await rateLimitAPIRequest(options.identifier, req.path);
        break;
      case 'auth':
        result = await rateLimitLoginAttempts(options.identifier, options.customLimit, options.customWindow);
        break;
      case 'upload':
        result = await rateLimitFileUpload(options.identifier, options.customLimit, options.customWindow);
        break;
      case 'search':
        result = await rateLimitSearchQueries(options.identifier, options.customLimit, options.customWindow);
        break;
      case 'payment':
        result = await rateLimitPaymentAttempts(options.identifier, options.customLimit, options.customWindow);
        break;
      case 'contact':
        result = await rateLimitContactForm(options.identifier, options.customLimit, options.customWindow);
        break;
      case 'password-reset':
        result = await rateLimitPasswordReset(options.identifier, options.customLimit, options.customWindow);
        break;
      case 'otp':
        result = await rateLimitOTPVerification(options.identifier, options.customLimit, options.customWindow);
        break;
      case 'comments':
        result = await rateLimitComments(options.identifier, options.customLimit, options.customWindow);
        break;
      default:
        result = { allowed: true };
    }
    
    if (!result.allowed) {
      res.status(429).json({
        error: 'Rate limit exceeded',
        retryAfter: (result as any).retryAfter,
        lockedUntil: (result as any).lockedUntil
      });
      return;
    }
    
    // Add rate limit headers to response
    if ((result as any).headers) {
      Object.entries((result as any).headers).forEach(([key, value]) => {
        res.set(key, value);
      });
    }
    
    next();
  } catch (error) {
    console.error('Rate limiting error:', error);
    // Fail open - allow request if rate limiting fails
    next();
  }
}
