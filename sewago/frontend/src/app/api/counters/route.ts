import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering to prevent build-time issues
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Mock data for development/testing
    const mockCounters = {
      jobsCompleted: Math.floor(Math.random() * 10000) + 5000, // 5000-15000
      avgResponseM: Math.floor(Math.random() * 30) + 15, // 15-45 minutes
      satisfaction: (Math.random() * 20 + 80).toFixed(1), // 80-100%
    };

    // Add some realistic variation based on time
    const now = new Date();
    const hour = now.getHours();
    
    // Simulate peak hours (9 AM - 5 PM) with higher numbers
    if (hour >= 9 && hour <= 17) {
      mockCounters.jobsCompleted += Math.floor(Math.random() * 2000);
      mockCounters.avgResponseM = Math.max(10, mockCounters.avgResponseM - 5);
      mockCounters.satisfaction = Math.min(100, (parseFloat(mockCounters.satisfaction) + 2).toFixed(1));
    }

    return NextResponse.json({
      success: true,
      data: mockCounters,
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Error fetching counters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch counters' },
      { status: 500 }
    );
  }
}
