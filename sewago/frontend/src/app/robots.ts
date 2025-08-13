import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://sewago.com'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/services',
          '/about',
          '/contact',
          '/faqs',
          '/privacy',
          '/terms',
          '/auth/login',
          '/auth/register',
          '/provider/register',
        ],
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/provider/',
          '/book/',
          '/chat/',
          '/wallet/',
          '/_next/',
          '/static/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/provider/',
          '/book/',
          '/chat/',
          '/wallet/',
        ],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/provider/',
          '/book/',
          '/chat/',
          '/wallet/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}


