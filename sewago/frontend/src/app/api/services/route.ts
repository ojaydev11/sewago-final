import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/lib/api';

type ServiceCardItem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  priceRange?: { min: number; max: number };
  isActive: boolean;
};

function mapBackendServiceToCardItem(svc: any): ServiceCardItem {
  const id: string = String(svc?.id ?? svc?._id ?? svc?.slug ?? Math.random().toString(36).slice(2));
  const title: string = String(svc?.title ?? svc?.name ?? 'Service');
  const description: string = String(svc?.description ?? '');
  const category: string = String(svc?.category ?? 'general');
  const imageUrl: string | undefined = Array.isArray(svc?.images) ? svc.images[0] : svc?.imageUrl;
  const basePrice: number | undefined = typeof svc?.basePrice === 'number' ? svc.basePrice : undefined;
  return {
    id,
    slug: String(svc?.slug ?? id),
    title,
    description,
    category,
    imageUrl,
    priceRange: basePrice ? { min: basePrice, max: basePrice } : undefined,
    isActive: Boolean(svc?.isActive ?? true),
  };
}

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
    let services: ServiceCardItem[] = (Array.isArray(backendResp.data) ? backendResp.data : (backendResp.data?.services ?? [])).map(mapBackendServiceToCardItem);

    // Filter by category if specified
    if (category && category !== 'all') {
      services = services.filter((service) => service.category === category);
    }

    // Filter by search term if specified
    if (search) {
      const searchLower = search.toLowerCase();
      services = services.filter((service) => 
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
