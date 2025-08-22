import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { GamificationSettings } from '@/models';

// GET /api/gamification/settings - Get user's gamification preferences
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Get or create settings record
    let settings = await GamificationSettings.findOne({ userId: session.user.id });
    
    if (!settings) {
      settings = await GamificationSettings.create({
        userId: session.user.id,
        notificationsEnabled: true,
        showBadgeProgress: true,
        showStreakCounter: true,
        showPointsBalance: true,
        challengeReminders: true
      });
    }

    return NextResponse.json({
      settings: {
        notificationsEnabled: settings.notificationsEnabled,
        showBadgeProgress: settings.showBadgeProgress,
        showStreakCounter: settings.showStreakCounter,
        showPointsBalance: settings.showPointsBalance,
        challengeReminders: settings.challengeReminders
      }
    });

  } catch (error) {
    console.error('Error fetching gamification settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/gamification/settings - Update user's gamification preferences
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      notificationsEnabled,
      showBadgeProgress,
      showStreakCounter,
      showPointsBalance,
      challengeReminders
    } = body;

    await dbConnect();

    // Update or create settings
    const settings = await GamificationSettings.findOneAndUpdate(
      { userId: session.user.id },
      {
        userId: session.user.id,
        ...(notificationsEnabled !== undefined && { notificationsEnabled }),
        ...(showBadgeProgress !== undefined && { showBadgeProgress }),
        ...(showStreakCounter !== undefined && { showStreakCounter }),
        ...(showPointsBalance !== undefined && { showPointsBalance }),
        ...(challengeReminders !== undefined && { challengeReminders })
      },
      { 
        new: true, 
        upsert: true 
      }
    );

    return NextResponse.json({
      success: true,
      settings: {
        notificationsEnabled: settings.notificationsEnabled,
        showBadgeProgress: settings.showBadgeProgress,
        showStreakCounter: settings.showStreakCounter,
        showPointsBalance: settings.showPointsBalance,
        challengeReminders: settings.challengeReminders
      }
    });

  } catch (error) {
    console.error('Error updating gamification settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}