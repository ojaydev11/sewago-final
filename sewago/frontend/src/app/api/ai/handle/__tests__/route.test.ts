import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/ai/router', () => ({
  route: vi.fn()
}));

vi.mock('@/lib/ai/tools', () => ({
  bookService: vi.fn(),
  getQuote: vi.fn(),
  cancelBooking: vi.fn()
}));

vi.mock('@/lib/ai/rag', () => ({
  retrieve: vi.fn()
}));

vi.mock('@/lib/ai/guardrails', () => ({
  moderate: vi.fn(),
  ground: vi.fn(),
  formatAnswer: vi.fn(),
  checkAnswerQuality: vi.fn(),
  generateFallbackResponse: vi.fn()
}));

vi.mock('@/lib/ai/provider', () => ({
  generateAIResponse: vi.fn()
}));

vi.mock('@/lib/i18n', () => ({
  t: vi.fn((key: string) => key),
  tInterpolate: vi.fn((key: string, params: any) => `${key} ${JSON.stringify(params)}`)
}));

vi.mock('@/lib/mongodb', () => ({
  connectDB: vi.fn()
}));

vi.mock('@/models/Service', () => ({
  Service: {
    findById: vi.fn(),
    find: vi.fn()
    }
}));

// Import mocked functions
import { route } from '@/lib/ai/router';
import { bookService, getQuote, cancelBooking } from '@/lib/ai/tools';
import { retrieve } from '@/lib/ai/rag';
import { moderate, ground, formatAnswer, checkAnswerQuality, generateFallbackResponse } from '@/lib/ai/guardrails';
import { generateAIResponse } from '@/lib/ai/provider';
import { Service } from '@/models/Service';

describe('AI Handler API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    vi.mocked(moderate).mockResolvedValue({ allowed: true, flags: [] });
    vi.mocked(ground).mockResolvedValue({ passes: true, missing: [], confidence: 0.9 });
    vi.mocked(formatAnswer).mockImplementation((opts) => `${opts.answer} **Source:** ${opts.sources.map(s => s.label).join(', ')}`);
    vi.mocked(checkAnswerQuality).mockReturnValue({ passes: true, issues: [] });
    vi.mocked(Service.findById).mockResolvedValue({ _id: 'service-123', title: 'House Cleaning' } as any);
    vi.mocked(Service.find).mockResolvedValue([{ _id: 'service-123', title: 'House Cleaning' }] as any);
  });

  describe('POST /api/ai/handle', () => {
    it('should handle service booking successfully', async () => {
      // Mock routing result
      vi.mocked(route).mockResolvedValue({
        intent: 'book_service',
        confidence: 0.9,
        slots: {
          service: 'house cleaning',
          district: 'Kathmandu',
          date: 'tomorrow',
          time: '2:00 PM',
          locale: 'en'
        },
        needs: []
      });

      // Mock successful booking
      vi.mocked(bookService).mockResolvedValue({
        ok: true,
        data: { bookingId: 'bk-123', totalAmount: 1500 }
      });

      const request = new NextRequest('http://localhost:3000/api/ai/handle', {
        method: 'POST',
        body: JSON.stringify({
          text: 'Book house cleaning for tomorrow at 2 PM in Kathmandu',
          locale: 'en'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.intent).toBe('book_service');
      expect(data.slots.service).toBe('house cleaning');
      expect(data.toolResult.ok).toBe(true);
      expect(data.toolResult.data.bookingId).toBe('bk-123');
    });

    it('should handle price quote requests', async () => {
      // Mock routing result
      vi.mocked(route).mockResolvedValue({
        intent: 'price_quote',
        confidence: 0.8,
        slots: {
          service: 'electrical work',
          district: 'Lalitpur',
          locale: 'en'
        },
        needs: []
      });

      // Mock successful quote
      vi.mocked(getQuote).mockResolvedValue({
        ok: true,
        data: { minPrice: 800, maxPrice: 1200, estimatedPrice: 1000 }
      });

      const request = new NextRequest('http://localhost:3000/api/ai/handle', {
        method: 'POST',
        body: JSON.stringify({
          text: 'How much does electrical work cost in Lalitpur?',
          locale: 'en'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.intent).toBe('price_quote');
      expect(data.slots.service).toBe('electrical work');
      expect(data.toolResult.ok).toBe(true);
      expect(data.toolResult.data.estimatedPrice).toBe(1000);
    });

    it('should handle booking cancellation', async () => {
      // Mock routing result
      vi.mocked(route).mockResolvedValue({
        intent: 'cancel_booking',
        confidence: 0.9,
        slots: {
          bookingId: 'bk-456',
          locale: 'en'
        },
        needs: []
      });

      // Mock successful cancellation
      vi.mocked(cancelBooking).mockResolvedValue({
        ok: true,
        data: { refundAmount: 1500 }
      });

      const request = new NextRequest('http://localhost:3000/api/ai/handle', {
        method: 'POST',
        body: JSON.stringify({
          text: 'Cancel my booking bk-456',
          locale: 'en'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.intent).toBe('cancel_booking');
      expect(data.slots.bookingId).toBe('bk-456');
      expect(data.toolResult.ok).toBe(true);
      expect(data.toolResult.data.refundAmount).toBe(1500);
    });

    it('should handle information questions using RAG', async () => {
      // Mock routing result
      vi.mocked(route).mockResolvedValue({
        intent: 'service_info',
        confidence: 0.7,
        slots: { locale: 'en' },
        needs: []
      });

      // Mock RAG retrieval
      vi.mocked(retrieve).mockResolvedValue([
        {
          title: 'Cancellation Policy',
          section: '§2',
          text: 'Free cancellation up to 12 hours before start',
          relevance: 0.9
        }
      ]);

      // Mock AI response
      vi.mocked(generateAIResponse).mockResolvedValue({
        text: 'Free cancellation up to 12 hours before start',
        confidence: 0.9,
        tokens: 50,
        model: 'openai'
      });

      const request = new NextRequest('http://localhost:3000/api/ai/handle', {
        method: 'POST',
        body: JSON.stringify({
          text: 'What is your cancellation policy?',
          locale: 'en'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.intent).toBe('service_info');
      expect(data.sources).toHaveLength(1);
      expect(data.sources[0].label).toBe('Cancellation Policy');
    });

    it('should reject inappropriate content', async () => {
      // Mock moderation failure
      vi.mocked(moderate).mockResolvedValue({
        allowed: false,
        reason: 'Content contains inappropriate language',
        flags: ['toxic_language']
      });

      const request = new NextRequest('http://localhost:3000/api/ai/handle', {
        method: 'POST',
        body: JSON.stringify({
          text: 'Fuck you, this service is terrible',
          locale: 'en'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Content contains inappropriate language');
      expect(data.flags).toContain('toxic_language');
    });

    it('should ask for missing information when slots are incomplete', async () => {
      // Mock routing result with missing slots
      vi.mocked(route).mockResolvedValue({
        intent: 'book_service',
        confidence: 0.8,
        slots: {
          service: 'plumbing',
          locale: 'en'
        },
        needs: ['district', 'date', 'time']
      });

      const request = new NextRequest('http://localhost:3000/api/ai/handle', {
        method: 'POST',
        body: JSON.stringify({
          text: 'I need a plumber',
          locale: 'en'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.intent).toBe('book_service');
      expect(data.needs).toEqual(['district', 'date', 'time']);
      expect(data.answer).toContain('Please provide:');
    });

    it('should handle Nepali locale correctly', async () => {
      // Mock routing result
      vi.mocked(route).mockResolvedValue({
        intent: 'general_question',
        confidence: 0.7,
        slots: { locale: 'ne' },
        needs: []
      });

      const request = new NextRequest('http://localhost:3000/api/ai/handle', {
        method: 'POST',
        body: JSON.stringify({
          text: 'म तपाईंको सेवा कसरी प्रयोग गर्न सक्छु?',
          locale: 'ne'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.slots.locale).toBe('ne');
    });

    it('should handle database errors gracefully', async () => {
      // Mock routing result
      vi.mocked(route).mockResolvedValue({
        intent: 'book_service',
        confidence: 0.9,
        slots: {
          service: 'house cleaning',
          district: 'Kathmandu',
          date: 'tomorrow',
          time: '2:00 PM',
          locale: 'en'
        },
        needs: []
      });

      // Mock database error
      vi.mocked(bookService).mockResolvedValue({
        ok: false,
        error: 'Database connection failed'
      });

      const request = new NextRequest('http://localhost:3000/api/ai/handle', {
        method: 'POST',
        body: JSON.stringify({
          text: 'Book house cleaning for tomorrow at 2 PM in Kathmandu',
          locale: 'en'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.answer).toContain('Database connection failed');
    });
  });
});
