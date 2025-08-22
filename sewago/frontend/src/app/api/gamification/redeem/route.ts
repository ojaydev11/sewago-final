import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { LoyaltyPoints, PointRedemption, PointTransaction } from '@/models';

// Redemption tiers and rewards
const REDEMPTION_TIERS = [
  {
    id: 'discount_5',
    nameEn: '5% Discount',
    nameNe: '५% छुट',
    points: 100,
    discountPercent: 5,
    maxDiscount: 500, // NPR 5
    icon: '🎟️',
    color: 'blue'
  },
  {
    id: 'discount_10',
    nameEn: '10% Discount',
    nameNe: '१०% छुट',
    points: 200,
    discountPercent: 10,
    maxDiscount: 1000, // NPR 10
    icon: '🎫',
    color: 'green'
  },
  {
    id: 'discount_15',
    nameEn: '15% Discount',
    nameNe: '१५% छुट',
    points: 350,
    discountPercent: 15,
    maxDiscount: 2000, // NPR 20
    icon: '🎪',
    color: 'orange'
  },
  {
    id: 'discount_20',
    nameEn: '20% Discount',
    nameNe: '२०% छुट',
    points: 500,
    discountPercent: 20,
    maxDiscount: 3000, // NPR 30
    icon: '🏆',
    color: 'gold'
  },
  {
    id: 'free_service',
    nameEn: 'Free Service (up to NPR 50)',
    nameNe: 'निःशुल्क सेवा (NPR ५० सम्म)',
    points: 1000,
    discountPercent: 100,
    maxDiscount: 5000, // NPR 50
    icon: '💎',
    color: 'diamond'
  }
];

// GET /api/gamification/redeem - Get available redemption options and user's redemption history
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Get user's current points
    const loyaltyPoints = await LoyaltyPoints.findOne({ userId: session.user.id });
    const availablePoints = loyaltyPoints?.availablePoints || 0;

    // Get user's redemption history
    const redemptions = await PointRedemption.find({ 
      userId: session.user.id 
    })
      .sort({ createdAt: -1 })
      .limit(10);

    // Filter available tiers based on points
    const availableTiers = REDEMPTION_TIERS.map(tier => ({
      ...tier,
      isAvailable: availablePoints >= tier.points,
      remaining: Math.max(0, tier.points - availablePoints)
    }));

    return NextResponse.json({
      availablePoints,
      tiers: availableTiers,
      redemptions: redemptions.map(r => ({
        id: r._id,
        points: r.points,
        discountAmount: r.discountAmount,
        status: r.status,
        createdAt: r.createdAt,
        redeemedAt: r.redeemedAt,
        bookingId: r.bookingId
      }))
    });

  } catch (error) {
    console.error('Error fetching redemption options:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/gamification/redeem - Redeem points for discount
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { tierId, serviceAmount } = body;

    if (!tierId) {
      return NextResponse.json(
        { error: 'Missing required field: tierId' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the redemption tier
    const tier = REDEMPTION_TIERS.find(t => t.id === tierId);
    if (!tier) {
      return NextResponse.json(
        { error: 'Invalid redemption tier' },
        { status: 400 }
      );
    }

    // Get user's current points
    const loyaltyPoints = await LoyaltyPoints.findOne({ userId: session.user.id });
    if (!loyaltyPoints || loyaltyPoints.availablePoints < tier.points) {
      return NextResponse.json(
        { error: 'Insufficient points' },
        { status: 400 }
      );
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (serviceAmount) {
      // Calculate percentage discount
      discountAmount = Math.min(
        Math.floor((serviceAmount * tier.discountPercent) / 100),
        tier.maxDiscount
      );
    } else {
      // Use maximum discount for voucher
      discountAmount = tier.maxDiscount;
    }

    // Create redemption record
    const redemption = await PointRedemption.create({
      userId: session.user.id,
      loyaltyPointsId: loyaltyPoints._id,
      points: tier.points,
      discountAmount: discountAmount,
      status: 'PENDING'
    });

    // Deduct points from user's balance
    await LoyaltyPoints.findByIdAndUpdate(loyaltyPoints._id, {
      $inc: {
        availablePoints: -tier.points
      }
    });

    // Create point transaction record
    await PointTransaction.create({
      userId: session.user.id,
      loyaltyPointsId: loyaltyPoints._id,
      points: -tier.points,
      type: 'REDEEMED',
      source: 'redemption',
      sourceId: redemption._id,
      description: `Redeemed ${tier.points} points for ${tier.nameEn}`
    });

    return NextResponse.json({
      success: true,
      redemption: {
        id: redemption._id,
        points: redemption.points,
        discountAmount: redemption.discountAmount,
        discountPercent: tier.discountPercent,
        maxDiscount: tier.maxDiscount,
        tier: tier,
        status: redemption.status,
        createdAt: redemption.createdAt
      },
      remainingPoints: loyaltyPoints.availablePoints - tier.points
    });

  } catch (error) {
    console.error('Error redeeming points:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}