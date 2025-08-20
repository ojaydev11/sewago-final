/**
 * Mock eSewa Payment Verification Script
 * Simulates eSewa payment callbacks for E2E testing
 */

import crypto from 'crypto';
import fetch from 'node-fetch';

interface MockEsewaPayment {
  oid: string; // booking ID
  amt: string; // amount
  pdc: string; // product delivery charge
  psc: string; // product service charge
  txnid: string; // transaction ID
  refId: string; // reference ID
}

export class MockEsewaService {
  private baseUrl: string;
  private merchantCode: string;
  private secretKey: string;

  constructor(baseUrl = 'http://localhost:4102', merchantCode = 'EPAYTEST') {
    this.baseUrl = baseUrl;
    this.merchantCode = merchantCode;
    this.secretKey = 'test_secret_key_mock_e2e'; // Mock secret for testing
  }

  /**
   * Generate mock eSewa payment signature
   */
  private generateSignature(payment: MockEsewaPayment): string {
    // Mock signature generation for testing
    const message = `total_amount=${payment.amt},transaction_uuid=${payment.txnid},product_code=${this.merchantCode}`;
    return crypto.createHmac('sha256', this.secretKey).update(message).digest('base64');
  }

  /**
   * Create successful payment callback
   */
  async createSuccessCallback(bookingId: string, amount: number): Promise<any> {
    const payment: MockEsewaPayment = {
      oid: bookingId,
      amt: amount.toString(),
      pdc: '0',
      psc: '0',
      txnid: `esewa_test_${Date.now()}`,
      refId: `REF${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    };

    const signature = this.generateSignature(payment);

    const payload = {
      ...payment,
      signature,
      status: 'COMPLETE',
      merchant_code: this.merchantCode
    };

    console.log('📤 Sending successful eSewa callback:', payload);

    try {
      const response = await fetch(`${this.baseUrl}/api/payments/esewa/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Mock-Payment': 'true'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      console.log('✅ eSewa success callback response:', result);
      return result;
    } catch (error) {
      console.error('❌ eSewa callback failed:', error);
      throw error;
    }
  }

  /**
   * Create failed payment callback
   */
  async createFailureCallback(bookingId: string, amount: number): Promise<any> {
    const payment: MockEsewaPayment = {
      oid: bookingId,
      amt: amount.toString(),
      pdc: '0',
      psc: '0',
      txnid: `esewa_fail_${Date.now()}`,
      refId: `FAIL${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    };

    const payload = {
      ...payment,
      signature: 'invalid_signature', // Invalid signature for failure
      status: 'FAILED',
      merchant_code: this.merchantCode,
      error: 'Payment cancelled by user'
    };

    console.log('📤 Sending failed eSewa callback:', payload);

    try {
      const response = await fetch(`${this.baseUrl}/api/payments/esewa/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Mock-Payment': 'true'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      console.log('❌ eSewa failure callback response:', result);
      return result;
    } catch (error) {
      console.error('❌ eSewa failure callback error:', error);
      throw error;
    }
  }

  /**
   * Test both success and failure scenarios
   */
  async runTests(bookingId: string, amount: number) {
    console.log('\n🧪 Running eSewa Payment Tests...');
    
    try {
      // Test success scenario
      console.log('\n1️⃣ Testing Success Scenario...');
      await this.createSuccessCallback(bookingId, amount);
      
      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Test failure scenario
      console.log('\n2️⃣ Testing Failure Scenario...');
      await this.createFailureCallback(bookingId, amount);
      
      console.log('\n✅ eSewa tests completed');
    } catch (error) {
      console.error('\n❌ eSewa tests failed:', error);
      throw error;
    }
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const bookingId = args[0] || 'test_booking_123';
  const amount = parseInt(args[1]) || 2500;
  const scenario = args[2] || 'both'; // success, failure, or both

  const esewa = new MockEsewaService();

  (async () => {
    try {
      if (scenario === 'success') {
        await esewa.createSuccessCallback(bookingId, amount);
      } else if (scenario === 'failure') {
        await esewa.createFailureCallback(bookingId, amount);
      } else {
        await esewa.runTests(bookingId, amount);
      }
    } catch (error) {
      console.error('Mock eSewa test failed:', error);
      process.exit(1);
    }
  })();
}

export default MockEsewaService;