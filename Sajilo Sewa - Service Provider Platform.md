# Sajilo Sewa - Service Provider Platform

A mobile-first web application for users in Kathmandu to find and book trusted local service providers such as electricians, plumbers, cleaners, tutors, mechanics, and handymen.

## 🚀 Features

### ✅ Implemented Features

**User Authentication & Management**
- User registration and login system
- Support for two user types: Customers and Service Providers
- JWT-based authentication with secure session management
- User profile management

**Service Categories & Providers**
- 6 service categories: Plumber, Electrician, Cleaner, Tutor, Mechanic, Handyman
- Service provider listings with detailed profiles
- Search and filtering functionality
- Provider ratings and reviews display
- Verification badges for trusted providers

**Mobile-First Design**
- Responsive design optimized for mobile devices
- Modern UI with professional styling
- Touch-friendly interface
- Cross-platform compatibility

**Admin Dashboard**
- Admin interface for platform management
- User management (activate/deactivate accounts)
- Service provider verification system
- Platform statistics and analytics

### 🔄 Future Enhancements
- Booking system with time selection
- Customer reviews and ratings submission
- Real-time notifications
- Payment integration
- Location-based filtering
- Advanced search filters

## 🛠 Tech Stack

**Backend**
- **Framework**: Flask (Python)
- **Database**: SQLite with SQLAlchemy ORM
- **Authentication**: JWT tokens
- **API**: RESTful API design
- **CORS**: Enabled for frontend-backend communication

**Frontend**
- **Framework**: React 18
- **Styling**: Tailwind CSS
- **UI Components**: Custom component library
- **Routing**: React Router
- **State Management**: React Context API
- **Build Tool**: Vite

**Development Tools**
- **Package Manager**: pnpm (frontend), pip (backend)
- **Environment**: Virtual environment for Python dependencies
- **Development Server**: Vite dev server + Flask development server

## 📁 Project Structure

```
sajilo-sewa/
├── backend/                 # Flask backend application
│   ├── src/
│   │   ├── models/         # Database models
│   │   ├── routes/         # API route handlers
│   │   ├── database/       # Database files
│   │   └── main.py         # Flask application entry point
│   ├── venv/               # Python virtual environment
│   ├── requirements.txt    # Python dependencies
│   └── init_db.py         # Database initialization script
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React context providers
│   │   └── App.jsx         # Main application component
│   ├── package.json        # Node.js dependencies
│   └── index.html          # HTML entry point
└── README.md              # Project documentation
```

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 20+
- pnpm package manager

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Initialize the database:
   ```bash
   python init_db.py
   ```

5. Start the Flask server:
   ```bash
   python src/main.py
   ```

The backend will be available at `http://localhost:5000`

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start the development server:
   ```bash
   pnpm run dev
   ```

The frontend will be available at `http://localhost:5173`

## 🔐 Demo Accounts

The application comes with pre-configured demo accounts for testing:

**Customer Account**
- Email: `customer@demo.com`
- Password: `password123`
- Type: Customer

**Service Provider Accounts**
- Email: `provider@demo.com`
- Password: `password123`
- Type: Service Provider (Plumber/Electrician)

- Email: `cleaner@demo.com`
- Password: `password123`
- Type: Service Provider (House/Office Cleaning)

## 📱 Usage

### For Customers
1. **Browse Services**: Visit the Services page to see all available service categories
2. **Find Providers**: Click on any service category to see available providers
3. **View Profiles**: Click "View Profile & Book" to see detailed provider information
4. **Search & Filter**: Use the search functionality to find specific providers or skills

### For Service Providers
1. **Register**: Create an account as a service provider
2. **Complete Profile**: Add skills, rates, experience, and description
3. **Get Verified**: Admin can verify your profile for increased trust
4. **Manage Availability**: Set your working hours and availability

### For Administrators
1. **Access Dashboard**: Navigate to `/admin` (demo: any authenticated user has admin access)
2. **Manage Users**: View and activate/deactivate user accounts
3. **Verify Providers**: Approve or revoke service provider verification
4. **View Analytics**: Monitor platform statistics and growth

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Services
- `GET /api/services/categories` - Get all service categories
- `GET /api/services/providers` - Get all service providers
- `GET /api/services/providers?category={name}` - Get providers by category

### Admin
- `GET /api/admin/stats` - Get platform statistics
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users/{id}/toggle-status` - Toggle user status
- `POST /api/admin/providers/{id}/toggle-verification` - Toggle provider verification

## 🎨 Design Features

- **Mobile-First**: Optimized for mobile devices with responsive design
- **Modern UI**: Clean, professional interface with intuitive navigation
- **Accessibility**: Touch-friendly buttons and readable typography
- **Performance**: Fast loading times with optimized assets
- **Cross-Browser**: Compatible with all modern browsers

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Secure password storage with hashing
- **CORS Protection**: Configured for secure cross-origin requests
- **Input Validation**: Server-side validation for all user inputs
- **SQL Injection Protection**: SQLAlchemy ORM prevents SQL injection

## 📈 Future Roadmap

1. **Booking System**: Complete booking flow with time selection
2. **Payment Integration**: Secure payment processing
3. **Real-time Chat**: Communication between customers and providers
4. **Mobile App**: Native mobile applications for iOS and Android
5. **Advanced Analytics**: Detailed reporting and insights
6. **Multi-language Support**: Nepali language support
7. **Location Services**: GPS-based provider matching

## 🤝 Contributing

This is a demo application built for showcasing modern web development practices. For production use, consider:

- Implementing proper admin role management
- Adding comprehensive error handling
- Setting up production database (PostgreSQL/MongoDB)
- Implementing proper logging and monitoring
- Adding automated testing
- Setting up CI/CD pipelines

## 📄 License

This project is created for demonstration purposes. Feel free to use and modify as needed.

## 📞 Support

For questions or support, please refer to the demo credentials and API documentation above.

---

**Built with ❤️ for the Kathmandu community**

