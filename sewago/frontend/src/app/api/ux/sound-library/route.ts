import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Default sound assets with Nepali cultural elements
const DEFAULT_SOUND_ASSETS = [
  {
    name: 'ui_click',
    fileUrl: '/sounds/ui/click.mp3',
    category: 'ui',
    duration: 100,
    volume: 50,
    format: 'mp3',
    culturalContext: 'general',
    accessibility: true,
    isDefault: true
  },
  {
    name: 'ui_hover',
    fileUrl: '/sounds/ui/hover.mp3',
    category: 'ui',
    duration: 80,
    volume: 30,
    format: 'mp3',
    culturalContext: 'general',
    accessibility: true,
    isDefault: true
  },
  {
    name: 'success',
    fileUrl: '/sounds/feedback/success.mp3',
    category: 'success',
    duration: 800,
    volume: 70,
    format: 'mp3',
    culturalContext: 'general',
    accessibility: true,
    isDefault: true
  },
  {
    name: 'error',
    fileUrl: '/sounds/feedback/error.mp3',
    category: 'error',
    duration: 600,
    volume: 80,
    format: 'mp3',
    culturalContext: 'general',
    accessibility: true,
    isDefault: true
  },
  {
    name: 'notification',
    fileUrl: '/sounds/notifications/gentle.mp3',
    category: 'notification',
    duration: 500,
    volume: 60,
    format: 'mp3',
    culturalContext: 'general',
    accessibility: true,
    isDefault: true
  },
  {
    name: 'nepali_bell',
    fileUrl: '/sounds/cultural/nepali_bell.mp3',
    category: 'cultural',
    duration: 2000,
    volume: 65,
    format: 'mp3',
    culturalContext: 'nepali',
    accessibility: false,
    isDefault: true
  },
  {
    name: 'nepali_singing_bowl',
    fileUrl: '/sounds/cultural/singing_bowl.mp3',
    category: 'cultural',
    duration: 3000,
    volume: 55,
    format: 'mp3',
    culturalContext: 'nepali',
    accessibility: false,
    isDefault: true
  },
  {
    name: 'nepali_chime',
    fileUrl: '/sounds/cultural/wind_chime.mp3',
    category: 'ambient',
    duration: 5000,
    volume: 40,
    format: 'mp3',
    culturalContext: 'nepali',
    accessibility: false,
    isDefault: true
  },
  {
    name: 'booking_success',
    fileUrl: '/sounds/cultural/nepali_success.mp3',
    category: 'success',
    duration: 1500,
    volume: 75,
    format: 'mp3',
    culturalContext: 'nepali',
    accessibility: true,
    isDefault: true
  },
  {
    name: 'payment_success',
    fileUrl: '/sounds/cultural/nepali_celebration.mp3',
    category: 'success',
    duration: 2000,
    volume: 80,
    format: 'mp3',
    culturalContext: 'nepali',
    accessibility: true,
    isDefault: true
  },
  {
    name: 'dashain_drums',
    fileUrl: '/sounds/cultural/dashain_drums.mp3',
    category: 'cultural',
    duration: 4000,
    volume: 70,
    format: 'mp3',
    culturalContext: 'nepali',
    accessibility: false,
    isDefault: true
  },
  {
    name: 'tihar_deusi',
    fileUrl: '/sounds/cultural/tihar_deusi.mp3',
    category: 'cultural',
    duration: 3500,
    volume: 65,
    format: 'mp3',
    culturalContext: 'nepali',
    accessibility: false,
    isDefault: true
  },
  {
    name: 'himalayan_breeze',
    fileUrl: '/sounds/ambient/himalayan_breeze.mp3',
    category: 'ambient',
    duration: 8000,
    volume: 35,
    format: 'mp3',
    culturalContext: 'nepali',
    accessibility: false,
    isDefault: true
  }
];

// GET /api/ux/sound-library - Retrieve sound assets
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const culturalContext = searchParams.get('culturalContext');
    const accessibility = searchParams.get('accessibility');
    const format = searchParams.get('format');

    // Build filter conditions
    const where: any = {};
    if (category) where.category = category;
    if (culturalContext) where.culturalContext = culturalContext;
    if (accessibility !== null) where.accessibility = accessibility === 'true';
    if (format) where.format = format;

    // Fetch sound assets from database
    const soundAssets = await prisma.soundAsset.findMany({
      where,
      orderBy: [
        { isDefault: 'desc' },
        { category: 'asc' },
        { name: 'asc' }
      ]
    });

    // If no sound assets exist, initialize with defaults
    if (soundAssets.length === 0) {
      const createdAssets = await Promise.all(
        DEFAULT_SOUND_ASSETS.map(asset =>
          prisma.soundAsset.create({
            data: asset
          })
        )
      );
      return NextResponse.json(createdAssets);
    }

    return NextResponse.json(soundAssets);
  } catch (error) {
    console.error('Error fetching sound library:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sound library' },
      { status: 500 }
    );
  }
}

// POST /api/ux/sound-library - Create a new sound asset
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      fileUrl,
      category,
      duration,
      volume = 70,
      format,
      culturalContext = 'general',
      accessibility = false
    } = body;

    // Validate required fields
    if (!name || !fileUrl || !category || !duration || !format) {
      return NextResponse.json(
        { error: 'Missing required fields: name, fileUrl, category, duration, format' },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = ['ui', 'notification', 'success', 'error', 'ambient', 'cultural'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: `Category must be one of: ${validCategories.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate format
    const validFormats = ['mp3', 'wav', 'ogg'];
    if (!validFormats.includes(format)) {
      return NextResponse.json(
        { error: `Format must be one of: ${validFormats.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate volume range
    if (volume < 0 || volume > 100) {
      return NextResponse.json(
        { error: 'Volume must be between 0 and 100' },
        { status: 400 }
      );
    }

    // Validate duration
    if (duration <= 0) {
      return NextResponse.json(
        { error: 'Duration must be a positive number' },
        { status: 400 }
      );
    }

    // Validate cultural context
    const validCulturalContexts = ['general', 'nepali'];
    if (culturalContext && !validCulturalContexts.includes(culturalContext)) {
      return NextResponse.json(
        { error: `Cultural context must be one of: ${validCulturalContexts.join(', ')}` },
        { status: 400 }
      );
    }

    // Create the sound asset
    const soundAsset = await prisma.soundAsset.create({
      data: {
        name,
        fileUrl,
        category,
        duration,
        volume,
        format,
        culturalContext: culturalContext || null,
        accessibility,
        isDefault: false
      }
    });

    return NextResponse.json(soundAsset, { status: 201 });
  } catch (error) {
    console.error('Error creating sound asset:', error);
    
    // Handle unique constraint violations
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A sound asset with this name already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create sound asset' },
      { status: 500 }
    );
  }
}

// PUT /api/ux/sound-library - Update a sound asset
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Sound asset ID is required' },
        { status: 400 }
      );
    }

    // Validate volume if provided
    if (updateData.volume !== undefined && 
        (updateData.volume < 0 || updateData.volume > 100)) {
      return NextResponse.json(
        { error: 'Volume must be between 0 and 100' },
        { status: 400 }
      );
    }

    // Validate duration if provided
    if (updateData.duration !== undefined && updateData.duration <= 0) {
      return NextResponse.json(
        { error: 'Duration must be a positive number' },
        { status: 400 }
      );
    }

    // Check if sound asset exists and is not default
    const existingAsset = await prisma.soundAsset.findUnique({
      where: { id }
    });

    if (!existingAsset) {
      return NextResponse.json(
        { error: 'Sound asset not found' },
        { status: 404 }
      );
    }

    if (existingAsset.isDefault) {
      return NextResponse.json(
        { error: 'Cannot modify default sound assets' },
        { status: 403 }
      );
    }

    // Update the sound asset
    const updatedAsset = await prisma.soundAsset.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(updatedAsset);
  } catch (error) {
    console.error('Error updating sound asset:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A sound asset with this name already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update sound asset' },
      { status: 500 }
    );
  }
}

// DELETE /api/ux/sound-library - Delete a sound asset
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Sound asset ID is required' },
        { status: 400 }
      );
    }

    // Check if sound asset exists and is not default
    const existingAsset = await prisma.soundAsset.findUnique({
      where: { id }
    });

    if (!existingAsset) {
      return NextResponse.json(
        { error: 'Sound asset not found' },
        { status: 404 }
      );
    }

    if (existingAsset.isDefault) {
      return NextResponse.json(
        { error: 'Cannot delete default sound assets' },
        { status: 403 }
      );
    }

    // Delete the sound asset
    await prisma.soundAsset.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: 'Sound asset deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting sound asset:', error);
    return NextResponse.json(
      { error: 'Failed to delete sound asset' },
      { status: 500 }
    );
  }
}