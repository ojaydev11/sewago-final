import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/lib/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    const response = await api.get(`/services/${slug}`);
    
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

    console.error('Error fetching service:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service' },
      { status: 500 }
    );
  }
}
