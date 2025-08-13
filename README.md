
# 🏠 SewaGo - Professional Home Services Platform

**SewaGo** is Nepal's premier platform for booking professional home services. Connect with verified service providers for house cleaning, electrical work, plumbing, and more across Kathmandu, Lalitpur, and Bhaktapur.

## ✨ **Latest Features (Batch 3)**

### 🔒 **Cash on Delivery Payment System**
- **Primary Payment**: Cash on Service Delivery (COD) - pay after service completion
- **Future Ready**: eSewa integration built-in but disabled (feature flagged)
- **No Advance Payment**: Book services without upfront costs
- **Transparent Pricing**: Clear cost breakdown before booking

### 🌟 **Trust & Quality Features**
- **30-Day Workmanship Warranty** on applicable services
- **Verified Provider Badges** with KYC verification
- **Customer Reviews System** with star ratings and testimonials
- **Quality Guarantee** on all services

### 📍 **Programmatic SEO**
- **Service × City Pages**: Dedicated landing pages for each service in each city
- **Local SEO Optimization**: City-specific content and targeting
- **Structured Data**: JSON-LD schema for better search visibility
- **Internal Linking**: Strategic cross-linking between services and cities

### 🎛️ **Feature Flag System**
- `PAYMENTS_ESEWA_ENABLED`: Toggle eSewa payment method
- `REVIEWS_ENABLED`: Enable/disable reviews functionality  
- `WARRANTY_BADGE_ENABLED`: Show/hide warranty badges
- Easy feature management through environment variables

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+
- npm 8+
- MongoDB (local or Atlas)

### **Installation**

```bash
# Clone the repository
git clone <repository-url>
cd sewago/frontend

# Install dependencies
npm install

# Set up environment variables
cp env.example .env.local
# Edit .env.local with your configuration

# Run development server
npm run dev
```

### **Environment Configuration**

```env
# Feature Flags
NEXT_PUBLIC_PAYMENTS_ESEWA_ENABLED=false
NEXT_PUBLIC_REVIEWS_ENABLED=true
NEXT_PUBLIC_WARRANTY_BADGE_ENABLED=true

# Database
MONGODB_URI=mongodb://localhost:27017/sewago

# Authentication
AUTH_SECRET=your-super-secure-32-character-secret-key
NEXTAUTH_URL=http://localhost:5000
NEXTAUTH_SECRET=your-super-secure-32-character-secret-key

# Feature toggles
NEXT_PUBLIC_BOOKING_ENABLED=true
NEXT_PUBLIC_AUTH_ENABLED=true
```

## 💰 **Payment System**

### **Current: Cash on Delivery (COD)**
- **Default Payment Method**: Cash payment after service completion
- **No Risk**: Customers pay only after satisfactory service delivery
- **Booking Process**: Select COD → Schedule service → Pay provider directly

### **Future: eSewa Integration**
The eSewa payment system is built-in but disabled by default. To enable:

1. Set environment variable: `NEXT_PUBLIC_PAYMENTS_ESEWA_ENABLED=true`
2. Add eSewa credentials to environment:
   ```env
   ESEWA_MERCHANT_CODE=your-merchant-code
   ESEWA_SECRET_KEY=your-secret-key
   ```
3. The eSewa option will automatically appear in the payment selection

## 🛠️ **Adding New Services**

### **1. Add Service Content**
Create a new service file in `content/services/`:

```json
{
  "name": "New Service",
  "slug": "new-service",
  "description": "Service description",
  "category": "Category",
  "price": {
    "min": 1000,
    "max": 5000,
    "unit": "per service"
  },
  "features": ["Feature 1", "Feature 2"],
  "hasWarranty": true,
  "warrantyDays": 30
}
```

### **2. Update Constants**
Add the service slug to relevant arrays in:
- `src/app/services/[slug]/[city]/page.tsx` (SERVICES array)
- `src/app/sitemap.ts` (SERVICES array)

### **3. Add City Pages**
City-specific pages are automatically generated for each service in:
- `/services/[service-slug]/kathmandu`
- `/services/[service-slug]/lalitpur`
- `/services/[service-slug]/bhaktapur`

## 🏙️ **Supported Cities**

- **Kathmandu**: Nepal's capital and largest metropolitan area
- **Lalitpur**: Historic city known for arts and culture  
- **Bhaktapur**: Ancient city with rich cultural heritage

Each city has dedicated service pages with local SEO optimization.

## 🧪 **Development**

### **Available Scripts**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run tests
```

### **Testing**
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

## 📈 **Performance & SEO**

### **Lighthouse Targets**
- Performance: ≥ 90 (mobile)
- Best Practices: ≥ 95
- Accessibility: ≥ 95  
- SEO: ≥ 95

### **SEO Features**
- Dynamic meta tags for all pages
- JSON-LD structured data
- Automatic sitemap generation
- Service × city landing pages
- Internal linking optimization

## 🔧 **Deployment**

### **Vercel (Recommended)**
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main

### **Environment Variables for Production**
```env
NEXT_PUBLIC_PAYMENTS_ESEWA_ENABLED=false
NEXT_PUBLIC_REVIEWS_ENABLED=true
NEXT_PUBLIC_WARRANTY_BADGE_ENABLED=true
MONGODB_URI=your-production-mongodb-uri
AUTH_SECRET=your-production-secret
NEXTAUTH_URL=https://your-domain.vercel.app
```

### **Clear Build Cache**
If you encounter build issues, clear Vercel's build cache:
```bash
# In Vercel dashboard: Settings > Functions > Clear Build Cache
```

## 🚀 **Batch 8: Scale & Monetization Features**

### **Dynamic Pricing & Surge System**
- Smart pricing modifiers based on demand, time, and location
- Express slot surcharges and off-peak discounts
- Transparent pricing breakdown for customers

### **Promotions & Loyalty**
- Promo code system with usage limits and expiration
- First booking and win-back campaigns
- Stackable promotions with business rule validation

### **SewaGo Wallet**
- Unified credit system for loyalty, referrals, and resolutions
- Automatic credit application at checkout
- Comprehensive transaction history and export

### **Partner API & Webhooks**
- RESTful API for partners with token authentication
- Real-time webhooks for booking lifecycle events
- HMAC signature verification and replay protection

### **Advanced Search & Discovery**
- Multi-filter search with autocomplete
- Personalized suggestions based on search history
- Search analytics and conversion tracking

### **Data Analytics & Export**
- Comprehensive KPI dashboard for admins
- Data export capabilities for external BI tools
- Event tracking and warehouse preparation

### **Feature Flags for Batch 8**
```env
NEXT_PUBLIC_SURGE_ENABLED=false
NEXT_PUBLIC_PROMOS_ENABLED=false
NEXT_PUBLIC_WALLET_ENABLED=false
NEXT_PUBLIC_PARTNER_API_ENABLED=false
NEXT_PUBLIC_WEBHOOKS_ENABLED=false
NEXT_PUBLIC_SEARCH_ENABLED=true
```

## 📝 **Changelog - Batch 3**

### **Added**
- ✅ Cash on Delivery (COD) payment system
- ✅ 30-day workmanship warranty program
- ✅ Customer reviews and ratings system
- ✅ Verified provider badges
- ✅ Programmatic SEO with service × city pages
- ✅ Feature flag system for easy configuration
- ✅ Enhanced booking wizard with location and payment selection
- ✅ Trust elements and quality guarantees
- ✅ Local SEO optimization for all major cities

### **Enhanced**
- ✅ Service detail pages with reviews and warranty information
- ✅ Homepage with cities section and trust indicators
- ✅ About page with vetting process and company information
- ✅ Sitemap with all service and city combinations
- ✅ JSON-LD structured data for better search visibility

### **Technical**
- ✅ Next.js App Router with TypeScript
- ✅ Feature flag configuration system
- ✅ Enhanced booking model with payment status tracking
- ✅ Review system with verification status
- ✅ Programmatic page generation for SEO

## 🎯 **Business Model**

- **Cash on Delivery**: Primary payment method, no advance required
- **Service Warranty**: 30-day guarantee on workmanship
- **Provider Verification**: Thorough vetting process for quality assurance
- **Local Focus**: City-specific services with local professional networks

## 📞 **Support**

- **Phone**: +977-9800000000
- **Hours**: 7 AM - 10 PM, 7 days a week
- **Coverage**: Kathmandu, Lalitpur, Bhaktapur

---

**SewaGo** - Professional services at your doorstep 🏠✨
