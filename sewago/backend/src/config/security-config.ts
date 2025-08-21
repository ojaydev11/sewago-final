import { z } from 'zod';
import crypto from 'crypto';

/**
 * Security Configuration Validator
 * Ensures all security-critical environment variables are properly configured
 */

// Security validation schemas
const securityEnvSchema = z.object({
  // JWT Security
  JWT_ACCESS_SECRET: z.string()
    .min(64, 'JWT access secret must be at least 64 characters')
    .refine(
      (val) => !val.includes('insecure') && !val.includes('dev') && !val.includes('change_me'),
      'JWT access secret must not contain default/insecure values'
    ),
  
  JWT_REFRESH_SECRET: z.string()
    .min(64, 'JWT refresh secret must be at least 64 characters')
    .refine(
      (val) => !val.includes('insecure') && !val.includes('dev') && !val.includes('change_me'),
      'JWT refresh secret must not contain default/insecure values'
    ),

  // Database Security
  MONGODB_URI: z.string()
    .url('MongoDB URI must be a valid URL')
    .refine(
      (val) => val.includes('ssl=true') || val.includes('localhost') || val.includes('127.0.0.1'),
      'Production MongoDB should use SSL/TLS encryption'
    ),

  // Payment Gateway Security
  ESEWA_MERCHANT_CODE: z.string().optional(),
  ESEWA_SECRET: z.string().min(32, 'eSewa secret must be at least 32 characters').optional(),
  KHALTI_SECRET_KEY: z.string().min(32, 'Khalti secret must be at least 32 characters').optional(),

  // CORS Configuration
  CLIENT_ORIGIN: z.string()
    .url('Client origin must be a valid URL')
    .refine(
      (val) => val.startsWith('https://') || val.includes('localhost'),
      'Production client origin should use HTTPS'
    ),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().optional().transform(val => val ? parseInt(val) : 60000),
  RATE_LIMIT_MAX_REQUESTS: z.string().optional().transform(val => val ? parseInt(val) : 200),
  LOGIN_RATE_LIMIT_MAX: z.string().optional().transform(val => val ? parseInt(val) : 5),

  // Session Security
  SESSION_SECRET: z.string()
    .min(64, 'Session secret must be at least 64 characters')
    .optional(),

  // File Upload Security
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().min(20).optional(),
  S3_BUCKET_REVIEWS: z.string().optional(),

  // Environment
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  
  // Seed Protection
  ALLOW_SEEDING: z.string().optional().transform(val => val === 'true'),
  SEED_KEY: z.string().min(32, 'Seed key must be at least 32 characters').optional(),
});

// Security configuration validator
export class SecurityConfigValidator {
  private config: z.infer<typeof securityEnvSchema>;
  private warnings: string[] = [];
  private errors: string[] = [];

  constructor() {
    try {
      this.config = securityEnvSchema.parse(process.env);
      this.validateSecurityPolicies();
    } catch (error) {
      if (error instanceof z.ZodError) {
        this.errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      }
      throw new Error(`Security configuration validation failed:\n${this.errors.join('\n')}`);
    }
  }

  private validateSecurityPolicies() {
    // Check for production security requirements
    if (this.config.NODE_ENV === 'production') {
      this.validateProductionSecurity();
    }

    // Validate JWT secret entropy
    this.validateJWTSecrets();

    // Validate payment configuration
    this.validatePaymentSecurity();

    // Check for weak configurations
    this.checkWeakConfigurations();
  }

  private validateProductionSecurity() {
    const prodChecks = [
      {
        condition: !this.config.CLIENT_ORIGIN.startsWith('https://'),
        error: 'Production must use HTTPS for client origin'
      },
      {
        condition: this.config.ALLOW_SEEDING,
        error: 'Seeding must be disabled in production'
      },
      {
        condition: !this.config.MONGODB_URI.includes('ssl=true') && !this.config.MONGODB_URI.includes('localhost'),
        warning: 'Production MongoDB should use SSL/TLS encryption'
      }
    ];

    for (const check of prodChecks) {
      if (check.condition) {
        if ('error' in check && check.error) {
          this.errors.push(check.error);
        }
        if ('warning' in check && check.warning) {
          this.warnings.push(check.warning);
        }
      }
    }
  }

  private validateJWTSecrets() {
    const accessSecret = this.config.JWT_ACCESS_SECRET;
    const refreshSecret = this.config.JWT_REFRESH_SECRET;

    // Check entropy (simplified check)
    const calculateEntropy = (str: string): number => {
      const freq = new Map<string, number>();
      for (const char of str) {
        freq.set(char, (freq.get(char) || 0) + 1);
      }
      
      let entropy = 0;
      for (const count of freq.values()) {
        const p = count / str.length;
        entropy -= p * Math.log2(p);
      }
      
      return entropy;
    };

    if (calculateEntropy(accessSecret) < 4) {
      this.warnings.push('JWT access secret has low entropy - consider using a more random string');
    }

    if (calculateEntropy(refreshSecret) < 4) {
      this.warnings.push('JWT refresh secret has low entropy - consider using a more random string');
    }

    // Ensure secrets are different
    if (accessSecret === refreshSecret) {
      this.errors.push('JWT access and refresh secrets must be different');
    }
  }

  private validatePaymentSecurity() {
    const hasESewa = this.config.ESEWA_MERCHANT_CODE && this.config.ESEWA_SECRET;
    const hasKhalti = this.config.KHALTI_SECRET_KEY;

    if (!hasESewa && !hasKhalti) {
      this.warnings.push('No payment gateway configured - payment features will be disabled');
    }

    if (hasESewa && this.config.ESEWA_SECRET && this.config.ESEWA_SECRET.length < 32) {
      this.errors.push('eSewa secret key is too short for secure operations');
    }

    if (hasKhalti && this.config.KHALTI_SECRET_KEY && this.config.KHALTI_SECRET_KEY.length < 32) {
      this.errors.push('Khalti secret key is too short for secure operations');
    }
  }

  private checkWeakConfigurations() {
    // Check for common weak patterns
    const weakPatterns = [
      'password',
      '123456',
      'secret',
      'admin',
      'test',
      'demo'
    ];

    const secrets = [
      this.config.JWT_ACCESS_SECRET,
      this.config.JWT_REFRESH_SECRET,
      this.config.SESSION_SECRET,
      this.config.SEED_KEY
    ].filter(Boolean);

    for (const secret of secrets) {
      if (secret && weakPatterns.some(pattern => secret.toLowerCase().includes(pattern))) {
        this.warnings.push('Security secret contains weak patterns');
        break;
      }
    }
  }

  public getConfig() {
    return this.config;
  }

  public getWarnings() {
    return this.warnings;
  }

  public getErrors() {
    return this.errors;
  }

  public hasErrors() {
    return this.errors.length > 0;
  }

  public generateSecureSecret(length: number = 64): string {
    return crypto.randomBytes(length).toString('hex');
  }

  public logSecurityStatus() {
    console.log('\n🔒 Security Configuration Status:');
    
    if (this.errors.length > 0) {
      console.error('❌ ERRORS:');
      this.errors.forEach(error => console.error(`  - ${error}`));
    }
    
    if (this.warnings.length > 0) {
      console.warn('⚠️  WARNINGS:');
      this.warnings.forEach(warning => console.warn(`  - ${warning}`));
    }
    
    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('✅ All security configurations validated successfully');
    }
    
    console.log('\n');
  }
}

// Security constants
export const SECURITY_CONSTANTS = {
  // Password requirements
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]$/,
  
  // Rate limiting
  DEFAULT_RATE_LIMIT: {
    windowMs: 60 * 1000, // 1 minute
    max: 200, // requests per window
  },
  
  LOGIN_RATE_LIMIT: {
    windowMs: 60 * 1000, // 1 minute
    max: 5, // attempts per window
  },
  
  PAYMENT_RATE_LIMIT: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10, // attempts per window
  },

  // File upload
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  
  // JWT
  ACCESS_TOKEN_TTL: 15, // minutes
  REFRESH_TOKEN_TTL: 30, // days
  
  // Session
  SESSION_MAX_AGE: 24 * 60 * 60 * 1000, // 24 hours
  
  // CORS
  ALLOWED_METHODS: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  ALLOWED_HEADERS: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-Request-ID',
    'X-CSRF-Token',
    'Idempotency-Key'
  ]
};

export default SecurityConfigValidator;