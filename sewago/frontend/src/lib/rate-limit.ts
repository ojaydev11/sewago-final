// Re-export from the new adapter system for backward compatibility
export { 
  checkRateLimit,
  getLimiter,
  type RateLimitResult,
  type RateLimitPolicy,
  type RateLimitAdapter
} from './rate-limit-adapters';

// Import types for backward compatibility
import type { RateLimitResult } from './rate-limit-adapters';
import { checkRateLimit } from './rate-limit-adapters';

// Legacy interface for backward compatibility
interface RateLimitEntry {
  count: number;
  resetTime: number;
  firstRequest: number;
}

interface RateLimitConfig {
  limit: number;
  windowMs: number;
  identifier?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

// Legacy function for backward compatibility
export async function rateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const policy = { limit, windowSec: Math.floor(windowMs / 1000) };
  return checkRateLimit(identifier, policy);
}

// Legacy function for backward compatibility
export async function rateLimitWithConfig(
  config: RateLimitConfig,
  customIdentifier?: string
): Promise<RateLimitResult> {
  const identifier = customIdentifier || config.identifier || 'default';
  const policy = { limit: config.limit, windowSec: Math.floor(config.windowMs / 1000) };
  return checkRateLimit(identifier, policy);
}

// Legacy utility functions for backward compatibility
export function isRateLimitExceeded(result: RateLimitResult): boolean {
  return !result.success;
}

export function getRetryDelay(result: RateLimitResult): number {
  return result.retryAfter || 0;
}

export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return result.headers;
}

// Legacy management functions for backward compatibility
export function resetRateLimit(identifier: string): boolean {
  console.warn('resetRateLimit is deprecated. Use the new adapter system instead.');
  return false;
}

export function getRateLimitStatus(identifier: string): RateLimitEntry | null {
  console.warn('getRateLimitStatus is deprecated. Use the new adapter system instead.');
  return null;
}

export function getAllRateLimits(): Map<string, RateLimitEntry> {
  console.warn('getAllRateLimits is deprecated. Use the new adapter system instead.');
  return new Map();
}

export function cleanupExpiredEntries(): number {
  console.warn('cleanupExpiredEntries is deprecated. Use the new adapter system instead.');
  return 0;
}

export function shutdownRateLimit(): void {
  console.warn('shutdownRateLimit is deprecated. Use the new adapter system instead.');
}

// Note: The new system automatically handles cleanup and shutdown
// The legacy functions are kept for backward compatibility but will log deprecation warnings
