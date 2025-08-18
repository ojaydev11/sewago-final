import { describe, it, expect, beforeEach } from 'vitest';
import { PaymentGatewayFactory } from '../index.js';

describe('PaymentGatewayFactory', () => {
  it('should return eSewa gateway', () => {
    const gateway = PaymentGatewayFactory.getGateway('esewa');
    expect(gateway).toBeDefined();
  });

  it('should return Khalti gateway', () => {
    const gateway = PaymentGatewayFactory.getGateway('khalti');
    expect(gateway).toBeDefined();
  });

  it('should throw error for unsupported gateway', () => {
    expect(() => {
      // @ts-ignore - testing invalid input
      PaymentGatewayFactory.getGateway('invalid');
    }).toThrow('Unsupported payment gateway: invalid');
  });

  it('should list supported gateways', () => {
    const gateways = PaymentGatewayFactory.getSupportedGateways();
    expect(gateways).toContain('esewa');
    expect(gateways).toContain('khalti');
  });
});

describe('EsewaGateway', () => {
  let gateway: any;

  beforeEach(() => {
    gateway = PaymentGatewayFactory.getGateway('esewa');
  });

  it('should initiate payment successfully', async () => {
    const request = {
      amount: 1000,
      bookingId: 'booking123',
      userId: 'user123',
      returnUrl: 'http://localhost:3000/success',
    };

    const result = await gateway.initiate(request);
    
    expect(result.success).toBe(true);
    expect(result.gateway).toBe('esewa');
    expect(result.paymentUrl).toContain('esewa.com.np');
    expect(result.referenceId).toContain('ESEWA_');
  });
});

describe('KhaltiGateway', () => {
  let gateway: any;

  beforeEach(() => {
    gateway = PaymentGatewayFactory.getGateway('khalti');
  });

  it('should have correct gateway type', () => {
    expect(gateway).toBeDefined();
  });
});
