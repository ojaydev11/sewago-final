import { Document, Types } from 'mongoose';

// Base interfaces
export interface BaseDocument extends Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// User types
export interface IUser extends BaseDocument {
  email: string;
  phone: string;
  name: string;
  role: 'customer' | 'provider' | 'admin';
  isVerified: boolean;
  isActive: boolean;
  profilePicture?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  preferences: {
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    language: string;
    timezone: string;
  };
  provider?: {
    businessName: string;
    description: string;
    services: Types.ObjectId[];
    specializations: string[];
    experience: number;
    kycStatus: 'pending' | 'approved' | 'rejected';
    kycDocuments: Array<{
      type: string;
      url: string;
      verified: boolean;
    }>;
    badges: Array<{
      name: string;
      description: string;
      awardedAt: Date;
    }>;
    rating: number;
    totalReviews: number;
    isAvailable: boolean;
    availability: Array<{
      day: string;
      slots: Array<{
        start: string;
        end: string;
        isAvailable: boolean;
      }>;
    }>;
  };
  wallet?: {
    balance: number;
    currency: string;
  };
}

// Service types
export interface IService extends BaseDocument {
  title: string;
  description: string;
  category: string;
  subcategory: string;
  basePrice: number;
  providerId: Types.ObjectId;
  isActive: boolean;
  images: string[];
  tags: string[];
  location: {
    city: string;
    state: string;
    coordinates: [number, number];
  };
  rating: number;
  totalReviews: number;
}

// Booking types
export interface IBooking extends BaseDocument {
  userId: Types.ObjectId;
  providerId: Types.ObjectId;
  serviceId: Types.ObjectId;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  scheduledDate: Date;
  scheduledTime: string;
  duration: number;
  totalAmount: number;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates: [number, number];
  };
  specialInstructions?: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentMethod: string;
  cancellationReason?: string;
  cancellationPolicy: string;
  slot: {
    start: string;
    end: string;
    isLocked: boolean;
    lockExpiresAt?: Date;
  };
  recurrence?: {
    type: 'none' | 'weekly' | 'biweekly' | 'monthly';
    interval: number;
    endDate?: Date;
  };
}

// Review types
export interface IReview extends BaseDocument {
  userId: Types.ObjectId;
  providerId: Types.ObjectId;
  serviceId: Types.ObjectId;
  bookingId: Types.ObjectId;
  rating: number;
  comment: string;
  photos: Array<{
    url: string;
    caption?: string;
  }>;
  isVerified: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  helpfulCount: number;
  reportedCount: number;
}

// Notification types
export interface INotification extends BaseDocument {
  userId: Types.ObjectId;
  type: string;
  title: string;
  message: string;
  data: Record<string, any>;
  isRead: boolean;
  isClicked: boolean;
  isDismissed: boolean;
  sentAt: Date;
  readAt?: Date;
  clickedAt?: Date;
  dismissedAt?: Date;
  priority: 'low' | 'medium' | 'high';
  category: string;
}

// Wallet types
export interface IWallet extends BaseDocument {
  userId: Types.ObjectId;
  balance: number;
  currency: string;
  transactions: Array<{
    type: 'CREDIT' | 'DEBIT' | 'REFUND' | 'BONUS' | 'REFERRAL' | 'CASHBACK' | 'TOPUP' | 'PAYOUT';
    amount: number;
    description: string;
    bookingId?: Types.ObjectId;
    referenceId: string;
    gatewayTransactionId?: string;
    status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
    metadata?: Record<string, any>;
    timestamp: Date;
  }>;
  linkedPaymentMethods: Array<{
    method: 'ESEWA' | 'KHALTI' | 'BANK' | 'CARD';
    accountId: string;
    isDefault: boolean;
    isVerified: boolean;
  }>;
  autoRecharge: {
    enabled: boolean;
    threshold: number;
    amount: number;
    paymentMethod?: string;
  };
  bnplEnabled: boolean;
  creditLimit: number;
  usedCredit: number;
  creditScore: number;
  isLocked: boolean;
  lastActivity: Date;
  failedAttempts: number;
  lockReason?: string;
  auditLog: Array<{
    action: string;
    amount?: number;
    previousBalance?: number;
    newBalance?: number;
    performedBy?: Types.ObjectId;
    timestamp: Date;
    ipAddress?: string;
    userAgent?: string;
  }>;
}

// Wallet Ledger types
export interface IWalletLedger extends BaseDocument {
  userId: Types.ObjectId;
  type: 'CREDIT' | 'DEBIT' | 'REFUND' | 'BONUS' | 'REFERRAL' | 'CASHBACK' | 'TOPUP' | 'PAYOUT';
  amount: number;
  description: string;
  bookingId?: Types.ObjectId;
  referenceId: string;
  gatewayTransactionId?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  metadata?: Record<string, any>;
  timestamp: Date;
  balanceBefore: number;
  balanceAfter: number;
}

// Payout Request types
export interface IPayoutRequest extends BaseDocument {
  userId: Types.ObjectId;
  amount: number;
  paymentMethod: string;
  accountDetails: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  processedAt?: Date;
  failureReason?: string;
  referenceId: string;
  gatewayResponse?: Record<string, any>;
}

// AI Features types
export interface IAIFeatures extends BaseDocument {
  searchPredictions: Array<{
    userId?: Types.ObjectId;
    query: string;
    predictedServices: Array<{
      serviceId: Types.ObjectId;
      confidence: number;
      reason: string;
    }>;
    searchContext: {
      location?: string;
      timeOfDay?: string;
      previousSearches: string[];
      userPreferences: any[];
    };
    timestamp: Date;
  }>;
  voiceBookings: Array<{
    userId: Types.ObjectId;
    audioFile?: string;
    transcription: string;
    intent: string;
    confidence: number;
    extractedData: {
      serviceType: string;
      location: string;
      date: string;
      time: string;
      urgency: string;
    };
    status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
    processedAt: Date;
  }>;
  schedulingRecommendations: Array<{
    userId: Types.ObjectId;
    serviceId: Types.ObjectId;
    recommendations: Array<{
      date: Date;
      timeSlots: Array<{
        start: string;
        end: string;
        score: number;
        factors: Array<{
          factor: string;
          impact: string;
          weight: number;
        }>;
      }>;
    }>;
    factors: {
      weather: string;
      traffic: string;
      providerAvailability: string;
      userPreferences: string;
      historicalData: string;
    };
    generatedAt: Date;
  }>;
  pricingSuggestions: Array<{
    serviceId: Types.ObjectId;
    basePrice: number;
    suggestedPrice: number;
    factors: Array<{
      factor: string;
      impact: number;
      reason: string;
    }>;
    marketConditions: {
      demand: 'HIGH' | 'LOW' | 'NORMAL';
      competition: 'HIGH' | 'LOW' | 'NORMAL';
      seasonality: string;
    };
    validityPeriod: {
      start: Date;
      end: Date;
    };
  }>;
  userBehavior: Array<{
    userId: Types.ObjectId;
    patterns: {
      preferredTimes: string[];
      preferredServices: Types.ObjectId[];
      preferredLocations: string[];
      bookingFrequency: 'OCCASIONAL' | 'REGULAR' | 'FREQUENT';
      averageSpend: number;
    };
    preferences: {
      urgency: 'LOW' | 'MEDIUM' | 'HIGH';
      quality: 'BASIC' | 'STANDARD' | 'PREMIUM';
      providerRating: number;
    };
    lastUpdated: Date;
  }>;
}

// Controller request/response types
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: Date;
}

// Service method types
export interface IUserService {
  canReceiveBookings(): boolean;
  addBadge(badge: { name: string; description: string }): void;
  get displayName(): string;
}

export interface IBookingService {
  canReschedule(): boolean;
  reschedule(newDate: Date, newTime: string): Promise<void>;
}

export interface IReviewService {
  approveReview(): void;
  rejectReview(reason: string): void;
  flagReview(reason: string): void;
}

export interface INotificationService {
  markAsRead(): void;
  markAsClicked(): void;
  dismiss(): void;
}

export interface IWalletLedgerService {
  createEntry(data: Partial<IWalletLedger>): Promise<IWalletLedger>;
}

export interface IPayoutRequestService {
  createRequest(data: Partial<IPayoutRequest>): Promise<IPayoutRequest>;
}

// AI Service types
export interface AIRequest {
  type: string;
  data: any;
  priority?: 'low' | 'normal' | 'high';
  context?: any;
}

export interface AIResponse {
  success: boolean;
  data: any;
  confidence: number;
  timestamp: Date;
}

// Database operation types
export interface DatabaseQueryOptions {
  cacheKey?: string;
  cacheTTL?: number;
  timeout?: number;
  type?: 'read' | 'write' | 'main';
}

export interface DatabaseConnection {
  readyState: number;
  host: string;
  port: number;
  name: string;
}

// Real-time sync types
export interface SocketData {
  type: string;
  id: string;
  filters?: any;
  data?: any;
}

export interface UserSession {
  socketId: string;
  userId: string | null;
  connectedAt: number;
  lastActivity: number;
  rooms: Set<string>;
  preferences: Record<string, any>;
}

// System health types
export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'critical';
  services: {
    database: boolean;
    redis: boolean;
    ai: boolean;
  };
  metrics: {
    activeConnections: number;
    averageResponseTime: number;
    errorRate: number;
  };
  timestamp: Date;
}

// All interfaces are already exported above
