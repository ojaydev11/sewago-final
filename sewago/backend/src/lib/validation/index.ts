import { z } from 'zod';
import { ValidationError } from '../errors/index.js';

// Base validation schemas
export const ObjectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format');

export const EmailSchema = z.string().email('Invalid email format');

export const PhoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format');

export const PasswordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number');

// User validation schemas
export const UserRegistrationSchema = z.object({
  email: EmailSchema,
  phone: PhoneSchema,
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  password: PasswordSchema,
  role: z.enum(['customer', 'provider'], { errorMap: () => ({ message: 'Role must be either customer or provider' }) }),
  address: z.object({
    street: z.string().min(5, 'Street address must be at least 5 characters'),
    city: z.string().min(2, 'City must be at least 2 characters'),
    state: z.string().min(2, 'State must be at least 2 characters'),
    zipCode: z.string().min(4, 'Zip code must be at least 4 characters'),
    country: z.string().min(2, 'Country must be at least 2 characters')
  }).optional(),
  provider: z.object({
    businessName: z.string().min(2, 'Business name must be at least 2 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    specializations: z.array(z.string()).min(1, 'At least one specialization is required'),
    experience: z.number().min(0, 'Experience must be non-negative')
  }).optional().refine((data) => {
    if (data && !data.businessName) {
      return false;
    }
    return true;
  }, { message: 'Provider details are required when role is provider' })
});

export const UserLoginSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, 'Password is required')
});

export const UserUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters').optional(),
  phone: PhoneSchema.optional(),
  address: z.object({
    street: z.string().min(5, 'Street address must be at least 5 characters'),
    city: z.string().min(2, 'City must be at least 2 characters'),
    state: z.string().min(2, 'State must be at least 2 characters'),
    zipCode: z.string().min(4, 'Zip code must be at least 4 characters'),
    country: z.string().min(2, 'Country must be at least 2 characters')
  }).optional(),
  preferences: z.object({
    notifications: z.object({
      email: z.boolean(),
      push: z.boolean(),
      sms: z.boolean()
    }).optional(),
    language: z.string().min(2, 'Language must be at least 2 characters').optional(),
    timezone: z.string().min(2, 'Timezone must be at least 2 characters').optional()
  }).optional()
});

// Service validation schemas
export const ServiceCreateSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(1000, 'Description must be less than 1000 characters'),
  category: z.string().min(2, 'Category must be at least 2 characters'),
  subcategory: z.string().min(2, 'Subcategory must be at least 2 characters'),
  basePrice: z.number().min(0, 'Base price must be non-negative'),
  images: z.array(z.string().url('Invalid image URL')).min(1, 'At least one image is required'),
  tags: z.array(z.string().min(1, 'Tag must be at least 1 character')).optional(),
  location: z.object({
    city: z.string().min(2, 'City must be at least 2 characters'),
    state: z.string().min(2, 'State must be at least 2 characters'),
    coordinates: z.tuple([z.number(), z.number()]).optional()
  })
});

export const ServiceUpdateSchema = ServiceCreateSchema.partial();

// Booking validation schemas
export const BookingCreateSchema = z.object({
  serviceId: ObjectIdSchema,
  providerId: ObjectIdSchema,
  scheduledDate: z.string().datetime('Invalid date format'),
  scheduledTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  duration: z.number().min(30, 'Duration must be at least 30 minutes').max(480, 'Duration must be less than 8 hours'),
  address: z.object({
    street: z.string().min(5, 'Street address must be at least 5 characters'),
    city: z.string().min(2, 'City must be at least 2 characters'),
    state: z.string().min(2, 'State must be at least 2 characters'),
    zipCode: z.string().min(4, 'Zip code must be at least 4 characters'),
    coordinates: z.tuple([z.number(), z.number()]).optional()
  }),
  specialInstructions: z.string().max(500, 'Special instructions must be less than 500 characters').optional(),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  recurrence: z.object({
    type: z.enum(['none', 'weekly', 'biweekly', 'monthly']),
    interval: z.number().min(1, 'Interval must be at least 1'),
    endDate: z.string().datetime('Invalid end date format').optional()
  }).optional()
});

export const BookingUpdateSchema = z.object({
  scheduledDate: z.string().datetime('Invalid date format').optional(),
  scheduledTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)').optional(),
  duration: z.number().min(30, 'Duration must be at least 30 minutes').max(480, 'Duration must be less than 8 hours').optional(),
  address: z.object({
    street: z.string().min(5, 'Street address must be at least 5 characters'),
    city: z.string().min(2, 'City must be at least 2 characters'),
    state: z.string().min(2, 'State must be at least 2 characters'),
    zipCode: z.string().min(4, 'Zip code must be at least 4 characters'),
    coordinates: z.tuple([z.number(), z.number()]).optional()
  }).optional(),
  specialInstructions: z.string().max(500, 'Special instructions must be less than 500 characters').optional(),
  status: z.enum(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']).optional()
});

// Review validation schemas
export const ReviewCreateSchema = z.object({
  providerId: ObjectIdSchema,
  serviceId: ObjectIdSchema,
  bookingId: ObjectIdSchema,
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  comment: z.string().min(10, 'Comment must be at least 10 characters').max(1000, 'Comment must be less than 1000 characters'),
  photos: z.array(z.object({
    url: z.string().url('Invalid photo URL'),
    caption: z.string().max(200, 'Caption must be less than 200 characters').optional()
  })).max(5, 'Maximum 5 photos allowed').optional()
});

export const ReviewUpdateSchema = z.object({
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5').optional(),
  comment: z.string().min(10, 'Comment must be at least 10 characters').max(1000, 'Comment must be less than 1000 characters').optional(),
  photos: z.array(z.object({
    url: z.string().url('Invalid photo URL'),
    caption: z.string().max(200, 'Caption must be less than 200 characters').optional()
  })).max(5, 'Maximum 5 photos allowed').optional()
});

// Wallet validation schemas
export const WalletTopupSchema = z.object({
  amount: z.number().min(100, 'Minimum top-up amount is 100').max(50000, 'Maximum top-up amount is 50,000'),
  paymentMethod: z.enum(['ESEWA', 'KHALT', 'BANK', 'CARD']),
  referenceId: z.string().min(1, 'Reference ID is required'),
  gatewayTransactionId: z.string().optional()
});

export const WalletRefundSchema = z.object({
  bookingId: ObjectIdSchema,
  amount: z.number().min(1, 'Refund amount must be at least 1'),
  reason: z.string().min(10, 'Refund reason must be at least 10 characters').max(500, 'Refund reason must be less than 500 characters'),
  referenceId: z.string().min(1, 'Reference ID is required')
});

export const PayoutRequestSchema = z.object({
  amount: z.number().min(1000, 'Minimum payout amount is 1,000').max(100000, 'Maximum payout amount is 100,000'),
  paymentMethod: z.enum(['BANK', 'ESEWA', 'KHALT']),
  accountDetails: z.record(z.any()),
  referenceId: z.string().min(1, 'Reference ID is required')
});

// KYC validation schemas
export const KYCSubmissionSchema = z.object({
  documentType: z.enum(['NID', 'PASSPORT', 'DRIVERS_LICENSE']),
  documentNumber: z.string().min(5, 'Document number must be at least 5 characters'),
  documentImage: z.string().url('Invalid document image URL'),
  selfieImage: z.string().url('Invalid selfie image URL'),
  businessLicense: z.string().url('Invalid business license URL').optional(),
  addressProof: z.string().url('Invalid address proof URL').optional()
});

// AI Features validation schemas
export const VoiceBookingSchema = z.object({
  audioFile: z.string().url('Invalid audio file URL').optional(),
  transcription: z.string().min(10, 'Transcription must be at least 10 characters'),
  intent: z.string().optional()
});

export const SearchPredictionSchema = z.object({
  query: z.string().min(2, 'Search query must be at least 2 characters'),
  location: z.string().optional(),
  timeOfDay: z.string().optional()
});

export const SchedulingRecommendationSchema = z.object({
  serviceId: ObjectIdSchema,
  preferredDate: z.string().datetime('Invalid date format'),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH'])
});

export const UserBehaviorUpdateSchema = z.object({
  action: z.enum(['BOOKING_COMPLETED', 'PREFERENCE_UPDATE', 'SERVICE_VIEWED', 'REVIEW_POSTED']),
  data: z.record(z.any())
});

// Pagination and filtering schemas
export const PaginationSchema = z.object({
  page: z.number().min(1, 'Page must be at least 1').default(1),
  limit: z.number().min(1, 'Limit must be at least 1').max(100, 'Limit must be at most 100').default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export const SearchFilterSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  category: z.string().optional(),
  location: z.string().optional(),
  priceRange: z.object({
    min: z.number().min(0, 'Minimum price must be non-negative').optional(),
    max: z.number().min(0, 'Maximum price must be non-negative').optional()
  }).optional(),
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5').optional(),
  availability: z.object({
    date: z.string().datetime('Invalid date format').optional(),
    time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)').optional()
  }).optional()
});

// Validation function
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string[]> = {};
      
      error.errors.forEach((err) => {
        const field = err.path.join('.');
        if (!fieldErrors[field]) {
          fieldErrors[field] = [];
        }
        fieldErrors[field].push(err.message);
      });
      
      throw new ValidationError('Validation failed', fieldErrors);
    }
    throw error;
  }
}

// Partial validation for updates
export function validatePartialData<T>(schema: z.ZodSchema<T>, data: unknown): Partial<T> {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string[]> = {};
      
      error.errors.forEach((err) => {
        const field = err.path.join('.');
        if (!fieldErrors[field]) {
          fieldErrors[field] = [];
        }
        fieldErrors[field].push(err.message);
      });
      
      throw new ValidationError('Validation failed', fieldErrors);
    }
    throw error;
  }
}

// All schemas are already exported above
