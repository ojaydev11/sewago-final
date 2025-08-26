import type { NextConfig } from 'next';
import path from 'path';

/** Prints an import chain when a module that *contains* DOM usage is included */
class DomUseTracerPlugin {
  apply(compiler: any) {
    compiler.hooks.compilation.tap('DomUseTracerPlugin', (compilation: any) => {
      compilation.hooks.succeedModule.tap('DomUseTracerPlugin', (mod: any) => {
        const res = mod.resource;
        if (!res) return;
        if (!/\.(t|j)sx?$/.test(res)) return;
        const srcObj = mod.originalSource && mod.originalSource();
        const code = srcObj && srcObj.source ? String(srcObj.source()) : '';
        if (!code) return;

        // quick heuristic: DOM globals
        if (/\b(document|window|navigator|localStorage)\s*\./.test(code)) {
          const chain = [];
          const seen = new Set();
          let cur = mod;
          while (cur && !seen.has(cur)) {
            seen.add(cur);
            chain.push(cur.resource || (cur.identifier && cur.identifier()));
            cur = cur.issuer;
          }
          console.log(
            '\n[SSR DOM TRACE] Offender included in server bundle:',
            '\n  Module:', res,
            '\n  Imported via:\n   - ' + chain.filter(Boolean).join('\n   - ')
          );
        }
      });
    });
  }
}

const nextConfig: NextConfig = {
  // Production optimizations
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
  
  // Skip build-time page generation completely
  // generateBuildId: removed to allow proper cache busting across deploys
  
  // Exclude service worker from build processing
  excludeDefaultMomentLocales: true,
  
  // Experimental flag to skip page data collection
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@heroicons/react', 'lucide-react'],
    // Disable static generation for problematic pages
    workerThreads: false,
    cpus: 1,
    // Force all pages to be dynamic
    forceSwcTransforms: true,
    // Note: instrumentationHook not available in this Next.js version
  },

  // Server external packages to prevent edge function bundling issues
  serverExternalPackages: [
    '@opentelemetry/api',
    '@opentelemetry/core', 
    '@opentelemetry/instrumentation',
    '@opentelemetry/resources',
    '@opentelemetry/semantic-conventions',
    '@opentelemetry/auto-instrumentations-node'
  ],
  
  // Move these out of experimental as per warning
  skipTrailingSlashRedirect: true,
  
  // Image optimization for Lighthouse performance
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

  // Simplified webpack configuration
  webpack: (config, { dev, isServer }) => {
    // Add resolve fallbacks for client-side libraries
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    // Add resolve alias for globalThis as fallback only
    config.resolve.alias = {
      ...config.resolve.alias,
      // DB alias guards - prevent accidental DB imports
      mongoose: false,
      mongodb: false,
      '@prisma/client': false,
    };

    // Temporarily disable complex entry manipulation to fix webpack build error
    /*
    if (isServer && !process.env.NEXT_RUNTIME?.includes('edge')) {
      // Inject SSR DOM guard before any server entry (skip Edge runtimes)
      const origEntry = config.entry;
      config.entry = async () => {
        const entries = await (typeof origEntry === 'function' ? origEntry() : origEntry);
        for (const k of Object.keys(entries)) {
          // Skip Next.js legacy Pages runtime entries entirely (_app, _document, _error)
          if (k.startsWith('pages/')) continue;
          const arr = Array.isArray(entries[k]) ? entries[k] : [entries[k]];
          entries[k] = [path.resolve('scripts/ssr-dom-guard.cjs'), ...arr];
        }
        return entries;
      };
      
      // print import chains for DOM usage in server bundle (skip Edge runtimes)
      config.plugins.push(new DomUseTracerPlugin());

      // hard-stop common DOM-only libs on server
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        'mapbox-gl': false,
        'lottie-web': false,
        'chart.js': false,
        'dompurify': false,
        'firebase/app': false,
        'firebase/auth': false,
        'react-dom/client': false,
        'three': false,
        'video.js': false,
      };
    }
    */

    if (!dev) {
      // Completely disable chunk splitting to prevent vendor.js issues
      config.optimization.splitChunks = false;

      // Additional optimizations for production
      if (!isServer) {
        config.resolve.alias = {
          ...config.resolve.alias,
          '@': './src',
        };
      }
    }

    // Performance optimizations
    config.resolve.extensions = ['.js', '.jsx', '.ts', '.tsx', '.json'];
    
    return config;
  },

  // Optimized headers for Lighthouse performance and security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Performance headers
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' 'inline-speculation-rules' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' data: https:; connect-src 'self' https: wss:; media-src 'self' https:; object-src 'none'; base-uri 'self'; frame-ancestors 'none';"
          },
          // Security headers
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate'
          },
          {
            key: 'Pragma',
            value: 'no-cache'
          },
          {
            key: 'Expires',
            value: '0'
          }
        ],
      },
      // Cache static assets for better performance
      {
        source: '/icons/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ],
      },
      {
        source: '/branding/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ],
      }
    ];
  },

  // Redirects for better UX
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },

  // Environment variables validation
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // TypeScript checking enabled for build safety
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint enabled for build safety
  eslint: {
    ignoreDuringBuilds: false,
  },

  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/api/_frontend/:path*',
          destination: '/api-frontend/:path*',
        },
      ],
      afterFiles: [],
      fallback: [
        // Only redirect specific backend API routes to external server
        // Frontend API routes (auth, ux, etc.) will be handled locally
        {
          source: '/api/backend/:path*',
          destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}/api/:path*`,
        }
      ],
    };
  },
};

export default nextConfig;
