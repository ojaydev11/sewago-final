import { MetadataRoute } from 'next';

<<<<<<< HEAD
=======
// Force dynamic rendering to prevent build-time prerendering
export const dynamic = 'force-dynamic';

>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sewago.com';
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
  ];

  // Service category pages
  const serviceCategories = [
    'house-cleaning',
    'electrical-work', 
    'plumbing-services',
    'home-tutoring',
    'gardening-landscaping',
    'delivery-services'
  ];

  const servicePages = serviceCategories.map(category => ({
    url: `${baseUrl}/services/${category}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // City-specific service pages
  const cities = ['kathmandu', 'pokhara', 'lalitpur', 'bhaktapur', 'patan'];
  const cityServicePages = cities.flatMap(city => 
    serviceCategories.map(category => ({
      url: `${baseUrl}/services/${category}/${city}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  );

  return [...staticPages, ...servicePages, ...cityServicePages];
}


