import { PrismaClient } from '@prisma/client';

// Mock data for fallback when DATABASE_URL is not available
const mockServices = [
  {
    id: '1',
    slug: 'plumbing',
    title: 'Plumbing Services',
    description: 'Professional plumbing services for homes and businesses',
    category: 'plumbing',
    imageUrl: '/icons/plumbing.svg',
    priceRange: { min: 500, max: 2000 },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    slug: 'electrical',
    title: 'Electrical Services',
    description: 'Certified electrical work and repairs',
    category: 'electrical',
    imageUrl: '/icons/electrical.svg',
    priceRange: { min: 800, max: 3000 },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    slug: 'cleaning',
    title: 'Cleaning Services',
    description: 'Professional cleaning for homes and offices',
    category: 'cleaning',
    imageUrl: '/icons/cleaning.svg',
    priceRange: { min: 600, max: 1500 },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    slug: 'moving',
    title: 'Moving Services',
    description: 'Reliable moving and relocation services',
    category: 'moving',
    imageUrl: '/icons/moving.svg',
    priceRange: { min: 1000, max: 5000 },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    slug: 'repairs',
    title: 'General Repairs',
    description: 'Handyman services for various repairs',
    category: 'repairs',
    imageUrl: '/icons/repairs.svg',
    priceRange: { min: 400, max: 1200 },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '6',
    slug: 'gardening',
    title: 'Gardening Services',
    description: 'Landscaping and garden maintenance',
    category: 'gardening',
    imageUrl: '/icons/gardening.svg',
    priceRange: { min: 300, max: 1000 },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockUsers = [
  {
    id: '1',
    name: 'Demo User',
    email: 'demo@sewago.com',
    passwordHash: 'mock-hash',
    role: 'CUSTOMER' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockBookings: Array<{
  id: string;
  userId: string;
  serviceId: string;
  providerId?: string;
  status: string;
  scheduledAt: Date;
  priceEstimateMin: number;
  priceEstimateMax: number;
  addressId: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}> = [];

const mockAddresses: Array<{
  id: string;
  userId: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}> = [];

const mockReviews: Array<{
  id: string;
  userId: string;
  serviceId: string;
  bookingId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}> = [];

const mockProviderProfiles: Array<{
  id: string;
  userId: string;
  bio?: string;
  specialties: string[];
  experience?: number;
  rating: number;
  totalJobs: number;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}> = [];

// Mock repository interface
export interface MockRepository {
  service: {
    findMany: () => Promise<typeof mockServices>;
    findUnique: (args: { where: { slug?: string; id?: string } }) => Promise<typeof mockServices[0] | null>;
  };
  user: {
    findUnique: (args: { where: { email?: string; id?: string } }) => Promise<typeof mockUsers[0] | null>;
    create: (args: { data: Omit<typeof mockUsers[0], 'id' | 'createdAt' | 'updatedAt'> }) => Promise<typeof mockUsers[0]>;
    update: (args: { where: { id: string }; data: Partial<Omit<typeof mockUsers[0], 'id' | 'createdAt' | 'updatedAt'>> }) => Promise<typeof mockUsers[0] | null>;
  };
  booking: {
    create: (args: { data: Omit<typeof mockBookings[0], 'id' | 'createdAt' | 'updatedAt'> }) => Promise<typeof mockBookings[0]>;
    findMany: (args: { where: { userId?: string; status?: string } }) => Promise<typeof mockBookings>;
    findUnique: (args: { where: { id: string } }) => Promise<typeof mockBookings[0] | null>;
    update: (args: { where: { id: string }; data: Partial<Omit<typeof mockBookings[0], 'id' | 'createdAt' | 'updatedAt'>> }) => Promise<typeof mockBookings[0] | null>;
  };
  address: {
    create: (args: { data: Omit<typeof mockAddresses[0], 'id' | 'createdAt' | 'updatedAt'> }) => Promise<typeof mockAddresses[0]>;
    findMany: (args: { where: { userId?: string } }) => Promise<typeof mockAddresses>;
  };
  review: {
    create: (args: { data: Omit<typeof mockReviews[0], 'id' | 'createdAt' | 'updatedAt'> }) => Promise<typeof mockReviews[0]>;
    findMany: (args: { where: { serviceId?: string } }) => Promise<typeof mockReviews>;
  };
  providerProfile: {
    create: (args: { data: Omit<typeof mockProviderProfiles[0], 'id' | 'createdAt' | 'updatedAt'> }) => Promise<typeof mockProviderProfiles[0]>;
    findMany: () => Promise<typeof mockProviderProfiles>;
  };
}

// Mock repository implementation
const mockRepo: MockRepository = {
  service: {
    findMany: async () => mockServices,
    findUnique: async (args) => {
      if (args.where.slug) {
        return mockServices.find(s => s.slug === args.where.slug) || null;
      }
      if (args.where.id) {
        return mockServices.find(s => s.id === args.where.id) || null;
      }
      return null;
    },
  },
  user: {
    findUnique: async (args) => {
      if (args.where.email) {
        return mockUsers.find(u => u.email === args.where.email) || null;
      }
      if (args.where.id) {
        return mockUsers.find(u => u.id === args.where.id) || null;
      }
      return null;
    },
    create: async (args) => {
      const newUser = {
        id: `user-${Date.now()}`,
        ...args.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockUsers.push(newUser);
      return newUser;
    },
    update: async (args) => {
      const userIndex = mockUsers.findIndex(u => u.id === args.where.id);
      if (userIndex !== -1) {
        mockUsers[userIndex] = { ...mockUsers[userIndex], ...args.data, updatedAt: new Date() };
        return mockUsers[userIndex];
      }
      return null;
    },
  },
  booking: {
    create: async (args) => {
      const newBooking = {
        id: `booking-${Date.now()}`,
        ...args.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockBookings.push(newBooking);
      return newBooking;
    },
    findMany: async (args) => {
      if (args.where.userId) {
        return mockBookings.filter(b => b.userId === args.where.userId);
      }
      return mockBookings;
    },
    findUnique: async (args) => {
      return mockBookings.find(b => b.id === args.where.id) || null;
    },
    update: async (args) => {
      const bookingIndex = mockBookings.findIndex(b => b.id === args.where.id);
      if (bookingIndex !== -1) {
        mockBookings[bookingIndex] = { ...mockBookings[bookingIndex], ...args.data, updatedAt: new Date() };
        return mockBookings[bookingIndex];
      }
      return null;
    },
  },
  address: {
    create: async (args) => {
      const newAddress = {
        id: `address-${Date.now()}`,
        ...args.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockAddresses.push(newAddress);
      return newAddress;
    },
    findMany: async (args) => {
      if (args.where.userId) {
        return mockAddresses.filter(a => a.userId === args.where.userId);
      }
      return mockAddresses;
    },
  },
  review: {
    create: async (args) => {
      const newReview = {
        id: `review-${Date.now()}`,
        ...args.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockReviews.push(newReview);
      return newReview;
    },
    findMany: async (args) => {
      if (args.where.serviceId) {
        return mockReviews.filter(r => r.serviceId === args.where.serviceId);
      }
      return mockReviews;
    },
  },
  providerProfile: {
    create: async (args) => {
      const newProfile = {
        id: `profile-${Date.now()}`,
        ...args.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockProviderProfiles.push(newProfile);
      return newProfile;
    },
    findMany: async () => mockProviderProfiles,
  },
};

// Try to create Prisma client, fallback to mock if DATABASE_URL is missing
let db: PrismaClient | MockRepository;

try {
  if (process.env.DATABASE_URL) {
    db = new PrismaClient();
    console.log('✅ Using Prisma database client');
  } else {
    db = mockRepo;
    console.log('⚠️  DATABASE_URL not found, using mock repository');
  }
} catch (error) {
  console.warn('⚠️  Failed to initialize Prisma, using mock repository:', error);
  db = mockRepo;
}

export { db };
