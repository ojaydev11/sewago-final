import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  createPaymentIntent, 
  verifyPayment, 
  getAvailablePaymentMethods, 
  isPaymentMethodAvailable,
  getPaymentStatusColor,
  getPaymentStatusText
} from './payments';

// Mock environment variables
vi.mock('./payments', async () => {
  const actual = await vi.importActual('./payments');
  return {
    ...actual,
    isTestMode: true,
  };
});

describe('Payment Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment for each test
    process.env.NEXT_PUBLIC_ESEWA_ENABLED = 'true';
    process.env.NEXT_PUBLIC_KHALTI_ENABLED = 'true';
    process.env.NEXT_PUBLIC_CARD_PAYMENTS_ENABLED = 'true';
  });

  describe('createPaymentIntent', () => {
    it('should create a mock payment intent in test mode', async () => {
      const paymentIntent = await createPaymentIntent('booking123', 1000, 'NPR', 'esewa');
      
      expect(paymentIntent).toMatchObject({
        id: expect.stringMatching(/^pi_mock_\d+$/),
        amount: 1000,
        currency: 'NPR',
        status: 'pending',
        paymentMethod: 'esewa',
      });
      
      expect(paymentIntent.createdAt).toBeInstanceOf(Date);
      expect(paymentIntent.expiresAt).toBeInstanceOf(Date);
      expect(paymentIntent.expiresAt.getTime()).toBeGreaterThan(paymentIntent.createdAt.getTime());
    });

    it('should handle different payment methods', async () => {
      const esewaIntent = await createPaymentIntent('booking123', 1000, 'NPR', 'esewa');
      const khaltiIntent = await createPaymentIntent('booking123', 1000, 'NPR', 'khalti');
      const cardIntent = await createPaymentIntent('booking123', 1000, 'NPR', 'card');
      
      expect(esewaIntent.paymentMethod).toBe('esewa');
      expect(khaltiIntent.paymentMethod).toBe('khalti');
      expect(cardIntent.paymentMethod).toBe('card');
    });
  });

  describe('verifyPayment', () => {
    it('should verify payment successfully most of the time', async () => {
      const verification = await verifyPayment('pi_mock_123');
      
      expect(verification.success).toBe(true);
      expect(verification.transactionId).toMatch(/^TXN_\d+$/);
      expect(verification.amount).toBe(1000);
      expect(verification.status).toBe('succeeded');
    });

    it('should handle verification with existing transaction ID', async () => {
      const verification = await verifyPayment('pi_mock_123', 'existing_txn_456');
      
      expect(verification.success).toBe(true);
      expect(verification.transactionId).toBe('existing_txn_456');
    });
  });

  describe('getAvailablePaymentMethods', () => {
    it('should return enabled payment methods', () => {
      const methods = getAvailablePaymentMethods();
      
      expect(methods).toHaveLength(3);
      expect(methods.find(m => m.id === 'esewa')?.enabled).toBe(true);
      expect(methods.find(m => m.id === 'khalti')?.enabled).toBe(true);
      expect(methods.find(m => m.id === 'card')?.enabled).toBe(true);
    });

    it('should filter out disabled payment methods', () => {
      process.env.NEXT_PUBLIC_ESEWA_ENABLED = 'false';
      process.env.NEXT_PUBLIC_KHALTI_ENABLED = 'false';
      
      const methods = getAvailablePaymentMethods();
      
      expect(methods).toHaveLength(1);
      expect(methods[0].id).toBe('card');
    });
  });

  describe('isPaymentMethodAvailable', () => {
    it('should return true for available methods', () => {
      expect(isPaymentMethodAvailable('esewa')).toBe(true);
      expect(isPaymentMethodAvailable('khalti')).toBe(true);
      expect(isPaymentMethodAvailable('card')).toBe(true);
    });

    it('should return false for unavailable methods', () => {
      expect(isPaymentMethodAvailable('invalid_method')).toBe(false);
    });

    it('should respect environment configuration', () => {
      process.env.NEXT_PUBLIC_ESEWA_ENABLED = 'false';
      
      expect(isPaymentMethodAvailable('esewa')).toBe(false);
      expect(isPaymentMethodAvailable('khalti')).toBe(true);
    });
  });

  describe('getPaymentStatusColor', () => {
    it('should return correct colors for each status', () => {
      expect(getPaymentStatusColor('pending')).toBe('text-yellow-600 bg-yellow-100');
      expect(getPaymentStatusColor('processing')).toBe('text-blue-600 bg-blue-100');
      expect(getPaymentStatusColor('succeeded')).toBe('text-green-600 bg-green-100');
      expect(getPaymentStatusColor('failed')).toBe('text-red-600 bg-red-100');
    });

    it('should return default color for unknown status', () => {
      expect(getPaymentStatusColor('unknown')).toBe('text-yellow-600 bg-yellow-100');
    });
  });

  describe('getPaymentStatusText', () => {
    it('should return correct text for each status', () => {
      expect(getPaymentStatusText('pending')).toBe('Pending');
      expect(getPaymentStatusText('processing')).toBe('Processing');
      expect(getPaymentStatusText('succeeded')).toBe('Succeeded');
      expect(getPaymentStatusText('failed')).toBe('Failed');
    });

    it('should return default text for unknown status', () => {
      expect(getPaymentStatusText('unknown')).toBe('Pending');
    });
  });
});
