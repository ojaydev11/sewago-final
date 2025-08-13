
import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  entityType: 'booking' | 'user' | 'provider' | 'risk' | 'payment' | 'support';
  entityId: string;
  action: string;
  performedBy: {
    userId: string;
    role: 'user' | 'provider' | 'admin' | 'system';
    email?: string;
  };
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  metadata: {
    ip?: string;
    userAgent?: string;
    reason?: string;
    riskScore?: number;
  };
  createdAt: Date;
}

const AuditLogSchema: Schema = new Schema({
  entityType: { 
    type: String, 
    required: true,
    enum: ['booking', 'user', 'provider', 'risk', 'payment', 'support'],
    index: true
  },
  entityId: { 
    type: String, 
    required: true,
    index: true 
  },
  action: { 
    type: String, 
    required: true,
    index: true
  },
  performedBy: {
    userId: { type: String, required: true },
    role: { 
      type: String, 
      required: true, 
      enum: ['user', 'provider', 'admin', 'system'] 
    },
    email: { type: String }
  },
  changes: [{
    field: { type: String, required: true },
    oldValue: { type: Schema.Types.Mixed },
    newValue: { type: Schema.Types.Mixed }
  }],
  metadata: {
    ip: { type: String },
    userAgent: { type: String },
    reason: { type: String },
    riskScore: { type: Number }
  }
}, {
  timestamps: { createdAt: true, updatedAt: false },
  collection: 'audit_logs'
});

// Indexes for efficient querying
AuditLogSchema.index({ entityType: 1, entityId: 1 });
AuditLogSchema.index({ 'performedBy.userId': 1 });
AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });

export default mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
