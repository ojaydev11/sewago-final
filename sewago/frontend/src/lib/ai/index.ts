import { prisma } from '../prisma'
import { logger } from '../log'
import { AIScheduler } from './scheduler'
import { initializeAIMiddleware, ManualTriggers } from './middleware'

/**
 * SewaGo Empire Autopilot System
 * Main initialization and control interface for all AI modules
 */
export class EmpireAutopilot {
  private static initialized = false

  /**
   * Initialize the complete AI system
   */
  static async initialize(): Promise<void> {
    if (this.initialized) {
      logger.warn('EmpireAutopilot already initialized')
      return
    }

    try {
      logger.info('🚀 Initializing SewaGo Empire Autopilot System...')

      // Initialize Prisma middleware for event-driven triggers
      initializeAIMiddleware(prisma)

      // Initialize the AI scheduler for cron jobs
      AIScheduler.init()

      this.initialized = true
      
      logger.info('✅ SewaGo Empire Autopilot System fully operational!')
      logger.info('AI Modules Active:')
      logger.info('  🔄 ServiceFlow_AI - Booking management automation')
      logger.info('  📢 SmartReferrals_AI - Marketing automation')
      logger.info('  🛡️  SecurityShield_AI - Fraud detection')
      logger.info('  🔍 ProviderScout_AI - Capacity management')
      logger.info('  📊 EmpireWatchdog_AI - System reporting')
      
    } catch (error) {
      logger.error('Failed to initialize EmpireAutopilot:', error)
      throw error
    }
  }

  /**
   * Gracefully shutdown the AI system
   */
  static async shutdown(): Promise<void> {
    if (!this.initialized) {
      return
    }

    logger.info('🛑 Shutting down SewaGo Empire Autopilot System...')
    
    try {
      // Stop all scheduled jobs
      AIScheduler.stopAll()
      
      this.initialized = false
      logger.info('✅ Empire Autopilot System shutdown complete')
    } catch (error) {
      logger.error('Error during shutdown:', error)
    }
  }

  /**
   * Get system status
   */
  static getStatus(): {
    initialized: boolean
    scheduledJobs: Array<{ name: string; running: boolean }>
    uptime: string
  } {
    return {
      initialized: this.initialized,
      scheduledJobs: AIScheduler.getJobStatus(),
      uptime: process.uptime() + ' seconds',
    }
  }

  /**
   * Manual trigger interface for testing and emergency actions
   */
  static readonly manual = {
    // Scheduler triggers
    async triggerJob(jobName: string): Promise<void> {
      return AIScheduler.triggerJob(jobName)
    },

    // Event triggers
    ...ManualTriggers,
  }
}

// Export all AI modules for direct access if needed
export { ServiceFlowAI } from './ServiceFlowAI'
export { SmartReferralsAI } from './SmartReferralsAI'
export { SecurityShieldAI } from './SecurityShieldAI'
export { ProviderScoutAI } from './ProviderScoutAI'
export { EmpireWatchdogAI } from './EmpireWatchdogAI'
export { AIScheduler } from './scheduler'
export { ManualTriggers } from './middleware'

// Export helper utilities
export * from './utils/ai-helpers'