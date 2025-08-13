
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { generateSecureId } from '@/lib/utils';

// In production, use Redis or database
const csrfTokens = new Map<string, { token: string; expires: number }>();

export async function GET(request: NextRequest) {
  try {
    const sessionToken = await getToken({ req: request });
    
    if (!sessionToken?.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate CSRF token
    const csrfToken = generateSecureId(32);
    const expires = Date.now() + (60 * 60 * 1000); // 1 hour
    
    csrfTokens.set(sessionToken.sub, { token: csrfToken, expires });
    
    // Clean up expired tokens
    const now = Date.now();
    for (const [key, value] of csrfTokens.entries()) {
      if (now > value.expires) {
        csrfTokens.delete(key);
      }
    }

    return NextResponse.json({ 
      csrfToken,
      expires: new Date(expires).toISOString()
    });

  } catch (error) {
    console.error('CSRF token generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    );
  }
}
