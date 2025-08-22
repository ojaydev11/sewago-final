import { z } from 'zod';
import { SkillSDK, SkillBuilder } from '../sdk';
import { SkillCategory, PermissionLevel, ExecutionContext } from '../../types/core';
import { logger } from '../../utils/logger';

// Input/Output schemas
const BookingAssistantInputSchema = z.object({
  serviceType: z.string(),
  location: z.object({
    district: z.string(),
    area: z.string().optional(),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number()
    }).optional()
  }),
  timePreference: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD format
    timeSlot: z.enum(['morning', 'afternoon', 'evening', 'flexible']),
    urgency: z.enum(['low', 'medium', 'high', 'emergency']).default('medium')
  }),
  budget: z.object({
    min: z.number().positive().optional(),
    max: z.number().positive().optional(),
    currency: z.string().default('NPR')
  }).optional(),
  requirements: z.object({
    description: z.string().optional(),
    duration: z.number().positive().optional(), // hours
    materials: z.array(z.string()).optional(),
    experience: z.enum(['any', 'beginner', 'intermediate', 'expert']).default('any')
  }).optional(),
  userId: z.string(),
  sessionId: z.string(),
  previousBookings: z.array(z.string()).optional()
});

const BookingAssistantOutputSchema = z.object({
  recommendations: z.array(z.object({
    providerId: z.string(),
    providerName: z.string(),
    rating: z.number().min(0).max(5),
    reviewCount: z.number().min(0),
    estimatedPrice: z.object({
      amount: z.number(),
      currency: z.string(),
      breakdown: z.array(z.object({
        item: z.string(),
        amount: z.number()
      })).optional()
    }),
    availability: z.object({
      date: z.string(),
      timeSlots: z.array(z.string())
    }),
    distance: z.number().optional(),
    specializations: z.array(z.string()).optional(),
    profilePicture: z.string().url().optional()
  })),
  bookingDraft: z.object({
    id: z.string(),
    serviceType: z.string(),
    providerId: z.string().optional(),
    scheduledFor: z.string().optional(),
    estimatedCost: z.number(),
    status: z.literal('draft'),
    validUntil: z.string()
  }),
  missingInformation: z.array(z.string()).optional(),
  conversationContext: z.object({
    step: z.enum(['service_selection', 'location_selection', 'time_selection', 'provider_selection', 'confirmation']),
    progress: z.number().min(0).max(100),
    nextActions: z.array(z.string())
  }),
  alternatives: z.array(z.object({
    suggestion: z.string(),
    reason: z.string(),
    impact: z.string()
  })).optional()
});

type BookingAssistantInput = z.infer<typeof BookingAssistantInputSchema>;
type BookingAssistantOutput = z.infer<typeof BookingAssistantOutputSchema>;

// Mock database interfaces (would integrate with real databases)
interface Provider {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  services: string[];
  location: {
    district: string;
    coordinates: { lat: number; lng: number };
  };
  availability: {
    [date: string]: string[];
  };
  pricing: {
    baseRate: number;
    currency: string;
    serviceRates: { [service: string]: number };
  };
}

interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  averagePrice: number;
  averageDuration: number;
}

// Skill implementation
class BookingAssistantSkill {
  
  async execute(input: BookingAssistantInput, context: ExecutionContext): Promise<BookingAssistantOutput> {
    logger.info(`Processing booking assistance for user ${input.userId}`, {
      serviceType: input.serviceType,
      location: input.location.district,
      urgency: input.timePreference.urgency
    });

    try {
      // 1. Validate and enrich service request
      const serviceInfo = await this.getServiceInformation(input.serviceType);
      
      // 2. Find available providers
      const availableProviders = await this.findAvailableProviders(
        input.serviceType,
        input.location,
        input.timePreference
      );

      // 3. Apply user preferences and history
      const personalizedProviders = await this.personalizeRecommendations(
        availableProviders,
        input,
        context
      );

      // 4. Create booking draft
      const bookingDraft = await this.createBookingDraft(input, personalizedProviders[0]);

      // 5. Determine conversation state
      const conversationContext = this.determineConversationState(input);

      // 6. Generate alternatives if needed
      const alternatives = await this.generateAlternatives(input, personalizedProviders);

      return {
        recommendations: personalizedProviders.slice(0, 5), // Top 5 recommendations
        bookingDraft,
        conversationContext,
        alternatives: alternatives.length > 0 ? alternatives : undefined
      };

    } catch (error) {
      logger.error('Booking assistant execution failed', {
        userId: input.userId,
        error: error instanceof Error ? error.message : error
      });
      throw error;
    }
  }

  private async getServiceInformation(serviceType: string): Promise<Service> {
    // Mock service lookup
    const services: Record<string, Service> = {
      'electrician': {
        id: 'elec-001',
        name: 'Electrical Work',
        category: 'home_services',
        description: 'Professional electrical installation and repair services',
        averagePrice: 2000,
        averageDuration: 2
      },
      'plumber': {
        id: 'plumb-001',
        name: 'Plumbing Services',
        category: 'home_services',
        description: 'Professional plumbing repair and installation',
        averagePrice: 1500,
        averageDuration: 1.5
      },
      'cleaning': {
        id: 'clean-001',
        name: 'House Cleaning',
        category: 'cleaning',
        description: 'Professional house cleaning services',
        averagePrice: 1000,
        averageDuration: 3
      }
    };

    return services[serviceType.toLowerCase()] || services['electrician'];
  }

  private async findAvailableProviders(
    serviceType: string,
    location: BookingAssistantInput['location'],
    timePreference: BookingAssistantInput['timePreference']
  ): Promise<Provider[]> {
    // Mock provider search
    const providers: Provider[] = [
      {
        id: 'prov-001',
        name: 'Ram Electrical Services',
        rating: 4.8,
        reviewCount: 127,
        services: ['electrician', 'electrical_repair'],
        location: {
          district: location.district,
          coordinates: { lat: 27.7172, lng: 85.3240 }
        },
        availability: {
          [timePreference.date]: ['morning', 'afternoon']
        },
        pricing: {
          baseRate: 1500,
          currency: 'NPR',
          serviceRates: { electrician: 2000 }
        }
      },
      {
        id: 'prov-002',
        name: 'Shyam Home Services',
        rating: 4.6,
        reviewCount: 89,
        services: ['plumber', 'electrician'],
        location: {
          district: location.district,
          coordinates: { lat: 27.7172, lng: 85.3240 }
        },
        availability: {
          [timePreference.date]: ['afternoon', 'evening']
        },
        pricing: {
          baseRate: 1200,
          currency: 'NPR',
          serviceRates: { plumber: 1500, electrician: 1800 }
        }
      },
      {
        id: 'prov-003',
        name: 'Nepal Quality Cleaning',
        rating: 4.9,
        reviewCount: 203,
        services: ['cleaning', 'deep_cleaning'],
        location: {
          district: location.district,
          coordinates: { lat: 27.7172, lng: 85.3240 }
        },
        availability: {
          [timePreference.date]: ['morning', 'afternoon', 'evening']
        },
        pricing: {
          baseRate: 800,
          currency: 'NPR',
          serviceRates: { cleaning: 1000, deep_cleaning: 1500 }
        }
      }
    ];

    // Filter by service type and availability
    return providers.filter(provider => {
      const hasService = provider.services.some(service => 
        service.toLowerCase().includes(serviceType.toLowerCase())
      );
      const hasAvailability = provider.availability[timePreference.date]?.length > 0;
      
      return hasService && hasAvailability;
    });
  }

  private async personalizeRecommendations(
    providers: Provider[],
    input: BookingAssistantInput,
    context: ExecutionContext
  ): Promise<BookingAssistantOutput['recommendations']> {
    // Score and sort providers based on user preferences
    const scoredProviders = providers.map(provider => {
      let score = 0;
      
      // Rating weight (40%)
      score += (provider.rating / 5) * 0.4;
      
      // Review count weight (20%)
      score += Math.min(provider.reviewCount / 100, 1) * 0.2;
      
      // Price preference weight (30%)
      if (input.budget?.max) {
        const price = provider.pricing.serviceRates[input.serviceType] || provider.pricing.baseRate;
        const priceScore = Math.max(0, 1 - (price / input.budget.max));
        score += priceScore * 0.3;
      }
      
      // Availability weight (10%)
      const availableSlots = provider.availability[input.timePreference.date] || [];
      const hasPreferredSlot = availableSlots.includes(input.timePreference.timeSlot);
      score += (hasPreferredSlot ? 1 : 0.5) * 0.1;

      return {
        ...provider,
        score
      };
    });

    // Sort by score (highest first) and format for output
    return scoredProviders
      .sort((a, b) => b.score - a.score)
      .map(provider => ({
        providerId: provider.id,
        providerName: provider.name,
        rating: provider.rating,
        reviewCount: provider.reviewCount,
        estimatedPrice: {
          amount: provider.pricing.serviceRates[input.serviceType] || provider.pricing.baseRate,
          currency: provider.pricing.currency,
          breakdown: [
            {
              item: 'Base service fee',
              amount: provider.pricing.baseRate
            },
            {
              item: 'Service premium',
              amount: (provider.pricing.serviceRates[input.serviceType] || provider.pricing.baseRate) - provider.pricing.baseRate
            }
          ]
        },
        availability: {
          date: input.timePreference.date,
          timeSlots: provider.availability[input.timePreference.date] || []
        },
        distance: this.calculateDistance(
          input.location.coordinates,
          provider.location.coordinates
        ),
        specializations: provider.services
      }));
  }

  private async createBookingDraft(
    input: BookingAssistantInput,
    topProvider?: BookingAssistantOutput['recommendations'][0]
  ): Promise<BookingAssistantOutput['bookingDraft']> {
    const draftId = `draft-${Date.now()}-${input.userId.slice(-6)}`;
    const validUntil = new Date();
    validUntil.setHours(validUntil.getHours() + 24); // Valid for 24 hours

    return {
      id: draftId,
      serviceType: input.serviceType,
      providerId: topProvider?.providerId,
      scheduledFor: topProvider ? 
        `${input.timePreference.date}T${this.getTimeSlotStart(input.timePreference.timeSlot)}` : 
        undefined,
      estimatedCost: topProvider?.estimatedPrice.amount || 0,
      status: 'draft',
      validUntil: validUntil.toISOString()
    };
  }

  private determineConversationState(input: BookingAssistantInput): BookingAssistantOutput['conversationContext'] {
    let step: BookingAssistantOutput['conversationContext']['step'] = 'service_selection';
    let progress = 20;
    let nextActions: string[] = [];

    if (input.serviceType) {
      step = 'location_selection';
      progress = 40;
      
      if (input.location.district) {
        step = 'time_selection';
        progress = 60;
        
        if (input.timePreference.date) {
          step = 'provider_selection';
          progress = 80;
          nextActions = ['Select a provider', 'Compare options', 'View provider profiles'];
          
          if (input.previousBookings) {
            step = 'confirmation';
            progress = 90;
            nextActions = ['Confirm booking', 'Request changes', 'Add special instructions'];
          }
        } else {
          nextActions = ['Choose preferred date', 'Select time slot', 'Set urgency level'];
        }
      } else {
        nextActions = ['Specify district', 'Add area details', 'Share location'];
      }
    } else {
      nextActions = ['Choose service type', 'Describe your needs', 'Browse categories'];
    }

    return {
      step,
      progress,
      nextActions
    };
  }

  private async generateAlternatives(
    input: BookingAssistantInput,
    providers: BookingAssistantOutput['recommendations']
  ): Promise<BookingAssistantOutput['alternatives']> {
    const alternatives: BookingAssistantOutput['alternatives'] = [];

    // Price alternatives
    if (input.budget?.max && providers.length > 0) {
      const avgPrice = providers.reduce((sum, p) => sum + p.estimatedPrice.amount, 0) / providers.length;
      if (avgPrice > input.budget.max * 0.8) {
        alternatives.push({
          suggestion: 'Consider booking during weekdays for lower rates',
          reason: 'Weekend rates are typically 20-30% higher',
          impact: 'Could save NPR 200-500 on your booking'
        });
      }
    }

    // Time alternatives
    if (input.timePreference.urgency === 'high') {
      alternatives.push({
        suggestion: 'Book for tomorrow instead of today',
        reason: 'More providers available with advance notice',
        impact: 'Better provider selection and potentially lower rates'
      });
    }

    // Location alternatives
    if (providers.length < 3) {
      alternatives.push({
        suggestion: 'Expand search to nearby areas',
        reason: 'Limited providers available in your specific area',
        impact: 'Access to more qualified providers'
      });
    }

    return alternatives;
  }

  private calculateDistance(
    coords1?: { lat: number; lng: number },
    coords2?: { lat: number; lng: number }
  ): number | undefined {
    if (!coords1 || !coords2) return undefined;

    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(coords2.lat - coords1.lat);
    const dLng = this.deg2rad(coords2.lng - coords1.lng);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(coords1.lat)) * Math.cos(this.deg2rad(coords2.lat)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  private getTimeSlotStart(timeSlot: string): string {
    const slots: Record<string, string> = {
      'morning': '09:00',
      'afternoon': '14:00',
      'evening': '18:00',
      'flexible': '09:00'
    };
    return slots[timeSlot] || '09:00';
  }
}

// Register the skill
export const registerBookingAssistant = () => {
  const skill = new BookingAssistantSkill();
  
  return SkillSDK.createSkill()
    .name('Smart Booking Assistant')
    .description('Intelligent booking assistance with personalized provider recommendations')
    .category(SkillCategory.CUSTOMER)
    .permissions(['services:read', 'providers:read', 'bookings:create_draft', 'pricing:calculate'])
    .permissionLevel(PermissionLevel.ACT_LOW)
    .rateLimit(30, 60 * 60 * 1000) // 30 requests per hour
    .spendingCost(5) // Low cost skill
    .inputSchema(BookingAssistantInputSchema)
    .outputSchema(BookingAssistantOutputSchema)
    .timeout(15000) // 15 second timeout
    .cacheable(5 * 60 * 1000) // Cache for 5 minutes
    .execute(async (input, context) => skill.execute(input, context))
    .register();
};