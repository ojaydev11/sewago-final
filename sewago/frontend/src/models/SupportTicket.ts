
import mongoose, { Schema, Document } from 'mongoose';

export interface ISupportTicket extends Document {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'general' | 'technical' | 'billing' | 'service' | 'other';
  assignedTo?: string;
  notes?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SupportTicketSchema = new Schema<ISupportTicket>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  subject: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000,
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  category: {
    type: String,
    enum: ['general', 'technical', 'billing', 'service', 'other'],
    default: 'general',
  },
  assignedTo: {
    type: String,
    trim: true,
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  resolvedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
SupportTicketSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Indexes for performance
SupportTicketSchema.index({ email: 1 });
SupportTicketSchema.index({ status: 1 });
SupportTicketSchema.index({ priority: 1 });
SupportTicketSchema.index({ category: 1 });
SupportTicketSchema.index({ createdAt: -1 });

// Hot-reload guard
export const SupportTicket = mongoose.models.SupportTicket || mongoose.model<ISupportTicket>('SupportTicket', SupportTicketSchema);
