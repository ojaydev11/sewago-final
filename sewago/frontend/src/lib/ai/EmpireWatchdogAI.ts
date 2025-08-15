import { prisma } from '../prisma'
import { logger } from '../log'
import { createSystemAlert, logAutomatedAction, getWeekEndingDate } from './utils/ai-helpers'

export class EmpireWatchdogAI {
  private static readonly MODULE_NAME = 'EmpireWatchdog'
  
  /**
   * Generates comprehensive weekly reports
   * Called by weekly cron job (every Friday at 9 PM)
   */
  static async generateWeeklyReport(): Promise<void> {
    try {
      const weekEnding = getWeekEndingDate()
      const weekStart = new Date(weekEnding.getTime() - 7 * 24 * 60 * 60 * 1000)
      
      // Check if report already exists for this week
      const existingReport = await prisma.weeklyReport.findUnique({
        where: { weekEnding },
      })

      if (existingReport) {
        logger.info('Weekly report already exists for this week')
        return
      }

      // Gather all metrics for the week
      const metrics = await this.gatherWeeklyMetrics(weekStart, weekEnding)
      
      // Create the weekly report
      await prisma.weeklyReport.create({
        data: {
          weekEnding,
          summaryData: metrics,
        },
      })

      // Create system alert with key highlights
      await createSystemAlert({
        level: 'INFO',
        title: 'Weekly Empire Report Generated',
        message: `Week ending ${weekEnding.toDateString()}: ${metrics.bookings.total} bookings, ${metrics.revenue.total} revenue, ${metrics.users.newSignups} new users`,
        details: {
          weekEnding: weekEnding.toISOString(),
          keyMetrics: {
            totalBookings: metrics.bookings.total,
            totalRevenue: metrics.revenue.total,
            newUsers: metrics.users.newSignups,
            newProviders: metrics.providers.newSignups,
            alertsGenerated: metrics.system.alertsGenerated,
          },
          trends: metrics.trends,
          alerts: metrics.alerts,
        },
      })

      await logAutomatedAction({
        module: this.MODULE_NAME,
        trigger: 'Weekly Summary Generation',
        actionTaken: `Generated comprehensive weekly report with ${Object.keys(metrics).length} metric categories`,
        details: {
          weekEnding: weekEnding.toISOString(),
          metricsCount: Object.keys(metrics).length,
          keyHighlights: {
            bookings: metrics.bookings.total,
            revenue: metrics.revenue.total,
            users: metrics.users.newSignups,
            providers: metrics.providers.newSignups,
          },
        },
        success: true,
      })

      logger.info(`EmpireWatchdogAI: Generated weekly report for week ending ${weekEnding.toDateString()}`)
    } catch (error) {
      logger.error('EmpireWatchdogAI: Error generating weekly report:', error)
      await logAutomatedAction({
        module: this.MODULE_NAME,
        trigger: 'Weekly report generation',
        actionTaken: 'Failed to generate weekly report',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        success: false,
      })
    }
  }

  /**
   * Gathers comprehensive metrics for the weekly report
   */
  private static async gatherWeeklyMetrics(weekStart: Date, weekEnd: Date) {
    const previousWeekStart = new Date(weekStart.getTime() - 7 * 24 * 60 * 60 * 1000)
    const previousWeekEnd = new Date(weekEnd.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Bookings metrics
    const [currentBookings, previousBookings] = await Promise.all([
      prisma.booking.findMany({
        where: { createdAt: { gte: weekStart, lt: weekEnd } },
        include: { service: true },
      }),
      prisma.booking.findMany({
        where: { createdAt: { gte: previousWeekStart, lt: previousWeekEnd } },
        include: { service: true },
      }),
    ])

    // User metrics
    const [currentUsers, previousUsers] = await Promise.all([
      prisma.user.findMany({
        where: { createdAt: { gte: weekStart, lt: weekEnd } },
      }),
      prisma.user.findMany({
        where: { createdAt: { gte: previousWeekStart, lt: previousWeekEnd } },
      }),
    ])

    // Provider metrics
    const [currentProviders, previousProviders] = await Promise.all([
      prisma.provider.findMany({
        where: { createdAt: { gte: weekStart, lt: weekEnd } },
      }),
      prisma.provider.findMany({
        where: { createdAt: { gte: previousWeekStart, lt: previousWeekEnd } },
      }),
    ])

    // System metrics
    const [systemAlerts, automatedActions, securityFlags] = await Promise.all([
      prisma.systemAlert.findMany({
        where: { createdAt: { gte: weekStart, lt: weekEnd } },
      }),
      prisma.automatedActionLog.findMany({
        where: { createdAt: { gte: weekStart, lt: weekEnd } },
      }),
      prisma.securityFlag.findMany({
        where: { createdAt: { gte: weekStart, lt: weekEnd } },
      }),
    ])

    // Reviews and ratings
    const reviews = await prisma.review.findMany({
      where: { createdAt: { gte: weekStart, lt: weekEnd } },
    })

    // Calculate revenue (assuming booking total includes platform fee)
    const currentRevenue = currentBookings.reduce((sum, booking) => sum + booking.total, 0)
    const previousRevenue = previousBookings.reduce((sum, booking) => sum + booking.total, 0)

    // Calculate trends
    const bookingTrend = this.calculateGrowthPercentage(currentBookings.length, previousBookings.length)
    const userTrend = this.calculateGrowthPercentage(currentUsers.length, previousUsers.length)
    const revenueTrend = this.calculateGrowthPercentage(currentRevenue, previousRevenue)

    // City-wise breakdown
    const bookingsByCity = this.groupByField(currentBookings, booking => booking.service.city)
    const usersByReferral = currentUsers.filter(user => user.referralCode).length

    // Service category performance
    const bookingsByCategory = this.groupByField(currentBookings, booking => booking.service.category)

    // Provider performance
    const completedBookings = currentBookings.filter(b => b.status === 'COMPLETED')
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0

    return {
      period: {
        weekStart: weekStart.toISOString(),
        weekEnd: weekEnd.toISOString(),
        weekNumber: this.getWeekNumber(weekEnd),
        year: weekEnd.getFullYear(),
      },
      bookings: {
        total: currentBookings.length,
        completed: completedBookings.length,
        completionRate: currentBookings.length > 0 ? (completedBookings.length / currentBookings.length) * 100 : 0,
        byCity: bookingsByCity,
        byCategory: bookingsByCategory,
        trend: bookingTrend,
      },
      revenue: {
        total: currentRevenue,
        averageBookingValue: currentBookings.length > 0 ? currentRevenue / currentBookings.length : 0,
        trend: revenueTrend,
        projectedMonthly: currentRevenue * 4.33, // Weekly * 4.33 weeks per month
      },
      users: {
        newSignups: currentUsers.length,
        totalActive: await this.getActiveUserCount(weekStart, weekEnd),
        referralSignups: usersByReferral,
        trend: userTrend,
      },
      providers: {
        newSignups: currentProviders.length,
        totalActive: await this.getActiveProviderCount(weekStart, weekEnd),
        verified: currentProviders.filter(p => p.verified).length,
        verificationRate: currentProviders.length > 0 
          ? (currentProviders.filter(p => p.verified).length / currentProviders.length) * 100 
          : 0,
      },
      quality: {
        averageRating: Number(averageRating.toFixed(2)),
        totalReviews: reviews.length,
        ratingDistribution: this.getRatingDistribution(reviews),
      },
      system: {
        alertsGenerated: systemAlerts.length,
        automatedActions: automatedActions.length,
        securityFlags: securityFlags.length,
        successfulActions: automatedActions.filter(a => a.success).length,
        alertsByLevel: this.groupByField(systemAlerts, alert => alert.level),
      },
      trends: {
        bookings: bookingTrend,
        users: userTrend,
        revenue: revenueTrend,
        overallHealth: this.calculateOverallHealthScore({
          bookingTrend,
          userTrend,
          revenueTrend,
          averageRating,
          securityFlagsCount: securityFlags.length,
        }),
      },
      alerts: {
        critical: systemAlerts.filter(a => a.level === 'CRITICAL').length,
        warnings: systemAlerts.filter(a => a.level === 'WARNING').length,
        info: systemAlerts.filter(a => a.level === 'INFO').length,
        unresolved: systemAlerts.filter(a => a.status === 'UNREAD').length,
      },
      insights: this.generateWeeklyInsights({
        currentBookings,
        currentUsers,
        currentProviders,
        systemAlerts,
        reviews,
        bookingTrend,
        userTrend,
        revenueTrend,
      }),
    }
  }

  /**
   * Monitor system health and generate alerts for anomalies
   * Called by daily cron job
   */
  static async monitorSystemHealth(): Promise<void> {
    try {
      const today = new Date()
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
      
      // Check for system anomalies
      const healthChecks = await Promise.all([
        this.checkBookingAnomalies(yesterday, today),
        this.checkUserActivityAnomalies(yesterday, today),
        this.checkProviderAvailability(),
        this.checkSystemPerformance(yesterday, today),
      ])

      const issues = healthChecks.filter(check => !check.healthy)
      
      if (issues.length > 0) {
        await createSystemAlert({
          level: 'WARNING',
          title: 'System Health Issues Detected',
          message: `${issues.length} health issues detected in daily system check`,
          details: {
            issues: issues.map(issue => ({
              component: issue.component,
              issue: issue.issue,
              details: issue.details,
            })),
            checkTime: today.toISOString(),
          },
        })
      }

      await logAutomatedAction({
        module: this.MODULE_NAME,
        trigger: 'Daily system health check',
        actionTaken: `Completed health check, found ${issues.length} issues`,
        details: {
          healthyComponents: healthChecks.filter(c => c.healthy).length,
          issueComponents: issues.length,
          components: healthChecks.map(c => c.component),
        },
        success: true,
      })

      logger.info(`EmpireWatchdogAI: Health check completed, ${issues.length} issues found`)
    } catch (error) {
      logger.error('EmpireWatchdogAI: Error monitoring system health:', error)
      await logAutomatedAction({
        module: this.MODULE_NAME,
        trigger: 'System health monitoring',
        actionTaken: 'Failed to complete system health check',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        success: false,
      })
    }
  }

  /**
   * Helper methods for metrics calculation
   */
  private static calculateGrowthPercentage(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0
    return Number(((current - previous) / previous * 100).toFixed(2))
  }

  private static groupByField<T>(items: T[], fieldExtractor: (item: T) => string): Record<string, number> {
    return items.reduce((acc, item) => {
      const key = fieldExtractor(item)
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }

  private static getWeekNumber(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 1)
    const diff = date.getTime() - start.getTime()
    return Math.ceil(diff / (7 * 24 * 60 * 60 * 1000))
  }

  private static async getActiveUserCount(weekStart: Date, weekEnd: Date): Promise<number> {
    return await prisma.user.count({
      where: {
        OR: [
          { lastSeen: { gte: weekStart, lt: weekEnd } },
          { bookings: { some: { createdAt: { gte: weekStart, lt: weekEnd } } } },
        ],
      },
    })
  }

  private static async getActiveProviderCount(weekStart: Date, weekEnd: Date): Promise<number> {
    return await prisma.provider.count({
      where: {
        status: 'ACTIVE',
        OR: [
          { lastLocationUpdate: { gte: weekStart, lt: weekEnd } },
          { bookings: { some: { createdAt: { gte: weekStart, lt: weekEnd } } } },
        ],
      },
    })
  }

  private static getRatingDistribution(reviews: any[]): Record<string, number> {
    const distribution = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }
    reviews.forEach(review => {
      distribution[review.rating.toString()]++
    })
    return distribution
  }

  private static calculateOverallHealthScore(metrics: {
    bookingTrend: number
    userTrend: number
    revenueTrend: number
    averageRating: number
    securityFlagsCount: number
  }): number {
    let score = 70 // Base score
    
    // Growth trends (max +15 points each)
    score += Math.min(metrics.bookingTrend / 10, 15)
    score += Math.min(metrics.userTrend / 10, 15)
    score += Math.min(metrics.revenueTrend / 10, 15)
    
    // Quality (max +10 points)
    score += (metrics.averageRating - 3) * 5 // 5 points per star above 3
    
    // Security (-2 points per flag)
    score -= metrics.securityFlagsCount * 2
    
    return Math.max(0, Math.min(100, Math.round(score)))
  }

  private static generateWeeklyInsights(data: any): string[] {
    const insights = []
    
    if (data.bookingTrend > 20) {
      insights.push(`Exceptional booking growth of ${data.bookingTrend}% - consider scaling provider capacity`)
    } else if (data.bookingTrend < -10) {
      insights.push(`Declining bookings (${data.bookingTrend}%) - investigate market factors or launch promotion`)
    }
    
    if (data.currentUsers.length > 0 && data.userTrend > 30) {
      insights.push(`Strong user acquisition momentum with ${data.userTrend}% growth`)
    }
    
    if (data.systemAlerts.filter((a: any) => a.level === 'CRITICAL').length > 0) {
      insights.push('Critical system alerts require immediate attention')
    }
    
    if (data.reviews.length > 0) {
      const avgRating = data.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / data.reviews.length
      if (avgRating < 3.5) {
        insights.push('Service quality concerns - average rating below 3.5 stars')
      } else if (avgRating > 4.5) {
        insights.push('Excellent service quality maintained - leveraging for marketing')
      }
    }
    
    return insights
  }

  private static async checkBookingAnomalies(yesterday: Date, today: Date) {
    const bookings = await prisma.booking.findMany({
      where: { createdAt: { gte: yesterday, lt: today } },
    })
    
    // Simple anomaly check - could be enhanced with historical averages
    const isHealthy = bookings.length > 0 && bookings.length < 1000 // Basic bounds check
    
    return {
      component: 'bookings',
      healthy: isHealthy,
      issue: !isHealthy ? 'Booking volume anomaly detected' : null,
      details: { count: bookings.length },
    }
  }

  private static async checkUserActivityAnomalies(yesterday: Date, today: Date) {
    const newUsers = await prisma.user.count({
      where: { createdAt: { gte: yesterday, lt: today } },
    })
    
    return {
      component: 'user_activity',
      healthy: true, // Placeholder
      issue: null,
      details: { newUsers },
    }
  }

  private static async checkProviderAvailability() {
    const activeProviders = await prisma.provider.count({
      where: { status: 'ACTIVE', isOnline: true },
    })
    
    return {
      component: 'provider_availability',
      healthy: activeProviders > 0,
      issue: activeProviders === 0 ? 'No active providers online' : null,
      details: { activeProviders },
    }
  }

  private static async checkSystemPerformance(yesterday: Date, today: Date) {
    const failedActions = await prisma.automatedActionLog.count({
      where: {
        createdAt: { gte: yesterday, lt: today },
        success: false,
      },
    })
    
    return {
      component: 'system_performance',
      healthy: failedActions < 10, // Threshold for concern
      issue: failedActions >= 10 ? `High failure rate: ${failedActions} failed actions` : null,
      details: { failedActions },
    }
  }
}