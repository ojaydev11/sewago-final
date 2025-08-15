#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.provider.deleteMany();
  await prisma.service.deleteMany();
  await prisma.user.deleteMany();
  await prisma.referral.deleteMany();
  await prisma.publicMetric.deleteMany();

  console.log('🗑️  Cleared existing data');

  // Create sample users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'ram.shrestha@example.com',
        name: 'Ram Shrestha',
        phone: '+977-9841234567',
        coins: 150,
        referralCode: 'RAM001'
      }
    }),
    prisma.user.create({
      data: {
        email: 'sita.tamang@example.com',
        name: 'Sita Tamang',
        phone: '+977-9842345678',
        coins: 75,
        referralCode: 'SITA002'
      }
    }),
    prisma.user.create({
      data: {
        email: 'gopal.rai@example.com',
        name: 'Gopal Rai',
        phone: '+977-9843456789',
        coins: 200,
        referralCode: 'GOPAL003'
      }
    })
  ]);

  console.log('👥 Created sample users');

  // Create sample services
  const services = await Promise.all([
    prisma.service.create({
      data: {
        slug: 'plumbing',
        name: 'Plumbing Services',
        description: 'Expert plumbing services for homes and offices including repairs, installations, and maintenance',
        basePrice: 599,
        city: 'Kathmandu',
        category: 'plumbing',
        imageUrl: '/icons/plumbing.svg'
      }
    }),
    prisma.service.create({
      data: {
        slug: 'electrical',
        name: 'Electrical Services',
        description: 'Professional electrical work and safety checks for residential and commercial properties',
        basePrice: 599,
        city: 'Kathmandu',
        category: 'electrical',
        imageUrl: '/icons/electrical.svg'
      }
    }),
    prisma.service.create({
      data: {
        slug: 'house-cleaning',
        name: 'House Cleaning',
        description: 'Comprehensive house cleaning services including deep cleaning, window washing, and organization',
        basePrice: 1999,
        city: 'Kathmandu',
        category: 'cleaning',
        imageUrl: '/icons/cleaning.svg'
      }
    }),
    prisma.service.create({
      data: {
        slug: 'ac-service',
        name: 'AC Service & Repair',
        description: 'Professional AC installation, repair, maintenance, and gas refilling services',
        basePrice: 1499,
        city: 'Kathmandu',
        category: 'hvac',
        imageUrl: '/icons/ac.svg'
      }
    })
  ]);

  console.log('🔧 Created sample services');

  // Create sample providers
  const providers = await Promise.all([
    prisma.provider.create({
      data: {
        name: 'Bikash Thapa',
        phone: '+977-9844567890',
        verified: true,
        onTimePct: 95,
        completionPct: 98,
        yearsActive: 5,
        tier: 'VERIFIED',
        skills: ['plumbing', 'electrical'],
        zones: ['Kathmandu', 'Lalitpur'],
        isOnline: true
      }
    }),
    prisma.provider.create({
      data: {
        name: 'Mina Gurung',
        phone: '+977-9845678901',
        verified: true,
        onTimePct: 92,
        completionPct: 96,
        yearsActive: 3,
        tier: 'VERIFIED',
        skills: ['cleaning', 'gardening'],
        zones: ['Kathmandu', 'Bhaktapur'],
        isOnline: true
      }
    }),
    prisma.provider.create({
      data: {
        name: 'Rajesh Magar',
        phone: '+977-9846789012',
        verified: true,
        onTimePct: 88,
        completionPct: 94,
        yearsActive: 7,
        tier: 'VERIFIED',
        skills: ['ac-service', 'electrical'],
        zones: ['Kathmandu', 'Lalitpur', 'Bhaktapur'],
        isOnline: false
      }
    })
  ]);

  console.log('👷 Created sample providers');

  // Create sample bookings
  const bookings = await Promise.all([
    prisma.booking.create({
      data: {
        userId: users[0].id,
        serviceId: services[0].id,
        providerId: providers[0].id,
        status: 'COMPLETED',
        address: 'Baneshwor, Kathmandu',
        notes: 'Leaky faucet in kitchen',
        total: 750,
        paid: true,
        scheduledAt: new Date('2024-01-15T10:00:00Z'),
        completedAt: new Date('2024-01-15T11:30:00Z')
      }
    }),
    prisma.booking.create({
      data: {
        userId: users[1].id,
        serviceId: services[2].id,
        providerId: providers[1].id,
        status: 'COMPLETED',
        address: 'Patan, Lalitpur',
        notes: 'Deep cleaning for 2BHK apartment',
        total: 2499,
        paid: true,
        scheduledAt: new Date('2024-01-16T09:00:00Z'),
        completedAt: new Date('2024-01-16T12:00:00Z')
      }
    }),
    prisma.booking.create({
      data: {
        userId: users[2].id,
        serviceId: services[1].id,
        providerId: providers[0].id,
        status: 'COMPLETED',
        address: 'Thamel, Kathmandu',
        notes: 'Electrical safety check',
        total: 650,
        paid: true,
        scheduledAt: new Date('2024-01-17T14:00:00Z'),
        completedAt: new Date('2024-01-17T15:15:00Z')
      }
    })
  ]);

  console.log('📅 Created sample bookings');

  // Create sample reviews
  const reviews = await Promise.all([
    prisma.review.create({
      data: {
        rating: 5,
        text: 'Excellent service! Bikash was very professional and fixed the plumbing issue quickly. Highly recommended!',
        mediaUrls: ['/reviews/plumbing-1.jpg'],
        verified: true,
        bookingId: bookings[0].id,
        userId: users[0].id,
        serviceId: services[0].id
      }
    }),
    prisma.review.create({
      data: {
        rating: 4,
        text: 'Great cleaning service. Mina did a thorough job and the apartment looks spotless now.',
        mediaUrls: ['/reviews/cleaning-1.jpg'],
        verified: true,
        bookingId: bookings[1].id,
        userId: users[1].id,
        serviceId: services[2].id
      }
    }),
    prisma.review.create({
      data: {
        rating: 5,
        text: 'Very professional electrical work. Rajesh was punctual and completed the safety check efficiently.',
        mediaUrls: [],
        verified: true,
        bookingId: bookings[2].id,
        userId: users[2].id,
        serviceId: services[1].id
      }
    })
  ]);

  console.log('⭐ Created sample reviews');

  // Create sample referrals
  const referrals = await Promise.all([
    prisma.referral.create({
      data: {
        code: 'WELCOME2024',
        referrerId: users[0].id
      }
    }),
    prisma.referral.create({
      data: {
        code: 'SAVINGS50',
        referrerId: users[1].id
      }
    })
  ]);

  console.log('🎁 Created sample referrals');

  // Create public metrics
  const metrics = await Promise.all([
    prisma.publicMetric.create({
      data: {
        key: 'jobs_completed',
        value: '1247'
      }
    }),
    prisma.publicMetric.create({
      data: {
        key: 'avg_response_time',
        value: '28 min'
      }
    }),
    prisma.publicMetric.create({
      data: {
        key: 'satisfaction_percentage',
        value: '96'
      }
    }),
    prisma.publicMetric.create({
      data: {
        key: 'active_providers',
        value: '89'
      }
    }),
    prisma.publicMetric.create({
      data: {
        key: 'cities_covered',
        value: '12'
      }
    })
  ]);

  console.log('📊 Created public metrics');

  console.log('✅ Database seeding completed successfully!');
  console.log(`📈 Created ${users.length} users, ${services.length} services, ${providers.length} providers, ${bookings.length} bookings, ${reviews.length} reviews, ${referrals.length} referrals, and ${metrics.length} metrics`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
