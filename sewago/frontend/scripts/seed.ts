#!/usr/bin/env tsx

import { config } from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectToDB } from '../src/lib/db';
import { User } from '../src/models/User';
import { Service } from '../src/models/Service';
import { Booking } from '../src/models/Booking';

// Load environment variables
config({ path: '.env.local' });

const SALT_ROUNDS = 12;

async function seed() {
  try {
    console.log('🌱 Starting SewaGo database seeding...');
    
    // Connect to database
    await connectToDB();
    console.log('✅ Connected to MongoDB');
    
    // Clear existing data (optional - comment out if you want to preserve data)
    // await User.deleteMany({});
    // await Service.deleteMany({});
    // await Booking.deleteMany({});
    // console.log('🧹 Cleared existing data');
    
    // Create admin user
    const adminHash = await bcrypt.hash('admin123', SALT_ROUNDS);
    const adminUser = await User.findOneAndUpdate(
      { email: 'admin@sewago.com' },
      {
        name: 'Admin User',
        email: 'admin@sewago.com',
        hash: adminHash,
        role: 'admin',
        phone: '+977-1-1234567',
        district: 'Kathmandu'
      },
      { upsert: true, new: true }
    );
    console.log('👑 Admin user created/updated:', adminUser.email);
    
    // Create provider user
    const providerHash = await bcrypt.hash('provider123', SALT_ROUNDS);
    const providerUser = await User.findOneAndUpdate(
      { email: 'provider@sewago.com' },
      {
        name: 'John Provider',
        email: 'provider@sewago.com',
        hash: providerHash,
        role: 'provider',
        phone: '+977-1-2345678',
        district: 'Lalitpur'
      },
      { upsert: true, new: true }
    );
    console.log('🔧 Provider user created/updated:', providerUser.email);
    
    // Create customer user
    const customerHash = await bcrypt.hash('customer123', SALT_ROUNDS);
    const customerUser = await User.findOneAndUpdate(
      { email: 'customer@sewago.com' },
      {
        name: 'Jane Customer',
        email: 'customer@sewago.com',
        hash: customerHash,
        role: 'customer',
        phone: '+977-1-3456789',
        district: 'Bhaktapur'
      },
      { upsert: true, new: true }
    );
    console.log('👤 Customer user created/updated:', customerUser.email);
    
    // Create services
    const services = [
      {
        slug: 'house-cleaning',
        name: 'House Cleaning',
        category: 'Cleaning',
        shortDesc: 'Professional house cleaning services',
        longDesc: 'Comprehensive house cleaning including dusting, vacuuming, mopping, and sanitizing. Perfect for regular maintenance or deep cleaning.',
        basePrice: 1500,
        image: '/icons/cleaning.svg',
        active: true
      },
      {
        slug: 'electrical-work',
        name: 'Electrical Work',
        category: 'Electrical',
        shortDesc: 'Licensed electrical services',
        longDesc: 'Professional electrical work including wiring, installations, repairs, and safety inspections by certified electricians.',
        basePrice: 2500,
        image: '/icons/electrical.svg',
        active: true
      },
      {
        slug: 'gardening',
        name: 'Gardening Services',
        category: 'Landscaping',
        shortDesc: 'Professional gardening and landscaping',
        longDesc: 'Complete gardening services including planting, pruning, lawn care, and landscape design for residential properties.',
        basePrice: 1200,
        image: '/icons/gardening.svg',
        active: true
      },
      {
        slug: 'plumbing',
        name: 'Plumbing Services',
        category: 'Plumbing',
        shortDesc: 'Expert plumbing solutions',
        longDesc: 'Professional plumbing services including repairs, installations, maintenance, and emergency services for all plumbing systems.',
        basePrice: 2000,
        image: '/icons/plumbing.svg',
        active: true
      },
      {
        slug: 'carpentry',
        name: 'Carpentry Work',
        category: 'Carpentry',
        shortDesc: 'Quality carpentry services',
        longDesc: 'Expert carpentry work including furniture making, repairs, installations, and custom woodwork for homes and offices.',
        basePrice: 1800,
        image: '/icons/carpentry.svg',
        active: true
      },
      {
        slug: 'painting',
        name: 'Painting Services',
        category: 'Painting',
        shortDesc: 'Professional painting services',
        longDesc: 'Interior and exterior painting services including preparation, priming, painting, and cleanup for residential properties.',
        basePrice: 1600,
        image: '/icons/painting.svg',
        active: true
      },
      {
        slug: 'appliance-repair',
        name: 'Appliance Repair',
        category: 'Repair',
        shortDesc: 'Home appliance repair',
        longDesc: 'Professional repair services for all home appliances including refrigerators, washing machines, ovens, and more.',
        basePrice: 2200,
        image: '/icons/repair.svg',
        active: true
      },
      {
        slug: 'pest-control',
        name: 'Pest Control',
        category: 'Pest Control',
        shortDesc: 'Effective pest control solutions',
        longDesc: 'Comprehensive pest control services including inspection, treatment, and prevention for residential and commercial properties.',
        basePrice: 3000,
        image: '/icons/pest-control.svg',
        active: true
      },
      {
        slug: 'moving-services',
        name: 'Moving Services',
        category: 'Moving',
        shortDesc: 'Professional moving assistance',
        longDesc: 'Complete moving services including packing, loading, transportation, unloading, and unpacking for residential moves.',
        basePrice: 5000,
        image: '/icons/moving.svg',
        active: true
      },
      {
        slug: 'security-installation',
        name: 'Security Installation',
        category: 'Security',
        shortDesc: 'Security system installation',
        longDesc: 'Professional security system installation including CCTV cameras, alarms, access control, and monitoring systems.',
        basePrice: 8000,
        image: '/icons/security.svg',
        active: true
      },
      {
        slug: 'roofing',
        name: 'Roofing Services',
        category: 'Construction',
        shortDesc: 'Professional roofing solutions',
        longDesc: 'Complete roofing services including repairs, maintenance, replacement, and new installations for residential properties.',
        basePrice: 15000,
        image: '/icons/roofing.svg',
        active: true
      },
      {
        slug: 'flooring',
        name: 'Flooring Installation',
        category: 'Construction',
        shortDesc: 'Professional flooring solutions',
        longDesc: 'Expert flooring installation and repair services including hardwood, tile, laminate, and carpet for homes and offices.',
        basePrice: 12000,
        image: '/icons/flooring.svg',
        active: true
      }
    ];
    
    let serviceCount = 0;
    for (const serviceData of services) {
      await Service.findOneAndUpdate(
        { slug: serviceData.slug },
        serviceData,
        { upsert: true, new: true }
      );
      serviceCount++;
    }
    console.log(`🔧 ${serviceCount} services created/updated`);
    
    // Create sample bookings
    const houseCleaningService = await Service.findOne({ slug: 'house-cleaning' });
    const electricalService = await Service.findOne({ slug: 'electrical-work' });
    
    if (houseCleaningService && electricalService) {
      // Sample booking 1
      await Booking.findOneAndUpdate(
        { 
          customerId: customerUser._id,
          serviceId: houseCleaningService._id,
          date: new Date('2024-12-25')
        },
        {
          customerId: customerUser._id,
          providerId: providerUser._id,
          serviceId: houseCleaningService._id,
          date: new Date('2024-12-25'),
          timeSlot: '09:00-12:00',
          address: '123 Main St, Kathmandu',
          notes: 'Please bring cleaning supplies',
          status: 'confirmed'
        },
        { upsert: true, new: true }
      );
      
      // Sample booking 2
      await Booking.findOneAndUpdate(
        { 
          customerId: customerUser._id,
          serviceId: electricalService._id,
          date: new Date('2024-12-26')
        },
        {
          customerId: customerUser._id,
          providerId: providerUser._id,
          serviceId: electricalService._id,
          date: new Date('2024-12-26'),
          timeSlot: '14:00-17:00',
          address: '123 Main St, Kathmandu',
          notes: 'Need to install new outlets in living room',
          status: 'pending'
        },
        { upsert: true, new: true }
      );
      
      console.log('📅 2 sample bookings created');
    }
    
    // Get final counts
    const userCount = await User.countDocuments();
    const serviceCountFinal = await Service.countDocuments();
    const bookingCount = await Booking.countDocuments();
    
    console.log('\n📊 Seeding completed successfully!');
    console.log(`👥 Users: ${userCount}`);
    console.log(`🔧 Services: ${serviceCountFinal}`);
    console.log(`📅 Bookings: ${bookingCount}`);
    console.log('\n🔑 Default passwords:');
    console.log('   Admin: admin123');
    console.log('   Provider: provider123');
    console.log('   Customer: customer123');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run the seed function
seed();
