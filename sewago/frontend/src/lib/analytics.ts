<<<<<<< HEAD
=======
'use client';
import 'client-only';

import { performanceOptimizer } from './performance-ux';
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245

export interface AnalyticsEvent {
  id: string;
  userId?: string;
  sessionId: string;
  event: string;
  timestamp: Date;
  properties: Record<string, any>;
  context: {
    userAgent?: string;
    ip?: string;
    city?: string;
    source?: string;
  };
}

export interface KPIMetrics {
  period: 'daily' | 'weekly' | 'monthly';
  date: Date;
  metrics: {
    totalBookings: number;
    completedBookings: number;
    repeatCustomers: number;
    averageOrderValue: number;
    customerAcquisitionCost: number;
    netPromoterScore: number;
    slaBreaches: number;
    cityWiseFillRate: Record<string, number>;
    topServices: Array<{ service: string; bookings: number }>;
    revenueGrowth: number;
  };
}

export class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private kpiCache: Map<string, KPIMetrics> = new Map();

  // Event tracking
  track(event: Omit<AnalyticsEvent, 'id' | 'timestamp'>): void {
    const analyticsEvent: AnalyticsEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...event
    };

    this.events.push(analyticsEvent);
    
    // In production, send to analytics service
    this.sendToWarehouse(analyticsEvent);
  }

  // Booking analytics
  trackBookingCreated(userId: string, bookingData: any) {
    this.track({
      userId,
      sessionId: this.getSessionId(),
      event: 'booking_created',
      properties: {
        serviceId: bookingData.serviceId,
        city: bookingData.city,
        amount: bookingData.amount,
        paymentMethod: 'cod',
        isFirstBooking: bookingData.isFirstBooking
      },
      context: this.getContext()
    });
  }

  trackSearchPerformed(userId: string, searchQuery: string, resultsCount: number) {
    this.track({
      userId,
      sessionId: this.getSessionId(),
      event: 'search_performed',
      properties: {
        query: searchQuery,
        resultsCount,
        timestamp: new Date().toISOString()
      },
      context: this.getContext()
    });
  }

  trackPromoUsed(userId: string, promoCode: string, discountAmount: number) {
    this.track({
      userId,
      sessionId: this.getSessionId(),
      event: 'promo_used',
      properties: {
        promoCode,
        discountAmount,
        timestamp: new Date().toISOString()
      },
      context: this.getContext()
    });
  }

  // KPI calculation
  async calculateKPIs(period: 'daily' | 'weekly' | 'monthly', date?: Date): Promise<KPIMetrics> {
    const targetDate = date || new Date();
    const cacheKey = `${period}_${targetDate.toISOString().split('T')[0]}`;
    
    if (this.kpiCache.has(cacheKey)) {
      return this.kpiCache.get(cacheKey)!;
    }

    const kpis = await this.computeKPIs(period, targetDate);
    this.kpiCache.set(cacheKey, kpis);
    
    return kpis;
  }

  private async computeKPIs(period: 'daily' | 'weekly' | 'monthly', date: Date): Promise<KPIMetrics> {
    // Mock KPI calculation - replace with real database queries
    const mockMetrics: KPIMetrics = {
      period,
      date,
      metrics: {
        totalBookings: Math.floor(Math.random() * 100) + 50,
        completedBookings: Math.floor(Math.random() * 80) + 40,
        repeatCustomers: Math.floor(Math.random() * 30) + 10,
        averageOrderValue: Math.floor(Math.random() * 1000) + 1500,
        customerAcquisitionCost: Math.floor(Math.random() * 500) + 200,
        netPromoterScore: Math.floor(Math.random() * 30) + 70,
        slaBreaches: Math.floor(Math.random() * 5),
        cityWiseFillRate: {
          'kathmandu': 0.85,
          'pokhara': 0.78,
          'chitwan': 0.72
        },
        topServices: [
          { service: 'house-cleaning', bookings: 45 },
          { service: 'electrical-work', bookings: 32 },
          { service: 'plumbing', bookings: 28 }
        ],
        revenueGrowth: Math.random() * 20 - 10 // -10% to +10%
      }
    };

    return mockMetrics;
  }

  // Data export for BI tools
  async exportData(
    type: 'bookings' | 'users' | 'reviews' | 'ledger' | 'disputes' | 'support_tickets',
    format: 'csv' | 'json',
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<string> {
    const data = await this.getData(type, dateFrom, dateTo);
    
    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    } else {
      return this.convertToCSV(data);
    }
  }

  private async getData(type: string, dateFrom?: Date, dateTo?: Date): Promise<any[]> {
    // Mock data export - replace with real database queries
    const mockData = [
      {
        id: 'booking_001',
        userId: 'user_001',
        serviceId: 'house-cleaning',
        city: 'kathmandu',
        status: 'completed',
        amount: 1500,
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString()
      }
    ];

    // Filter by date range if provided
    if (dateFrom || dateTo) {
      return mockData.filter(item => {
        const itemDate = new Date(item.createdAt);
        return (!dateFrom || itemDate >= dateFrom) && 
               (!dateTo || itemDate <= dateTo);
      });
    }

    return mockData;
  }

  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(item => 
      Object.values(item).map(val => 
        typeof val === 'string' ? `"${val}"` : val
      ).join(',')
    ).join('\n');

    return `${headers}\n${rows}`;
  }

  private sendToWarehouse(event: AnalyticsEvent) {
    // In production, send to data warehouse
    console.log('Analytics event:', event);
  }

  private getSessionId(): string {
    // Get or generate session ID
    return 'session_' + Math.random().toString(36).substr(2, 9);
  }

  private getContext() {
    return {
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      source: 'web'
    };
  }
}

export const analyticsService = new AnalyticsService();
