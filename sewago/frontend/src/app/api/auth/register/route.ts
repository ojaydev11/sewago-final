import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { dbConnect } from '@/lib/mongodb';
import { User } from '@/models/User';
import { mockStore } from '@/lib/mockStore';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['customer', 'provider']).default('customer'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, role } = registerSchema.parse(body);

    const connection = await dbConnect();
    
    if (connection) {
      // Use MongoDB
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 409 }
        );
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);

      // Create user
      const user = await User.create({
        name,
        email,
        passwordHash,
        role,
      });

      return NextResponse.json({
        message: 'User created successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } else {
      // Use mock store
      const existingUser = await mockStore.findOne({ email });
      if (existingUser) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 409 }
        );
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);

      // Create user in mock store
      const user = await mockStore.create({
        name,
        email,
        passwordHash,
        role,
      });

      return NextResponse.json({
        message: 'User created successfully (mock mode)',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
