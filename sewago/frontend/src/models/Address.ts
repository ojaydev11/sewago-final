import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAddress extends Document {
  userId: Types.ObjectId;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  street: {
    type: String,
    required: true,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: String,
    required: true,
    trim: true,
  },
  postalCode: {
    type: String,
    required: true,
    trim: true,
  },
  country: {
    type: String,
    required: true,
    default: 'Nepal',
    trim: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
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
AddressSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Ensure only one default address per user
AddressSchema.pre('save', async function(next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

// Indexes for performance
AddressSchema.index({ userId: 1 });
AddressSchema.index({ isDefault: 1 });
AddressSchema.index({ city: 1 });
AddressSchema.index({ state: 1 });

// Hot-reload guard
export const Address = mongoose.models.Address || mongoose.model<IAddress>('Address', AddressSchema);
