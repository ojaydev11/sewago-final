import { z } from 'zod';

// Auth schemas
export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(50),
    email: z.string().email(),
    phone: z.string().regex(/^[0-9]{10}$/, 'Phone must be 10 digits'),
    password: z.string().min(8).max(128),
    role: z.enum(['user', 'provider']).optional().default('user'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

// Booking schemas
export const createBookingSchema = z.object({
  body: z.object({
    serviceId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid service ID'),
    date: z.string().datetime(),
    timeSlot: z.string().min(1).max(20),
    address: z.string().min(5).max(200),
    notes: z.string().max(500).optional(),
  }),
});

export const updateBookingStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid booking ID'),
  }),
  body: z.object({
    status: z.enum(['pending', 'accepted', 'in-progress', 'completed', 'cancelled']),
  }),
});

// Service schemas
export const createServiceSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(100),
    category: z.string().min(2).max(50),
    description: z.string().min(10).max(1000),
    basePrice: z.number().min(1).max(1000000),
    location: z.string().min(2).max(100),
    images: z.array(z.string().url()).max(5).optional(),
  }),
});

// Payment schemas
export const initiatePaymentSchema = z.object({
  body: z.object({
    bookingId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid booking ID'),
    gateway: z.enum(['esewa', 'khalti']),
    returnUrl: z.string().url().optional(),
    failureUrl: z.string().url().optional(),
  }),
});

export const verifyPaymentSchema = z.object({
  body: z.object({
    referenceId: z.string().min(1),
    gateway: z.enum(['esewa', 'khalti']),
    // Allow additional gateway-specific fields
  }).passthrough(),
});

// Review schemas
export const addReviewSchema = z.object({
  body: z.object({
    bookingId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid booking ID'),
    rating: z.number().min(1).max(5),
    text: z.string().max(500).optional(),
    mediaUrls: z.array(z.string().url()).max(3).optional(),
  }),
});

// Message schemas
export const sendMessageSchema = z.object({
  params: z.object({
    bookingId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid booking ID'),
  }),
  body: z.object({
    message: z.string().min(1).max(1000),
    type: z.enum(['text', 'image']).optional().default('text'),
  }),
});

// Query parameter schemas
export const paginationSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional().default("1"),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default("10"),
  }),
});

export const objectIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format'),
  }),
});
