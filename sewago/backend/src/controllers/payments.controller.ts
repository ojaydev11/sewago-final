import { Request, Response } from "express";
import { BookingModel } from '../models/Booking.js';
import { PaymentGatewayFactory } from '../services/payments/index.js';

export async function initiatePayment(req: Request, res: Response) {
  try {
    const { bookingId, gateway, returnUrl, failureUrl } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!bookingId || !gateway) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    if (!['esewa', 'khalti'].includes(gateway)) {
      return res.status(400).json({ success: false, message: 'Unsupported payment gateway' });
    }

    // Find the booking
    const booking = await BookingModel.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check if user owns the booking
    if (booking.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Check if payment is already completed
    if (booking.payment.status === 'paid') {
      return res.status(400).json({ success: false, message: 'Payment already completed' });
    }

    // Initiate payment with gateway
    const paymentGateway = PaymentGatewayFactory.getGateway(gateway);
    const result = await paymentGateway.initiate({
      amount: booking.price,
      bookingId: bookingId,
      userId: userId,
      returnUrl,
      failureUrl,
    });

    // Update booking with payment reference
    booking.payment.method = gateway;
    booking.payment.referenceId = result.referenceId;
    booking.payment.status = 'pending';
    await booking.save();

    res.json({
      success: true,
      paymentUrl: result.paymentUrl,
      referenceId: result.referenceId,
      gateway: result.gateway,
    });
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({ success: false, message: 'Payment initiation failed' });
  }
}

export async function verifyPayment(req: Request, res: Response) {
  try {
    const { referenceId, gateway, ...verificationData } = req.body;

    if (!referenceId || !gateway) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Find booking by payment reference
    const booking = await BookingModel.findOne({ 'payment.referenceId': referenceId });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Payment reference not found' });
    }

    // Check if payment is already verified
    if (booking.payment.status === 'paid') {
      return res.json({ success: true, verified: true, message: 'Payment already verified' });
    }

    // Verify payment with gateway
    const paymentGateway = PaymentGatewayFactory.getGateway(gateway);
    const result = await paymentGateway.verify({
      referenceId,
      gateway,
      ...verificationData,
    });

    if (result.success && result.verified) {
      // Update booking payment status
      booking.payment.status = 'paid';
      booking.status = 'accepted'; // Move booking to next stage
      await booking.save();

      res.json({
        success: true,
        verified: true,
        bookingId: booking._id,
        transactionId: result.transactionId,
      });
    } else {
      // Payment verification failed
      booking.payment.status = 'failed';
      await booking.save();

      res.json({
        success: true,
        verified: false,
        message: 'Payment verification failed',
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ success: false, message: 'Payment verification failed' });
  }
}

// Legacy endpoints for backward compatibility
export async function esewaInitiate(req: Request, res: Response) {
  req.body.gateway = 'esewa';
  return initiatePayment(req, res);
}

export async function khaltiInitiate(req: Request, res: Response) {
  req.body.gateway = 'khalti';
  return initiatePayment(req, res);
}


