import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { api } from '@/lib/api';

// Align with backend validation: name, email, phone, password, role ('user' | 'provider')
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[0-9]{10}$/,'Phone must be 10 digits'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['user', 'provider']).default('user'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, password, role } = registerSchema.parse(body);

    // Forward to backend API
    const resp = await api.post('/auth/register', { name, email, phone, password, role });

    // Optionally forward any Set-Cookie from backend in the response headers
    const next = NextResponse.json(resp.data, { status: 201 });
    const headersRecord = resp.headers as unknown as Record<string, string | string[] | undefined>;
    const setCookie = headersRecord['set-cookie'];
    if (setCookie && Array.isArray(setCookie)) {
      for (const cookie of setCookie) {
        next.headers.append('set-cookie', cookie);
      }
    }
    return next;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: { message?: string }, status?: number } };
      return NextResponse.json(
        { error: axiosError.response?.data?.message ?? 'Registration failed' },
        { status: axiosError.response?.status ?? 500 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
}
