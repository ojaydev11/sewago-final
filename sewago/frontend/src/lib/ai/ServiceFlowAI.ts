import { prisma } from '../prisma'
import { logger } from '../log'
import { createSystemAlert, logAutomatedAction } from './utils/ai-helpers'

export class ServiceFlowAI {
  private static readonly MODULE_NAME = 'ServiceFlow'
  
  /**
   * Checks for delayed bookings and reassigns them automatically
   * Called by cron job every 5 minutes
   */
  static async handleDelayedBookings(): Promise<void> {
    try {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000)
      
      // Find bookings that are assigned but delayed beyond 10 minutes
      const delayedBookings = await prisma.booking.findMany({
        where: {
          status: 'ASSIGNED',
          providerId: { not: null },
          scheduledAt: { lt: tenMinutesAgo },
        },
        include: {
          provider: true,
          user: true,
          service: true,
        },
      })

      for (const booking of delayedBookings) {
        const oldProviderId = booking.providerId
        const oldProviderName = booking.provider?.name

        // Find a new provider in the same zones
        const newProvider = await this.findAlternativeProvider(
          booking.service.city,
          booking.service.category,
          oldProviderId!
        )

        if (newProvider) {
          // Reassign the booking
          await prisma.booking.update({
            where: { id: booking.id },
            data: {
              providerId: newProvider.id,
              status: 'ASSIGNED',
            },
          })

          // Create system alert
          await createSystemAlert({
            level: 'INFO',
            title: 'Booking Auto-Reassigned',
            message: `Booking ${booking.id} was delayed and reassigned from ${oldProviderName} to ${newProvider.name}`,
            details: {
              bookingId: booking.id,
              oldProviderId,
              newProviderId: newProvider.id,
              delayMinutes: Math.floor((Date.now() - booking.scheduledAt!.getTime()) / 60000),
            },
          })

          // Log the automated action
          await logAutomatedAction({
            module: this.MODULE_NAME,
            trigger: 'Booking delayed > 10 min',
            actionTaken: `Reassigned booking ${booking.id} from provider ${oldProviderId} to ${newProvider.id}`,
            details: { bookingId: booking.id, oldProviderId, newProviderId: newProvider.id },
            success: true,
          })

          // Send notification to user (placeholder for WhatsApp/SMS integration)
          await this.notifyUserOfReassignment(booking, newProvider)
        } else {
          // No alternative provider found
          await createSystemAlert({
            level: 'WARNING',
            title: 'No Alternative Provider Found',
            message: `Could not reassign delayed booking ${booking.id} - no available providers`,
            details: {
              bookingId: booking.id,
              originalProviderId: oldProviderId,
              serviceCategory: booking.service.category,
              city: booking.service.city,
            },
          })
        }
      }

      logger.info(`ServiceFlowAI: Processed ${delayedBookings.length} delayed bookings`)
    } catch (error) {
      logger.error('ServiceFlowAI: Error handling delayed bookings:', error)
      await logAutomatedAction({
        module: this.MODULE_NAME,
        trigger: 'Delayed booking check',
        actionTaken: 'Failed to process delayed bookings',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        success: false,
      })
    }
  }

  /**
   * Monitors provider performance and issues warnings for low ratings
   * Called when a new review is created
   */
  static async monitorProviderPerformance(reviewData: {
    providerId: string
    rating: number
    bookingId: string
  }): Promise<void> {
    try {
      const { providerId, rating } = reviewData

      if (rating < 3) {
        // Check recent low ratings in the last 30 days
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        
        const lowRatings = await prisma.review.findMany({
          where: {
            booking: { providerId },
            rating: { lt: 3 },
            createdAt: { gte: thirtyDaysAgo },
          },
        })

        if (lowRatings.length >= 2) {
          // Second low rating within 30 days - pause provider
          await prisma.provider.update({
            where: { id: providerId },
            data: { status: 'PAUSED' },
          })

          // Issue warning
          await prisma.providerWarning.create({
            data: {
              providerId,
              reason: 'Multiple low ratings within 30 days',
              details: {
                lowRatingCount: lowRatings.length,
                recentRatings: lowRatings.map(r => ({ rating: r.rating, date: r.createdAt })),
              },
            },
          })

          // Create system alert
          await createSystemAlert({
            level: 'WARNING',
            title: 'Provider Account Paused',
            message: `Provider ${providerId} paused due to ${lowRatings.length} low ratings in 30 days`,
            details: {
              providerId,
              lowRatingCount: lowRatings.length,
              triggerRating: rating,
            },
          })

          await logAutomatedAction({
            module: this.MODULE_NAME,
            trigger: 'Provider rated below 3 stars twice',
            actionTaken: `Paused provider ${providerId} and issued warning`,
            details: { providerId, lowRatingCount: lowRatings.length },
            success: true,
          })
        }
      }
    } catch (error) {
      logger.error('ServiceFlowAI: Error monitoring provider performance:', error)
      await logAutomatedAction({
        module: this.MODULE_NAME,
        trigger: 'Provider performance monitoring',
        actionTaken: 'Failed to monitor provider performance',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        success: false,
      })
    }
  }

  /**
   * Handles provider cancellations by crediting user and finding replacement
   */
  static async handleProviderCancellation(bookingId: string): Promise<void> {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { user: true, service: true },
      })

      if (!booking) {
        throw new Error(`Booking ${bookingId} not found`)
      }

      // Credit user's wallet with Rs. 25
      await prisma.user.update({
        where: { id: booking.userId },
        data: { coins: { increment: 25 } },
      })

      // Reset booking status and remove provider
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          providerId: null,
          status: 'PENDING',
        },
      })

      // Try to find a new provider immediately
      const newProvider = await this.findAlternativeProvider(
        booking.service.city,
        booking.service.category
      )

      if (newProvider) {
        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            providerId: newProvider.id,
            status: 'ASSIGNED',
          },
        })
      }

      await logAutomatedAction({
        module: this.MODULE_NAME,
        trigger: 'Booking canceled by provider',
        actionTaken: `Credited user Rs. 25, reset booking, ${newProvider ? 'assigned new provider' : 'no replacement found'}`,
        details: {
          bookingId,
          userId: booking.userId,
          creditAmount: 25,
          newProviderId: newProvider?.id,
        },
        success: true,
      })

      // Send notification to user
      await this.notifyUserOfCancellation(booking, newProvider)
    } catch (error) {
      logger.error('ServiceFlowAI: Error handling provider cancellation:', error)
      await logAutomatedAction({
        module: this.MODULE_NAME,
        trigger: 'Provider cancellation handling',
        actionTaken: 'Failed to handle provider cancellation',
        details: { bookingId, error: error instanceof Error ? error.message : 'Unknown error' },
        success: false,
      })
    }
  }

  /**
   * Find an alternative provider for a booking
   */
  private static async findAlternativeProvider(
    city: string,
    serviceCategory: string,
    excludeProviderId?: string
  ) {
    return await prisma.provider.findFirst({
      where: {
        status: 'ACTIVE',
        isOnline: true,
        skills: { has: serviceCategory },
        zones: { has: city },
        id: excludeProviderId ? { not: excludeProviderId } : undefined,
      },
      orderBy: [
        { onTimePct: 'desc' },
        { completionPct: 'desc' },
      ],
    })
  }

  /**
   * Notify user of booking reassignment (placeholder for actual notification system)
   */
  private static async notifyUserOfReassignment(booking: any, newProvider: any): Promise<void> {
    // Placeholder for WhatsApp/SMS notification
    logger.info(`Notifying user ${booking.userId} of reassignment to provider ${newProvider.id}`)
  }

  /**
   * Notify user of provider cancellation (placeholder for actual notification system)
   */
  private static async notifyUserOfCancellation(booking: any, newProvider?: any): Promise<void> {
    // Placeholder for WhatsApp/SMS notification
    logger.info(`Notifying user ${booking.userId} of cancellation${newProvider ? ' and new assignment' : ''}`)
  }
}