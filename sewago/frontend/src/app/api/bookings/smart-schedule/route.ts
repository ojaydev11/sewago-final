import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Schema for smart scheduling request
const smartScheduleSchema = z.object({
  serviceId: z.string(),
  providerId: z.string().optional(),
  address: z.string(),
  preferredTimes: z.array(z.object({
    start: z.string(),
    end: z.string(),
    priority: z.number().min(1).max(5),
    dayOfWeek: z.number().min(0).max(6).optional()
  })).optional().default([]),
  weatherSensitive: z.boolean().default(false),
  trafficOptimized: z.boolean().default(true),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  flexibilityHours: z.number().min(1).max(168).default(24), // Hours of scheduling flexibility
  excludeDates: z.array(z.string().datetime()).optional().default([]),
  includeFestivals: z.boolean().default(false) // Consider Nepali festivals
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const data = smartScheduleSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        preferences: true,
        behaviors: {
          where: { serviceId: data.serviceId },
          orderBy: { timestamp: 'desc' },
          take: 10
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Find service
    const service = await prisma.service.findUnique({
      where: { id: data.serviceId }
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    // Generate smart schedule recommendations
    const recommendations = await generateSmartRecommendations({
      user,
      service,
      request: data
    });

    // Get weather data if weather-sensitive
    const weatherData = data.weatherSensitive 
      ? await getWeatherForecast(extractCityFromAddress(data.address))
      : null;

    // Get traffic predictions if traffic-optimized
    const trafficData = data.trafficOptimized
      ? await getTrafficPredictions(data.address)
      : null;

    // Merge all data for final recommendations
    const finalRecommendations = await refineRecommendations(
      recommendations,
      weatherData,
      trafficData,
      data
    );

    return NextResponse.json({
      recommendations: finalRecommendations,
      metadata: {
        totalOptions: finalRecommendations.length,
        weatherConsidered: data.weatherSensitive,
        trafficOptimized: data.trafficOptimized,
        userPreferencesApplied: !!user.preferences,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error generating smart schedule:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function generateSmartRecommendations({
  user,
  service,
  request
}: {
  user: any;
  service: any;
  request: any;
}) {
  // Find available providers
  const providers = await prisma.provider.findMany({
    where: {
      verified: true,
      isOnline: true,
      skills: { has: service.category },
      zones: { hasSome: [extractCityFromAddress(request.address)] },
      ...(request.providerId ? { id: request.providerId } : {})
    },
    orderBy: [
      { tier: 'desc' },
      { completionPct: 'desc' },
      { onTimePct: 'desc' }
    ],
    take: 10
  });

  const recommendations = [];
  const now = new Date();
  const maxDate = new Date(now.getTime() + request.flexibilityHours * 60 * 60 * 1000);

  for (const provider of providers) {
    const providerRecommendations = await generateProviderTimeSlots({
      provider,
      user,
      service,
      request,
      startTime: now,
      endTime: maxDate
    });

    recommendations.push(...providerRecommendations);
  }

  // Sort by overall score
  return recommendations.sort((a, b) => b.overallScore - a.overallScore);
}

async function generateProviderTimeSlots({
  provider,
  user,
  service,
  request,
  startTime,
  endTime
}: any) {
  const timeSlots = [];
  const current = new Date(startTime);
  
  // Get provider's existing bookings to avoid conflicts
  const existingBookings = await prisma.booking.findMany({
    where: {
      providerId: provider.id,
      scheduledAt: {
        gte: startTime,
        lte: endTime
      },
      status: {
        in: ['CONFIRMED', 'PROVIDER_ASSIGNED', 'EN_ROUTE', 'IN_PROGRESS']
      }
    }
  });

  const bookedTimes = new Set(
    existingBookings.map(booking => 
      booking.scheduledAt ? booking.scheduledAt.getTime() : 0
    )
  );

  while (current <= endTime) {
    // Skip excluded dates
    if (request.excludeDates.some((date: string) => 
      new Date(date).toDateString() === current.toDateString()
    )) {
      current.setDate(current.getDate() + 1);
      continue;
    }

    // Check if it's a working day and hour
    const dayOfWeek = current.getDay();
    const hour = current.getHours();
    
    // Skip weekends for most services (configurable)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      current.setHours(9, 0, 0, 0);
      current.setDate(current.getDate() + (dayOfWeek === 0 ? 1 : 2));
      continue;
    }

    // Working hours: 9 AM to 6 PM
    if (hour < 9) {
      current.setHours(9, 0, 0, 0);
      continue;
    }
    if (hour >= 18) {
      current.setHours(9, 0, 0, 0);
      current.setDate(current.getDate() + 1);
      continue;
    }

    // Skip if provider is already booked
    if (bookedTimes.has(current.getTime())) {
      current.setHours(current.getHours() + 1);
      continue;
    }

    // Check Nepali holidays if requested
    if (request.includeFestivals) {
      const isHoliday = await checkNepaliHoliday(current);
      if (isHoliday) {
        current.setHours(9, 0, 0, 0);
        current.setDate(current.getDate() + 1);
        continue;
      }
    }

    // Calculate scores for this time slot
    const scores = await calculateTimeSlotScores({
      timeSlot: new Date(current),
      provider,
      user,
      service,
      request
    });

    if (scores.overallScore > 0.3) { // Only include viable options
      timeSlots.push({
        providerId: provider.id,
        providerName: provider.name,
        providerTier: provider.tier,
        providerScore: (provider.completionPct + provider.onTimePct) / 200,
        suggestedTime: new Date(current),
        ...scores,
        estimatedDuration: getEstimatedServiceDuration(service.category),
        estimatedCost: service.basePrice,
        confidence: scores.overallScore
      });
    }

    // Move to next hour
    current.setHours(current.getHours() + 1);
  }

  return timeSlots.slice(0, 5); // Top 5 recommendations per provider
}

async function calculateTimeSlotScores({
  timeSlot,
  provider,
  user,
  service,
  request
}: any) {
  let overallScore = 0.5; // Base score
  
  // Provider availability score (mock - in production, check real availability)
  const providerScore = (provider.completionPct + provider.onTimePct) / 200;
  overallScore *= (providerScore * 0.8 + 0.2); // Weight provider quality

  // User preference alignment
  const userPreferenceScore = calculateUserPreferenceScore(
    timeSlot,
    request.preferredTimes,
    user.preferences
  );
  overallScore *= (userPreferenceScore * 0.7 + 0.3);

  // Historical booking patterns
  const historicalScore = calculateHistoricalScore(timeSlot, user.behaviors);
  overallScore *= (historicalScore * 0.6 + 0.4);

  // Urgency factor
  const urgencyMultiplier = {
    'LOW': 0.8,
    'MEDIUM': 1.0,
    'HIGH': 1.2
  }[request.urgency] || 1.0;
  
  // Time proximity bonus for urgent requests
  if (request.urgency === 'HIGH') {
    const hoursFromNow = (timeSlot.getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursFromNow < 4) {
      overallScore *= 1.3; // Bonus for very soon availability
    }
  }

  overallScore *= urgencyMultiplier;

  return {
    overallScore: Math.min(1.0, overallScore),
    providerScore,
    userPreferenceScore,
    historicalScore,
    reasoning: {
      factors: [
        'provider_quality',
        'user_preferences', 
        'historical_patterns',
        'urgency',
        'availability'
      ],
      explanation: `Score based on provider performance (${(providerScore * 100).toFixed(0)}%), your preferences (${(userPreferenceScore * 100).toFixed(0)}%), and booking history`
    }
  };
}

function calculateUserPreferenceScore(timeSlot: Date, preferredTimes: any[], userPreferences: any) {
  if (!preferredTimes.length) return 0.7; // Neutral if no preferences
  
  let bestScore = 0;
  const hour = timeSlot.getHours();
  const dayOfWeek = timeSlot.getDay();
  
  for (const pref of preferredTimes) {
    const startHour = parseInt(pref.start.split(':')[0]);
    const endHour = parseInt(pref.end.split(':')[0]);
    
    // Check if time matches preference
    if (hour >= startHour && hour <= endHour) {
      // Check day of week if specified
      if (!pref.dayOfWeek || pref.dayOfWeek === dayOfWeek) {
        const score = pref.priority / 5; // Convert priority (1-5) to score (0.2-1.0)
        bestScore = Math.max(bestScore, score);
      }
    }
  }

  // Boost score based on user's historical preferences
  if (userPreferences?.preferredTimeSlots) {
    const preferredSlots = userPreferences.preferredTimeSlots as string[];
    const timeSlotStr = `${hour}:00`;
    if (preferredSlots.includes(timeSlotStr)) {
      bestScore = Math.max(bestScore, 0.8);
    }
  }

  return bestScore || 0.3; // Minimum score if no match
}

function calculateHistoricalScore(timeSlot: Date, userBehaviors: any[]) {
  if (!userBehaviors.length) return 0.7; // Neutral if no history
  
  const hour = timeSlot.getHours();
  const dayOfWeek = timeSlot.getDay();
  
  // Analyze user's booking patterns
  const hourCounts = new Map<number, number>();
  const dayOfWeekCounts = new Map<number, number>();
  
  for (const behavior of userBehaviors) {
    if (behavior.action === 'book') {
      const behaviorTime = new Date(behavior.timestamp);
      const behaviorHour = behaviorTime.getHours();
      const behaviorDay = behaviorTime.getDay();
      
      hourCounts.set(behaviorHour, (hourCounts.get(behaviorHour) || 0) + 1);
      dayOfWeekCounts.set(behaviorDay, (dayOfWeekCounts.get(behaviorDay) || 0) + 1);
    }
  }
  
  const hourScore = (hourCounts.get(hour) || 0) / userBehaviors.length;
  const dayScore = (dayOfWeekCounts.get(dayOfWeek) || 0) / userBehaviors.length;
  
  return Math.min(1.0, (hourScore + dayScore) * 2); // Combine and normalize
}

async function getWeatherForecast(city: string) {
  // Mock weather data - in production, integrate with OpenWeatherMap API
  const weatherConditions = ['sunny', 'cloudy', 'rainy', 'stormy'];
  const condition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
  
  return {
    city,
    condition,
    temperature: Math.floor(Math.random() * 20) + 15, // 15-35°C
    humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
    isOutdoorFriendly: condition === 'sunny' || condition === 'cloudy',
    forecast: Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
      condition: weatherConditions[Math.floor(Math.random() * weatherConditions.length)],
      temperature: Math.floor(Math.random() * 20) + 15,
      isOutdoorFriendly: Math.random() > 0.3
    }))
  };
}

async function getTrafficPredictions(address: string) {
  // Mock traffic data - in production, integrate with Google Maps Traffic API
  const trafficLevels = ['LOW', 'MODERATE', 'HIGH', 'SEVERE'];
  
  return {
    currentLevel: trafficLevels[Math.floor(Math.random() * trafficLevels.length)],
    predictions: Array.from({ length: 24 }, (_, hour) => ({
      hour,
      level: trafficLevels[Math.floor(Math.random() * trafficLevels.length)],
      travelTimeMultiplier: 1 + Math.random() * 0.5 // 1.0x to 1.5x normal time
    }))
  };
}

async function refineRecommendations(
  recommendations: any[],
  weatherData: any,
  trafficData: any,
  request: any
) {
  return recommendations.map(rec => {
    let adjustedScore = rec.overallScore;
    
    // Apply weather adjustments
    if (weatherData && request.weatherSensitive) {
      const forecastDay = weatherData.forecast.find((f: any) => 
        f.date.toDateString() === rec.suggestedTime.toDateString()
      );
      
      if (forecastDay) {
        if (isOutdoorService(request.serviceId) && !forecastDay.isOutdoorFriendly) {
          adjustedScore *= 0.6; // Reduce score for outdoor services in bad weather
        } else if (forecastDay.isOutdoorFriendly) {
          adjustedScore *= 1.1; // Boost score for good weather
        }
        
        rec.weatherFactor = forecastDay.isOutdoorFriendly ? 1.1 : 0.6;
        rec.weatherInfo = {
          condition: forecastDay.condition,
          temperature: forecastDay.temperature,
          suitable: forecastDay.isOutdoorFriendly
        };
      }
    }
    
    // Apply traffic adjustments
    if (trafficData && request.trafficOptimized) {
      const hour = rec.suggestedTime.getHours();
      const trafficPrediction = trafficData.predictions.find((p: any) => p.hour === hour);
      
      if (trafficPrediction) {
        const trafficMultiplier = {
          'LOW': 1.1,
          'MODERATE': 1.0,
          'HIGH': 0.8,
          'SEVERE': 0.6
        }[trafficPrediction.level] || 1.0;
        
        adjustedScore *= trafficMultiplier;
        rec.trafficFactor = trafficMultiplier;
        rec.trafficInfo = {
          level: trafficPrediction.level,
          travelTime: `${Math.floor(30 * trafficPrediction.travelTimeMultiplier)} min`,
          impact: trafficPrediction.level
        };
      }
    }
    
    return {
      ...rec,
      overallScore: Math.min(1.0, adjustedScore),
      confidence: Math.min(1.0, adjustedScore),
      tags: generateRecommendationTags(rec, request)
    };
  }).sort((a, b) => b.overallScore - a.overallScore);
}

function generateRecommendationTags(recommendation: any, request: any) {
  const tags = [];
  
  if (recommendation.overallScore > 0.8) tags.push('OPTIMAL');
  if (recommendation.providerScore > 0.9) tags.push('TOP_PROVIDER');
  if (recommendation.trafficInfo?.level === 'LOW') tags.push('LIGHT_TRAFFIC');
  if (recommendation.weatherInfo?.suitable) tags.push('GOOD_WEATHER');
  
  const hoursFromNow = (recommendation.suggestedTime.getTime() - Date.now()) / (1000 * 60 * 60);
  if (hoursFromNow < 4) tags.push('URGENT_AVAILABLE');
  if (hoursFromNow < 1) tags.push('IMMEDIATE');
  
  if (request.urgency === 'HIGH' && hoursFromNow < 2) tags.push('EMERGENCY_SLOT');
  
  return tags;
}

async function checkNepaliHoliday(date: Date): Promise<boolean> {
  // Check against Nepali holiday calendar
  const holiday = await prisma.holidayCalendar.findFirst({
    where: {
      date: {
        gte: new Date(date.toDateString()),
        lt: new Date(new Date(date.toDateString()).getTime() + 24 * 60 * 60 * 1000)
      },
      affectsScheduling: true
    }
  });
  
  return !!holiday;
}

function extractCityFromAddress(address: string): string {
  // Simple city extraction - in production, use proper geocoding
  const cities = ['Kathmandu', 'Pokhara', 'Lalitpur', 'Bhaktapur', 'Biratnagar'];
  for (const city of cities) {
    if (address.toLowerCase().includes(city.toLowerCase())) {
      return city;
    }
  }
  return 'Kathmandu'; // Default
}

function isOutdoorService(serviceId: string): boolean {
  // Define which services are weather-sensitive
  const outdoorCategories = ['gardening', 'repairs', 'cleaning', 'moving'];
  // This would typically check the service category in the database
  return Math.random() > 0.5; // Mock implementation
}

function getEstimatedServiceDuration(category: string): number {
  // Return estimated duration in minutes
  const durations: Record<string, number> = {
    'house-cleaning': 120,
    'electrical-work': 90,
    'plumbing': 60,
    'gardening': 180,
    'repairs': 120,
    'moving': 240
  };
  
  return durations[category] || 90;
}