import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '../search-predict/route';

// Mock Prisma client
const mockPrisma = {
  searchBehavior: {
    create: vi.fn(),
    findMany: vi.fn(),
  },
  smartSearchCache: {
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  service: {
    findMany: vi.fn(),
  },
};

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

describe('/api/ai/search-predict', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/ai/search-predict', () => {
    it('should return predictions for a valid query', async () => {
      const url = new URL('http://localhost:3000/api/ai/search-predict?q=house%20cleaning&userId=user123&location=Kathmandu');
      const request = new NextRequest(url);

      // Mock database responses
      mockPrisma.searchBehavior.findMany.mockResolvedValue([
        {
          query: 'house cleaning',
          resultClicked: true,
          completedBooking: true,
          userId: 'user123',
          createdAt: new Date(),
        },
      ]);

      mockPrisma.service.findMany.mockResolvedValue([
        {
          id: '1',
          title: 'Professional House Cleaning',
          category: 'CLEANING',
          averageRating: 4.8,
          _count: { bookings: 150 },
        },
      ]);

      mockPrisma.smartSearchCache.findFirst.mockResolvedValue(null);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('predictions');
      expect(data).toHaveProperty('corrections');
      expect(data).toHaveProperty('suggestions');
      expect(Array.isArray(data.predictions)).toBe(true);
    });

    it('should handle missing query parameter', async () => {
      const url = new URL('http://localhost:3000/api/ai/search-predict');
      const request = new NextRequest(url);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Query parameter is required');
    });

    it('should return cached results when available', async () => {
      const url = new URL('http://localhost:3000/api/ai/search-predict?q=plumbing&userId=user123');
      const request = new NextRequest(url);

      const cachedData = {
        predictions: ['plumbing repair', 'plumbing installation'],
        corrections: [],
        suggestions: ['plumber near me'],
      };

      mockPrisma.smartSearchCache.findFirst.mockResolvedValue({
        id: '1',
        cacheKey: 'search:plumbing:user123',
        data: cachedData,
        expiresAt: new Date(Date.now() + 300000), // 5 minutes from now
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(cachedData);
    });
  });

  describe('POST /api/ai/search-predict', () => {
    it('should create search behavior record', async () => {
      const request = new NextRequest('http://localhost:3000/api/ai/search-predict', {
        method: 'POST',
        body: JSON.stringify({
          query: 'electrician',
          userId: 'user123',
          resultClicked: true,
          clickedServiceId: 'service123',
          sessionId: 'session123',
        }),
      });

      mockPrisma.searchBehavior.create.mockResolvedValue({
        id: '1',
        query: 'electrician',
        userId: 'user123',
        resultClicked: true,
        clickedServiceId: 'service123',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockPrisma.searchBehavior.create).toHaveBeenCalledWith({
        data: {
          query: 'electrician',
          userId: 'user123',
          resultClicked: true,
          clickedServiceId: 'service123',
          sessionId: 'session123',
          location: undefined,
          deviceType: undefined,
          completedBooking: false,
        },
      });
    });

    it('should handle invalid request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/ai/search-predict', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Query and userId are required');
    });
  });
});