import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '../smart-notifications/route';

// Mock Prisma client
const mockPrisma = {
  notificationPreference: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  notificationDelivery: {
    findMany: vi.fn(),
    create: vi.fn(),
    updateMany: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
  },
};

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

describe('/api/ai/smart-notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/ai/smart-notifications', () => {
    it('should return optimized notifications for user', async () => {
      const url = new URL('http://localhost:3000/api/ai/smart-notifications?userId=user123');
      const request = new NextRequest(url);

      // Mock user preferences
      mockPrisma.notificationPreference.findUnique.mockResolvedValue({
        userId: 'user123',
        emailEnabled: true,
        pushEnabled: true,
        smsEnabled: false,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
        timezone: 'Asia/Kathmandu',
        frequency: 'IMMEDIATE',
      });

      // Mock notification history
      mockPrisma.notificationDelivery.findMany.mockResolvedValue([
        {
          id: '1',
          userId: 'user123',
          title: 'Booking Confirmed',
          channel: 'EMAIL',
          status: 'DELIVERED',
          deliveredAt: new Date(),
          openedAt: new Date(),
          clickedAt: new Date(),
        },
      ]);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('optimizedTiming');
      expect(data).toHaveProperty('recommendedChannels');
      expect(data).toHaveProperty('userBehaviorAnalysis');
      expect(data).toHaveProperty('notifications');
      expect(Array.isArray(data.notifications)).toBe(true);
    });

    it('should handle missing userId parameter', async () => {
      const url = new URL('http://localhost:3000/api/ai/smart-notifications');
      const request = new NextRequest(url);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('userId is required');
    });

    it('should create default preferences for new user', async () => {
      const url = new URL('http://localhost:3000/api/ai/smart-notifications?userId=newuser123');
      const request = new NextRequest(url);

      // Mock no existing preferences
      mockPrisma.notificationPreference.findUnique.mockResolvedValue(null);
      mockPrisma.notificationDelivery.findMany.mockResolvedValue([]);

      // Mock user exists
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'newuser123',
        email: 'test@example.com',
      });

      // Mock preference creation
      mockPrisma.notificationPreference.create.mockResolvedValue({
        userId: 'newuser123',
        emailEnabled: true,
        pushEnabled: true,
        smsEnabled: true,
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockPrisma.notificationPreference.create).toHaveBeenCalled();
    });
  });

  describe('POST /api/ai/smart-notifications', () => {
    it('should send optimized notification', async () => {
      const request = new NextRequest('http://localhost:3000/api/ai/smart-notifications', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user123',
          title: 'Service Reminder',
          message: 'Your booking is tomorrow',
          type: 'BOOKING_REMINDER',
          priority: 'HIGH',
        }),
      });

      // Mock user preferences
      mockPrisma.notificationPreference.findUnique.mockResolvedValue({
        userId: 'user123',
        emailEnabled: true,
        pushEnabled: true,
        smsEnabled: false,
      });

      // Mock notification creation
      mockPrisma.notificationDelivery.create.mockResolvedValue({
        id: '1',
        userId: 'user123',
        title: 'Service Reminder',
        message: 'Your booking is tomorrow',
        type: 'BOOKING_REMINDER',
        priority: 'HIGH',
        channel: 'PUSH',
        status: 'PENDING',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data).toHaveProperty('deliveryId');
      expect(data).toHaveProperty('optimizedChannel');
      expect(data).toHaveProperty('estimatedDeliveryTime');
    });

    it('should handle invalid request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/ai/smart-notifications', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('userId, title, and message are required');
    });

    it('should respect quiet hours', async () => {
      const request = new NextRequest('http://localhost:3000/api/ai/smart-notifications', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user123',
          title: 'Non-urgent update',
          message: 'Your service provider updated their profile',
          type: 'GENERAL_UPDATE',
          priority: 'LOW',
        }),
      });

      // Mock user preferences with quiet hours
      mockPrisma.notificationPreference.findUnique.mockResolvedValue({
        userId: 'user123',
        emailEnabled: true,
        pushEnabled: true,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
        timezone: 'Asia/Kathmandu',
      });

      // Mock current time during quiet hours (simulate 11 PM)
      const mockDate = new Date();
      mockDate.setHours(23, 0, 0, 0);
      vi.useFakeTimers();
      vi.setSystemTime(mockDate);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.scheduledFor).toBeDefined(); // Should be scheduled for later

      vi.useRealTimers();
    });
  });
});