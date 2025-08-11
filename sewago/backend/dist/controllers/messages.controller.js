import { MessageModel } from "../models/Message.js";
export async function listMessages(req, res) {
    const { bookingId } = req.params;
    const userId = req.userId;
    const messages = await MessageModel.find({ bookingId, $or: [{ fromUserId: userId }, { toUserId: userId }] })
        .sort({ createdAt: 1 })
        .limit(500);
    res.json(messages);
}
export async function sendMessage(req, res) {
    const userId = req.userId;
    const { bookingId } = req.params;
    const { toUserId, content } = req.body;
    const message = await MessageModel.create({ bookingId, fromUserId: userId, toUserId, content });
    res.status(201).json(message);
}
