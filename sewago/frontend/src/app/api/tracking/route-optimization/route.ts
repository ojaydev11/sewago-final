import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

interface RouteOptimizationRequest {
  providerId: string;
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  preferences?: {
    prioritize: 'time' | 'cost' | 'comfort' | 'eco';
    avoidTolls: boolean;
    avoidHighways: boolean;
    maxDetourTime: number;
  };
  includeTraffic?: boolean;
  includeIncidents?: boolean;
  realTimeData?: boolean;
}

interface RouteOption {
  id: string;
  name: string;
  distance: number;
  duration: number;
  trafficDelay: number;
  totalTime: number;
  preferenceScore: number;
  waypoints: Array<{ lat: number; lng: number; label?: string }>;
  incidents: any[];
  fuelCost: number;
  tollCost: number;
  roadTypes: string[];
  difficulty: 'EASY' | 'MODERATE' | 'DIFFICULT';
  weatherImpact: number;
}

// POST /api/tracking/route-optimization - Optimize routes for provider
export async function POST(request: NextRequest) {
  try {
    const body: RouteOptimizationRequest = await request.json();
    const {
      providerId,
      origin,
      destination,
      preferences = {
        prioritize: 'time',
        avoidTolls: false,
        avoidHighways: false,
        maxDetourTime: 15
      },
      includeTraffic = true,
      includeIncidents = true,
      realTimeData = true
    } = body;

    // Validate required fields
    if (!providerId || !origin || !destination) {
      return NextResponse.json(
        { error: 'Provider ID, origin, and destination are required' },
        { status: 400 }
      );
    }

    // Verify provider exists
    const provider = await prisma.provider.findUnique({
      where: { id: providerId }
    });

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      );
    }

    // Calculate distance using Haversine formula
    const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
      const R = 6371; // Earth's radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLng = (lng2 - lng1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    const baseDistance = calculateDistance(origin.lat, origin.lng, destination.lat, destination.lng);
    const baseDuration = Math.round(baseDistance * 3); // Rough estimate: 3 minutes per km

    // Generate route options (in production, use real routing APIs)
    const generateRouteOptions = (): RouteOption[] => {
      const routes: RouteOption[] = [];

      // Main route (fastest)
      routes.push({
        id: 'main-route',
        name: 'Fastest Route',
        distance: baseDistance,
        duration: baseDuration,
        trafficDelay: includeTraffic ? Math.floor(Math.random() * 10) : 0,
        totalTime: baseDuration + (includeTraffic ? Math.floor(Math.random() * 10) : 0),
        preferenceScore: 95,
        waypoints: [origin, destination],
        incidents: includeIncidents ? generateTrafficIncidents() : [],
        fuelCost: Math.round(baseDistance * 15), // NPR 15 per km
        tollCost: preferences.avoidTolls ? 0 : Math.floor(Math.random() * 200),
        roadTypes: preferences.avoidHighways ? ['main_road', 'local_road'] : ['highway', 'main_road'],
        difficulty: 'EASY',
        weatherImpact: 1.0
      });

      // Alternative route (avoiding traffic)
      routes.push({
        id: 'alt-route-1',
        name: 'Traffic-Free Route',
        distance: baseDistance * 1.15,
        duration: Math.round(baseDuration * 1.1),
        trafficDelay: 0,
        totalTime: Math.round(baseDuration * 1.1),
        preferenceScore: 85,
        waypoints: [origin, destination],
        incidents: [],
        fuelCost: Math.round(baseDistance * 1.15 * 15),
        tollCost: preferences.avoidTolls ? 0 : Math.floor(Math.random() * 150),
        roadTypes: ['main_road', 'local_road'],
        difficulty: 'MODERATE',
        weatherImpact: 1.0
      });

      // Scenic route (comfort prioritized)
      if (preferences.prioritize === 'comfort') {
        routes.push({
          id: 'scenic-route',
          name: 'Scenic Route',
          distance: baseDistance * 1.3,
          duration: Math.round(baseDuration * 1.25),
          trafficDelay: 2,
          totalTime: Math.round(baseDuration * 1.25) + 2,
          preferenceScore: 75,
          waypoints: [origin, destination],
          incidents: [],
          fuelCost: Math.round(baseDistance * 1.3 * 15),
          tollCost: 0,
          roadTypes: ['local_road'],
          difficulty: 'EASY',
          weatherImpact: 1.1
        });
      }

      return routes;
    };

    const generateTrafficIncidents = () => {
      const incidents = [
        {
          type: 'congestion',
          severity: 'MEDIUM',
          description: 'Heavy traffic due to rush hour',
          location: { lat: origin.lat + 0.01, lng: origin.lng + 0.01 },
          estimatedClearTime: new Date(Date.now() + 30 * 60000).toISOString(),
          detourAvailable: true
        }
      ];
      
      if (Math.random() > 0.7) {
        incidents.push({
          type: 'construction',
          severity: 'LOW',
          description: 'Road construction - single lane',
          location: { lat: origin.lat + 0.005, lng: origin.lng + 0.005 },
          estimatedClearTime: new Date(Date.now() + 2 * 60 * 60000).toISOString(),
          detourAvailable: true
        });
      }
      
      return incidents;
    };

    const routeOptions = generateRouteOptions();

    // Sort by preference
    routeOptions.sort((a, b) => {
      switch (preferences.prioritize) {
        case 'time':
          return a.totalTime - b.totalTime;
        case 'cost':
          return (a.fuelCost + a.tollCost) - (b.fuelCost + b.tollCost);
        case 'comfort':
          return b.preferenceScore - a.preferenceScore;
        default:
          return a.totalTime - b.totalTime;
      }
    });

    const recommendedRoute = routeOptions[0];
    const alternativeRoutes = routeOptions.slice(1);

    // Calculate optimization benefits
    const worstRoute = [...routeOptions].sort((a, b) => b.totalTime - a.totalTime)[0];
    const timeSaved = worstRoute.totalTime - recommendedRoute.totalTime;
    const costSaved = (worstRoute.fuelCost + worstRoute.tollCost) - (recommendedRoute.fuelCost + recommendedRoute.tollCost);

    const optimizationReason = getOptimizationReason(recommendedRoute, preferences);
    const confidenceLevel = calculateConfidenceLevel(recommendedRoute, includeTraffic, realTimeData);

    // Log optimization request
    await prisma.transparencyLog.create({
      data: {
        entityType: 'provider',
        entityId: providerId,
        action: 'PROGRESS_UPDATE',
        data: {
          origin,
          destination,
          recommendedRoute: recommendedRoute.name,
          timeSaved,
          costSaved
        },
        providerId
      }
    });

    const result = {
      recommendedRoute,
      alternativeRoutes,
      optimizationReason,
      timeSaved,
      costSaved,
      confidenceLevel,
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error optimizing routes:', error);
    return NextResponse.json(
      { error: 'Failed to optimize routes' },
      { status: 500 }
    );
  }
}

function getOptimizationReason(route: RouteOption, preferences: any): string {
  switch (preferences.prioritize) {
    case 'time':
      return `Selected fastest route saving ${route.trafficDelay} minutes by avoiding traffic congestion.`;
    case 'cost':
      return `Selected most economical route with minimal fuel and toll costs.`;
    case 'comfort':
      return `Selected comfortable route with easier roads and better driving conditions.`;
    case 'eco':
      return `Selected eco-friendly route with optimal fuel efficiency.`;
    default:
      return `Optimized route based on current traffic conditions and your preferences.`;
  }
}

function calculateConfidenceLevel(route: RouteOption, includeTraffic: boolean, realTimeData: boolean): number {
  let confidence = 70; // Base confidence
  
  if (includeTraffic) confidence += 15;
  if (realTimeData) confidence += 10;
  if (route.incidents.length === 0) confidence += 5;
  
  return Math.min(confidence, 95);
}