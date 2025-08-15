# Railway Backend Deployment Guide

## Service Configuration

### Root Directory
```
sewago/backend
```

### Build Command
```bash
npm ci && npm run build
```

### Start Command
```bash
npm run start
```

### Node Version
- **Required**: Node.js 18+ (recommended: Node.js 20)
- **Engine**: Specified in `package.json` as `>=20`

## Environment Variables

### Required
- `MONGODB_URI` - MongoDB connection string
- `JWT_ACCESS_SECRET` - JWT access token secret
- `JWT_REFRESH_SECRET` - JWT refresh token secret

### Optional
- `NODE_ENV` - Environment (defaults to "development")
- `PORT` - Port number (defaults to 4000)
- `CLIENT_ORIGIN` - Frontend origin for CORS
- `ESEWA_MERCHANT_CODE` - eSewa payment integration
- `KHALTI_SECRET_KEY` - Khalti payment integration

## Build Process

1. **Dependencies**: `npm ci` installs production dependencies
2. **TypeScript Compilation**: `npm run build` runs `tsc -p .`
3. **Output**: Compiled JavaScript in `dist/` directory
4. **Entry Point**: `dist/server.js`

## Health Check

The service exposes a health endpoint at:
```
GET /api/health
```

Expected response:
```json
{
  "ok": true,
  "service": "sewago-backend",
  "env": "production"
}
```

## Monitoring

- **Logs**: Check Railway logs for startup messages
- **Health**: Monitor `/api/health` endpoint
- **Build**: Ensure TypeScript compilation succeeds

## Troubleshooting

### Build Failures
- Check TypeScript errors in build logs
- Verify all imports/exports are correct
- Ensure `tsconfig.json` is properly configured

### Runtime Errors
- Check MongoDB connection
- Verify environment variables are set
- Review application logs for specific error messages

### Common Issues
1. **TypeScript compilation fails**: Check export/import mismatches
2. **Module not found**: Verify file paths and extensions
3. **MongoDB connection fails**: Check connection string and network access
