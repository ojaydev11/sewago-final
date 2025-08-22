import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { behaviorTracker } from '@/lib/personalization/behavior-tracker';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const preferences = await prisma.userPreferences.findUnique({
      where: { userId }
    });

    if (!preferences) {
      // Return default preferences structure
      const defaultPreferences = {
        preferredCategories: [],
        preferredTimeSlots: [],
        preferredProviders: [],
        budgetRange: { min: 500, max: 5000 },
        locationPreferences: { areas: [], radius: 10 },
        serviceFrequency: {},
        personalizedSettings: {
          showRecommendations: true,
          receiveOffers: true,
          shareUsageData: true,
          locationTracking: false
        },
        culturalPreferences: {
          festivals: [],
          language: 'en',
          currency: 'NPR'
        },
        languagePreference: 'en',
        notificationPreferences: {
          recommendations: true,
          offers: true,
          seasonalSuggestions: true,
          locationBased: false
        }
      };

      return NextResponse.json({
        success: true,
        data: defaultPreferences
      });
    }

    return NextResponse.json({
      success: true,
      data: preferences
    });

  } catch (error) {
    console.error('Error getting user preferences:', error);
    return NextResponse.json(
      { error: 'Failed to get user preferences' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, preferences } = body;

    if (!userId || !preferences) {
      return NextResponse.json(
        { error: 'userId and preferences are required' },
        { status: 400 }
      );
    }

    // Validate and sanitize preferences
    const sanitizedPreferences = sanitizePreferences(preferences);

    // Update or create user preferences
    const updatedPreferences = await prisma.userPreferences.upsert({
      where: { userId },
      update: sanitizedPreferences,
      create: {
        userId,
        ...sanitizedPreferences
      }
    });

    // Track preference update
    await behaviorTracker.trackEvent({
      userId,
      action: 'click',
      clickTarget: 'update_preferences',
      metadata: {
        changedFields: Object.keys(sanitizedPreferences),
        timestamp: new Date().toISOString()
      }
    });

    // Trigger insights update
    await behaviorTracker.updateUserInsights(userId);

    return NextResponse.json({
      success: true,
      data: updatedPreferences,
      message: 'Preferences updated successfully'
    });

  } catch (error) {
    console.error('Error updating user preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update user preferences' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, onboardingData } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Process onboarding data and create initial preferences
    const initialPreferences = await processOnboardingData(onboardingData);

    const preferences = await prisma.userPreferences.create({
      data: {
        userId,
        ...initialPreferences
      }
    });

    // Track onboarding completion
    await behaviorTracker.trackEvent({
      userId,
      action: 'complete',
      clickTarget: 'preference_onboarding',
      metadata: {
        onboardingData,
        timestamp: new Date().toISOString()
      }
    });

    return NextResponse.json({
      success: true,
      data: preferences,
      message: 'Onboarding completed successfully'
    });

  } catch (error) {
    console.error('Error processing onboarding:', error);
    return NextResponse.json(
      { error: 'Failed to process onboarding' },
      { status: 500 }
    );
  }
}

function sanitizePreferences(preferences: any) {
  const sanitized: any = {};

  // Preferred categories
  if (preferences.preferredCategories && Array.isArray(preferences.preferredCategories)) {
    sanitized.preferredCategories = preferences.preferredCategories
      .filter((cat: string) => typeof cat === 'string' && cat.length > 0)
      .slice(0, 10); // Max 10 categories
  }

  // Preferred time slots
  if (preferences.preferredTimeSlots && Array.isArray(preferences.preferredTimeSlots)) {
    const validTimeSlots = ['morning', 'afternoon', 'evening', 'night'];
    sanitized.preferredTimeSlots = preferences.preferredTimeSlots
      .filter((slot: string) => validTimeSlots.includes(slot));
  }

  // Preferred providers
  if (preferences.preferredProviders && Array.isArray(preferences.preferredProviders)) {
    sanitized.preferredProviders = preferences.preferredProviders
      .filter((id: string) => typeof id === 'string' && id.length > 0)
      .slice(0, 20); // Max 20 providers
  }

  // Budget range
  if (preferences.budgetRange && typeof preferences.budgetRange === 'object') {
    const { min, max } = preferences.budgetRange;
    if (typeof min === 'number' && typeof max === 'number' && min >= 0 && max > min) {
      sanitized.budgetRange = { min: Math.max(0, min), max: Math.min(100000, max) };
    }
  }

  // Location preferences
  if (preferences.locationPreferences && typeof preferences.locationPreferences === 'object') {
    const { areas, radius } = preferences.locationPreferences;
    sanitized.locationPreferences = {
      areas: Array.isArray(areas) ? areas.filter((area: string) => typeof area === 'string').slice(0, 10) : [],
      radius: typeof radius === 'number' ? Math.min(50, Math.max(1, radius)) : 10
    };
  }

  // Service frequency
  if (preferences.serviceFrequency && typeof preferences.serviceFrequency === 'object') {
    sanitized.serviceFrequency = preferences.serviceFrequency;
  }

  // Personalized settings
  if (preferences.personalizedSettings && typeof preferences.personalizedSettings === 'object') {
    sanitized.personalizedSettings = {
      showRecommendations: Boolean(preferences.personalizedSettings.showRecommendations),
      receiveOffers: Boolean(preferences.personalizedSettings.receiveOffers),
      shareUsageData: Boolean(preferences.personalizedSettings.shareUsageData),
      locationTracking: Boolean(preferences.personalizedSettings.locationTracking)
    };
  }

  // Cultural preferences
  if (preferences.culturalPreferences && typeof preferences.culturalPreferences === 'object') {
    const validFestivals = ['Dashain', 'Tihar', 'Holi', 'Buddha Jayanti', 'New Year'];
    sanitized.culturalPreferences = {
      festivals: Array.isArray(preferences.culturalPreferences.festivals)
        ? preferences.culturalPreferences.festivals.filter((f: string) => validFestivals.includes(f))
        : [],
      language: ['en', 'ne'].includes(preferences.culturalPreferences.language) 
        ? preferences.culturalPreferences.language 
        : 'en',
      currency: 'NPR'
    };
  }

  // Language preference
  if (['en', 'ne'].includes(preferences.languagePreference)) {
    sanitized.languagePreference = preferences.languagePreference;
  }

  // Notification preferences
  if (preferences.notificationPreferences && typeof preferences.notificationPreferences === 'object') {
    sanitized.notificationPreferences = {
      recommendations: Boolean(preferences.notificationPreferences.recommendations),
      offers: Boolean(preferences.notificationPreferences.offers),
      seasonalSuggestions: Boolean(preferences.notificationPreferences.seasonalSuggestions),
      locationBased: Boolean(preferences.notificationPreferences.locationBased)
    };
  }

  return sanitized;
}

async function processOnboardingData(onboardingData: any) {
  const preferences: any = {
    preferredCategories: [],
    preferredTimeSlots: [],
    preferredProviders: [],
    budgetRange: { min: 500, max: 5000 },
    locationPreferences: { areas: [], radius: 10 },
    serviceFrequency: {},
    personalizedSettings: {
      showRecommendations: true,
      receiveOffers: true,
      shareUsageData: true,
      locationTracking: false
    },
    culturalPreferences: {
      festivals: [],
      language: 'en',
      currency: 'NPR'
    },
    languagePreference: 'en',
    notificationPreferences: {
      recommendations: true,
      offers: true,
      seasonalSuggestions: true,
      locationBased: false
    }
  };

  if (!onboardingData) return preferences;

  // Process service interests
  if (onboardingData.serviceInterests && Array.isArray(onboardingData.serviceInterests)) {
    preferences.preferredCategories = onboardingData.serviceInterests;
  }

  // Process time preferences
  if (onboardingData.timePreferences && Array.isArray(onboardingData.timePreferences)) {
    preferences.preferredTimeSlots = onboardingData.timePreferences;
  }

  // Process budget
  if (onboardingData.budget && typeof onboardingData.budget === 'object') {
    preferences.budgetRange = {
      min: onboardingData.budget.min || 500,
      max: onboardingData.budget.max || 5000
    };
  }

  // Process location
  if (onboardingData.location) {
    if (typeof onboardingData.location === 'string') {
      preferences.locationPreferences.areas = [onboardingData.location];
    } else if (Array.isArray(onboardingData.location)) {
      preferences.locationPreferences.areas = onboardingData.location;
    }
  }

  // Process language
  if (['en', 'ne'].includes(onboardingData.language)) {
    preferences.languagePreference = onboardingData.language;
    preferences.culturalPreferences.language = onboardingData.language;
  }

  // Process cultural preferences
  if (onboardingData.festivals && Array.isArray(onboardingData.festivals)) {
    preferences.culturalPreferences.festivals = onboardingData.festivals;
  }

  // Process notification preferences
  if (onboardingData.notifications && typeof onboardingData.notifications === 'object') {
    preferences.notificationPreferences = {
      ...preferences.notificationPreferences,
      ...onboardingData.notifications
    };
  }

  // Process privacy settings
  if (onboardingData.privacy && typeof onboardingData.privacy === 'object') {
    preferences.personalizedSettings = {
      ...preferences.personalizedSettings,
      ...onboardingData.privacy
    };
  }

  return preferences;
}