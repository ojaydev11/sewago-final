import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.payment.deleteMany();
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.serviceRef.deleteMany();
  await prisma.providerProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.service.deleteMany();

  console.log('🧹 Cleared existing data');

  // Create default services
  const services = [
    {
      slug: 'house-cleaning',
      title: 'House Cleaning',
      description: 'Professional home cleaning services including deep cleaning, regular maintenance, and post-construction cleanup.',
      basePrice: 500,
      icon: '🧹',
      category: 'cleaning',
      active: true,
    },
    {
      slug: 'electrical-work',
      title: 'Electrical Work',
      description: 'Certified electrical repairs, installations, and maintenance by licensed professionals.',
      basePrice: 800,
      icon: '⚡',
      category: 'electrical',
      active: true,
    },
    {
      slug: 'gardening',
      title: 'Gardening & Landscaping',
      description: 'Beautiful garden design, maintenance, and landscaping services for your outdoor space.',
      basePrice: 600,
      icon: '🌱',
      category: 'gardening',
      active: true,
    },
    {
      slug: 'plumbing',
      title: 'Plumbing Services',
      description: 'Expert plumbing solutions for residential and commercial properties.',
      basePrice: 700,
      icon: '🔧',
      category: 'plumbing',
      active: true,
    },
    {
      slug: 'carpentry',
      title: 'Carpentry Work',
      description: 'Custom woodwork, furniture repair, and carpentry services by skilled craftsmen.',
      basePrice: 900,
      icon: '🪚',
      category: 'carpentry',
      active: true,
    },
    {
      slug: 'painting',
      title: 'Painting Services',
      description: 'Interior and exterior painting services with premium quality materials.',
      basePrice: 400,
      icon: '🎨',
      category: 'painting',
      active: true,
    },
  ];

  for (const service of services) {
    await prisma.service.create({
      data: service,
    });
  }

  console.log('✅ Created default services');

  // Create a default admin user
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@sewago.com',
      hash: '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0wSQQqV/VSq', // password: admin123
      role: 'Admin',
      phone: '+977-1-4XXXXXX',
    },
  });

  console.log('👑 Created admin user:', adminUser.email);

  // Create a sample customer
  const customerUser = await prisma.user.create({
    data: {
      name: 'Sample Customer',
      email: 'customer@sewago.com',
      hash: '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0wSQQqV/VSq', // password: customer123
      role: 'Customer',
      phone: '+977-98XXXXXXX',
    },
  });

  console.log('👤 Created sample customer:', customerUser.email);

  // Create a sample provider
  const providerUser = await prisma.user.create({
    data: {
      name: 'Sample Provider',
      email: 'provider@sewago.com',
      hash: '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0wSQQqV/VSq', // password: provider123
      role: 'Provider',
      phone: '+977-97XXXXXXX',
    },
  });

  console.log('👷 Created sample provider:', providerUser.email);

  // Create provider profile
  await prisma.providerProfile.create({
    data: {
      userId: providerUser.id,
      services: [],
      kycStatus: 'Approved',
      documents: [],
      cities: ['Kathmandu', 'Lalitpur', 'Bhaktapur'],
      baseRates: {
        'house-cleaning': 500,
        'electrical-work': 800,
        'gardening': 600,
        'plumbing': 700,
      },
      availability: {
        monday: { start: '09:00', end: '18:00' },
        tuesday: { start: '09:00', end: '18:00' },
        wednesday: { start: '09:00', end: '18:00' },
        thursday: { start: '09:00', end: '18:00' },
        friday: { start: '09:00', end: '18:00' },
        saturday: { start: '10:00', end: '16:00' },
        sunday: { start: '10:00', end: '16:00' },
      },
    },
  });

  console.log('📋 Created provider profile');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📱 Sample Login Credentials:');
  console.log('Admin: admin@sewago.com / admin123');
  console.log('Customer: customer@sewago.com / customer123');
  console.log('Provider: provider@sewago.com / provider123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
