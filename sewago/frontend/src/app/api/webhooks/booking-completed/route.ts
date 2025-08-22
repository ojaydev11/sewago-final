import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { 
  LoyaltyPoints, 
  PointTransaction, 
  ActivityStreak, 
  UserBadge, 
  Booking,
  ChallengeParticipation,
  SeasonalChallenge
} from '@/models';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, userId, serviceCategory, amount, status } = body;

    if (!bookingId || !userId || status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Invalid webhook data' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Get or create loyalty points record
    let loyaltyPoints = await LoyaltyPoints.findOne({ userId });
    if (!loyaltyPoints) {
      loyaltyPoints = await LoyaltyPoints.create({
        userId,
        totalPoints: 0,
        availablePoints: 0,
        lifetimeEarned: 0
      });
    }

    // Calculate base points (1 point per NPR 1, max 50 points)
    const basePoints = Math.min(Math.floor(amount / 100), 50);
    
    // Get streak multiplier
    const weeklyStreak = await ActivityStreak.findOne({
      userId,
      type: 'WEEKLY_BOOKING'
    });
    
    const multiplier = weeklyStreak?.bonusMultiplier || 1.0;
    const finalPoints = Math.floor(basePoints * multiplier);

    // Award points
    await PointTransaction.create({
      userId,
      loyaltyPointsId: loyaltyPoints._id,
      points: finalPoints,
      type: 'EARNED',
      source: 'booking',
      sourceId: bookingId,
      description: `Booking completed - ${serviceCategory}`
    });

    // Update points balance
    await LoyaltyPoints.findByIdAndUpdate(loyaltyPoints._id, {
      $inc: {
        totalPoints: finalPoints,
        availablePoints: finalPoints,
        lifetimeEarned: finalPoints
      }
    });

    // Update booking streak
    await updateBookingStreak(userId);

    // Check and update badges
    await checkBadgeProgress(userId, 'booking');

    // Update challenge progress
    await updateChallengeProgress(userId, serviceCategory);

    return NextResponse.json({
      success: true,
      pointsAwarded: finalPoints,
      multiplier: multiplier
    });

  } catch (error) {
    console.error('Error processing booking completion webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function updateBookingStreak(userId: string) {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  let streak = await ActivityStreak.findOne({
    userId,
    type: 'WEEKLY_BOOKING'
  });

  if (!streak) {
    streak = await ActivityStreak.create({
      userId,
      type: 'WEEKLY_BOOKING',
      currentStreak: 1,
      longestStreak: 1,
      bonusMultiplier: 1.1,
      isActive: true,
      lastActivityAt: now,
      streakStartedAt: now
    });
  } else {
    const lastActivity = streak.lastActivityAt || new Date(0);
    const daysSinceLastActivity = Math.floor(
      (now.getTime() - lastActivity.getTime()) / (24 * 60 * 60 * 1000)
    );

    let newStreak = streak.currentStreak;
    
    // Check if this continues the streak
    if (daysSinceLastActivity <= 7) {
      // Check if it's a new week
      const lastWeekStart = new Date(lastActivity);
      lastWeekStart.setDate(lastActivity.getDate() - lastActivity.getDay());
      lastWeekStart.setHours(0, 0, 0, 0);
      
      if (weekStart > lastWeekStart) {
        newStreak += 1;
      }
    } else {
      newStreak = 1; // Reset streak
    }

    const longestStreak = Math.max(streak.longestStreak, newStreak);
    let bonusMultiplier = 1.0;
    if (newStreak >= 4) bonusMultiplier = 1.5;
    else if (newStreak >= 2) bonusMultiplier = 1.25;
    else if (newStreak >= 1) bonusMultiplier = 1.1;

    await ActivityStreak.findByIdAndUpdate(streak._id, {
      currentStreak: newStreak,
      longestStreak,
      bonusMultiplier,
      isActive: true,
      lastActivityAt: now,
      streakStartedAt: newStreak === 1 ? now : streak.streakStartedAt
    });
  }
}

async function checkBadgeProgress(userId: string, activity: string) {
  if (activity === 'booking') {
    // Check Regular Customer badge (5+ bookings)
    const bookingCount = await Booking.countDocuments({
      userId,
      status: 'COMPLETED'
    });

    await updateBadgeProgress(userId, 'REGULAR_CUSTOMER', bookingCount, 5);

    // Check Service Expert badge (10+ bookings in same category)
    // This would require more complex logic to check category-specific bookings
    
    // Check other badges based on total booking count
    if (bookingCount >= 20) {
      await updateBadgeProgress(userId, 'SERVICE_EXPERT', bookingCount, 10);
    }
  }
}

async function updateBadgeProgress(
  userId: string, 
  badgeType: string, 
  progress: number, 
  target: number
) {
  const isUnlocked = progress >= target;
  
  await UserBadge.findOneAndUpdate(
    { userId, badgeType },
    {
      userId,
      badgeType,
      progress,
      target,
      isUnlocked,
      unlockedAt: isUnlocked ? new Date() : undefined
    },
    { upsert: true }
  );
}

async function updateChallengeProgress(userId: string, serviceCategory: string) {
  const now = new Date();
  
  // Get active challenges
  const activeChallenges = await SeasonalChallenge.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now }
  });

  // Get user's participations
  const participations = await ChallengeParticipation.find({
    userId,
    challengeId: { $in: activeChallenges.map(c => c._id) }
  });

  for (const challenge of activeChallenges) {
    const participation = participations.find(
      p => p.challengeId.toString() === challenge._id.toString()
    );

    if (participation && !participation.isCompleted) {
      // Update progress based on challenge type and service category
      let shouldIncrement = false;
      
      switch (challenge.type) {
        case 'DASHAIN_CLEANING':
          shouldIncrement = serviceCategory === 'cleaning';
          break;
        case 'NEW_YEAR_ORGANIZE':
          shouldIncrement = serviceCategory === 'organizing';
          break;
        case 'SUMMER_MAINTENANCE':
        case 'MONSOON_PREP':
          shouldIncrement = serviceCategory === 'maintenance';
          break;
        case 'TIHAR_DECORATION':
          shouldIncrement = serviceCategory === 'decoration';
          break;
        case 'GENERAL_SEASONAL':
          shouldIncrement = true; // Any service counts
          break;
      }

      if (shouldIncrement) {
        const newProgress = participation.progress + 1;
        const isCompleted = newProgress >= challenge.target;

        await ChallengeParticipation.findByIdAndUpdate(participation._id, {
          progress: newProgress,
          isCompleted,
          completedAt: isCompleted ? new Date() : participation.completedAt
        });
      }
    }
  }
}