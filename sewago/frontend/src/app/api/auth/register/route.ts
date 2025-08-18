import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { api } from '@/lib/api';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['CUSTOMER', 'PROVIDER']).default('CUSTOMER'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // Register user via backend API
    const response = await api.post('/auth/register', {
      name: validatedData.name,
      email: validatedData.email,
      password: validatedData.password,
      role: validatedData.role
    });
    
    const { user } = response.data;
    
    return NextResponse.json({
      user,
      message: 'User registered successfully'
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    // Handle axios errors
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response: { status: number; data: Record<string, unknown> } };
      return NextResponse.json(
        axiosError.response.data,
        { status: axiosError.response.status }
      );
    }

    console.error('Error registering user:', error);
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
}
