import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Service } from '@/models/Service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Service slug is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const service = await Service.findOne({ 
      slug: slug.toLowerCase(),
      active: true 
    }).lean();

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ service });

  } catch (error) {
    console.error('Service detail API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
