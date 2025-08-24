import { Request, Response } from "express";
import mongoose from "mongoose";
import { AIFeaturesModel } from "../models/AIFeatures.js";
import { UserModel } from "../models/User.js";
import { ServiceModel } from "../models/Service.js";
import { BookingModel } from "../models/Booking.js";
import { 
  sendSuccessResponse, 
  sendErrorResponse, 
  sendNotFoundResponse,
  sendValidationErrorResponse 
} from "../lib/response/index.js";
import { 
  validateData,
  SearchPredictionSchema,
  VoiceBookingSchema,
  SchedulingRecommendationSchema,
  UserBehaviorUpdateSchema
} from "../lib/validation/index.js";
import { 
  createError, 
  ERROR_CODES,
  NotFoundError,
  ValidationError 
} from "../lib/errors/index.js";
import { IUser, IService, IBooking, IAIFeatures } from "../types/index.js";

// Predictive search
export const getSearchPredictions = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    // Validate query parameters
    const validatedData = validateData(SearchPredictionSchema, req.query);
    const { query, location, timeOfDay } = validatedData;

    let aiFeatures = await AIFeaturesModel.findOne();
    if (!aiFeatures) {
      aiFeatures = await AIFeaturesModel.create({});
    }

    // Simple keyword-based search prediction (in real app, this would use ML models)
    const services = await ServiceModel.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    }).limit(5);

    const predictions = services.map((service: IService) => ({
      serviceId: service._id,
      confidence: 0.8, // Mock confidence score
      reason: `Matches search term "${query}"`
    }));

    // Store search prediction
    aiFeatures.searchPredictions.push({
      userId: userId ? new mongoose.Types.ObjectId(userId) : undefined,
      query,
      predictedServices: predictions,
      searchContext: {
        location: location || null,
        timeOfDay: timeOfDay || null,
        previousSearches: [],
        userPreferences: []
      },
      timestamp: new Date()
    });

    await aiFeatures.save();

    sendSuccessResponse(res, {
      predictions,
      suggestions: [
        "Try searching for specific service types",
        "Add location for better results",
        "Check our trending services"
      ]
    }, "Search predictions generated successfully");

  } catch (error) {
    if (error instanceof ValidationError) {
      sendValidationErrorResponse(res, error.fieldErrors);
    } else {
      sendErrorResponse(res, error as Error);
    }
  }
};

// Voice booking processing
export const processVoiceBooking = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw createError(ERROR_CODES.AUTH_FAILED, "User authentication required");
    }

    // Validate request body
    const validatedData = validateData(VoiceBookingSchema, req.body);
    const { audioFile, transcription, intent } = validatedData;

    let aiFeatures = await AIFeaturesModel.findOne();
    if (!aiFeatures) {
      aiFeatures = await AIFeaturesModel.create({});
    }

    // Extract data from transcription (in real app, this would use NLP)
    const extractedData = {
      serviceType: extractServiceType(transcription),
      location: extractLocation(transcription),
      date: extractDate(transcription),
      time: extractTime(transcription),
      urgency: extractUrgency(transcription)
    };

    // Determine intent
    const detectedIntent = intent || detectIntent(transcription);

    // Create voice booking record
    const voiceBooking = {
      userId: new mongoose.Types.ObjectId(userId),
      audioFile: audioFile || null,
      transcription,
      intent: detectedIntent,
      confidence: 0.85, // Mock confidence
      extractedData,
      status: "PROCESSING" as const,
      processedAt: new Date()
    };

    aiFeatures.voiceBookings.push(voiceBooking);
    await aiFeatures.save();

    sendSuccessResponse(res, {
      data: extractedData,
      intent: detectedIntent,
      confidence: 0.85
    }, "Voice booking processed successfully");

  } catch (error) {
    if (error instanceof ValidationError) {
      sendValidationErrorResponse(res, error.fieldErrors);
    } else {
      sendErrorResponse(res, error as Error);
    }
  }
};

// Smart scheduling recommendations
export const getSchedulingRecommendations = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw createError(ERROR_CODES.AUTH_FAILED, "User authentication required");
    }

    // Validate request body
    const validatedData = validateData(SchedulingRecommendationSchema, req.body);
    const { serviceId, preferredDate, urgency } = validatedData;

    let aiFeatures = await AIFeaturesModel.findOne();
    if (!aiFeatures) {
      aiFeatures = await AIFeaturesModel.create({});
    }

    // Get user's booking history for patterns
    const userBookings = await BookingModel.find({ userId }).sort({ createdAt: -1 }).limit(10);
    
    // Analyze user preferences
    const userPreferences = analyzeUserPreferences(userBookings);
    
    // Generate time slot recommendations
    const recommendations = generateTimeSlots(preferredDate, urgency, userPreferences);

    // Store recommendations
    aiFeatures.schedulingRecommendations.push({
      userId: new mongoose.Types.ObjectId(userId),
      serviceId: new mongoose.Types.ObjectId(serviceId),
      recommendations,
      factors: {
        weather: "Sunny", // Mock weather data
        traffic: "Low", // Mock traffic data
        providerAvailability: "High",
        userPreferences: JSON.stringify(userPreferences),
        historicalData: "Based on 10 previous bookings"
      },
      generatedAt: new Date()
    });

    await aiFeatures.save();

    sendSuccessResponse(res, {
      recommendations,
      factors: {
        weather: "Sunny",
        traffic: "Low",
        providerAvailability: "High"
      }
    }, "Scheduling recommendations generated successfully");

  } catch (error) {
    if (error instanceof ValidationError) {
      sendValidationErrorResponse(res, error.fieldErrors);
    } else {
      sendErrorResponse(res, error as Error);
    }
  }
};

// Dynamic pricing suggestions
export const getPricingSuggestions = async (req: Request, res: Response) => {
  try {
    const { serviceId } = req.params;
    if (!serviceId) {
      throw createError(ERROR_CODES.REQUIRED_FIELD, "Service ID is required");
    }

    const service = await ServiceModel.findById(serviceId);
    if (!service) {
      throw createError(ERROR_CODES.NOT_FOUND, "Service not found", 404, { resource: "Service", id: serviceId });
    }

    let aiFeatures = await AIFeaturesModel.findOne();
    if (!aiFeatures) {
      aiFeatures = await AIFeaturesModel.create({});
    }

    // Analyze market conditions (in real app, this would use ML models)
    const marketConditions = await analyzeMarketConditions(serviceId);
    
    // Calculate suggested price
    const basePrice = service.basePrice || 1000;
    const suggestedPrice = calculateSuggestedPrice(basePrice, marketConditions);

    const pricingSuggestion = {
      serviceId: new mongoose.Types.ObjectId(serviceId),
      basePrice,
      suggestedPrice,
      factors: [
        {
          factor: "Demand",
          impact: marketConditions.demand === "HIGH" ? 15 : marketConditions.demand === "LOW" ? -10 : 0,
          reason: `Current demand is ${marketConditions.demand.toLowerCase()}`
        },
        {
          factor: "Competition",
          impact: marketConditions.competition === "HIGH" ? -5 : marketConditions.competition === "LOW" ? 10 : 0,
          reason: `Competition level is ${marketConditions.competition.toLowerCase()}`
        }
      ],
      marketConditions,
      validityPeriod: {
        start: new Date(),
        end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    };

    aiFeatures.pricingSuggestions.push(pricingSuggestion);
    await aiFeatures.save();

    sendSuccessResponse(res, {
      suggestion: pricingSuggestion,
      explanation: "Price suggestions are based on market conditions, demand, and competition analysis"
    }, "Pricing suggestions generated successfully");

  } catch (error) {
    sendErrorResponse(res, error as Error);
  }
};

// Update user behavior patterns
export const updateUserBehavior = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw createError(ERROR_CODES.AUTH_FAILED, "User authentication required");
    }

    // Validate request body
    const validatedData = validateData(UserBehaviorUpdateSchema, req.body);
    const { action, data } = validatedData;

    let aiFeatures = await AIFeaturesModel.findOne();
    if (!aiFeatures) {
      aiFeatures = await AIFeaturesModel.create({});
    }

    // Find existing user behavior or create new one
    let userBehavior = aiFeatures.userBehavior.find(
      (behavior) => behavior.userId.toString() === userId
    );
    
    if (!userBehavior) {
      userBehavior = {
        userId: new mongoose.Types.ObjectId(userId),
        patterns: {
          preferredTimes: [],
          preferredServices: [],
          preferredLocations: [],
          bookingFrequency: "OCCASIONAL" as const,
          averageSpend: 0
        },
        preferences: {
          urgency: "MEDIUM" as const,
          quality: "STANDARD" as const,
          providerRating: 4
        },
        lastUpdated: new Date()
      };
      aiFeatures.userBehavior.push(userBehavior);
    }

    // Update behavior based on action
    switch (action) {
      case "BOOKING_COMPLETED":
        if (data.serviceId && userBehavior.patterns.preferredServices && !userBehavior.patterns.preferredServices.includes(data.serviceId)) {
          userBehavior.patterns.preferredServices.push(new mongoose.Types.ObjectId(data.serviceId));
        }
        if (data.location && userBehavior.patterns.preferredLocations && !userBehavior.patterns.preferredLocations.includes(data.location)) {
          userBehavior.patterns.preferredLocations.push(data.location);
        }
        if (data.time && userBehavior.patterns.preferredTimes && !userBehavior.patterns.preferredTimes.includes(data.time)) {
          userBehavior.patterns.preferredTimes.push(data.time);
        }
        break;
      
      case "PREFERENCE_UPDATE":
        if (data.urgency && userBehavior.preferences) userBehavior.preferences.urgency = data.urgency;
        if (data.quality && userBehavior.preferences) userBehavior.preferences.quality = data.quality;
        if (data.providerRating && userBehavior.preferences) userBehavior.preferences.providerRating = data.providerRating;
        break;
    }

    userBehavior.lastUpdated = new Date();
    await aiFeatures.save();

    sendSuccessResponse(res, null, "User behavior updated successfully");

  } catch (error) {
    if (error instanceof ValidationError) {
      sendValidationErrorResponse(res, error.fieldErrors);
    } else {
      sendErrorResponse(res, error as Error);
    }
  }
};

// Helper functions
function extractServiceType(transcription: string): string {
  const serviceKeywords = {
    'cleaning': ['clean', 'cleaning', 'housekeeping', 'maid'],
    'plumbing': ['plumbing', 'pipe', 'leak', 'faucet', 'toilet'],
    'electrical': ['electrical', 'electric', 'wiring', 'outlet', 'switch'],
    'gardening': ['garden', 'landscaping', 'lawn', 'plant', 'tree']
  };

  const lowerTranscription = transcription.toLowerCase();
  for (const [service, keywords] of Object.entries(serviceKeywords)) {
    if (keywords.some(keyword => lowerTranscription.includes(keyword))) {
      return service;
    }
  }
  return 'general';
}

function extractLocation(transcription: string): string {
  // Simple location extraction (in real app, use NLP)
  const locationPatterns = /(?:in|at|near|around)\s+([A-Za-z\s]+)/i;
  const match = transcription.match(locationPatterns);
  return match ? match[1].trim() : '';
}

function extractDate(transcription: string): string {
  // Simple date extraction (in real app, use NLP)
  const datePatterns = /(?:on|for|this|next)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday|tomorrow|today)/i;
  const match = transcription.match(datePatterns);
  return match ? match[1] : '';
}

function extractTime(transcription: string): string {
  // Simple time extraction (in real app, use NLP)
  const timePatterns = /(\d{1,2}:\d{2}\s*(?:am|pm)?)/i;
  const match = transcription.match(timePatterns);
  return match ? match[1] : '';
}

function extractUrgency(transcription: string): string {
  const lowerTranscription = transcription.toLowerCase();
  if (lowerTranscription.includes('urgent') || lowerTranscription.includes('emergency')) {
    return 'HIGH';
  } else if (lowerTranscription.includes('asap') || lowerTranscription.includes('soon')) {
    return 'MEDIUM';
  }
  return 'LOW';
}

function detectIntent(transcription: string): string {
  const lowerTranscription = transcription.toLowerCase();
  if (lowerTranscription.includes('book') || lowerTranscription.includes('schedule')) {
    return 'BOOK_SERVICE';
  } else if (lowerTranscription.includes('cancel') || lowerTranscription.includes('reschedule')) {
    return 'MODIFY_BOOKING';
  } else if (lowerTranscription.includes('info') || lowerTranscription.includes('details')) {
    return 'GET_INFO';
  }
  return 'OTHER';
}

function analyzeUserPreferences(bookings: IBooking[]) {
  // Analyze user's booking patterns
  const preferences = {
    preferredTimes: [] as string[],
    preferredServices: [] as mongoose.Types.ObjectId[],
    preferredLocations: [] as string[],
    averageSpend: 0,
    urgency: 'MEDIUM' as const
  };

  if (bookings.length > 0) {
    // Calculate average spend
    const totalSpend = bookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
    preferences.averageSpend = totalSpend / bookings.length;

    // Extract common patterns
    const serviceCounts: Record<string, number> = {};
    const locationCounts: Record<string, number> = {};
    
    bookings.forEach(booking => {
      if (booking.serviceId) {
        const serviceId = booking.serviceId.toString();
        serviceCounts[serviceId] = (serviceCounts[serviceId] || 0) + 1;
      }
      if (booking.address?.city) {
        locationCounts[booking.address.city] = (locationCounts[booking.address.city] || 0) + 1;
      }
    });

    // Convert service IDs to ObjectIds for preferredServices
    preferences.preferredServices = Object.keys(serviceCounts)
      .slice(0, 3)
      .map(id => new mongoose.Types.ObjectId(id));
    
    preferences.preferredLocations = Object.keys(locationCounts).slice(0, 3);
  }

  return preferences;
}

function generateTimeSlots(preferredDate: string, urgency: string, userPreferences: any) {
  // Generate time slot recommendations based on preferences and urgency
  const timeSlots = [];
  const baseDate = new Date(preferredDate);
  
  // Generate slots for the preferred date
  for (let hour = 9; hour <= 17; hour++) {
    const startTime = `${hour.toString().padStart(2, '0')}:00`;
    const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
    
    let score = 0.5; // Base score
    
    // Adjust score based on urgency
    if (urgency === 'HIGH') {
      score += 0.3;
    } else if (urgency === 'LOW') {
      score -= 0.1;
    }
    
    // Adjust score based on user preferences
    if (userPreferences.preferredTimes.includes(startTime)) {
      score += 0.2;
    }
    
    timeSlots.push({
      start: startTime,
      end: endTime,
      score: Math.min(score, 1.0),
      factors: [
        {
          factor: "Availability",
          impact: "POSITIVE",
          weight: 0.8
        }
      ]
    });
  }
  
  // Sort by score
  timeSlots.sort((a, b) => b.score - a.score);
  
  return [{
    date: baseDate,
    timeSlots: timeSlots.slice(0, 5) // Top 5 slots
  }];
}

async function analyzeMarketConditions(serviceId: string) {
  // Mock market analysis (in real app, this would use ML models)
  return {
    demand: Math.random() > 0.5 ? "HIGH" : "LOW",
    competition: Math.random() > 0.5 ? "HIGH" : "LOW",
    seasonality: "NORMAL"
  };
}

function calculateSuggestedPrice(basePrice: number, marketConditions: any): number {
  let multiplier = 1.0;
  
  if (marketConditions.demand === "HIGH") {
    multiplier += 0.15;
  } else if (marketConditions.demand === "LOW") {
    multiplier -= 0.10;
  }
  
  if (marketConditions.competition === "HIGH") {
    multiplier -= 0.05;
  } else if (marketConditions.competition === "LOW") {
    multiplier += 0.10;
  }
  
  return Math.round(basePrice * multiplier);
}
