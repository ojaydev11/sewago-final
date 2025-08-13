
import crypto from 'crypto';
import { featureFlags } from './feature-flags';

export interface WebhookPayload {
  event: 'booking.created' | 'booking.accepted' | 'booking.in_progress' | 'booking.completed' | 'booking.cancelled' | 'dispute.resolved';
  timestamp: string;
  data: {
    bookingId: string;
    userId: string;
    serviceId: string;
    city: string;
    status: string;
    amount: number;
    metadata?: Record<string, any>;
  };
}

export interface WebhookEndpoint {
  id: string;
  url: string;
  secret: string;
  events: string[];
  active: boolean;
  retryConfig: {
    maxRetries: number;
    backoffMultiplier: number;
  };
}

export class WebhookService {
  private endpoints: WebhookEndpoint[] = [];
  private replayProtectionWindow = 5 * 60 * 1000; // 5 minutes
  private processedSignatures = new Set<string>();

  registerEndpoint(endpoint: Omit<WebhookEndpoint, 'id'>): WebhookEndpoint {
    const newEndpoint: WebhookEndpoint = {
      id: `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...endpoint
    };
    
    this.endpoints.push(newEndpoint);
    return newEndpoint;
  }

  async deliverWebhook(payload: WebhookPayload): Promise<void> {
    if (!featureFlags.WEBHOOKS_ENABLED) {
      console.log('Webhooks disabled, skipping delivery');
      return;
    }

    const relevantEndpoints = this.endpoints.filter(endpoint => 
      endpoint.active && endpoint.events.includes(payload.event)
    );

    const deliveryPromises = relevantEndpoints.map(endpoint => 
      this.deliverToEndpoint(endpoint, payload)
    );

    await Promise.allSettled(deliveryPromises);
  }

  private async deliverToEndpoint(
    endpoint: WebhookEndpoint, 
    payload: WebhookPayload,
    attempt: number = 1
  ): Promise<void> {
    try {
      const signature = this.generateSignature(payload, endpoint.secret);
      const timestamp = Date.now().toString();

      const response = await fetch(endpoint.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-SewaGo-Signature': signature,
          'X-SewaGo-Timestamp': timestamp,
          'User-Agent': 'SewaGo-Webhooks/1.0'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.log(`Webhook delivered successfully to ${endpoint.url}`);
    } catch (error) {
      console.error(`Webhook delivery failed to ${endpoint.url}:`, error);

      // Retry logic
      if (attempt < endpoint.retryConfig.maxRetries) {
        const delay = Math.pow(endpoint.retryConfig.backoffMultiplier, attempt) * 1000;
        
        setTimeout(() => {
          this.deliverToEndpoint(endpoint, payload, attempt + 1);
        }, delay);
      }
    }
  }

  generateSignature(payload: WebhookPayload, secret: string): string {
    const payloadString = JSON.stringify(payload);
    return crypto
      .createHmac('sha256', secret)
      .update(payloadString)
      .digest('hex');
  }

  verifySignature(
    payload: string, 
    signature: string, 
    secret: string, 
    timestamp: string
  ): boolean {
    // Replay protection
    const now = Date.now();
    const webhookTimestamp = parseInt(timestamp);
    
    if (now - webhookTimestamp > this.replayProtectionWindow) {
      return false;
    }

    // Check if we've already processed this signature
    const signatureKey = `${signature}_${timestamp}`;
    if (this.processedSignatures.has(signatureKey)) {
      return false;
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );

    if (isValid) {
      this.processedSignatures.add(signatureKey);
      
      // Clean up old signatures
      setTimeout(() => {
        this.processedSignatures.delete(signatureKey);
      }, this.replayProtectionWindow);
    }

    return isValid;
  }

  // Webhook events
  async onBookingCreated(bookingData: any) {
    await this.deliverWebhook({
      event: 'booking.created',
      timestamp: new Date().toISOString(),
      data: {
        bookingId: bookingData.id,
        userId: bookingData.userId,
        serviceId: bookingData.serviceId,
        city: bookingData.city,
        status: 'pending',
        amount: bookingData.totalAmount,
        metadata: {
          scheduledDate: bookingData.scheduledDate,
          address: bookingData.address
        }
      }
    });
  }

  async onBookingStatusChange(bookingData: any, newStatus: string) {
    const eventMap: Record<string, WebhookPayload['event']> = {
      'accepted': 'booking.accepted',
      'in_progress': 'booking.in_progress',
      'completed': 'booking.completed',
      'cancelled': 'booking.cancelled'
    };

    const event = eventMap[newStatus];
    if (!event) return;

    await this.deliverWebhook({
      event,
      timestamp: new Date().toISOString(),
      data: {
        bookingId: bookingData.id,
        userId: bookingData.userId,
        serviceId: bookingData.serviceId,
        city: bookingData.city,
        status: newStatus,
        amount: bookingData.totalAmount
      }
    });
  }
}

export const webhookService = new WebhookService();
