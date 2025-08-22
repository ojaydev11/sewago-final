import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { SeasonalChallenge, ChallengeParticipation, Booking } from '@/models';

// GET /api/gamification/challenges - Get active challenges and user participation
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const now = new Date();

    // Get active challenges
    const activeChallenges = await SeasonalChallenge.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).sort({ startDate: 1 });

    // Get user's participations
    const participations = await ChallengeParticipation.find({
      userId: session.user.id,
      challengeId: { $in: activeChallenges.map(c => c._id) }
    });

    const challengesWithProgress = await Promise.all(
      activeChallenges.map(async (challenge) => {
        const participation = participations.find(
          p => p.challengeId.toString() === challenge._id.toString()
        );

        let progress = 0;
        if (participation) {
          progress = participation.progress;
        }

        // Calculate time remaining
        const timeRemaining = challenge.endDate.getTime() - now.getTime();
        const daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));

        return {
          id: challenge._id,
          name: challenge.name,
          nameNe: challenge.nameNe,
          description: challenge.description,
          descriptionNe: challenge.descriptionNe,
          type: challenge.type,
          festival: challenge.festival,
          startDate: challenge.startDate,
          endDate: challenge.endDate,
          target: challenge.target,
          reward: challenge.reward,
          badgeReward: challenge.badgeReward,
          progress: progress,
          isJoined: !!participation,
          isCompleted: participation?.isCompleted || false,
          rewardClaimed: participation?.rewardClaimed || false,
          daysRemaining: Math.max(0, daysRemaining),
          config: getChallengeConfig(challenge.type)
        };
      })
    );

    return NextResponse.json({
      challenges: challengesWithProgress,
      activeCount: challengesWithProgress.length,
      joinedCount: challengesWithProgress.filter(c => c.isJoined).length,
      completedCount: challengesWithProgress.filter(c => c.isCompleted).length
    });

  } catch (error) {
    console.error('Error fetching gamification challenges:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/gamification/challenges - Join a challenge or update progress
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { challengeId, action } = body;

    if (!challengeId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: challengeId, action' },
        { status: 400 }
      );
    }

    await dbConnect();

    const challenge = await SeasonalChallenge.findById(challengeId);
    if (!challenge) {
      return NextResponse.json(
        { error: 'Challenge not found' },
        { status: 404 }
      );
    }

    const now = new Date();
    if (now < challenge.startDate || now > challenge.endDate) {
      return NextResponse.json(
        { error: 'Challenge is not active' },
        { status: 400 }
      );
    }

    let participation = await ChallengeParticipation.findOne({
      userId: session.user.id,
      challengeId: challengeId
    });

    if (action === 'join') {
      if (participation) {
        return NextResponse.json(
          { error: 'Already joined this challenge' },
          { status: 400 }
        );
      }

      participation = await ChallengeParticipation.create({
        userId: session.user.id,
        challengeId: challengeId,
        progress: 0,
        isCompleted: false,
        rewardClaimed: false,
        joinedAt: now
      });

      return NextResponse.json({
        success: true,
        message: 'Joined challenge successfully',
        participation: {
          id: participation._id,
          progress: participation.progress,
          isCompleted: participation.isCompleted,
          joinedAt: participation.joinedAt
        }
      });

    } else if (action === 'updateProgress') {
      if (!participation) {
        return NextResponse.json(
          { error: 'Not joined in this challenge' },
          { status: 400 }
        );
      }

      // Calculate progress based on challenge type
      let newProgress = participation.progress;
      
      switch (challenge.type) {
        case 'DASHAIN_CLEANING':
        case 'NEW_YEAR_ORGANIZE':
        case 'SUMMER_MAINTENANCE':
        case 'MONSOON_PREP':
        case 'TIHAR_DECORATION':
          // Count relevant bookings for seasonal challenges
          const bookingCount = await Booking.countDocuments({
            userId: session.user.id,
            createdAt: { $gte: challenge.startDate, $lte: challenge.endDate },
            status: { $in: ['CONFIRMED', 'COMPLETED'] },
            'service.category': getChallengeCategory(challenge.type)
          });
          newProgress = bookingCount;
          break;
          
        case 'GENERAL_SEASONAL':
          // Count any bookings during challenge period
          const generalBookingCount = await Booking.countDocuments({
            userId: session.user.id,
            createdAt: { $gte: challenge.startDate, $lte: challenge.endDate },
            status: { $in: ['CONFIRMED', 'COMPLETED'] }
          });
          newProgress = generalBookingCount;
          break;
      }

      const isCompleted = newProgress >= challenge.target;

      await ChallengeParticipation.findByIdAndUpdate(participation._id, {
        progress: newProgress,
        isCompleted: isCompleted,
        completedAt: isCompleted ? new Date() : participation.completedAt
      });

      return NextResponse.json({
        success: true,
        progress: newProgress,
        isCompleted: isCompleted,
        target: challenge.target
      });

    } else if (action === 'claimReward') {
      if (!participation || !participation.isCompleted) {
        return NextResponse.json(
          { error: 'Challenge not completed' },
          { status: 400 }
        );
      }

      if (participation.rewardClaimed) {
        return NextResponse.json(
          { error: 'Reward already claimed' },
          { status: 400 }
        );
      }

      // Award points and badge if applicable
      // This would integrate with the points system
      await ChallengeParticipation.findByIdAndUpdate(participation._id, {
        rewardClaimed: true
      });

      return NextResponse.json({
        success: true,
        message: 'Reward claimed successfully',
        reward: challenge.reward,
        badgeReward: challenge.badgeReward
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error handling gamification challenge:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getChallengeConfig(type: string) {
  const configs = {
    DASHAIN_CLEANING: {
      icon: '🏠',
      color: 'red',
      category: 'cleaning'
    },
    NEW_YEAR_ORGANIZE: {
      icon: '🎊',
      color: 'gold',
      category: 'organizing'
    },
    SUMMER_MAINTENANCE: {
      icon: '🔧',
      color: 'orange',
      category: 'maintenance'
    },
    MONSOON_PREP: {
      icon: '☔',
      color: 'blue',
      category: 'maintenance'
    },
    TIHAR_DECORATION: {
      icon: '🪔',
      color: 'purple',
      category: 'decoration'
    },
    GENERAL_SEASONAL: {
      icon: '🎯',
      color: 'green',
      category: 'any'
    }
  };
  
  return configs[type] || configs.GENERAL_SEASONAL;
}

function getChallengeCategory(type: string): string {
  const categoryMap = {
    DASHAIN_CLEANING: 'house-cleaning',
    NEW_YEAR_ORGANIZE: 'organizing',
    SUMMER_MAINTENANCE: 'maintenance',
    MONSOON_PREP: 'maintenance',
    TIHAR_DECORATION: 'decoration',
    GENERAL_SEASONAL: 'any'
  };
  
  return categoryMap[type] || 'any';
}