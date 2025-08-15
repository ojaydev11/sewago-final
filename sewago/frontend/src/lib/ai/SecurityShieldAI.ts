import { prisma } from '../prisma'
import { logger } from '../log'
import { createSystemAlert, logAutomatedAction } from './utils/ai-helpers'

export class SecurityShieldAI {
  private static readonly MODULE_NAME = 'SecurityShield'
  
  /**
   * Checks for phone number abuse across different user accounts
   * Called when a new booking is created
   */
  static async checkPhoneNumberAbuse(bookingData: {
    userId: string
    userPhone: string
    bookingId: string
  }): Promise<void> {
    try {
      const { userId, userPhone, bookingId } = bookingData
      
      // Find all users with the same phone number
      const usersWithSamePhone = await prisma.user.findMany({
        where: {
          phone: userPhone,
          id: { not: userId }, // Exclude the current user
        },
        include: {
          bookings: true,
        },
      })

      if (usersWithSamePhone.length > 0) {
        // Count total bookings across all accounts with this phone number
        const totalBookings = usersWithSamePhone.reduce(
          (total, user) => total + user.bookings.length, 
          1 // Include current booking
        )

        if (totalBookings >= 3) {
          // Third booking with same phone number - create security flag
          await prisma.securityFlag.create({
            data: {
              userId,
              type: 'POTENTIAL_ABUSE',
              details: {
                phoneNumber: userPhone,
                triggerBookingId: bookingId,
                duplicateAccounts: usersWithSamePhone.map(u => ({
                  userId: u.id,
                  bookingCount: u.bookings.length,
                  createdAt: u.createdAt,
                })),
                totalBookingsWithPhone: totalBookings,
              },
              status: 'PENDING_REVIEW',
            },
          })

          await createSystemAlert({
            level: 'WARNING',
            title: 'Potential Phone Number Abuse Detected',
            message: `Phone number ${userPhone} used across ${usersWithSamePhone.length + 1} accounts with ${totalBookings} total bookings`,
            details: {
              userId,
              phoneNumber: userPhone,
              accountCount: usersWithSamePhone.length + 1,
              totalBookings,
              triggerBookingId: bookingId,
            },
          })

          await logAutomatedAction({
            module: this.MODULE_NAME,
            trigger: 'User making 3 bookings with same number',
            actionTaken: `Created security flag for potential phone abuse`,
            details: {
              userId,
              phoneNumber: userPhone,
              totalBookings,
              duplicateAccountCount: usersWithSamePhone.length,
            },
            success: true,
          })
        }
      }
    } catch (error) {
      logger.error('SecurityShieldAI: Error checking phone number abuse:', error)
      await logAutomatedAction({
        module: this.MODULE_NAME,
        trigger: 'Phone number abuse check',
        actionTaken: 'Failed to check phone number abuse',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        success: false,
      })
    }
  }

  /**
   * Checks for fake location based on impossible travel speeds
   * Called when provider updates their location
   */
  static async checkFakeLocation(locationData: {
    providerId: string
    newLocation: { lat: number; lng: number }
    timestamp: Date
  }): Promise<void> {
    try {
      const { providerId, newLocation, timestamp } = locationData
      
      // Get the provider's last known location
      const provider = await prisma.provider.findUnique({
        where: { id: providerId },
        select: {
          currentLocation: true,
          lastLocationUpdate: true,
          name: true,
          status: true,
        },
      })

      if (!provider || !provider.currentLocation || !provider.lastLocationUpdate) {
        // First location update or no previous location
        return
      }

      const lastLocation = provider.currentLocation as { lat: number; lng: number }
      const lastUpdate = provider.lastLocationUpdate
      const timeDiffSeconds = (timestamp.getTime() - lastUpdate.getTime()) / 1000
      
      // Calculate distance between locations using Haversine formula
      const distance = this.calculateDistance(
        lastLocation.lat,
        lastLocation.lng,
        newLocation.lat,
        newLocation.lng
      )

      // Calculate speed in km/h
      const speedKmh = (distance / 1000) / (timeDiffSeconds / 3600)
      
      // Flag if speed exceeds 100 km/h (impossible for service providers)
      const MAX_REASONABLE_SPEED = 100 // km/h
      
      if (speedKmh > MAX_REASONABLE_SPEED && timeDiffSeconds > 60) { // Ignore very short intervals
        // Pause provider account immediately
        await prisma.provider.update({
          where: { id: providerId },
          data: { status: 'PAUSED' },
        })

        // Create security flag
        await prisma.securityFlag.create({
          data: {
            providerId,
            type: 'FAKE_LOCATION',
            details: {
              lastLocation,
              newLocation,
              distanceKm: distance / 1000,
              timeDiffSeconds,
              speedKmh,
              maxAllowedSpeed: MAX_REASONABLE_SPEED,
              lastUpdate: lastUpdate.toISOString(),
              currentUpdate: timestamp.toISOString(),
            },
            status: 'PENDING_REVIEW',
          },
        })

        await createSystemAlert({
          level: 'CRITICAL',
          title: 'Fake Location Detected',
          message: `Provider ${provider.name} (${providerId}) detected traveling at ${speedKmh.toFixed(1)} km/h - account paused`,
          details: {
            providerId,
            providerName: provider.name,
            speedKmh: speedKmh.toFixed(1),
            distanceKm: (distance / 1000).toFixed(2),
            timeDiffMinutes: (timeDiffSeconds / 60).toFixed(1),
          },
        })

        await logAutomatedAction({
          module: this.MODULE_NAME,
          trigger: 'Provider using fake location',
          actionTaken: `Paused provider account and created security flag for impossible travel speed`,
          details: {
            providerId,
            speedKmh,
            distanceKm: distance / 1000,
            timeDiffSeconds,
          },
          success: true,
        })
      }
    } catch (error) {
      logger.error('SecurityShieldAI: Error checking fake location:', error)
      await logAutomatedAction({
        module: this.MODULE_NAME,
        trigger: 'Fake location detection',
        actionTaken: 'Failed to check for fake location',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        success: false,
      })
    }
  }

  /**
   * Monitors for suspicious booking patterns
   * Called when analyzing booking data
   */
  static async detectSuspiciousBookingPatterns(): Promise<void> {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      
      // Check for users making excessive bookings in short time
      const heavyBookers = await prisma.user.findMany({
        where: {
          bookings: {
            some: {
              createdAt: { gte: oneDayAgo },
            },
          },
        },
        include: {
          bookings: {
            where: {
              createdAt: { gte: oneDayAgo },
            },
          },
        },
      })

      for (const user of heavyBookers) {
        const bookingCount = user.bookings.length
        
        // Flag users with more than 10 bookings in 24 hours
        if (bookingCount > 10) {
          const existingFlag = await prisma.securityFlag.findFirst({
            where: {
              userId: user.id,
              type: 'EXCESSIVE_BOOKINGS',
              createdAt: { gte: oneDayAgo },
            },
          })

          if (!existingFlag) {
            await prisma.securityFlag.create({
              data: {
                userId: user.id,
                type: 'EXCESSIVE_BOOKINGS',
                details: {
                  bookingCount,
                  timeFrame: '24_hours',
                  bookingIds: user.bookings.map(b => b.id),
                  userPhone: user.phone,
                },
                status: 'PENDING_REVIEW',
              },
            })

            await createSystemAlert({
              level: 'WARNING',
              title: 'Excessive Booking Activity',
              message: `User ${user.id} made ${bookingCount} bookings in 24 hours`,
              details: {
                userId: user.id,
                userPhone: user.phone,
                bookingCount,
                timeFrame: '24 hours',
              },
            })
          }
        }
      }

      // Check for providers accepting/rejecting bookings suspiciously fast
      const recentBookings = await prisma.booking.findMany({
        where: {
          createdAt: { gte: oneDayAgo },
          providerId: { not: null },
        },
        include: {
          provider: true,
        },
      })

      // Group by provider and check response times
      const providerResponseTimes = new Map<string, number[]>()
      
      for (const booking of recentBookings) {
        if (booking.providerId) {
          if (!providerResponseTimes.has(booking.providerId)) {
            providerResponseTimes.set(booking.providerId, [])
          }
          
          // Calculate response time (placeholder - would need actual acceptance timestamp)
          const responseTime = Math.random() * 300 // Simulated response time in seconds
          providerResponseTimes.get(booking.providerId)!.push(responseTime)
        }
      }

      for (const [providerId, responseTimes] of providerResponseTimes) {
        if (responseTimes.length >= 5) {
          const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
          
          // Flag providers with suspiciously fast consistent response times (< 5 seconds)
          if (avgResponseTime < 5) {
            const existingFlag = await prisma.securityFlag.findFirst({
              where: {
                providerId,
                type: 'AUTOMATED_RESPONSES',
                createdAt: { gte: oneDayAgo },
              },
            })

            if (!existingFlag) {
              await prisma.securityFlag.create({
                data: {
                  providerId,
                  type: 'AUTOMATED_RESPONSES',
                  details: {
                    avgResponseTime,
                    bookingCount: responseTimes.length,
                    allResponseTimes: responseTimes,
                  },
                  status: 'PENDING_REVIEW',
                },
              })

              await createSystemAlert({
                level: 'INFO',
                title: 'Suspiciously Fast Provider Responses',
                message: `Provider ${providerId} averaging ${avgResponseTime.toFixed(1)}s response time`,
                details: {
                  providerId,
                  avgResponseTime,
                  bookingCount: responseTimes.length,
                },
              })
            }
          }
        }
      }

      logger.info(`SecurityShieldAI: Analyzed ${recentBookings.length} bookings for suspicious patterns`)
    } catch (error) {
      logger.error('SecurityShieldAI: Error detecting suspicious patterns:', error)
      await logAutomatedAction({
        module: this.MODULE_NAME,
        trigger: 'Suspicious pattern detection',
        actionTaken: 'Failed to analyze suspicious booking patterns',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        success: false,
      })
    }
  }

  /**
   * Reviews and auto-resolves low-priority security flags
   * Called by daily cron job
   */
  static async autoReviewSecurityFlags(): Promise<void> {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      
      // Auto-dismiss old flags that haven't been investigated
      const oldFlags = await prisma.securityFlag.findMany({
        where: {
          status: 'PENDING_REVIEW',
          createdAt: { lt: sevenDaysAgo },
          type: { in: ['AUTOMATED_RESPONSES', 'EXCESSIVE_BOOKINGS'] }, // Only low-priority flags
        },
      })

      for (const flag of oldFlags) {
        await prisma.securityFlag.update({
          where: { id: flag.id },
          data: { status: 'DISMISSED' },
        })
      }

      if (oldFlags.length > 0) {
        await logAutomatedAction({
          module: this.MODULE_NAME,
          trigger: 'Security flag auto-review',
          actionTaken: `Auto-dismissed ${oldFlags.length} old low-priority security flags`,
          details: {
            dismissedCount: oldFlags.length,
            flagTypes: [...new Set(oldFlags.map(f => f.type))],
          },
          success: true,
        })
      }

      logger.info(`SecurityShieldAI: Auto-reviewed ${oldFlags.length} security flags`)
    } catch (error) {
      logger.error('SecurityShieldAI: Error auto-reviewing security flags:', error)
      await logAutomatedAction({
        module: this.MODULE_NAME,
        trigger: 'Security flag auto-review',
        actionTaken: 'Failed to auto-review security flags',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        success: false,
      })
    }
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  private static calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000 // Earth's radius in meters
    const dLat = this.toRadians(lat2 - lat1)
    const dLng = this.toRadians(lng2 - lng1)
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2)
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c // Distance in meters
  }

  /**
   * Convert degrees to radians
   */
  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180)
  }
}