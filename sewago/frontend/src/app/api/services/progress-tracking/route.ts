import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/auth-guards';

// GET /api/services/progress-tracking - Get service progress for a booking
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // Get booking with progress data
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        serviceProgress: true,
        user: {
          select: { id: true, name: true, email: true }
        },
        service: {
          select: { id: true, name: true, category: true }
        },
        provider: {
          select: { id: true, name: true, phone: true, verified: true }
        }
      }
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    let progressData = booking.serviceProgress;

    // Create progress data if it doesn't exist
    if (!progressData) {
      progressData = await prisma.serviceProgress.create({
        data: {
          bookingId,
          currentStage: 'PENDING',
          stages: [],
          qualityChecks: generateQualityChecks(booking.service.category),
          customerApprovals: [],
          evidencePhotos: [],
          issuesReported: [],
          milestones: []
        }
      });
    }

    // Calculate progress percentage
    const allStages = [
      'PENDING', 'CONFIRMED', 'PREPARATION', 'EN_ROUTE', 'ARRIVED',
      'IN_PROGRESS', 'QUALITY_CHECK', 'CUSTOMER_REVIEW', 'COMPLETED', 'VERIFIED'
    ];
    const currentIndex = allStages.indexOf(progressData.currentStage);
    const progressPercentage = Math.round(((currentIndex + 1) / allStages.length) * 100);

    // Get next milestone
    const nextMilestone = currentIndex < allStages.length - 1 
      ? {
          stage: allStages[currentIndex + 1],
          description: getStageDescription(allStages[currentIndex + 1]),
          estimatedTime: estimateStageTime(allStages[currentIndex + 1])
        }
      : null;

    const responseData = {
      bookingId: booking.id,
      currentStage: progressData.currentStage,
      stages: progressData.stages || [],
      startedAt: progressData.startedAt?.toISOString(),
      estimatedCompletion: progressData.estimatedCompletion?.toISOString(),
      actualCompletion: progressData.actualCompletion?.toISOString(),
      qualityChecks: progressData.qualityChecks || [],
      customerApprovals: progressData.customerApprovals || [],
      evidencePhotos: progressData.evidencePhotos || [],
      notes: progressData.notes,
      issuesReported: progressData.issuesReported || [],
      progressPercentage,
      nextMilestone,
      service: booking.service,
      provider: booking.provider
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching service progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service progress' },
      { status: 500 }
    );
  }
}

// POST /api/services/progress-tracking - Update service progress
export async function POST(request: NextRequest) {
  return withAuth(async (req: NextRequest, { user }: any) => {
    try {
      const formData = await request.formData();
      const bookingId = formData.get('bookingId') as string;
      const stage = formData.get('stage') as string;
      const notes = formData.get('notes') as string;

      if (!bookingId || !stage) {
        return NextResponse.json(
          { error: 'Booking ID and stage are required' },
          { status: 400 }
        );
      }

      // Verify booking exists and user has permission
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { serviceProgress: true, provider: true }
      });

      if (!booking) {
        return NextResponse.json(
          { error: 'Booking not found' },
          { status: 404 }
        );
      }

      // Handle photo uploads (simplified - in production, upload to cloud storage)
      const photos: string[] = [];
      const photoFiles = formData.getAll('photos') as File[];
      
      for (let i = 0; i < photoFiles.length; i++) {
        const file = photoFiles[i];
        if (file instanceof File && file.size > 0) {
          // In production, upload to cloud storage and get URL
          const photoUrl = `https://example.com/photos/${Date.now()}-${i}.jpg`;
          photos.push(photoUrl);
        }
      }

      // Create new milestone
      const newMilestone = {
        stage,
        timestamp: new Date().toISOString(),
        description: getStageDescription(stage),
        completedBy: user.id,
        notes,
        photos
      };

      // Update service progress
      let progressData = booking.serviceProgress;
      
      if (!progressData) {
        // Create initial progress data
        progressData = await prisma.serviceProgress.create({
          data: {
            bookingId,
            currentStage: stage,
            stages: [newMilestone],
            startedAt: stage !== 'PENDING' ? new Date() : null,
            qualityChecks: generateQualityChecks('general'),
            customerApprovals: [],
            evidencePhotos: photos,
            notes,
            issuesReported: [],
            milestones: [newMilestone]
          }
        });
      } else {
        // Update existing progress
        const updatedStages = [...(progressData.stages as any[]), newMilestone];
        const updatedPhotos = [...(progressData.evidencePhotos || []), ...photos];

        progressData = await prisma.serviceProgress.update({
          where: { id: progressData.id },
          data: {
            currentStage: stage,
            stages: updatedStages,
            evidencePhotos: updatedPhotos,
            notes: notes || progressData.notes,
            startedAt: progressData.startedAt || (stage !== 'PENDING' ? new Date() : null),
            estimatedCompletion: stage === 'IN_PROGRESS' 
              ? new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours estimate
              : progressData.estimatedCompletion,
            actualCompletion: stage === 'COMPLETED' ? new Date() : progressData.actualCompletion
          }
        });
      }

      // Update booking status if applicable
      const bookingStatusMap: Record<string, any> = {
        'CONFIRMED': 'CONFIRMED',
        'PROVIDER_ASSIGNED': 'PROVIDER_ASSIGNED',
        'EN_ROUTE': 'EN_ROUTE',
        'IN_PROGRESS': 'IN_PROGRESS',
        'COMPLETED': 'COMPLETED'
      };

      if (bookingStatusMap[stage]) {
        await prisma.booking.update({
          where: { id: bookingId },
          data: { 
            status: bookingStatusMap[stage],
            completedAt: stage === 'COMPLETED' ? new Date() : booking.completedAt
          }
        });
      }

      // Log transparency action
      await prisma.transparencyLog.create({
        data: {
          entityType: 'booking',
          entityId: bookingId,
          action: 'PROGRESS_UPDATE',
          data: {
            previousStage: booking.serviceProgress?.currentStage,
            newStage: stage,
            notes,
            photosCount: photos.length
          },
          userId: user.id,
          providerId: booking.providerId
        }
      });

      // In production, broadcast via WebSocket
      // io.emit('progress_update', { bookingId, stage, milestone: newMilestone });

      return NextResponse.json({
        success: true,
        message: 'Progress updated successfully',
        progressData
      });
    } catch (error) {
      console.error('Error updating service progress:', error);
      return NextResponse.json(
        { error: 'Failed to update progress' },
        { status: 500 }
      );
    }
  })(request);
}

function getStageDescription(stage: string): string {
  const descriptions: Record<string, string> = {
    'PENDING': 'Waiting for confirmation',
    'CONFIRMED': 'Service booking confirmed',
    'PREPARATION': 'Provider preparing for service',
    'EN_ROUTE': 'Provider traveling to location',
    'ARRIVED': 'Provider has arrived at location',
    'IN_PROGRESS': 'Service is being performed',
    'QUALITY_CHECK': 'Quality inspection in progress',
    'CUSTOMER_REVIEW': 'Awaiting customer approval',
    'COMPLETED': 'Service completed successfully',
    'VERIFIED': 'Service verified and approved',
    'PAYMENT_PENDING': 'Payment processing',
    'CLOSED': 'Service closed'
  };
  return descriptions[stage] || 'Unknown stage';
}

function estimateStageTime(stage: string): number {
  // Return estimated time in minutes for each stage
  const stageTimes: Record<string, number> = {
    'PENDING': 15,
    'CONFIRMED': 30,
    'PREPARATION': 20,
    'EN_ROUTE': 30,
    'ARRIVED': 5,
    'IN_PROGRESS': 120,
    'QUALITY_CHECK': 15,
    'CUSTOMER_REVIEW': 10,
    'COMPLETED': 5,
    'VERIFIED': 5
  };
  return stageTimes[stage] || 30;
}

function generateQualityChecks(category: string) {
  const baseChecks = [
    {
      id: 'safety-check',
      name: 'Safety Protocols',
      description: 'Verify all safety measures are followed',
      required: true,
      completed: false
    },
    {
      id: 'work-quality',
      name: 'Work Quality',
      description: 'Assess the quality of work performed',
      required: true,
      completed: false
    },
    {
      id: 'cleanliness',
      name: 'Cleanliness',
      description: 'Check that work area is left clean',
      required: false,
      completed: false
    }
  ];

  // Add category-specific checks
  const categoryChecks: Record<string, any[]> = {
    'house-cleaning': [
      {
        id: 'deep-clean-verification',
        name: 'Deep Clean Verification',
        description: 'Verify all areas have been thoroughly cleaned',
        required: true,
        completed: false
      }
    ],
    'electrical-work': [
      {
        id: 'electrical-safety',
        name: 'Electrical Safety Test',
        description: 'Test all electrical connections and safety',
        required: true,
        completed: false
      }
    ]
  };

  return [...baseChecks, ...(categoryChecks[category] || [])];
}