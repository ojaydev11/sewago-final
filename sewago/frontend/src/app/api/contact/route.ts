import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { SupportTicket } from '@/models/SupportTicket';

// POST /api/contact - Create a support ticket
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message, category } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Create the support ticket
    const supportTicket = new SupportTicket({
      name,
      email,
      phone: phone || '',
      subject,
      message,
      category: category || 'general',
      status: 'open',
      priority: 'medium'
    });

    await supportTicket.save();

    // TODO: Send email notification (implement with Resend/SMTP)
    // await sendEmailNotification({
    //   to: 'support@sewago.com',
    //   subject: `New Support Ticket: ${subject}`,
    //   body: `
    //     New support ticket received:
    //     Name: ${name}
    //     Email: ${email}
    //     Phone: ${phone || 'Not provided'}
    //     Category: ${category || 'general'}
    //     Subject: ${subject}
    //     Message: ${message}
    //   `
    // });

    // TODO: Send confirmation email to customer
    // await sendEmailNotification({
    //   to: email,
    //   subject: 'Support Ticket Received - SewaGo',
    //   body: `
    //     Dear ${name},
    //     Thank you for contacting SewaGo support. We have received your message and will get back to you within 24 hours.
    //     Ticket ID: ${supportTicket._id}
    //     Subject: ${subject}
    //     Best regards,
    //     SewaGo Support Team
    //   `
    // });

    return NextResponse.json(
      { 
        message: 'Support ticket created successfully',
        ticketId: supportTicket._id
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating support ticket:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
