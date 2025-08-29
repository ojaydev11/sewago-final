#!/usr/bin/env node

/**
 * Database Migration Script for Sajilo Sewa V2 PRD
 * 
 * This script handles:
 * - Creating new collections (WalletLedger, PayoutRequest)
 * - Updating existing collections with new fields
 * - Backfilling data where necessary
 * - Creating indexes for performance
 * 
 * Run with: node scripts/migrate-v2.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { WalletModel } from '../src/models/Wallet.js';
import { WalletLedgerModel } from '../src/models/WalletLedger.js';
import { PayoutRequestModel } from '../src/models/PayoutRequest.js';
import { UserModel } from '../src/models/User.js';
import { BookingModel } from '../src/models/Booking.js';
import { ReviewModel } from '../src/models/Review.js';
import { NotificationModel } from '../src/models/Notification.js';

// Load environment variables
dotenv.config({ path: '../env.backend' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sewago';

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

async function disconnectDB() {
  try {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error disconnecting from MongoDB:', error);
  }
}

async function createCollections() {
  console.log('\n📦 Creating new collections...');
  
  try {
    // Create WalletLedger collection
    await mongoose.connection.createCollection('walletledgers');
    console.log('✅ Created walletledgers collection');
    
    // Create PayoutRequest collection
    await mongoose.connection.createCollection('payoutrequests');
    console.log('✅ Created payoutrequests collection');
    
  } catch (error) {
    console.log('ℹ️  Collections may already exist:', error.message);
  }
}

async function createIndexes() {
  console.log('\n🔍 Creating indexes...');
  
  try {
    // WalletLedger indexes
    await WalletLedgerModel.createIndexes();
    console.log('✅ Created WalletLedger indexes');
    
    // PayoutRequest indexes
    await PayoutRequestModel.createIndexes();
    console.log('✅ Created PayoutRequest indexes');
    
    // Update existing model indexes
    await WalletModel.createIndexes();
    await UserModel.createIndexes();
    await BookingModel.createIndexes();
    await ReviewModel.createIndexes();
    await NotificationModel.createIndexes();
    
    console.log('✅ Updated existing model indexes');
    
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
  }
}

async function migrateWalletData() {
  console.log('\n💰 Migrating wallet data...');
  
  try {
    const wallets = await WalletModel.find({});
    let migratedCount = 0;
    
    for (const wallet of wallets) {
      let needsUpdate = false;
      
      // Add missing fields if they don't exist
      if (!wallet.transactions) {
        wallet.transactions = [];
        needsUpdate = true;
      }
      
      if (!wallet.auditLog) {
        wallet.auditLog = [];
        needsUpdate = true;
      }
      
      // Update transaction structure if needed
      for (const transaction of wallet.transactions) {
        if (!transaction.referenceId) {
          transaction.referenceId = `legacy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          needsUpdate = true;
        }
        
        if (!transaction.status) {
          transaction.status = 'COMPLETED';
          needsUpdate = true;
        }
      }
      
      if (needsUpdate) {
        await wallet.save();
        migratedCount++;
      }
    }
    
    console.log(`✅ Migrated ${migratedCount} wallets`);
    
  } catch (error) {
    console.error('❌ Error migrating wallet data:', error);
  }
}

async function migrateUserData() {
  console.log('\n👤 Migrating user data...');
  
  try {
    const users = await UserModel.find({});
    let migratedCount = 0;
    
    for (const user of users) {
      let needsUpdate = false;
      
      // Initialize provider object if it doesn't exist
      if (!user.provider) {
        user.provider = {
          kycStatus: 'NOT_SUBMITTED',
          isVerified: false,
          kycDocuments: [],
          badges: [],
          businessVerification: {
            isVerified: false
          },
          serviceAreas: [],
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
        };
        needsUpdate = true;
      }
      
      // Initialize profile if it doesn't exist
      if (!user.profile) {
        user.profile = {
          country: 'Nepal'
        };
        needsUpdate = true;
      }
      
      // Initialize preferences if they don't exist
      if (!user.preferences) {
        user.preferences = {
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
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await user.save();
        migratedCount++;
      }
    }
    
    console.log(`✅ Migrated ${migratedCount} users`);
    
  } catch (error) {
    console.error('❌ Error migrating user data:', error);
  }
}

async function migrateBookingData() {
  console.log('\n📅 Migrating booking data...');
  
  try {
    const bookings = await BookingModel.find({});
    let migratedCount = 0;
    
    for (const booking of bookings) {
      let needsUpdate = false;
      
      // Add slot information if it doesn't exist
      if (!booking.slot && booking.scheduledAt) {
        const startTime = new Date(booking.scheduledAt);
        const endTime = new Date(startTime.getTime() + (booking.estimatedDuration || 60) * 60000);
        
        booking.slot = {
          startTime,
          endTime,
          duration: booking.estimatedDuration || 60,
          isLocked: false,
          timezone: 'Asia/Kathmandu'
        };
        needsUpdate = true;
      }
      
      // Add rescheduling information if it doesn't exist
      if (!booking.rescheduling) {
        booking.rescheduling = {
          isRescheduled: false,
          rescheduleCount: 0,
          maxReschedules: 3
        };
        needsUpdate = true;
      }
      
      // Add conflicts array if it doesn't exist
      if (!booking.conflicts) {
        booking.conflicts = [];
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await booking.save();
        migratedCount++;
      }
    }
    
    console.log(`✅ Migrated ${migratedCount} bookings`);
    
  } catch (error) {
    console.error('❌ Error migrating booking data:', error);
  }
}

async function migrateReviewData() {
  console.log('\n⭐ Migrating review data...');
  
  try {
    const reviews = await ReviewModel.find({});
    let migratedCount = 0;
    
    for (const review of reviews) {
      let needsUpdate = false;
      
      // Convert old mediaUrls to new photos structure
      if (review.mediaUrls && review.mediaUrls.length > 0) {
        review.photos = review.mediaUrls.map((url, index) => ({
          photoUrl: url,
          photoId: `migrated_${Date.now()}_${index}`,
          uploadedAt: review.createdAt || new Date(),
          isVerified: false,
          moderationStatus: 'PENDING',
          exifData: {}
        }));
        
        // Remove old field
        delete review.mediaUrls;
        needsUpdate = true;
      }
      
      // Initialize photos array if it doesn't exist
      if (!review.photos) {
        review.photos = [];
      }
      
      // Add missing fields
      if (!review.moderationStatus) {
        review.moderationStatus = review.photos.length > 0 ? 'PENDING' : 'APPROVED';
        needsUpdate = true;
      }
      
      if (!review.isVerified) {
        review.isVerified = review.photos.length === 0;
        needsUpdate = true;
      }
      
      if (!review.auditLog) {
        review.auditLog = [];
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await review.save();
        migratedCount++;
      }
    }
    
    console.log(`✅ Migrated ${migratedCount} reviews`);
    
  } catch (error) {
    console.error('❌ Error migrating review data:', error);
  }
}

async function migrateNotificationData() {
  console.log('\n🔔 Migrating notification data...');
  
  try {
    const notifications = await NotificationModel.find({});
    let migratedCount = 0;
    
    for (const notification of notifications) {
      let needsUpdate = false;
      
      // Convert old structure to new structure
      if (notification.channel && !notification.channels) {
        notification.channels = [{
          channel: notification.channel,
          status: notification.sentAt ? 'DELIVERED' : 'PENDING',
          sentAt: notification.sentAt,
          deliveredAt: notification.sentAt,
          retryCount: 0,
          maxRetries: 3
        }];
        
        // Remove old fields
        delete notification.channel;
        delete notification.sentAt;
        needsUpdate = true;
      }
      
      // Add missing fields
      if (!notification.title) {
        notification.title = notification.message || 'Notification';
        needsUpdate = true;
      }
      
      if (!notification.priority) {
        notification.priority = 'NORMAL';
        needsUpdate = true;
      }
      
      if (!notification.deliveryStatus) {
        notification.deliveryStatus = 'PENDING';
        needsUpdate = true;
      }
      
      if (!notification.tags) {
        notification.tags = [];
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await notification.save();
        migratedCount++;
      }
    }
    
    console.log(`✅ Migrated ${migratedCount} notifications`);
    
  } catch (error) {
    console.error('❌ Error migrating notification data:', error);
  }
}

async function backfillWalletLedgers() {
  console.log('\n📊 Backfilling wallet ledgers...');
  
  try {
    const wallets = await WalletModel.find({});
    let createdCount = 0;
    
    for (const wallet of wallets) {
      // Create ledger entries for existing transactions
      for (const transaction of wallet.transactions) {
        try {
          await WalletLedgerModel.createEntry({
            entryId: `backfill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId: wallet.userId,
            walletId: wallet._id,
            transactionType: transaction.type === 'CREDIT' ? 'TOPUP' : 'BOOKING_PAYMENT',
            amount: transaction.amount,
            currency: 'NPR',
            debitAccount: transaction.type === 'CREDIT' ? 'WALLET_CASH' : 'BOOKING_PAYMENT',
            creditAccount: transaction.type === 'CREDIT' ? 'LEGACY_CREDIT' : 'WALLET_CASH',
            referenceId: transaction.referenceId || `legacy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            balanceBefore: 0, // We don't have historical balance data
            balanceAfter: transaction.amount,
            description: transaction.description || 'Legacy transaction',
            status: 'RECONCILED',
            metadata: { migrated: true, originalTransaction: transaction._id },
            createdBy: wallet.userId,
            ipAddress: '127.0.0.1',
            userAgent: 'Migration Script'
          });
          
          createdCount++;
        } catch (error) {
          console.log(`⚠️  Skipping duplicate ledger entry for transaction ${transaction._id}`);
        }
      }
    }
    
    console.log(`✅ Created ${createdCount} ledger entries`);
    
  } catch (error) {
    console.error('❌ Error backfilling wallet ledgers:', error);
  }
}

async function validateMigration() {
  console.log('\n🔍 Validating migration...');
  
  try {
    // Check collection counts
    const walletCount = await WalletModel.countDocuments();
    const ledgerCount = await WalletLedgerModel.countDocuments();
    const userCount = await UserModel.countDocuments();
    const bookingCount = await BookingModel.countDocuments();
    const reviewCount = await ReviewModel.countDocuments();
    const notificationCount = await NotificationModel.countDocuments();
    
    console.log('📊 Collection counts:');
    console.log(`   Wallets: ${walletCount}`);
    console.log(`   Wallet Ledgers: ${ledgerCount}`);
    console.log(`   Users: ${userCount}`);
    console.log(`   Bookings: ${bookingCount}`);
    console.log(`   Reviews: ${reviewCount}`);
    console.log(`   Notifications: ${notificationCount}`);
    
    // Check for required fields
    const walletsWithoutAudit = await WalletModel.countDocuments({ 'auditLog.0': { $exists: false } });
    const usersWithoutKYC = await UserModel.countDocuments({ 'provider.kycStatus': { $exists: false } });
    const bookingsWithoutSlot = await BookingModel.countDocuments({ 'slot.startTime': { $exists: false } });
    
    console.log('\n🔍 Validation results:');
    console.log(`   Wallets without audit log: ${walletsWithoutAudit}`);
    console.log(`   Users without KYC status: ${usersWithoutKYC}`);
    console.log(`   Bookings without slot info: ${bookingsWithoutSlot}`);
    
    if (walletsWithoutAudit === 0 && usersWithoutKYC === 0 && bookingsWithoutSlot === 0) {
      console.log('✅ Migration validation passed');
    } else {
      console.log('⚠️  Some data may need manual review');
    }
    
  } catch (error) {
    console.error('❌ Error validating migration:', error);
  }
}

async function main() {
  console.log('🚀 Starting Sajilo Sewa V2 Database Migration...\n');
  
  try {
    await connectDB();
    
    // Run migration steps
    await createCollections();
    await createIndexes();
    await migrateWalletData();
    await migrateUserData();
    await migrateBookingData();
    await migrateReviewData();
    await migrateNotificationData();
    await backfillWalletLedgers();
    await validateMigration();
    
    console.log('\n🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  } finally {
    await disconnectDB();
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n\n⚠️  Migration interrupted by user');
  await disconnectDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n\n⚠️  Migration terminated');
  await disconnectDB();
  process.exit(0);
});

// Run migration
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
