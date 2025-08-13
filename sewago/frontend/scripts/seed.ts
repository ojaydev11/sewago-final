import dbConnect from '../src/lib/db';
import { User } from '../src/models/User';
import { Service } from '../src/models/Service';
import { ProviderProfile } from '../src/models/ProviderProfile';
import bcrypt from 'bcryptjs';

async function seed() {
  try {
    console.log('🌱 Starting database seed...');
    
    // Connect to database
    await dbConnect();
    console.log('✅ Connected to database');

    // Clear existing data
    await User.deleteMany({});
    await Service.deleteMany({});
    await ProviderProfile.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Create admin user
    const adminPassword = 'admin123';
    const adminHash = await bcrypt.hash(adminPassword, 12);
    
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@sewago.com',
      hash: adminHash,
      role: 'admin',
      phone: '+977-1-4XXXXXX',
      district: 'Kathmandu',
    });

    console.log('👑 Admin user created:');
    console.log(`   Email: admin@sewago.com`);
    console.log(`   Password: ${adminPassword}`);
    console.log(`   ID: ${adminUser._id}`);

    // Create sample services
    const services = [
      {
        slug: 'house-cleaning',
        name: 'House Cleaning',
        category: 'Cleaning',
        shortDesc: 'Professional home cleaning services',
        longDesc: 'Comprehensive house cleaning including dusting, vacuuming, mopping, bathroom cleaning, and kitchen deep cleaning. Our verified professionals ensure your home sparkles.',
        basePrice: 500,
        image: '/icons/cleaning.svg',
        active: true,
      },
      {
        slug: 'electrical-work',
        name: 'Electrical Work',
        category: 'Electrical',
        shortDesc: 'Certified electrical repairs and installations',
        longDesc: 'Professional electrical services including wiring, repairs, installations, maintenance, and safety inspections. All work done by certified electricians.',
        basePrice: 800,
        image: '/icons/electrical.svg',
        active: true,
      },
      {
        slug: 'gardening',
        name: 'Gardening & Landscaping',
        category: 'Outdoor',
        shortDesc: 'Expert gardening and landscaping services',
        longDesc: 'Complete garden maintenance, landscaping, plant care, tree trimming, and outdoor beautification. Transform your outdoor space with our gardening experts.',
        basePrice: 600,
        image: '/icons/gardening.svg',
        active: true,
      },
      {
        slug: 'moving-packing',
        name: 'Moving & Packing',
        category: 'Relocation',
        shortDesc: 'Reliable moving and packing services',
        longDesc: 'Professional moving services including packing, loading, transportation, unloading, and unpacking. We handle your belongings with care and ensure safe delivery.',
        basePrice: 1500,
        image: '/icons/moving.svg',
        active: true,
      },
      {
        slug: 'plumbing',
        name: 'Plumbing Services',
        category: 'Plumbing',
        shortDesc: 'Expert plumbing solutions and repairs',
        longDesc: 'Complete plumbing services including repairs, installations, maintenance, leak detection, and emergency services. Fast response and quality work guaranteed.',
        basePrice: 700,
        image: '/icons/plumbing.svg',
        active: true,
      },
      {
        slug: 'painting',
        name: 'Interior & Exterior Painting',
        category: 'Painting',
        shortDesc: 'Professional painting services',
        longDesc: 'High-quality interior and exterior painting services including color consultation, surface preparation, and clean application. Transform your space with our painting experts.',
        basePrice: 1000,
        image: '/icons/painting.svg',
        active: true,
      },
    ];

    const createdServices = await Service.insertMany(services);
    console.log(`✅ Created ${createdServices.length} services`);

    // Create sample provider profile
    const providerUser = await User.create({
      name: 'Ram Bahadur',
      email: 'ram@example.com',
      hash: await bcrypt.hash('provider123', 12),
      role: 'provider',
      phone: '+977-98XXXXXXXX',
      district: 'Kathmandu',
    });

    const providerProfile = await ProviderProfile.create({
      userId: providerUser._id,
      skills: ['House Cleaning', 'Gardening'],
      bio: 'Experienced professional with 5+ years in home services. Dedicated to providing quality work and customer satisfaction.',
      ratingAvg: 4.8,
      jobsCompleted: 45,
      verified: true,
    });

    console.log('👷 Sample provider created:');
    console.log(`   Email: ram@example.com`);
    console.log(`   Password: provider123`);
    console.log(`   Skills: ${providerProfile.skills.join(', ')}`);

    // Create sample customer
    const customerUser = await User.create({
      name: 'Sita Devi',
      email: 'sita@example.com',
      hash: await bcrypt.hash('customer123', 12),
      role: 'customer',
      phone: '+977-97XXXXXXXX',
      district: 'Lalitpur',
    });

    console.log('👤 Sample customer created:');
    console.log(`   Email: sita@example.com`);
    console.log(`   Password: customer123`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Sample Accounts:');
    console.log('   Admin: admin@sewago.com / admin123');
    console.log('   Provider: ram@example.com / provider123');
    console.log('   Customer: sita@example.com / customer123');
    console.log('\n🔗 Services available:');
    createdServices.forEach(service => {
      console.log(`   - ${service.name}: ₹${service.basePrice} (${service.slug})`);
    });

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

seed();
