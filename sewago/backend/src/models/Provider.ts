import mongoose, { Schema, InferSchemaType } from "mongoose";

const providerSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true },
    verified: { type: Boolean, default: false },
    onTimePct: { type: Number, default: 100 },
    completionPct: { type: Number, default: 100 },
    yearsActive: { type: Number, default: 1 },
    tier: { type: String, default: "PROVISIONAL" },
    skills: [{ type: String }],
    zones: [{ type: String }],
    isOnline: { type: Boolean, default: false },
    currentLat: { type: Number },
    currentLng: { type: Number },
  },
  { timestamps: true }
);

providerSchema.index({ skills: 1 });
providerSchema.index({ zones: 1 });
providerSchema.index({ isOnline: 1 });
providerSchema.index({ verified: 1 });

export type ProviderDocument = InferSchemaType<typeof providerSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const ProviderModel = mongoose.model("Provider", providerSchema);
