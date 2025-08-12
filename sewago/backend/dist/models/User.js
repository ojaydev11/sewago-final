import mongoose, { Schema } from "mongoose";
const userSchema = new Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["user", "provider", "admin"], default: "user" },
    avatarUrl: { type: String },
    provider: {
        businessName: { type: String },
        categories: [{ type: String }],
        description: { type: String },
        baseLocation: { type: String },
        pricePerHour: { type: Number },
        rating: { type: Number, default: 0 },
        ratingCount: { type: Number, default: 0 },
        isVerified: { type: Boolean, default: false },
    },
    refreshTokenHash: { type: String },
}, { timestamps: true });
userSchema.index({ "provider.categories": 1 });
userSchema.index({ role: 1 });
export const UserModel = mongoose.model("User", userSchema);
