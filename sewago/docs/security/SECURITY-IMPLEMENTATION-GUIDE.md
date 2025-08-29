# SewaGo Security Implementation Guide

## 🎯 Overview

This guide provides step-by-step instructions for implementing and deploying the security hardening measures for SewaGo in production environments.

## 🚀 Quick Security Deployment Checklist

### Pre-Deployment Security Setup ✅
- [x] Security middleware implemented
- [x] Payment webhook security hardened  
- [x] Input validation comprehensive
- [x] Rate limiting configured
- [x] Security headers enforced
- [x] Error handling sanitized
- [x] Audit logging enabled

### Environment Variables Configuration

#### Backend Security Environment Variables
```bash
# Security Configuration
JWT_ACCESS_SECRET=<64-character-secure-random-string>
JWT_REFRESH_SECRET=<64-character-secure-random-string>
ACCESS_TOKEN_TTL_MIN=15
REFRESH_TOKEN_TTL_DAYS=30

# Payment Security
ESEWA_SECRET_KEY=<production-esewa-secret>
KHALTI_SECRET_KEY=<production-khalti-secret>

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOGIN_RATE_LIMIT_MAX=5
BOOKING_RATE_LIMIT_MAX=10

# Security Features
ENABLE_CSRF_PROTECTION=true
ENABLE_SECURITY_HEADERS=true
ENABLE_AUDIT_LOGGING=true
```

#### Frontend Security Environment Variables
```bash
# Content Security Policy
NEXT_PUBLIC_STRICT_CSP=true

# Payment Gateway Origins (for CSP)
NEXT_PUBLIC_ESEWA_DOMAIN=checkout.esewa.com.np
NEXT_PUBLIC_KHALTI_DOMAIN=pay.khalti.com

# Security Headers
NEXT_PUBLIC_ENABLE_SECURITY_HEADERS=true
```

## 🔧 Implementation Steps

### Step 1: Deploy Security Middleware

#### Backend Security Integration
```typescript
// In src/app.ts, add security middleware
import securityMiddleware from './middleware/enhanced-security.js';
import paymentSecurity from './middleware/payment-security.js';

// Apply security middleware
app.use(securityMiddleware.securityHeaders);
app.use(securityMiddleware.requestId);
app.use(securityMiddleware.sanitizeInput);

// Apply rate limiting
app.use('/api/auth/', securityMiddleware.authRateLimit);
app.use('/api/payments/', securityMiddleware.paymentRateLimit);
app.use('/api/bookings/', securityMiddleware.bookingRateLimit);

// Apply payment security
app.use('/api/payments/esewa/webhook', [
  paymentSecurity.verifyEsewaSignature,
  paymentSecurity.idempotencyProtection,
  paymentSecurity.replayProtection,
  paymentSecurity.validatePaymentAmount,
  paymentSecurity.fraudDetection
]);

app.use('/api/payments/khalti/webhook', [
  paymentSecurity.verifyKhaltiSignature,
  paymentSecurity.idempotencyProtection,  
  paymentSecurity.replayProtection,
  paymentSecurity.validatePaymentAmount,
  paymentSecurity.fraudDetection
]);
```

### Step 2: Configure Security Headers

#### Next.js Security Configuration
```typescript
// In next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' https://checkout.esewa.com.np https://khalti.s3.ap-south-1.amazonaws.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.esewa.com.np https://khalti.com; frame-src https://checkout.esewa.com.np https://pay.khalti.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';"
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ],
      }
    ];
  }
};
```

### Step 3: Payment Security Implementation

#### eSewa Webhook Security
```typescript
// Production webhook endpoint
app.post('/api/payments/esewa/verify', [
  // Security middleware stack
  paymentSecurity.verifyEsewaSignature,
  paymentSecurity.idempotencyProtection,
  paymentSecurity.replayProtection,
  paymentSecurity.validatePaymentAmount,
  paymentSecurity.fraudDetection
], async (req, res) => {
  try {
    const { oid, amt, refId, status } = req.body;
    
    // Process payment verification
    const booking = await BookingModel.findById(oid);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Validate amount matches booking
    if (Math.abs(parseFloat(amt) - booking.total) > 0.01) {
      securityAuditLog('payment_amount_mismatch', { oid, amt, expected: booking.total }, req);
      return res.status(400).json({ error: 'Amount mismatch' });
    }
    
    // Update booking status
    booking.paid = status === 'COMPLETE';
    booking.paymentId = refId;
    await booking.save();
    
    // Cache response for idempotency
    const response = { success: true, bookingId: oid, status: booking.paid ? 'paid' : 'failed' };
    paymentSecurity.cacheWebhookResponse(response, req.idempotencyKey);
    
    res.json(response);
    
  } catch (error) {
    securityAuditLog('payment_webhook_error', { error: error.message }, req);
    res.status(500).json({ error: 'Payment processing failed' });
  }
});
```

#### Khalti Webhook Security
```typescript
// Production webhook endpoint  
app.post('/api/payments/khalti/verify', [
  // Security middleware stack
  paymentSecurity.verifyKhaltiSignature,
  paymentSecurity.idempotencyProtection,
  paymentSecurity.replayProtection,
  paymentSecurity.validatePaymentAmount,
  paymentSecurity.fraudDetection
], async (req, res) => {
  try {
    const { pidx, total_amount, transaction_id, purchase_order_id, status } = req.body;
    
    // Process payment verification
    const booking = await BookingModel.findById(purchase_order_id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Validate amount (Khalti uses paisa)
    const amountNPR = total_amount / 100;
    if (Math.abs(amountNPR - booking.total) > 0.01) {
      securityAuditLog('payment_amount_mismatch', { 
        orderId: purchase_order_id, 
        amount: amountNPR, 
        expected: booking.total 
      }, req);
      return res.status(400).json({ error: 'Amount mismatch' });
    }
    
    // Update booking status
    booking.paid = status === 'Completed';
    booking.paymentId = transaction_id;
    await booking.save();
    
    // Cache response for idempotency
    const response = { success: true, bookingId: purchase_order_id, status: booking.paid ? 'paid' : 'failed' };
    paymentSecurity.cacheWebhookResponse(response, req.idempotencyKey);
    
    res.json(response);
    
  } catch (error) {
    securityAuditLog('payment_webhook_error', { error: error.message }, req);
    res.status(500).json({ error: 'Payment processing failed' });
  }
});
```

### Step 4: Authentication Security Enhancement

#### Secure JWT Implementation
```typescript
// Enhanced JWT utilities with security measures
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export const signAccessToken = (payload: { sub: string; role: string }): string => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: '15m',
    issuer: 'sewago-api',
    audience: 'sewago-client',
    algorithm: 'HS256'
  });
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET!, {
    issuer: 'sewago-api',
    audience: 'sewago-client',
    algorithms: ['HS256'],
    clockTolerance: 30 // 30 second clock skew tolerance
  });
};

export const signRefreshToken = (payload: { sub: string; role: string }): string => {
  // Add random jti to prevent token reuse
  const tokenPayload = {
    ...payload,
    jti: crypto.randomUUID()
  };
  
  return jwt.sign(tokenPayload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: '30d',
    issuer: 'sewago-api',
    audience: 'sewago-client',
    algorithm: 'HS256'
  });
};
```

### Step 5: Input Validation Security

#### Comprehensive Zod Schemas
```typescript
// Create secure validation schemas
import { z } from 'zod';

// Booking validation with security measures
export const createBookingSchema = z.object({
  serviceId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid service ID'),
  date: z.string().datetime('Invalid date format'),
  timeSlot: z.enum(['09:00-11:00', '11:00-13:00', '14:00-16:00', '16:00-18:00']),
  address: z.string()
    .min(10, 'Address too short')
    .max(200, 'Address too long')
    .regex(/^[a-zA-Z0-9\s,.-]+$/, 'Invalid address characters'),
  notes: z.string()
    .max(500, 'Notes too long')
    .optional()
    .transform(val => val?.replace(/<[^>]*>/g, '')) // Strip HTML tags
});

// User registration with security validation
export const userRegistrationSchema = z.object({
  name: z.string()
    .min(2, 'Name too short')
    .max(50, 'Name too long')
    .regex(/^[a-zA-Z\s]+$/, 'Name contains invalid characters'),
  email: z.string().email('Invalid email format').toLowerCase(),
  phone: z.string()
    .regex(/^\+977[0-9]{10}$/, 'Invalid Nepal phone number format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'Password must contain uppercase, lowercase, number, and special character')
});
```

### Step 6: File Upload Security

#### Secure File Upload Implementation
```typescript
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

// Magic bytes for file type validation
const ALLOWED_FILE_SIGNATURES = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47],
  'image/webp': [0x52, 0x49, 0x46, 0x46]
};

const storage = multer.memoryStorage();

const fileFilter = (req: any, file: any, cb: any) => {
  // Check file extension
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (!allowedExtensions.includes(ext)) {
    return cb(new Error('Invalid file extension'));
  }
  
  // Check MIME type
  if (!Object.keys(ALLOWED_FILE_SIGNATURES).includes(file.mimetype)) {
    return cb(new Error('Invalid file type'));
  }
  
  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 3 // Maximum 3 files
  }
});

// Enhanced file validation middleware
export const validateFileContent = (req: Request, res: Response, next: NextFunction) => {
  if (!req.files || !Array.isArray(req.files)) {
    return next();
  }
  
  for (const file of req.files) {
    const buffer = file.buffer;
    const mimeType = file.mimetype;
    
    // Validate magic bytes
    const expectedSignature = ALLOWED_FILE_SIGNATURES[mimeType as keyof typeof ALLOWED_FILE_SIGNATURES];
    if (expectedSignature) {
      const fileSignature = Array.from(buffer.slice(0, expectedSignature.length));
      if (!expectedSignature.every((byte, index) => byte === fileSignature[index])) {
        return res.status(400).json({ 
          error: 'File content does not match declared type',
          code: 'INVALID_FILE_SIGNATURE'
        });
      }
    }
    
    // Generate secure filename
    const ext = path.extname(file.originalname);
    file.filename = crypto.randomUUID() + ext;
  }
  
  next();
};
```

## 🔍 Security Monitoring Setup

### Audit Logging Configuration
```typescript
// Enhanced security event logging
export const setupSecurityMonitoring = (app: Express) => {
  // Log all authentication attempts
  app.use('/api/auth/', (req, res, next) => {
    const originalSend = res.send;
    res.send = function(body) {
      securityAuditLog('auth_attempt', {
        endpoint: req.path,
        method: req.method,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        success: res.statusCode < 400
      }, req);
      return originalSend.call(this, body);
    };
    next();
  });
  
  // Log all payment operations
  app.use('/api/payments/', (req, res, next) => {
    const originalSend = res.send;
    res.send = function(body) {
      securityAuditLog('payment_operation', {
        endpoint: req.path,
        method: req.method,
        ip: req.ip,
        success: res.statusCode < 400,
        amount: req.body?.amount
      }, req);
      return originalSend.call(this, body);
    };
    next();
  });
};
```

### Real-time Security Alerting
```typescript
// Security alerting system
export const securityAlertSystem = {
  checkFailedLogins: async (userId: string, ip: string) => {
    const failedAttempts = await getFailedLoginCount(userId, ip, '15m');
    if (failedAttempts >= 5) {
      await sendSecurityAlert('BRUTE_FORCE_ATTEMPT', { userId, ip, attempts: failedAttempts });
    }
  },
  
  checkSuspiciousPayment: async (amount: number, userId: string, ip: string) => {
    if (amount > 50000) {
      await sendSecurityAlert('HIGH_VALUE_PAYMENT', { amount, userId, ip });
    }
  },
  
  checkAnomalousActivity: async (userId: string, action: string) => {
    const recentActions = await getUserRecentActions(userId, '5m');
    if (recentActions.length > 20) {
      await sendSecurityAlert('RAPID_API_USAGE', { userId, action, count: recentActions.length });
    }
  }
};
```

## 🚀 Production Deployment Security

### Vercel Deployment Security
```json
{
  "env": {
    "NODE_ENV": "production",
    "NEXT_PUBLIC_STRICT_CSP": "true",
    "NEXT_PUBLIC_ENABLE_SECURITY_HEADERS": "true"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains; preload"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' https://checkout.esewa.com.np; object-src 'none';"
        }
      ]
    }
  ]
}
```

### Railway Deployment Security
```toml
[build]
builder = "nixpacks"
root = "backend"

[deploy]
start_command = "npm start"
health_check_path = "/api/health"
health_check_timeout = 300
restart_policy_type = "on_failure"
restart_policy_max_retries = 3

[env]
NODE_ENV = "production"
ENABLE_SECURITY_HEADERS = "true"
ENABLE_AUDIT_LOGGING = "true"
```

## 🔒 Post-Deployment Security Validation

### Security Testing Checklist
```bash
# 1. Verify security headers
curl -I https://sewago.vercel.app/
# Should return: CSP, HSTS, X-Frame-Options, etc.

# 2. Test authentication security  
curl -X POST https://sewago-backend.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"wrong"}'
# Should return 401 and trigger rate limiting after 5 attempts

# 3. Test payment webhook security
curl -X POST https://sewago-backend.railway.app/api/payments/esewa/verify \
  -H "Content-Type: application/json" \
  -d '{"amount":1000,"orderId":"test"}'
# Should return 400 (missing signature)

# 4. Test input validation
curl -X POST https://sewago-backend.railway.app/api/bookings \
  -H "Authorization: Bearer valid-token" \
  -H "Content-Type: application/json" \
  -d '{"serviceId":"<script>alert(1)</script>","date":"invalid"}'
# Should return 400 (validation error)
```

## 📊 Security Metrics Monitoring

### Key Security Metrics to Track
1. **Authentication Failures**: Failed login attempts per hour
2. **Payment Anomalies**: Unusual transaction patterns
3. **API Abuse**: Rate limit violations
4. **Security Events**: Critical security logs per day
5. **Response Times**: Security middleware performance impact

### Alerting Thresholds
- **Critical**: Failed logins > 100/hour from single IP
- **High**: Payment amounts > NPR 50,000
- **Medium**: API rate limit violations > 50/hour
- **Low**: Security header misconfigurations

## 🎯 Security Maintenance

### Weekly Security Tasks
- [ ] Review security audit logs
- [ ] Update dependency versions
- [ ] Check for new vulnerability reports
- [ ] Validate security monitoring alerts
- [ ] Test backup security procedures

### Monthly Security Tasks
- [ ] Conduct security penetration testing
- [ ] Review and update security policies
- [ ] Analyze security metrics trends
- [ ] Update threat intelligence feeds
- [ ] Security training for development team

---

## 🛡️ Security Support Contacts

**Security Team**: security@sewago.com.np  
**Incident Response**: incident@sewago.com.np  
**Security Hotline**: +977-01-SECURITY  

**Emergency Escalation**:
1. Disable affected services
2. Contact security team immediately  
3. Preserve evidence and logs
4. Follow incident response procedures

---

**Implementation Guide Version**: 1.0  
**Last Updated**: August 21, 2025  
**Next Review**: November 21, 2025