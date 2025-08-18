import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering to prevent build-time prerendering
export const dynamic = 'force-dynamic';

// Build-time guard to prevent server-only code from running during build
const isBuild = process.env.NEXT_PHASE === 'phase-production-build';

export async function POST(request: NextRequest) {
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

    await notificationService.markAllAsRead(session.user.id);

    return NextResponse.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark all notifications as read' },
      { status: 500 }
    );
  }
}
