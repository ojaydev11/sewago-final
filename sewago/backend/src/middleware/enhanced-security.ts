import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import crypto from "crypto";

/**
 * Enhanced Security Middleware Suite for SewaGo
 * Implements comprehensive security controls including CSP, rate limiting,
 * CSRF protection, and security headers.
 */

// Enhanced Content Security Policy
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'",
        "'unsafe-inline'", // Required for Tailwind CSS
        "https://fonts.googleapis.com",
        "https://cdn.jsdelivr.net"
      ],
      scriptSrc: [
        "'self'",
        "'unsafe-eval'", // Required for Next.js dev mode - should be removed in production
        "https://js.stripe.com",
        "https://checkout.esewa.com.np",
        "https://khalti.s3.ap-south-1.amazonaws.com"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "data:"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https:",
        "blob:"
      ],
      connectSrc: [
        "'self'",
        "https://api.esewa.com.np",
        "https://khalti.com",
        "https://a.khalti.com"
      ],
      frameSrc: [
        "https://checkout.esewa.com.np",
        "https://pay.khalti.com"
      ],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false, // Allow payment gateway embeds
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Rate limiting for authentication endpoints
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    error: "Too many authentication attempts. Please try again later.",
    retryAfter: "15 minutes"
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip + ":" + (req.body?.email || req.body?.emailOrPhone || "unknown");
  }
});

// Rate limiting for payment endpoints
export const paymentRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 payment attempts per minute
  message: {
    error: "Too many payment requests. Please try again later.",
    retryAfter: "1 minute"
  },
  keyGenerator: (req) => {
    return req.ip + ":" + (req.userId || "anonymous");
  }
});

// Rate limiting for booking endpoints
export const bookingRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // 20 bookings per 5 minutes per user
  message: {
    error: "Too many booking requests. Please try again later."
  },
  keyGenerator: (req) => {
    return req.userId || req.ip || 'anonymous';
  }
});

// CSRF Protection Middleware
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip CSRF for API endpoints with proper authentication
  if (req.path.startsWith('/api/') && req.headers.authorization) {
    return next();
  }

  const csrfToken = req.headers['x-csrf-token'] as string;
  const sessionToken = req.session?.csrfToken;

  if (!csrfToken || !sessionToken || csrfToken !== sessionToken) {
    return res.status(403).json({
      error: "Invalid CSRF token",
      code: "CSRF_TOKEN_MISMATCH"
    });
  }

  next();
};

// Generate CSRF token endpoint
export const generateCSRFToken = (req: Request, res: Response) => {
  const token = crypto.randomBytes(32).toString('hex');
  
  // Initialize session if it doesn't exist
  if (!req.session) {
    req.session = {};
  }
  req.session.csrfToken = token;

  res.json({ csrfToken: token });
};

// Request ID generation for tracking
export const requestId = (req: Request, res: Response, next: NextFunction) => {
  req.requestId = crypto.randomUUID();
  res.setHeader('X-Request-ID', req.requestId);
  next();
};

// Security audit logging
export const securityAuditLog = (event: string, details: any, req: Request) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    requestId: req.requestId,
    userId: req.userId,
    userRole: req.userRole,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    details,
    severity: getSeverityLevel(event)
  };

  // In production, this should be sent to a centralized logging system
  console.log('[SECURITY_AUDIT]', JSON.stringify(logEntry));
};

function getSeverityLevel(event: string): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  const criticalEvents = ['payment_fraud', 'unauthorized_access', 'data_breach'];
  const highEvents = ['failed_auth', 'suspicious_activity', 'privilege_escalation'];
  const mediumEvents = ['rate_limit_exceeded', 'invalid_input', 'csrf_attempt'];
  
  if (criticalEvents.some(e => event.includes(e))) return 'CRITICAL';
  if (highEvents.some(e => event.includes(e))) return 'HIGH';
  if (mediumEvents.some(e => event.includes(e))) return 'MEDIUM';
  return 'LOW';
}

// Input sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Sanitize common NoSQL injection patterns
  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      // Remove potential MongoDB operators
      return obj.replace(/^\$/, '').replace(/\./g, '');
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        // Skip MongoDB operators in keys
        if (!key.startsWith('$')) {
          sanitized[key] = sanitizeObject(value);
        }
      }
      return sanitized;
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  next();
};

export default {
  securityHeaders,
  authRateLimit,
  paymentRateLimit,
  bookingRateLimit,
  csrfProtection,
  generateCSRFToken,
  requestId,
  securityAuditLog,
  sanitizeInput
};