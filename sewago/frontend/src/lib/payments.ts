export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed';
  clientSecret?: string;
  paymentMethod?: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface PaymentVerification {
  success: boolean;
  transactionId?: string;
  amount?: number;
  status?: string;
  error?: string;
}

export interface PaymentMethod {
  id: string;
  type: 'esewa' | 'khalti' | 'card';
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
}

// Payment methods configuration
export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'esewa',
    type: 'esewa',
    name: 'eSewa',
    description: 'Pay with eSewa wallet',
    icon: '💳',
    enabled: process.env.NEXT_PUBLIC_ESEWA_ENABLED === 'true',
  },
  {
    id: 'khalti',
    type: 'khalti',
    name: 'Khalti',
    description: 'Pay with Khalti digital wallet',
    icon: '💳',
    enabled: process.env.NEXT_PUBLIC_KHALTI_ENABLED === 'true',
  },
  {
    id: 'card',
    type: 'card',
    name: 'Credit/Debit Card',
    description: 'Pay with any major credit or debit card',
    icon: '💳',
    enabled: process.env.NEXT_PUBLIC_CARD_PAYMENTS_ENABLED === 'true',
  },
];

// Test mode configuration
export const isTestMode = process.env.NEXT_PUBLIC_PAYMENT_TEST_MODE === 'true';

/**
 * Create a payment intent for a booking
 */
export async function createPaymentIntent(
  bookingId: string,
  amount: number,
  currency: string = 'NPR',
  paymentMethod: string = 'esewa'
): Promise<PaymentIntent> {
  try {
    // In test mode, return a mock payment intent
    if (isTestMode) {
      return createMockPaymentIntent(amount, currency, paymentMethod);
    }

    // Real payment integration would go here
    const response = await fetch('/api/payments/create-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bookingId,
        amount,
        currency,
        paymentMethod,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create payment intent');
    }

    const data = await response.json();
    return data.paymentIntent;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    
    // Fallback to mock payment intent in case of error
    if (isTestMode) {
      return createMockPaymentIntent(amount, currency, paymentMethod);
    }
    
    throw error;
  }
}

/**
 * Verify a payment after completion
 */
export async function verifyPayment(
  paymentIntentId: string,
  transactionId?: string
): Promise<PaymentVerification> {
  try {
    // In test mode, return a mock verification
    if (isTestMode) {
      return createMockPaymentVerification(paymentIntentId, transactionId);
    }

    // Real payment verification would go here
    const response = await fetch('/api/payments/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentIntentId,
        transactionId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to verify payment');
    }

    const data = await response.json();
    return data.verification;
  } catch (error) {
    console.error('Error verifying payment:', error);
    
    // Fallback to mock verification in case of error
    if (isTestMode) {
      return createMockPaymentVerification(paymentIntentId, transactionId);
    }
    
    throw error;
  }
}

/**
 * Process eSewa payment
 */
export async function processEsewaPayment(
  paymentIntentId: string,
  esewaToken: string
): Promise<PaymentVerification> {
  try {
    if (isTestMode) {
      // Simulate eSewa payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      return {
        success: true,
        transactionId: `ESEWA_${Date.now()}`,
        amount: 1000, // Mock amount
        status: 'succeeded',
      };
    }

    // Real eSewa integration would go here
    const response = await fetch('/api/payments/esewa/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentIntentId,
        esewaToken,
      }),
    });

    if (!response.ok) {
      throw new Error('eSewa payment failed');
    }

    const data = await response.json();
    return data.verification;
  } catch (error) {
    console.error('Error processing eSewa payment:', error);
    throw error;
  }
}

/**
 * Process Khalti payment
 */
export async function processKhaltiPayment(
  paymentIntentId: string,
  khaltiToken: string
): Promise<PaymentVerification> {
  try {
    if (isTestMode) {
      // Simulate Khalti payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      return {
        success: true,
        transactionId: `KHALTI_${Date.now()}`,
        amount: 1000, // Mock amount
        status: 'succeeded',
      };
    }

    // Real Khalti integration would go here
    const response = await fetch('/api/payments/khalti/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentIntentId,
        khaltiToken,
      }),
    });

    if (!response.ok) {
      throw new Error('Khalti payment failed');
    }

    const data = await response.json();
    return data.verification;
  } catch (error) {
    console.error('Error processing Khalti payment:', error);
    throw error;
  }
}

/**
 * Get available payment methods
 */
export function getAvailablePaymentMethods(): PaymentMethod[] {
  return PAYMENT_METHODS.filter(method => method.enabled);
}

/**
 * Check if a payment method is available
 */
export function isPaymentMethodAvailable(paymentMethodId: string): boolean {
  const method = PAYMENT_METHODS.find(m => m.id === paymentMethodId);
  return method?.enabled || false;
}

// Mock payment functions for test mode
function createMockPaymentIntent(
  amount: number,
  currency: string,
  paymentMethod: string
): PaymentIntent {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes from now

  return {
    id: `pi_mock_${Date.now()}`,
    amount,
    currency,
    status: 'pending',
    clientSecret: `pi_mock_${Date.now()}_secret`,
    paymentMethod,
    createdAt: now,
    expiresAt,
  };
}

function createMockPaymentVerification(
  paymentIntentId: string,
  transactionId?: string
): PaymentVerification {
  // Simulate 90% success rate in test mode
  const isSuccess = Math.random() > 0.1;
  
  if (isSuccess) {
    return {
      success: true,
      transactionId: transactionId || `TXN_${Date.now()}`,
      amount: 1000, // Mock amount
      status: 'succeeded',
    };
  } else {
    return {
      success: false,
      error: 'Payment failed in test mode',
    };
  }
}

// Payment status utilities
export function getPaymentStatusColor(status: string): string {
  const statusColors = {
    pending: 'text-yellow-600 bg-yellow-100',
    processing: 'text-blue-600 bg-blue-100',
    succeeded: 'text-green-600 bg-green-100',
    failed: 'text-red-600 bg-red-100',
  };
  
  return statusColors[status as keyof typeof statusColors] || statusColors.pending;
}

export function getPaymentStatusText(status: string): string {
  const statusTexts = {
    pending: 'Pending',
    processing: 'Processing',
    succeeded: 'Succeeded',
    failed: 'Failed',
  };
  
  return statusTexts[status as keyof typeof statusTexts] || statusTexts.pending;
}
