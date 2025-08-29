import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { identifier, action } = await request.json();
    
    const salt = process.env.RATE_LIMIT_SALT || 'default-salt-change-in-production';
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
    
    // Simple rate limiting logic (can be enhanced with Redis)
    const key = `rate_limit:${action}:${identifier}:${salt}`;
    
    if (redisUrl && redisToken) {
      // Use Redis for rate limiting
      const response = await fetch(`${redisUrl}/get/${key}`, {
        headers: {
          'Authorization': `Bearer ${redisToken}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const currentCount = parseInt(data.result || '0');
        
        if (currentCount >= 10) { // 10 requests per window
          return NextResponse.json(
            { error: 'Rate limit exceeded' },
            { status: 429 }
          );
        }
        
        // Increment counter
        await fetch(`${redisUrl}/incr/${key}`, {
          headers: {
            'Authorization': `Bearer ${redisToken}`,
          },
        });
        
        // Set expiry (1 minute)
        await fetch(`${redisUrl}/expire/${key}/60`, {
          headers: {
            'Authorization': `Bearer ${redisToken}`,
          },
        });
      }
    }
    
    return NextResponse.json({ success: true, remaining: 9 });
    
  } catch (error) {
    console.error('Rate limit API error:', error);
    return NextResponse.json(
      { error: 'Rate limit service unavailable' },
      { status: 500 }
    );
  }
}
