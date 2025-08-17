"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const bookingSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    serviceId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Service", required: true },
    providerId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Provider" },
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
}, { timestamps: true });
bookingSchema.index({ userId: 1 });
bookingSchema.index({ providerId: 1 });
bookingSchema.index({ status: 1, createdAt: 1 });
exports.BookingModel = mongoose_1.default.model("Booking", bookingSchema);
