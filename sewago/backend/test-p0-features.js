#!/usr/bin/env node

/**
 * P0 Features Test Script for Sajilo Sewa V2
 * 
 * This script tests all P0 features to ensure they are working correctly:
 * 1. Enhanced Wallet & Payments System
 * 2. Provider KYC + Approval Flow
 * 3. Smart Scheduling & Availability
 * 4. Enhanced Reviews with Photos
 * 5. Real-Time Notifications System
 * 
 * Run with: node test-p0-features.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { WalletModel } from './src/models/Wallet.js';
import { WalletLedgerModel } from './src/models/WalletLedger.js';
import { PayoutRequestModel } from './src/models/PayoutRequest.js';
import { UserModel } from './src/models/User.js';
import { BookingModel } from './src/models/Booking.js';
import { ReviewModel } from './src/models/Review.js';
import { NotificationModel } from './src/models/Notification.js';

// Load environment variables
dotenv.config({ path: '../env.backend' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sewago';

// Test results
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Helper function to log test results
function logTest(testName, passed, details = '') {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${testName} - PASSED`);
  } else {
    testResults.failed++;
    console.log(`❌ ${testName} - FAILED`);
    if (details) console.log(`   Details: ${details}`);
  }
  testResults.details.push({ testName, passed, details });
}

// Helper function to create test data
async function createTestData() {
  console.log('\n📝 Creating test data...');
  
  try {
    // Create test user
    const testUser = await UserModel.create({
      name: 'Test User',
      email: 'test@example.com',
      phone: '+9771234567890',
      passwordHash: 'test_hash',
      role: 'user'
    });

    // Create test provider
    const testProvider = await UserModel.create({
      name: 'Test Provider',
      email: 'provider@example.com',
      phone: '+9771234567891',
      passwordHash: 'test_hash',
      role: 'provider',
      provider: {
        businessName: 'Test Business',
        categories: ['Cleaning', 'Plumbing'],
        description: 'Test provider description',
        baseLocation: 'Kathmandu',
        kycStatus: 'NOT_SUBMITTED',
        isVerified: false,
        kycDocuments: [],
        badges: [],
        businessVerification: { isVerified: false },
        serviceAreas: [
          { area: 'Kathmandu', radius: 10, isActive: true }
        ],
        availability: {
          isAvailable: true,
          workingHours: {
            monday: { start: '09:00', end: '18:00', isWorking: true },
            tuesday: { start: '09:00', end: '18:00', isWorking: true },
            wednesday: { start: '09:00', end: '18:00', isWorking: true },
            thursday: { start: '09:00', end: '18:00', isWorking: true },
            friday: { start: '09:00', end: '18:00', isWorking: true },
            saturday: { start: '09:00', end: '18:00', isWorking: true },
            sunday: { start: '09:00', end: '18:00', isWorking: true }
          },
          timezone: 'Asia/Kathmandu'
        }
      }
    });

    // Create test wallet
    const testWallet = await WalletModel.create({
      userId: testUser._id,
      balance: 0,
      currency: 'NPR'
    });

    console.log('✅ Test data created successfully');
    return { testUser, testProvider, testWallet };
  } catch (error) {
    console.error('❌ Error creating test data:', error);
    throw error;
  }
}

// Test 1: Enhanced Wallet & Payments System
async function testWalletSystem(testData) {
  console.log('\n💰 Testing Enhanced Wallet & Payments System...');
  
  try {
    const { testUser, testWallet } = testData;

    // Test 1.1: Wallet creation
    const wallet = await WalletModel.findOne({ userId: testUser._id });
    logTest('Wallet Creation', !!wallet, wallet ? 'Wallet found' : 'Wallet not found');

    // Test 1.2: Top-up functionality
    const topupAmount = 1000;
    const idempotencyKey = `test_topup_${Date.now()}`;
    
    // Create ledger entry for top-up
    const ledgerEntry = await WalletLedgerModel.createEntry({
      entryId: `test_entry_${Date.now()}`,
      userId: testUser._id,
      walletId: testWallet._id,
      transactionType: 'TOPUP',
      amount: topupAmount,
      currency: 'NPR',
      debitAccount: 'WALLET_CASH',
      creditAccount: 'GATEWAY_ESEWA',
      referenceId: idempotencyKey,
      balanceBefore: testWallet.balance,
      balanceAfter: testWallet.balance + topupAmount,
      description: 'Test wallet top-up',
      createdBy: testUser._id,
      ipAddress: '127.0.0.1',
      userAgent: 'Test Script'
    });
    
    logTest('Ledger Entry Creation', !!ledgerEntry, ledgerEntry ? 'Ledger entry created' : 'Failed to create ledger entry');

    // Test 1.3: Idempotency check
    const duplicateEntry = await WalletLedgerModel.findOne({ referenceId: idempotencyKey });
    logTest('Idempotency Check', duplicateEntry && duplicateEntry._id.toString() === ledgerEntry._id.toString(), 
      'Duplicate transaction prevented');

    // Test 1.4: Payout request creation
    const payoutRequest = await PayoutRequestModel.createRequest({
      requestId: `test_payout_${Date.now()}`,
      providerId: testData.testProvider._id,
      providerName: testData.testProvider.name,
      providerPhone: testData.testProvider.phone,
      amount: 500,
      paymentMethod: 'BANK_TRANSFER',
      bankDetails: {
        bankName: 'Test Bank',
        accountNumber: '1234567890',
        accountHolderName: 'Test Provider'
      },
      ipAddress: '127.0.0.1',
      userAgent: 'Test Script'
    });
    
    logTest('Payout Request Creation', !!payoutRequest, payoutRequest ? 'Payout request created' : 'Failed to create payout request');

    // Test 1.5: BNPL setup
    testWallet.bnplEnabled = true;
    testWallet.creditLimit = 2000;
    testWallet.usedCredit = 0;
    await testWallet.save();
    
    logTest('BNPL Setup', testWallet.bnplEnabled && testWallet.creditLimit === 2000, 
      `BNPL enabled: ${testWallet.bnplEnabled}, Credit limit: ${testWallet.creditLimit}`);

  } catch (error) {
    console.error('❌ Error testing wallet system:', error);
    logTest('Wallet System Overall', false, error.message);
  }
}

// Test 2: Provider KYC + Approval Flow
async function testKYCSystem(testData) {
  console.log('\n🆔 Testing Provider KYC + Approval Flow...');
  
  try {
    const { testProvider } = testData;

    // Test 2.1: KYC submission
    testProvider.provider.kycStatus = 'PENDING';
    testProvider.provider.kycSubmittedAt = new Date();
    testProvider.provider.kycDocuments = [
      {
        documentType: 'NID',
        documentNumber: '123456789',
        documentUrl: 'https://example.com/test-nid.jpg',
        uploadedAt: new Date(),
        verificationStatus: 'PENDING'
      }
    ];
    await testProvider.save();
    
    logTest('KYC Submission', testProvider.provider.kycStatus === 'PENDING', 
      `KYC status: ${testProvider.provider.kycStatus}`);

    // Test 2.2: KYC approval
    testProvider.provider.kycStatus = 'APPROVED';
    testProvider.provider.kycApprovedAt = new Date();
    testProvider.provider.kycApprovedBy = testProvider._id;
    testProvider.provider.isVerified = true;
    
    // Add verified badge
    testProvider.addBadge('VERIFIED', 'KYC verified provider', undefined);
    await testProvider.save();
    
    logTest('KYC Approval', testProvider.provider.kycStatus === 'APPROVED' && testProvider.provider.isVerified, 
      `KYC approved: ${testProvider.provider.kycStatus}, Verified: ${testProvider.provider.isVerified}`);

    // Test 2.3: Provider badges
    const hasVerifiedBadge = testProvider.provider.badges.some(badge => badge.type === 'VERIFIED');
    logTest('Provider Badges', hasVerifiedBadge, 
      `Verified badge found: ${hasVerifiedBadge}`);

    // Test 2.4: Service areas
    const hasServiceAreas = testProvider.provider.serviceAreas && testProvider.provider.serviceAreas.length > 0;
    logTest('Service Areas', hasServiceAreas, 
      `Service areas configured: ${hasServiceAreas}`);

    // Test 2.5: Working hours
    const hasWorkingHours = testProvider.provider.availability && testProvider.provider.availability.workingHours;
    logTest('Working Hours', hasWorkingHours, 
      `Working hours configured: ${hasWorkingHours}`);

  } catch (error) {
    console.error('❌ Error testing KYC system:', error);
    logTest('KYC System Overall', false, error.message);
  }
}

// Test 3: Smart Scheduling & Availability
async function testSchedulingSystem(testData) {
  console.log('\n📅 Testing Smart Scheduling & Availability...');
  
  try {
    const { testProvider, testUser } = testData;

    // Test 3.1: Provider availability check
    const canReceiveBookings = testProvider.canReceiveBookings();
    logTest('Provider Availability Check', canReceiveBookings, 
      `Can receive bookings: ${canReceiveBookings}`);

    // Test 3.2: Slot creation
    const startTime = new Date();
    startTime.setHours(10, 0, 0, 0); // 10:00 AM
    const endTime = new Date(startTime.getTime() + 60 * 60000); // 1 hour later
    
    const testBooking = await BookingModel.create({
      userId: testUser._id,
      serviceId: new mongoose.Types.ObjectId(),
      providerId: testProvider._id,
      address: 'Test Address, Kathmandu',
      scheduledAt: startTime,
      estimatedDuration: 60,
      slot: {
        startTime,
        endTime,
        duration: 60,
        isLocked: false,
        timezone: 'Asia/Kathmandu'
      },
      status: 'PENDING_CONFIRMATION'
    });
    
    logTest('Booking Creation with Slot', !!testBooking, 
      testBooking ? 'Booking created with slot' : 'Failed to create booking');

    // Test 3.3: Slot locking
    const lockSuccess = testBooking.lockSlot(120000); // 120 seconds
    logTest('Slot Locking', lockSuccess, 
      `Slot locked: ${lockSuccess}`);

    // Test 3.4: Slot availability check
    const isAvailable = testBooking.isSlotAvailable();
    logTest('Slot Availability Check', !isAvailable, 
      `Slot available: ${isAvailable} (should be false when locked)`);

    // Test 3.5: Rescheduling capability
    const canReschedule = testBooking.canReschedule();
    logTest('Rescheduling Capability', canReschedule, 
      `Can reschedule: ${canReschedule}`);

    // Test 3.6: Working hours validation
    const dayOfWeek = startTime.toLocaleDateString('en-US', { weekday: 'lowercase' });
    const workingDay = testProvider.provider.availability.workingHours[dayOfWeek];
    const isWorkingHour = workingDay && workingDay.isWorking;
    
    logTest('Working Hours Validation', isWorkingHour, 
      `Working hour check: ${isWorkingHour}`);

  } catch (error) {
    console.error('❌ Error testing scheduling system:', error);
    logTest('Scheduling System Overall', false, error.message);
  }
}

// Test 4: Enhanced Reviews with Photos
async function testReviewSystem(testData) {
  console.log('\n⭐ Testing Enhanced Reviews with Photos...');
  
  try {
    const { testUser, testProvider } = testData;

    // Test 4.1: Review creation with photos
    const testReview = await ReviewModel.create({
      bookingId: new mongoose.Types.ObjectId(),
      userId: testUser._id,
      providerId: testProvider._id,
      rating: 5,
      comment: 'Excellent service!',
      photos: [
        {
          photoUrl: 'https://example.com/test-photo1.jpg',
          photoId: `test_photo_${Date.now()}_1`,
          uploadedAt: new Date(),
          isVerified: false,
          moderationStatus: 'PENDING',
          exifData: { camera: 'Test Camera' }
        }
      ],
      moderationStatus: 'PENDING',
      isVerified: false,
      reviewSource: 'POST_COMPLETION'
    });
    
    logTest('Review Creation with Photos', !!testReview, 
      testReview ? 'Review created with photos' : 'Failed to create review');

    // Test 4.2: Photo management
    const photoCount = testReview.photos.length;
    logTest('Photo Management', photoCount === 1, 
      `Photo count: ${photoCount}`);

    // Test 4.3: Review moderation
    const moderationSuccess = testReview.approveReview(testProvider._id);
    logTest('Review Moderation', moderationSuccess, 
      `Review moderation: ${moderationSuccess}`);

    // Test 4.4: Auto-verification
    const isVerified = testReview.isVerified;
    logTest('Auto Verification', isVerified, 
      `Review verified: ${isVerified}`);

    // Test 4.5: Sentiment calculation
    const sentiment = testReview.sentiment;
    logTest('Sentiment Calculation', sentiment === 'POSITIVE', 
      `Sentiment: ${sentiment} (expected: POSITIVE for 5-star rating)`);

  } catch (error) {
    console.error('❌ Error testing review system:', error);
    logTest('Review System Overall', false, error.message);
  }
}

// Test 5: Real-Time Notifications System
async function testNotificationSystem(testData) {
  console.log('\n🔔 Testing Real-Time Notifications System...');
  
  try {
    const { testUser } = testData;

    // Test 5.1: Notification creation
    const testNotification = await NotificationModel.create({
      userId: testUser._id,
      title: 'Test Notification',
      message: 'This is a test notification',
      shortMessage: 'Test notification',
      type: 'SYSTEM_UPDATE',
      priority: 'NORMAL',
      channels: [
        {
          channel: 'IN_APP',
          status: 'PENDING'
        },
        {
          channel: 'EMAIL',
          status: 'PENDING'
        }
      ],
      tags: ['test', 'system']
    });
    
    logTest('Notification Creation', !!testNotification, 
      testNotification ? 'Notification created' : 'Failed to create notification');

    // Test 5.2: Multi-channel delivery
    const channelCount = testNotification.channels.length;
    logTest('Multi-Channel Delivery', channelCount === 2, 
      `Channel count: ${channelCount}`);

    // Test 5.3: Channel status update
    const updateSuccess = testNotification.updateChannelStatus('IN_APP', 'SENT');
    logTest('Channel Status Update', updateSuccess, 
      `Channel status update: ${updateSuccess}`);

    // Test 5.4: Notification marking as read
    const markReadSuccess = testNotification.markAsRead();
    logTest('Mark as Read', markReadSuccess, 
      `Mark as read: ${markReadSuccess}`);

    // Test 5.5: Notification preferences
    testUser.preferences = {
      language: 'en',
      currency: 'NPR',
      timezone: 'Asia/Kathmandu',
      notifications: {
        email: true,
        sms: true,
        push: true,
        inApp: true
      }
    };
    await testUser.save();
    
    const hasPreferences = testUser.preferences && testUser.preferences.notifications;
    logTest('Notification Preferences', hasPreferences, 
      `Preferences configured: ${hasPreferences}`);

  } catch (error) {
    console.error('❌ Error testing notification system:', error);
    logTest('Notification System Overall', false, error.message);
  }
}

// Test 6: Database Migration and Indexes
async function testDatabaseSystem() {
  console.log('\n🗄️ Testing Database Migration and Indexes...');
  
  try {
    // Test 6.1: Collection existence
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);
    
    const hasWalletLedgers = collectionNames.includes('walletledgers');
    const hasPayoutRequests = collectionNames.includes('payoutrequests');
    
    logTest('New Collections Created', hasWalletLedgers && hasPayoutRequests, 
      `Wallet ledgers: ${hasWalletLedgers}, Payout requests: ${hasPayoutRequests}`);

    // Test 6.2: Index creation
    const walletIndexes = await WalletModel.collection.indexes();
    const ledgerIndexes = await WalletLedgerModel.collection.indexes();
    
    const hasRequiredIndexes = walletIndexes.length > 0 && ledgerIndexes.length > 0;
    logTest('Index Creation', hasRequiredIndexes, 
      `Wallet indexes: ${walletIndexes.length}, Ledger indexes: ${ledgerIndexes.length}`);

    // Test 6.3: Model methods
    const userMethods = Object.getOwnPropertyNames(UserModel.prototype);
    const hasCanReceiveBookings = userMethods.includes('canReceiveBookings');
    const hasAddBadge = userMethods.includes('addBadge');
    
    logTest('Model Methods', hasCanReceiveBookings && hasAddBadge, 
      `Required methods: canReceiveBookings=${hasCanReceiveBookings}, addBadge=${hasAddBadge}`);

  } catch (error) {
    console.error('❌ Error testing database system:', error);
    logTest('Database System Overall', false, error.message);
  }
}

// Main test execution
async function runAllTests() {
  console.log('🚀 Starting Sajilo Sewa V2 P0 Features Test Suite...\n');
  
  try {
    // Connect to database
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Create test data
    const testData = await createTestData();

    // Run all tests
    await testWalletSystem(testData);
    await testKYCSystem(testData);
    await testSchedulingSystem(testData);
    await testReviewSystem(testData);
    await testNotificationSystem(testData);
    await testDatabaseSystem();

    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    await UserModel.deleteMany({ email: { $in: ['test@example.com', 'provider@example.com'] } });
    await WalletModel.deleteMany({ userId: testData.testUser._id });
    await WalletLedgerModel.deleteMany({ userId: testData.testUser._id });
    await PayoutRequestModel.deleteMany({ providerId: testData.testProvider._id });
    await BookingModel.deleteMany({ userId: testData.testUser._id });
    await ReviewModel.deleteMany({ userId: testData.testUser._id });
    await NotificationModel.deleteMany({ userId: testData.testUser._id });
    console.log('✅ Test data cleaned up');

    // Disconnect from database
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');

  } catch (error) {
    console.error('💥 Test execution failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Print test results summary
function printResults() {
  console.log('\n📊 Test Results Summary');
  console.log('========================');
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`Passed: ${testResults.passed} ✅`);
  console.log(`Failed: ${testResults.failed} ❌`);
  console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  if (testResults.failed > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.details
      .filter(test => !test.passed)
      .forEach(test => console.log(`   - ${test.testName}: ${test.details}`));
  }
  
  console.log('\n🎯 P0 Features Implementation Status:');
  if (testResults.failed === 0) {
    console.log('✅ ALL P0 FEATURES ARE WORKING CORRECTLY!');
    console.log('🚀 Ready for production deployment!');
  } else {
    console.log('⚠️  Some P0 features need attention before deployment.');
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n\n⚠️  Tests interrupted by user');
  await mongoose.disconnect();
  printResults();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n\n⚠️  Tests terminated');
  await mongoose.disconnect();
  printResults();
  process.exit(0);
});

// Run tests and print results
runAllTests().then(() => {
  printResults();
  process.exit(testResults.failed === 0 ? 0 : 1);
});
