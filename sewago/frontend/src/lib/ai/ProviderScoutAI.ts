import { prisma } from '../prisma'
import { logger } from '../log'
import { createSystemAlert, logAutomatedAction } from './utils/ai-helpers'

export class ProviderScoutAI {
  private static readonly MODULE_NAME = 'ProviderScout'
  
  /**
   * Analyzes demand vs supply in regions and alerts for capacity strain
   * Called by daily cron job
   */
  static async analyzeRegionCapacity(): Promise<void> {
    try {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      
      // Get all active services grouped by city and category
      const services = await prisma.service.findMany({
        where: { isActive: true },
        select: { id: true, city: true, category: true },
      })

      const cityCategories = new Set<string>()
      services.forEach(service => {
        cityCategories.add(`${service.city}:${service.category}`)
      })

      for (const cityCategory of cityCategories) {
        const [city, category] = cityCategory.split(':')
        
        // Get booking requests for this city/category in last 3 days
        const recentBookings = await prisma.booking.findMany({
          where: {
            createdAt: { gte: threeDaysAgo },
            service: {
              city,
              category,
            },
          },
          include: {
            service: true,
          },
        })

        // Count available providers for this city/category
        const availableProviders = await prisma.provider.findMany({
          where: {
            status: 'ACTIVE',
            skills: { has: category },
            zones: { has: city },
          },
        })

        // Analyze capacity strain
        const bookingsPerDay = recentBookings.length / 3
        const providersCount = availableProviders.length
        
        // Calculate provider utilization (assuming each provider can handle 3 bookings per day)
        const maxDailyCapacity = providersCount * 3
        const utilizationRate = maxDailyCapacity > 0 ? (bookingsPerDay / maxDailyCapacity) * 100 : 0

        // Check if strain has been consistent for 3 days
        if (utilizationRate > 80) { // 80%+ utilization indicates strain
          const existingAlert = await prisma.systemAlert.findFirst({
            where: {
              title: 'Provider Capacity Strain',
              details: {
                path: ['city'],
                equals: city,
              },
              createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Within last 24 hours
            },
          })

          if (!existingAlert) {
            await createSystemAlert({
              level: 'WARNING',
              title: 'Provider Capacity Strain',
              message: `${city} ${category} services at ${utilizationRate.toFixed(1)}% capacity utilization`,
              details: {
                city,
                category,
                utilizationRate,
                bookingsPerDay,
                availableProviders: providersCount,
                maxDailyCapacity,
                recommendedAction: 'Launch recruitment campaign',
                analysis: {
                  totalBookings: recentBookings.length,
                  analysisWindow: '3 days',
                  thresholdExceeded: '80%',
                },
              },
            })

            await logAutomatedAction({
              module: this.MODULE_NAME,
              trigger: 'Surge of demand in any region',
              actionTaken: `Created capacity strain alert for ${city} ${category}`,
              details: {
                city,
                category,
                utilizationRate,
                bookingsPerDay,
                providersCount,
              },
              success: true,
            })
          }
        }

        // Check for undersupplied areas with zero providers
        if (providersCount === 0 && recentBookings.length > 0) {
          await createSystemAlert({
            level: 'CRITICAL',
            title: 'Zero Provider Coverage',
            message: `No providers available for ${category} in ${city} despite ${recentBookings.length} recent booking requests`,
            details: {
              city,
              category,
              recentBookingRequests: recentBookings.length,
              urgentAction: 'Immediate provider recruitment required',
            },
          })
        }
      }

      logger.info(`ProviderScoutAI: Analyzed capacity for ${cityCategories.size} city-category combinations`)
    } catch (error) {
      logger.error('ProviderScoutAI: Error analyzing region capacity:', error)
      await logAutomatedAction({
        module: this.MODULE_NAME,
        trigger: 'Region capacity analysis',
        actionTaken: 'Failed to analyze region capacity',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        success: false,
      })
    }
  }

  /**
   * Tracks search requests for unavailable services
   * Called when a search yields no results
   */
  static async logUnavailableServiceRequest(searchData: {
    searchTerm: string
    city: string
    userId?: string
  }): Promise<void> {
    try {
      const { searchTerm, city, userId } = searchData
      
      // Update or create service request log
      const existingLog = await prisma.serviceRequestLog.findUnique({
        where: {
          searchTerm_city: {
            searchTerm: searchTerm.toLowerCase().trim(),
            city,
          },
        },
      })

      if (existingLog) {
        await prisma.serviceRequestLog.update({
          where: { id: existingLog.id },
          data: {
            count: { increment: 1 },
            lastSearchedAt: new Date(),
          },
        })
      } else {
        await prisma.serviceRequestLog.create({
          data: {
            searchTerm: searchTerm.toLowerCase().trim(),
            city,
            count: 1,
            lastSearchedAt: new Date(),
          },
        })
      }

      await logAutomatedAction({
        module: this.MODULE_NAME,
        trigger: 'User search with no results',
        actionTaken: `Logged unavailable service request: ${searchTerm} in ${city}`,
        details: {
          searchTerm,
          city,
          userId,
        },
        success: true,
      })
    } catch (error) {
      logger.error('ProviderScoutAI: Error logging unavailable service request:', error)
      await logAutomatedAction({
        module: this.MODULE_NAME,
        trigger: 'Service request logging',
        actionTaken: 'Failed to log unavailable service request',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        success: false,
      })
    }
  }

  /**
   * Analyzes service request logs to identify market opportunities
   * Called by weekly cron job
   */
  static async identifyServiceOpportunities(): Promise<void> {
    try {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      
      // Get top requested unavailable services by city
      const serviceRequests = await prisma.serviceRequestLog.findMany({
        where: {
          lastSearchedAt: { gte: oneWeekAgo },
          count: { gte: 3 }, // At least 3 requests
        },
        orderBy: [
          { count: 'desc' },
          { lastSearchedAt: 'desc' },
        ],
      })

      // Group by city and get top 3 for each city
      const opportunitiesByCity = new Map<string, typeof serviceRequests>()
      
      for (const request of serviceRequests) {
        if (!opportunitiesByCity.has(request.city)) {
          opportunitiesByCity.set(request.city, [])
        }
        
        const cityRequests = opportunitiesByCity.get(request.city)!
        if (cityRequests.length < 3) {
          cityRequests.push(request)
        }
      }

      // Create system alert with opportunities
      for (const [city, requests] of opportunitiesByCity) {
        if (requests.length > 0) {
          const topOpportunities = requests.map(r => ({
            service: r.searchTerm,
            requestCount: r.count,
            lastRequested: r.lastSearchedAt,
          }))

          await createSystemAlert({
            level: 'INFO',
            title: 'New Service Opportunities Identified',
            message: `${requests.length} high-demand services identified in ${city}`,
            details: {
              city,
              opportunities: topOpportunities,
              analysisWindow: '7 days',
              totalRequests: requests.reduce((sum, r) => sum + r.count, 0),
              recommendation: 'Consider adding these services or recruiting providers',
            },
          })

          await logAutomatedAction({
            module: this.MODULE_NAME,
            trigger: 'Weekly service opportunity analysis',
            actionTaken: `Identified ${requests.length} service opportunities in ${city}`,
            details: {
              city,
              opportunities: topOpportunities,
              totalRequests: requests.reduce((sum, r) => sum + r.count, 0),
            },
            success: true,
          })
        }
      }

      logger.info(`ProviderScoutAI: Identified opportunities in ${opportunitiesByCity.size} cities`)
    } catch (error) {
      logger.error('ProviderScoutAI: Error identifying service opportunities:', error)
      await logAutomatedAction({
        module: this.MODULE_NAME,
        trigger: 'Service opportunity identification',
        actionTaken: 'Failed to identify service opportunities',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        success: false,
      })
    }
  }

  /**
   * Monitors provider onboarding trends and success rates
   * Called by weekly cron job
   */
  static async analyzeProviderOnboardingTrends(): Promise<void> {
    try {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      
      // Recent provider signups
      const recentProviders = await prisma.provider.findMany({
        where: {
          createdAt: { gte: oneWeekAgo },
        },
      })

      // Providers from last month for comparison
      const monthlyProviders = await prisma.provider.findMany({
        where: {
          createdAt: { gte: oneMonthAgo },
        },
      })

      // Analyze verification rates
      const recentVerified = recentProviders.filter(p => p.verified).length
      const monthlyVerified = monthlyProviders.filter(p => p.verified).length
      
      const weeklyVerificationRate = recentProviders.length > 0 
        ? (recentVerified / recentProviders.length) * 100 
        : 0
      
      const monthlyVerificationRate = monthlyProviders.length > 0 
        ? (monthlyVerified / monthlyProviders.length) * 100 
        : 0

      // Analyze provider activity (those who have completed at least one booking)
      const activeRecentProviders = await prisma.provider.findMany({
        where: {
          createdAt: { gte: oneWeekAgo },
          bookings: {
            some: {
              status: 'COMPLETED',
            },
          },
        },
      })

      const activationRate = recentProviders.length > 0 
        ? (activeRecentProviders.length / recentProviders.length) * 100 
        : 0

      // Group new providers by city to identify recruitment hotspots
      const providersByCity = new Map<string, number>()
      
      for (const provider of recentProviders) {
        for (const zone of provider.zones) {
          providersByCity.set(zone, (providersByCity.get(zone) || 0) + 1)
        }
      }

      const topCities = Array.from(providersByCity.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)

      await createSystemAlert({
        level: 'INFO',
        title: 'Weekly Provider Onboarding Report',
        message: `${recentProviders.length} new providers onboarded with ${weeklyVerificationRate.toFixed(1)}% verification rate`,
        details: {
          weeklySignups: recentProviders.length,
          monthlySignups: monthlyProviders.length,
          weeklyVerificationRate: weeklyVerificationRate.toFixed(1),
          monthlyVerificationRate: monthlyVerificationRate.toFixed(1),
          activationRate: activationRate.toFixed(1),
          topRecruitmentCities: topCities,
          insights: {
            verificationTrend: weeklyVerificationRate > monthlyVerificationRate ? 'improving' : 'declining',
            recruitmentRecommendation: recentProviders.length < 5 ? 'increase_recruitment_efforts' : 'maintain_current_pace',
          },
        },
      })

      await logAutomatedAction({
        module: this.MODULE_NAME,
        trigger: 'Weekly provider trend analysis',
        actionTaken: `Analyzed onboarding trends for ${recentProviders.length} new providers`,
        details: {
          weeklySignups: recentProviders.length,
          verificationRate: weeklyVerificationRate,
          activationRate,
          topCities: topCities.slice(0, 3),
        },
        success: true,
      })

      logger.info(`ProviderScoutAI: Analyzed ${recentProviders.length} new provider onboardings`)
    } catch (error) {
      logger.error('ProviderScoutAI: Error analyzing provider onboarding trends:', error)
      await logAutomatedAction({
        module: this.MODULE_NAME,
        trigger: 'Provider onboarding analysis',
        actionTaken: 'Failed to analyze provider onboarding trends',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        success: false,
      })
    }
  }

  /**
   * Identifies underperforming providers and suggests interventions
   * Called by weekly cron job
   */
  static async identifyUnderperformingProviders(): Promise<void> {
    try {
      const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      
      // Find providers with low performance metrics
      const providers = await prisma.provider.findMany({
        where: {
          status: 'ACTIVE',
          verified: true,
          createdAt: { lt: oneMonthAgo }, // At least a month old
        },
        include: {
          bookings: {
            where: {
              createdAt: { gte: oneMonthAgo },
            },
          },
        },
      })

      const underperformers = []

      for (const provider of providers) {
        const monthlyBookings = provider.bookings.length
        const completedBookings = provider.bookings.filter(b => b.status === 'COMPLETED').length
        const completionRate = monthlyBookings > 0 ? (completedBookings / monthlyBookings) * 100 : 0

        // Identify underperformance criteria
        const issues = []
        
        if (provider.onTimePct < 70) {
          issues.push('low_punctuality')
        }
        
        if (completionRate < 80) {
          issues.push('low_completion_rate')
        }
        
        if (monthlyBookings === 0) {
          issues.push('no_activity')
        }
        
        if (monthlyBookings < 3 && monthlyBookings > 0) {
          issues.push('low_activity')
        }

        if (issues.length > 0) {
          underperformers.push({
            provider,
            issues,
            monthlyBookings,
            completionRate,
          })
        }
      }

      if (underperformers.length > 0) {
        // Group by issue type for better reporting
        const issueGroups = {
          no_activity: underperformers.filter(u => u.issues.includes('no_activity')),
          low_activity: underperformers.filter(u => u.issues.includes('low_activity')),
          low_punctuality: underperformers.filter(u => u.issues.includes('low_punctuality')),
          low_completion: underperformers.filter(u => u.issues.includes('low_completion_rate')),
        }

        await createSystemAlert({
          level: 'WARNING',
          title: 'Underperforming Providers Identified',
          message: `${underperformers.length} providers need attention for performance issues`,
          details: {
            totalUnderperformers: underperformers.length,
            issueBreakdown: {
              noActivity: issueGroups.no_activity.length,
              lowActivity: issueGroups.low_activity.length,
              lowPunctuality: issueGroups.low_punctuality.length,
              lowCompletion: issueGroups.low_completion.length,
            },
            recommendations: {
              noActivity: 'Consider deactivation or re-engagement campaign',
              lowActivity: 'Provide additional training or incentives',
              lowPunctuality: 'Schedule management training',
              lowCompletion: 'Investigate reasons and provide support',
            },
            providerDetails: underperformers.map(u => ({
              providerId: u.provider.id,
              name: u.provider.name,
              issues: u.issues,
              monthlyBookings: u.monthlyBookings,
              onTimePct: u.provider.onTimePct,
              completionPct: u.provider.completionPct,
            })),
          },
        })

        await logAutomatedAction({
          module: this.MODULE_NAME,
          trigger: 'Provider performance review',
          actionTaken: `Identified ${underperformers.length} underperforming providers`,
          details: {
            underperformerCount: underperformers.length,
            issueTypes: Object.keys(issueGroups).filter(key => issueGroups[key as keyof typeof issueGroups].length > 0),
          },
          success: true,
        })
      }

      logger.info(`ProviderScoutAI: Analyzed ${providers.length} providers, found ${underperformers.length} underperformers`)
    } catch (error) {
      logger.error('ProviderScoutAI: Error identifying underperforming providers:', error)
      await logAutomatedAction({
        module: this.MODULE_NAME,
        trigger: 'Provider performance analysis',
        actionTaken: 'Failed to identify underperforming providers',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        success: false,
      })
    }
  }
}