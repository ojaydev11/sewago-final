import cron from 'node-cron'
import { logger } from '../log'
import { ServiceFlowAI } from './ServiceFlowAI'
import { SmartReferralsAI } from './SmartReferralsAI'
import { SecurityShieldAI } from './SecurityShieldAI'
import { ProviderScoutAI } from './ProviderScoutAI'
import { EmpireWatchdogAI } from './EmpireWatchdogAI'

export class AIScheduler {
  private static jobs: Map<string, cron.ScheduledTask> = new Map()

  /**
   * Initialize all scheduled AI tasks
   */
  static init(): void {
    logger.info('Initializing AI Scheduler...')

    // ServiceFlow AI - Check delayed bookings every 5 minutes
    this.scheduleJob(
      'delayed-bookings',
      '*/5 * * * *', // Every 5 minutes
      async () => {
        logger.info('Running delayed bookings check...')
        await ServiceFlowAI.handleDelayedBookings()
      }
    )

    // SmartReferrals AI - Analyze city activity daily at 2 AM
    this.scheduleJob(
      'city-activity-analysis',
      '0 2 * * *', // Daily at 2 AM
      async () => {
        logger.info('Running city activity analysis...')
        await SmartReferralsAI.analyzeCityActivity()
      }
    )

    // SmartReferrals AI - Re-engage inactive users daily at 10 AM
    this.scheduleJob(
      'inactive-user-reengagement',
      '0 10 * * *', // Daily at 10 AM
      async () => {
        logger.info('Running inactive user re-engagement...')
        await SmartReferralsAI.reengageInactiveUsers()
      }
    )

    // SecurityShield AI - Detect suspicious patterns daily at 3 AM
    this.scheduleJob(
      'suspicious-pattern-detection',
      '0 3 * * *', // Daily at 3 AM
      async () => {
        logger.info('Running suspicious pattern detection...')
        await SecurityShieldAI.detectSuspiciousBookingPatterns()
      }
    )

    // SecurityShield AI - Auto-review security flags daily at 4 AM
    this.scheduleJob(
      'security-flag-review',
      '0 4 * * *', // Daily at 4 AM
      async () => {
        logger.info('Running security flag auto-review...')
        await SecurityShieldAI.autoReviewSecurityFlags()
      }
    )

    // ProviderScout AI - Analyze region capacity daily at 1 AM
    this.scheduleJob(
      'region-capacity-analysis',
      '0 1 * * *', // Daily at 1 AM
      async () => {
        logger.info('Running region capacity analysis...')
        await ProviderScoutAI.analyzeRegionCapacity()
      }
    )

    // ProviderScout AI - Identify service opportunities weekly on Sundays at 6 AM
    this.scheduleJob(
      'service-opportunity-analysis',
      '0 6 * * 0', // Weekly on Sunday at 6 AM
      async () => {
        logger.info('Running service opportunity analysis...')
        await ProviderScoutAI.identifyServiceOpportunities()
      }
    )

    // ProviderScout AI - Analyze provider onboarding trends weekly on Mondays at 8 AM
    this.scheduleJob(
      'provider-onboarding-analysis',
      '0 8 * * 1', // Weekly on Monday at 8 AM
      async () => {
        logger.info('Running provider onboarding analysis...')
        await ProviderScoutAI.analyzeProviderOnboardingTrends()
      }
    )

    // ProviderScout AI - Identify underperforming providers weekly on Tuesdays at 9 AM
    this.scheduleJob(
      'underperforming-provider-analysis',
      '0 9 * * 2', // Weekly on Tuesday at 9 AM
      async () => {
        logger.info('Running underperforming provider analysis...')
        await ProviderScoutAI.identifyUnderperformingProviders()
      }
    )

    // EmpireWatchdog AI - Generate weekly report every Friday at 9 PM
    this.scheduleJob(
      'weekly-report-generation',
      '0 21 * * 5', // Weekly on Friday at 9 PM
      async () => {
        logger.info('Generating weekly empire report...')
        await EmpireWatchdogAI.generateWeeklyReport()
      }
    )

    // EmpireWatchdog AI - Monitor system health daily at 5 AM
    this.scheduleJob(
      'system-health-monitoring',
      '0 5 * * *', // Daily at 5 AM
      async () => {
        logger.info('Running system health monitoring...')
        await EmpireWatchdogAI.monitorSystemHealth()
      }
    )

    logger.info(`AI Scheduler initialized with ${this.jobs.size} scheduled jobs`)
  }

  /**
   * Schedule a new cron job
   */
  private static scheduleJob(
    name: string,
    cronExpression: string,
    task: () => Promise<void>
  ): void {
    try {
      const job = cron.schedule(
        cronExpression,
        async () => {
          const startTime = Date.now()
          try {
            await task()
            const duration = Date.now() - startTime
            logger.info(`AI job '${name}' completed successfully in ${duration}ms`)
          } catch (error) {
            logger.error(`AI job '${name}' failed:`, error)
          }
        },
        {
          scheduled: true,
          timezone: 'Asia/Kathmandu', // Set to Nepal timezone
        }
      )

      this.jobs.set(name, job)
      logger.info(`Scheduled AI job '${name}' with cron expression: ${cronExpression}`)
    } catch (error) {
      logger.error(`Failed to schedule AI job '${name}':`, error)
    }
  }

  /**
   * Stop a specific job
   */
  static stopJob(name: string): void {
    const job = this.jobs.get(name)
    if (job) {
      job.stop()
      this.jobs.delete(name)
      logger.info(`Stopped AI job '${name}'`)
    }
  }

  /**
   * Stop all scheduled jobs
   */
  static stopAll(): void {
    logger.info('Stopping all AI scheduled jobs...')
    this.jobs.forEach((job, name) => {
      job.stop()
      logger.info(`Stopped AI job '${name}'`)
    })
    this.jobs.clear()
  }

  /**
   * Get status of all jobs
   */
  static getJobStatus(): Array<{ name: string; running: boolean; nextRun?: Date }> {
    return Array.from(this.jobs.entries()).map(([name, job]) => ({
      name,
      running: job.getStatus() === 'scheduled',
      // Note: node-cron doesn't provide nextRun info easily
    }))
  }

  /**
   * Manual trigger for specific job (useful for testing)
   */
  static async triggerJob(name: string): Promise<void> {
    logger.info(`Manually triggering AI job '${name}'...`)
    
    const jobMap: Record<string, () => Promise<void>> = {
      'delayed-bookings': ServiceFlowAI.handleDelayedBookings,
      'city-activity-analysis': SmartReferralsAI.analyzeCityActivity,
      'inactive-user-reengagement': SmartReferralsAI.reengageInactiveUsers,
      'suspicious-pattern-detection': SecurityShieldAI.detectSuspiciousBookingPatterns,
      'security-flag-review': SecurityShieldAI.autoReviewSecurityFlags,
      'region-capacity-analysis': ProviderScoutAI.analyzeRegionCapacity,
      'service-opportunity-analysis': ProviderScoutAI.identifyServiceOpportunities,
      'provider-onboarding-analysis': ProviderScoutAI.analyzeProviderOnboardingTrends,
      'underperforming-provider-analysis': ProviderScoutAI.identifyUnderperformingProviders,
      'weekly-report-generation': EmpireWatchdogAI.generateWeeklyReport,
      'system-health-monitoring': EmpireWatchdogAI.monitorSystemHealth,
    }

    const task = jobMap[name]
    if (task) {
      const startTime = Date.now()
      try {
        await task()
        const duration = Date.now() - startTime
        logger.info(`Manual trigger of '${name}' completed successfully in ${duration}ms`)
      } catch (error) {
        logger.error(`Manual trigger of '${name}' failed:`, error)
        throw error
      }
    } else {
      throw new Error(`Unknown job name: ${name}`)
    }
  }
}