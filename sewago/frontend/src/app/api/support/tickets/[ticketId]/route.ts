
import { NextRequest, NextResponse } from 'next/server';
import { SupportTicket } from '@/models/SupportTicket';
import { AuditLogger } from '@/lib/audit-logger';
import { dbConnect } from '@/lib/mongodb';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { ticketId: string } }
) {
  try {
    await dbConnect();
    
    const ticket = await SupportTicket.findOne({ ticketId: params.ticketId }).lean();
    
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      ticket
    });

  } catch (error) {
    console.error('Error fetching ticket:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ticket' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { ticketId: string } }
) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { status, assignedTo, resolution, priority, tags, note } = body;

    const ticket = await SupportTicket.findOne({ ticketId: params.ticketId });
    
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const changes: { field: string; oldValue: any; newValue: any }[] = [];

    // Update fields and track changes
    if (status && status !== ticket.status) {
      changes.push({ field: 'status', oldValue: ticket.status, newValue: status });
      ticket.status = status;
      
      if (status === 'resolved' || status === 'closed') {
        ticket.resolvedAt = new Date();
      }
    }

    if (assignedTo !== undefined) {
      changes.push({ field: 'assignedTo', oldValue: ticket.assignedTo, newValue: assignedTo });
      ticket.assignedTo = assignedTo;
    }

    if (resolution) {
      changes.push({ field: 'resolution', oldValue: ticket.resolution, newValue: resolution });
      ticket.resolution = resolution;
    }

    if (priority && priority !== ticket.priority) {
      changes.push({ field: 'priority', oldValue: ticket.priority, newValue: priority });
      ticket.priority = priority;
    }

    if (tags && Array.isArray(tags)) {
      changes.push({ field: 'tags', oldValue: ticket.tags, newValue: tags });
      ticket.tags = tags;
    }

    // Add note if provided
    if (note && note.content) {
      ticket.notes.push({
        content: note.content,
        addedBy: note.addedBy,
        isPrivate: note.isPrivate || false,
        createdAt: new Date()
      });
      changes.push({ field: 'note_added', oldValue: null, newValue: note.content });
    }

    await ticket.save();

    // Log audit event
    if (changes.length > 0) {
      await AuditLogger.logSupportAction(
        params.ticketId,
        'ticket_updated',
        changes,
        {
          userId: body.updatedBy || 'system',
          role: 'admin',
          reason: body.reason,
          ip: request.headers.get('x-forwarded-for') || '127.0.0.1'
        }
      );
    }

    return NextResponse.json({
      success: true,
      ticket: ticket.toObject()
    });

  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json(
      { error: 'Failed to update ticket' },
      { status: 500 }
    );
  }
}
