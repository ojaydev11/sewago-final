import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sewago-test';

// Simple User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'provider', 'admin'], default: 'user' },
  isVerified: { type: Boolean, default: true },
}, { timestamps: true });

// Simple Service Schema  
const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  basePrice: { type: Number, required: true },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  images: [{ type: String }],
  location: { type: String, required: true },
  rating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
}, { timestamps: true });

// Simple Provider Schema
const providerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  verified: { type: Boolean, default: false },
  skills: [{ type: String }],
  zones: [{ type: String }],
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Service = mongoose.model('Service', serviceSchema);
const Provider = mongoose.model('Provider', providerSchema);

async function seedTestData() {
  try {
    console.log('🌱 Starting test data seeding...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Service.deleteMany({});
    await Provider.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Create test users
    const adminHash = await bcrypt.hash('Admin!2345', 12);
    const providerHash = await bcrypt.hash('Pro!2345', 12);
    const customerHash = await bcrypt.hash('Cust!2345', 12);

    const adminUser = await User.create({
      name: 'Test Admin',
      email: 'admin@sewago.test',
      phone: '+9779801234567',
      passwordHash: adminHash,
      role: 'admin',
      isVerified: true,
    });

    const providerUser = await User.create({
      name: 'Test Provider',
      email: 'pro1@sewago.test',
      phone: '+9779801234568',
      passwordHash: providerHash,
      role: 'provider',
      isVerified: true,
    });

    const customerUser = await User.create({
      name: 'Test Customer',
      email: 'cust1@sewago.test',
      phone: '+9779801234569',
      passwordHash: customerHash,
      role: 'user',
      isVerified: true,
    });

    console.log('✅ Created test users');

    // Create provider profile
    const provider = await Provider.create({
      name: 'Test Cleaning Services',
      phone: '+9779801234568',
      verified: true,
      skills: ['house-cleaning', 'electrical-work'],
      zones: ['thamel', 'lazimpat', 'new-baneshwor'],
    });

    console.log('✅ Created provider profile');

    // Create test services
    const houseCleaningService = await Service.create({
      providerId: providerUser._id,
      title: 'Professional House Cleaning',
      category: 'house-cleaning',
      description: 'Complete house cleaning service with experienced professionals',
      basePrice: 2500,
      location: 'Kathmandu',
      images: ['/icons/cleaning.svg'],
      rating: 4.8,
      ratingCount: 156
    });

    const electricalService = await Service.create({
      providerId: providerUser._id,
      title: 'Electrical Repair & Installation',
      category: 'electrical-work',
      description: 'Professional electrical services for homes and offices',
      basePrice: 1500,
      location: 'Kathmandu', 
      images: ['/icons/electrical.svg'],
      rating: 4.6,
      ratingCount: 89
    });

    console.log('✅ Created test services');

    // Create additional customers
    for (let i = 2; i <= 5; i++) {
      await User.create({
        name: `Test Customer ${i}`,
        email: `cust${i}@sewago.test`,
        phone: `+977980123456${i}`,
        passwordHash: await bcrypt.hash('TestCust123!', 12),
        role: 'user',
        isVerified: true,
      });
    }

    console.log('✅ Created additional test customers');
    console.log('🎯 Test data seeding completed successfully!');
    console.log('\n📋 Test Accounts:');
    console.log('Admin: admin@sewago.test / Admin!2345');
    console.log('Provider: pro1@sewago.test / Pro!2345'); 
    console.log('Customer: cust1@sewago.test / Cust!2345');
    console.log('\n🏪 Test Services Available:');
    console.log('- Professional House Cleaning (NPR 2,500)');
    console.log('- Electrical Repair & Installation (NPR 1,500)');

  } catch (error) {
    console.error('❌ Error seeding test data:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  seedTestData().catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
}

export default seedTestData;