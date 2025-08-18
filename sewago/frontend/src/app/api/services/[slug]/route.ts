import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const paramsSchema = z.object({ slug: z.string().min(1) });

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const parsed = paramsSchema.safeParse({ slug });
    if (!parsed.success) return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });

    const service = await db.service.findUnique({ where: { slug: parsed.data.slug } });
    if (!service) return NextResponse.json({ error: 'Service not found' }, { status: 404 });

    const reviews = await db.review.findMany({ where: { serviceId: service.id } });
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
    return NextResponse.json({ error: 'Failed to fetch service' }, { status: 500 });
  }
}
