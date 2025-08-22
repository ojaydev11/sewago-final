import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { ActivityStreak, Booking, Review } from '@/models';

// GET /api/gamification/streaks - Get user's activity streaks
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Get or create streak records
    const streakTypes = ['WEEKLY_BOOKING', 'MONTHLY_ACTIVITY', 'REVIEW_STREAK'];
    const streaks = [];

    for (const type of streakTypes) {
      let streak = await ActivityStreak.findOne({ 
        userId: session.user.id, 
        type 
      });

      if (!streak) {
        streak = await ActivityStreak.create({
          userId: session.user.id,
          type,
          currentStreak: 0,
          longestStreak: 0,
          bonusMultiplier: 1.0,
          isActive: true
        });
      }

      // Calculate current streak based on type
      const now = new Date();
      let isStreakActive = false;
      let currentStreak = 0;

      switch (type) {
        case 'WEEKLY_BOOKING':
          // Check if user has booking in current week
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          weekStart.setHours(0, 0, 0, 0);

          const weeklyBooking = await Booking.findOne({
            userId: session.user.id,
            createdAt: { $gte: weekStart },
            status: { $in: ['CONFIRMED', 'COMPLETED'] }
          });

          isStreakActive = !!weeklyBooking;
          
          // Calculate consecutive weeks with bookings
          let weekCount = 0;
          const checkWeek = new Date(weekStart);
          
          while (weekCount < 52) { // Check up to 1 year
            const weekEnd = new Date(checkWeek);
            weekEnd.setDate(checkWeek.getDate() + 7);
            
            const hasBooking = await Booking.findOne({
              userId: session.user.id,
              createdAt: { $gte: checkWeek, $lt: weekEnd },
              status: { $in: ['CONFIRMED', 'COMPLETED'] }
            });

            if (hasBooking) {
              weekCount++;
              checkWeek.setDate(checkWeek.getDate() - 7);
            } else {
              break;
            }
          }
          
          currentStreak = weekCount;
          break;

        case 'MONTHLY_ACTIVITY':
          // Check if user has activity in current month
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          
          const monthlyActivity = await Booking.findOne({
            userId: session.user.id,
            createdAt: { $gte: monthStart }
          });

          isStreakActive = !!monthlyActivity;
          
          // Calculate consecutive months with activity
          let monthCount = 0;
          const checkMonth = new Date(monthStart);
          
          while (monthCount < 24) { // Check up to 2 years
            const monthEnd = new Date(checkMonth.getFullYear(), checkMonth.getMonth() + 1, 0);
            
            const hasActivity = await Booking.findOne({
              userId: session.user.id,
              createdAt: { $gte: checkMonth, $lte: monthEnd }
            });

            if (hasActivity) {
              monthCount++;
              checkMonth.setMonth(checkMonth.getMonth() - 1);
            } else {
              break;
            }
          }
          
          currentStreak = monthCount;
          break;

        case 'REVIEW_STREAK':
          // Check consecutive reviews (simplified logic)
          const recentReviews = await Review.find({
            userId: session.user.id
          }).sort({ createdAt: -1 }).limit(10);

          currentStreak = recentReviews.length;
          isStreakActive = recentReviews.length > 0;
          break;
      }

      // Calculate bonus multiplier based on streak
      let bonusMultiplier = 1.0;
      if (currentStreak >= 4) bonusMultiplier = 1.5;
      else if (currentStreak >= 2) bonusMultiplier = 1.25;
      else if (currentStreak >= 1) bonusMultiplier = 1.1;

      // Update streak record
      const longestStreak = Math.max(streak.longestStreak, currentStreak);
      
      await ActivityStreak.findByIdAndUpdate(streak._id, {
        currentStreak,
        longestStreak,
        bonusMultiplier,
        isActive: isStreakActive,
        lastActivityAt: isStreakActive ? now : streak.lastActivityAt
      });

      streaks.push({
        type,
        currentStreak,
        longestStreak,
        bonusMultiplier,
        isActive: isStreakActive,
        lastActivityAt: streak.lastActivityAt,
        config: getStreakConfig(type)
      });
    }

    return NextResponse.json({ streaks });

  } catch (error) {
    console.error('Error fetching gamification streaks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/gamification/streaks - Update streak activity
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, activity } = body;

    if (!type || !activity) {
      return NextResponse.json(
        { error: 'Missing required fields: type, activity' },
        { status: 400 }
      );
    }

    await dbConnect();

    let streak = await ActivityStreak.findOne({ 
      userId: session.user.id, 
      type 
    });

    if (!streak) {
      streak = await ActivityStreak.create({
        userId: session.user.id,
        type,
        currentStreak: 1,
        longestStreak: 1,
        bonusMultiplier: 1.1,
        isActive: true,
        lastActivityAt: new Date()
      });
    } else {
      // Update streak based on activity
      const now = new Date();
      const lastActivity = streak.lastActivityAt || new Date(0);
      const timeDiff = now.getTime() - lastActivity.getTime();
      
      let newStreak = streak.currentStreak;
      
      // Check if streak should continue based on type
      switch (type) {
        case 'WEEKLY_BOOKING':
          const weeksDiff = Math.floor(timeDiff / (7 * 24 * 60 * 60 * 1000));
          if (weeksDiff <= 1) {
            newStreak += 1;
          } else {
            newStreak = 1; // Reset streak
          }
          break;
          
        case 'MONTHLY_ACTIVITY':
          const monthsDiff = Math.floor(timeDiff / (30 * 24 * 60 * 60 * 1000));
          if (monthsDiff <= 1) {
            newStreak += 1;
          } else {
            newStreak = 1; // Reset streak
          }
          break;
          
        case 'REVIEW_STREAK':
          const daysDiff = Math.floor(timeDiff / (24 * 60 * 60 * 1000));
          if (daysDiff <= 7) { // Within a week
            newStreak += 1;
          } else {
            newStreak = 1; // Reset streak
          }
          break;
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
        lastActivityAt: now
      });

      streak.currentStreak = newStreak;
      streak.longestStreak = longestStreak;
      streak.bonusMultiplier = bonusMultiplier;
    }

    return NextResponse.json({
      success: true,
      streak: {
        type,
        currentStreak: streak.currentStreak,
        longestStreak: streak.longestStreak,
        bonusMultiplier: streak.bonusMultiplier,
        isActive: true,
        lastActivityAt: streak.lastActivityAt
      }
    });

  } catch (error) {
    console.error('Error updating gamification streak:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getStreakConfig(type: string) {
  const configs = {
    WEEKLY_BOOKING: {
      nameEn: 'Weekly Booking Streak',
      nameNe: 'साप्ताहिक बुकिङ स्ट्रिक',
      descriptionEn: 'Book a service every week',
      descriptionNe: 'हरेक हप्ता सेवा बुक गर्नुहोस्',
      icon: '📅',
      color: 'blue'
    },
    MONTHLY_ACTIVITY: {
      nameEn: 'Monthly Activity Streak',
      nameNe: 'मासिक गतिविधि स्ट्रिक',
      descriptionEn: 'Stay active every month',
      descriptionNe: 'हरेक महिना सक्रिय रहनुहोस्',
      icon: '🗓️',
      color: 'green'
    },
    REVIEW_STREAK: {
      nameEn: 'Review Streak',
      nameNe: 'समीक्षा स्ट्रिक',
      descriptionEn: 'Write reviews consistently',
      descriptionNe: 'नियमित रूपमा समीक्षा लेख्नुहोस्',
      icon: '⭐',
      color: 'yellow'
    }
  };
  
  return configs[type] || configs.WEEKLY_BOOKING;
}