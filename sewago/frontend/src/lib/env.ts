import { z } from 'zod';

// Environment variable schema
const envSchema = z.object({
<<<<<<< HEAD
  // MongoDB
  MONGODB_URI: z.string().url().optional(),
  
=======
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
  // Authentication
  AUTH_SECRET: z.string().min(32).optional(),
  AUTH_URL: z.string().url().optional(),
  
  // NextAuth
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(32).optional(),
  
  // Feature Flags
<<<<<<< HEAD
  NEXT_PUBLIC_BOOKING_ENABLED: z.string().transform(val => val === 'true').default('true'),
  NEXT_PUBLIC_AUTH_ENABLED: z.string().transform(val => val === 'true').default('true'),
  NEXT_PUBLIC_I18N_ENABLED: z.string().transform(val => val === 'true').default('true'),
  NEXT_PUBLIC_SEWAAI_ENABLED: z.string().transform(val => val === 'true').default('true'),
  NEXT_PUBLIC_QUOTE_ESTIMATOR_ENABLED: z.string().transform(val => val === 'true').default('true'),
=======
  NEXT_PUBLIC_BOOKING_ENABLED: z.string().default('true').transform(val => val === 'true'),
  NEXT_PUBLIC_AUTH_ENABLED: z.string().default('true').transform(val => val === 'true'),
  NEXT_PUBLIC_I18N_ENABLED: z.string().default('true').transform(val => val === 'true'),
  NEXT_PUBLIC_SEWAAI_ENABLED: z.string().default('true').transform(val => val === 'true'),
  NEXT_PUBLIC_QUOTE_ESTIMATOR_ENABLED: z.string().default('true').transform(val => val === 'true'),
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
  
  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// Parse environment variables
const env = envSchema.parse(process.env);

// Validate required variables in production
if (env.NODE_ENV === 'production') {
<<<<<<< HEAD
  if (!env.MONGODB_URI) {
    console.warn('⚠️  MONGODB_URI not set in production. Using mock database.');
  }
  
=======
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
  if (!env.AUTH_SECRET || !env.NEXTAUTH_SECRET) {
    console.warn('⚠️  AUTH_SECRET or NEXTAUTH_SECRET not set in production. Authentication may not work properly.');
  }
  
  if (!env.AUTH_URL || !env.NEXTAUTH_URL) {
    console.warn('⚠️  AUTH_URL or NEXTAUTH_URL not set in production. Authentication may not work properly.');
  }
}

export default env;
