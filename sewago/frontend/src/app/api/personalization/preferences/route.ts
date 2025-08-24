// GET/PATCH /api/personalization/preferences - User preferences management
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { UserPreferences, PersonalizationAPIResponse } from '@/types/personalization';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const preferences = await prisma.userPreferences.findUnique({
      where: { userId },
    });

    if (!preferences) {
      // Return default preferences for new users
      const defaultPreferences = {
        id: '',
        userId,
        preferredCategories: [],
        preferredTimeSlots: ['10:00-12:00', '14:00-16:00'],
        preferredProviders: [],
        budgetRange: { min: 500, max: 5000 },
        locationPreferences: { areas: [], radius: 5000 },
        serviceFrequency: {},
        personalizedSettings: {
          showPriceFirst: true,
          prioritizeRating: true,
          preferFamiliarProviders: false,
          autoBookingEnabled: false,
          smartSchedulingEnabled: true,
        },
        culturalPreferences: {
          festivals: [],
          traditions: [],
          language: 'en' as const,
          religiousConsiderations: [],
        },
        languagePreference: 'en' as const,
        notificationPreferences: {
          recommendations: true,
          offers: true,
          scheduling: true,
          reminders: true,
        },
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      return NextResponse.json({
        success: true,
        data: defaultPreferences,
        metadata: {
          processingTime: 0,
          algorithm: 'default',
          cacheHit: false,
          version: '1.0.0',
        },
      });
    }

    const response: PersonalizationAPIResponse<UserPreferences> = {
      success: true,
      data: preferences as UserPreferences,
      metadata: {
        processingTime: 0,
        algorithm: 'preferences-fetch',
        cacheHit: false,
        version: '1.0.0',
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, preferences } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!preferences) {
      return NextResponse.json(
        { success: false, error: 'Preferences data is required' },
        { status: 400 }
      );
    }

    // Validate preferences structure
    const validatedPreferences = validatePreferences(preferences);
    
    if (!validatedPreferences.isValid) {
      return NextResponse.json(
        { success: false, error: validatedPreferences.error },
        { status: 400 }
      );
    }

    // Update or create preferences
    const updatedPreferences = await prisma.userPreferences.upsert({
      where: { userId },
      update: {
        preferredCategories: preferences.preferredCategories || [],
        preferredTimeSlots: preferences.preferredTimeSlots || [],
        preferredProviders: preferences.preferredProviders || [],
        budgetRange: preferences.budgetRange || { min: 500, max: 5000 },
        locationPreferences: preferences.locationPreferences || { areas: [], radius: 5000 },
        serviceFrequency: preferences.serviceFrequency || {},
        personalizedSettings: preferences.personalizedSettings || {
          showPriceFirst: true,
          prioritizeRating: true,
          preferFamiliarProviders: false,
          autoBookingEnabled: false,
          smartSchedulingEnabled: true,
        },
        culturalPreferences: preferences.culturalPreferences || {
          festivals: [],
          traditions: [],
          language: 'en',
          religiousConsiderations: [],
        },
        languagePreference: preferences.languagePreference || 'en',
        notificationPreferences: preferences.notificationPreferences || {
          recommendations: true,
          offers: true,
          scheduling: true,
          reminders: true,
        },
        lastUpdated: new Date(),
      },
      create: {
        userId,
        preferredCategories: preferences.preferredCategories || [],
        preferredTimeSlots: preferences.preferredTimeSlots || [],
        preferredProviders: preferences.preferredProviders || [],
        budgetRange: preferences.budgetRange || { min: 500, max: 5000 },
        locationPreferences: preferences.locationPreferences || { areas: [], radius: 5000 },
        serviceFrequency: preferences.serviceFrequency || {},
        personalizedSettings: preferences.personalizedSettings || {
          showPriceFirst: true,
          prioritizeRating: true,
          preferFamiliarProviders: false,
          autoBookingEnabled: false,
          smartSchedulingEnabled: true,
        },
        culturalPreferences: preferences.culturalPreferences || {
          festivals: [],
          traditions: [],
          language: 'en',
          religiousConsiderations: [],
        },
        languagePreference: preferences.languagePreference || 'en',
        notificationPreferences: preferences.notificationPreferences || {
          recommendations: true,
          offers: true,
          scheduling: true,
          reminders: true,
        },
      },
    });

    // Trigger recommendations cache refresh (async)
    refreshRecommendationCache(userId).catch(console.error);

    const response: PersonalizationAPIResponse<typeof updatedPreferences> = {
      success: true,
      data: updatedPreferences,
      metadata: {
        processingTime: Date.now(),
        algorithm: 'preferences-update',
        cacheHit: false,
        version: '1.0.0',
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating user preferences:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
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
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Create initial preferences from onboarding data
    const initialPreferences = createInitialPreferences(onboardingData);

    const preferences = await prisma.userPreferences.create({
      data: {
        userId,
        ...initialPreferences,
      },
    });

    // Create initial personalization insights
    await prisma.personalizationInsights.create({
      data: {
        userId,
        topCategories: onboardingData?.interests || [],
        mostBookedTimes: ['10:00', '14:00', '16:00'],
        averageSpending: onboardingData?.budget || 2000,
        locationHotspots: [],
        seasonalPatterns: {},
        providerAffinities: [],
        predictedNeeds: [],
        personalityProfile: {
          priceConsciousness: onboardingData?.budget < 2000 ? 0.8 : 0.5,
          qualityFocus: 0.7,
          loyaltyTendency: 0.5,
          spontaneity: 0.5,
        },
        pricesensitivity: onboardingData?.budget < 1500 ? 'HIGH' : 
                         onboardingData?.budget > 5000 ? 'LOW' : 'MEDIUM',
        bookingPatterns: {
          preferredDays: ['Saturday', 'Sunday'],
          preferredTimes: onboardingData?.preferredTimes || ['10:00', '14:00'],
          bookingFrequency: 0,
          advanceBookingTendency: 0.5,
        },
        recommendationScore: 0.0,
      },
    });

    const response: PersonalizationAPIResponse<typeof preferences> = {
      success: true,
      data: preferences,
      metadata: {
        processingTime: Date.now(),
        algorithm: 'onboarding',
        cacheHit: false,
        version: '1.0.0',
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error creating initial preferences:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

// Helper functions
function validatePreferences(preferences: any): { isValid: boolean; error?: string } {
  try {
    // Validate budget range
    if (preferences.budgetRange) {
      if (preferences.budgetRange.min < 0 || preferences.budgetRange.max < 0) {
        return { isValid: false, error: 'Budget range values must be positive' };
      }
      if (preferences.budgetRange.min > preferences.budgetRange.max) {
        return { isValid: false, error: 'Minimum budget cannot be greater than maximum' };
      }
    }

    // Validate location preferences
    if (preferences.locationPreferences?.radius && preferences.locationPreferences.radius < 0) {
      return { isValid: false, error: 'Location radius must be positive' };
    }

    // Validate language preference
    if (preferences.languagePreference && !['en', 'ne'].includes(preferences.languagePreference)) {
      return { isValid: false, error: 'Language preference must be "en" or "ne"' };
    }

    // Validate arrays
    const arrayFields = ['preferredCategories', 'preferredTimeSlots', 'preferredProviders'];
    for (const field of arrayFields) {
      if (preferences[field] && !Array.isArray(preferences[field])) {
        return { isValid: false, error: `${field} must be an array` };
      }
    }

    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: 'Invalid preferences format' };
  }
}

function createInitialPreferences(onboardingData: any) {
  return {
    preferredCategories: onboardingData?.interests || [],
    preferredTimeSlots: onboardingData?.preferredTimes || ['10:00-12:00', '14:00-16:00'],
    preferredProviders: [],
    budgetRange: {
      min: onboardingData?.budget ? Math.max(500, onboardingData.budget * 0.5) : 500,
      max: onboardingData?.budget || 3000,
    },
    locationPreferences: {
      areas: onboardingData?.preferredAreas || [],
      radius: onboardingData?.serviceRadius || 5000,
    },
    serviceFrequency: {},
    personalizedSettings: {
      showPriceFirst: onboardingData?.prioritizePrice || true,
      prioritizeRating: onboardingData?.prioritizeQuality || true,
      preferFamiliarProviders: false,
      autoBookingEnabled: false,
      smartSchedulingEnabled: true,
    },
    culturalPreferences: {
      festivals: onboardingData?.festivals || [],
      traditions: [],
      language: onboardingData?.language || 'en',
      religiousConsiderations: [],
    },
    languagePreference: onboardingData?.language || 'en',
    notificationPreferences: {
      recommendations: true,
      offers: onboardingData?.wantsOffers !== false,
      scheduling: true,
      reminders: onboardingData?.wantsReminders !== false,
    },
  };
}

async function refreshRecommendationCache(userId: string) {
  // This would trigger a background job to refresh recommendations
  // For now, we'll just clear any cached data
  console.log(`Refreshing recommendation cache for user ${userId}`);
}