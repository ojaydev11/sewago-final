import { logger } from './utils/logger';
import { executionKernel } from './runners/execution-kernel';
import { policyEngine } from './policies/engine';
import { SkillSDK } from './skills/sdk';

// Import and register skills
import { registerBookingAssistant } from './skills/customer/booking-assistant';

// Export main types and classes for external use
export * from './types/core';
export * from './policies/engine';
export * from './runners/execution-kernel';
export * from './skills/sdk';
export { logger, auditLogger, performanceLogger, securityLogger } from './utils/logger';

// AI Core Engine class
export class AICore {
  private initialized = false;
  private skillIds: string[] = [];

  async initialize(config?: {
    redis?: any;
    logLevel?: string;
    disableSkills?: string[];
  }) {
    if (this.initialized) {
      logger.warn('AI Core already initialized');
      return;
    }

    try {
      logger.info('Initializing SewaGo AI Core...');

      // Set log level if provided
      if (config?.logLevel) {
        logger.level = config.logLevel;
      }

      // Initialize policy engine
      logger.info('Policy engine initialized');

      // Initialize execution kernel
      logger.info('Execution kernel initialized');

      // Register core skills
      await this.registerCoreSkills(config?.disableSkills || []);

      this.initialized = true;
      logger.info('SewaGo AI Core initialization complete', {
        registeredSkills: this.skillIds.length,
        policyEngine: 'active',
        executionKernel: 'active'
      });

    } catch (error) {
      logger.error('Failed to initialize AI Core', error);
      throw error;
    }
  }

  private async registerCoreSkills(disabledSkills: string[]) {
    const skillRegistrations = [
      { name: 'booking-assistant', register: registerBookingAssistant }
    ];

    for (const { name, register } of skillRegistrations) {
      if (!disabledSkills.includes(name)) {
        try {
          const skillId = register();
          this.skillIds.push(skillId);
          logger.info(`Registered skill: ${name} (${skillId})`);
        } catch (error) {
          logger.error(`Failed to register skill: ${name}`, error);
        }
      } else {
        logger.info(`Skill disabled: ${name}`);
      }
    }
  }

  async executeSkill(skillId: string, input: any, context: any) {
    if (!this.initialized) {
      throw new Error('AI Core not initialized. Call initialize() first.');
    }

    return executionKernel.executeSkill(skillId, input, context);
  }

  async getStatistics() {
    const executionStats = await executionKernel.getStatistics();
    const policyStats = policyEngine.getStatistics();

    return {
      system: {
        initialized: this.initialized,
        uptime: process.uptime(),
        version: '1.0.0'
      },
      execution: executionStats,
      policies: policyStats,
      skills: {
        registered: this.skillIds.length,
        list: this.skillIds
      }
    };
  }

  async getHealth() {
    try {
      const stats = await this.getStatistics();
      
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        checks: {
          initialization: this.initialized,
          executionKernel: stats.execution.registeredSkills > 0,
          policyEngine: stats.policies.totalPolicies > 0,
          redis: stats.execution.pendingJobs !== undefined
        }
      };

      // Overall health status
      const allChecksPass = Object.values(health.checks).every(check => check === true);
      health.status = allChecksPass ? 'healthy' : 'degraded';

      return health;
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        checks: {
          initialization: this.initialized,
          executionKernel: false,
          policyEngine: false,
          redis: false
        }
      };
    }
  }

  async shutdown() {
    if (!this.initialized) {
      logger.warn('AI Core not initialized, nothing to shutdown');
      return;
    }

    logger.info('Shutting down AI Core...');
    
    try {
      await executionKernel.shutdown();
      this.initialized = false;
      logger.info('AI Core shutdown complete');
    } catch (error) {
      logger.error('Error during AI Core shutdown:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const aiCore = new AICore();

// Graceful shutdown handling
process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  try {
    await aiCore.shutdown();
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  try {
    await aiCore.shutdown();
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
});

// Unhandled promise rejection handling
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Uncaught exception handling
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});