
import { NextRequest, NextResponse } from 'next/server';
import { SupportTicket } from '@/models/SupportTicket';
import { AuditLogger } from '@/lib/audit-logger';
import { FEATURE_FLAGS } from '@/config/flags';
import { dbConnect } from '@/lib/mongodb';
import { generateTicketId } from '@/lib/utils';

export async function POST(request: NextRequest) {
  if (!FEATURE_FLAGS.SUPPORT_CENTER_ENABLED) {
    return NextResponse.json({ error: 'Support center disabled' }, { status: 403 });
  }

  try {
    await dbConnect();
    
    const body = await request.json();
    const {
      userId,
      email,
      name,
      phone,
      bookingId,
      category,
      subject,
      description
    } = body;

    // Validate required fields
    if (!email || !name || !subject || !description || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate unique ticket ID
    const ticketId = generateTicketId();

    // Determine priority based on category and content
    let priority = 'medium';
    if (category === 'payment' || description.toLowerCase().includes('urgent')) {
      priority = 'high';
    }
    if (description.toLowerCase().includes('emergency')) {
      priority = 'urgent';
    }

    const ticket = new SupportTicket({
      ticketId,
      userId,
      email,
      name,
      phone,
      bookingId,
      category,
      priority,
      subject,
      description,
      status: 'open',
      tags: [],
      notes: []
    });

    await ticket.save();

    // Log audit event
    await AuditLogger.logSupportAction(
      ticketId,
      'ticket_created',
      [
        { field: 'status', oldValue: null, newValue: 'open' },
        { field: 'category', oldValue: null, newValue: category },
        { field: 'priority', oldValue: null, newValue: priority }
      ],
      {
        userId: userId || 'anonymous',
        role: 'user',
        email,
        ip: request.headers.get('x-forwarded-for') || '127.0.0.1',
        userAgent: request.headers.get('user-agent') || ''
      }
    );

    return NextResponse.json({
      success: true,
      ticket: {
        ticketId,
        status: 'open',
        priority,
        createdAt: ticket.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating support ticket:', error);
    return NextResponse.json(
      { error: 'Failed to create ticket' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const query: any = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (userId) query.userId = userId;

    const tickets = await SupportTicket.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-notes.content -description') // Exclude sensitive content for list view
      .lean();

    const total = await SupportTicket.countDocuments(query);

    return NextResponse.json({
      success: true,
      tickets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching support tickets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}
