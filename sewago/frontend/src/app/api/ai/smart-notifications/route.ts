import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
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
    const { userId, type, message, data, priority = 'medium' } = body;

    if (!userId || !type || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user's notification preferences
    const userPrefs = await prisma.notificationPreference.findUnique({
      where: { userId }
    });

    // Apply AI-powered notification optimization
    const optimizedDelivery = await optimizeNotificationDelivery(
      userId,
      type,
      message,
      userPrefs,
      priority
    );

    // Create notification
    const notification = await prisma.notification.create({
      data: {
        userId,
        message,
        type,
        channel: 'IN_APP', // Default channel
      }
    });

    // Schedule optimized delivery across channels
    const deliveries = await scheduleNotificationDeliveries(
      notification.id,
      userId,
      optimizedDelivery
    );

    return NextResponse.json({
      notificationId: notification.id,
      deliveries: deliveries.length,
      optimizedTiming: optimizedDelivery.optimalTime,
      channels: optimizedDelivery.channels,
      aiInsights: optimizedDelivery.insights
    });

  } catch (error) {
    console.error('Smart notification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    // Get user's notification analytics
    const analytics = await getNotificationAnalytics(userId);
    const recommendations = await getNotificationRecommendations(userId);

    return NextResponse.json({
      analytics,
      recommendations
    });

  } catch (error) {
    console.error('Get smart notifications error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function optimizeNotificationDelivery(
  userId: string,
  type: string,
  message: string,
  userPrefs: any,
  priority: string
) {
  // Get user behavior patterns
  const userBehavior = await analyzeUserBehavior(userId);
  
  // Get current time and user timezone
  const now = new Date();
  const userTimezone = userPrefs?.quietHours?.timezone || 'Asia/Kathmandu';
  
  // AI-powered timing optimization
  const optimalTime = calculateOptimalTiming(
    now,
    userBehavior,
    userPrefs,
    priority,
    type
  );

  // Channel selection based on user preferences and effectiveness
  const channels = selectOptimalChannels(
    userPrefs,
    userBehavior,
    type,
    priority
  );

  // Generate AI insights
  const insights = {
    reasoning: generateTimingReasoning(optimalTime, userBehavior, userPrefs),
    channelEffectiveness: calculateChannelEffectiveness(userId, channels),
    expectedEngagement: predictEngagementRate(userId, type, optimalTime),
    personalizedContent: personalizeNotificationContent(message, userBehavior)
  };

  return {
    optimalTime,
    channels,
    insights,
    priority: adjustPriorityBasedOnContext(priority, userBehavior, now)
  };
}

async function analyzeUserBehavior(userId: string) {
  // Get recent user activity patterns
  const recentActivity = await prisma.userBehavior.findMany({
    where: {
      userId,
      timestamp: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
      }
    },
    orderBy: {
      timestamp: 'desc'
    },
    take: 100
  });

  // Analyze patterns
  const hourlyActivity = analyzeHourlyPatterns(recentActivity);
  const dailyActivity = analyzeDailyPatterns(recentActivity);
  const engagementPatterns = analyzeEngagementPatterns(userId);

  return {
    mostActiveHours: hourlyActivity.peak,
    leastActiveHours: hourlyActivity.low,
    preferredDays: dailyActivity.preferred,
    avgResponseTime: engagementPatterns.avgResponseTime,
    engagementRate: engagementPatterns.rate,
    lastActiveTime: recentActivity[0]?.timestamp || new Date()
  };
}

function calculateOptimalTiming(
  now: Date,
  userBehavior: any,
  userPrefs: any,
  priority: string,
  type: string
) {
  const currentHour = now.getHours();
  
  // Check quiet hours
  if (userPrefs?.quietHours && isInQuietHours(currentHour, userPrefs.quietHours)) {
    if (priority !== 'urgent') {
      // Schedule for after quiet hours
      return getNextOptimalTime(userPrefs.quietHours, userBehavior.mostActiveHours);
    }
  }

  // For urgent notifications, send immediately
  if (priority === 'urgent') {
    return now;
  }

  // Check if current time is optimal
  if (userBehavior.mostActiveHours.includes(currentHour)) {
    return now;
  }

  // Find next optimal time
  const nextOptimalHour = findNextOptimalHour(currentHour, userBehavior.mostActiveHours);
  const optimalTime = new Date(now);
  
  if (nextOptimalHour <= currentHour) {
    // Next optimal time is tomorrow
    optimalTime.setDate(optimalTime.getDate() + 1);
  }
  
  optimalTime.setHours(nextOptimalHour, 0, 0, 0);
  
  return optimalTime;
}

function selectOptimalChannels(
  userPrefs: any,
  userBehavior: any,
  type: string,
  priority: string
) {
  const availableChannels = ['IN_APP', 'PUSH', 'EMAIL', 'SMS'];
  const selectedChannels = [];

  // Always include in-app for immediate availability
  selectedChannels.push('IN_APP');

  // Add PUSH for urgent notifications or if user prefers it
  if (priority === 'urgent' || 
      (userPrefs?.channels?.includes('PUSH') && userBehavior.engagementRate > 0.3)) {
    selectedChannels.push('PUSH');
  }

  // Add EMAIL for booking confirmations, reminders, etc.
  if (['booking_confirmation', 'booking_reminder', 'receipt'].includes(type) ||
      userPrefs?.channels?.includes('EMAIL')) {
    selectedChannels.push('EMAIL');
  }

  // Add SMS for urgent notifications or critical updates
  if (priority === 'urgent' && userPrefs?.channels?.includes('SMS')) {
    selectedChannels.push('SMS');
  }

  return selectedChannels;
}

async function scheduleNotificationDeliveries(
  notificationId: string,
  userId: string,
  optimizedDelivery: any
) {
  const deliveries = [];

  for (const channel of optimizedDelivery.channels) {
    const delivery = await prisma.notificationDelivery.create({
      data: {
        userId,
        notificationId,
        channel,
        scheduledFor: optimizedDelivery.optimalTime,
        status: 'PENDING'
      }
    });
    deliveries.push(delivery);
  }

  return deliveries;
}

async function getNotificationAnalytics(userId: string) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalDeliveries,
    openedNotifications,
    clickedNotifications,
    channelBreakdown
  ] = await Promise.all([
    prisma.notificationDelivery.count({
      where: { userId, sentAt: { gte: thirtyDaysAgo } }
    }),
    prisma.notificationDelivery.count({
      where: { userId, openedAt: { gte: thirtyDaysAgo } }
    }),
    prisma.notificationDelivery.count({
      where: { userId, clickedAt: { gte: thirtyDaysAgo } }
    }),
    prisma.notificationDelivery.groupBy({
      by: ['channel'],
      where: { userId, sentAt: { gte: thirtyDaysAgo } },
      _count: { channel: true }
    })
  ]);

  const openRate = totalDeliveries > 0 ? (openedNotifications / totalDeliveries) * 100 : 0;
  const clickRate = openedNotifications > 0 ? (clickedNotifications / openedNotifications) * 100 : 0;

  return {
    totalDeliveries,
    openRate: Math.round(openRate * 100) / 100,
    clickRate: Math.round(clickRate * 100) / 100,
    channelBreakdown: channelBreakdown.map(cb => ({
      channel: cb.channel,
      count: cb._count.channel
    }))
  };
}

async function getNotificationRecommendations(userId: string) {
  const userPrefs = await prisma.notificationPreference.findUnique({
    where: { userId }
  });

  const recommendations = [];

  if (!userPrefs) {
    recommendations.push({
      type: 'setup',
      title: 'Set up notification preferences',
      description: 'Customize when and how you receive notifications',
      priority: 'high'
    });
  }

  // Add more intelligent recommendations based on user behavior
  const analytics = await getNotificationAnalytics(userId);
  
  if (analytics.openRate < 20) {
    recommendations.push({
      type: 'timing',
      title: 'Optimize notification timing',
      description: 'Your notification open rate is low. Try adjusting your preferred times.',
      priority: 'medium'
    });
  }

  if (analytics.channelBreakdown.length === 1) {
    recommendations.push({
      type: 'channels',
      title: 'Try multiple notification channels',
      description: 'Enable email or SMS notifications for important updates',
      priority: 'low'
    });
  }

  return recommendations;
}

// Helper functions
function analyzeHourlyPatterns(activities: any[]) {
  const hourCounts: { [hour: number]: number } = {};
  
  activities.forEach(activity => {
    const hour = activity.timestamp.getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });

  const sortedHours = Object.entries(hourCounts)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .map(([hour]) => parseInt(hour));

  return {
    peak: sortedHours.slice(0, 3),
    low: sortedHours.slice(-3)
  };
}

function analyzeDailyPatterns(activities: any[]) {
  const dayCounts: { [day: number]: number } = {};
  
  activities.forEach(activity => {
    const day = activity.timestamp.getDay();
    dayCounts[day] = (dayCounts[day] || 0) + 1;
  });

  const sortedDays = Object.entries(dayCounts)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .map(([day]) => parseInt(day));

  return {
    preferred: sortedDays.slice(0, 3)
  };
}

async function analyzeEngagementPatterns(userId: string) {
  // This would analyze how quickly users typically respond to notifications
  return {
    avgResponseTime: 1800000, // 30 minutes in milliseconds
    rate: 0.45 // 45% engagement rate
  };
}

function isInQuietHours(currentHour: number, quietHours: any): boolean {
  if (!quietHours.start || !quietHours.end) return false;
  
  const startHour = parseInt(quietHours.start.split(':')[0]);
  const endHour = parseInt(quietHours.end.split(':')[0]);
  
  if (startHour <= endHour) {
    return currentHour >= startHour && currentHour < endHour;
  } else {
    // Quiet hours span midnight
    return currentHour >= startHour || currentHour < endHour;
  }
}

function getNextOptimalTime(quietHours: any, mostActiveHours: number[]) {
  const endHour = parseInt(quietHours.end.split(':')[0]);
  const nextOptimal = mostActiveHours.find(hour => hour >= endHour);
  
  if (nextOptimal) {
    const optimalTime = new Date();
    optimalTime.setHours(nextOptimal, 0, 0, 0);
    return optimalTime;
  }
  
  // If no optimal time today, use first optimal time tomorrow
  const optimalTime = new Date();
  optimalTime.setDate(optimalTime.getDate() + 1);
  optimalTime.setHours(mostActiveHours[0], 0, 0, 0);
  return optimalTime;
}

function findNextOptimalHour(currentHour: number, mostActiveHours: number[]): number {
  return mostActiveHours.find(hour => hour > currentHour) || mostActiveHours[0];
}

function generateTimingReasoning(optimalTime: Date, userBehavior: any, userPrefs: any): string {
  const hour = optimalTime.getHours();
  
  if (userBehavior.mostActiveHours.includes(hour)) {
    return `Scheduled during your most active time (${hour}:00) for better engagement`;
  }
  
  if (userPrefs?.optimalTimes?.includes(`${hour}:00`)) {
    return `Scheduled based on your preferred notification times`;
  }
  
  return `Scheduled to avoid your quiet hours while maximizing visibility`;
}

function calculateChannelEffectiveness(userId: string, channels: string[]) {
  // This would calculate effectiveness based on historical data
  return channels.map(channel => ({
    channel,
    effectiveness: Math.random() * 0.4 + 0.3 // 30-70% effectiveness
  }));
}

function predictEngagementRate(userId: string, type: string, optimalTime: Date): number {
  // ML model would predict engagement rate based on various factors
  const baseRate = 0.35; // 35% base engagement
  
  // Adjust based on notification type
  const typeMultiplier = {
    'booking_confirmation': 1.2,
    'booking_reminder': 1.1,
    'promotion': 0.8,
    'system_update': 0.7
  }[type] || 1.0;
  
  return Math.min(0.9, baseRate * typeMultiplier);
}

function personalizeNotificationContent(message: string, userBehavior: any): string {
  // This would use AI to personalize the notification content
  return message; // For now, return as-is
}

function adjustPriorityBasedOnContext(
  priority: string, 
  userBehavior: any, 
  now: Date
): string {
  // Adjust priority based on user context
  const hour = now.getHours();
  
  if (userBehavior.mostActiveHours.includes(hour) && priority === 'low') {
    return 'medium';
  }
  
  if (!userBehavior.mostActiveHours.includes(hour) && priority === 'medium') {
    return 'low';
  }
  
  return priority;
}