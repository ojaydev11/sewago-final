import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { ProviderProfile } from '@/models/ProviderProfile';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    await dbConnect();

    const { verified } = await request.json();

    if (typeof verified !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid verification status' },
        { status: 400 }
      );
    }

    const updatedProfile = await ProviderProfile.findByIdAndUpdate(
      id,
      { 
        verified,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('userId', 'name email phone district');

    if (!updatedProfile) {
      return NextResponse.json(
        { error: 'Provider profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: `Provider ${verified ? 'verified' : 'unverified'} successfully`, 
      profile: updatedProfile 
    });
  } catch (error) {
    console.error('Error updating provider verification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
