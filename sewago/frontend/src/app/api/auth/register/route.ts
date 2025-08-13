import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import { User } from '@/models/User';
import { ProviderProfile } from '@/models/ProviderProfile';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { name, email, password, phone, district, role } = await request.json();

    // Validation
    if (!name || !email || !password || !phone || !district || !role) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    if (!['customer', 'provider'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role specified' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      name,
      email,
      hash: hashedPassword,
      phone,
      district,
      role,
    });

    // If provider, create provider profile
    if (role === 'provider') {
      await ProviderProfile.create({
        userId: user._id,
        skills: [],
        bio: '',
        ratingAvg: 0,
        jobsCompleted: 0,
        verified: false,
      });
    }

    // Return success (don't return the hash)
    const { hash, ...userWithoutHash } = user.toObject();
    
    return NextResponse.json(
      { 
        message: 'User created successfully',
        user: userWithoutHash
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
