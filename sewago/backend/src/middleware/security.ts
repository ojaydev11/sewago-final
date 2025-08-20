import { Request, Response, NextFunction } from 'express';

export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Allow inline scripts for development
      "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
      "font-src 'self' fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https: wss:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  );

  // X-Frame-Options to prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // X-Content-Type-Options to prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // X-XSS-Protection (legacy but still useful)
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Strict-Transport-Security (HTTPS only)
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // Permissions Policy (formerly Feature Policy)
  res.setHeader(
    'Permissions-Policy',
    [
      'camera=(), microphone=()',
      'geolocation=(self)',
      'payment=(self)',
      'usb=(), serial=()',
    ].join(', ')
  );

  // Remove sensitive headers
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');

  next();
};

export const corsSecurityHeaders = (req: Request, res: Response, next: NextFunction) => {
  const allowedOrigins = [
    process.env.CLIENT_ORIGIN,
    'http://localhost:3000',
    'https://sewago-final.vercel.app',
  ].filter(Boolean);

  const origin = req.headers.origin;
  
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Request-ID'
  );

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
};

// Request ID middleware for request correlation
export const requestId = (req: Request, res: Response, next: NextFunction) => {
  const requestId = req.headers['x-request-id'] as string || 
                   Math.random().toString(36).substring(2, 15);
  
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  
  next();
};
