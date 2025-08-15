import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IVerification extends Document {
  _id: string;
  providerId: Types.ObjectId;
  userId: Types.ObjectId;
  status: 'pending' | 'in_progress' | 'approved' | 'rejected';
  verificationType: 'basic' | 'enhanced' | 'premium';
  
  // Personal Information Verification
  personalInfo: {
    nameVerified: boolean;
    phoneVerified: boolean;
    emailVerified: boolean;
    addressVerified: boolean;
  };
  
  // Document Verification
  documents: Array<{
    type: 'id_proof' | 'address_proof' | 'certification' | 'insurance' | 'background_check' | 'other';
    url: string;
    filename: string;
    verified: boolean;
    verifiedBy?: Types.ObjectId;
    verifiedAt?: Date;
    rejectionReason?: string;
    uploadedAt: Date;
  }>;
  
  // Background Check
  backgroundCheck: {
    criminalRecord: boolean;
    criminalRecordDetails?: string;
    employmentHistory: boolean;
    employmentHistoryDetails?: string;
    references: Array<{
      name: string;
      phone: string;
      email: string;
      relationship: string;
      verified: boolean;
      verifiedAt?: Date;
    }>;
  };
  
  // Skills & Experience Verification
  skillsVerification: {
    certifications: Array<{
      name: string;
      issuingAuthority: string;
      issueDate: Date;
      expiryDate?: Date;
      verified: boolean;
      verifiedAt?: Date;
    }>;
    experienceVerified: boolean;
    experienceYears: number;
    previousEmployers: Array<{
      name: string;
      position: string;
      duration: string;
      verified: boolean;
    }>;
  };
  
  // Verification Process
  verificationProcess: {
    submittedAt: Date;
    assignedTo?: Types.ObjectId;
    startedAt?: Date;
    completedAt?: Date;
    estimatedCompletion?: Date;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    notes: string[];
  };
  
  // Final Decision
  decision: {
    approved: boolean;
    approvedBy?: Types.ObjectId;
    approvedAt?: Date;
    rejectionReason?: string;
    rejectionDetails?: string;
    appealDeadline?: Date;
  };
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

const VerificationSchema = new Schema<IVerification>({
  providerId: {
    type: Schema.Types.ObjectId,
    ref: 'Provider',
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'approved', 'rejected'],
    default: 'pending',
  },
  verificationType: {
    type: String,
    enum: ['basic', 'enhanced', 'premium'],
    default: 'basic',
  },
  
  // Personal Information Verification
  personalInfo: {
    nameVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },
    addressVerified: { type: Boolean, default: false },
  },
  
  // Document Verification
  documents: [{
    type: {
      type: String,
      required: true,
      enum: ['id_proof', 'address_proof', 'certification', 'insurance', 'background_check', 'other'],
    },
    url: { type: String, required: true },
    filename: { type: String, required: true },
    verified: { type: Boolean, default: false },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date },
    rejectionReason: { type: String },
    uploadedAt: { type: Date, default: Date.now },
  }],
  
  // Background Check
  backgroundCheck: {
    criminalRecord: { type: Boolean, default: false },
    criminalRecordDetails: { type: String },
    employmentHistory: { type: Boolean, default: false },
    employmentHistoryDetails: { type: String },
    references: [{
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, required: true },
      relationship: { type: String, required: true },
      verified: { type: Boolean, default: false },
      verifiedAt: { type: Date },
    }],
  },
  
  // Skills & Experience Verification
  skillsVerification: {
    certifications: [{
      name: { type: String, required: true },
      issuingAuthority: { type: String, required: true },
      issueDate: { type: Date, required: true },
      expiryDate: { type: Date },
      verified: { type: Boolean, default: false },
      verifiedAt: { type: Date },
    }],
    experienceVerified: { type: Boolean, default: false },
    experienceYears: { type: Number, default: 0 },
    previousEmployers: [{
      name: { type: String, required: true },
      position: { type: String, required: true },
      duration: { type: String, required: true },
      verified: { type: Boolean, default: false },
    }],
  },
  
  // Verification Process
  verificationProcess: {
    submittedAt: { type: Date, default: Date.now },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    startedAt: { type: Date },
    completedAt: { type: Date },
    estimatedCompletion: { type: Date },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    notes: [{ type: String }],
  },
  
  // Final Decision
  decision: {
    approved: { type: Boolean, default: false },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    rejectionReason: { type: String },
    rejectionDetails: { type: String },
    appealDeadline: { type: Date },
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update the updatedAt field before saving
VerificationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Indexes for performance
VerificationSchema.index({ providerId: 1 });
VerificationSchema.index({ userId: 1 });
VerificationSchema.index({ status: 1 });
VerificationSchema.index({ 'verificationProcess.priority': 1 });
VerificationSchema.index({ 'verificationProcess.assignedTo': 1 });

// Virtual for completion percentage
VerificationSchema.virtual('completionPercentage').get(function() {
  const totalChecks = 4; // personalInfo, documents, backgroundCheck, skillsVerification
  let completedChecks = 0;
  
  // Check personal info completion
  if (this.personalInfo.nameVerified && this.personalInfo.phoneVerified && 
      this.personalInfo.emailVerified && this.personalInfo.addressVerified) {
    completedChecks++;
  }
  
  // Check documents completion
  if (this.documents.length > 0 && this.documents.every(doc => doc.verified)) {
    completedChecks++;
  }
  
  // Check background check completion
  if (this.backgroundCheck.criminalRecord && this.backgroundCheck.employmentHistory &&
      this.backgroundCheck.references.every(ref => ref.verified)) {
    completedChecks++;
  }
  
  // Check skills verification completion
  if (this.skillsVerification.experienceVerified && 
      this.skillsVerification.certifications.every(cert => cert.verified)) {
    completedChecks++;
  }
  
  return Math.round((completedChecks / totalChecks) * 100);
});

// Virtual for estimated time remaining
VerificationSchema.virtual('estimatedTimeRemaining').get(function() {
  if (this.status === 'completed' || this.status === 'rejected') {
    return 0;
  }
  
  const now = new Date();
  const estimatedCompletion = this.verificationProcess.estimatedCompletion;
  
  if (!estimatedCompletion) {
    return null;
  }
  
  const timeRemaining = estimatedCompletion.getTime() - now.getTime();
  return Math.max(0, Math.ceil(timeRemaining / (1000 * 60 * 60 * 24))); // days
});

export const Verification = mongoose.models.Verification || mongoose.model<IVerification>('Verification', VerificationSchema);
export default Verification;
