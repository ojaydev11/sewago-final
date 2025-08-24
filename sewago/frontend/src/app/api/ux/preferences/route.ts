import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface UXPreferencesData {
  hapticEnabled?: boolean;
  hapticIntensity?: number;
  soundEnabled?: boolean;
  soundVolume?: number;
  voiceGuidance?: boolean;
  animationsEnabled?: boolean;
  reducedMotion?: boolean;
  highContrast?: boolean;
  colorTheme?: 'auto' | 'light' | 'dark';
  contextualAI?: boolean;
  culturalSounds?: boolean;
  customPatterns?: any[];
}

// GET /api/ux/preferences - Get user's UX preferences
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Fetch user's UX preferences
    let preferences = await prisma.userUXPreferences.findUnique({
      where: { userId: session.user.id }
    });

    // If no preferences exist, create default ones
    if (!preferences) {
      preferences = await prisma.userUXPreferences.create({
        data: {
          userId: session.user.id,
          hapticEnabled: true,
          hapticIntensity: 50,
          soundEnabled: true,
          soundVolume: 70,
          voiceGuidance: false,
          animationsEnabled: true,
          reducedMotion: false,
          highContrast: false,
          colorTheme: 'auto',
          contextualAI: true,
          culturalSounds: true,
          customPatterns: []
        }
      });
    }

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Error fetching UX preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch UX preferences' },
      { status: 500 }
    );
  }
}

// POST /api/ux/preferences - Update user's UX preferences
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
    const updateData: UXPreferencesData = body;

    // Validate the input data
    const validationErrors = validateUXPreferences(updateData);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }

    // Update or create preferences
    const preferences = await prisma.userUXPreferences.upsert({
      where: { userId: session.user.id },
      update: updateData,
      create: {
        userId: session.user.id,
        hapticEnabled: updateData.hapticEnabled ?? true,
        hapticIntensity: updateData.hapticIntensity ?? 50,
        soundEnabled: updateData.soundEnabled ?? true,
        soundVolume: updateData.soundVolume ?? 70,
        voiceGuidance: updateData.voiceGuidance ?? false,
        animationsEnabled: updateData.animationsEnabled ?? true,
        reducedMotion: updateData.reducedMotion ?? false,
        highContrast: updateData.highContrast ?? false,
        colorTheme: updateData.colorTheme ?? 'auto',
        contextualAI: updateData.contextualAI ?? true,
        culturalSounds: updateData.culturalSounds ?? true,
        customPatterns: updateData.customPatterns ?? []
      }
    });

    // Log the preferences change for analytics
    await logPreferencesChange(session.user.id, updateData);

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Error updating UX preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update UX preferences' },
      { status: 500 }
    );
  }
}

// PUT /api/ux/preferences - Partial update of UX preferences
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
    const updateData: Partial<UXPreferencesData> = body;

    // Validate the partial input data
    const validationErrors = validateUXPreferences(updateData);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }

    // Check if preferences exist
    const existingPreferences = await prisma.userUXPreferences.findUnique({
      where: { userId: session.user.id }
    });

    if (!existingPreferences) {
      return NextResponse.json(
        { error: 'UX preferences not found. Please create preferences first.' },
        { status: 404 }
      );
    }

    // Update only the provided fields
    const updatedPreferences = await prisma.userUXPreferences.update({
      where: { userId: session.user.id },
      data: updateData
    });

    // Log the preferences change for analytics
    await logPreferencesChange(session.user.id, updateData);

    return NextResponse.json(updatedPreferences);
  } catch (error) {
    console.error('Error partially updating UX preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update UX preferences' },
      { status: 500 }
    );
  }
}

// DELETE /api/ux/preferences - Reset UX preferences to defaults
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Reset to default preferences
    const defaultPreferences = await prisma.userUXPreferences.upsert({
      where: { userId: session.user.id },
      update: {
        hapticEnabled: true,
        hapticIntensity: 50,
        soundEnabled: true,
        soundVolume: 70,
        voiceGuidance: false,
        animationsEnabled: true,
        reducedMotion: false,
        highContrast: false,
        colorTheme: 'auto',
        contextualAI: true,
        culturalSounds: true,
        customPatterns: []
      },
      create: {
        userId: session.user.id,
        hapticEnabled: true,
        hapticIntensity: 50,
        soundEnabled: true,
        soundVolume: 70,
        voiceGuidance: false,
        animationsEnabled: true,
        reducedMotion: false,
        highContrast: false,
        colorTheme: 'auto',
        contextualAI: true,
        culturalSounds: true,
        customPatterns: []
      }
    });

    // Log the preferences reset
    await logPreferencesChange(session.user.id, { reset: true });

    return NextResponse.json({
      message: 'UX preferences reset to defaults',
      preferences: defaultPreferences
    });
  } catch (error) {
    console.error('Error resetting UX preferences:', error);
    return NextResponse.json(
      { error: 'Failed to reset UX preferences' },
      { status: 500 }
    );
  }
}

// Validation function for UX preferences
function validateUXPreferences(data: Partial<UXPreferencesData>): string[] {
  const errors: string[] = [];

  // Validate hapticIntensity
  if (data.hapticIntensity !== undefined) {
    if (typeof data.hapticIntensity !== 'number' || 
        data.hapticIntensity < 0 || 
        data.hapticIntensity > 100) {
      errors.push('hapticIntensity must be a number between 0 and 100');
    }
  }

  // Validate soundVolume
  if (data.soundVolume !== undefined) {
    if (typeof data.soundVolume !== 'number' || 
        data.soundVolume < 0 || 
        data.soundVolume > 100) {
      errors.push('soundVolume must be a number between 0 and 100');
    }
  }

  // Validate colorTheme
  if (data.colorTheme !== undefined) {
    if (!['auto', 'light', 'dark'].includes(data.colorTheme)) {
      errors.push('colorTheme must be one of: auto, light, dark');
    }
  }

  // Validate boolean fields
  const booleanFields = [
    'hapticEnabled', 'soundEnabled', 'voiceGuidance', 
    'animationsEnabled', 'reducedMotion', 'highContrast', 
    'contextualAI', 'culturalSounds'
  ];

  booleanFields.forEach(field => {
    if (data[field] !== undefined && typeof data[field] !== 'boolean') {
      errors.push(`${field} must be a boolean`);
    }
  });

  // Validate customPatterns
  if (data.customPatterns !== undefined) {
    if (!Array.isArray(data.customPatterns)) {
      errors.push('customPatterns must be an array');
    }
  }

  return errors;
}

// Analytics logging function
async function logPreferencesChange(userId: string, changes: any) {
  try {
    await prisma.uXAnalytics.create({
      data: {
        userId,
        interactionType: 'preferences_change',
        elementId: 'ux_preferences',
        duration: 0,
        context: {
          changes,
          timestamp: new Date().toISOString(),
          userAgent: 'API'
        },
        deviceType: 'API',
        screenSize: 'N/A'
      }
    });
  } catch (error) {
    console.error('Error logging preferences change:', error);
  }
}