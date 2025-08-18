import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering to prevent build-time prerendering
export const dynamic = 'force-dynamic';

// Build-time guard to prevent server-only code from running during build
const isBuild = process.env.NEXT_PHASE === 'phase-production-build';

export async function GET(request: NextRequest) {
  // Skip execution during build phase
  if (isBuild) {
    return new Response(null, { status: 204 });
  }

  try {
    // Lazy import server-only modules
    const { getServerSession } = await import('next-auth');
    const { authOptions } = await import('@/lib/auth');
    const { notificationService } = await import('@/lib/notificationService');
    const { connectToDatabase } = await import('@/lib/mongodb');

    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const stats = await notificationService.getUserNotificationStats(session.user.id);

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification stats' },
      { status: 500 }
    );
  }
}
