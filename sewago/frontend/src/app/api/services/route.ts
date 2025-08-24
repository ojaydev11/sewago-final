import { NextRequest, NextResponse } from 'next/server';

// Mock services data for when database is not available
const mockServices = [
  {
    id: 'house-cleaning',
    name: 'House Cleaning',
    category: 'Cleaning',
    description: 'Professional house cleaning services',
    price: 2000,
    rating: 4.8,
    providers: 45,
    image: '/icons/cleaning.svg'
  },
  {
    id: 'electrical-work',
    name: 'Electrical Work',
    category: 'Home Repair',
    description: 'Licensed electricians for all electrical needs',
    price: 1500,
    rating: 4.9,
    providers: 32,
    image: '/icons/electrical.svg'
  },
  {
    id: 'plumbing',
    name: 'Plumbing',
    category: 'Home Repair', 
    description: 'Professional plumbers for repairs and installations',
    price: 1800,
    rating: 4.7,
    providers: 28,
    image: '/icons/plumbing.svg'
  },
  {
    id: 'gardening',
    name: 'Gardening',
    category: 'Outdoor',
    description: 'Garden maintenance and landscaping services',
    price: 1200,
    rating: 4.6,
    providers: 18,
    image: '/icons/gardening.svg'
  },
  {
    id: 'repairs',
    name: 'Home Repairs',
    category: 'Home Repair',
    description: 'General home repair and maintenance services',
    price: 1000,
    rating: 4.5,
    providers: 52,
    image: '/icons/repairs.svg'
  },
  {
    id: 'moving',
    name: 'Moving Services',
    category: 'Transport',
    description: 'Professional moving and packing services',
    price: 3000,
    rating: 4.4,
    providers: 15,
    image: '/icons/moving.svg'
  }
];

// GET /api/services - Get all services
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    let services = [...mockServices];
    
    // Filter by category if specified
    if (category && category !== 'all') {
      services = services.filter(service => 
        service.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    // Filter by search term if specified
    if (search) {
      const searchLower = search.toLowerCase();
      services = services.filter(service =>
        service.name.toLowerCase().includes(searchLower) ||
        service.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply limit
    services = services.slice(0, limit);
    
    return NextResponse.json({
      success: true,
      data: services,
      total: services.length,
      categories: ['All', 'Cleaning', 'Home Repair', 'Outdoor', 'Transport']
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    
    // Always return some data to prevent frontend errors
    return NextResponse.json({
      success: true,
      data: mockServices.slice(0, 6),
      total: mockServices.length,
      categories: ['All', 'Cleaning', 'Home Repair', 'Outdoor', 'Transport'],
      fallback: true
    });
  }
}

// POST /api/services - Create new service (admin only)
export async function POST(request: NextRequest) {
  try {
    // For demo purposes, just return success
    const body = await request.json();
    
    return NextResponse.json({
      success: true,
      message: 'Service created successfully (demo mode)',
      data: { 
        id: `service-${Date.now()}`,
        ...body,
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create service'
    }, { status: 500 });
  }
}