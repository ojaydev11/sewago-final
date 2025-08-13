# SewaGo - Local Services Platform

SewaGo is a modern, mobile-first web application that connects customers with local service providers in Nepal. Built with Next.js 15, TypeScript, and MongoDB, it offers a comprehensive platform for booking home services like cleaning, electrical work, gardening, and more.

## 🚀 Features

- **Modern Tech Stack**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Authentication**: NextAuth.js with role-based access control
- **Database**: MongoDB with Mongoose ODM
- **UI Components**: shadcn/ui component library with Lucide React icons
- **Payment Integration**: eSewa and Khalti payment methods (stubs)
- **Responsive Design**: Mobile-first approach with Nepali language support
- **Real-time Features**: Chat system and booking management
- **Admin Dashboard**: Complete service and provider management
- **Analytics**: Multi-provider analytics support (Vercel, PostHog, Google Analytics)

## 🏗️ Architecture

```
sewago/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── (static)/        # Static pages (about, contact, etc.)
│   │   ├── account/         # User account management
│   │   ├── admin/           # Admin dashboard
│   │   ├── api/             # API routes
│   │   ├── auth/            # Authentication pages
│   │   ├── book/            # Booking flow
│   │   ├── dashboard/       # Customer dashboard
│   │   ├── provider/        # Provider dashboard
│   │   ├── services/        # Service catalog
│   │   └── support/         # Support pages
│   ├── components/          # Reusable UI components
│   │   ├── site/            # Site-wide components (Header, Footer)
│   │   └── ui/              # shadcn/ui components
│   ├── lib/                 # Utility libraries
│   ├── models/              # Mongoose data models
│   └── providers/           # React context providers
├── public/                  # Static assets
├── scripts/                 # Database seeding and utilities
└── tests/                   # Test files
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **State Management**: React Query, Zustand
- **Testing**: Vitest, React Testing Library
- **Deployment**: Vercel (recommended)
- **Analytics**: Vercel Analytics, PostHog, Google Analytics

## 📋 Prerequisites

- Node.js 18+ 
- npm 8+ or yarn
- MongoDB database (local or Atlas)
- Git

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/sewago.git
cd sewago/frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the frontend directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/sewago
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sewago

# Authentication
AUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here

# Payment Configuration
NEXT_PUBLIC_PAYMENT_TEST_MODE=true
NEXT_PUBLIC_ESEWA_ENABLED=true
NEXT_PUBLIC_KHALTI_ENABLED=true
NEXT_PUBLIC_CARD_PAYMENTS_ENABLED=true

# Analytics (Optional)
NEXT_PUBLIC_ANALYTICS_ENABLED=true
NEXT_PUBLIC_ANALYTICS_PROVIDER=vercel
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id

# Site Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Database Setup

#### Option A: Local MongoDB
```bash
# Install MongoDB locally
# Start MongoDB service
mongod

# In another terminal, seed the database
npm run db:seed
```

#### Option B: MongoDB Atlas
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env.local`
5. Run the seed script:
```bash
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

### Test Coverage
The test suite covers:
- Utility functions
- Payment utilities
- Component rendering
- API endpoints
- Database operations

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository**
   - Push your code to GitHub
   - Connect your repository to Vercel

2. **Environment Variables**
   - Add all environment variables in Vercel dashboard
   - Ensure `MONGODB_URI` points to production database

3. **Deploy**
   - Vercel will automatically deploy on push to main branch
   - Preview deployments on pull requests

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 📱 Features & Routes

### Public Routes
- `/` - Home page with service search
- `/services` - Service catalog with filters
- `/services/[slug]` - Individual service details
- `/about` - About SewaGo
- `/contact` - Contact information
- `/faqs` - Frequently asked questions

### Authentication Routes
- `/auth/login` - User login
- `/auth/register` - User registration
- `/provider/register` - Provider registration

### Protected Routes
- `/dashboard` - Customer dashboard
- `/provider` - Provider dashboard
- `/admin` - Admin dashboard
- `/book` - Service booking flow
- `/provider/onboarding` - Provider profile setup

### API Routes
- `/api/auth/*` - Authentication endpoints
- `/api/services/*` - Service management
- `/api/bookings/*` - Booking management
- `/api/provider/*` - Provider management
- `/api/admin/*` - Admin operations

## 🔐 Authentication & Roles

### User Roles
- **Customer**: Book services, manage bookings
- **Provider**: Accept jobs, manage profile
- **Admin**: Platform management, user verification

### Session Management
- JWT-based authentication with NextAuth.js
- Role-based route protection
- Secure password hashing with bcrypt

## 💳 Payment Integration

### Supported Methods
- **eSewa**: Popular Nepali digital wallet
- **Khalti**: Digital payment platform
- **Credit/Debit Cards**: International payment support

### Test Mode
- Payment stubs for development
- Environment-based configuration
- Real API integration ready

## 📊 Analytics & Monitoring

### Analytics Providers
- **Vercel Analytics**: Built-in performance monitoring
- **PostHog**: Product analytics and user behavior
- **Google Analytics**: Traditional web analytics
- **Custom**: Custom analytics endpoint support

### Logging
- Structured logging with configurable levels
- Request ID tracking
- Performance monitoring
- Error tracking and reporting

## 🧪 Development

### Code Quality
```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Format code (if using Prettier)
npm run format
```

### Database Management
```bash
# Seed database
npm run db:seed

# Reset database
npm run db:reset

# View database (MongoDB Atlas)
npm run db:studio
```

### Component Development
- Use shadcn/ui components for consistency
- Follow Tailwind CSS utility-first approach
- Implement responsive design patterns
- Use TypeScript for type safety

## 🚀 Performance & SEO

### Performance Targets
- Lighthouse Performance: ≥90
- Lighthouse Accessibility: ≥95
- Core Web Vitals compliance
- Mobile-first optimization

### SEO Features
- Dynamic sitemap generation
- Robots.txt configuration
- Meta tags and Open Graph
- Structured data markup

## 🔧 Configuration

### Environment Variables
See `.env.example` for all available configuration options.

### Feature Flags
- Payment method toggles
- Analytics provider selection
- Test mode switches
- Development features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Development Guidelines
- Follow TypeScript best practices
- Use conventional commit messages
- Write comprehensive tests
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help
- Check the [FAQs](/faqs) page
- Review existing issues on GitHub
- Contact the development team

### Reporting Issues
- Use GitHub Issues for bug reports
- Include reproduction steps
- Provide environment details
- Attach relevant logs

## 🗺️ Roadmap

### Phase 1: Core Platform ✅
- [x] User authentication and roles
- [x] Service catalog and booking
- [x] Provider and customer dashboards
- [x] Basic payment integration

### Phase 2: Enhanced Features 🚧
- [ ] Real-time chat system
- [ ] Advanced search and filters
- [ ] Review and rating system
- [ ] Mobile app development

### Phase 3: Scale & Performance 🚧
- [ ] Performance optimization
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] API rate limiting

---

**Built with ❤️ in Nepal** 🇳🇵

For more information, visit [sewago.com](https://sewago.com) or contact the development team.
