import { dbConnect } from '../src/lib/mongodb';
import { User } from '../src/models/User';
import { Service } from '../src/models/Service';
import { ProviderProfile } from '../src/models/ProviderProfile';
import { Address } from '../src/models/Address';
import { Booking } from '../src/models/Booking';
import { Review } from '../src/models/Review';
import bcrypt from 'bcryptjs';

async function seedDatabase() {
  try {
    console.log('🌱 Starting MongoDB seeding...');
    
    // Connect to database
    const connection = await dbConnect();
    if (!connection) {
      throw new Error('Failed to connect to MongoDB');
    }
    
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Service.deleteMany({}),
      ProviderProfile.deleteMany({}),
      Address.deleteMany({}),
      Booking.deleteMany({}),
      Review.deleteMany({}),
    ]);
    
    console.log('🧹 Cleared existing data');

    // Create sample services
    const services = [
      {
        title: 'Plumbing Repair',
        slug: 'plumbing-repair',
        description: 'Professional plumbing repair services for homes and businesses. We handle leaks, clogs, pipe repairs, and more.',
        category: 'Plumbing',
        imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
        priceRange: { min: 1500, max: 8000 },
        isActive: true,
      },
      {
        title: 'Electrical Installation',
        slug: 'electrical-installation',
        description: 'Safe and reliable electrical installation services. From new wiring to fixture installation, we ensure your safety.',
        category: 'Electrical',
        imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop',
        priceRange: { min: 2000, max: 15000 },
        isActive: true,
      },
      {
        title: 'House Cleaning',
        slug: 'house-cleaning',
        description: 'Comprehensive house cleaning services. Regular cleaning, deep cleaning, and move-in/move-out cleaning available.',
        category: 'Cleaning',
        imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
        priceRange: { min: 1000, max: 5000 },
        isActive: true,
      },
      {
        title: 'Moving Assistance',
        slug: 'moving-assistance',
        description: 'Professional moving services. We help with packing, loading, transportation, and unloading of your belongings.',
        category: 'Moving',
        imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
        priceRange: { min: 3000, max: 20000 },
        isActive: true,
      },
      {
        title: 'Home Repairs',
        slug: 'home-repairs',
        description: 'General home repair and maintenance services. Fixing everything from drywall to doors and windows.',
        category: 'Repairs',
        imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
        priceRange: { min: 1000, max: 10000 },
        isActive: true,
      },
      {
        title: 'Landscaping',
        slug: 'landscaping',
        description: 'Professional landscaping services. Garden design, maintenance, tree trimming, and outdoor beautification.',
        category: 'Landscaping',
        imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
        priceRange: { min: 2000, max: 25000 },
        isActive: true,
      },
      {
        title: 'Painting Services',
        slug: 'painting-services',
        description: 'Interior and exterior painting services. Professional painters with attention to detail and quality finishes.',
        category: 'Painting',
        imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
        priceRange: { min: 1500, max: 12000 },
        isActive: true,
      },
      {
        title: 'Carpentry Work',
        slug: 'carpentry-work',
        description: 'Custom carpentry services. Furniture repair, custom woodwork, and structural carpentry solutions.',
        category: 'Carpentry',
        imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
        priceRange: { min: 2000, max: 15000 },
        isActive: true,
      },
    ];

    console.log('📦 Creating services...');
    const createdServices = await Service.insertMany(services);
    console.log(`✅ Created ${createdServices.length} services`);

    // Create sample users
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const users = [
      {
        name: 'John Doe',
        email: 'john.doe@example.com',
        passwordHash: hashedPassword,
        role: 'CUSTOMER',
        phone: '+977-9841234567',
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        passwordHash: hashedPassword,
        role: 'CUSTOMER',
        phone: '+977-9841234568',
      },
      {
        name: 'Mike Johnson',
        email: 'mike.provider@example.com',
        passwordHash: hashedPassword,
        role: 'PROVIDER',
        phone: '+977-9841234569',
      },
      {
        name: 'Sarah Wilson',
        email: 'sarah.provider@example.com',
        passwordHash: hashedPassword,
        role: 'PROVIDER',
        phone: '+977-9841234570',
      },
    ];

    console.log('👥 Creating users...');
    const createdUsers = await User.insertMany(users);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Create provider profiles
    const providerProfiles = [
      {
        userId: createdUsers.find(u => u.email === 'mike.provider@example.com')!._id,
        bio: 'Experienced plumber with 8 years of experience. Specializing in residential and commercial plumbing repairs.',
        specialties: ['Plumbing', 'Repairs'],
        experience: 8,
        rating: 4.8,
        totalJobs: 45,
        isVerified: true,
        phone: '+977-9841234569',
        city: 'Kathmandu',
        state: 'Bagmati',
      },
      {
        userId: createdUsers.find(u => u.email === 'sarah.provider@example.com')!._id,
        bio: 'Professional cleaner with attention to detail. Providing thorough cleaning services for homes and offices.',
        specialties: ['Cleaning', 'Housekeeping'],
        experience: 5,
        rating: 4.9,
        totalJobs: 32,
        isVerified: true,
        phone: '+977-9841234570',
        city: 'Lalitpur',
        state: 'Bagmati',
      },
    ];

    console.log('🏢 Creating provider profiles...');
    const createdProviderProfiles = await ProviderProfile.insertMany(providerProfiles);
    console.log(`✅ Created ${createdProviderProfiles.length} provider profiles`);

    // Create sample addresses
    const addresses = [
      {
        userId: createdUsers.find(u => u.email === 'john.doe@example.com')!._id,
        street: '123 Main Street',
        city: 'Kathmandu',
        state: 'Bagmati',
        postalCode: '44600',
        country: 'Nepal',
        isDefault: true,
      },
      {
        userId: createdUsers.find(u => u.email === 'jane.smith@example.com')!._id,
        street: '456 Oak Avenue',
        city: 'Lalitpur',
        state: 'Bagmati',
        postalCode: '44700',
        country: 'Nepal',
        isDefault: true,
      },
    ];

    console.log('📍 Creating addresses...');
    const createdAddresses = await Address.insertMany(addresses);
    console.log(`✅ Created ${createdAddresses.length} addresses`);

    // Create sample bookings
    const johnUser = createdUsers.find(u => u.email === 'john.doe@example.com')!;
    const mikeProvider = createdProviderProfiles.find(p => p.userId.toString() === johnUser._id.toString())!;
    const plumbingService = createdServices.find(s => s.slug === 'plumbing-repair')!;
    const johnAddress = createdAddresses.find(a => a.userId.toString() === johnUser._id.toString())!;

    if (johnUser && plumbingService && johnAddress) {
      const bookings = [
        {
          userId: johnUser._id,
          serviceId: plumbingService._id,
          providerId: mikeProvider._id,
          status: 'COMPLETED',
          scheduledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          address: {
            street: johnAddress.street,
            city: johnAddress.city,
            state: johnAddress.state,
            postalCode: johnAddress.postalCode,
            country: johnAddress.country,
          },
          notes: 'Kitchen sink is clogged, need urgent repair',
          priceEstimateMin: 2000,
          priceEstimateMax: 3500,
        },
        {
          userId: johnUser._id,
          serviceId: plumbingService._id,
          providerId: mikeProvider._id,
          status: 'CONFIRMED',
          scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
          address: {
            street: johnAddress.street,
            city: johnAddress.city,
            state: johnAddress.state,
            postalCode: johnAddress.postalCode,
            country: johnAddress.country,
          },
          notes: 'Bathroom faucet replacement',
          priceEstimateMin: 1500,
          priceEstimateMax: 2500,
        },
      ];

      console.log('📅 Creating sample bookings...');
      const createdBookings = await Booking.insertMany(bookings);
      console.log(`✅ Created ${createdBookings.length} sample bookings`);

      // Create sample reviews for completed bookings
      const completedBookings = createdBookings.filter(b => b.status === 'COMPLETED');
      
      console.log('⭐ Creating sample reviews...');
      for (const booking of completedBookings) {
        await Review.create({
          userId: booking.userId,
          serviceId: booking.serviceId,
          bookingId: booking._id,
          rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
          comment: `Great service! Plumbing repair was completed professionally and on time.`,
        });
      }
      console.log(`✅ Created ${completedBookings.length} sample reviews`);
    }

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📋 Sample Data Created:');
    console.log(`- ${createdServices.length} services`);
    console.log(`- ${createdUsers.length} users`);
    console.log(`- ${createdProviderProfiles.length} provider profiles`);
    console.log(`- ${createdAddresses.length} addresses`);
    console.log('\n🔑 Test Accounts:');
    console.log('Customer: john.doe@example.com / password123');
    console.log('Provider: mike.provider@example.com / password123');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

seedDatabase();
