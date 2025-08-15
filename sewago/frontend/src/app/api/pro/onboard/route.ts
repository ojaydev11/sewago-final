import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name, 
      phone, 
      skills, 
      zones, 
      ekycDetails, 
      tools, 
      experience 
    } = body;

    if (!name || !phone || !skills || !zones) {
      return NextResponse.json(
        { error: 'Name, phone, skills, and zones are required' },
        { status: 400 }
      );
    }

    // Check if provider already exists
    const existingProvider = await prisma.provider.findUnique({
      where: {
        phone
      }
    });

    if (existingProvider) {
      return NextResponse.json(
        { error: 'Provider with this phone number already exists' },
        { status: 400 }
      );
    }

    // Create new provider with PROVISIONAL status
    const provider = await prisma.provider.create({
      data: {
        name,
        phone,
        skills,
        zones,
        verified: false,
        tier: 'PROVISIONAL',
        onTimePct: 100,
        completionPct: 100,
        yearsActive: experience || 1,
        isOnline: false
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Provider onboarded successfully',
      provider: {
        id: provider.id,
        name: provider.name,
        tier: provider.tier,
        status: 'PROVISIONAL'
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error onboarding provider:', error);
    return NextResponse.json(
      { error: 'Failed to onboard provider' },
      { status: 500 }
    );
  }
}
