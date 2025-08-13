import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { ProviderProfile } from '@/models/ProviderProfile';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'provider') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const { skills, bio } = await request.json();

    // Validation
    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return NextResponse.json(
        { error: 'At least one skill is required' },
        { status: 400 }
      );
    }

    // Update or create provider profile
    const profile = await ProviderProfile.findOneAndUpdate(
      { userId: session.user.id },
      {
        skills,
        bio: bio || '',
        updatedAt: new Date(),
      },
      {
        new: true,
        upsert: true,
      }
    );

    return NextResponse.json({
      message: 'Profile updated successfully',
      profile,
    });

  } catch (error) {
    console.error('Provider profile update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'provider') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Get provider profile
    const profile = await ProviderProfile.findOne({ userId: session.user.id });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ profile });

  } catch (error) {
    console.error('Provider profile fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
