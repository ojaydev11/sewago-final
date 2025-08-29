import { MetadataRoute } from 'next';

<<<<<<< HEAD
=======
// Force dynamic rendering to prevent build-time prerendering
export const dynamic = 'force-dynamic';

>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sewago-final.vercel.app';
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/account/',
          '/provider/',
          '/admin/',
          '/dashboard/',
          '/_next/',
          '/static/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}


