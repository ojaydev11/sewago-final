import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { Service } from '@/models/Service';
import { mockStore } from '@/lib/mockStore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const connection = await dbConnect();
    
    if (connection) {
      // Use MongoDB
      const filter = category ? { category } : {};
      const services = await Service.find(filter).sort({ createdAt: -1 });
      
      return NextResponse.json(services);
    } else {
      // Use mock store
      const filter = category ? { category } : undefined;
      const services = await mockStore.findServices(filter);
      
      return NextResponse.json(services);
    }
  } catch (error) {
    console.error('Services API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
