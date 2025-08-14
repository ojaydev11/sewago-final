
# SewaGo - Local Services Platform MVP

A production-ready MVP for connecting local service providers with customers in Nepal. Built with Next.js App Router, MongoDB/Mongoose, and modern web technologies.

## 🚀 Features

### ✅ Implemented MVP Features

1. **Authentication & Roles**
   - Credentials-based authentication with bcrypt
   - Role-based access: Customer, Provider, Admin
   - Protected routes and role-based redirects
   - User avatar and dropdown menu in header

2. **Services Management**
   - `/services` - Server-side rendered service grid with ISR
   - `/services/[slug]` - Detailed service pages with booking CTAs
   - 10+ pre-seeded services with realistic data
   - Service categories, pricing, and verification badges

3. **Booking System**
   - Multi-step booking flow (Date/Time → Address/Notes)
   - `/services/[slug]/book` - Complete booking process
   - API endpoints for creating and managing bookings
   - Role-based booking views

4. **User Dashboards**
   - `/dashboard` - Customer dashboard with upcoming/past bookings
   - `/provider` - Provider dashboard (job queue, today's jobs)
   - `/admin` - Admin dashboard for service and provider management

5. **Provider Onboarding**
   - `/provider/onboarding` - Complete provider profile setup
   - Skills, districts, bio, availability, and certifications
   - Admin verification workflow

6. **Contact & Support**
   - `/contact` - Contact form with support ticket creation
   - `/api/contact` - API endpoint for support requests
   - SupportTicket model for tracking inquiries

7. **Pricing & Information**
   - `/pricing` - Dynamic pricing page reading from service basePrice
   - Service cards with "Book" buttons linking to correct slugs
   - Transparent pricing display

8. **Internationalization (i18n)**
   - English (EN) and Nepali (NE) language support
   - Header language toggle
   - Localized navigation and content

9. **Security & Performance**
   - Edge middleware with rate limiting
   - Secure authentication with JWT
   - Input validation and sanitization
   - Responsive design with skeleton loading states

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth.js with credentials provider
- **State Management**: Zustand, React Query
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React, Heroicons
- **Notifications**: Sonner toast notifications
- **Date Handling**: date-fns
- **Internationalization**: next-intl

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB database
- npm or yarn package manager

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd sewago-final
npm install
```

### 2. Environment Setup

Create `.env.local` in the frontend directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/sewago

# Authentication
AUTH_SECRET=your-super-secret-auth-key-here
NEXTAUTH_URL=http://localhost:5000
NEXTAUTH_SECRET=your-nextauth-secret-here

# Optional: Email (for contact form)
RESEND_API_KEY=your-resend-api-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 3. Database Setup

```bash
# Start MongoDB (if running locally)
mongod

# Seed the database with initial data
cd sewago/frontend
npm run seed
```

### 4. Start Development

```bash
# Start both frontend and backend
npm run dev

# Or start individually
npm run dev --prefix frontend
npm run dev --prefix backend
```

The app will be available at:
- Frontend: http://localhost:5000
- Backend: http://localhost:3001

## 🧪 How to Test MVP

### 1. **Initial Setup & Database**
```bash
# Ensure MongoDB is running
npm run seed  # Creates test users and services
```

### 2. **Test User Credentials**
```
Admin User:
- Email: admin@sewago.com
- Password: admin123
- Access: /admin (full system access)

Customer User:
- Email: john@example.com  
- Password: customer123
- Access: /dashboard (booking management)

Provider User:
- Email: ram@example.com
- Password: provider123
- Access: /provider (job management)
```

### 3. **Core User Flows**

#### **Customer Journey**
1. **Browse Services**
   - Visit `/services` - See all available services
   - Click on service cards to view details
   - Verify pricing displays correctly

2. **Book a Service**
   - Click "Book Now" on any service
   - Complete 2-step booking process:
     - Step 1: Select date & time
     - Step 2: Enter address & notes
   - Submit booking

3. **Manage Bookings**
   - Visit `/dashboard` (customer role)
   - View upcoming and past bookings
   - Cancel pending bookings
   - Rebook completed services

#### **Provider Journey**
1. **Complete Onboarding**
   - Login as provider user
   - Visit `/provider/onboarding`
   - Fill out skills, districts, bio, availability
   - Submit for admin verification

2. **Provider Dashboard**
   - View job queue and today's jobs
   - Accept/decline service requests
   - Manage availability and rates

#### **Admin Journey**
1. **Service Management**
   - Login as admin user
   - Access `/admin` dashboard
   - View all services and providers
   - Verify provider applications

2. **System Overview**
   - Monitor user registrations
   - Track service performance
   - Manage support tickets

### 4. **Key Features Testing**

#### **Authentication & Authorization**
- [ ] Login/logout functionality
- [ ] Role-based route protection
- [ ] Session persistence
- [ ] Unauthorized access prevention

#### **Service Discovery**
- [ ] Service grid loads correctly
- [ ] Service details display properly
- [ ] Pricing information accurate
- [ ] Booking CTAs work correctly

#### **Booking System**
- [ ] Multi-step form validation
- [ ] Date/time selection works
- [ ] Address and notes submission
- [ ] Booking confirmation

#### **Responsive Design**
- [ ] Mobile-first layout
- [ ] Tablet and desktop views
- [ ] Touch-friendly interactions
- [ ] Loading states and skeletons

#### **Internationalization**
- [ ] Language toggle functionality
- [ ] EN/NE content switching
- [ ] Localized navigation
- [ ] RTL support considerations

### 5. **API Endpoints Testing**

#### **Bookings API**
```bash
# Create booking
POST /api/bookings
{
  "serviceSlug": "house-cleaning",
  "date": "2024-12-25",
  "timeSlot": "09:00 AM",
  "address": "123 Main St, Kathmandu",
  "notes": "Please bring cleaning supplies"
}

# Get user bookings
GET /api/bookings?status=pending
```

#### **Contact API**
```bash
# Submit support ticket
POST /api/contact
{
  "name": "Test User",
  "email": "test@example.com",
  "subject": "Test Inquiry",
  "message": "This is a test message"
}
```

### 6. **Performance & Security Testing**

#### **Performance**
- [ ] Lighthouse score 90+ on all pages
- [ ] Fast page load times (<3s)
- [ ] Smooth animations and transitions
- [ ] Efficient database queries

#### **Security**
- [ ] Input validation and sanitization
- [ ] Rate limiting on API endpoints
- [ ] Secure authentication tokens
- [ ] XSS and CSRF protection

### 7. **Edge Cases & Error Handling**

#### **Error Scenarios**
- [ ] Invalid form submissions
- [ ] Network failures
- [ ] Database connection issues
- [ ] Authentication failures

#### **User Experience**
- [ ] Clear error messages
- [ ] Loading states
- [ ] Form validation feedback
- [ ] Responsive error handling

## 🔧 Development Commands

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Lint code
npm run lint

# Type checking
npm run type-check

# Seed database
npm run seed

# E2E testing
npm run e2e
```

## 📁 Project Structure

```
sewago/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # Reusable UI components
│   │   ├── lib/             # Utility functions and libraries
│   │   ├── models/          # Mongoose data models
│   │   └── providers/       # React context providers
│   ├── public/              # Static assets
│   └── scripts/             # Database seeding and utilities
├── backend/                  # Express.js backend API
│   ├── src/
│   │   ├── controllers/     # API route handlers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Data models
│   │   └── routes/          # API route definitions
└── scripts/                  # Development and deployment scripts
```

## 🚀 Deployment

### Vercel (Frontend)
```bash
# Deploy to Vercel
vercel --prod
```

### Railway (Backend)
```bash
# Deploy to Railway
railway up
```

### Environment Variables
Ensure all required environment variables are set in your deployment platform.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact: support@sewago.com
- Documentation: [Wiki Link]

---

**SewaGo MVP** - Ready for production deployment and user testing! 🎉
