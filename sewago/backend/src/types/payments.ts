export interface PaymentInitiateRequest {
  amount: number;
  bookingId: string;
  userId: string;
  returnUrl?: string;
  failureUrl?: string;
}

export interface PaymentInitiateResponse {
  success: boolean;
  paymentUrl: string;
  referenceId: string;
  gateway: 'esewa' | 'khalti';
}

export interface PaymentVerificationRequest {
  referenceId: string;
  gateway: 'esewa' | 'khalti';
  // Gateway-specific fields
  [key: string]: any;
}

export interface PaymentVerificationResponse {
  success: boolean;
  verified: boolean;
  referenceId: string;
  amount?: number;
  gateway: 'esewa' | 'khalti';
  transactionId?: string;
}

export interface PaymentGateway {
  initiate(request: PaymentInitiateRequest): Promise<PaymentInitiateResponse>;
  verify(request: PaymentVerificationRequest): Promise<PaymentVerificationResponse>;
}

export interface EsewaVerificationRequest extends PaymentVerificationRequest {
  oid: string;
  amt: string;
  refId: string;
}

export interface KhaltiVerificationRequest extends PaymentVerificationRequest {
  pidx: string;
}
