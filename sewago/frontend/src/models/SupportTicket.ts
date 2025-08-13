
import mongoose, { Schema, Document } from 'mongoose';

export interface ISupportTicket extends Document {
  ticketId: string;
  userId?: string;
  email: string;
  name: string;
  phone?: string;
  bookingId?: string;
  category: 'booking' | 'payment' | 'service' | 'technical' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'assigned' | 'waiting_customer' | 'resolved' | 'closed';
  subject: string;
  description: string;
  assignedTo?: string;
  resolution?: string;
  tags: string[];
  notes: {
    content: string;
    addedBy: string;
    isPrivate: boolean;
    createdAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

const SupportTicketSchema: Schema = new Schema({
  ticketId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true
  },
  userId: { 
    type: String,
    index: true 
  },
  email: { 
    type: String, 
    required: true,
    index: true
  },
  name: { type: String, required: true },
  phone: { type: String },
  bookingId: { 
    type: String,
    index: true 
  },
  category: { 
    type: String, 
    required: true,
    enum: ['booking', 'payment', 'service', 'technical', 'other'],
    index: true
  },
  priority: { 
    type: String, 
    required: true,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true
  },
  status: { 
    type: String, 
    required: true,
    enum: ['open', 'assigned', 'waiting_customer', 'resolved', 'closed'],
    default: 'open',
    index: true
  },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  assignedTo: { type: String },
  resolution: { type: String },
  tags: [{ type: String }],
  notes: [{
    content: { type: String, required: true },
    addedBy: { type: String, required: true },
    isPrivate: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],
  resolvedAt: { type: Date }
}, {
  timestamps: true,
  collection: 'support_tickets'
});

// Indexes for efficient querying
SupportTicketSchema.index({ status: 1, priority: -1, createdAt: -1 });
SupportTicketSchema.index({ assignedTo: 1, status: 1 });
SupportTicketSchema.index({ category: 1, status: 1 });

export default mongoose.models.SupportTicket || mongoose.model<ISupportTicket>('SupportTicket', SupportTicketSchema);
