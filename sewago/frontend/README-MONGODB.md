# SewaGo - MongoDB Integration Guide

## 🗄️ **MongoDB Database Integration**

This guide covers the complete MongoDB integration for SewaGo, including enhanced models, authentication, and database operations.

## 🚀 **Features**

### **Enhanced MongoDB Models**
- **User**: Customer and provider accounts with role-based access
- **Service**: Service catalog with pricing and categories
- **ProviderProfile**: Detailed provider information and specialties
- **Address**: User address management with default handling
- **Booking**: Complete booking system with status tracking
- **Review**: Customer reviews and ratings system

### **Database Features**
- **MongoDB ODM**: Using Mongoose for type-safe operations
- **Connection Pooling**: Optimized database connections
- **Indexing**: Performance-optimized database queries
- **Data Validation**: Schema-based validation and constraints
- **Mock Fallback**: Development mode without database connection

## 🛠️ **Setup Instructions**

### **1. Environment Configuration**

Create a `.env.local` file in the `frontend` directory:

```env
# MongoDB Configuration
MONGODB_URI="mongodb://localhost:27017/sewago"
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/sewago

# Authentication
AUTH_SECRET="your-secret-key-here"
AUTH_URL="http://localhost:3000"

# Feature Flags
NEXT_PUBLIC_BOOKING_ENABLED=true
NEXT_PUBLIC_AUTH_ENABLED=true
NEXT_PUBLIC_I18N_ENABLED=true
NEXT_PUBLIC_SEWAAI_ENABLED=true
NEXT_PUBLIC_QUOTE_ESTIMATOR_ENABLED=true

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

### **2. MongoDB Setup**

#### **Option A: Local MongoDB**
```bash
# Install MongoDB locally
# macOS: brew install mongodb-community
# Ubuntu: sudo apt install mongodb
# Windows: Download from mongodb.com

# Start MongoDB service
mongod --dbpath /data/db
```

#### **Option B: MongoDB Atlas (Cloud)**
1. Create account at [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a new cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env.local`

### **3. Install Dependencies**
```bash
npm install
```

### **4. Seed Database**
```bash
# Populate with sample data
npm run db:seed

# Reset database (clears all data)
npm run db:reset
```

## 📊 **Database Schema**

### **User Model**
```typescript
interface IUser {
  name: string;
  email: string;
  passwordHash: string;
  role: 'CUSTOMER' | 'PROVIDER' | 'ADMIN';
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### **Service Model**
```typescript
interface IService {
  title: string;
  slug: string;
  description: string;
  category: string;
  imageUrl?: string;
  priceRange: { min: number; max: number };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### **ProviderProfile Model**
```typescript
interface IProviderProfile {
  userId: ObjectId;
  bio?: string;
  specialties: string[];
  experience: number;
  rating: number;
  totalJobs: number;
  isVerified: boolean;
  phone?: string;
  city: string;
  state: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### **Booking Model**
```typescript
interface IBooking {
  userId: ObjectId;
  serviceId: ObjectId;
  providerId?: ObjectId;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  scheduledAt: Date;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  notes?: string;
  priceEstimateMin: number;
  priceEstimateMax: number;
  createdAt: Date;
  updatedAt: Date;
}
```

## 🔐 **Authentication System**

### **NextAuth.js Configuration**
- **MongoDB Adapter**: Stores sessions and accounts in MongoDB
- **Credentials Provider**: Email/password authentication
- **JWT Strategy**: Secure session management
- **Role-Based Access**: Customer, Provider, and Admin roles

### **Password Security**
- **bcryptjs**: Secure password hashing (12 rounds)
- **Salt Generation**: Automatic salt generation
- **Hash Verification**: Secure password comparison

## 🗃️ **Database Operations**

### **Service Layer**
The `db.ts` file provides a unified interface for all database operations:

```typescript
// Find all services
const services = await db.service.findMany({
  where: { isActive: true },
  include: { reviews: true }
});

// Create a new user
const user = await db.user.create({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'securepassword',
  role: 'CUSTOMER'
});

// Update booking status
const booking = await db.booking.update({
  where: { id: 'bookingId' },
  data: { status: 'CONFIRMED' }
});
```

### **Query Features**
- **Population**: Automatic related data loading
- **Filtering**: Complex where clauses
- **Sorting**: Order by any field
- **Pagination**: Skip and limit support
- **Indexing**: Optimized query performance

## 🧪 **Testing & Development**

### **Mock Database**
When `MONGODB_URI` is not set, the system automatically falls back to a mock database:

```typescript
// Mock data for development
const mockData = {
  users: [],
  services: [],
  providerProfiles: [],
  addresses: [],
  bookings: [],
  reviews: [],
};
```

### **Test Scripts**
```bash
# Run tests
npm run test

# Type checking
npm run typecheck

# Linting
npm run lint
```

## 🚀 **Production Deployment**

### **Vercel Configuration**
1. **Set Environment Variables**:
   - `MONGODB_URI`: Your MongoDB connection string
   - `AUTH_SECRET`: Secure random string
   - `AUTH_URL`: Your production URL

2. **MongoDB Atlas Setup**:
   - Whitelist Vercel IP addresses
   - Use connection string with retryWrites
   - Enable network access for your region

### **Performance Optimization**
- **Connection Pooling**: Reuse database connections
- **Indexing**: Optimized query performance
- **Caching**: Next.js built-in caching
- **CDN**: Vercel edge caching

## 🔧 **Troubleshooting**

### **Common Issues**

#### **Connection Failed**
```bash
# Check MongoDB service
sudo systemctl status mongodb

# Verify connection string
echo $MONGODB_URI

# Test connection
mongosh "your-connection-string"
```

#### **Authentication Errors**
```bash
# Verify AUTH_SECRET is set
echo $AUTH_SECRET

# Check NextAuth configuration
npm run build
```

#### **Model Errors**
```bash
# Clear node_modules
rm -rf node_modules package-lock.json
npm install

# Regenerate types
npm run typecheck
```

### **Debug Mode**
```bash
# Enable debug logging
DEBUG=* npm run dev

# MongoDB debug
DEBUG=mongoose:* npm run dev
```

## 📚 **API Endpoints**

### **Authentication**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### **Services**
- `GET /api/services` - List services
- `GET /api/services/[slug]` - Service details
- `POST /api/services` - Create service

### **Bookings**
- `GET /api/bookings` - User bookings
- `POST /api/bookings` - Create booking
- `PATCH /api/bookings/[id]` - Update booking

## 🎯 **Next Steps**

1. **Set up MongoDB** (local or Atlas)
2. **Configure environment variables**
3. **Seed the database** with sample data
4. **Test authentication** flow
5. **Deploy to production**

## 📞 **Support**

For MongoDB-related issues:
1. Check the troubleshooting section
2. Verify environment variables
3. Test database connection
4. Review error logs

---

**Your SewaGo application is now fully integrated with MongoDB and ready for production!** 🚀
