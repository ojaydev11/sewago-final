import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { Service } from '@/models/Service';
import { mockStore } from '@/lib/mockStore';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const connection = await dbConnect();
    
    if (connection) {
      // Use MongoDB
      const service = await Service.findOne({ slug });
      
      if (!service) {
        return NextResponse.json(
          { error: 'Service not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(service);
    } else {
      // Use mock store
      const services = await mockStore.findServices({ slug });
      const service = services[0];
      
      if (!service) {
        return NextResponse.json(
          { error: 'Service not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(service);
    }
  } catch (error) {
    console.error('Service detail API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
