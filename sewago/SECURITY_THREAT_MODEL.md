# SewaGo Security Threat Model & Analysis

**Date**: 2025-08-21  
**Version**: 1.0  
**Analyst**: Sentinel Security Agent  

## Executive Summary

This document outlines the comprehensive threat model for SewaGo, a mobile-first web application for local services connecting customers with service providers. The application consists of a Next.js frontend, Node.js/Express backend, MongoDB database, and integrates with Nepalese payment gateways (eSewa/Khalti).

## Application Architecture

### Technology Stack
- **Frontend**: Next.js 15.4.6, TypeScript, Vercel deployment
- **Backend**: Node.js/Express 5.1.0, TypeScript, Railway deployment  
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with refresh tokens
- **Payment**: eSewa and Khalti integration
- **File Storage**: S3-compatible storage for review photos
- **Real-time**: Socket.io for chat and notifications

### Key Components
1. User Management (Customer, Provider, Admin roles)
2. Service Booking System
3. Payment Processing
4. File Upload System
5. Real-time Chat & Notifications
6. Administrative Dashboard

## Threat Model Overview

### Assets Identification
1. **High Value Assets**
   - User personal data (PII)
   - Payment information and transaction records
   - Provider verification documents
   - Business logic and proprietary algorithms
   - Authentication credentials and tokens

2. **Medium Value Assets**
   - Service booking history
   - Chat messages and communications
   - Review and rating data
   - System configuration and environment variables

### Trust Boundaries
1. **Frontend ↔ Backend API**: HTTP/HTTPS communication with JWT authentication
2. **Backend ↔ Database**: Mongoose ORM with connection string authentication
3. **Application ↔ Payment Gateways**: External API integration
4. **Application ↔ File Storage**: S3-compatible storage with presigned URLs
5. **Client ↔ WebSocket**: Real-time communication channel

## Threat Analysis by Component

### 1. Authentication & Authorization

#### Threats Identified
- **T1.1** JWT token exposure and manipulation
- **T1.2** Weak password policies
- **T1.3** Session fixation attacks
- **T1.4** Brute force attacks on login endpoints
- **T1.5** Privilege escalation between roles

#### Current Mitigations
- JWT with short-lived access tokens (15 min) and refresh tokens
- Rate limiting on login endpoints (5 requests/min)
- Helmet.js for security headers
- bcrypt for password hashing

#### Risk Assessment
- **T1.1**: MEDIUM - Tokens stored in memory, but no secure HTTP-only cookies
- **T1.2**: HIGH - No password complexity requirements observed
- **T1.3**: LOW - JWT stateless approach mitigates session fixation
- **T1.4**: LOW - Rate limiting implemented
- **T1.5**: MEDIUM - Role-based access control present but needs audit

### 2. Payment Processing

#### Threats Identified  
- **T2.1** Payment gateway webhook manipulation
- **T2.2** Race conditions in payment verification
- **T2.3** Amount tampering in payment requests
- **T2.4** Replay attacks on payment confirmations
- **T2.5** PCI compliance violations

#### Current Mitigations
- Stub implementation for development (not production-ready)
- Basic rate limiting on payment endpoints

#### Risk Assessment
- **T2.1**: HIGH - No webhook signature verification observed
- **T2.2**: HIGH - No proper payment state management
- **T2.3**: HIGH - Client-side amount validation only
- **T2.4**: HIGH - No nonce or idempotency keys
- **T2.5**: MEDIUM - No direct card data handling

### 3. File Upload & Storage

#### Threats Identified
- **T3.1** Malicious file upload (executable, oversized)
- **T3.2** Path traversal attacks
- **T3.3** Unauthorized access to uploaded files
- **T3.4** S3 bucket misconfiguration
- **T3.5** Server-side request forgery via file URLs

#### Current Mitigations  
- Multer middleware for file handling
- S3-compatible storage with AWS SDK

#### Risk Assessment
- **T3.1**: HIGH - No file type validation or scanning observed
- **T3.2**: MEDIUM - Using UUID for file names
- **T3.3**: MEDIUM - Depends on S3 bucket policies
- **T3.4**: HIGH - Bucket configuration not audited
- **T3.5**: HIGH - No URL validation for presigned URLs

### 4. Database Security

#### Threats Identified
- **T4.1** NoSQL injection attacks
- **T4.2** Database connection exposure
- **T4.3** Insufficient access controls
- **T4.4** Data exposure through error messages
- **T4.5** Lack of encryption at rest

#### Current Mitigations
- Custom MongoDB sanitization middleware
- Mongoose ODM for query building
- Connection string in environment variables

#### Risk Assessment
- **T4.1**: LOW - Good sanitization implementation
- **T4.2**: MEDIUM - Connection string in env vars
- **T4.3**: MEDIUM - MongoDB access controls need review
- **T4.4**: LOW - Generic error messages in production
- **T4.5**: HIGH - No encryption at rest configured

### 5. API Security

#### Threats Identified
- **T5.1** Cross-site request forgery (CSRF)
- **T5.2** Cross-site scripting (XSS)
- **T5.3** API rate limiting bypass
- **T5.4** Information disclosure via endpoints
- **T5.5** Mass assignment vulnerabilities

#### Current Mitigations
- CORS configuration with specific origins
- XSS-clean middleware (disabled in dev)
- Express rate limiting
- Helmet.js security headers
- Request/response logging with request IDs

#### Risk Assessment
- **T5.1**: MEDIUM - SameSite cookies not configured
- **T5.2**: LOW - XSS-clean implemented  
- **T5.3**: LOW - Multiple rate limit tiers
- **T5.4**: MEDIUM - Detailed error responses in development
- **T5.5**: HIGH - No input validation schema observed

## Critical Security Gaps

### 1. Input Validation & Sanitization
- **Issue**: No centralized input validation using schemas (Zod available but not implemented)
- **Impact**: Mass assignment, injection attacks, data corruption
- **Priority**: HIGH

### 2. Payment Security
- **Issue**: Payment implementation is stub-only, missing production security controls
- **Impact**: Financial fraud, unauthorized transactions  
- **Priority**: CRITICAL

### 3. File Upload Security
- **Issue**: No file type validation, size limits, or malware scanning
- **Impact**: Remote code execution, storage abuse
- **Priority**: HIGH

### 4. Environment Security
- **Issue**: Default JWT secrets in development, sensitive data in logs
- **Impact**: Token forgery, credential exposure
- **Priority**: HIGH

### 5. Database Security
- **Issue**: No encryption at rest, minimal access controls
- **Impact**: Data breach, unauthorized access
- **Priority**: HIGH

## Recommended Security Controls

### Immediate Actions (Critical)
1. Implement proper payment webhook verification
2. Add comprehensive input validation using Zod schemas
3. Configure file upload restrictions and validation
4. Rotate and secure JWT secrets
5. Enable MongoDB encryption at rest

### Short Term (High Priority)
1. Implement CSRF protection tokens
2. Add API endpoint input validation
3. Configure secure session management
4. Audit and harden S3 bucket policies
5. Implement security logging and monitoring

### Medium Term (Medium Priority)  
1. Add Web Application Firewall (WAF)
2. Implement API versioning and deprecation
3. Add database query optimization and indexing
4. Configure automated security scanning in CI/CD
5. Implement proper error handling and logging

## Compliance Considerations

### Data Privacy
- GDPR compliance for user data handling
- Local data protection regulations (Nepal)
- Right to deletion and data portability

### Payment Security
- PCI DSS compliance requirements
- Nepal Rastra Bank regulations
- Payment gateway compliance standards

### Security Standards
- OWASP Top 10 mitigation
- ISO 27001 security controls
- Industry best practices for fintech applications

## Testing Strategy

### Automated Testing
- Dependency vulnerability scanning
- SAST (Static Application Security Testing)
- DAST (Dynamic Application Security Testing)
- Container security scanning

### Manual Testing
- Authentication flow testing
- Payment integration security testing  
- File upload boundary testing
- API endpoint security testing

## Monitoring & Incident Response

### Security Monitoring
- Authentication anomaly detection
- Payment fraud detection
- File upload monitoring
- API abuse detection

### Incident Response
- Security incident classification
- Breach notification procedures
- Recovery and remediation plans
- Post-incident review process

---

**Next Steps**: Execute automated security scanning and implement critical security controls based on findings.