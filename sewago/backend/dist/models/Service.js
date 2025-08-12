import mongoose, { Schema } from "mongoose";
const serviceSchema = new Schema({
    title: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    basePrice: { type: Number, required: true },
    providerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    images: [{ type: String }],
    location: { type: String, required: true },
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
}, { timestamps: true });
serviceSchema.index({ category: 1, location: 1 });
serviceSchema.index({ title: "text", description: "text" });
serviceSchema.index({ providerId: 1 });
export const ServiceModel = mongoose.model("Service", serviceSchema);
