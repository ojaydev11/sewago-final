/**
 * Mock Khalti Payment Verification Script
 * Simulates Khalti payment callbacks for E2E testing
 */

import crypto from 'crypto';
import fetch from 'node-fetch';

interface MockKhaltiPayment {
  pidx: string; // payment identifier
  total_amount: number;
  transaction_id: string;
  status: 'Completed' | 'Pending' | 'Canceled' | 'Failed';
  purchase_order_id: string; // booking ID
  purchase_order_name: string;
}

export class MockKhaltiService {
  private baseUrl: string;
  private secretKey: string;

  constructor(baseUrl = 'http://localhost:4102') {
    this.baseUrl = baseUrl;
    this.secretKey = 'test_secret_key_mock_e2e'; // Mock secret for testing
  }

  /**
   * Generate mock Khalti payment signature
   */
  private generateSignature(payload: string): string {
    return crypto.createHmac('sha256', this.secretKey).update(payload).digest('hex');
  }

  /**
   * Create successful payment callback
   */
  async createSuccessCallback(bookingId: string, amount: number): Promise<any> {
    const payment: MockKhaltiPayment = {
      pidx: `khalti_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      total_amount: amount * 100, // Khalti uses paisa (amount * 100)
      transaction_id: `KTM${Date.now()}`,
      status: 'Completed',
      purchase_order_id: bookingId,
      purchase_order_name: 'SewaGo Service Booking'
    };

    const payload = JSON.stringify(payment);
    const signature = this.generateSignature(payload);

    const requestBody = {
      ...payment,
      signature,
      merchant_code: 'KHALTI_TEST'
    };

    console.log('📤 Sending successful Khalti callback:', requestBody);

    try {
      const response = await fetch(`${this.baseUrl}/api/payments/khalti/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Mock-Payment': 'true',
          'Authorization': `Key ${this.secretKey}`
        },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();
      console.log('✅ Khalti success callback response:', result);
      return result;
    } catch (error) {
      console.error('❌ Khalti callback failed:', error);
      throw error;
    }
  }

  /**
   * Create failed payment callback
   */
  async createFailureCallback(bookingId: string, amount: number): Promise<any> {
    const payment: MockKhaltiPayment = {
      pidx: `khalti_fail_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      total_amount: amount * 100,
      transaction_id: `FAIL${Date.now()}`,
      status: 'Failed',
      purchase_order_id: bookingId,
      purchase_order_name: 'SewaGo Service Booking - Failed'
    };

    const payload = JSON.stringify(payment);
    const requestBody = {
      ...payment,
      signature: 'invalid_signature_for_failure',
      merchant_code: 'KHALTI_TEST',
      error: 'Payment failed due to insufficient funds'
    };

    console.log('📤 Sending failed Khalti callback:', requestBody);

    try {
      const response = await fetch(`${this.baseUrl}/api/payments/khalti/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Mock-Payment': 'true',
          'Authorization': `Key ${this.secretKey}`
        },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();
      console.log('❌ Khalti failure callback response:', result);
      return result;
    } catch (error) {
      console.error('❌ Khalti failure callback error:', error);
      throw error;
    }
  }

  /**
   * Create pending payment callback
   */
  async createPendingCallback(bookingId: string, amount: number): Promise<any> {
    const payment: MockKhaltiPayment = {
      pidx: `khalti_pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      total_amount: amount * 100,
      transaction_id: `PEND${Date.now()}`,
      status: 'Pending',
      purchase_order_id: bookingId,
      purchase_order_name: 'SewaGo Service Booking - Pending'
    };

    const payload = JSON.stringify(payment);
    const signature = this.generateSignature(payload);

    const requestBody = {
      ...payment,
      signature,
      merchant_code: 'KHALTI_TEST'
    };

    console.log('📤 Sending pending Khalti callback:', requestBody);

    try {
      const response = await fetch(`${this.baseUrl}/api/payments/khalti/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Mock-Payment': 'true',
          'Authorization': `Key ${this.secretKey}`
        },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();
      console.log('⏳ Khalti pending callback response:', result);
      return result;
    } catch (error) {
      console.error('❌ Khalti pending callback error:', error);
      throw error;
    }
  }

  /**
   * Test all scenarios
   */
  async runTests(bookingId: string, amount: number) {
    console.log('\n🧪 Running Khalti Payment Tests...');
    
    try {
      // Test success scenario
      console.log('\n1️⃣ Testing Success Scenario...');
      await this.createSuccessCallback(bookingId, amount);
      
      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Test failure scenario
      console.log('\n2️⃣ Testing Failure Scenario...');
      await this.createFailureCallback(bookingId, amount);
      
      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Test pending scenario
      console.log('\n3️⃣ Testing Pending Scenario...');
      await this.createPendingCallback(bookingId, amount);
      
      console.log('\n✅ Khalti tests completed');
    } catch (error) {
      console.error('\n❌ Khalti tests failed:', error);
      throw error;
    }
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const bookingId = args[0] || 'test_booking_123';
  const amount = parseInt(args[1]) || 2500;
  const scenario = args[2] || 'all'; // success, failure, pending, or all

  const khalti = new MockKhaltiService();

  (async () => {
    try {
      if (scenario === 'success') {
        await khalti.createSuccessCallback(bookingId, amount);
      } else if (scenario === 'failure') {
        await khalti.createFailureCallback(bookingId, amount);
      } else if (scenario === 'pending') {
        await khalti.createPendingCallback(bookingId, amount);
      } else {
        await khalti.runTests(bookingId, amount);
      }
    } catch (error) {
      console.error('Mock Khalti test failed:', error);
      process.exit(1);
    }
  })();
}

export default MockKhaltiService;