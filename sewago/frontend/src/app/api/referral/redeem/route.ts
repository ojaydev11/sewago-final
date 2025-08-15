import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { pricing } from '@/config/pricing';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { referralCode, newUserId } = body;

    if (!referralCode || !newUserId) {
      return NextResponse.json(
        { error: 'Referral code and new user ID are required' },
        { status: 400 }
      );
    }

    // Find the referral record
    const referral = await prisma.referral.findUnique({
      where: {
        code: referralCode
      },
      include: {
        referrer: true
      }
    });

    if (!referral) {
      return NextResponse.json(
        { error: 'Invalid referral code' },
        { status: 400 }
      );
    }

    if (referral.referredId) {
      return NextResponse.json(
        { error: 'Referral code has already been used' },
        { status: 400 }
      );
    }

    // Update referral with the new user
    await prisma.referral.update({
      where: {
        id: referral.id
      },
      data: {
        referredId: newUserId
      }
    });

    // Credit coins to both users
    const referrerCoins = pricing.coins.referralBoth;
    const referredCoins = pricing.coins.referralBoth;

    // Update referrer's coins
    await prisma.user.update({
      where: {
        id: referral.referrerId
      },
      data: {
        coins: {
          increment: referrerCoins
        }
      }
    });

    // Update referred user's coins
    await prisma.user.update({
      where: {
        id: newUserId
      },
      data: {
        coins: {
          increment: referredCoins
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Referral redeemed successfully',
      referrerCoins,
      referredCoins
    });
  } catch (error) {
    console.error('Error redeeming referral:', error);
    return NextResponse.json(
      { error: 'Failed to redeem referral' },
      { status: 500 }
    );
  }
}
