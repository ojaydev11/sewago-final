import { prisma } from '../prisma'
import { logger } from '../log'
import { createSystemAlert, logAutomatedAction } from './utils/ai-helpers'

export class SmartReferralsAI {
  private static readonly MODULE_NAME = 'SmartReferrals'
  
  /**
   * Analyzes city activity and creates promotions for low-activity areas
   * Called by daily cron job
   */
  static async analyzeCityActivity(): Promise<void> {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
      
      // Get booking volumes by city for the last two weeks
      const recentBookings = await prisma.booking.groupBy({
        by: ['serviceId'],
        where: {
          createdAt: { gte: sevenDaysAgo },
        },
        _count: true,
      })

      const previousBookings = await prisma.booking.groupBy({
        by: ['serviceId'],
        where: {
          createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo },
        },
        _count: true,
      })

      // Get all services to map to cities
      const services = await prisma.service.findMany({
        select: { id: true, city: true },
      })

      // Aggregate by city
      const cityActivityMap = new Map<string, { recent: number; previous: number }>()
      
      // Initialize cities
      services.forEach(service => {
        if (!cityActivityMap.has(service.city)) {
          cityActivityMap.set(service.city, { recent: 0, previous: 0 })
        }
      })

      // Count recent bookings
      for (const booking of recentBookings) {
        const service = services.find(s => s.id === booking.serviceId)
        if (service) {
          const cityData = cityActivityMap.get(service.city)!
          cityData.recent += booking._count
        }
      }

      // Count previous bookings
      for (const booking of previousBookings) {
        const service = services.find(s => s.id === booking.serviceId)
        if (service) {
          const cityData = cityActivityMap.get(service.city)!
          cityData.previous += booking._count
        }
      }

      // Analyze drops and create promotions
      for (const [city, activity] of cityActivityMap) {
        const dropPercentage = activity.previous > 0 
          ? ((activity.previous - activity.recent) / activity.previous) * 100 
          : 0

        // If activity dropped by 30% or more, create a referral booster
        if (dropPercentage >= 30 && activity.previous >= 5) {
          const existingPromotion = await prisma.activePromotion.findFirst({
            where: {
              city,
              type: 'REFERRAL_BOOSTER',
              expiresAt: { gt: new Date() },
            },
          })

          if (!existingPromotion) {
            // Create new referral booster promotion
            const promotion = await prisma.activePromotion.create({
              data: {
                name: `${city} Referral Booster ${new Date().toISOString().split('T')[0]}`,
                type: 'REFERRAL_BOOSTER',
                city,
                details: {
                  bonusAmount: 50,
                  referrerBonus: 25,
                  description: 'Limited time referral bonus due to low activity',
                  trigger: 'low_city_activity',
                  dropPercentage,
                  previousBookings: activity.previous,
                  recentBookings: activity.recent,
                },
                expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
              },
            })

            await createSystemAlert({
              level: 'INFO',
              title: 'Referral Booster Created',
              message: `Created referral booster for ${city} due to ${dropPercentage.toFixed(1)}% activity drop`,
              details: {
                city,
                promotionId: promotion.id,
                dropPercentage,
                previousBookings: activity.previous,
                recentBookings: activity.recent,
              },
            })

            await logAutomatedAction({
              module: this.MODULE_NAME,
              trigger: 'City activity drops',
              actionTaken: `Created referral booster promotion for ${city}`,
              details: {
                city,
                promotionId: promotion.id,
                dropPercentage,
                expiresAt: promotion.expiresAt,
              },
              success: true,
            })
          }
        }
      }

      logger.info(`SmartReferralsAI: Analyzed activity for ${cityActivityMap.size} cities`)
    } catch (error) {
      logger.error('SmartReferralsAI: Error analyzing city activity:', error)
      await logAutomatedAction({
        module: this.MODULE_NAME,
        trigger: 'City activity analysis',
        actionTaken: 'Failed to analyze city activity',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        success: false,
      })
    }
  }

  /**
   * Sends welcome message to new users
   * Called by Prisma middleware on User creation
   */
  static async sendWelcomeMessage(userId: string, userPhone: string): Promise<void> {
    try {
      // Send WhatsApp welcome message with Rs. 50 coupon
      const couponCode = this.generateCouponCode()
      
      // Store the coupon (placeholder - could be in a Coupon model)
      const welcomeMessage = `🎉 Welcome to SewaGo! Your Rs. 50 welcome bonus is ready. Use code: ${couponCode} on your first booking. Start exploring our services now!`
      
      // Placeholder for WhatsApp Business API call
      await this.sendWhatsAppMessage(userPhone, welcomeMessage)
      
      // Give the user coins directly
      await prisma.user.update({
        where: { id: userId },
        data: { coins: { increment: 50 } },
      })

      await logAutomatedAction({
        module: this.MODULE_NAME,
        trigger: 'New user sign-up',
        actionTaken: 'Sent welcome message with Rs. 50 bonus',
        details: {
          userId,
          couponCode,
          bonusAmount: 50,
        },
        success: true,
      })
    } catch (error) {
      logger.error('SmartReferralsAI: Error sending welcome message:', error)
      await logAutomatedAction({
        module: this.MODULE_NAME,
        trigger: 'New user welcome',
        actionTaken: 'Failed to send welcome message',
        details: { userId, error: error instanceof Error ? error.message : 'Unknown error' },
        success: false,
      })
    }
  }

  /**
   * Sends re-engagement messages to inactive users
   * Called by daily cron job
   */
  static async reengageInactiveUsers(): Promise<void> {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      
      // Find users who haven't been seen in 7+ days and have at least one booking
      const inactiveUsers = await prisma.user.findMany({
        where: {
          OR: [
            { lastSeen: { lt: sevenDaysAgo } },
            { lastSeen: null, createdAt: { lt: sevenDaysAgo } },
          ],
          shadowBanned: false,
          bookings: {
            some: {}, // Has at least one booking
          },
        },
        include: {
          bookings: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      })

      for (const user of inactiveUsers) {
        // Check if we've already sent a re-engagement message recently
        const recentReengagement = await prisma.automatedActionLog.findFirst({
          where: {
            module: this.MODULE_NAME,
            trigger: 'Inactive user 7+ days',
            details: {
              path: ['userId'],
              equals: user.id,
            },
            createdAt: { gte: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }, // Within last 3 days
          },
        })

        if (!recentReengagement) {
          const lastBooking = user.bookings[0]
          const daysSinceLastBooking = lastBooking 
            ? Math.floor((Date.now() - lastBooking.createdAt.getTime()) / (24 * 60 * 60 * 1000))
            : 'unknown'

          const reengagementMessage = `👋 We miss you at SewaGo! It's been a while since your last service. Come back and enjoy 20% off your next booking with code COMEBACK20. What service can we help you with today?`
          
          await this.sendWhatsAppMessage(user.phone, reengagementMessage)

          await logAutomatedAction({
            module: this.MODULE_NAME,
            trigger: 'Inactive user 7+ days',
            actionTaken: 'Sent re-engagement message with 20% discount',
            details: {
              userId: user.id,
              daysSinceLastSeen: user.lastSeen 
                ? Math.floor((Date.now() - user.lastSeen.getTime()) / (24 * 60 * 60 * 1000))
                : 'never',
              daysSinceLastBooking,
              discountCode: 'COMEBACK20',
            },
            success: true,
          })

          // Small delay to avoid overwhelming WhatsApp API
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }

      logger.info(`SmartReferralsAI: Processed ${inactiveUsers.length} inactive users`)
    } catch (error) {
      logger.error('SmartReferralsAI: Error reengaging inactive users:', error)
      await logAutomatedAction({
        module: this.MODULE_NAME,
        trigger: 'Inactive user re-engagement',
        actionTaken: 'Failed to process inactive users',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        success: false,
      })
    }
  }

  /**
   * Processes referral rewards when a referred user makes their first booking
   */
  static async processReferralReward(referralId: string, bookingAmount: number): Promise<void> {
    try {
      const referral = await prisma.referral.findUnique({
        where: { id: referralId },
        include: {
          referrer: true,
          referred: true,
        },
      })

      if (!referral || !referral.referred) {
        return
      }

      // Calculate rewards based on active promotions
      const activePromotion = await prisma.activePromotion.findFirst({
        where: {
          type: 'REFERRAL_BOOSTER',
          expiresAt: { gt: new Date() },
        },
      })

      const baseReferrerReward = 25
      const baseReferredReward = 50
      
      const referrerReward = activePromotion 
        ? (activePromotion.details as any).referrerBonus || baseReferrerReward
        : baseReferrerReward
      
      const referredReward = activePromotion
        ? (activePromotion.details as any).bonusAmount || baseReferredReward
        : baseReferredReward

      // Give rewards to both users
      await Promise.all([
        prisma.user.update({
          where: { id: referral.referrerId },
          data: { coins: { increment: referrerReward } },
        }),
        prisma.user.update({
          where: { id: referral.referredId! },
          data: { coins: { increment: referredReward } },
        }),
        prisma.referral.update({
          where: { id: referralId },
          data: { redeemedAt: new Date() },
        }),
      ])

      await logAutomatedAction({
        module: this.MODULE_NAME,
        trigger: 'Successful referral booking',
        actionTaken: `Rewarded referrer Rs. ${referrerReward} and referred Rs. ${referredReward}`,
        details: {
          referralId,
          referrerId: referral.referrerId,
          referredId: referral.referredId,
          referrerReward,
          referredReward,
          bookingAmount,
          promotionActive: !!activePromotion,
        },
        success: true,
      })
    } catch (error) {
      logger.error('SmartReferralsAI: Error processing referral reward:', error)
      await logAutomatedAction({
        module: this.MODULE_NAME,
        trigger: 'Referral reward processing',
        actionTaken: 'Failed to process referral reward',
        details: { referralId, error: error instanceof Error ? error.message : 'Unknown error' },
        success: false,
      })
    }
  }

  /**
   * Generate a unique coupon code
   */
  private static generateCouponCode(): string {
    const prefix = 'SEWAGO'
    const suffix = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `${prefix}${suffix}`
  }

  /**
   * Send WhatsApp message (placeholder for actual WhatsApp Business API)
   */
  private static async sendWhatsAppMessage(phone: string, message: string): Promise<void> {
    // Placeholder for WhatsApp Business API integration
    logger.info(`WhatsApp message sent to ${phone}: ${message.substring(0, 50)}...`)
    
    // In production, this would integrate with WhatsApp Business API
    // Example: await whatsappClient.messages.create({ to: phone, body: message })
  }
}