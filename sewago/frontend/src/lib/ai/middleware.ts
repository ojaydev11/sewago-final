import { Prisma } from '@prisma/client'
import { logger } from '../log'
import { ServiceFlowAI } from './ServiceFlowAI'
import { SmartReferralsAI } from './SmartReferralsAI'
import { SecurityShieldAI } from './SecurityShieldAI'
import { ProviderScoutAI } from './ProviderScoutAI'

/**
 * AI Event-Driven Middleware for Prisma
 * Triggers AI actions based on database operations
 */
export const aiMiddleware: Prisma.Middleware = async (params, next) => {
  const result = await next(params)

  try {
    // Only process create and update operations
    if (params.action === 'create' || params.action === 'update') {
      await handleDatabaseEvent(params, result)
    }
  } catch (error) {
    // Don't fail the original operation if AI processing fails
    logger.error('AI middleware error:', error)
  }

  return result
}

async function handleDatabaseEvent(params: Prisma.MiddlewareParams, result: any): Promise<void> {
  const { model, action } = params

  switch (model) {
    case 'User':
      await handleUserEvents(action, params, result)
      break

    case 'Review':
      await handleReviewEvents(action, params, result)
      break

    case 'Booking':
      await handleBookingEvents(action, params, result)
      break

    case 'Provider':
      await handleProviderEvents(action, params, result)
      break

    default:
      // No AI actions needed for other models
      break
  }
}

async function handleUserEvents(
  action: string,
  params: Prisma.MiddlewareParams,
  result: any
): Promise<void> {
  if (action === 'create') {
    // New user sign-up - trigger welcome message
    const userData = result
    if (userData?.id && userData?.phone) {
      logger.info(`AI Trigger: New user created - ${userData.id}`)
      
      // Don't await to avoid blocking the operation
      SmartReferralsAI.sendWelcomeMessage(userData.id, userData.phone)
        .catch(error => logger.error('Failed to send welcome message:', error))
    }
  }
}

async function handleReviewEvents(
  action: string,
  params: Prisma.MiddlewareParams,
  result: any
): Promise<void> {
  if (action === 'create') {
    // New review created - monitor provider performance
    const reviewData = result
    if (reviewData?.rating !== undefined) {
      // Get booking data to find provider
      const booking = await params.runInThisContext(() => {
        // This would need to be adjusted based on your Prisma client setup
        // You might need to query the booking separately
        return null // Placeholder
      })

      if (booking?.providerId) {
        logger.info(`AI Trigger: New review created - Rating: ${reviewData.rating}`)
        
        // Monitor provider performance
        ServiceFlowAI.monitorProviderPerformance({
          providerId: booking.providerId,
          rating: reviewData.rating,
          bookingId: reviewData.bookingId,
        }).catch(error => logger.error('Failed to monitor provider performance:', error))
      }
    }
  }
}

async function handleBookingEvents(
  action: string,
  params: Prisma.MiddlewareParams,
  result: any
): Promise<void> {
  const bookingData = result

  if (action === 'create') {
    // New booking created - check for security issues
    if (bookingData?.userId && bookingData?.id) {
      // Get user data for phone number check
      // This would need proper implementation with your Prisma client
      logger.info(`AI Trigger: New booking created - ${bookingData.id}`)
      
      // Placeholder for phone number abuse check
      // You would implement this with proper user data fetching
      /*
      const userData = await getUserData(bookingData.userId)
      if (userData?.phone) {
        SecurityShieldAI.checkPhoneNumberAbuse({
          userId: bookingData.userId,
          userPhone: userData.phone,
          bookingId: bookingData.id,
        }).catch(error => logger.error('Failed to check phone abuse:', error))
      }
      */
    }

    // Log failed search attempts for service opportunities
    if (bookingData === null && params.args?.where) {
      // This would be triggered on failed booking searches
      // Implementation depends on how you handle search failures
    }
  }

  if (action === 'update') {
    // Booking status changed
    const currentStatus = bookingData?.status
    const previousStatus = params.args?.data?.status

    if (currentStatus === 'CANCELLED' && previousStatus !== 'CANCELLED') {
      // Provider cancelled booking
      logger.info(`AI Trigger: Booking cancelled - ${bookingData.id}`)
      
      ServiceFlowAI.handleProviderCancellation(bookingData.id)
        .catch(error => logger.error('Failed to handle provider cancellation:', error))
    }

    // Check for completed referral bookings
    if (currentStatus === 'COMPLETED' && previousStatus !== 'COMPLETED') {
      // Booking completed - check for referral rewards
      if (bookingData?.userId) {
        // You would need to check if this user was referred
        // and process rewards accordingly
        logger.info(`AI Trigger: Booking completed - checking referrals for ${bookingData.id}`)
      }
    }
  }
}

async function handleProviderEvents(
  action: string,
  params: Prisma.MiddlewareParams,
  result: any
): Promise<void> {
  if (action === 'update') {
    const providerData = result
    const updateData = params.args?.data

    // Check for location updates
    if (updateData?.currentLocation && updateData?.lastLocationUpdate) {
      logger.info(`AI Trigger: Provider location updated - ${providerData.id}`)
      
      SecurityShieldAI.checkFakeLocation({
        providerId: providerData.id,
        newLocation: updateData.currentLocation,
        timestamp: new Date(updateData.lastLocationUpdate),
      }).catch(error => logger.error('Failed to check fake location:', error))
    }
  }
}

/**
 * Initialize AI middleware
 * Call this function to set up the middleware with your Prisma client
 */
export function initializeAIMiddleware(prisma: any): void {
  prisma.$use(aiMiddleware)
  logger.info('AI Middleware initialized')
}

/**
 * Manual trigger functions for specific events
 * Useful for testing or handling edge cases
 */
export const ManualTriggers = {
  async triggerWelcomeMessage(userId: string, userPhone: string): Promise<void> {
    await SmartReferralsAI.sendWelcomeMessage(userId, userPhone)
  },

  async triggerProviderPerformanceCheck(providerId: string, rating: number, bookingId: string): Promise<void> {
    await ServiceFlowAI.monitorProviderPerformance({ providerId, rating, bookingId })
  },

  async triggerPhoneAbuseCheck(userId: string, userPhone: string, bookingId: string): Promise<void> {
    await SecurityShieldAI.checkPhoneNumberAbuse({ userId, userPhone, bookingId })
  },

  async triggerFakeLocationCheck(providerId: string, newLocation: { lat: number; lng: number }): Promise<void> {
    await SecurityShieldAI.checkFakeLocation({
      providerId,
      newLocation,
      timestamp: new Date(),
    })
  },

  async triggerProviderCancellation(bookingId: string): Promise<void> {
    await ServiceFlowAI.handleProviderCancellation(bookingId)
  },

  async logUnavailableService(searchTerm: string, city: string, userId?: string): Promise<void> {
    await ProviderScoutAI.logUnavailableServiceRequest({ searchTerm, city, userId })
  },
}