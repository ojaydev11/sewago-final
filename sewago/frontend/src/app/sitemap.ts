
import { MetadataRoute } from 'next';

const SERVICES = [
  'house-cleaning',
  'electrical-work',
  'plumbing',
  'gardening',
  'appliance-repair',
  'home-security'
];

const CITIES = ['kathmandu', 'lalitpur', 'bhaktapur'];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://sewago.vercel.app';
  
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
      changeFrequency: 'daily' as const,
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
  ];

  // Service pages
  const servicePages = SERVICES.map(service => ({
    url: `${baseUrl}/services/${service}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Service × City pages
  const serviceCityPages = [];
  for (const service of SERVICES) {
    for (const city of CITIES) {
      serviceCityPages.push({
        url: `${baseUrl}/services/${service}/${city}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      });
    }
  }

  return [...staticPages, ...servicePages, ...serviceCityPages];
}
