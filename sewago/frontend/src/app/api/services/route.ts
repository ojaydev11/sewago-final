import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    
    // Build query parameters for backend API
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (search) params.set('search', search);

    const response = await api.get(`/services?${params.toString()}`);
    
    return NextResponse.json(response.data);
  } catch (error) {
    // Handle axios errors
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response: { status: number; data: Record<string, unknown> } };
      return NextResponse.json(
        axiosError.response.data,
        { status: axiosError.response.status }
      );
    }

    console.error('Error fetching services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}
