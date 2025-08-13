
# 🚀 Deployment Notes - SewaGo

## 📋 Pre-Deployment Checklist

### ✅ Environment Variables
Ensure these are set in Vercel dashboard:

```env
# Feature Flags (Required)
NEXT_PUBLIC_PAYMENTS_ESEWA_ENABLED=false
NEXT_PUBLIC_REVIEWS_ENABLED=true
NEXT_PUBLIC_WARRANTY_BADGE_ENABLED=true

# Database (Required)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sewago?retryWrites=true&w=majority

# Authentication (Required)
AUTH_SECRET=your-super-secure-32-character-secret-key
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-super-secure-32-character-secret-key

# Optional Features
NEXT_PUBLIC_BOOKING_ENABLED=true
NEXT_PUBLIC_AUTH_ENABLED=true
NODE_ENV=production
```

### ✅ Build Settings
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Node.js Version**: 18.x or higher

## 🔧 Vercel Configuration

### Build Optimization
The project includes optimized build settings:
- Code splitting for better performance
- Image optimization enabled
- Automatic static generation for SEO pages

### Cache Settings
- Static assets: 1 year cache
- Dynamic content: No cache
- API routes: No cache with proper headers

## 🗄️ Database Setup

### MongoDB Atlas Setup
1. Create a MongoDB Atlas cluster
2. Set up database user with read/write permissions
3. Whitelist Vercel IP addresses (0.0.0.0/0 for simplicity)
4. Use connection string format:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/sewago?retryWrites=true&w=majority
   ```

### Seed Data
After deployment, consider seeding initial data:
- Service categories and listings
- Sample reviews and ratings
- City information
- Provider profiles

## 🚨 Common Issues & Solutions

### Build Failures
**Issue**: `next: not found` during build
**Solution**: Clear Vercel build cache in dashboard

**Issue**: TypeScript errors during build
**Solution**: Temporarily set `typescript.ignoreBuildErrors: true` in next.config.ts

**Issue**: Environment variables not working
**Solution**: Ensure all `NEXT_PUBLIC_` prefixed variables are set in Vercel dashboard

### Runtime Issues
**Issue**: Authentication not working
**Solution**: 
- Verify `AUTH_SECRET` and `NEXTAUTH_URL` are correctly set
- Ensure `NEXTAUTH_URL` matches your deployed domain exactly

**Issue**: Database connection failures
**Solution**:
- Check MongoDB Atlas IP whitelist
- Verify connection string format
- Test connection string in MongoDB Compass

### Performance Issues
**Issue**: Slow page loads
**Solution**:
- Check Lighthouse scores
- Optimize images with next/image
- Reduce JavaScript bundle size

## 📊 Post-Deployment Verification

### ✅ Functional Testing
1. **Homepage loads correctly** with all sections
2. **Service pages accessible** via `/services/[slug]`
3. **City pages working** via `/services/[slug]/[city]`
4. **Booking flow functional** with COD payment
5. **Reviews display** if enabled
6. **Warranty badges show** if enabled

### ✅ SEO Testing
1. **Meta tags** correct on all pages
2. **Sitemap accessible** at `/sitemap.xml`
3. **Robots.txt** present at `/robots.txt`
4. **JSON-LD** structured data in page source
5. **Internal links** working correctly

### ✅ Performance Testing
Run Lighthouse audits:
- **Performance**: ≥ 90 (mobile)
- **Best Practices**: ≥ 95
- **Accessibility**: ≥ 95
- **SEO**: ≥ 95

## 🔄 Feature Flag Management

### Enabling eSewa Payment
To enable eSewa payment in the future:

1. **Set environment variable**:
   ```env
   NEXT_PUBLIC_PAYMENTS_ESEWA_ENABLED=true
   ```

2. **Add eSewa credentials**:
   ```env
   ESEWA_MERCHANT_CODE=your-merchant-code
   ESEWA_SECRET_KEY=your-secret-key
   ESEWA_SUCCESS_URL=https://your-domain.vercel.app/payment/success
   ESEWA_FAILURE_URL=https://your-domain.vercel.app/payment/failure
   ```

3. **Redeploy** the application

### Disabling Features
To disable any feature, set the corresponding flag to `false`:
```env
NEXT_PUBLIC_REVIEWS_ENABLED=false
NEXT_PUBLIC_WARRANTY_BADGE_ENABLED=false
```

## 📈 Monitoring & Analytics

### Performance Monitoring
- Use Vercel Analytics for Core Web Vitals
- Monitor build times and function execution
- Track deployment success rates

### SEO Monitoring
- Google Search Console setup
- Monitor indexed pages count
- Track search performance for service × city pages

### Error Monitoring
- Set up error tracking (Sentry recommended)
- Monitor API endpoint errors
- Track user flow completion rates

## 🔐 Security Considerations

### Environment Security
- Never commit `.env.local` to version control
- Use different secrets for production vs development
- Regularly rotate authentication secrets

### Database Security
- Use read/write permissions appropriately
- Enable MongoDB Atlas encryption
- Regular backup scheduling

### API Security
- Rate limiting enabled on API routes
- Input validation on all forms
- CSRF protection via NextAuth

## 📞 Support & Maintenance

### Regular Tasks
- Monitor performance metrics weekly
- Update dependencies monthly
- Review error logs regularly
- Backup database weekly

### Emergency Contacts
- Vercel Support: For deployment issues
- MongoDB Atlas Support: For database issues
- Development Team: For application issues

---

**Ready for Production** ✅

Your SewaGo application is now configured for reliable, scalable deployment on Vercel with all modern features enabled.
