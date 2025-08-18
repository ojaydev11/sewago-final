import crypto from 'crypto';
import axios from 'axios';
import {
  PaymentGateway,
  PaymentInitiateRequest,
  PaymentInitiateResponse,
  PaymentVerificationRequest,
  PaymentVerificationResponse,
  EsewaVerificationRequest,
} from '../../types/payments.js';

export class EsewaGateway implements PaymentGateway {
  private merchantCode: string;
  private secretKey: string;
  private baseUrl: string;

  constructor() {
    this.merchantCode = process.env.ESEWA_MERCHANT_CODE || '';
    this.secretKey = process.env.ESEWA_SECRET || '';
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://esewa.com.np/epay/transrec'
      : 'https://esewa.com.np/epay/transrec'; // eSewa doesn't have sandbox
    
    if (!this.merchantCode || !this.secretKey) {
      console.warn('eSewa credentials not configured - payments will fail');
    }
  }

  async initiate(request: PaymentInitiateRequest): Promise<PaymentInitiateResponse> {
    try {
      const referenceId = `ESEWA_${Date.now()}_${request.bookingId}`;
      
      // eSewa payment form parameters
      const paymentData = {
        amt: request.amount,
        pcd: this.merchantCode,
        psc: 0, // service charge
        txAmt: 0, // tax amount
        tAmt: request.amount, // total amount
        pid: referenceId,
        scd: this.merchantCode,
        su: request.returnUrl || `${process.env.CLIENT_ORIGIN}/payment/success`,
        fu: request.failureUrl || `${process.env.CLIENT_ORIGIN}/payment/failed`,
      };

      // Build payment URL
      const params = new URLSearchParams(paymentData as any).toString();
      const paymentUrl = `https://esewa.com.np/epay/main?${params}`;

      return {
        success: true,
        paymentUrl,
        referenceId,
        gateway: 'esewa',
      };
    } catch (error) {
      console.error('eSewa initiate error:', error);
      throw new Error('Failed to initiate eSewa payment');
    }
  }

  async verify(request: PaymentVerificationRequest): Promise<PaymentVerificationResponse> {
    try {
      const esewaRequest = request as EsewaVerificationRequest;
      
      const verificationData = {
        amt: esewaRequest.amt,
        rid: esewaRequest.refId,
        pid: esewaRequest.oid,
        scd: this.merchantCode,
      };

      const response = await axios.post(this.baseUrl, verificationData, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      // eSewa returns XML response
      const isSuccess = response.data && response.data.includes('<response_code>Success</response_code>');
      
      return {
        success: true,
        verified: isSuccess,
        referenceId: request.referenceId,
        amount: parseFloat(esewaRequest.amt),
        gateway: 'esewa',
        transactionId: esewaRequest.refId,
      };
    } catch (error) {
      console.error('eSewa verification error:', error);
      return {
        success: false,
        verified: false,
        referenceId: request.referenceId,
        gateway: 'esewa',
      };
    }
  }

  private generateSignature(data: Record<string, any>): string {
    const sortedKeys = Object.keys(data).sort();
    const signatureString = sortedKeys.map(key => `${key}=${data[key]}`).join('&');
    return crypto.createHmac('sha256', this.secretKey).update(signatureString).digest('hex');
  }
}
