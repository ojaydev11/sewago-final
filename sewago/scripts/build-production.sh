#!/bin/bash

# Production Build Script for SewaGo
# This script builds both frontend and backend for production deployment

set -e

echo "🔨 Starting SewaGo Production Build..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Build backend
build_backend() {
    echo "🚂 Building backend..."
    
    cd backend
    
    # Install dependencies
    echo "📦 Installing backend dependencies..."
    npm ci --only=production
    
    # Run tests
    echo "🧪 Running backend tests..."
    npm test
    
    # Build for production
    echo "🔨 Building backend for production..."
    npm run build
    
    # Verify build output
    if [ ! -f "dist/server.js" ]; then
        echo -e "${RED}❌ Backend build failed - dist/server.js not found${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Backend build completed${NC}"
    cd ..
}

# Build frontend
build_frontend() {
    echo "🌐 Building frontend..."
    
    cd frontend
    
    # Install dependencies
    echo "📦 Installing frontend dependencies..."
    npm ci --only=production
    
    # Generate Prisma client
    echo "🔧 Generating Prisma client..."
    npx prisma generate
    
    # Run tests
    echo "🧪 Running frontend tests..."
    npm test
    
    # Build for production
    echo "🔨 Building frontend for production..."
    npm run build
    
    # Verify build output
    if [ ! -d ".next" ]; then
        echo -e "${RED}❌ Frontend build failed - .next directory not found${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Frontend build completed${NC}"
    cd ..
}

# Run security checks
security_check() {
    echo "🔒 Running security checks..."
    
    # Check for known vulnerabilities
    echo "🔍 Checking for known vulnerabilities..."
    npm audit --audit-level=moderate || {
        echo -e "${YELLOW}⚠️  Some vulnerabilities found. Review and fix if critical.${NC}"
    }
    
    # Check for outdated packages
    echo "📋 Checking for outdated packages..."
    npm outdated || {
        echo -e "${YELLOW}⚠️  Some packages are outdated. Consider updating.${NC}"
    }
    
    echo -e "${GREEN}✅ Security checks completed${NC}"
}

# Optimize builds
optimize_builds() {
    echo "⚡ Optimizing builds..."
    
    # Backend optimization
    cd backend
    echo "🚂 Optimizing backend build..."
    
    # Remove dev dependencies from dist
    if [ -d "dist" ]; then
        find dist -name "*.d.ts" -delete
        find dist -name "*.map" -delete
        echo "🧹 Cleaned backend build artifacts"
    fi
    
    cd ..
    
    # Frontend optimization
    cd frontend
    echo "🌐 Optimizing frontend build..."
    
    # Remove unnecessary files
    if [ -d ".next" ]; then
        find .next -name "*.map" -delete
        echo "🧹 Cleaned frontend build artifacts"
    fi
    
    cd ..
    
    echo -e "${GREEN}✅ Build optimization completed${NC}"
}

# Generate build report
generate_report() {
    echo "📊 Generating build report..."
    
    BUILD_REPORT="build-report-$(date +%Y%m%d-%H%M%S).txt"
    
    cat > "$BUILD_REPORT" << EOF
SewaGo Production Build Report
Generated: $(date)

Backend Build:
- Status: ✅ Completed
- Output: dist/server.js
- Size: $(du -sh backend/dist 2>/dev/null || echo "N/A")

Frontend Build:
- Status: ✅ Completed
- Output: .next directory
- Size: $(du -sh frontend/.next 2>/dev/null || echo "N/A")

Dependencies:
- Backend: $(grep -c "dependencies" backend/package.json) packages
- Frontend: $(grep -c "dependencies" frontend/package.json) packages

Build Time: $(date)
EOF
    
    echo -e "${GREEN}✅ Build report generated: $BUILD_REPORT${NC}"
}

# Main build flow
main() {
    echo "🚀 Starting production build process..."
    
    # Clean previous builds
    echo "🧹 Cleaning previous builds..."
    rm -rf backend/dist frontend/.next
    
    build_backend
    build_frontend
    security_check
    optimize_builds
    generate_report
    
    echo -e "${GREEN}🎉 Production build completed successfully!${NC}"
    echo ""
    echo "📋 Build artifacts:"
    echo "- Backend: backend/dist/"
    echo "- Frontend: frontend/.next/"
    echo "- Report: build-report-*.txt"
}

# Run main function
main "$@"
