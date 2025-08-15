import mongoose, { Schema, InferSchemaType } from "mongoose";

const bookingSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    serviceId: { type: Schema.Types.ObjectId, ref: "Service", required: true },
    providerId: { type: Schema.Types.ObjectId, ref: "Provider" },
    status: {
      type: String,
      enum: [
        "PENDING_CONFIRMATION",
        "CONFIRMED", 
        "PROVIDER_ASSIGNED",
        "EN_ROUTE",
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELED",
        "DISPUTED"
      ],
      default: "PENDING_CONFIRMATION",
    },
    address: { type: String, required: true },
    notes: { type: String },
    total: { type: Number, required: true },
    paid: { type: Boolean, default: false },
    scheduledAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

bookingSchema.index({ userId: 1 });
bookingSchema.index({ providerId: 1 });
bookingSchema.index({ status: 1, createdAt: 1 });

export type BookingDocument = InferSchemaType<typeof bookingSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const BookingModel = mongoose.model("Booking", bookingSchema);


