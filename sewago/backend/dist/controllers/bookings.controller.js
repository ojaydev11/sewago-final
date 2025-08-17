"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBooking = createBooking;
exports.listMyBookings = listMyBookings;
exports.getBooking = getBooking;
exports.updateBookingStatus = updateBookingStatus;
const Booking_js_1 = require("../models/Booking.js");
const mongoose_1 = require("mongoose");
async function createBooking(req, res) {
    const userId = req.userId;
    const { providerId, serviceId, date, timeSlot, price, address, payment } = req.body;
    // Prevent overlapping bookings for same provider/time.
    const overlaps = await Booking_js_1.BookingModel.exists({
        providerId: new mongoose_1.Types.ObjectId(providerId),
        date: new Date(date),
        timeSlot,
        status: { $in: ["pending", "accepted", "in-progress"] },
    });
    if (overlaps)
        return res.status(409).json({ message: "slot_unavailable" });
    const booking = await Booking_js_1.BookingModel.create({
        userId,
        providerId,
        serviceId,
        date,
        timeSlot,
        price,
        address,
        payment: { method: "cash", status: "pending", ...(payment !== null && payment !== void 0 ? payment : {}) },
    });
    res.status(201).json(booking);
}
async function listMyBookings(req, res) {
    const userId = req.userId;
    const role = req.userRole;
    const filter = role === "provider" ? { providerId: userId } : { userId };
    const bookings = await Booking_js_1.BookingModel.find(filter).sort({ createdAt: -1 });
    res.json(bookings);
}
async function getBooking(req, res) {
    const booking = await Booking_js_1.BookingModel.findById(req.params.id);
    if (!booking)
        return res.status(404).json({ message: "not_found" });
    res.json(booking);
}
async function updateBookingStatus(req, res) {
    const userId = req.userId;
    const role = req.userRole;
    const { id } = req.params;
    const { status } = req.body;
    const filter = role === "provider" ? { _id: id, providerId: userId } : { _id: id, userId };
    const update = { status };
    if (status === "completed")
        update["payment.status"] = "paid";
    const booking = await Booking_js_1.BookingModel.findOneAndUpdate(filter, update, { new: true });
    if (!booking)
        return res.status(404).json({ message: "Not found" });
    res.json(booking);
}
