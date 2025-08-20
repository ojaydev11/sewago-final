import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
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

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as any;
    const priority = searchParams.get('priority') as any;
    const category = searchParams.get('category') as any;
    const read = searchParams.get('read') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const filters = {
      userId: session.user.id,
      type,
      priority,
      category,
      read,
      limit: Math.min(limit, 100), // Cap at 100
      offset: Math.max(offset, 0),
    };

    const result = await notificationService.getUserNotifications(filters);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

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

    const body = await request.json();
    const {
      type,
      title,
      message,
      priority,
      category,
      data,
      actionUrl,
      actionText,
      deliveryMethods,
      scheduledFor,
      expiresAt,
      relatedId,
      relatedType,
      source,
      tags,
    } = body;

    // Validate required fields
    if (!type || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: type, title, message' },
        { status: 400 }
      );
    }

    // Validate type enum
    const validTypes = ['booking', 'payment', 'verification', 'system', 'promotional', 'reminder'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid notification type' },
        { status: 400 }
      );
    }

    // Create notification
    const notification = await notificationService.createNotification({
      userId: session.user.id,
      type,
      title,
      message,
      priority: priority || 'normal',
      category: category || 'general',
      data,
      actionUrl,
      actionText,
      deliveryMethods: deliveryMethods || ['in_app'],
      scheduledFor,
      expiresAt,
      relatedId,
      relatedType,
      source: source || 'user',
      tags: tags || [],
    });

    return NextResponse.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}
