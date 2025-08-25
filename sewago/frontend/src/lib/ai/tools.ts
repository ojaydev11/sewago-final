// import { Service } from '@/models/Service';
// import { Booking } from '@/models/Booking';
// import { User } from '@/models/User';
// import { dbConnect } from '@/lib/mongodb';

// Frontend AI tools disabled to prevent MongoDB SSR crashes

// Tool result interface
export interface ToolResult<T = any> {
  ok: boolean;
  data?: T;
  error?: string;
}

// Service booking tool
export async function bookService(params: {
  userId: string;
  serviceId: string;
  date: string;
  time: string;
  address: string;
  notes?: string;
}): Promise<ToolResult<{ bookingId: string; totalAmount: number }>> {
  try {
    await dbConnect();
    
    // Validate service exists
    const service = await Service.findById(params.serviceId);
    if (!service) {
      return { ok: false, error: 'Service not found' };
    }
    
    // Validate user exists
    const user = await User.findById(params.userId);
    if (!user) {
      return { ok: false, error: 'User not found' };
    }
    
    // Calculate price (using base price for now)
    const totalAmount = service.priceRange.min;
    
    // Create booking
    const booking = new Booking({
      serviceId: params.serviceId,
      userId: params.userId,
      serviceName: service.title,
      servicePrice: totalAmount,
      customerName: user.name,
      customerEmail: user.email,
      customerPhone: user.phone || '',
      address: params.address,
      city: 'Kathmandu', // Default, should be extracted from address
      scheduledDate: params.date,
      scheduledTime: params.time,
      paymentMethod: 'COD',
      paymentStatus: 'PendingCollection',
      totalAmount,
      status: 'Requested',
      specialInstructions: params.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    await booking.save();
    
    return {
      ok: true,
      data: {
        bookingId: booking._id.toString(),
        totalAmount
      }
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Get price quote tool
export async function getQuote(params: {
  serviceId: string;
  district: string;
  hours?: number;
}): Promise<ToolResult<{ minPrice: number; maxPrice: number; estimatedPrice: number }>> {
  try {
    await dbConnect();
    
    const service = await Service.findById(params.serviceId);
    if (!service) {
      return { ok: false, error: 'Service not found' };
    }
    
    // Calculate estimated price based on hours and district
    const basePrice = service.priceRange.min;
    const hourMultiplier = params.hours || 1;
    const districtMultiplier = getDistrictMultiplier(params.district);
    
    const estimatedPrice = Math.round(basePrice * hourMultiplier * districtMultiplier);
    
    return {
      ok: true,
      data: {
        minPrice: service.priceRange.min,
        maxPrice: service.priceRange.max,
        estimatedPrice
      }
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Find availability tool
export async function findAvailability(params: {
  serviceId: string;
  district: string;
  dateRange: { start: string; end: string };
}): Promise<ToolResult<{ availableSlots: Array<{ date: string; times: string[] }> }>> {
  try {
    await dbConnect();
    
    // Mock availability for now - in real app, this would check provider schedules
    const availableSlots = [
      {
        date: params.dateRange.start,
        times: ['9:00 AM', '2:00 PM', '6:00 PM']
      },
      {
        date: params.dateRange.end,
        times: ['10:00 AM', '3:00 PM', '7:00 PM']
      }
    ];
    
    return {
      ok: true,
      data: { availableSlots }
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Cancel booking tool
export async function cancelBooking(params: {
  bookingId: string;
  reason?: string;
}): Promise<ToolResult<{ refundAmount?: number }>> {
  try {
    await dbConnect();
    
    const booking = await Booking.findById(params.bookingId);
    if (!booking) {
      return { ok: false, error: 'Booking not found' };
    }
    
    if (booking.status === 'Cancelled') {
      return { ok: false, error: 'Booking already cancelled' };
    }
    
    // Update status
    booking.status = 'Cancelled';
    booking.updatedAt = new Date().toISOString();
    await booking.save();
    
    // Calculate refund if paid
    let refundAmount: number | undefined;
    if (booking.paymentStatus === 'Paid') {
      refundAmount = booking.totalAmount;
    }
    
    return {
      ok: true,
      data: { refundAmount }
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Get service info tool
export async function getService(params: {
  serviceId: string;
}): Promise<ToolResult<{ service: any }>> {
  try {
    await dbConnect();
    
    const service = await Service.findById(params.serviceId);
    if (!service) {
      return { ok: false, error: 'Service not found' };
    }
    
    return {
      ok: true,
      data: { service }
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Get user bookings tool
export async function getUserBookings(params: {
  userId: string;
  status?: string;
}): Promise<ToolResult<{ bookings: any[] }>> {
  try {
    await dbConnect();
    
    const filter: any = { userId: params.userId };
    if (params.status) {
      filter.status = params.status;
    }
    
    const bookings = await Booking.find(filter).sort({ createdAt: -1 });
    
    return {
      ok: true,
      data: { bookings }
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Helper function for district pricing
function getDistrictMultiplier(district: string): number {
  const multipliers: Record<string, number> = {
    'kathmandu': 1.0,
    'lalitpur': 1.1,
    'bhaktapur': 1.2,
    'kirtipur': 1.15
  };
  
  const normalizedDistrict = district.toLowerCase();
  return multipliers[normalizedDistrict] || 1.0;
}
