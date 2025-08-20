# SewaGo Deployment Guide

This guide covers the complete deployment process for SewaGo to production environments.

## 🎯 Pre-deployment Checklist

### ✅ Required Accounts & Services
- [ ] MongoDB Atlas cluster
- [ ] Railway account (backend hosting)
- [ ] Vercel account (frontend hosting)
- [ ] eSewa merchant account
- [ ] Khalti merchant account
- [ ] Domain name (optional but recommended)
- [ ] S3-compatible storage (AWS S3, DigitalOcean Spaces, etc.)

### ✅ Environment Configuration
- [ ] Copy `env.production.example` to `.env.production`
- [ ] Generate secure secrets using `openssl rand -hex 32`
- [ ] Configure all payment gateway credentials
- [ ] Set up MongoDB connection string
- [ ] Configure S3 storage credentials

## 🚀 Step-by-Step Deployment

### Step 1: MongoDB Setup

1. **Create MongoDB Atlas Cluster**
   ```bash
   # Visit https://cloud.mongodb.com/
   # Create new cluster
   # Get connection string
   ```

2. **Configure Database Security**
   ```bash
   # Add your IP address to whitelist
   # Create database user
   # Configure firewall rules
   ```

3. **Update Environment Variables**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sewago
   DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/sewago
   ```

### Step 2: Backend Deployment (Railway)

1. **Connect Repository to Railway**
   ```bash
   # Visit https://railway.app/
   # Create new project
   # Connect GitHub repository
   # Set root directory to "backend"
   ```

2. **Configure Environment Variables**
   Set these variables in Railway dashboard:
   ```env
   NODE_ENV=production
   PORT=4000
   MONGODB_URI=your-mongodb-connection-string
   JWT_ACCESS_SECRET=your-64-character-secret
   JWT_REFRESH_SECRET=your-64-character-secret
   CLIENT_ORIGIN=https://your-frontend-domain.vercel.app
   ```

3. **Deploy Backend**
   ```bash
   # Railway will automatically deploy on push to main branch
   # Verify deployment at: https://your-app.railway.app/api/health
   ```

### Step 3: Frontend Deployment (Vercel)

1. **Connect Repository to Vercel**
   ```bash
   # Visit https://vercel.com/
   # Import project from GitHub
   # Set root directory to "frontend"
   ```

2. **Configure Build Settings**
   ```bash
   # Build Command: npm run build
   # Output Directory: .next
   # Install Command: npm install
   ```

3. **Configure Environment Variables**
   Set these variables in Vercel dashboard:
   ```env
   NODE_ENV=production
   NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app
   DATABASE_URL=your-mongodb-connection-string
   SKIP_DB=true
   ```

4. **Deploy Frontend**
   ```bash
   # Vercel will automatically deploy on push to main branch
   # Verify deployment at: https://your-domain.vercel.app
   ```

### Step 4: Payment Gateway Configuration

#### eSewa Setup
1. **Get Merchant Credentials**
   ```bash
   # Contact eSewa for merchant account
   # Get merchant code and credentials
   ```

2. **Configure Environment Variables**
   ```env
   ESEWA_MERCHANT_CODE=your-merchant-code
   ESEWA_SUCCESS_URL=https://your-domain.vercel.app/payment/success
   ESEWA_FAILURE_URL=https://your-domain.vercel.app/payment/failed
   ```

#### Khalti Setup
1. **Get API Credentials**
   ```bash
   # Visit https://khalti.com/
   # Create merchant account
   # Get public and secret keys
   ```

2. **Configure Environment Variables**
   ```env
   KHALTI_PUBLIC_KEY=your-public-key
   KHALTI_SECRET_KEY=your-secret-key
   ```

### Step 5: File Storage Setup (S3)

1. **Create S3 Bucket**
   ```bash
   # Create bucket for file uploads
   # Configure CORS policy
   # Set public read access for uploaded files
   ```

2. **Configure Environment Variables**
   ```env
   S3_ENDPOINT=https://your-s3-endpoint.com
   S3_ACCESS_KEY_ID=your-access-key
   S3_SECRET_ACCESS_KEY=your-secret-key
   S3_BUCKET_REVIEWS=sewago-reviews-prod
   ```

### Step 6: Domain Configuration

1. **Configure Custom Domain (Optional)**
   ```bash
   # In Vercel: Settings > Domains > Add Domain
   # Update DNS records as instructed
   # Wait for SSL certificate provisioning
   ```

2. **Update Environment Variables**
   ```env
   NEXT_PUBLIC_BASE_URL=https://your-custom-domain.com
   CLIENT_ORIGIN=https://your-custom-domain.com
   ```

## 🔧 Post-Deployment Configuration

### Database Seeding (Optional)

```bash
# If you need to seed initial data
cd backend
NODE_ENV=production ALLOW_SEEDING=true npm run seed
```

### Health Checks

```bash
# Backend health check
curl https://your-backend.railway.app/api/health

# Frontend health check
curl https://your-frontend.vercel.app
```

### Performance Monitoring

1. **Set up Error Tracking**
   ```env
   SENTRY_DSN=your-sentry-dsn
   SENTRY_ENVIRONMENT=production
   ```

2. **Configure Analytics**
   ```env
   GOOGLE_ANALYTICS_ID=your-ga-id
   ```

## 📊 Environment Variables Reference

### Backend (.env)
```env
# Core
NODE_ENV=production
PORT=4000
MONGODB_URI=mongodb+srv://...
CLIENT_ORIGIN=https://your-frontend.vercel.app

# Auth
JWT_ACCESS_SECRET=64-character-secret
JWT_REFRESH_SECRET=64-character-secret

# Payments
ESEWA_MERCHANT_CODE=your-code
KHALTI_SECRET_KEY=your-key

# Security
ALLOW_SEEDING=false
SEED_KEY=32-character-key

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=200
LOGIN_RATE_LIMIT_MAX=5

# Monitoring
ENABLE_METRICS=true
ENABLE_HEALTH_CHECKS=true
```

### Frontend (.env.local)
```env
# Core
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://your-backend.railway.app

# Database (for build-time)
DATABASE_URL=mongodb+srv://...
SKIP_DB=true

# Build
NEXT_TELEMETRY_DISABLED=1
```

## 🚨 Security Checklist

- [ ] All default secrets changed
- [ ] Strong passwords for all accounts
- [ ] Database firewall configured
- [ ] CORS origins restricted
- [ ] Rate limiting enabled
- [ ] HTTPS enforced
- [ ] Environment variables secured
- [ ] No secrets in code repository

## 📝 Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Check build logs in Vercel/Railway
   # Verify environment variables
   # Check Node.js version compatibility
   ```

2. **Database Connection Issues**
   ```bash
   # Verify MongoDB connection string
   # Check IP whitelist
   # Ensure database user has correct permissions
   ```

3. **Payment Gateway Issues**
   ```bash
   # Verify merchant credentials
   # Check callback URLs
   # Test in sandbox mode first
   ```

4. **File Upload Issues**
   ```bash
   # Verify S3 credentials
   # Check bucket permissions
   # Test CORS configuration
   ```

### Useful Commands

```bash
# Check backend logs
railway logs

# Check frontend logs
vercel logs

# Test API endpoints
curl -X GET https://your-backend.railway.app/api/health

# Check database connection
mongosh "mongodb+srv://your-connection-string"
```

## 📞 Support & Maintenance

### Monitoring URLs
- Backend Health: `https://your-backend.railway.app/api/health`
- Frontend: `https://your-frontend.vercel.app`
- Database: MongoDB Atlas dashboard

### Regular Maintenance
- Monitor error rates and performance
- Update dependencies monthly
- Backup database regularly
- Review security logs
- Update SSL certificates (automatic with Vercel/Railway)

### Emergency Contacts
- MongoDB Support: [MongoDB Support](https://support.mongodb.com/)
- Railway Support: [Railway Help](https://help.railway.app/)
- Vercel Support: [Vercel Support](https://vercel.com/support)

---

**🎉 Congratulations! SewaGo is now deployed to production.**

For ongoing maintenance and updates, refer to the CI/CD pipeline configured in `.github/workflows/`.