import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const querySchema = z.object({
  category: z.string().min(1).optional(),
  search: z.string().min(1).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      category: searchParams.get('category') || undefined,
      search: searchParams.get('search') || undefined,
    });
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid query' }, { status: 400 });
    }
    const { category, search } = parsed.data;

    let services = await db.service.findMany();

    // Filter by category if specified
    if (category && category !== 'all') {
      services = services.filter((service: { category: string }) => service.category === category);
    }

    // Filter by search term if specified
    if (search) {
      const searchLower = search.toLowerCase();
      services = services.filter((service: { name: string; description: string; category: string }) => 
        service.name.toLowerCase().includes(searchLower) ||
        service.description.toLowerCase().includes(searchLower) ||
        service.category.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({
      services,
      total: services.length,
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}
