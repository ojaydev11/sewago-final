# SewaGo Security Implementation Guide

**Version**: 1.0  
**Date**: 2025-08-21  
**Audience**: Development Team  

## Overview

This guide provides practical instructions for implementing and maintaining the security enhancements identified in the security audit. All security controls should be implemented before production deployment.

## Quick Start Checklist

### Pre-Production Security Checklist
- [ ] Update environment variables with secure values
- [ ] Enable enhanced security middleware
- [ ] Configure payment webhook verification
- [ ] Test all security controls
- [ ] Review security configuration
- [ ] Enable monitoring and logging

## 1. Environment Configuration

### Generate Secure Secrets
```bash
# Generate secure JWT secrets (64+ characters)
node -e "console.log('JWT_ACCESS_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('SESSION_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('SEED_KEY=' + require('crypto').randomBytes(32).toString('hex'))"
```

### Production Environment Variables
```bash
# Update your .env.production file with these secure configurations:

# JWT Security (CRITICAL - Replace with generated values)
JWT_ACCESS_SECRET=your-64-character-access-secret-here
JWT_REFRESH_SECRET=your-64-character-refresh-secret-here
SESSION_SECRET=your-64-character-session-secret-here

# Payment Security
ESEWA_SECRET=your-esewa-secret-key-here
KHALTI_SECRET_KEY=your-khalti-secret-key-here
PAYMENT_WEBHOOK_SECRET=your-webhook-secret-here

# Database Security
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sewago?ssl=true&retryWrites=true&w=majority

# CORS Security  
CLIENT_ORIGIN=https://your-production-domain.vercel.app
ALLOWED_ORIGINS=https://your-production-domain.vercel.app

# Security Configuration
ALLOW_SEEDING=false
SEED_KEY=your-32-character-seed-key-here
ENABLE_SECURITY_MIDDLEWARE=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=200
LOGIN_RATE_LIMIT_MAX=5
PAYMENT_RATE_LIMIT_MAX=10

# File Upload Security
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp
```

## 2. Backend Security Implementation

### Enable Enhanced Security Middleware
```typescript
// backend/src/app.ts - Add these imports and middleware

import enhancedSecurity from './middleware/enhanced-security.js';
import paymentSecurity from './middleware/payment-security.js';
import { SecurityConfigValidator } from './config/security-config.js';

// Initialize security configuration validator
const securityConfig = new SecurityConfigValidator();
securityConfig.logSecurityStatus();

if (securityConfig.hasErrors()) {
  console.error('❌ Security configuration validation failed');
  process.exit(1);
}

// Add enhanced security middleware
if (process.env.NODE_ENV === 'production') {
  app.use(enhancedSecurity.strictCSP);
  app.use(enhancedSecurity.enhancedSanitization);
  app.use(enhancedSecurity.requestSizeLimiter(1024 * 1024)); // 1MB limit
  app.use(enhancedSecurity.apiSecurityHeaders);
}
```

### Update Authentication Routes
```typescript
// backend/src/routes/auth.ts - Add input validation

import { validateInput, validationSchemas } from '../middleware/enhanced-security.js';

// Apply validation to registration
router.post('/register', 
  validateInput(validationSchemas.userRegister),
  register
);

// Apply validation to login
router.post('/login',
  validateInput(validationSchemas.userLogin),
  login
);
```

### Secure Payment Endpoints
```typescript
// backend/src/routes/payments.ts - Add payment security

import paymentSecurity from '../middleware/payment-security.js';

// Apply payment security middleware
router.use(paymentSecurity.paymentRateLimit());
router.use(paymentSecurity.sanitizePaymentData);

// Payment initiation with security
router.post('/initiate',
  requireAuth,
  validateInput(validationSchemas.paymentInitiate),
  paymentSecurity.ensurePaymentIdempotency(),
  paymentSecurity.validatePaymentAmount,
  paymentSecurity.auditPaymentOperation('INITIATE'),
  initiatePayment
);

// Webhook endpoints with signature verification
router.post('/webhook/esewa',
  paymentSecurity.verifyWebhookSignature(process.env.ESEWA_SECRET!),
  paymentSecurity.auditPaymentOperation('WEBHOOK_ESEWA'),
  handleEsewaWebhook
);

router.post('/webhook/khalti',
  paymentSecurity.verifyWebhookSignature(process.env.KHALTI_SECRET_KEY!),
  paymentSecurity.auditPaymentOperation('WEBHOOK_KHALTI'),
  handleKhaltiWebhook
);
```

### Secure File Upload Routes
```typescript
// backend/src/routes/upload.ts - Add file security

import enhancedSecurity from '../middleware/enhanced-security.js';

// Apply file upload security
router.post('/file',
  requireAuth,
  upload.single('file'),
  enhancedSecurity.secureFileUpload,
  enhancedSecurity.auditLog('FILE_UPLOAD'),
  uploadFile
);
```

## 3. Payment Gateway Security

### eSewa Webhook Verification
```typescript
// backend/src/services/payments/esewa.ts - Add signature verification

async verify(request: PaymentVerificationRequest): Promise<PaymentVerificationResponse> {
  try {
    // Verify webhook signature first
    const signature = request.signature;
    const expectedSignature = this.generateSignature(request);
    
    if (!crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    )) {
      throw new Error('Invalid webhook signature');
    }

    // Continue with existing verification logic...
  } catch (error) {
    // Log security event
    console.error('eSewa verification failed:', maskSensitiveData(error));
    throw error;
  }
}
```

### Khalti Webhook Verification
```typescript
// backend/src/services/payments/khalti.ts - Add signature verification

async verify(request: PaymentVerificationRequest): Promise<PaymentVerificationResponse> {
  try {
    // Verify webhook signature
    const signature = request.headers['x-khalti-signature'];
    const payload = JSON.stringify(request.body);
    const expectedSignature = crypto
      .createHmac('sha256', this.secretKey)
      .update(payload)
      .digest('hex');
    
    if (signature !== expectedSignature) {
      throw new Error('Invalid Khalti webhook signature');
    }

    // Continue with existing verification logic...
  } catch (error) {
    console.error('Khalti verification failed:', maskSensitiveData(error));
    throw error;
  }
}
```

## 4. Frontend Security Implementation

### Update API Client
```typescript
// frontend/src/lib/api.ts - Add security headers

import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api",
  withCredentials: true,
});

// Add security headers to requests
api.interceptors.request.use((config) => {
  // Add CSRF token if available
  const csrfToken = localStorage.getItem('csrfToken');
  if (csrfToken) {
    config.headers['X-CSRF-Token'] = csrfToken;
  }

  // Add request ID for correlation
  config.headers['X-Request-ID'] = crypto.randomUUID();
  
  return config;
});

// Handle security errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403 && 
        error.response?.data?.code === 'CSRF_TOKEN_INVALID') {
      // Refresh CSRF token and retry
      return refreshCSRFToken().then(() => api.request(error.config));
    }
    return Promise.reject(error);
  }
);
```

### Secure Form Handling
```typescript
// frontend/src/components/forms/SecureForm.tsx

import { useCSRFToken } from '../hooks/useCSRFToken';

export function SecureForm({ children, onSubmit }) {
  const { csrfToken, loading } = useCSRFToken();
  
  const handleSubmit = (event) => {
    event.preventDefault();
    
    if (!csrfToken) {
      console.error('CSRF token not available');
      return;
    }
    
    // Add CSRF token to form data
    const formData = new FormData(event.target);
    formData.append('_csrf', csrfToken);
    
    onSubmit(formData);
  };

  if (loading) return <div>Loading security token...</div>;

  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" name="_csrf" value={csrfToken} />
      {children}
    </form>
  );
}
```

## 5. Database Security Configuration

### MongoDB Security Setup
```bash
# Enable MongoDB encryption at rest
# Add to MongoDB configuration file (mongod.conf):

security:
  encryption:
    enableEncryption: true
    encryptionKeyFile: /path/to/keyfile
    
# Create database user with minimal privileges
use sewago
db.createUser({
  user: "sewago_app",
  pwd: "strong_random_password",
  roles: [
    { role: "readWrite", db: "sewago" }
  ]
})
```

### Connection Security
```typescript
// backend/src/config/db.ts - Secure connection configuration

const connectDB = async () => {
  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ssl: process.env.NODE_ENV === 'production',
      sslValidate: true,
      maxPoolSize: 10, // Limit connection pool
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(env.mongoUri, options);
    console.log('✅ Database connected securely');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};
```

## 6. Monitoring & Alerting Setup

### Security Event Monitoring
```typescript
// backend/src/utils/security-monitor.ts

interface SecurityEvent {
  type: 'AUTH_FAILURE' | 'PAYMENT_FRAUD' | 'FILE_VIOLATION' | 'RATE_LIMIT';
  userId?: string;
  ip: string;
  userAgent: string;
  details: any;
  timestamp: Date;
}

export class SecurityMonitor {
  private static events: SecurityEvent[] = [];
  
  static logSecurityEvent(event: SecurityEvent) {
    this.events.push(event);
    
    // Send alert for critical events
    if (this.isCriticalEvent(event)) {
      this.sendSecurityAlert(event);
    }
    
    // Clean up old events (keep last 1000)
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }
  }
  
  private static isCriticalEvent(event: SecurityEvent): boolean {
    const criticalTypes = ['PAYMENT_FRAUD', 'AUTH_FAILURE'];
    return criticalTypes.includes(event.type);
  }
  
  private static sendSecurityAlert(event: SecurityEvent) {
    // Integrate with your alerting system
    console.error('🚨 SECURITY ALERT:', event);
  }
}
```

### Health Check Security
```typescript
// backend/src/routes/health.ts - Add security status

router.get('/security', requireAuth(['admin']), (req, res) => {
  const securityStatus = {
    timestamp: new Date().toISOString(),
    securityMiddleware: process.env.ENABLE_SECURITY_MIDDLEWARE === 'true',
    rateLimiting: true,
    inputValidation: true,
    paymentSecurity: Boolean(process.env.PAYMENT_WEBHOOK_SECRET),
    fileUploadSecurity: true,
    databaseEncryption: process.env.MONGODB_ENCRYPTION_ENABLED === 'true'
  };
  
  res.json(securityStatus);
});
```

## 7. Testing Security Implementation

### Security Test Suite
```bash
# Run security tests
npm run test:security

# Test authentication flows
npm run test:auth

# Test payment security
npm run test:payments

# Test file upload security  
npm run test:uploads
```

### Manual Security Testing
```bash
# Test CSRF protection
curl -X POST http://localhost:4000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{"serviceId": "test"}' \
  # Should return 403 CSRF token invalid

# Test rate limiting
for i in {1..10}; do
  curl -X POST http://localhost:4000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"emailOrPhone": "test", "password": "wrong"}'
done
# Should return 429 after 5 attempts

# Test input validation
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "", "email": "invalid", "password": "weak"}'
# Should return 400 with validation errors
```

## 8. Production Deployment Security

### Pre-Deployment Checklist
```bash
# 1. Validate security configuration
node -e "
  require('./backend/src/config/security-config.ts');
  const validator = new SecurityConfigValidator();
  if (validator.hasErrors()) {
    console.error('Security validation failed');
    process.exit(1);
  }
"

# 2. Run security tests
npm run test:security

# 3. Check for secrets in code
grep -r "password\|secret\|key" . --exclude-dir=node_modules

# 4. Verify environment variables
env | grep -E "(SECRET|PASSWORD|KEY)" | wc -l
# Should show configured secrets

# 5. Test security endpoints
curl https://your-api.railway.app/api/health/security
```

### Post-Deployment Monitoring
```bash
# Monitor security logs
tail -f /var/log/sewago/security.log

# Check security metrics
curl https://your-api.railway.app/api/metrics | grep security

# Verify security headers
curl -I https://your-frontend.vercel.app
```

## 9. Incident Response Procedures

### Security Incident Detection
```typescript
// backend/src/middleware/incident-response.ts

export const detectSecurityIncidents = (req: Request, res: Response, next: NextFunction) => {
  const suspiciousPatterns = [
    /(\<script\>)/i,           // XSS attempts
    /(\$where|\$ne|\$gt)/i,    // NoSQL injection
    /(union|select|insert)/i,   // SQL injection
    /(\.\.\/|\.\.\\)/,         // Path traversal
  ];
  
  const requestData = JSON.stringify({ 
    body: req.body, 
    query: req.query, 
    params: req.params 
  });
  
  const suspiciousActivity = suspiciousPatterns.some(pattern => 
    pattern.test(requestData)
  );
  
  if (suspiciousActivity) {
    SecurityMonitor.logSecurityEvent({
      type: 'SECURITY_VIOLATION',
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      details: { patterns: 'detected', request: req.originalUrl },
      timestamp: new Date()
    });
    
    // Block the request
    return res.status(403).json({ 
      error: 'Suspicious activity detected',
      requestId: res.locals.requestId 
    });
  }
  
  next();
};
```

### Incident Response Playbook
1. **Immediate Response** (< 5 minutes)
   - Identify the threat type and scope
   - Block malicious IPs if applicable
   - Preserve evidence and logs

2. **Assessment** (< 15 minutes)
   - Determine impact and affected systems
   - Check for data compromise
   - Document timeline of events

3. **Containment** (< 30 minutes)
   - Apply security patches if vulnerability exploited
   - Rotate compromised credentials
   - Scale security monitoring

4. **Recovery** (< 2 hours)
   - Restore services if disrupted
   - Verify security controls are functioning
   - Monitor for continued attacks

5. **Post-Incident** (< 24 hours)
   - Conduct incident review meeting
   - Update security procedures
   - Communicate to stakeholders as required

## 10. Ongoing Security Maintenance

### Regular Security Tasks

#### Daily
- [ ] Monitor security alerts and logs
- [ ] Review authentication failure rates
- [ ] Check for unusual payment activity

#### Weekly
- [ ] Review security metrics and trends  
- [ ] Update threat intelligence indicators
- [ ] Test backup and recovery procedures

#### Monthly
- [ ] Run dependency vulnerability scans
- [ ] Review access controls and permissions
- [ ] Update security documentation
- [ ] Conduct security training updates

#### Quarterly
- [ ] Comprehensive security audit
- [ ] Penetration testing assessment
- [ ] Security policy review and updates
- [ ] Disaster recovery testing

### Security Updates & Patches
```bash
# Automated security updates
npm audit fix
npm update

# Check for security advisories
npm audit
```

## Support & Resources

### Security Team Contacts
- **Security Lead**: [security@sewago.app]
- **Incident Response**: [incident@sewago.app]  
- **Security Hotline**: [+977-XXX-XXXX]

### Documentation References
- [OWASP Security Guidelines](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/security/)

### Security Tools & Resources
- **Vulnerability Database**: [National Vulnerability Database](https://nvd.nist.gov/)
- **Security Headers Test**: [securityheaders.com](https://securityheaders.com/)
- **SSL Test**: [SSL Labs](https://www.ssllabs.com/ssltest/)

---

**Document Version**: 1.0  
**Last Updated**: 2025-08-21  
**Next Review**: 2025-09-21  

*This document contains security implementation details and should be accessible only to authorized development team members.*