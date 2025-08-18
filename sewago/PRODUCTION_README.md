# SewaGo Production Deployment Guide

This guide covers the complete production deployment process for the SewaGo application, including frontend, backend, and MongoDB Atlas database setup.

## 🚀 Quick Start

1. **Set up MongoDB Atlas**
2. **Configure environment variables**
3. **Deploy backend to Railway**
4. **Deploy frontend to Vercel**
5. **Run database migrations**

## 📋 Prerequisites

- [Node.js 20+](https://nodejs.org/)
- [Railway CLI](https://railway.app/docs/cli)
- [Vercel CLI](https://vercel.com/docs/cli)
- [MongoDB Atlas account](https://www.mongodb.com/atlas)
- [GitHub account](https://github.com/)

## 🗄️ MongoDB Atlas Setup

### 1. Create Cluster
1. Sign up/login to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new project
3. Build a new cluster (M0 Free tier is sufficient for development)
4. Choose your preferred cloud provider and region

### 2. Configure Database Access
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Create a user with read/write permissions
4. Save the username and password

### 3. Configure Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. For production, add `0.0.0.0/0` to allow all IPs
4. For development, add your local IP address

### 4. Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<username>`, `<password>`, and `<dbname>` with your values

## 🔧 Environment Configuration

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
# Production Environment
NODE_ENV=production
PORT=4000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sewago?retryWrites=true&w=majority
CLIENT_ORIGIN=https://your-frontend-domain.vercel.app

# JWT Secrets (Generate secure 64-character secrets)
JWT_ACCESS_SECRET=your-64-character-access-secret-key-here
JWT_REFRESH_SECRET=your-64-character-refresh-secret-key-here

# Payment Gateway Configuration
ESewa_MERCHANT_CODE=your-esewa-merchant-code
Khalti_SECRET_KEY=your-khalti-secret-key

# Security
ALLOW_SEEDING=false
SEED_KEY=your-32-character-seed-key-here

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=200
LOGIN_RATE_LIMIT_MAX=5
BOOKING_RATE_LIMIT_MAX=30

# Monitoring
ENABLE_METRICS=true
ENABLE_HEALTH_CHECKS=true
```

### Frontend Environment Variables

Create a `.env.local` file in the `frontend/` directory:

```bash
# Database
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/sewago?retryWrites=true&w=majority

# Authentication
NEXTAUTH_URL=https://your-frontend-domain.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret-here

# Backend API
NEXT_PUBLIC_API_URL=https://your-backend-domain.railway.app
```

## 🚂 Backend Deployment (Railway)

### 1. Install Railway CLI
```bash
npm install -g @railway/cli
```

### 2. Login to Railway
```bash
railway login
```

### 3. Initialize Railway Project
```bash
cd backend
railway init
```

### 4. Set Environment Variables
```bash
railway variables set NODE_ENV=production
railway variables set PORT=4000
railway variables set MONGODB_URI="your-mongodb-connection-string"
railway variables set JWT_ACCESS_SECRET="your-jwt-access-secret"
railway variables set JWT_REFRESH_SECRET="your-jwt-refresh-secret"
railway variables set CLIENT_ORIGIN="https://your-frontend-domain.vercel.app"
```

### 5. Deploy
```bash
railway up
```

### 6. Get Backend URL
```bash
railway domain
```

## 🌐 Frontend Deployment (Vercel)

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy
```bash
cd frontend
vercel --prod
```

### 4. Configure Environment Variables
In the Vercel dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add all required environment variables

## 🗄️ Database Migration

### 1. Generate Prisma Client
```bash
cd frontend
npx prisma generate
```

### 2. Push Schema to Database
```bash
npx prisma db push
```

### 3. Verify Connection
```bash
npx prisma studio
```

## 🔒 Security Checklist

- [ ] JWT secrets are at least 64 characters long
- [ ] MongoDB connection string uses strong authentication
- [ ] Rate limiting is enabled and configured
- [ ] CORS is properly configured
- [ ] Helmet.js security headers are enabled
- [ ] Environment variables are not committed to git
- [ ] Database user has minimal required permissions
- [ ] HTTPS is enforced in production

## 📊 Monitoring & Health Checks

### Health Check Endpoints
- **Backend Health**: `GET /api/health`
- **Database Readiness**: `GET /api/ready`
- **Metrics**: `GET /api/metrics`

### Monitoring Setup
1. Set up Railway monitoring for backend
2. Configure Vercel analytics for frontend
3. Set up MongoDB Atlas monitoring
4. Configure error tracking (e.g., Sentry)

## 🚨 Troubleshooting

### Common Issues

#### Backend Won't Start
- Check MongoDB connection string
- Verify environment variables are set
- Check Railway logs: `railway logs`

#### Frontend Build Fails
- Ensure DATABASE_URL is set
- Check Prisma schema compatibility
- Verify all dependencies are installed

#### Database Connection Issues
- Verify MongoDB Atlas network access
- Check username/password in connection string
- Ensure database exists

### Debug Commands
```bash
# Check backend logs
railway logs

# Check frontend build
cd frontend && npm run build

# Test database connection
npx prisma db push --preview-feature

# Check environment variables
railway variables
```

## 📈 Performance Optimization

### Backend
- Enable compression middleware
- Implement caching strategies
- Use connection pooling for MongoDB
- Monitor memory usage

### Frontend
- Enable Next.js optimizations
- Implement image optimization
- Use dynamic imports for code splitting
- Enable PWA features

## 🔄 CI/CD Pipeline

### GitHub Actions
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Deploy Backend
        run: |
          npm install -g @railway/cli
          railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
      
      - name: Deploy Frontend
        run: |
          npm install -g vercel
          vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

## 📞 Support

For deployment issues:
1. Check Railway and Vercel documentation
2. Review application logs
3. Verify environment configuration
4. Test locally with production environment variables

## 🔄 Updates & Maintenance

### Regular Maintenance
- Monitor application performance
- Update dependencies regularly
- Review security advisories
- Backup database regularly
- Monitor costs and usage

### Update Process
1. Test changes locally
2. Deploy to staging environment
3. Run full test suite
4. Deploy to production
5. Monitor for issues

---

**Remember**: Always test your deployment process in a staging environment before going to production!
