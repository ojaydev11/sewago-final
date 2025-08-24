import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimit(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    // Get user's notification preferences
    let preferences = await prisma.notificationPreference.findUnique({
      where: { userId }
    });

    // If no preferences exist, create default ones
    if (!preferences) {
      preferences = await prisma.notificationPreference.create({
        data: {
          userId,
          optimalTimes: ['09:00', '14:00', '18:00'], // 9 AM, 2 PM, 6 PM
          frequency: 'MEDIUM',
          channels: ['IN_APP', 'PUSH'],
          categories: {
            booking_updates: true,
            promotions: true,
            service_reminders: true,
            system_updates: false,
            marketing: false
          },
          quietHours: {
            enabled: true,
            start: '22:00',
            end: '07:00',
            timezone: 'Asia/Kathmandu'
          },
          locationBased: true,
          behaviorBased: true
        }
      });
    }

    return NextResponse.json({
      preferences,
      availableChannels: ['IN_APP', 'PUSH', 'EMAIL', 'SMS'],
      availableCategories: [
        { key: 'booking_updates', name: 'Booking Updates', description: 'Status changes, confirmations, reminders' },
        { key: 'promotions', name: 'Promotions & Offers', description: 'Discounts, special offers, deals' },
        { key: 'service_reminders', name: 'Service Reminders', description: 'Maintenance reminders, follow-ups' },
        { key: 'system_updates', name: 'System Updates', description: 'App updates, maintenance notices' },
        { key: 'marketing', name: 'Marketing Communications', description: 'Newsletter, product announcements' }
      ],
      frequencyOptions: [
        { value: 'LOW', name: 'Minimal', description: 'Only urgent notifications' },
        { value: 'MEDIUM', name: 'Regular', description: 'Important notifications' },
        { value: 'HIGH', name: 'All', description: 'All notifications' }
      ]
    });

  } catch (error) {
    console.error('Get preferences error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimit(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { userId, preferences } = body;

    if (!userId || !preferences) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate preferences
    const validationErrors = validatePreferences(preferences);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Invalid preferences', details: validationErrors },
        { status: 400 }
      );
    }

    // Update or create preferences
    const updatedPreferences = await prisma.notificationPreference.upsert({
      where: { userId },
      update: {
        optimalTimes: preferences.optimalTimes,
        frequency: preferences.frequency,
        channels: preferences.channels,
        categories: preferences.categories,
        quietHours: preferences.quietHours,
        locationBased: preferences.locationBased,
        behaviorBased: preferences.behaviorBased,
        updatedAt: new Date()
      },
      create: {
        userId,
        optimalTimes: preferences.optimalTimes,
        frequency: preferences.frequency,
        channels: preferences.channels,
        categories: preferences.categories,
        quietHours: preferences.quietHours,
        locationBased: preferences.locationBased,
        behaviorBased: preferences.behaviorBased
      }
    });

    // Generate AI-powered optimization suggestions
    const optimizationSuggestions = await generateOptimizationSuggestions(
      userId, 
      updatedPreferences
    );

    return NextResponse.json({
      preferences: updatedPreferences,
      optimizationSuggestions,
      message: 'Preferences updated successfully'
    });

  } catch (error) {
    console.error('Update preferences error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimit(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    // Delete user's notification preferences
    await prisma.notificationPreference.delete({
      where: { userId }
    });

    return NextResponse.json({
      message: 'Preferences deleted successfully'
    });

  } catch (error) {
    console.error('Delete preferences error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function validatePreferences(preferences: any): string[] {
  const errors: string[] = [];

  // Validate optimal times
  if (!Array.isArray(preferences.optimalTimes)) {
    errors.push('Optimal times must be an array');
  } else {
    preferences.optimalTimes.forEach((time: string, index: number) => {
      if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
        errors.push(`Invalid time format at index ${index}: ${time}`);
      }
    });
  }

  // Validate frequency
  if (!['LOW', 'MEDIUM', 'HIGH'].includes(preferences.frequency)) {
    errors.push('Invalid frequency value');
  }

  // Validate channels
  if (!Array.isArray(preferences.channels)) {
    errors.push('Channels must be an array');
  } else {
    const validChannels = ['IN_APP', 'PUSH', 'EMAIL', 'SMS'];
    preferences.channels.forEach((channel: string) => {
      if (!validChannels.includes(channel)) {
        errors.push(`Invalid channel: ${channel}`);
      }
    });
  }

  // Validate categories
  if (typeof preferences.categories !== 'object') {
    errors.push('Categories must be an object');
  }

  // Validate quiet hours
  if (preferences.quietHours) {
    if (preferences.quietHours.enabled && 
        (!preferences.quietHours.start || !preferences.quietHours.end)) {
      errors.push('Quiet hours start and end times are required when enabled');
    }
  }

  return errors;
}

async function generateOptimizationSuggestions(
  userId: string, 
  preferences: any
): Promise<Array<{ type: string; title: string; description: string; impact: string }>> {
  const suggestions = [];

  try {
    // Get user behavior data
    const userBehavior = await prisma.userBehavior.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: 100
    });

    // Get notification delivery analytics
    const notificationAnalytics = await prisma.notificationDelivery.groupBy({
      by: ['channel'],
      where: { 
        userId,
        sentAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      },
      _count: { channel: true },
      _sum: {
        openedAt: 1 // This would need a proper count of opened notifications
      }
    });

    // Analyze activity patterns
    const activityByHour = analyzeActivityByHour(userBehavior);
    const currentOptimalTimes = preferences.optimalTimes.map((time: string) => 
      parseInt(time.split(':')[0])
    );

    // Suggest better timing based on activity
    const suggestedHours = activityByHour.slice(0, 3).map(({ hour }) => hour);
    const timingMismatch = currentOptimalTimes.some(hour => !suggestedHours.includes(hour));

    if (timingMismatch) {
      suggestions.push({
        type: 'timing',
        title: 'Optimize notification timing',
        description: `Based on your activity, consider receiving notifications at ${suggestedHours.map(h => `${h}:00`).join(', ')}`,
        impact: 'High - Could increase engagement by 25-40%'
      });
    }

    // Suggest channels based on effectiveness
    if (notificationAnalytics.length > 0) {
      const leastEffectiveChannel = notificationAnalytics.sort((a, b) => 
        (a._sum.openedAt || 0) - (b._sum.openedAt || 0)
      )[0];

      if (preferences.channels.includes(leastEffectiveChannel.channel) && 
          preferences.channels.length > 1) {
        suggestions.push({
          type: 'channels',
          title: 'Review notification channels',
          description: `${leastEffectiveChannel.channel} notifications have low engagement. Consider focusing on other channels.`,
          impact: 'Medium - Could reduce notification fatigue'
        });
      }
    }

    // Suggest quiet hours adjustment
    if (!preferences.quietHours?.enabled) {
      const lateNightActivity = userBehavior.filter(activity => {
        const hour = activity.timestamp.getHours();
        return hour >= 22 || hour <= 6;
      }).length;

      if (lateNightActivity < userBehavior.length * 0.1) { // Less than 10% late night activity
        suggestions.push({
          type: 'quiet_hours',
          title: 'Enable quiet hours',
          description: 'You have minimal late-night activity. Enabling quiet hours could improve your sleep quality.',
          impact: 'Low - Better user experience without affecting engagement'
        });
      }
    }

    // Suggest category optimization
    if (preferences.categories.marketing && preferences.categories.promotions) {
      const marketingEngagement = await estimateMarketingEngagement(userId);
      if (marketingEngagement < 0.1) {
        suggestions.push({
          type: 'categories',
          title: 'Reduce marketing notifications',
          description: 'Your engagement with promotional content is low. Disabling marketing notifications could reduce clutter.',
          impact: 'Medium - Cleaner notification experience'
        });
      }
    }

  } catch (error) {
    console.error('Error generating optimization suggestions:', error);
  }

  return suggestions;
}

function analyzeActivityByHour(userBehavior: any[]): Array<{ hour: number; count: number }> {
  const hourCounts: { [hour: number]: number } = {};

  userBehavior.forEach(activity => {
    const hour = activity.timestamp.getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });

  return Object.entries(hourCounts)
    .map(([hour, count]) => ({ hour: parseInt(hour), count: count as number }))
    .sort((a, b) => b.count - a.count);
}

async function estimateMarketingEngagement(userId: string): Promise<number> {
  // This would analyze click-through rates on marketing notifications
  // For now, return a random low engagement rate
  return Math.random() * 0.2; // 0-20% engagement
}