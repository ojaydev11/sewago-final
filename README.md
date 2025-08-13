# SewaGo Premium - Nepal's Most Trusted Service Booking Platform

A premium, mobile-first web application for booking local services in Nepal. Built with React, Tailwind CSS, and modern web technologies.

## 🎨 Design System

### Colors
- **Primary**: #0F62FE (Trustworthy Blue)
- **Secondary**: #F4AF1B (Premium Gold)
- **Background**: #F8FAFC (Light Gray)
- **Text Primary**: #0B1220 (Dark Blue)
- **Text Secondary**: #475569 (Medium Gray)
- **Surface**: #FFFFFF (White)

### Typography
- **Font Family**: Inter (Google Fonts)
- **Heading Weights**: 600, 700
- **Body Weights**: 400, 500

### Layout
- **Max Width**: 7xl (80rem)
- **Section Padding**: px-6 md:px-8 lg:px-12 py-16
- **Mobile-First**: Responsive design starting from mobile

## ✨ Features

### Homepage
- **Hero Section**: Compelling headline with dual CTAs
- **How It Works**: 3-step process explanation
- **Service Categories**: Grid of popular services
- **Why Choose Us**: Trust badges and benefits
- **Testimonials**: Customer reviews carousel
- **CTA Banner**: Full-width call-to-action
- **Footer**: Quick links, contact info, social media

### Navigation
- **Sticky Navbar**: Logo left, navigation center, CTA right
- **Mobile Menu**: Responsive hamburger menu
- **Active States**: Visual feedback for current page

### Authentication
- **Login Page**: Email/password with social options
- **Register Page**: User registration with type selection
- **Form Validation**: Client-side validation
- **Error Handling**: User-friendly error messages

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sewago-final
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
npm run preview
```

## 🏗️ Project Structure

```
sewago-final/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Button, Card, etc.)
│   └── Navbar.jsx      # Navigation component
├── pages/              # Page components
│   ├── Home.jsx        # Homepage
│   ├── Login.jsx       # Login page
│   ├── Register.jsx    # Registration page
│   └── ...             # Other pages
├── contexts/            # React contexts
│   └── AuthContext.jsx # Authentication context
├── lib/                 # Utility functions
│   └── utils.js        # Helper functions
├── App.jsx              # Main app component
├── App.css              # Global styles
├── main.jsx            # App entry point
├── index.html          # HTML template
├── package.json        # Dependencies
├── tailwind.config.js  # Tailwind configuration
├── vite.config.js      # Vite configuration
└── README.md           # This file
```

## 🎯 Key Components

### Home Component
- **Hero Section**: Large headline with background gradient
- **Service Grid**: 4-column responsive grid
- **Trust Indicators**: Icons and benefits
- **Customer Reviews**: Testimonial cards
- **Call-to-Action**: Multiple CTA buttons

### Navbar Component
- **Sticky Positioning**: Fixed top navigation
- **Responsive Design**: Mobile-first approach
- **Active States**: Current page highlighting
- **CTA Button**: Prominent "Book Now" button

### UI Components
- **Button**: Multiple variants (primary, secondary, outline, ghost)
- **Card**: Flexible card component with header, content, footer
- **Form Elements**: Styled inputs, labels, and validation

## 🎨 Styling

### Tailwind CSS
- **Custom Colors**: Brand color palette
- **Custom Spacing**: Consistent spacing scale
- **Custom Shadows**: Soft, medium, and large shadows
- **Custom Animations**: Fade, slide, and scale animations

### CSS Custom Properties
- **Design Tokens**: Consistent color and spacing values
- **Component Classes**: Reusable utility classes
- **Animation Classes**: Smooth transitions and hover effects

## 📱 Responsive Design

### Breakpoints
- **Mobile**: Default (320px+)
- **Tablet**: md (768px+)
- **Desktop**: lg (1024px+)
- **Large Desktop**: xl (1280px+)

### Mobile-First Approach
- Base styles for mobile devices
- Progressive enhancement for larger screens
- Touch-friendly interactions
- Optimized for mobile performance

## 🔧 Development

### Scripts
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint

### Code Quality
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting (via ESLint)
- **TypeScript**: Type checking (future enhancement)

## 🌟 Performance Features

### Optimization
- **Lazy Loading**: Images and components below fold
- **Code Splitting**: Route-based code splitting
- **Tree Shaking**: Unused code elimination
- **Minification**: Production build optimization

### Best Practices
- **Semantic HTML**: Accessible markup
- **CSS Optimization**: Efficient selectors and properties
- **JavaScript Optimization**: Modern ES6+ features
- **Image Optimization**: WebP format support (future)

## 🚀 Deployment

### Vercel (Recommended)
1. Connect GitHub repository
2. Configure build settings
3. Deploy automatically on push

### Other Platforms
- **Netlify**: Static site hosting
- **AWS S3**: Cloud hosting
- **GitHub Pages**: Free hosting for open source

## 📈 SEO & Accessibility

### SEO Features
- **Meta Tags**: Proper title and description
- **Structured Data**: JSON-LD markup (future)
- **Open Graph**: Social media sharing
- **Sitemap**: XML sitemap generation (future)

### Accessibility
- **ARIA Labels**: Screen reader support
- **Keyboard Navigation**: Full keyboard support
- **Color Contrast**: WCAG AA compliance
- **Focus Management**: Proper focus indicators

## 🔮 Future Enhancements

### Planned Features
- **Service Provider Dashboard**: Provider management interface
- **Real-time Chat**: Customer-provider communication
- **Payment Integration**: Secure payment processing
- **Review System**: Customer feedback and ratings
- **Admin Panel**: Content and user management
- **Mobile App**: React Native application

### Technical Improvements
- **TypeScript**: Full type safety
- **Testing**: Jest and React Testing Library
- **State Management**: Redux Toolkit or Zustand
- **API Integration**: Backend service integration
- **PWA**: Progressive Web App features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- **Email**: info@sewago.com
- **Website**: https://sewago.com
- **Documentation**: [Link to docs]

---

**Built with ❤️ for Nepal's service industry** 
