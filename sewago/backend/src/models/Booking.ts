import mongoose, { Schema, InferSchemaType } from "mongoose";

const bookingSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    providerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    serviceId: { type: Schema.Types.ObjectId, ref: "Service", required: true },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "completed", "cancelled"],
      default: "pending",
    },
    price: { type: Number, required: true },
    address: { type: String, required: true },
    payment: {
      method: { type: String, enum: ["esewa", "khalti", "cash"], default: "cash" },
      referenceId: { type: String },
      status: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    },
  },
  { timestamps: true }
);

bookingSchema.index({ userId: 1 });
bookingSchema.index({ providerId: 1 });

export type BookingDocument = InferSchemaType<typeof bookingSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const BookingModel = mongoose.model("Booking", bookingSchema);


