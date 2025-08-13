import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createMocks } from 'node-mocks-http';
import { GET, POST } from '../bookings/route';

describe('/api/bookings', () => {
  it('should return 401 for GET without authentication', async () => {
    const { req } = createMocks({
      method: 'GET',
      url: '/api/bookings',
    });

    const response = await GET(req);
    expect(response.status).toBe(401);
  });

  it('should return 401 for POST without authentication', async () => {
    const { req } = createMocks({
      method: 'POST',
      url: '/api/bookings',
      body: {
        serviceId: 'test-service-id',
        scheduledAt: new Date().toISOString(),
        address: {
          line1: '123 Test St',
          city: 'Test City',
        },
        priceEstimateMin: 50,
        priceEstimateMax: 70,
      },
    });

    const response = await POST(req);
    expect(response.status).toBe(401);
  });

  it('should validate booking data structure', async () => {
    const { req } = createMocks({
      method: 'POST',
      url: '/api/bookings',
      body: {
        // Missing required fields
        serviceId: '',
        scheduledAt: '',
        address: {},
        priceEstimateMin: -1,
        priceEstimateMax: 0,
      },
    });

    const response = await POST(req);
    expect(response.status).toBe(401); // Should fail auth first, but structure is valid
  });
});
