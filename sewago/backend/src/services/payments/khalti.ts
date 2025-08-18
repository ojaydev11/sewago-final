import axios from 'axios';
import {
  PaymentGateway,
  PaymentInitiateRequest,
  PaymentInitiateResponse,
  PaymentVerificationRequest,
  PaymentVerificationResponse,
  KhaltiVerificationRequest,
} from '../../types/payments.js';
import { KHALTI_KEY, env } from '../../config/env.js';

export class KhaltiGateway implements PaymentGateway {
  private secretKey: string;
  private baseUrl: string;

  constructor() {
    this.secretKey = KHALTI_KEY || '';
    this.baseUrl = env.nodeEnv === 'production' 
      ? 'https://a.khalti.com/api/v2/epayment'
      : 'https://a.khalti.com/api/v2/epayment'; // Khalti uses same URL for test/prod
    
    if (!this.secretKey) {
      console.warn('Khalti secret key not configured - payments will fail');
    }
  }

  async initiate(request: PaymentInitiateRequest): Promise<PaymentInitiateResponse> {
    try {
      const referenceId = `KHALTI_${Date.now()}_${request.bookingId}`;
      
      const paymentData = {
        return_url: request.returnUrl || `${env.clientOrigin}/payment/success`,
        website_url: env.clientOrigin,
        amount: request.amount * 100, // Khalti expects amount in paisa (1 NPR = 100 paisa)
        purchase_order_id: referenceId,
        purchase_order_name: `SewaGo Booking ${request.bookingId}`,
        customer_info: {
          name: "SewaGo User",
          email: "user@sewago.app",
          phone: "9800000000"
        }
      };

      const response = await axios.post(`${this.baseUrl}/initiate/`, paymentData, {
        headers: {
          'Authorization': `key ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      if (response.data && response.data.payment_url) {
        return {
          success: true,
          paymentUrl: response.data.payment_url,
          referenceId,
          gateway: 'khalti',
        };
      } else {
        throw new Error('Invalid response from Khalti API');
      }
    } catch (error) {
      console.error('Khalti initiate error:', error);
      throw new Error('Failed to initiate Khalti payment');
    }
  }

  async verify(request: PaymentVerificationRequest): Promise<PaymentVerificationResponse> {
    try {
      const khaltiRequest = request as KhaltiVerificationRequest;
      
      const verificationData = {
        pidx: khaltiRequest.pidx,
      };

      const response = await axios.post(`${this.baseUrl}/lookup/`, verificationData, {
        headers: {
          'Authorization': `key ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      if (response.data) {
        const isSuccess = response.data.status === 'Completed';
        
        return {
          success: true,
          verified: isSuccess,
          referenceId: request.referenceId,
          amount: response.data.total_amount ? response.data.total_amount / 100 : undefined, // Convert from paisa to NPR
          gateway: 'khalti',
          transactionId: response.data.transaction_id,
        };
      } else {
        return {
          success: false,
          verified: false,
          referenceId: request.referenceId,
          gateway: 'khalti',
        };
      }
    } catch (error) {
      console.error('Khalti verification error:', error);
      return {
        success: false,
        verified: false,
        referenceId: request.referenceId,
        gateway: 'khalti',
      };
    }
  }
}
