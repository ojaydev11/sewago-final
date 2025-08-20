import { PaymentGateway } from '../../types/payments.js';
import { EsewaGateway } from './esewa.js';
import { KhaltiGateway } from './khalti.js';

export class PaymentGatewayFactory {
  private static gateways: Record<string, PaymentGateway> = {
    esewa: new EsewaGateway(),
    khalti: new KhaltiGateway(),
  };

  static getGateway(gatewayType: 'esewa' | 'khalti'): PaymentGateway {
    const gateway = this.gateways[gatewayType];
    if (!gateway) {
      throw new Error(`Unsupported payment gateway: ${gatewayType}`);
    }
    return gateway;
  }

  static getSupportedGateways(): string[] {
    return Object.keys(this.gateways);
  }
}

// Re-export types and gateways for convenience
export * from '../../types/payments.js';
export { EsewaGateway } from './esewa.js';
export { KhaltiGateway } from './khalti.js';
