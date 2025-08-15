import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Fetch verified reviews for a specific service
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('serviceId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    if (!serviceId) {
      return NextResponse.json(
        { error: 'serviceId is required' },
        { status: 400 }
      );
    }

    const reviews = await prisma.review.findMany({
      where: {
        serviceId,
        verified: true
      },
      include: {
        user: {
          select: {
            name: true
          }
        },
        service: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    });

    const total = await prisma.review.count({
      where: {
        serviceId,
        verified: true
      }
    });

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// POST: Create a new review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rating, text, mediaUrls, serviceId, userId, bookingId } = body;

    // Verify user has a completed booking for this service
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId,
        serviceId,
        status: 'COMPLETED'
      }
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'No completed booking found for this service' },
        { status: 400 }
      );
    }

    // Check if review already exists for this booking
    const existingReview = await prisma.review.findUnique({
      where: {
        bookingId
      }
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'Review already exists for this booking' },
        { status: 400 }
      );
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        rating,
        text,
        mediaUrls: mediaUrls || [],
        verified: true,
        bookingId,
        userId,
        serviceId
      },
      include: {
        user: {
          select: {
            name: true
          }
        },
        service: {
          select: {
            name: true
          }
        }
      }
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}
