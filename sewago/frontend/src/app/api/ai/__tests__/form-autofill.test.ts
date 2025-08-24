import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '../form-autofill/route';

// Mock Prisma client
const mockPrisma = {
  formBehavior: {
    findMany: vi.fn(),
    create: vi.fn(),
  },
  formTemplate: {
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
  },
  booking: {
    findMany: vi.fn(),
  },
};

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

describe('/api/ai/form-autofill', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/ai/form-autofill', () => {
    it('should return suggestions for form field', async () => {
      const url = new URL('http://localhost:3000/api/ai/form-autofill?userId=user123&fieldName=address&formType=booking&context={"location":{"city":"Kathmandu"}}');
      const request = new NextRequest(url);

      // Mock user data
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+977-1234567890',
      });

      // Mock form behavior history
      mockPrisma.formBehavior.findMany.mockResolvedValue([
        {
          fieldName: 'address',
          value: '123 Durbar Marg, Kathmandu',
          formType: 'booking',
          successful: true,
          userId: 'user123',
        },
        {
          fieldName: 'address', 
          value: '456 Thamel, Kathmandu',
          formType: 'booking',
          successful: true,
          userId: 'user123',
        },
      ]);

      // Mock previous bookings for context
      mockPrisma.booking.findMany.mockResolvedValue([
        {
          id: '1',
          address: '789 Patan, Lalitpur',
          serviceType: 'CLEANING',
        },
      ]);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('suggestions');
      expect(data).toHaveProperty('confidence');
      expect(data).toHaveProperty('reasoning');
      expect(Array.isArray(data.suggestions)).toBe(true);
      expect(data.suggestions.length).toBeGreaterThan(0);
      expect(typeof data.confidence).toBe('number');
    });

    it('should handle phone number suggestions', async () => {
      const url = new URL('http://localhost:3000/api/ai/form-autofill?userId=user123&fieldName=phoneNumber&formType=booking');
      const request = new NextRequest(url);

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user123',
        phone: '+977-9841234567',
      });

      mockPrisma.formBehavior.findMany.mockResolvedValue([
        {
          fieldName: 'phoneNumber',
          value: '+977-9841234567',
          successful: true,
        },
      ]);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.suggestions).toContain('+977-9841234567');
      expect(data.confidence).toBeGreaterThan(0.8); // High confidence for user's own phone
    });

    it('should handle service type suggestions with context', async () => {
      const url = new URL('http://localhost:3000/api/ai/form-autofill?userId=user123&fieldName=serviceType&formType=booking&context={"previousService":"CLEANING","timeOfDay":"morning"}');
      const request = new NextRequest(url);

      mockPrisma.formBehavior.findMany.mockResolvedValue([
        {
          fieldName: 'serviceType',
          value: 'CLEANING',
          successful: true,
          metadata: { timeOfDay: 'morning' },
        },
      ]);

      mockPrisma.booking.findMany.mockResolvedValue([
        { serviceType: 'CLEANING', createdAt: new Date() },
        { serviceType: 'PLUMBING', createdAt: new Date() },
      ]);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.suggestions).toContain('CLEANING');
      expect(data.reasoning).toContain('previous');
    });

    it('should handle missing parameters', async () => {
      const url = new URL('http://localhost:3000/api/ai/form-autofill');
      const request = new NextRequest(url);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('userId, fieldName, and formType are required');
    });

    it('should handle bulk fill request', async () => {
      const url = new URL('http://localhost:3000/api/ai/form-autofill?userId=user123&fieldName=bulk&formType=booking&bulkFields=["name","email","phone","address"]');
      const request = new NextRequest(url);

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+977-9841234567',
      });

      mockPrisma.formBehavior.findMany.mockResolvedValue([
        {
          fieldName: 'address',
          value: '123 Durbar Marg, Kathmandu',
          successful: true,
        },
      ]);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('bulkSuggestions');
      expect(data.bulkSuggestions).toHaveProperty('name');
      expect(data.bulkSuggestions).toHaveProperty('email');
      expect(data.bulkSuggestions).toHaveProperty('phone');
      expect(data.bulkSuggestions).toHaveProperty('address');
    });
  });

  describe('POST /api/ai/form-autofill', () => {
    it('should record form field interaction', async () => {
      const request = new NextRequest('http://localhost:3000/api/ai/form-autofill', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user123',
          fieldName: 'address',
          value: '123 New Street, Kathmandu',
          formType: 'booking',
          successful: true,
          timeTaken: 2.5,
          suggestionUsed: false,
        }),
      });

      mockPrisma.formBehavior.create.mockResolvedValue({
        id: '1',
        userId: 'user123',
        fieldName: 'address',
        value: '123 New Street, Kathmandu',
        formType: 'booking',
        successful: true,
        timeTaken: 2.5,
        suggestionUsed: false,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockPrisma.formBehavior.create).toHaveBeenCalledWith({
        data: {
          userId: 'user123',
          fieldName: 'address',
          value: '123 New Street, Kathmandu',
          formType: 'booking',
          successful: true,
          timeTaken: 2.5,
          suggestionUsed: false,
          sessionId: undefined,
          metadata: undefined,
        },
      });
    });

    it('should create or update form template', async () => {
      const request = new NextRequest('http://localhost:3000/api/ai/form-autofill', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user123',
          action: 'save_template',
          templateName: 'My Home Address',
          formType: 'booking',
          fields: {
            address: '123 Home Street, Kathmandu',
            phone: '+977-9841234567',
            name: 'John Doe',
          },
        }),
      });

      mockPrisma.formTemplate.create.mockResolvedValue({
        id: '1',
        userId: 'user123',
        name: 'My Home Address',
        formType: 'booking',
        fields: {
          address: '123 Home Street, Kathmandu',
          phone: '+977-9841234567',
          name: 'John Doe',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data).toHaveProperty('templateId');
      expect(mockPrisma.formTemplate.create).toHaveBeenCalled();
    });

    it('should handle validation feedback', async () => {
      const request = new NextRequest('http://localhost:3000/api/ai/form-autofill', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user123',
          action: 'validation_feedback',
          fieldName: 'email',
          value: 'invalid-email',
          formType: 'booking',
          isValid: false,
          validationError: 'Invalid email format',
        }),
      });

      mockPrisma.formBehavior.create.mockResolvedValue({
        id: '1',
        userId: 'user123',
        fieldName: 'email',
        value: 'invalid-email',
        successful: false,
        metadata: { validationError: 'Invalid email format' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockPrisma.formBehavior.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          successful: false,
          metadata: expect.objectContaining({
            validationError: 'Invalid email format',
          }),
        }),
      });
    });

    it('should handle missing required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/ai/form-autofill', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('userId and action/fieldName are required');
    });
  });
});