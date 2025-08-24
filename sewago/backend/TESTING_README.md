# Sajilo Sewa V2 P0 Features Testing Guide

## 🎯 Overview

This guide provides comprehensive testing instructions for all P0 (must-land) features of the Sajilo Sewa V2 system. All features have been implemented and are ready for testing.

## ✅ P0 Features Implementation Status

All P0 features are **100% COMPLETE** and ready for testing:

1. **Enhanced Wallet & Payments System** ✅
2. **Provider KYC + Approval Flow** ✅
3. **Smart Scheduling & Availability** ✅
4. **Enhanced Reviews with Photos** ✅
5. **Real-Time Notifications System** ✅

## 🚀 Quick Start Testing

### 1. Run P0 Features Test Suite

```bash
# Test all P0 features automatically
npm run test:p0
```

This comprehensive test script will:
- Test all P0 features systematically
- Create test data automatically
- Verify database operations
- Clean up test data
- Provide detailed test results

### 2. Manual API Testing

```bash
# Start the backend server
npm run dev

# The server will be available at http://localhost:8001
```

## 🧪 Testing Strategy

### Phase 1: Automated Testing (Recommended First)
- **P0 Features Test Suite**: `npm run test:p0`
- **Unit Tests**: `npm test`
- **Integration Tests**: `npm run test:integration`

### Phase 2: Manual API Testing
- **Postman Collection**: Import the provided collection
- **API Endpoints**: Test all P0 endpoints manually
- **Error Scenarios**: Test edge cases and error handling

### Phase 3: End-to-End Testing
- **E2E Tests**: `npm run test:e2e`
- **Performance Tests**: `npm run test:performance`
- **User Workflows**: Complete user journeys

## 📋 P0 Features Test Checklist

### 1. Enhanced Wallet & Payments System

#### ✅ Test Cases:
- [ ] Wallet creation and balance management
- [ ] Top-up with idempotency (prevent double-spend)
- [ ] Refund processing for cancellable bookings
- [ ] BNPL (Buy Now Pay Later) setup
- [ ] Payout request creation and management
- [ ] Transaction history and CSV export
- [ ] Ledger entry creation and reconciliation

#### 🔗 API Endpoints to Test:
```
POST /wallet/topup          - Top-up wallet
POST /wallet/refund         - Process refunds
GET  /wallet/transactions   - Transaction history
GET  /wallet/export         - CSV export
POST /wallet/setup-bnpl     - BNPL configuration
POST /wallet/payout-request - Provider payout
GET  /wallet/payout-history - Payout history
```

### 2. Provider KYC + Approval Flow

#### ✅ Test Cases:
- [ ] KYC document submission
- [ ] Document validation and storage
- [ ] Admin review workflow
- [ ] KYC approval/rejection
- [ ] Provider badge assignment
- [ ] Business verification
- [ ] Service area configuration

#### 🔗 API Endpoints to Test:
```
POST /kyc/submit                    - Submit KYC
GET  /kyc/status                    - Check status
PATCH /kyc/update                   - Update info
POST /kyc/documents                 - Add documents
DELETE /kyc/documents/:type         - Remove documents
GET  /admin/kyc/pending             - Admin view
POST /admin/kyc/:id/approve        - Approve KYC
POST /admin/kyc/:id/reject         - Reject KYC
```

### 3. Smart Scheduling & Availability

#### ✅ Test Cases:
- [ ] Provider availability configuration
- [ ] Working hours setup
- [ ] Slot generation and availability
- [ ] Slot locking (120-second hold)
- [ ] Conflict detection and resolution
- [ ] Booking rescheduling
- [ ] Timezone handling

#### 🔗 API Endpoints to Test:
```
GET  /providers/:id/slots           - Get available slots
POST /providers/:id/slots/lock      - Lock slot
POST /providers/:id/slots/unlock    - Unlock slot
POST /bookings/:id/reschedule       - Reschedule booking
```

### 4. Enhanced Reviews with Photos

#### ✅ Test Cases:
- [ ] Review creation with photos (max 5)
- [ ] Photo upload and storage
- [ ] EXIF data handling
- [ ] Review moderation workflow
- [ ] Auto-verification system
- [ ] Anti-spam measures
- [ ] Content filtering

#### 🔗 API Endpoints to Test:
```
POST /reviews                       - Create review
GET  /reviews/provider/:id          - Get provider reviews
GET  /reviews/pending-moderation    - Moderation queue
POST /admin/reviews/:id/approve     - Approve review
POST /admin/reviews/:id/reject      - Reject review
POST /reviews/:id/flag              - Flag review
```

### 5. Real-Time Notifications System

#### ✅ Test Cases:
- [ ] Multi-channel notification creation
- [ ] In-app notifications
- [ ] Push notifications
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Delivery tracking
- [ ] User preferences management
- [ ] Notification analytics

#### 🔗 API Endpoints to Test:
```
GET  /notifications                 - Get notifications
PATCH /notifications/:id/read       - Mark as read
PATCH /notifications/read-all       - Mark all read
PATCH /notifications/:id/click      - Mark as clicked
PATCH /notifications/:id/dismiss    - Dismiss notification
GET  /notifications/preferences     - Get preferences
PATCH /notifications/preferences    - Update preferences
POST /notifications/test            - Send test notification
GET  /notifications/stats           - Get statistics
GET  /admin/notifications/stats     - Admin statistics
```

## 🗄️ Database Testing

### Migration Testing
```bash
# Test migration (dry run)
npm run migrate:v2:dry-run

# Run actual migration
npm run migrate:v2

# Validate database
npm run db:validate
```

### Database Operations
- [ ] New collections created (walletledgers, payoutrequests)
- [ ] Enhanced schemas working correctly
- [ ] Indexes created and optimized
- [ ] Data migration completed successfully
- [ ] Audit logging functional

## 🔒 Security Testing

### Authentication & Authorization
- [ ] JWT token validation
- [ ] Role-based access control (User, Provider, Admin)
- [ ] Route protection
- [ ] Rate limiting

### Financial Security
- [ ] Idempotency key validation
- [ ] HMAC signature verification
- [ ] Audit trail completeness
- [ ] Transaction reconciliation

### Data Protection
- [ ] EXIF data stripping
- [ ] Content filtering
- [ ] Input validation
- [ ] SQL injection prevention

## 📊 Performance Testing

### Load Testing
```bash
# Run performance tests
npm run test:performance
```

### Performance Metrics
- [ ] API response time < 300ms (P95)
- [ ] Database query performance
- [ ] Memory usage optimization
- [ ] Connection pooling efficiency

## 🐛 Error Handling Testing

### Test Scenarios
- [ ] Invalid input data
- [ ] Missing required fields
- [ ] Unauthorized access attempts
- [ ] Database connection failures
- [ ] Payment gateway errors
- [ ] File upload failures

### Expected Behaviors
- [ ] Proper error messages
- [ ] HTTP status codes
- [ ] Error logging
- [ ] Graceful degradation

## 📱 Frontend Integration Testing

### UI Components
- [ ] Wallet panel and top-up modal
- [ ] KYC wizard and document upload
- [ ] Availability editor and slot picker
- [ ] Review system with photo uploads
- [ ] Notification center and preferences

### User Experience
- [ ] Mobile-first responsive design
- [ ] Loading states and error handling
- [ ] Form validation and feedback
- [ ] Navigation and routing

## 🚀 Deployment Testing

### Staging Environment
- [ ] Database migration successful
- [ ] All services running
- [ ] Environment variables configured
- [ ] Monitoring and logging active

### Production Readiness
- [ ] Health checks passing
- [ ] Performance benchmarks met
- [ ] Security audit completed
- [ ] Backup and recovery tested

## 📝 Test Results Documentation

### Test Report Template
```markdown
## Test Session: [Date] [Time]
## Tester: [Name]
## Environment: [Staging/Production]

### P0 Features Test Results
1. Enhanced Wallet & Payments: [PASS/FAIL]
2. Provider KYC + Approval: [PASS/FAIL]
3. Smart Scheduling: [PASS/FAIL]
4. Enhanced Reviews: [PASS/FAIL]
5. Real-Time Notifications: [PASS/FAIL]

### Issues Found
- [Issue description and severity]

### Recommendations
- [Action items for fixes]
```

## 🆘 Troubleshooting

### Common Issues
1. **Database Connection**: Check MongoDB URI and network
2. **Migration Errors**: Verify database permissions
3. **Model Methods**: Check for missing method implementations
4. **API Errors**: Verify route configurations

### Support Resources
- **Technical Documentation**: V2_IMPLEMENTATION_SUMMARY.md
- **API Documentation**: Available at `/api/docs` (when implemented)
- **Database Schema**: Models directory
- **Error Logs**: Check console and log files

## 🎉 Success Criteria

### P0 Features Ready When:
- [ ] All automated tests pass (100% success rate)
- [ ] Manual API testing completed successfully
- [ ] Database migration completed without errors
- [ ] Security testing passed
- [ ] Performance benchmarks met
- [ ] Frontend integration verified
- [ ] Documentation updated and complete

---

## 🚀 Ready to Test!

All P0 features are implemented and ready for comprehensive testing. Start with the automated test suite and then proceed with manual testing and frontend integration.

**Next Steps:**
1. Run `npm run test:p0` to verify all features
2. Start backend server with `npm run dev`
3. Test API endpoints manually
4. Begin frontend integration
5. Prepare for production deployment

For questions or support, refer to the implementation summary or contact the development team.
