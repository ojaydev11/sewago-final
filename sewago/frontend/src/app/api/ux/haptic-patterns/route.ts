import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Default haptic patterns with Nepali cultural elements
const DEFAULT_PATTERNS = [
  {
    name: 'success',
    description: 'Success feedback pattern',
    pattern: [50, 50, 100],
    category: 'success',
    intensity: 70,
    duration: 200,
    isDefault: true,
    culturalContext: 'general',
    accessibility: true
  },
  {
    name: 'error',
    description: 'Error feedback pattern',
    pattern: [200, 100, 200],
    category: 'error',
    intensity: 80,
    duration: 500,
    isDefault: true,
    culturalContext: 'general',
    accessibility: true
  },
  {
    name: 'notification',
    description: 'General notification pattern',
    pattern: [100],
    category: 'notification',
    intensity: 50,
    duration: 100,
    isDefault: true,
    culturalContext: 'general',
    accessibility: true
  },
  {
    name: 'selection',
    description: 'Item selection feedback',
    pattern: [25],
    category: 'selection',
    intensity: 30,
    duration: 25,
    isDefault: true,
    culturalContext: 'general',
    accessibility: true
  },
  {
    name: 'warning',
    description: 'Warning feedback pattern',
    pattern: [150, 75, 150, 75, 150],
    category: 'warning',
    intensity: 75,
    duration: 600,
    isDefault: true,
    culturalContext: 'general',
    accessibility: true
  },
  {
    name: 'nepali_celebration',
    description: 'Cultural celebration pattern for festivals',
    pattern: [100, 50, 100, 50, 100, 50, 200],
    category: 'cultural',
    intensity: 60,
    duration: 650,
    isDefault: true,
    culturalContext: 'nepali',
    accessibility: false
  },
  {
    name: 'nepali_blessing',
    description: 'Gentle blessing pattern for booking confirmations',
    pattern: [75, 100, 75, 100, 75],
    category: 'cultural',
    intensity: 50,
    duration: 425,
    isDefault: true,
    culturalContext: 'nepali',
    accessibility: false
  },
  {
    name: 'dashain_drums',
    description: 'Dashain festival drum rhythm pattern',
    pattern: [120, 80, 120, 40, 80, 40, 160],
    category: 'cultural',
    intensity: 65,
    duration: 600,
    isDefault: true,
    culturalContext: 'nepali',
    accessibility: false
  },
  {
    name: 'tihar_bells',
    description: 'Tihar festival bell rhythm pattern',
    pattern: [40, 60, 40, 60, 40, 60, 80],
    category: 'cultural',
    intensity: 55,
    duration: 380,
    isDefault: true,
    culturalContext: 'nepali',
    accessibility: false
  }
];

// GET /api/ux/haptic-patterns - Retrieve all haptic patterns
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const culturalContext = searchParams.get('culturalContext');
    const accessibility = searchParams.get('accessibility');

    // Build filter conditions
    const where: any = {};
    if (category) where.category = category;
    if (culturalContext) where.culturalContext = culturalContext;
    if (accessibility !== null) where.accessibility = accessibility === 'true';

    // Fetch patterns from database
    const patterns = await prisma.hapticPattern.findMany({
      where,
      orderBy: [
        { isDefault: 'desc' },
        { category: 'asc' },
        { name: 'asc' }
      ]
    });

    // If no patterns exist, initialize with defaults
    if (patterns.length === 0) {
      const createdPatterns = await Promise.all(
        DEFAULT_PATTERNS.map(pattern =>
          prisma.hapticPattern.create({
            data: pattern
          })
        )
      );
      return NextResponse.json(createdPatterns);
    }

    return NextResponse.json(patterns);
  } catch (error) {
    console.error('Error fetching haptic patterns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch haptic patterns' },
      { status: 500 }
    );
  }
}

// POST /api/ux/haptic-patterns - Create a new haptic pattern
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
      description,
      pattern,
      category,
      intensity = 50,
      duration,
      culturalContext = 'general',
      accessibility = false
    } = body;

    // Validate required fields
    if (!name || !description || !pattern || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description, pattern, category' },
        { status: 400 }
      );
    }

    // Validate pattern array
    if (!Array.isArray(pattern) || pattern.some(p => typeof p !== 'number' || p < 0)) {
      return NextResponse.json(
        { error: 'Pattern must be an array of positive numbers' },
        { status: 400 }
      );
    }

    // Calculate duration if not provided
    const calculatedDuration = duration || pattern.reduce((sum, p) => sum + p, 0);

    // Validate intensity range
    if (intensity < 0 || intensity > 100) {
      return NextResponse.json(
        { error: 'Intensity must be between 0 and 100' },
        { status: 400 }
      );
    }

    // Create the haptic pattern
    const hapticPattern = await prisma.hapticPattern.create({
      data: {
        name,
        description,
        pattern: pattern,
        category,
        intensity,
        duration: calculatedDuration,
        culturalContext: culturalContext || null,
        accessibility,
        isDefault: false
      }
    });

    return NextResponse.json(hapticPattern, { status: 201 });
  } catch (error) {
    console.error('Error creating haptic pattern:', error);
    
    // Handle unique constraint violations
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A haptic pattern with this name already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create haptic pattern' },
      { status: 500 }
    );
  }
}

// PUT /api/ux/haptic-patterns - Update a haptic pattern
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
        { error: 'Pattern ID is required' },
        { status: 400 }
      );
    }

    // Validate pattern if provided
    if (updateData.pattern) {
      if (!Array.isArray(updateData.pattern) || 
          updateData.pattern.some(p => typeof p !== 'number' || p < 0)) {
        return NextResponse.json(
          { error: 'Pattern must be an array of positive numbers' },
          { status: 400 }
        );
      }
    }

    // Validate intensity if provided
    if (updateData.intensity !== undefined && 
        (updateData.intensity < 0 || updateData.intensity > 100)) {
      return NextResponse.json(
        { error: 'Intensity must be between 0 and 100' },
        { status: 400 }
      );
    }

    // Check if pattern exists and is not a default pattern (unless admin)
    const existingPattern = await prisma.hapticPattern.findUnique({
      where: { id }
    });

    if (!existingPattern) {
      return NextResponse.json(
        { error: 'Haptic pattern not found' },
        { status: 404 }
      );
    }

    if (existingPattern.isDefault) {
      return NextResponse.json(
        { error: 'Cannot modify default haptic patterns' },
        { status: 403 }
      );
    }

    // Update the pattern
    const updatedPattern = await prisma.hapticPattern.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(updatedPattern);
  } catch (error) {
    console.error('Error updating haptic pattern:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A haptic pattern with this name already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update haptic pattern' },
      { status: 500 }
    );
  }
}

// DELETE /api/ux/haptic-patterns - Delete a haptic pattern
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
        { error: 'Pattern ID is required' },
        { status: 400 }
      );
    }

    // Check if pattern exists and is not default
    const existingPattern = await prisma.hapticPattern.findUnique({
      where: { id }
    });

    if (!existingPattern) {
      return NextResponse.json(
        { error: 'Haptic pattern not found' },
        { status: 404 }
      );
    }

    if (existingPattern.isDefault) {
      return NextResponse.json(
        { error: 'Cannot delete default haptic patterns' },
        { status: 403 }
      );
    }

    // Delete the pattern
    await prisma.hapticPattern.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: 'Haptic pattern deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting haptic pattern:', error);
    return NextResponse.json(
      { error: 'Failed to delete haptic pattern' },
      { status: 500 }
    );
  }
}