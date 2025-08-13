import { dbConnect } from './mongodb';
import { User, IUser } from '../models/User';
import { Service, IService } from '../models/Service';
import { ProviderProfile, IProviderProfile } from '../models/ProviderProfile';
import { Address, IAddress } from '../models/Address';
import { Booking, IBooking } from '../models/Booking';
import { Review, IReview } from '../models/Review';
import bcrypt from 'bcryptjs';

// Database service interface
interface DatabaseService {
  user: {
    findMany: (options?: any) => Promise<IUser[]>;
    findUnique: (options: any) => Promise<IUser | null>;
    create: (data: any) => Promise<IUser>;
    update: (options: any) => Promise<IUser | null>;
    delete: (options: any) => Promise<IUser | null>;
  };
  service: {
    findMany: (options?: any) => Promise<IService[]>;
    findUnique: (options: any) => Promise<IService | null>;
    create: (data: any) => Promise<IService>;
    update: (options: any) => Promise<IService | null>;
    delete: (options: any) => Promise<IService | null>;
  };
  providerProfile: {
    findMany: (options?: any) => Promise<IProviderProfile[]>;
    findUnique: (options: any) => Promise<IProviderProfile | null>;
    create: (data: any) => Promise<IProviderProfile>;
    update: (options: any) => Promise<IProviderProfile | null>;
    delete: (options: any) => Promise<IProviderProfile | null>;
  };
  address: {
    findMany: (options?: any) => Promise<IAddress[]>;
    findUnique: (options: any) => Promise<IAddress | null>;
    create: (data: any) => Promise<IAddress>;
    update: (options: any) => Promise<IAddress | null>;
    delete: (options: any) => Promise<IAddress | null>;
  };
  booking: {
    findMany: (options?: any) => Promise<IBooking[]>;
    findUnique: (options: any) => Promise<IBooking | null>;
    create: (data: any) => Promise<IBooking>;
    update: (options: any) => Promise<IBooking | null>;
    delete: (options: any) => Promise<IBooking | null>;
  };
  review: {
    findMany: (options?: any) => Promise<IReview[]>;
    findUnique: (options: any) => Promise<IReview | null>;
    create: (data: any) => Promise<IReview>;
    update: (options: any) => Promise<IReview | null>;
    delete: (options: any) => Promise<IReview | null>;
  };
}

// MongoDB implementation
class MongoDBService implements DatabaseService {
  async ensureConnection() {
    const connection = await dbConnect();
    if (!connection) {
      throw new Error('Failed to connect to MongoDB');
    }
  }

  user = {
    findMany: async (options: any = {}) => {
      await this.ensureConnection();
      const { where, include, orderBy, take, skip } = options;
      
      let query = User.find(where || {});
      
      if (include?.reviews) {
        query = query.populate('reviews');
      }
      
      if (orderBy) {
        const [field, order] = Object.entries(orderBy)[0];
        query = query.sort({ [field]: order === 'desc' ? -1 : 1 });
      }
      
      if (take) query = query.limit(take);
      if (skip) query = query.skip(skip);
      
      return await query.exec();
    },

    findUnique: async (options: any) => {
      await this.ensureConnection();
      const { where, include } = options;
      
      let query = User.findOne(where);
      
      if (include?.reviews) {
        query = query.populate('reviews');
      }
      
      return await query.exec();
    },

    create: async (data: any) => {
      await this.ensureConnection();
      if (data.password) {
        data.passwordHash = await bcrypt.hash(data.password, 12);
        delete data.password;
      }
      const user = new User(data);
      return await user.save();
    },

    update: async (options: any) => {
      await this.ensureConnection();
      const { where, data, include } = options;
      
      if (data.password) {
        data.passwordHash = await bcrypt.hash(data.password, 12);
        delete data.password;
      }
      
      const user = await User.findOneAndUpdate(where, data, { new: true });
      
      if (include?.reviews && user) {
        return await user.populate('reviews');
      }
      
      return user;
    },

    delete: async (options: any) => {
      await this.ensureConnection();
      const { where } = options;
      return await User.findOneAndDelete(where);
    },
  };

  service = {
    findMany: async (options: any = {}) => {
      await this.ensureConnection();
      const { where, include, orderBy, take, skip } = options;
      
      let query = Service.find(where || {});
      
      if (include?.reviews) {
        query = query.populate('reviews');
      }
      
      if (orderBy) {
        const [field, order] = Object.entries(orderBy)[0];
        query = query.sort({ [field]: order === 'desc' ? -1 : 1 });
      }
      
      if (take) query = query.limit(take);
      if (skip) query = query.skip(skip);
      
      return await query.exec();
    },

    findUnique: async (options: any) => {
      await this.ensureConnection();
      const { where, include } = options;
      
      let query = Service.findOne(where);
      
      if (include?.reviews) {
        query = query.populate('reviews');
      }
      
      return await query.exec();
    },

    create: async (data: any) => {
      await this.ensureConnection();
      const service = new Service(data);
      return await service.save();
    },

    update: async (options: any) => {
      await this.ensureConnection();
      const { where, data, include } = options;
      
      const service = await Service.findOneAndUpdate(where, data, { new: true });
      
      if (include?.reviews && service) {
        return await service.populate('reviews');
      }
      
      return service;
    },

    delete: async (options: any) => {
      await this.ensureConnection();
      const { where } = options;
      return await Service.findOneAndDelete(where);
    },
  };

  providerProfile = {
    findMany: async (options: any = {}) => {
      await this.ensureConnection();
      const { where, include, orderBy, take, skip } = options;
      
      let query = ProviderProfile.find(where || {});
      
      if (include?.user) {
        query = query.populate('user');
      }
      
      if (orderBy) {
        const [field, order] = Object.entries(orderBy)[0];
        query = query.sort({ [field]: order === 'desc' ? -1 : 1 });
      }
      
      if (take) query = query.limit(take);
      if (skip) query = query.skip(skip);
      
      return await query.exec();
    },

    findUnique: async (options: any) => {
      await this.ensureConnection();
      const { where, include } = options;
      
      let query = ProviderProfile.findOne(where);
      
      if (include?.user) {
        query = query.populate('user');
      }
      
      return await query.exec();
    },

    create: async (data: any) => {
      await this.ensureConnection();
      const profile = new ProviderProfile(data);
      return await profile.save();
    },

    update: async (options: any) => {
      await this.ensureConnection();
      const { where, data, include } = options;
      
      const profile = await ProviderProfile.findOneAndUpdate(where, data, { new: true });
      
      if (include?.user && profile) {
        return await profile.populate('user');
      }
      
      return profile;
    },

    delete: async (options: any) => {
      await this.ensureConnection();
      const { where } = options;
      return await ProviderProfile.findOneAndDelete(where);
    },
  };

  address = {
    findMany: async (options: any = {}) => {
      await this.ensureConnection();
      const { where, include, orderBy, take, skip } = options;
      
      let query = Address.find(where || {});
      
      if (include?.user) {
        query = query.populate('user');
      }
      
      if (orderBy) {
        const [field, order] = Object.entries(orderBy)[0];
        query = query.sort({ [field]: order === 'desc' ? -1 : 1 });
      }
      
      if (take) query = query.limit(take);
      if (skip) query = query.skip(skip);
      
      return await query.exec();
    },

    findUnique: async (options: any) => {
      await this.ensureConnection();
      const { where, include } = options;
      
      let query = Address.findOne(where);
      
      if (include?.user) {
        query = query.populate('user');
      }
      
      return await query.exec();
    },

    create: async (data: any) => {
      await this.ensureConnection();
      const address = new Address(data);
      return await address.save();
    },

    update: async (options: any) => {
      await this.ensureConnection();
      const { where, data, include } = options;
      
      const address = await Address.findOneAndUpdate(where, data, { new: true });
      
      if (include?.user && address) {
        return await address.populate('user');
      }
      
      return address;
    },

    delete: async (options: any) => {
      await this.ensureConnection();
      const { where } = options;
      return await Address.findOneAndDelete(where);
    },
  };

  booking = {
    findMany: async (options: any = {}) => {
      await this.ensureConnection();
      const { where, include, orderBy, take, skip } = options;
      
      let query = Booking.find(where || {});
      
      if (include?.user) {
        query = query.populate('user');
      }
      if (include?.service) {
        query = query.populate('service');
      }
      if (include?.provider) {
        query = query.populate('provider');
      }
      if (include?.address) {
        query = query.populate('address');
      }
      
      if (orderBy) {
        const [field, order] = Object.entries(orderBy)[0];
        query = query.sort({ [field]: order === 'desc' ? -1 : 1 });
      }
      
      if (take) query = query.limit(take);
      if (skip) query = query.skip(skip);
      
      return await query.exec();
    },

    findUnique: async (options: any) => {
      await this.ensureConnection();
      const { where, include } = options;
      
      let query = Booking.findOne(where);
      
      if (include?.user) {
        query = query.populate('user');
      }
      if (include?.service) {
        query = query.populate('service');
      }
      if (include?.provider) {
        query = query.populate('provider');
      }
      if (include?.address) {
        query = query.populate('address');
      }
      
      return await query.exec();
    },

    create: async (data: any) => {
      await this.ensureConnection();
      const booking = new Booking(data);
      return await booking.save();
    },

    update: async (options: any) => {
      await this.ensureConnection();
      const { where, data, include } = options;
      
      const booking = await Booking.findOneAndUpdate(where, data, { new: true });
      
      if (include && booking) {
        if (include.user) booking.populate('user');
        if (include.service) booking.populate('service');
        if (include.provider) booking.populate('provider');
        if (include.address) booking.populate('address');
      }
      
      return booking;
    },

    delete: async (options: any) => {
      await this.ensureConnection();
      const { where } = options;
      return await Booking.findOneAndDelete(where);
    },
  };

  review = {
    findMany: async (options: any = {}) => {
      await this.ensureConnection();
      const { where, include, orderBy, take, skip } = options;
      
      let query = Review.find(where || {});
      
      if (include?.user) {
        query = query.populate('user');
      }
      if (include?.service) {
        query = query.populate('service');
      }
      if (include?.booking) {
        query = query.populate('booking');
      }
      
      if (orderBy) {
        const [field, order] = Object.entries(orderBy)[0];
        query = query.sort({ [field]: order === 'desc' ? -1 : 1 });
      }
      
      if (take) query = query.limit(take);
      if (skip) query = query.skip(skip);
      
      return await query.exec();
    },

    findUnique: async (options: any) => {
      await this.ensureConnection();
      const { where, include } = options;
      
      let query = Review.findOne(where);
      
      if (include?.user) {
        query = query.populate('user');
      }
      if (include?.service) {
        query = query.populate('service');
      }
      if (include?.booking) {
        query = query.populate('booking');
      }
      
      return await query.exec();
    },

    create: async (data: any) => {
      await this.ensureConnection();
      const review = new Review(data);
      return await review.save();
    },

    update: async (options: any) => {
      await this.ensureConnection();
      const { where, data, include } = options;
      
      const review = await Review.findOneAndUpdate(where, data, { new: true });
      
      if (include && review) {
        if (include.user) review.populate('user');
        if (include.service) review.populate('service');
        if (include.booking) review.populate('booking');
      }
      
      return review;
    },

    delete: async (options: any) => {
      await this.ensureConnection();
      const { where } = options;
      return await Review.findOneAndDelete(where);
    },
  };
}

// Mock implementation for development/testing
class MockDatabaseService implements DatabaseService {
  private mockData = {
    users: [],
    services: [],
    providerProfiles: [],
    addresses: [],
    bookings: [],
    reviews: [],
  };

  user = {
    findMany: async () => this.mockData.users,
    findUnique: async () => this.mockData.users[0] || null,
    create: async (data: any) => ({ ...data, id: Date.now().toString() }),
    update: async () => this.mockData.users[0] || null,
    delete: async () => this.mockData.users[0] || null,
  };

  service = {
    findMany: async () => this.mockData.services,
    findUnique: async () => this.mockData.services[0] || null,
    create: async (data: any) => ({ ...data, id: Date.now().toString() }),
    update: async () => this.mockData.services[0] || null,
    delete: async () => this.mockData.services[0] || null,
  };

  providerProfile = {
    findMany: async () => this.mockData.providerProfiles,
    findUnique: async () => this.mockData.providerProfiles[0] || null,
    create: async (data: any) => ({ ...data, id: Date.now().toString() }),
    update: async () => this.mockData.providerProfiles[0] || null,
    delete: async () => this.mockData.providerProfiles[0] || null,
  };

  address = {
    findMany: async () => this.mockData.addresses,
    findUnique: async () => this.mockData.addresses[0] || null,
    create: async (data: any) => ({ ...data, id: Date.now().toString() }),
    update: async () => this.mockData.addresses[0] || null,
    delete: async () => this.mockData.addresses[0] || null,
  };

  booking = {
    findMany: async () => this.mockData.bookings,
    findUnique: async () => this.mockData.bookings[0] || null,
    create: async (data: any) => ({ ...data, id: Date.now().toString() }),
    update: async () => this.mockData.bookings[0] || null,
    delete: async () => this.mockData.bookings[0] || null,
  };

  review = {
    findMany: async () => this.mockData.reviews,
    findUnique: async () => this.mockData.reviews[0] || null,
    create: async (data: any) => ({ ...data, id: Date.now().toString() }),
    update: async () => this.mockData.reviews[0] || null,
    delete: async () => this.mockData.reviews[0] || null,
  };
}

// Export the appropriate database service
export const db: DatabaseService = process.env.MONGODB_URI 
  ? new MongoDBService() 
  : new MockDatabaseService();
