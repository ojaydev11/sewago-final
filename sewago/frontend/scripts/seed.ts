#!/usr/bin/env tsx

import { dbConnect } from '../src/lib/mongodb';
import { User } from '../src/models/User';
import { Service } from '../src/models/Service';
import { Provider } from '../src/models/Provider';
import bcrypt from 'bcryptjs';

const services = [
  {
    slug: 'house-cleaning',
    name: 'House Cleaning',
    category: 'Cleaning',
    shortDesc: 'Professional house cleaning services for your home',
    longDesc: 'Get your home sparkling clean with our professional house cleaning service. Our experienced cleaners use eco-friendly products and follow a comprehensive cleaning checklist to ensure every corner of your home is spotless. Perfect for regular maintenance or deep cleaning needs.',
    basePrice: 500,
    image: '/icons/cleaning.svg',
    active: true,
    hasWarranty: false,
    isVerified: true,
    reviewStats: {
      averageRating: 4.8,
      totalReviews: 127
    }
  },
  {
    slug: 'electrical-work',
    name: 'Electrical Work',
    category: 'Electrical',
    shortDesc: 'Certified electricians for all electrical needs',
    longDesc: 'Professional electrical services by certified and licensed electricians. From simple repairs to complex installations, our team handles all electrical work safely and efficiently. We ensure compliance with local electrical codes and provide warranty on all work.',
    basePrice: 800,
    image: '/icons/electrical.svg',
    active: true,
    hasWarranty: true,
    warrantyDays: 90,
    isVerified: true,
    reviewStats: {
      averageRating: 4.9,
      totalReviews: 89
    }
  },
  {
    slug: 'gardening',
    name: 'Gardening & Landscaping',
    category: 'Outdoor',
    shortDesc: 'Expert gardeners and landscaping services',
    longDesc: 'Transform your outdoor space with our professional gardening and landscaping services. Our expert gardeners provide regular maintenance, seasonal planting, tree trimming, and complete landscape design. We use quality plants and sustainable gardening practices.',
    basePrice: 600,
    image: '/icons/gardening.svg',
    active: true,
    hasWarranty: false,
    isVerified: true,
    reviewStats: {
      averageRating: 4.7,
      totalReviews: 156
    }
  },
  {
    slug: 'plumbing',
    name: 'Plumbing Services',
    category: 'Plumbing',
    shortDesc: 'Professional plumbing and repair services',
    longDesc: 'Reliable plumbing services for all your home and business needs. Our licensed plumbers handle repairs, installations, maintenance, and emergency services. We use quality materials and provide detailed workmanship with warranty coverage.',
    basePrice: 700,
    image: '/icons/plumbing.svg',
    active: true,
    hasWarranty: true,
    warrantyDays: 60,
    isVerified: true,
    reviewStats: {
      averageRating: 4.8,
      totalReviews: 203
    }
  },
  {
    slug: 'painting',
    name: 'Painting Services',
    category: 'Painting',
    shortDesc: 'Interior and exterior painting services',
    longDesc: 'Professional painting services for interior and exterior surfaces. Our experienced painters use premium paints and follow industry best practices. We handle preparation, painting, and cleanup to deliver a flawless finish that enhances your space.',
    basePrice: 1000,
    image: '/icons/painting.svg',
    active: true,
    hasWarranty: true,
    warrantyDays: 30,
    isVerified: true,
    reviewStats: {
      averageRating: 4.6,
      totalReviews: 94
    }
  },
  {
    slug: 'moving-packing',
    name: 'Moving & Packing',
    category: 'Relocation',
    shortDesc: 'Reliable moving and packing services',
    longDesc: 'Stress-free moving and packing services for homes and offices. Our professional movers handle everything from careful packing to safe transportation and unpacking. We provide packing materials, furniture protection, and insurance coverage.',
    basePrice: 1500,
    image: '/icons/moving.svg',
    active: true,
    hasWarranty: false,
    isVerified: true,
    reviewStats: {
      averageRating: 4.7,
      totalReviews: 67
    }
  },
  {
    slug: 'appliance-repair',
    name: 'Appliance Repair',
    category: 'Repair',
    shortDesc: 'Expert appliance repair and maintenance',
    longDesc: 'Professional repair services for all major home appliances. Our certified technicians diagnose and fix issues with refrigerators, washing machines, dishwashers, and more. We use genuine parts and provide warranty on repairs.',
    basePrice: 900,
    image: '/icons/appliance.svg',
    active: true,
    hasWarranty: true,
    warrantyDays: 90,
    isVerified: true,
    reviewStats: {
      averageRating: 4.8,
      totalReviews: 112
    }
  },
  {
    slug: 'carpentry',
    name: 'Carpentry & Woodwork',
    category: 'Construction',
    shortDesc: 'Custom carpentry and woodworking services',
    longDesc: 'Custom carpentry and woodworking services for your home improvement needs. From furniture repair to custom installations, our skilled carpenters deliver quality craftsmanship. We work with various wood types and finishes.',
    basePrice: 1200,
    image: '/icons/carpentry.svg',
    active: true,
    hasWarranty: true,
    warrantyDays: 60,
    isVerified: true,
    reviewStats: {
      averageRating: 4.7,
      totalReviews: 78
    }
  },
  {
    slug: 'hvac',
    name: 'HVAC Services',
    category: 'HVAC',
    shortDesc: 'Heating, ventilation, and air conditioning services',
    longDesc: 'Complete HVAC services including installation, repair, and maintenance. Our certified technicians ensure your heating and cooling systems operate efficiently. We offer 24/7 emergency services and maintenance contracts.',
    basePrice: 1100,
    image: '/icons/hvac.svg',
    active: true,
    hasWarranty: true,
    warrantyDays: 120,
    isVerified: true,
    reviewStats: {
      averageRating: 4.9,
      totalReviews: 145
    }
  },
  {
    slug: 'security-installation',
    name: 'Security Installation',
    category: 'Security',
    shortDesc: 'Home and business security system installation',
    longDesc: 'Professional security system installation for homes and businesses. We install CCTV cameras, alarm systems, access control, and smart security solutions. Our systems are customizable and include remote monitoring capabilities.',
    basePrice: 2000,
    image: '/icons/security.svg',
    active: true,
    hasWarranty: true,
    warrantyDays: 180,
    isVerified: true,
    reviewStats: {
      averageRating: 4.8,
      totalReviews: 56
    }
  }
];

const users = [
  {
    name: 'Admin User',
    email: 'admin@sewago.com',
    password: 'admin123',
    role: 'admin',
    phone: '+977-1-4XXXXXX',
    district: 'Kathmandu'
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'customer123',
    role: 'customer',
    phone: '+977-98XXXXXXX',
    district: 'Lalitpur'
  },
  {
    name: 'Sarah Smith',
    email: 'sarah@example.com',
    password: 'customer123',
    role: 'customer',
    phone: '+977-97XXXXXXX',
    district: 'Bhaktapur'
  },
  {
    name: 'Ram Bahadur',
    email: 'ram@example.com',
    password: 'provider123',
    role: 'provider',
    phone: '+977-96XXXXXXX',
    district: 'Kathmandu'
  },
  {
    name: 'Sita Devi',
    email: 'sita@example.com',
    password: 'provider123',
    role: 'provider',
    phone: '+977-95XXXXXXX',
    district: 'Lalitpur'
  }
];

async function seedDatabase() {
  try {
    console.log('Connecting to database...');
    await dbConnect();
    console.log('Connected to database successfully');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Service.deleteMany({});
    await Provider.deleteMany({});
    console.log('Existing data cleared');

    // Create users
    console.log('Creating users...');
    const createdUsers = [];
    for (const userData of users) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const user = new User({
        ...userData,
        hash: hashedPassword,
        isVerified: userData.role === 'admin' || userData.role === 'customer',
        verificationStatus: userData.role === 'admin' ? 'approved' : 'pending'
      });
      await user.save();
      createdUsers.push(user);
      console.log(`Created user: ${userData.name} (${userData.role})`);
    }

    // Create services
    console.log('Creating services...');
    for (const serviceData of services) {
      const service = new Service(serviceData);
      await service.save();
      console.log(`Created service: ${serviceData.name}`);
    }

    // Create provider profiles for provider users
    console.log('Creating provider profiles...');
    const providerUsers = createdUsers.filter(user => user.role === 'provider');
    for (const user of providerUsers) {
      const provider = new Provider({
        userId: user._id,
        services: [], // Will be populated when they complete onboarding
        hourlyRate: 800,
        isActive: true
      });
      await provider.save();
      console.log(`Created provider profile for: ${user.name}`);
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('Admin: admin@sewago.com / admin123');
    console.log('Customer: john@example.com / customer123');
    console.log('Provider: ram@example.com / provider123');
    console.log('\n🔗 Access the app and test the features!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase()
  .then(() => {
    console.log('Seeding completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
