import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const marketingCampaignSchema = z.object({
  campaignName: z.string().min(1, 'Campaign name is required'),
  description: z.string().optional(),
  campaignType: z.enum(['AWARENESS', 'ACQUISITION', 'RETENTION', 'UPSELL', 'SEASONAL', 'PROMOTIONAL', 'REFERRAL']),
  budget: z.number().positive('Budget must be positive'),
  startDate: z.string().transform(str => new Date(str)),
  endDate: z.string().transform(str => new Date(str)).optional(),
  targetAudience: z.object({
    demographics: z.object({
      ageRange: z.object({ min: z.number(), max: z.number() }).optional(),
      interests: z.array(z.string()).optional(),
      location: z.array(z.string()).optional(),
    }).optional(),
    geographic: z.object({
      zones: z.array(z.string()),
      radius: z.number().optional(),
    }),
    behavioral: z.object({
      previousBookings: z.boolean().optional(),
      serviceCategories: z.array(z.string()).optional(),
      bookingFrequency: z.enum(['first-time', 'occasional', 'regular', 'frequent']).optional(),
    }).optional(),
  }),
  channels: z.array(z.enum(['EMAIL', 'SMS', 'PUSH_NOTIFICATION', 'IN_APP', 'SOCIAL_MEDIA', 'SEARCH', 'REFERRAL'])),
});

// GET /api/providers/marketing - Get marketing campaigns
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const providerId = url.searchParams.get('providerId');
    const status = url.searchParams.get('status');
    const type = url.searchParams.get('type');

    if (!providerId) {
      return NextResponse.json(
        { error: 'Provider ID is required' },
        { status: 400 }
      );
    }

    const whereClause: any = { providerId };
    if (status) whereClause.status = status;
    if (type) whereClause.campaignType = type;

    const campaigns = await prisma.providerMarketing.findMany({
      where: whereClause,
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            tier: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate campaign performance summary
    const summary = {
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter(c => c.status === 'ACTIVE').length,
      totalBudget: campaigns.reduce((sum, c) => sum + c.budget, 0),
      totalSpent: campaigns.reduce((sum, c) => sum + c.spentAmount, 0),
      totalBookingsGenerated: campaigns.reduce((sum, c) => sum + c.createdBookings, 0),
      totalRevenueGenerated: campaigns.reduce((sum, c) => sum + c.createdRevenue, 0),
      averageROI: campaigns.length > 0 
        ? campaigns.reduce((sum, c) => sum + c.roi, 0) / campaigns.length 
        : 0,
    };

    return NextResponse.json({
      campaigns,
      summary,
    });
  } catch (error) {
    console.error('Marketing campaigns error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch marketing campaigns' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/providers/marketing - Create new marketing campaign
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { providerId, ...campaignData } = body;

    if (!providerId) {
      return NextResponse.json(
        { error: 'Provider ID is required' },
        { status: 400 }
      );
    }

    // Validate campaign data
    const validatedData = marketingCampaignSchema.parse(campaignData);

    // Check if provider exists
    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
      select: { id: true, name: true, zones: true },
    });

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      );
    }

    // Validate that target geographic zones are within provider's service areas
    const targetZones = validatedData.targetAudience.geographic.zones;
    const invalidZones = targetZones.filter(zone => !provider.zones.includes(zone));
    
    if (invalidZones.length > 0) {
      return NextResponse.json(
        { 
          error: `Invalid target zones: ${invalidZones.join(', ')}. Provider only serves: ${provider.zones.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Create the marketing campaign
    const campaign = await prisma.providerMarketing.create({
      data: {
        providerId,
        campaignName: validatedData.campaignName,
        description: validatedData.description,
        campaignType: validatedData.campaignType,
        budget: validatedData.budget,
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
        targetAudience: validatedData.targetAudience,
        channels: validatedData.channels,
        status: 'DRAFT',
      },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            tier: true,
          }
        }
      }
    });

    // Generate initial campaign recommendations
    const recommendations = await generateCampaignRecommendations(campaign);

    return NextResponse.json({
      campaign,
      recommendations,
    });
  } catch (error) {
    console.error('Create marketing campaign error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create marketing campaign' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT /api/providers/marketing - Update marketing campaign
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { campaignId, ...updateData } = body;

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      );
    }

    // Find existing campaign
    const existingCampaign = await prisma.providerMarketing.findUnique({
      where: { id: campaignId },
    });

    if (!existingCampaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Update campaign
    const updatedCampaign = await prisma.providerMarketing.update({
      where: { id: campaignId },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            tier: true,
          }
        }
      }
    });

    return NextResponse.json(updatedCampaign);
  } catch (error) {
    console.error('Update marketing campaign error:', error);
    return NextResponse.json(
      { error: 'Failed to update marketing campaign' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE /api/providers/marketing - Delete marketing campaign
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const campaignId = url.searchParams.get('campaignId');

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      );
    }

    // Check if campaign exists and can be deleted
    const campaign = await prisma.providerMarketing.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    if (campaign.status === 'ACTIVE') {
      return NextResponse.json(
        { error: 'Cannot delete active campaign. Please pause it first.' },
        { status: 400 }
      );
    }

    // Delete campaign
    await prisma.providerMarketing.delete({
      where: { id: campaignId },
    });

    return NextResponse.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Delete marketing campaign error:', error);
    return NextResponse.json(
      { error: 'Failed to delete marketing campaign' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function to generate campaign recommendations
async function generateCampaignRecommendations(campaign: any) {
  const recommendations = [];

  // Budget recommendations based on campaign type
  const budgetPerBooking = 300; // NPR 3 per booking in paisa
  const estimatedReach = campaign.budget / budgetPerBooking;

  recommendations.push({
    type: 'budget',
    title: 'Budget Optimization',
    description: `With your budget of NPR ${(campaign.budget / 100).toFixed(0)}, you can potentially reach ${estimatedReach} potential customers.`,
    suggestion: campaign.budget < 5000 
      ? 'Consider increasing budget for better campaign reach'
      : 'Budget is adequate for good campaign performance',
  });

  // Channel recommendations
  const channelRecommendations = {
    'AWARENESS': ['SOCIAL_MEDIA', 'SEARCH', 'IN_APP'],
    'ACQUISITION': ['EMAIL', 'SMS', 'REFERRAL'],
    'RETENTION': ['EMAIL', 'PUSH_NOTIFICATION', 'SMS'],
    'UPSELL': ['EMAIL', 'IN_APP', 'PUSH_NOTIFICATION'],
  };

  const recommendedChannels = channelRecommendations[campaign.campaignType as keyof typeof channelRecommendations] || [];
  const missingChannels = recommendedChannels.filter(channel => !campaign.channels.includes(channel));

  if (missingChannels.length > 0) {
    recommendations.push({
      type: 'channels',
      title: 'Channel Optimization',
      description: `Consider adding these channels for ${campaign.campaignType} campaigns: ${missingChannels.join(', ')}`,
      suggestion: 'These channels typically perform well for your campaign type',
    });
  }

  // Timing recommendations
  const campaignDuration = campaign.endDate 
    ? Math.ceil((campaign.endDate.getTime() - campaign.startDate.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  if (campaignDuration && campaignDuration < 7) {
    recommendations.push({
      type: 'timing',
      title: 'Campaign Duration',
      description: 'Short campaigns may not have enough time to optimize performance',
      suggestion: 'Consider extending campaign to at least 1 week for better results',
    });
  }

  // Target audience recommendations
  const audienceSize = estimateAudienceSize(campaign.targetAudience);
  if (audienceSize < 100) {
    recommendations.push({
      type: 'audience',
      title: 'Audience Size',
      description: 'Your target audience might be too narrow, limiting campaign reach',
      suggestion: 'Consider expanding geographic area or demographic criteria',
    });
  }

  return recommendations;
}

function estimateAudienceSize(targetAudience: any) {
  // Mock estimation based on geographic zones and demographic criteria
  const baseAudience = targetAudience.geographic.zones.length * 1000; // 1000 potential customers per zone
  
  let audienceMultiplier = 1;
  
  // Adjust based on demographic constraints
  if (targetAudience.demographics?.ageRange) {
    const ageRangeSize = targetAudience.demographics.ageRange.max - targetAudience.demographics.ageRange.min;
    audienceMultiplier *= Math.min(1, ageRangeSize / 50); // Normalize age range impact
  }
  
  if (targetAudience.behavioral?.serviceCategories?.length) {
    audienceMultiplier *= Math.max(0.1, 1 - (targetAudience.behavioral.serviceCategories.length * 0.1));
  }

  return Math.floor(baseAudience * audienceMultiplier);
}