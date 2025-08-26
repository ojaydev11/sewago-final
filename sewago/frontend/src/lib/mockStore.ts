// Mock data types
export interface MockUser {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'customer' | 'provider';
  createdAt: Date;
}

export interface MockService {
  _id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  category: string;
  createdAt: Date;
}

export interface MockBooking {
  _id: string;
  userId: string;
  serviceId: string;
  providerId?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  scheduledAt: Date;
  address: {
    line1: string;
    city: string;
  };
  notes?: string;
  priceEstimateMin: number;
  priceEstimateMax: number;
  createdAt: Date;
}

export interface MockProviderProfile {
  _id: string;
  userId: string;
  skills: string[];
  rating: number;
  city: string;
}

// Mock data store
class MockStore {
  private users: MockUser[] = [];
  private services: MockService[] = [];
  private bookings: MockBooking[] = [];
  private providerProfiles: MockProviderProfile[] = [];

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed some mock services
    this.services = [
      {
        _id: this.generateId(),
        name: 'House Cleaning',
        slug: 'house-cleaning',
        description: 'Professional house cleaning services',
        basePrice: 50,
        category: 'cleaning',
        createdAt: new Date(),
      },
      {
        _id: this.generateId(),
        name: 'Electrical Repair',
        slug: 'electrical-repair',
        description: 'Expert electrical repair and maintenance',
        basePrice: 80,
        category: 'electrical',
        createdAt: new Date(),
      },
      {
        _id: this.generateId(),
        name: 'Gardening',
        slug: 'gardening',
        description: 'Landscaping and garden maintenance',
        basePrice: 60,
        category: 'gardening',
        createdAt: new Date(),
      },
    ];

    // Seed a mock user
    this.users = [
      {
        _id: this.generateId(),
        name: 'Demo User',
        email: 'demo@example.com',
        passwordHash: '$2b$10$demo.hash.for.testing',
        role: 'customer',
        createdAt: new Date(),
      },
    ];
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // User methods
  async findOne(filter: any): Promise<MockUser | null> {
    if (filter.email) {
      return this.users.find(u => u.email === filter.email) || null;
    }
    if (filter._id) {
      return this.users.find(u => u._id === filter._id) || null;
    }
    return null;
  }

  async create(data: Omit<MockUser, '_id' | 'createdAt'>): Promise<MockUser> {
    const user: MockUser = {
      _id: this.generateId(),
      ...data,
      createdAt: new Date(),
    };
    this.users.push(user);
    return user;
  }

  // Service methods
  async findServices(filter?: any): Promise<MockService[]> {
    if (filter?.category) {
      return this.services.filter(s => s.category === filter.category);
    }
    if (filter?.slug) {
      return this.services.filter(s => s.slug === filter.slug);
    }
    return [...this.services];
  }

  async findServiceById(id: string): Promise<MockService | null> {
    return this.services.find(s => s._id === id) || null;
  }

  // Booking methods
  async createBooking(data: Omit<MockBooking, '_id' | 'createdAt'>): Promise<MockBooking> {
    const booking: MockBooking = {
      _id: this.generateId(),
      ...data,
      createdAt: new Date(),
    };
    this.bookings.push(booking);
    return booking;
  }

  async findBookings(filter?: any): Promise<MockBooking[]> {
    if (filter?.userId) {
      return this.bookings.filter(b => b.userId === filter.userId);
    }
    if (filter?._id) {
      return this.bookings.filter(b => b._id === filter._id);
    }
    return [...this.bookings];
  }

  async findBookingById(id: string): Promise<MockBooking | null> {
    return this.bookings.find(b => b._id === id) || null;
  }

  // Provider profile methods
  async findOne(filter: any): Promise<MockProviderProfile | null> {
    if (filter.userId) {
      return this.providerProfiles.find(p => p.userId === filter.userId) || null;
    }
    return null;
  }

  async create(data: Omit<MockProviderProfile, '_id'>): Promise<MockProviderProfile> {
    const profile: MockProviderProfile = {
      _id: this.generateId(),
      ...data,
    };
    this.providerProfiles.push(profile);
    return profile;
  }
}

// Export singleton instance
export const mockStore = new MockStore();
