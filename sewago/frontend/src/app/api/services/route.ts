import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let services = await db.service.findMany();

    // Filter by category if specified
    if (category && category !== 'all') {
      services = services.filter((service: { category: string }) => service.category === category);
    }

    // Filter by search term if specified
    if (search) {
      const searchLower = search.toLowerCase();
      services = services.filter((service: { title: string; description: string; category: string }) => 
        service.title.toLowerCase().includes(searchLower) ||
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
