import { NextRequest } from 'next/server';
import { createHash } from 'crypto';

// Get the salt for IP hashing from environment
const RATE_LIMIT_SALT = process.env.RATE_LIMIT_SALT || 'default-salt-change-in-production';

/**
 * Get a secure identifier for a request
 * Uses user ID if authenticated, otherwise IP hash
 */
export function getIdentifier(req: NextRequest): string {
  // Try to get user ID from session cookie first
  const userId = getUserIdFromRequest(req);
  if (userId) {
    return `user:${userId}`;
  }
  
  // Fall back to IP hash
  const ip = getClientIP(req);
  return `ip:${hashIP(ip)}`;
}

/**
 * Get user ID from request if authenticated
 */
function getUserIdFromRequest(req: NextRequest): string | null {
  try {
    // Check for session cookie
    const sessionCookie = req.cookies.get('session')?.value;
    if (sessionCookie) {
      // In a real implementation, you'd decode the JWT or session token
      // For now, we'll use a simple approach - extract user ID from cookie
      const decoded = decodeURIComponent(sessionCookie);
      const match = decoded.match(/userId[=:]([^;&]+)/);
      if (match) {
        return match[1];
      }
    }
    
    // Check for authorization header
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      // In a real implementation, you'd decode the JWT to get the user ID
      // For now, we'll use a hash of the token as a placeholder
      const userId = createHash('sha256').update(token).digest('hex').substring(0, 8);
      return userId;
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting user ID:', error);
    return null;
  }
}

/**
 * Get client IP address from request
 */
function getClientIP(req: NextRequest): string {
  // Check for forwarded IP headers (common in production)
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    const firstIP = forwardedFor.split(',')[0].trim();
    if (firstIP && isValidIP(firstIP)) {
      return firstIP;
    }
  }
  
  // Check for real IP header
  const realIP = req.headers.get('x-real-ip');
  if (realIP && isValidIP(realIP)) {
    return realIP;
  }
  
  // Fall back to request IP (if available)
  if (req.ip && isValidIP(req.ip)) {
    return req.ip;
  }
  
  // Default fallback
  return 'unknown';
}

/**
 * Hash IP address for secure logging
 */
function hashIP(ip: string): string {
  if (ip === 'unknown') {
    return 'unknown';
  }
  
  // Create a hash of IP + salt for secure logging
  return createHash('sha256')
    .update(`${ip}:${RATE_LIMIT_SALT}`)
    .digest('hex')
    .substring(0, 16); // Use first 16 characters for readability
}

/**
 * Validate IP address format
 */
function isValidIP(ip: string): boolean {
  // Basic IPv4 validation
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  
  // Basic IPv6 validation
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

/**
 * Get a log-safe identifier for logging (never contains raw IPs)
 */
export function getLogIdentifier(req: NextRequest): string {
  const userId = getUserIdFromRequest(req);
  if (userId) {
    return `user:${userId}`;
  }
  
  const ip = getClientIP(req);
  return `ip:${hashIP(ip)}`;
}

/**
 * Get request metadata for logging
 */
export function getRequestMetadata(req: NextRequest): {
  identifier: string;
  logIdentifier: string;
  ip: string;
  userAgent: string;
  method: string;
  pathname: string;
} {
  const identifier = getIdentifier(req);
  const logIdentifier = getLogIdentifier(req);
  const ip = getClientIP(req);
  const userAgent = req.headers.get('user-agent') || 'unknown';
  const method = req.method;
  const pathname = req.nextUrl.pathname;
  
  return {
    identifier,
    logIdentifier,
    ip,
    userAgent,
    method,
    pathname
  };
}

/**
 * Check if a request is from a known bot/crawler
 */
export function isBotRequest(req: NextRequest): boolean {
  const userAgent = req.headers.get('user-agent') || '';
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /go-http-client/i,
    /httpclient/i,
    /okhttp/i,
    /postman/i,
    /insomnia/i
  ];
  
  return botPatterns.some(pattern => pattern.test(userAgent));
}

/**
 * Get a rate limit key that includes additional context
 */
export function getRateLimitKey(
  baseIdentifier: string, 
  policy: string, 
  additionalContext?: string
): string {
  if (additionalContext) {
    return `${baseIdentifier}:${policy}:${additionalContext}`;
  }
  return `${baseIdentifier}:${policy}`;
}
