import { dbConnect } from './mongodb';
import { Service } from '@/models/Service';

export async function getServices() {
  try {
    await dbConnect();
    
    const services = await Service.find({ active: true })
      .sort({ createdAt: -1 })
      .lean();
    
    return services;
  } catch (error) {
    console.error('Error fetching services:', error);
    return [];
  }
}

export async function getServiceBySlug(slug: string) {
  try {
    await dbConnect();
    
    const service = await Service.findOne({ 
      slug, 
      active: true 
    }).lean();
    
    return service;
  } catch (error) {
    console.error('Error fetching service:', error);
    return null;
  }
}

export async function getServicesByCategory(category: string) {
  try {
    await dbConnect();
    
    const services = await Service.find({ 
      category, 
      active: true 
    })
      .sort({ createdAt: -1 })
      .lean();
    
    return services;
  } catch (error) {
    console.error('Error fetching services by category:', error);
    return [];
  }
}

export async function searchServices(query: string) {
  try {
    await dbConnect();
    
    const services = await Service.find({
      $and: [
        { active: true },
        {
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { shortDesc: { $regex: query, $options: 'i' } },
            { category: { $regex: query, $options: 'i' } },
            { longDesc: { $regex: query, $options: 'i' } }
          ]
        }
      ]
    })
      .sort({ createdAt: -1 })
      .lean();
    
    return services;
  } catch (error) {
    console.error('Error searching services:', error);
    return [];
  }
}

export async function getPopularServices(limit: number = 6) {
  try {
    await dbConnect();
    
    const services = await Service.find({ active: true })
      .sort({ 'reviewStats.totalReviews': -1, 'reviewStats.averageRating': -1 })
      .limit(limit)
      .lean();
    
    return services;
  } catch (error) {
    console.error('Error fetching popular services:', error);
    return [];
  }
}
