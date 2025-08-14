import servicesData from '@/data/services.json';

export async function getServices() {
  try {
    // For now, return static data instead of MongoDB
    // TODO: Re-enable MongoDB when database is properly configured
    return servicesData;
  } catch (error) {
    console.error('Error fetching services:', error);
    return [];
  }
}

export async function getServiceBySlug(slug: string) {
  try {
    // For now, return static data instead of MongoDB
    const service = servicesData.find(s => s.slug === slug);
    return service || null;
  } catch (error) {
    console.error('Error fetching service:', error);
    return null;
  }
}

export async function getServicesByCategory(category: string) {
  try {
    // For now, return static data instead of MongoDB
    const services = servicesData.filter(s => s.category === category);
    return services;
  } catch (error) {
    console.error('Error fetching services by category:', error);
    return [];
  }
}

export async function searchServices(query: string) {
  try {
    // For now, return static data instead of MongoDB
    const services = servicesData.filter(service => 
      service.name.toLowerCase().includes(query.toLowerCase()) ||
      service.description.toLowerCase().includes(query.toLowerCase()) ||
      service.category.toLowerCase().includes(query.toLowerCase())
    );
    return services;
  } catch (error) {
    console.error('Error searching services:', error);
    return [];
  }
}

export async function getPopularServices(limit: number = 6) {
  try {
    // For now, return static data instead of MongoDB
    const services = servicesData
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
    return services;
  } catch (error) {
    console.error('Error fetching popular services:', error);
    return [];
  }
}
