# Enhanced Rate Limiting System

A production-ready, in-memory and Redis-based rate limiting system for Node.js applications with comprehensive features and easy integration.

## Features

- **Flexible Rate Limiting**: Configurable limits and time windows
- **Dual Storage**: In-memory for local development, Redis for production
- **Automatic Cleanup**: Prevents memory leaks with automatic cleanup intervals
- **HTTP Headers**: Standard rate limit headers (X-RateLimit-*)
- **Error Handling**: Graceful degradation with fail-open behavior
- **Utility Functions**: Helper functions for common operations
- **Memory Management**: Automatic cleanup and graceful shutdown
- **TypeScript Support**: Full TypeScript support with proper types
- **Testing**: Comprehensive test coverage
- **Edge Runtime**: Optimized for Next.js Edge middleware
- **Route Policies**: Different rate limits for different endpoints

## Installation

The rate limiting system is included in your project. For production deployment, install Redis dependencies:

```bash
npm install @upstash/redis
```

## Environment Variables

### Required for Production (Redis)
```bash
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
```

### Optional
```bash
RATE_LIMIT_SALT=random_string_for_ip_hashing
```

## Basic Usage

### Simple Rate Limiting

```typescript
import { checkRateLimit } from './lib/rate-limit-adapters';

// Basic rate limiting
const result = await checkRateLimit('user:123', { limit: 10, windowSec: 60 });

if (result.success) {
  // Request allowed
  console.log(`Remaining requests: ${result.remaining}`);
} else {
  // Rate limit exceeded
  console.log(`Retry after: ${result.retryAfter} seconds`);
}
```

### Using Route Policies

```typescript
import { getPolicyForRoute, checkRateLimit } from './lib/rate-limit-adapters';

// Get policy for a specific route
const policy = getPolicyForRoute('/api/auth/login');
const result = await checkRateLimit(identifier, policy);
```

## Rate Limit Policies

The system includes pre-configured policies for different types of endpoints:

```typescript
export const ratePolicies = {
  auth: { limit: 5, windowSec: 60 },        // 5 attempts per minute
  chatSend: { limit: 30, windowSec: 60 },   // 30 messages per minute
  aiHandle: { limit: 20, windowSec: 60 },   // 20 AI requests per minute
  uploads: { limit: 10, windowSec: 300 },   // 10 uploads per 5 minutes
  publicApi: { limit: 120, windowSec: 60 }, // 120 requests per minute
  payments: { limit: 3, windowSec: 1800 },  // 3 attempts per 30 minutes
  passwordReset: { limit: 3, windowSec: 3600 }, // 3 attempts per hour
  otp: { limit: 5, windowSec: 600 },        // 5 attempts per 10 minutes
  contact: { limit: 3, windowSec: 86400 },  // 3 submissions per day
  reviews: { limit: 10, windowSec: 3600 },  // 10 reviews per hour
  default: { limit: 100, windowSec: 60 }    // 100 requests per minute
};
```

### Adding a New Policy

1. Add the policy to `ratePolicies` in `lib/rate-policies.ts`
2. Map the route in `routePolicyMap`
3. Update the middleware policy detection if needed

```typescript
// Add new policy
export const ratePolicies = {
  // ... existing policies
  newFeature: { limit: 15, windowSec: 120 }, // 15 requests per 2 minutes
};

// Map route to policy
export const routePolicyMap = {
  // ... existing mappings
  '/api/new-feature': 'newFeature',
};
```

## Vercel Deployment

### Why Redis is Required

On Vercel, each Edge function instance is stateless and may be created/destroyed between requests. In-memory rate limiting won't work because:

- **No Shared State**: Multiple instances can't share rate limit data
- **Cold Starts**: New instances start with empty memory
- **Scaling**: Rate limits reset when instances scale up/down

### Setting Up Upstash Redis

1. **Create Upstash Database**:
   - Go to [upstash.com](https://upstash.com)
   - Create a new Redis database
   - Choose a region close to your Vercel deployment

2. **Get Credentials**:
   - Copy the `UPSTASH_REDIS_REST_URL`
   - Copy the `UPSTASH_REDIS_REST_TOKEN`

3. **Set Environment Variables**:
   ```bash
   # In Vercel dashboard or .env.local
   UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your_token_here
   RATE_LIMIT_SALT=random_string_here
   ```

4. **Deploy**: The system automatically detects Redis credentials and switches to Redis mode

### Local Development

For local development, the system automatically uses in-memory storage when Redis credentials are not set:

```bash
# No Redis needed for local dev
npm run dev
```

## API Reference

### Core Functions

#### `checkRateLimit(identifier, policy)`

Applies rate limiting to a specific identifier using the specified policy.

**Parameters:**
- `identifier` (string): Unique identifier for the rate limit (e.g., user ID, IP address)
- `policy` (RateLimitPolicy): Rate limit policy object

**Returns:**
```typescript
{
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
  headers: Record<string, string>;
}
```

#### `getPolicyForRoute(pathname)`

Gets the rate limit policy for a specific route.

**Parameters:**
- `pathname` (string): The route pathname

**Returns:** RateLimitPolicy object

#### `getLimiter()`

Factory function that returns the appropriate rate limiter (Memory or Redis).

**Returns:** RateLimitAdapter instance

### Adapters

#### `MemoryAdapter`

In-memory rate limiting for local development.

#### `RedisAdapter`

Redis-based rate limiting for production using Upstash.

## Integration Examples

### Next.js Edge Middleware

The system automatically applies rate limiting through Edge middleware:

```typescript
// middleware.ts (automatically applied)
export async function middleware(request: NextRequest) {
  // Rate limiting is automatically applied here
  // No additional code needed in your API routes
}
```

### API Route Overrides

For specific endpoints that need custom rate limiting:

```typescript
// app/api/custom/route.ts
import { checkRateLimit } from '@/lib/rate-limit-adapters';
import { ratePolicies } from '@/lib/rate-policies';

export async function POST(request: Request) {
  const identifier = getIdentifier(request);
  const customPolicy = { limit: 50, windowSec: 30 }; // Custom policy
  
  const result = await checkRateLimit(identifier, customPolicy);
  
  if (!result.success) {
    return new Response(JSON.stringify({ error: 'Rate limited' }), {
      status: 429,
      headers: result.headers
    });
  }
  
  // Your API logic here
  return Response.json({ message: 'Success' });
}
```

### Express.js Middleware

```typescript
import { checkRateLimit } from './lib/rate-limit-adapters';
import { getPolicyForRoute } from './lib/rate-policies';

export const rateLimitMiddleware = (req: any, res: any, next: any) => {
  const pathname = req.path;
  const policy = getPolicyForRoute(pathname);
  const identifier = req.ip || 'unknown';
  
  checkRateLimit(identifier, policy)
    .then(result => {
      if (!result.success) {
        return res.status(429).json({
          error: 'Rate limit exceeded',
          retryAfter: result.retryAfter
        });
      }
      
      // Add headers
      Object.entries(result.headers).forEach(([key, value]) => {
        res.set(key, value);
      });
      
      next();
    })
    .catch(error => {
      console.error('Rate limiting error:', error);
      next(); // Fail open
    });
};
```

## HTTP Headers

The system automatically generates standard rate limit headers:

- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: When the rate limit resets (ISO string)
- `Retry-After`: Seconds to wait before retrying (when exceeded)

## Verification

### Testing Rate Limits

Use cURL to verify rate limiting behavior:

```bash
# Test AI endpoint rate limiting
curl -i -X POST https://your-domain.vercel.app/api/ai/handle \
  -d '{"prompt":"test"}' \
  -H 'content-type: application/json'

# Repeat until you get 429 response
# Check headers for rate limit information
```

### Expected Behavior

1. **First 20 requests**: Return 200 with `X-RateLimit-Remaining` decreasing
2. **21st request**: Returns 429 with `Retry-After` header
3. **After window expires**: Requests are allowed again

### Monitoring

Rate limit events are logged in JSON format:

```json
{"level":"info","ts":"2024-01-01T12:00:00.000Z","policy":"aiHandle","route":"/api/ai/handle","idHash":"user:abc123","method":"POST","success":true,"remaining":19,"resetAt":"2024-01-01T12:01:00.000Z"}
{"level":"warn","ts":"2024-01-01T12:00:30.000Z","policy":"aiHandle","route":"/api/ai/handle","idHash":"user:abc123","method":"POST","success":false,"remaining":0,"resetAt":"2024-01-01T12:01:00.000Z"}
```

## Error Handling

The system is designed to fail gracefully:

- **Fail-Open**: If rate limiting fails, requests are allowed to continue
- **Error Logging**: All errors are logged for debugging
- **Graceful Degradation**: System continues to function even with errors
- **Redis Fallback**: If Redis is unavailable, falls back to in-memory

## Performance Considerations

- **Edge Runtime**: Optimized for Next.js Edge functions
- **Redis Pipeline**: Uses atomic operations for consistency
- **Minimal Overhead**: Designed for high-performance applications
- **Automatic Cleanup**: Prevents memory bloat in development

## Security Features

- **Identifier Isolation**: Different identifiers are completely isolated
- **IP Hashing**: Raw IPs are never logged, only hashed versions
- **Fail-Open Design**: System continues to function even if rate limiting fails
- **Input Validation**: All inputs are validated and sanitized
- **Memory Protection**: Automatic cleanup prevents memory-based attacks

## Best Practices

1. **Choose Appropriate Limits**: Balance security with user experience
2. **Use Meaningful Identifiers**: Use user IDs, IPs, or action-specific identifiers
3. **Monitor Performance**: Watch Redis connection and response times
4. **Test Edge Cases**: Ensure system handles extreme scenarios gracefully
5. **Log Rate Limit Events**: Monitor for abuse patterns
6. **Set Salt**: Use a strong, random salt for IP hashing in production

## Troubleshooting

### Common Issues

1. **Redis Connection Failed**: Check UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
2. **Rate Limits Not Working**: Verify middleware is properly configured
3. **Performance Issues**: Check Redis response times and connection pooling
4. **Memory Usage High**: Check if cleanup is working properly (local dev only)

### Debug Mode

Enable debug logging by setting environment variable:
```bash
DEBUG=rate-limit npm start
```

### Redis Issues

1. **Connection Timeout**: Check network connectivity to Upstash
2. **Authentication Failed**: Verify token is correct
3. **Rate Limit Not Working**: Check Redis key expiration and pipeline execution

## Contributing

When contributing to the rate limiting system:

1. Add tests for new features
2. Update documentation
3. Follow existing code style
4. Test edge cases thoroughly
5. Test both Memory and Redis adapters

## License

This rate limiting system is part of the SewaGo project and follows the same license terms.
