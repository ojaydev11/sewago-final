# 🚀 Vercel Deployment Guide for SewaGo

## ✅ **Pre-Deployment Checklist**

### 1. **Environment Variables Setup**
Make sure these environment variables are set in your Vercel project settings:

#### **Required Environment Variables:**
```bash
NODE_ENV=production
MOCK_MODE=true
NEXT_PUBLIC_SITE_URL=https://sewago-final.vercel.app
NEXT_PUBLIC_API_URL=https://sewago-backend.railway.app
SKIP_DB=true
NEXT_TELEMETRY_DISABLED=1
SKIP_TYPE_CHECK=true
```

#### **Feature Flags:**
```bash
NEXT_PUBLIC_BOOKING_ENABLED=true
NEXT_PUBLIC_AUTH_ENABLED=true
NEXT_PUBLIC_I18N_ENABLED=false
NEXT_PUBLIC_SEWAAI_ENABLED=false
NEXT_PUBLIC_QUOTE_ESTIMATOR_ENABLED=true
NEXT_PUBLIC_PAYMENTS_ESEWA_ENABLED=false
NEXT_PUBLIC_REVIEWS_ENABLED=true
NEXT_PUBLIC_WARRANTY_BADGE_ENABLED=true
NEXT_PUBLIC_SEARCH_ENABLED=true
NEXT_PUBLIC_NOTIFICATIONS_ENABLED=false
```

### 2. **Build Configuration**
- **Framework Preset:** Next.js
- **Build Command:** `next build`
- **Install Command:** `npm install`
- **Output Directory:** `.next`

### 3. **Node.js Version**
- **Node.js Version:** 20.x (as specified in package.json)

## 🔧 **Troubleshooting Common Issues**

### **Issue 1: Build Failures**
**Symptoms:** Build fails with prerendering errors
**Solution:** 
- Ensure `export const dynamic = 'force-dynamic'` is present in problematic pages
- Check that all environment variables are set correctly

### **Issue 2: Environment Variable Errors**
**Symptoms:** Build fails due to missing environment variables
**Solution:**
- Set all required environment variables in Vercel project settings
- Use the `.env.vercel` file as a reference

### **Issue 3: Dependency Issues**
**Symptoms:** Build fails due to missing dependencies
**Solution:**
- Ensure `package.json` has all required dependencies
- Check that `package-lock.json` is committed to git

### **Issue 4: TypeScript Errors**
**Symptoms:** Build fails due to TypeScript compilation errors
**Solution:**
- Set `SKIP_TYPE_CHECK=true` in environment variables
- Ensure all components have proper TypeScript types

## 📋 **Deployment Steps**

### **Step 1: Connect Repository**
1. Connect your GitHub repository to Vercel
2. Select the `sewago/frontend` directory
3. Choose Next.js as the framework preset

### **Step 2: Configure Environment Variables**
1. Go to Project Settings > Environment Variables
2. Add all required environment variables from the checklist above
3. Ensure they are set for Production, Preview, and Development

### **Step 3: Deploy**
1. Push your changes to the main branch
2. Vercel will automatically trigger a new deployment
3. Monitor the build logs for any errors

### **Step 4: Verify Deployment**
1. Check that the deployment URL is accessible
2. Test critical user flows
3. Verify that all features are working correctly

## 🚨 **Emergency Fixes**

### **If Build Still Fails:**
1. **Check Build Logs:** Look for specific error messages
2. **Verify Dependencies:** Ensure all packages are compatible
3. **Test Locally:** Run `npm run build` locally to identify issues
4. **Rollback:** If needed, rollback to a working commit

### **Contact Support:**
If issues persist, provide Vercel support with:
- Build logs
- Environment variable configuration
- Package.json contents
- Error messages

## 📞 **Support Resources**
- **Vercel Documentation:** https://vercel.com/docs
- **Next.js Documentation:** https://nextjs.org/docs
- **GitHub Issues:** Check for similar issues in the repository

---

**🎯 Goal: Successful deployment to https://sewago-final.vercel.app**
