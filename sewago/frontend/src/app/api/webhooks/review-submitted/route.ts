import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { 
  LoyaltyPoints, 
  PointTransaction, 
  ActivityStreak, 
  UserBadge, 
  Review
} from '@/models';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reviewId, userId, rating } = body;

    if (!reviewId || !userId || !rating) {
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

    // Calculate points based on review quality
    const reviewPoints = rating >= 4 ? 20 : 10;
    
    // Get streak multiplier
    const reviewStreak = await ActivityStreak.findOne({
      userId,
      type: 'REVIEW_STREAK'
    });
    
    const multiplier = reviewStreak?.bonusMultiplier || 1.0;
    const finalPoints = Math.floor(reviewPoints * multiplier);

    // Award points
    await PointTransaction.create({
      userId,
      loyaltyPointsId: loyaltyPoints._id,
      points: finalPoints,
      type: 'EARNED',
      source: 'review',
      sourceId: reviewId,
      description: `Review submitted - ${rating} stars`
    });

    // Update points balance
    await LoyaltyPoints.findByIdAndUpdate(loyaltyPoints._id, {
      $inc: {
        totalPoints: finalPoints,
        availablePoints: finalPoints,
        lifetimeEarned: finalPoints
      }
    });

    // Update review streak
    await updateReviewStreak(userId);

    // Check and update badges
    await checkReviewBadges(userId);

    return NextResponse.json({
      success: true,
      pointsAwarded: finalPoints,
      multiplier: multiplier
    });

  } catch (error) {
    console.error('Error processing review submission webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function updateReviewStreak(userId: string) {
  const now = new Date();

  let streak = await ActivityStreak.findOne({
    userId,
    type: 'REVIEW_STREAK'
  });

  if (!streak) {
    streak = await ActivityStreak.create({
      userId,
      type: 'REVIEW_STREAK',
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
    
    // Check if this continues the streak (within 7 days)
    if (daysSinceLastActivity <= 7) {
      newStreak += 1;
    } else {
      newStreak = 1; // Reset streak
    }

    const longestStreak = Math.max(streak.longestStreak, newStreak);
    let bonusMultiplier = 1.0;
    if (newStreak >= 5) bonusMultiplier = 1.5;
    else if (newStreak >= 3) bonusMultiplier = 1.25;
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

async function checkReviewBadges(userId: string) {
  // Check Top Reviewer badge (20+ reviews)
  const reviewCount = await Review.countDocuments({ userId });

  await UserBadge.findOneAndUpdate(
    { userId, badgeType: 'TOP_REVIEWER' },
    {
      userId,
      badgeType: 'TOP_REVIEWER',
      progress: reviewCount,
      target: 20,
      isUnlocked: reviewCount >= 20,
      unlockedAt: reviewCount >= 20 ? new Date() : undefined
    },
    { upsert: true }
  );
}