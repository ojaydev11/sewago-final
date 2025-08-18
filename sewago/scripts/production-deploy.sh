#!/bin/bash

# Production Deployment Script for SewaGo
# This script deploys the backend to Railway and frontend to Vercel

set -e

echo "🚀 Starting SewaGo Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if required tools are installed
check_requirements() {
    echo "📋 Checking deployment requirements..."
    
    if ! command -v railway &> /dev/null; then
        echo -e "${RED}❌ Railway CLI not found. Please install it first:${NC}"
        echo "npm install -g @railway/cli"
        exit 1
    fi
    
    if ! command -v vercel &> /dev/null; then
        echo -e "${RED}❌ Vercel CLI not found. Please install it first:${NC}"
        echo "npm install -g vercel"
        exit 1
    fi
    
    echo -e "${GREEN}✅ All requirements met${NC}"
}

# Validate environment variables
validate_env() {
    echo "🔍 Validating environment configuration..."
    
    if [ -z "$MONGODB_URI" ]; then
        echo -e "${RED}❌ MONGODB_URI environment variable is required${NC}"
        exit 1
    fi
    
    if [ -z "$JWT_ACCESS_SECRET" ]; then
        echo -e "${RED}❌ JWT_ACCESS_SECRET environment variable is required${NC}"
        exit 1
    fi
    
    if [ -z "$JWT_REFRESH_SECRET" ]; then
        echo -e "${RED}❌ JWT_REFRESH_SECRET environment variable is required${NC}"
        exit 1
    fi
    
    if [ -z "$CLIENT_ORIGIN" ]; then
        echo -e "${RED}❌ CLIENT_ORIGIN environment variable is required${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Environment validation passed${NC}"
}

# Deploy backend to Railway
deploy_backend() {
    echo "🚂 Deploying backend to Railway..."
    
    cd backend
    
    # Build the backend
    echo "🔨 Building backend..."
    npm run build
    
    # Deploy to Railway
    echo "📤 Deploying to Railway..."
    railway up
    
    cd ..
    
    echo -e "${GREEN}✅ Backend deployment completed${NC}"
}

# Deploy frontend to Vercel
deploy_frontend() {
    echo "🌐 Deploying frontend to Vercel..."
    
    cd frontend
    
    # Build the frontend
    echo "🔨 Building frontend..."
    npm run build
    
    # Deploy to Vercel
    echo "📤 Deploying to Vercel..."
    vercel --prod
    
    cd ..
    
    echo -e "${GREEN}✅ Frontend deployment completed${NC}"
}

# Run database migrations
run_migrations() {
    echo "🗄️  Running database migrations..."
    
    cd frontend
    
    # Generate Prisma client
    echo "🔧 Generating Prisma client..."
    npx prisma generate
    
    # Push schema changes to database
    echo "📊 Pushing schema to database..."
    npx prisma db push
    
    cd ..
    
    echo -e "${GREEN}✅ Database migrations completed${NC}"
}

# Health check
health_check() {
    echo "🏥 Performing health checks..."
    
    # Wait for services to be ready
    echo "⏳ Waiting for services to be ready..."
    sleep 30
    
    # Check backend health
    if [ -n "$BACKEND_URL" ]; then
        echo "🔍 Checking backend health..."
        if curl -f "$BACKEND_URL/api/health" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Backend is healthy${NC}"
        else
            echo -e "${RED}❌ Backend health check failed${NC}"
            exit 1
        fi
    fi
    
    echo -e "${GREEN}✅ Health checks passed${NC}"
}

# Main deployment flow
main() {
    check_requirements
    validate_env
    run_migrations
    deploy_backend
    deploy_frontend
    health_check
    
    echo -e "${GREEN}🎉 Production deployment completed successfully!${NC}"
    echo ""
    echo "📋 Next steps:"
    echo "1. Verify all services are running correctly"
    echo "2. Test critical user flows"
    echo "3. Monitor application metrics"
    echo "4. Set up monitoring and alerting"
}

# Run main function
main "$@"
