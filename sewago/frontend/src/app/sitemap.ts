import { MetadataRoute } from 'next';
import { prisma } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://sewago-final.vercel.app';
  
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
      priority: 0.6,
    },
  ];

  // Dynamic service pages
  let servicePages: MetadataRoute.Sitemap = [];
  
  try {
    if (process.env.DATABASE_URL) {
      const services = await prisma.service.findMany({
        where: { active: true },
        select: { slug: true, updatedAt: true }
      });

      servicePages = services.map((service) => ({
        url: `${baseUrl}/services/${service.slug}`,
        lastModified: service.updatedAt || new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
    }
  } catch (error) {
    console.warn('Could not fetch services for sitemap:', error);
  }

  return [...staticPages, ...servicePages];
}


