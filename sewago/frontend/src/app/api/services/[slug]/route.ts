import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const service = await db.service.findUnique({
      where: { slug }
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    // Get reviews for this service
    const reviews = await db.review.findMany({
      where: { serviceId: service.id }
    });

    // Calculate average rating
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum: number, review: { rating: number }) => sum + review.rating, 0) / reviews.length 
      : 0;

    return NextResponse.json({
      service: {
        ...service,
        averageRating: Math.round(averageRating * 10) / 10,
        reviewCount: reviews.length,
      },
      reviews,
    });
  } catch (error) {
    console.error('Error fetching service:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service' },
      { status: 500 }
    );
  }
}
