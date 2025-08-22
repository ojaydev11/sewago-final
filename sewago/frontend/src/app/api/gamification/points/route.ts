import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { LoyaltyPoints, PointTransaction, User } from '@/models';

// GET /api/gamification/points - Get user's points balance and recent transactions
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Get or create loyalty points record
    let loyaltyPoints = await LoyaltyPoints.findOne({ userId: session.user.id });
    
    if (!loyaltyPoints) {
      loyaltyPoints = await LoyaltyPoints.create({
        userId: session.user.id,
        totalPoints: 0,
        availablePoints: 0,
        lifetimeEarned: 0
      });
    }

    // Get recent transactions
    const transactions = await PointTransaction.find({ 
      userId: session.user.id 
    })
      .sort({ createdAt: -1 })
      .limit(10);

    return NextResponse.json({
      balance: {
        totalPoints: loyaltyPoints.totalPoints,
        availablePoints: loyaltyPoints.availablePoints,
        lifetimeEarned: loyaltyPoints.lifetimeEarned
      },
      transactions: transactions.map(tx => ({
        id: tx._id,
        points: tx.points,
        type: tx.type,
        source: tx.source,
        description: tx.description,
        createdAt: tx.createdAt
      }))
    });

  } catch (error) {
    console.error('Error fetching gamification points:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/gamification/points - Award points to user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { points, source, sourceId, description } = body;

    if (!points || !source || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: points, source, description' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Get or create loyalty points record
    let loyaltyPoints = await LoyaltyPoints.findOne({ userId: session.user.id });
    
    if (!loyaltyPoints) {
      loyaltyPoints = await LoyaltyPoints.create({
        userId: session.user.id,
        totalPoints: 0,
        availablePoints: 0,
        lifetimeEarned: 0
      });
    }

    // Create transaction record
    const transaction = await PointTransaction.create({
      userId: session.user.id,
      loyaltyPointsId: loyaltyPoints._id,
      points: points,
      type: 'EARNED',
      source: source,
      sourceId: sourceId,
      description: description
    });

    // Update points balance
    await LoyaltyPoints.findByIdAndUpdate(loyaltyPoints._id, {
      $inc: {
        totalPoints: points,
        availablePoints: points,
        lifetimeEarned: points
      }
    });

    return NextResponse.json({
      success: true,
      transaction: {
        id: transaction._id,
        points: transaction.points,
        type: transaction.type,
        source: transaction.source,
        description: transaction.description,
        createdAt: transaction.createdAt
      }
    });

  } catch (error) {
    console.error('Error awarding gamification points:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}