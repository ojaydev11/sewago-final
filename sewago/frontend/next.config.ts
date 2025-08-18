import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

// Compute API origin for CSP connect-src
const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
let apiOrigin = '';
try {
  if (apiUrl) {
    const u = new URL(apiUrl);
    apiOrigin = `${u.protocol}//${u.host}`;
  }
} catch {}

const ContentSecurityPolicy = `
  default-src 'self' https:;
  script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https:;
  style-src 'self' 'unsafe-inline' https:;
  img-src 'self' data: blob: https:;
  font-src 'self' data: https:;
  connect-src 'self' ${apiOrigin} https: wss:;
  frame-ancestors 'self';
  base-uri 'self';
  form-action 'self' ${apiOrigin};
  object-src 'none';
`.replace(/\s{2,}/g, ' ').trim();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  async redirects() {
    const defaultLocale = process.env.NEXT_PUBLIC_DEFAULT_LOCALE || 'en';
    return [
      {
        source: '/',
        destination: `/services`,
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: 'Content-Security-Policy', value: ContentSecurityPolicy },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Permissions-Policy', value: 'geolocation=(self)' },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
