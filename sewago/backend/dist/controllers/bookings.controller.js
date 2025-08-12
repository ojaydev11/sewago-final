import { BookingModel } from "../models/Booking.js";
export async function createBooking(req, res) {
    const userId = req.userId;
    const { providerId, serviceId, date, timeSlot, price, address, payment } = req.body;
    const booking = await BookingModel.create({
        userId,
        providerId,
        serviceId,
        date,
        timeSlot,
        price,
        address,
        payment: payment ?? { method: "cash" },
    });
    res.status(201).json(booking);
}
export async function listMyBookings(req, res) {
    const userId = req.userId;
    const role = req.userRole;
    const filter = role === "provider" ? { providerId: userId } : { userId };
    const bookings = await BookingModel.find(filter).sort({ createdAt: -1 });
    res.json(bookings);
}
export async function getBooking(req, res) {
    const booking = await BookingModel.findById(req.params.id);
    if (!booking)
        return res.status(404).json({ message: "not_found" });
    res.json(booking);
}
export async function updateBookingStatus(req, res) {
    const userId = req.userId;
    const role = req.userRole;
    const { id } = req.params;
    const { status } = req.body;
    const filter = role === "provider" ? { _id: id, providerId: userId } : { _id: id, userId };
    const booking = await BookingModel.findOneAndUpdate(filter, { status }, { new: true });
    if (!booking)
        return res.status(404).json({ message: "Not found" });
    res.json(booking);
}
