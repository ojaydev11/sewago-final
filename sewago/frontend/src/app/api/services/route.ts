import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const backendResp = await api.get('/services', {
      params: {
        category: category ?? undefined,
        q: search ?? undefined,
      }
    });
    let services = Array.isArray(backendResp.data) ? backendResp.data : (backendResp.data?.services ?? []);

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
