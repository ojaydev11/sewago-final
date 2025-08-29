import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Production optimizations
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
  
  // Image optimization
  images: {
    domains: [
      'images.unsplash.com',
      'via.placeholder.com',
      'localhost',
      's3.amazonaws.com',
      'your-s3-bucket.s3.amazonaws.com'
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: false,
  },

  // Environment variables validation
  env: {
    NEXT_PUBLIC_ENABLE_DEMOS: process.env.NEXT_PUBLIC_ENABLE_DEMOS,
  },

  // TypeScript checking enabled for build safety
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint enabled for build safety
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
