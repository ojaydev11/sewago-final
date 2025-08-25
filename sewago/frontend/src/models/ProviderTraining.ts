
import mongoose, { Schema, Document } from 'mongoose';

export interface IProviderTraining extends Document {
  providerId: string;
  courses: {
    courseId: string;
    courseName: string;
    completedAt: Date;
    score: number;
    certificationLevel: 'bronze' | 'silver' | 'gold';
  }[];
  overallCertification: 'bronze' | 'silver' | 'gold' | 'none';
  totalPoints: number;
  badges: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProviderTrainingSchema: Schema = new Schema({
  providerId: { 
    type: String, 
    required: true, 
    unique: true
  },
  courses: [{
    courseId: { type: String, required: true },
    courseName: { type: String, required: true },
    completedAt: { type: Date, required: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    certificationLevel: { 
      type: String, 
      required: true,
      enum: ['bronze', 'silver', 'gold']
    }
  }],
  overallCertification: { 
    type: String, 
    required: true,
    enum: ['bronze', 'silver', 'gold', 'none'],
    default: 'none'
  },
  totalPoints: { type: Number, default: 0 },
  badges: [{ type: String }]
}, {
  timestamps: true,
  collection: 'provider_training'
});

// Indexes for performance
ProviderTrainingSchema.index({ overallCertification: 1, totalPoints: -1 });
ProviderTrainingSchema.index({ 'courses.courseId': 1 });

export default mongoose.models.ProviderTraining || mongoose.model<IProviderTraining>('ProviderTraining', ProviderTrainingSchema);
