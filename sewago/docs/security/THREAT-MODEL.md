# SewaGo Security Threat Model

## Executive Summary

This document outlines the security threat model for SewaGo, a Nepal-focused local services marketplace. The analysis identifies key assets, threat actors, attack vectors, and security controls required to protect user data, financial transactions, and business operations.

## Assets & Data Classification

### Critical Assets (High Impact)
- **User PII**: Names, emails, phone numbers, addresses
- **Payment Data**: Transaction details, booking amounts, payment method info
- **Authentication Tokens**: JWT access/refresh tokens, session data
- **Business Logic**: Booking workflows, provider verification, pricing algorithms

### Sensitive Assets (Medium Impact)  
- **Service Content**: Provider service descriptions, pricing, availability
- **Reviews & Ratings**: Customer feedback, photos, service ratings
- **Location Data**: Service areas, provider zones, customer addresses
- **Audit Logs**: Security events, payment transactions, system activity

### Internal Assets (Low-Medium Impact)
- **Configuration**: Environment variables, API keys, database connections
- **Source Code**: Application logic, security implementations
- **Infrastructure**: Server configurations, database schemas, deployment configs

## Threat Actors & Capabilities

### External Threats
1. **Opportunistic Attackers**
   - Capability: Low-Medium (automated tools, known exploits)
   - Motivation: Financial gain, data theft
   - Vectors: SQL injection, XSS, credential stuffing

2. **Organized Cybercriminals**
   - Capability: Medium-High (sophisticated tools, social engineering)
   - Motivation: Payment fraud, identity theft, business disruption
   - Vectors: Advanced persistent threats, payment gateway attacks

3. **Malicious Competitors**
   - Capability: Medium (insider knowledge, targeted attacks)
   - Motivation: Business disruption, reputation damage
   - Vectors: DDoS, data manipulation, fake reviews

### Internal Threats
1. **Malicious Insiders**
   - Capability: High (system access, insider knowledge)
   - Motivation: Financial gain, revenge, data theft
   - Vectors: Data exfiltration, privilege escalation, system sabotage

2. **Compromised Accounts**
   - Capability: Medium (legitimate access credentials)
   - Motivation: Varies (depends on compromised account type)
   - Vectors: Account takeover, unauthorized transactions

## Trust Boundaries & Data Flow

```
[User Browser] ↔ [Vercel/CDN] ↔ [Next.js Frontend] 
                      ↓
[Railway Infrastructure] ↔ [Express Backend] ↔ [MongoDB Atlas]
                      ↓
[Payment Gateways] ↔ [eSewa/Khalti APIs]
                      ↓
[File Storage] ↔ [AWS S3/Compatible Storage]
```

### Trust Boundary Analysis
1. **Browser ↔ Frontend**: HTTPS, CSP, SameSite cookies
2. **Frontend ↔ Backend**: JWT authentication, CORS policies
3. **Backend ↔ Database**: Connection encryption, input validation
4. **Backend ↔ Payment Gateways**: HMAC signature verification
5. **Backend ↔ File Storage**: Presigned URLs, access controls

## High-Risk Attack Vectors

### 1. Authentication & Session Management
**Risk Level**: High
- **Threats**: Credential stuffing, session hijacking, JWT attacks
- **Impact**: Account takeover, unauthorized bookings, data theft
- **Controls**: Multi-factor auth, secure session handling, token rotation

### 2. Payment Processing
**Risk Level**: Critical  
- **Threats**: Transaction manipulation, webhook spoofing, payment fraud
- **Impact**: Financial loss, regulatory violations, business disruption
- **Controls**: HMAC verification, idempotency, amount validation

### 3. Input Validation & Injection
**Risk Level**: High
- **Threats**: NoSQL injection, XSS, command injection
- **Impact**: Data breach, system compromise, malicious code execution
- **Controls**: Zod validation, parameterized queries, output encoding

### 4. File Upload & Storage
**Risk Level**: Medium-High
- **Threats**: Malicious file uploads, path traversal, data exfiltration
- **Impact**: Server compromise, data theft, service disruption
- **Controls**: File type validation, virus scanning, secure storage

### 5. Authorization & Access Control
**Risk Level**: High
- **Threats**: Privilege escalation, IDOR, unauthorized access
- **Impact**: Data breach, unauthorized operations, privacy violations
- **Controls**: Role-based access, resource ownership checks

### 6. API Security
**Risk Level**: Medium-High
- **Threats**: Rate limiting bypass, mass enumeration, API abuse
- **Impact**: Service disruption, data scraping, resource exhaustion
- **Controls**: Rate limiting, API authentication, input validation

## Entry Points & Attack Surface

### Web Application
- **Frontend Routes**: Public pages, authenticated dashboards
- **API Endpoints**: REST APIs, authentication endpoints
- **File Uploads**: Review photo submissions
- **Payment Callbacks**: Webhook endpoints for eSewa/Khalti

### Infrastructure
- **CDN/Edge**: Vercel edge functions, static asset serving
- **Application Server**: Railway Node.js runtime
- **Database**: MongoDB Atlas cluster
- **Storage**: S3-compatible file storage

### Third-Party Integrations
- **Payment Gateways**: eSewa and Khalti webhook endpoints
- **Email Service**: Transactional email providers
- **SMS Service**: OTP and notification services
- **Analytics**: Performance and user behavior tracking

## Risk Matrix & Impact Assessment

| Threat Category | Likelihood | Impact | Risk Score | Mitigation Priority |
|----------------|------------|--------|------------|-------------------|
| Payment Fraud | Medium | Critical | High | P0 |
| Data Breach | Medium | High | High | P0 |
| Account Takeover | High | High | High | P0 |
| Service Disruption | Medium | Medium | Medium | P1 |
| Malicious Uploads | Low | Medium | Medium | P1 |
| API Abuse | High | Low | Medium | P2 |

## Security Controls & Mitigations

### Implemented Controls
1. **Authentication Security**
   - JWT with short expiry and refresh rotation
   - Password complexity requirements
   - Rate limiting on auth endpoints

2. **Input Validation**
   - Zod schema validation on all inputs
   - NoSQL injection prevention
   - XSS protection via sanitization

3. **Transport Security**
   - HTTPS everywhere with HSTS
   - Secure cookie configuration
   - CSP headers implementation

4. **Authorization**
   - Role-based access control
   - Resource ownership verification
   - Admin panel access restrictions

### Recommended Enhancements
1. **Multi-Factor Authentication**
   - SMS/Email OTP for sensitive operations
   - TOTP for admin accounts
   - Risk-based authentication

2. **Advanced Monitoring**
   - Security event logging
   - Anomaly detection
   - Real-time alerting

3. **Payment Security**
   - Transaction monitoring
   - Fraud detection algorithms
   - Webhook signature verification

4. **Infrastructure Hardening**
   - WAF deployment
   - DDoS protection
   - Security scanning automation

## Compliance & Regulatory Considerations

### Nepal Legal Requirements
- **Data Protection**: Personal data handling compliance
- **Financial Regulations**: Payment processing compliance
- **Consumer Protection**: Service booking and dispute resolution

### International Standards
- **PCI DSS**: Payment card data protection (if applicable)
- **GDPR**: European user data protection
- **OWASP**: Web application security standards

## Incident Response Plan

### Immediate Response (0-1 hours)
1. Detect and triage security incidents
2. Isolate affected systems if necessary
3. Preserve evidence and logs
4. Notify key stakeholders

### Short-term Response (1-24 hours)
1. Investigate incident scope and impact
2. Implement temporary mitigations
3. Communicate with affected users
4. Coordinate with third-party services

### Long-term Response (24+ hours)
1. Implement permanent fixes
2. Conduct post-incident review
3. Update security controls
4. Provide incident report

## Security Testing Strategy

### Automated Testing
- **SAST**: Static application security testing
- **DAST**: Dynamic application security testing
- **Dependency Scanning**: Vulnerable package detection
- **Secret Scanning**: Credential leak detection

### Manual Testing
- **Penetration Testing**: Quarterly external assessments
- **Code Review**: Security-focused code reviews
- **Configuration Review**: Infrastructure security audits
- **Social Engineering**: Phishing simulation tests

## Conclusion

SewaGo's security threat model identifies critical risks in payment processing, authentication, and data protection. The recommended security controls provide defense-in-depth protection against identified threats while maintaining usability for legitimate users.

Regular review and updates of this threat model are essential as the application evolves and new threats emerge.

---

**Document Version**: 1.0  
**Last Updated**: August 21, 2025  
**Next Review**: February 21, 2026  
**Owner**: Security Team / Lead Engineer