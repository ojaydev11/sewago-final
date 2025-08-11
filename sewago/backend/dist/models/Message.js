import mongoose, { Schema } from "mongoose";
const messageSchema = new Schema({
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    fromUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    toUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    readAt: { type: Date },
}, { timestamps: true });
messageSchema.index({ bookingId: 1, createdAt: 1 });
export const MessageModel = mongoose.model("Message", messageSchema);
