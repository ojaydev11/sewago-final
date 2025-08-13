
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export async function rateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): Promise<{ success: boolean; limit: number; remaining: number; resetTime: number }> {
  const now = Date.now();
  const windowStart = now - windowMs;

  // Clean up expired entries
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }

  const entry = rateLimitStore.get(identifier);
  
  if (!entry || entry.resetTime < now) {
    // Create new entry or reset expired one
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + windowMs
    };
    rateLimitStore.set(identifier, newEntry);
    
    return {
      success: true,
      limit,
      remaining: limit - 1,
      resetTime: newEntry.resetTime
    };
  }

  if (entry.count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      resetTime: entry.resetTime
    };
  }

  entry.count++;
  
  return {
    success: true,
    limit,
    remaining: limit - entry.count,
    resetTime: entry.resetTime
  };
}
