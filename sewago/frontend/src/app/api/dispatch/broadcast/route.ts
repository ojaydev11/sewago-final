import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      serviceId, 
      location, 
      skills, 
      urgency = 'normal',
      budget 
    } = body;

    if (!serviceId || !location || !skills) {
      return NextResponse.json(
        { error: 'Service ID, location, and skills are required' },
        { status: 400 }
      );
    }

    // Find nearby, qualified, online providers
    const nearbyProviders = await prisma.provider.findMany({
      where: {
        isOnline: true,
        skills: {
          hasSome: skills
        },
        verified: true,
        tier: {
          not: 'PROVISIONAL'
        }
      },
      orderBy: [
        { completionPct: 'desc' },
        { onTimePct: 'desc' },
        { yearsActive: 'desc' }
      ],
      take: 10
    });

    if (nearbyProviders.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No qualified providers available in your area',
        providers: []
      });
    }

    // Top 3 matches for initial ping
    const topMatches = nearbyProviders.slice(0, 3);
    
    // Simulate provider response (in real implementation, this would be WebSocket/real-time)
    const providerResponses = await Promise.all(
      topMatches.map(async (provider) => {
        // Simulate provider decision based on their stats and current workload
        const acceptProbability = Math.min(
          (provider.completionPct / 100) * 
          (provider.onTimePct / 100) * 
          (provider.yearsActive / 5),
          0.9
        );

        const accepted = Math.random() < acceptProbability;
        
        return {
          providerId: provider.id,
          providerName: provider.name,
          accepted,
          responseTime: Math.floor(Math.random() * 40) + 1, // 1-40 seconds
          estimatedArrival: Math.floor(Math.random() * 30) + 15 // 15-45 minutes
        };
      })
    );

    // Check if any top providers accepted
    const acceptedProviders = providerResponses.filter(p => p.accepted);
    
    if (acceptedProviders.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'Providers found and notified',
        providers: acceptedProviders,
        strategy: 'top_matches',
        nextStep: 'wait_for_confirmation'
      });
    }

    // If no top providers accepted, expand radius and add surge bounty
    const expandedProviders = nearbyProviders.slice(3, 8);
    const surgeBounty = urgency === 'urgent' ? 200 : 100;

    const expandedResponses = await Promise.all(
      expandedProviders.map(async (provider) => {
        const acceptProbability = Math.min(
          (provider.completionPct / 100) * 
          (provider.onTimePct / 100) * 
          (provider.yearsActive / 5) * 1.2, // 20% boost due to surge
          0.95
        );

        const accepted = Math.random() < acceptProbability;
        
        return {
          providerId: provider.id,
          providerName: provider.name,
          accepted,
          responseTime: Math.floor(Math.random() * 60) + 40, // 40-100 seconds
          estimatedArrival: Math.floor(Math.random() * 45) + 30, // 30-75 minutes
          surgeBounty
        };
      })
    );

    const allAcceptedProviders = [
      ...acceptedProviders,
      ...expandedResponses.filter(p => p.accepted)
    ];

    return NextResponse.json({
      success: true,
      message: 'Expanded provider search completed',
      providers: allAcceptedProviders,
      strategy: 'expanded_search',
      surgeBounty: allAcceptedProviders.length > 0 ? surgeBounty : 0,
      nextStep: 'final_confirmation'
    });

  } catch (error) {
    console.error('Error in dispatch broadcast:', error);
    return NextResponse.json(
      { error: 'Failed to broadcast dispatch request' },
      { status: 500 }
    );
  }
}
