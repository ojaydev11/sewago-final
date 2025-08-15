import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { notificationService } from '@/lib/notificationService';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
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
  try {
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
      priority,
      category,
      data,
      actionUrl,
      actionText,
      deliveryMethods,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      relatedId,
      relatedType,
      source: source || 'user',
      tags,
    });

    return NextResponse.json({
      success: true,
      data: notification,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}
