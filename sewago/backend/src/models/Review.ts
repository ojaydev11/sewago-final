import mongoose, { Schema, InferSchemaType } from "mongoose";

const reviewSchema = new Schema(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    providerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String },
  },
  { timestamps: true }
);

reviewSchema.index({ providerId: 1 });

export type ReviewDocument = InferSchemaType<typeof reviewSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const ReviewModel = mongoose.model("Review", reviewSchema);


