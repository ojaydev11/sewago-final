import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { UserModel } from '../backend/src/models/User.js';
import { ServiceModel } from '../backend/src/models/Service.js';
import { ProviderModel } from '../backend/src/models/Provider.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sewago-test';

export async function seedTestData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for seeding');

    // Clear existing test data
    await UserModel.deleteMany({});
    await ServiceModel.deleteMany({});
    await ProviderModel.deleteMany({});
    console.log('Cleared existing test data');

    // Hash passwords
    const adminHash = await bcrypt.hash('Admin!2345', 12);
    const providerHash = await bcrypt.hash('Pro!2345', 12);
    const customerHash = await bcrypt.hash('Cust!2345', 12);

    // Create test users
    const adminUser = await UserModel.create({
      name: 'Test Admin',
      email: 'admin@sewago.test',
      phone: '+9779801234567',
      passwordHash: adminHash,
      role: 'admin',
      isVerified: true,
    });

    const providerUser = await UserModel.create({
      name: 'Test Provider',
      email: 'pro1@sewago.test',
      phone: '+9779801234568',
      passwordHash: providerHash,
      role: 'provider',
      isVerified: true,
    });

    const customerUser = await UserModel.create({
      name: 'Test Customer',
      email: 'cust1@sewago.test',
      phone: '+9779801234569',
      passwordHash: customerHash,
      role: 'user',
      isVerified: true,
    });

    console.log('✅ Created test users:');
    console.log(`Admin: ${adminUser.email}`);
    console.log(`Provider: ${providerUser.email}`);
    console.log(`Customer: ${customerUser.email}`);

    // Create provider profile
    const provider = await ProviderModel.create({
      name: 'Test Cleaning Services',
      phone: '+9779801234568',
      verified: true,
      onTimePct: 95,
      completionPct: 98,
      yearsActive: 5,
      tier: 'PREMIUM',
      skills: ['house-cleaning', 'office-cleaning', 'electrical-work'],
      zones: ['thamel', 'lazimpat', 'new-baneshwor'],
      isOnline: true,
      currentLat: 27.7172,
      currentLng: 85.3240
    });

    // Create test services  
    const houseCleaningService = await ServiceModel.create({
      providerId: providerUser._id, // Use the user ID as provider
      title: 'Professional House Cleaning',
      category: 'house-cleaning',
      description: 'Complete house cleaning service with experienced professionals. Deep cleaning for all rooms, bathrooms, and kitchen using eco-friendly products.',
      basePrice: 2500,
      location: 'Kathmandu',
      images: ['/icons/cleaning.svg'],
      rating: 4.8,
      ratingCount: 156
    });

    const electricalService = await ServiceModel.create({
      providerId: providerUser._id,
      title: 'Electrical Repair & Installation', 
      category: 'electrical-work',
      description: 'Professional electrical services for homes and offices. Licensed electrician with quality guarantee.',
      basePrice: 1500,
      location: 'Kathmandu',
      images: ['/icons/electrical.svg'],
      rating: 4.6,
      ratingCount: 89
    });

    console.log('✅ Created test services:');
    console.log(`House Cleaning: ${houseCleaningService.title}`);
    console.log(`Electrical: ${electricalService.title}`);

    // Create additional customers for testing
    const additionalCustomers = [];
    for (let i = 2; i <= 5; i++) {
      const customer = await UserModel.create({
        name: `Test Customer ${i}`,
        email: `cust${i}@sewago.test`,
        phone: `+977980123456${i}`,
        passwordHash: await bcrypt.hash('TestCust123!', 12),
        role: 'user',
        isVerified: true,
      });
      additionalCustomers.push(customer);
    }

    console.log(`✅ Created ${additionalCustomers.length} additional test customers`);

    console.log('🎯 Test data seeding completed successfully!');
    console.log('\n📋 Test Accounts:');
    console.log('Admin: admin@sewago.test / Admin!2345');
    console.log('Provider: pro1@sewago.test / Pro!2345');
    console.log('Customer: cust1@sewago.test / Cust!2345');
    console.log('\n🏪 Test Services Available:');
    console.log('- Professional House Cleaning (NPR 2,500)');
    console.log('- Electrical Repair & Installation (NPR 1,500)');
    
    return {
      users: { admin: adminUser, provider: providerUser, customer: customerUser },
      services: { houseCleaning: houseCleaningService, electrical: electricalService },
      provider
    };

  } catch (error) {
    console.error('❌ Error seeding test data:', error);
    throw error;
  }
}

// Run directly if called as script
if (require.main === module) {
  seedTestData()
    .then(() => {
      console.log('Seeding completed - disconnecting...');
      mongoose.disconnect();
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      mongoose.disconnect();
      process.exit(1);
    });
}

export default seedTestData;