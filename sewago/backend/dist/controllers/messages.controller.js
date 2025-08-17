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
exports.listMessages = listMessages;
exports.sendMessage = sendMessage;
const Message_js_1 = require("../models/Message.js");
async function listMessages(req, res) {
    const { bookingId } = req.params;
    const userId = req.userId;
    const messages = await Message_js_1.MessageModel.find({ bookingId, $or: [{ fromUserId: userId }, { toUserId: userId }] })
        .sort({ createdAt: 1 })
        .limit(500);
    res.json(messages);
}
async function sendMessage(req, res) {
    const userId = req.userId;
    const { bookingId } = req.params;
    const { toUserId, content } = req.body;
    // For E2E, if toUserId not provided, fallback by flipping between booking parties
    let targetUserId = toUserId;
    if (!targetUserId) {
        const { BookingModel } = await Promise.resolve().then(() => __importStar(require("../models/Booking.js")));
        const booking = await BookingModel.findById(bookingId);
        if (booking) {
            targetUserId = String(booking.userId) === userId ? String(booking.providerId) : String(booking.userId);
        }
    }
    if (!targetUserId)
        return res.status(400).json({ message: "toUserId required" });
    const message = await Message_js_1.MessageModel.create({ bookingId, fromUserId: userId, toUserId: targetUserId, content });
    res.status(201).json(message);
}
