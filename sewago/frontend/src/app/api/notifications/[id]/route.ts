import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering to prevent build-time prerendering
export const dynamic = 'force-dynamic';

// Build-time guard to prevent server-only code from running during build
const isBuild = process.env.NEXT_PHASE === 'phase-production-build';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;
    const body = await request.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'markAsRead':
        await notificationService.markAsRead(id, session.user.id);
        break;
      
      case 'markAsClicked':
        await notificationService.markAsClicked(id, session.user.id);
        break;
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `Notification ${action} successfully`,
    });
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;
    await notificationService.deleteNotification(id, session.user.id);

    return NextResponse.json({
      success: true,
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
}
