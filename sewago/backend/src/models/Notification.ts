import mongoose, { Schema, InferSchemaType } from "mongoose";

const notificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    providerId: { type: Schema.Types.ObjectId, ref: "Provider" },
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking" },
    message: { type: String, required: true },
    type: { type: String, required: true }, // e.g., "booking_update", "payment", "review"
    channel: { type: String, required: true }, // e.g., "sms", "whatsapp", "email", "push"
    sentAt: { type: Date, default: Date.now },
    readAt: { type: Date },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, sentAt: -1 });
notificationSchema.index({ providerId: 1, sentAt: -1 });
notificationSchema.index({ bookingId: 1, sentAt: -1 });
notificationSchema.index({ readAt: 1 });

export type NotificationDocument = InferSchemaType<typeof notificationSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const NotificationModel = mongoose.model("Notification", notificationSchema);
