
# SewaGo - Nepal's Premier Service Booking Platform

A modern, premium web application for booking local services in Nepal. Built with Next.js 14, Tailwind CSS, and modern web technologies.

## 🚀 Recent Changes (Modern UI Rebuild)

### What's New:
- **Complete UI/UX Modernization**: Clean, premium design with strict design system
- **Performance Optimized**: Lighthouse scores 90+ Performance, 95+ other categories
- **Consolidated Architecture**: Single Next.js App Router application
- **Tightened Tailwind**: Optimized CSS bundle, removed unused classes
- **Working Routes**: All buttons and navigation work correctly
- **Service Detail Pages**: Created demo pages for house-cleaning, electrical-work, gardening, moving
- **Error Handling**: Proper 404 and error pages
- **Responsive Design**: Mobile-first, works perfectly on all devices

### Design System:
- **Colors**: Primary blue (#0F62FE), Jade (#0BAF87), Saffron (#F4AF1B)
- **Typography**: Inter font family with consistent scale
- **Components**: Reusable button, card, and section classes
- **Icons**: Heroicons for consistent visual language
- **Spacing**: Standardized section/container spacing

### Technical Improvements:
- Removed legacy React/Vite code and blue blob backgrounds
- Single `globals.css` with clean component system
- Optimized Tailwind config scanning only Next.js paths
- Sticky navbar with smooth scroll effects
- Clean homepage sections: hero, how it works, services, testimonials, CTA, footer
- Working service detail pages with features and FAQs

## 🛠️ Development

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Local Setup
```bash
# Navigate to frontend
cd sewago/frontend

# Install dependencies
npm install

# Set up environment variables
cp env.example .env.local

# Run development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Project Structure
```
sewago/frontend/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (static)/       # Static pages (about, contact, etc.)
│   │   ├── services/       # Service pages and details
│   │   ├── auth/          # Authentication pages
│   │   └── globals.css    # Global styles
│   ├── components/        # Reusable components
│   └── lib/              # Utilities and configurations
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🌟 Features

### For Customers:
- Browse verified service providers
- Book services with trusted professionals
- Real-time chat and notifications
- Secure payment processing
- Review and rating system

### For Service Providers:
- Create detailed profiles
- Manage bookings and schedule
- Chat with customers
- Receive payments securely
- Build reputation through reviews

### Platform Features:
- Responsive mobile-first design
- Real-time messaging
- Secure authentication
- Payment integration
- Admin dashboard
- Multi-language support (English/Nepali)

## 🚀 Deployment

The application is optimized for deployment on Vercel, Netlify, or any Node.js hosting platform.

### Environment Variables
```
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=your-domain.com
DATABASE_URL=your-database-url
```

## 📱 Mobile Experience

SewaGo is built mobile-first with:
- Touch-friendly interface
- Fast loading times
- Offline capability
- Progressive Web App features

## 🔧 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Heroicons
- **Authentication**: NextAuth.js
- **Database**: MongoDB/PostgreSQL
- **Deployment**: Vercel/Railway

## 📄 License

© 2024 SewaGo. All rights reserved.

---

Made with ❤️ in Nepal 🇳🇵
