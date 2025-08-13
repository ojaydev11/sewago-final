import fs from 'fs';
import path from 'path';

// Content types
export interface Service {
  slug: string;
  title: string;
  summary: string;
  descriptionMdx: string;
  icon: string;
  startingPrice: number;
  features: string[];
  faqs: { q: string; a: string }[];
  seo: {
    title: string;
    description: string;
    keywords: string[];
    ogImage: string;
  };
  schema: {
    '@type': string;
    serviceType: string;
    areaServed: string[];
    provider: {
      '@type': string;
      name: string;
      url: string;
    };
  };
}

export interface City {
  name: string;
  slug: string;
  description: string;
  population: string;
  services: string[];
  image: string;
}

export interface Stat {
  number: string;
  label: string;
  description: string;
  icon: string;
}

// Content loader functions
export async function getServices(): Promise<Service[]> {
  try {
    const contentDir = path.join(process.cwd(), 'content', 'services');
    const files = fs.readdirSync(contentDir);
    
    const services: Service[] = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(contentDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const service = JSON.parse(content) as Service;
        services.push(service);
      }
    }
    
    return services.sort((a, b) => a.title.localeCompare(b.title));
  } catch (error) {
    console.error('Error loading services:', error);
    return [];
  }
}

export async function getService(slug: string): Promise<Service | null> {
  try {
    const services = await getServices();
    return services.find(service => service.slug === slug) || null;
  } catch (error) {
    console.error('Error loading service:', error);
    return null;
  }
}

export async function getCities(): Promise<City[]> {
  try {
    const filePath = path.join(process.cwd(), 'content', 'cities.json');
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);
    return data.cities || [];
  } catch (error) {
    console.error('Error loading cities:', error);
    return [];
  }
}

export async function getStats(): Promise<Stat[]> {
  try {
    const filePath = path.join(process.cwd(), 'content', 'stats.json');
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);
    return data.stats || [];
  } catch (error) {
    console.error('Error loading stats:', error);
    return [];
  }
}

// SEO helpers
export function generateServiceSchema(service: Service) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.summary,
    provider: {
      '@type': 'Organization',
      name: 'SewaGo',
      url: 'https://sewago-final.vercel.app',
      logo: 'https://sewago-final.vercel.app/logo.png'
    },
    areaServed: service.schema.areaServed.map(city => ({
      '@type': 'City',
      name: city
    })),
    serviceType: service.schema.serviceType,
    offers: {
      '@type': 'Offer',
      price: service.startingPrice,
      priceCurrency: 'NPR',
      description: `Starting from NPR ${service.startingPrice}`
    }
  };
}

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'SewaGo',
    url: 'https://sewago-final.vercel.app',
    logo: 'https://sewago-final.vercel.app/logo.png',
    description: 'Professional local services platform in Nepal',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'NP',
      addressLocality: 'Kathmandu'
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'support@sewago.com'
    },
    sameAs: [
      'https://facebook.com/sewago',
      'https://twitter.com/sewago',
      'https://instagram.com/sewago'
    ]
  };
}
