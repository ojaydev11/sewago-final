import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/lib/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const resp = await api.get('/services', { params: { q: slug } });
    const list = Array.isArray(resp.data) ? resp.data : (resp.data?.services ?? []);
    const service = list.find((s: any) => s.slug === slug);

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    // Get reviews for this service
    const reviews: Array<{ rating: number }> = [];

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
