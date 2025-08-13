import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createMocks } from 'node-mocks-http';
import { GET } from '../services/route';

describe('/api/services', () => {
  it('should return services list in mock mode', async () => {
    const { req } = createMocks({
      method: 'GET',
      url: '/api/services',
    });

    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    
    // Check service structure
    const service = data[0];
    expect(service).toHaveProperty('_id');
    expect(service).toHaveProperty('name');
    expect(service).toHaveProperty('slug');
    expect(service).toHaveProperty('description');
    expect(service).toHaveProperty('basePrice');
    expect(service).toHaveProperty('category');
  });

  it('should filter services by category', async () => {
    const { req } = createMocks({
      method: 'GET',
      url: '/api/services?category=cleaning',
    });

    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    
    // All services should be cleaning category
    data.forEach((service: any) => {
      expect(service.category).toBe('cleaning');
    });
  });
});
