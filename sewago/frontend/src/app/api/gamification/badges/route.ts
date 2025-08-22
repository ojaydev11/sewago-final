import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { UserBadge, Booking, Review } from '@/models';

// Badge requirements and metadata
const BADGE_CONFIG = {
  REGULAR_CUSTOMER: {
    target: 5,
    nameEn: 'Regular Customer',
    nameNe: 'नियमित ग्राहक',
    descriptionEn: 'Complete 5 service bookings',
    descriptionNe: '५ वटा सेवा बुकिङ पूरा गर्नुहोस्',
    icon: '🏆',
    color: 'gold'
  },
  TOP_REVIEWER: {
    target: 20,
    nameEn: 'Top Reviewer',
    nameNe: 'शीर्ष समीक्षक',
    descriptionEn: 'Write 20 service reviews',
    descriptionNe: '२० वटा सेवा समीक्षा लेख्नुहोस्',
    icon: '⭐',
    color: 'blue'
  },
  EARLY_ADOPTER: {
    target: 1,
    nameEn: 'Early Adopter',
    nameNe: 'प्रारम्भिक प्रयोगकर्ता',
    descriptionEn: 'One of our first users',
    descriptionNe: 'हाम्रो पहिलो प्रयोगकर्ता मध्ये एक',
    icon: '🚀',
    color: 'purple'
  },
  SERVICE_EXPERT: {
    target: 10,
    nameEn: 'Service Expert',
    nameNe: 'सेवा विशेषज्ञ',
    descriptionEn: 'Book 10 services in same category',
    descriptionNe: 'एउटै श्रेणीमा १० वटा सेवा बुक गर्नुहोस्',
    icon: '🎯',
    color: 'green'
  },
  LOYAL_MEMBER: {
    target: 365,
    nameEn: 'Loyal Member',
    nameNe: 'वफादार सदस्य',
    descriptionEn: 'Active for 1+ years',
    descriptionNe: '१+ वर्ष सक्रिय',
    icon: '💎',
    color: 'diamond'
  },
  STREAK_MASTER: {
    target: 4,
    nameEn: 'Streak Master',
    nameNe: 'स्ट्रिक मास्टर',
    descriptionEn: 'Maintain 4+ week streak',
    descriptionNe: '४+ हप्ता स्ट्रिक कायम राख्नुहोस्',
    icon: '🔥',
    color: 'orange'
  },
  CHALLENGE_CHAMPION: {
    target: 1,
    nameEn: 'Challenge Champion',
    nameNe: 'चुनौती च्याम्पियन',
    descriptionEn: 'Complete seasonal challenge',
    descriptionNe: 'मौसमी चुनौती पूरा गर्नुहोस्',
    icon: '🏅',
    color: 'gold'
  },
  REFERRAL_HERO: {
    target: 5,
    nameEn: 'Referral Hero',
    nameNe: 'रेफरल हिरो',
    descriptionEn: 'Refer 5+ successful users',
    descriptionNe: '५+ सफल प्रयोगकर्ता रेफर गर्नुहोस्',
    icon: '🤝',
    color: 'teal'
  }
};

// GET /api/gamification/badges - Get user's badges and progress
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Get user's current badges
    const userBadges = await UserBadge.find({ userId: session.user.id });

    // Calculate progress for each badge type
    const badgeProgress = [];

    for (const [badgeType, config] of Object.entries(BADGE_CONFIG)) {
      const existingBadge = userBadges.find(b => b.badgeType === badgeType);
      
      let progress = 0;
      let isUnlocked = existingBadge?.isUnlocked || false;
      
      if (!isUnlocked) {
        // Calculate current progress based on badge type
        switch (badgeType) {
          case 'REGULAR_CUSTOMER':
          case 'SERVICE_EXPERT':
            const bookingCount = await Booking.countDocuments({
              userId: session.user.id,
              status: 'COMPLETED'
            });
            progress = bookingCount;
            break;
            
          case 'TOP_REVIEWER':
            const reviewCount = await Review.countDocuments({
              userId: session.user.id
            });
            progress = reviewCount;
            break;
            
          case 'EARLY_ADOPTER':
            // Check if user registered in first month (implementation specific)
            progress = 1; // Default to unlocked for existing users
            break;
            
          case 'LOYAL_MEMBER':
            // Calculate days since registration
            const user = await User.findById(session.user.id);
            if (user) {
              const daysSinceRegistration = Math.floor(
                (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
              );
              progress = daysSinceRegistration;
            }
            break;
            
          default:
            progress = existingBadge?.progress || 0;
        }

        // Check if badge should be unlocked
        if (progress >= config.target) {
          isUnlocked = true;
          
          // Create or update badge record
          await UserBadge.findOneAndUpdate(
            { userId: session.user.id, badgeType },
            {
              userId: session.user.id,
              badgeType,
              progress,
              target: config.target,
              isUnlocked: true,
              unlockedAt: new Date()
            },
            { upsert: true }
          );
        } else if (existingBadge) {
          // Update progress
          await UserBadge.findByIdAndUpdate(existingBadge._id, { progress });
        } else {
          // Create new badge record
          await UserBadge.create({
            userId: session.user.id,
            badgeType,
            progress,
            target: config.target,
            isUnlocked: false
          });
        }
      }

      badgeProgress.push({
        type: badgeType,
        progress,
        target: config.target,
        isUnlocked,
        unlockedAt: existingBadge?.unlockedAt,
        config
      });
    }

    return NextResponse.json({
      badges: badgeProgress,
      unlockedCount: badgeProgress.filter(b => b.isUnlocked).length,
      totalCount: badgeProgress.length
    });

  } catch (error) {
    console.error('Error fetching gamification badges:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}