import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '../voice-process/route';

// Mock Prisma client
const mockPrisma = {
  voiceInteraction: {
    create: vi.fn(),
  },
  voiceCommand: {
    findMany: vi.fn(),
    create: vi.fn(),
  },
};

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

describe('/api/ai/voice-process', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/ai/voice-process', () => {
    it('should process voice command and return response', async () => {
      const request = new NextRequest('http://localhost:3000/api/ai/voice-process', {
        method: 'POST',
        body: JSON.stringify({
          transcript: 'book house cleaning for tomorrow',
          userId: 'user123',
          language: 'en',
          sessionId: 'session123',
        }),
      });

      // Mock voice interaction creation
      mockPrisma.voiceInteraction.create.mockResolvedValue({
        id: '1',
        userId: 'user123',
        transcript: 'book house cleaning for tomorrow',
        intent: 'BOOK_SERVICE',
        confidence: 0.92,
        language: 'en',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('intent');
      expect(data).toHaveProperty('confidence');
      expect(data).toHaveProperty('response');
      expect(data).toHaveProperty('entities');
      expect(data).toHaveProperty('actions');
      expect(data.intent).toBe('BOOK_SERVICE');
      expect(typeof data.confidence).toBe('number');
      expect(data.confidence).toBeGreaterThan(0);
      expect(data.confidence).toBeLessThanOrEqual(1);
    });

    it('should handle search intent', async () => {
      const request = new NextRequest('http://localhost:3000/api/ai/voice-process', {
        method: 'POST',
        body: JSON.stringify({
          transcript: 'find electricians near me',
          userId: 'user123',
          language: 'en',
        }),
      });

      mockPrisma.voiceInteraction.create.mockResolvedValue({
        id: '1',
        userId: 'user123',
        transcript: 'find electricians near me',
        intent: 'SEARCH_SERVICE',
        confidence: 0.88,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.intent).toBe('SEARCH_SERVICE');
      expect(data.entities).toHaveProperty('serviceType');
      expect(data.entities.serviceType).toBe('electrician');
      expect(data.actions).toContain('REDIRECT_TO_SEARCH');
    });

    it('should handle Nepali language input', async () => {
      const request = new NextRequest('http://localhost:3000/api/ai/voice-process', {
        method: 'POST',
        body: JSON.stringify({
          transcript: 'घर सफाई को लागि बुकिंग गर्नुहोस्',
          userId: 'user123',
          language: 'ne',
        }),
      });

      mockPrisma.voiceInteraction.create.mockResolvedValue({
        id: '1',
        userId: 'user123',
        transcript: 'घर सफाई को लागि बुकिंग गर्नुहोस्',
        intent: 'BOOK_SERVICE',
        confidence: 0.85,
        language: 'ne',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.intent).toBe('BOOK_SERVICE');
      expect(data.response).toContain('मैले'); // Should respond in Nepali
      expect(data.entities).toHaveProperty('serviceType');
    });

    it('should handle navigation commands', async () => {
      const request = new NextRequest('http://localhost:3000/api/ai/voice-process', {
        method: 'POST',
        body: JSON.stringify({
          transcript: 'show my bookings',
          userId: 'user123',
          language: 'en',
        }),
      });

      mockPrisma.voiceInteraction.create.mockResolvedValue({
        id: '1',
        userId: 'user123',
        transcript: 'show my bookings',
        intent: 'NAVIGATE',
        confidence: 0.95,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.intent).toBe('NAVIGATE');
      expect(data.entities).toHaveProperty('destination');
      expect(data.entities.destination).toBe('bookings');
      expect(data.actions).toContain('NAVIGATE_TO_BOOKINGS');
    });

    it('should handle low confidence commands', async () => {
      const request = new NextRequest('http://localhost:3000/api/ai/voice-process', {
        method: 'POST',
        body: JSON.stringify({
          transcript: 'mumblenoisesomething',
          userId: 'user123',
          language: 'en',
        }),
      });

      mockPrisma.voiceInteraction.create.mockResolvedValue({
        id: '1',
        userId: 'user123',
        transcript: 'mumblenoisesomething',
        intent: 'UNKNOWN',
        confidence: 0.12,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.intent).toBe('UNKNOWN');
      expect(data.confidence).toBeLessThan(0.5);
      expect(data.response).toContain('understand');
    });

    it('should handle missing transcript', async () => {
      const request = new NextRequest('http://localhost:3000/api/ai/voice-process', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user123',
          language: 'en',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Transcript and userId are required');
    });

    it('should store successful commands for learning', async () => {
      const request = new NextRequest('http://localhost:3000/api/ai/voice-process', {
        method: 'POST',
        body: JSON.stringify({
          transcript: 'cancel my booking for today',
          userId: 'user123',
          language: 'en',
        }),
      });

      mockPrisma.voiceInteraction.create.mockResolvedValue({
        id: '1',
        userId: 'user123',
        transcript: 'cancel my booking for today',
        intent: 'CANCEL_BOOKING',
        confidence: 0.91,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockPrisma.voiceInteraction.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user123',
          transcript: 'cancel my booking for today',
          intent: 'CANCEL_BOOKING',
          confidence: expect.any(Number),
          language: 'en',
          successful: true,
        }),
      });
    });

    it('should handle help requests', async () => {
      const request = new NextRequest('http://localhost:3000/api/ai/voice-process', {
        method: 'POST',
        body: JSON.stringify({
          transcript: 'what can you do',
          userId: 'user123',
          language: 'en',
        }),
      });

      mockPrisma.voiceInteraction.create.mockResolvedValue({
        id: '1',
        userId: 'user123',
        transcript: 'what can you do',
        intent: 'HELP',
        confidence: 0.89,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.intent).toBe('HELP');
      expect(data.response).toContain('can help');
      expect(data.actions).toContain('SHOW_HELP');
    });
  });
});