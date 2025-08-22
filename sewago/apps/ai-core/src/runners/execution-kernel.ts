import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import { policyEngine } from '../policies/engine';
import {
  AIJob,
  AISkill,
  ExecutionContext,
  ExecutionResult,
  CircuitBreaker,
  AIError,
  ApprovalRequiredError,
  PolicyViolationError
} from '../types/core';

export interface SagaStep {
  id: string;
  name: string;
  execute: (context: any) => Promise<any>;
  compensate: (context: any) => Promise<void>;
  retryable: boolean;
  maxRetries: number;
}

export class ExecutionKernel {
  private redis: Redis;
  private jobQueue: Queue;
  private worker: Worker;
  private skillRegistry: Map<string, AISkill> = new Map();
  private skillExecutors: Map<string, (input: any, context: ExecutionContext) => Promise<any>> = new Map();
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();
  private sagaRegistry: Map<string, SagaStep[]> = new Map();

  constructor(redisConfig?: any) {
    this.redis = new Redis(redisConfig || {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      maxRetriesPerRequest: 3,
      retryDelayOnFailover: 100,
    });

    this.jobQueue = new Queue('ai-execution', {
      connection: this.redis,
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    });

    this.worker = new Worker(
      'ai-execution',
      async (job) => this.processJob(job),
      {
        connection: this.redis,
        concurrency: parseInt(process.env.AI_WORKER_CONCURRENCY || '5'),
        stalledInterval: 30 * 1000,
        maxStalledCount: 1,
      }
    );

    this.setupWorkerEventHandlers();
    this.startMaintenanceTasks();
  }

  /**
   * Register a skill with the execution kernel
   */
  registerSkill(
    skill: AISkill,
    executor: (input: any, context: ExecutionContext) => Promise<any>
  ) {
    this.skillRegistry.set(skill.id, skill);
    this.skillExecutors.set(skill.id, executor);
    
    // Initialize circuit breaker
    this.circuitBreakers.set(skill.id, {
      name: skill.id,
      failureThreshold: 5,
      recoveryTimeout: 60000,
      monitoringPeriod: 60000,
      state: 'closed',
      failures: 0
    });

    logger.info(`Registered skill: ${skill.id}`);
  }

  /**
   * Execute a skill with full governance pipeline
   */
  async executeSkill(
    skillId: string,
    input: any,
    context: ExecutionContext
  ): Promise<ExecutionResult> {
    const skill = this.skillRegistry.get(skillId);
    if (!skill) {
      throw new AIError(`Skill not found: ${skillId}`, 'SKILL_NOT_FOUND');
    }

    const startTime = Date.now();
    const transactionId = context.transactionId || uuidv4();
    
    try {
      // 1. Circuit breaker check
      await this.checkCircuitBreaker(skillId);

      // 2. Policy evaluation
      const policyResult = await policyEngine.evaluate(skill, context, input);
      
      if (!policyResult.allowed && !policyResult.requiresApproval) {
        throw new PolicyViolationError(
          policyResult.reason || 'Policy violation',
          policyResult.violatedPolicies?.[0] || 'unknown',
          'EXECUTION_DENIED',
          skillId,
          context
        );
      }

      if (policyResult.requiresApproval) {
        throw new ApprovalRequiredError(
          policyResult.reason || 'Approval required',
          policyResult.workflowId!,
          skillId,
          context
        );
      }

      // 3. Queue execution for async processing
      const job = await this.queueSkillExecution(skill, input, context, transactionId);
      
      // 4. Wait for completion or return job ID for async tracking
      if (context.metadata?.sync) {
        return await this.waitForJobCompletion(job.id!);
      } else {
        return {
          success: true,
          result: { jobId: job.id, transactionId },
          metadata: {
            executionTime: Date.now() - startTime,
            auditTrail: [{
              timestamp: new Date(),
              event: 'job_queued',
              details: { jobId: job.id, skillId }
            }]
          }
        };
      }

    } catch (error) {
      // Record circuit breaker failure
      await this.recordFailure(skillId);
      
      const executionTime = Date.now() - startTime;
      
      if (error instanceof AIError) {
        return {
          success: false,
          error: error.message,
          metadata: {
            executionTime,
            auditTrail: [{
              timestamp: new Date(),
              event: 'execution_failed',
              details: { error: error.message, code: error.code }
            }]
          }
        };
      }

      throw error;
    }
  }

  /**
   * Execute saga pattern for multi-step operations
   */
  async executeSaga(
    sagaId: string,
    initialContext: any,
    executionContext: ExecutionContext
  ): Promise<ExecutionResult> {
    const steps = this.sagaRegistry.get(sagaId);
    if (!steps) {
      throw new AIError(`Saga not found: ${sagaId}`, 'SAGA_NOT_FOUND');
    }

    const transactionId = executionContext.transactionId || uuidv4();
    const completedSteps: Array<{ step: SagaStep; result: any }> = [];
    const startTime = Date.now();

    try {
      let context = { ...initialContext, transactionId };

      // Execute steps sequentially
      for (const step of steps) {
        logger.info(`Executing saga step: ${step.name} (${sagaId})`);
        
        try {
          const result = await this.executeStepWithRetry(step, context);
          completedSteps.push({ step, result });
          
          // Update context with step result
          context = { ...context, [step.name]: result };
          
        } catch (stepError) {
          logger.error(`Saga step failed: ${step.name}`, stepError);
          
          // Execute compensation for completed steps in reverse order
          await this.compensateSaga(completedSteps.reverse());
          
          throw new AIError(
            `Saga failed at step ${step.name}: ${stepError instanceof Error ? stepError.message : stepError}`,
            'SAGA_EXECUTION_FAILED'
          );
        }
      }

      return {
        success: true,
        result: context,
        metadata: {
          executionTime: Date.now() - startTime,
          rollbackId: transactionId,
          auditTrail: completedSteps.map((cs, idx) => ({
            timestamp: new Date(),
            event: `saga_step_${idx + 1}_completed`,
            details: { stepName: cs.step.name, stepId: cs.step.id }
          }))
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        metadata: {
          executionTime: Date.now() - startTime,
          rollbackId: transactionId,
          auditTrail: [{
            timestamp: new Date(),
            event: 'saga_failed',
            details: { error: error instanceof Error ? error.message : error }
          }]
        }
      };
    }
  }

  /**
   * Register a saga workflow
   */
  registerSaga(sagaId: string, steps: SagaStep[]) {
    this.sagaRegistry.set(sagaId, steps);
    logger.info(`Registered saga: ${sagaId} with ${steps.length} steps`);
  }

  /**
   * Queue skill execution for async processing
   */
  private async queueSkillExecution(
    skill: AISkill,
    input: any,
    context: ExecutionContext,
    transactionId: string
  ): Promise<Job> {
    const jobData: AIJob = {
      id: uuidv4(),
      type: 'skill_execution',
      skillId: skill.id,
      input,
      context: { ...context, transactionId },
      priority: skill.category === 'admin' ? 10 : 0,
      metadata: {
        createdAt: new Date().toISOString(),
        skillName: skill.name
      }
    };

    const job = await this.jobQueue.add(
      'execute_skill',
      jobData,
      {
        priority: jobData.priority,
        delay: jobData.delay || 0,
        attempts: jobData.attempts || 3,
        backoff: jobData.backoff || { type: 'exponential', delay: 2000 }
      }
    );

    logger.info(`Queued skill execution: ${skill.id} (Job: ${job.id})`);
    return job;
  }

  /**
   * Process a job from the queue
   */
  private async processJob(job: Job): Promise<any> {
    const jobData = job.data as AIJob;
    const { skillId, input, context } = jobData;
    
    logger.info(`Processing job ${job.id} for skill ${skillId}`);
    
    const skill = this.skillRegistry.get(skillId);
    const executor = this.skillExecutors.get(skillId);
    
    if (!skill || !executor) {
      throw new AIError(`Skill or executor not found: ${skillId}`, 'SKILL_NOT_FOUND');
    }

    // Validate input against skill schema
    if (skill.schema?.input) {
      try {
        skill.schema.input.parse(input);
      } catch (validationError) {
        throw new AIError(
          `Input validation failed for skill ${skillId}: ${validationError}`,
          'VALIDATION_ERROR',
          skillId,
          context
        );
      }
    }

    // Execute the skill
    const result = await executor(input, context);
    
    // Validate output against skill schema
    if (skill.schema?.output) {
      try {
        skill.schema.output.parse(result);
      } catch (validationError) {
        throw new AIError(
          `Output validation failed for skill ${skillId}: ${validationError}`,
          'VALIDATION_ERROR',
          skillId,
          context
        );
      }
    }

    // Record success
    await this.recordSuccess(skillId);
    
    return result;
  }

  /**
   * Execute saga step with retry logic
   */
  private async executeStepWithRetry(step: SagaStep, context: any): Promise<any> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= step.maxRetries + 1; attempt++) {
      try {
        return await step.execute(context);
      } catch (error) {
        lastError = error;
        
        if (!step.retryable || attempt > step.maxRetries) {
          throw error;
        }
        
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 30000);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        logger.warn(`Retrying step ${step.name}, attempt ${attempt + 1}/${step.maxRetries + 1}`);
      }
    }
    
    throw lastError;
  }

  /**
   * Compensate saga by running compensation functions
   */
  private async compensateSaga(completedSteps: Array<{ step: SagaStep; result: any }>) {
    logger.info(`Compensating ${completedSteps.length} completed saga steps`);
    
    for (const { step, result } of completedSteps) {
      try {
        await step.compensate(result);
        logger.info(`Compensated step: ${step.name}`);
      } catch (compensationError) {
        logger.error(`Failed to compensate step ${step.name}:`, compensationError);
        // Continue with other compensations even if one fails
      }
    }
  }

  /**
   * Check circuit breaker state
   */
  private async checkCircuitBreaker(skillId: string): Promise<void> {
    const breaker = this.circuitBreakers.get(skillId);
    if (!breaker) return;

    const now = Date.now();

    switch (breaker.state) {
      case 'open':
        if (breaker.nextAttempt && now >= breaker.nextAttempt.getTime()) {
          breaker.state = 'half_open';
          logger.info(`Circuit breaker half-open for skill ${skillId}`);
        } else {
          throw new AIError(
            `Circuit breaker is open for skill ${skillId}`,
            'CIRCUIT_BREAKER_OPEN',
            skillId
          );
        }
        break;

      case 'half_open':
        // Allow one request to test if service is recovered
        break;

      case 'closed':
        // Normal operation
        break;
    }
  }

  /**
   * Record successful execution
   */
  private async recordSuccess(skillId: string) {
    const breaker = this.circuitBreakers.get(skillId);
    if (!breaker) return;

    if (breaker.state === 'half_open') {
      // Service appears to be recovered
      breaker.state = 'closed';
      breaker.failures = 0;
      breaker.lastFailureTime = undefined;
      breaker.nextAttempt = undefined;
      logger.info(`Circuit breaker closed for skill ${skillId}`);
    }
  }

  /**
   * Record failed execution
   */
  private async recordFailure(skillId: string) {
    const breaker = this.circuitBreakers.get(skillId);
    if (!breaker) return;

    breaker.failures++;
    breaker.lastFailureTime = new Date();

    if (breaker.failures >= breaker.failureThreshold) {
      breaker.state = 'open';
      breaker.nextAttempt = new Date(Date.now() + breaker.recoveryTimeout);
      logger.warn(`Circuit breaker opened for skill ${skillId} (${breaker.failures} failures)`);
    }
  }

  /**
   * Wait for job completion
   */
  private async waitForJobCompletion(jobId: string): Promise<ExecutionResult> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new AIError('Job execution timeout', 'EXECUTION_TIMEOUT'));
      }, 30000); // 30 second timeout

      this.worker.on('completed', (job) => {
        if (job.id === jobId) {
          clearTimeout(timeout);
          resolve({
            success: true,
            result: job.returnvalue,
            metadata: {
              executionTime: job.processedOn! - job.timestamp,
              auditTrail: [{
                timestamp: new Date(),
                event: 'job_completed',
                details: { jobId: job.id }
              }]
            }
          });
        }
      });

      this.worker.on('failed', (job, err) => {
        if (job && job.id === jobId) {
          clearTimeout(timeout);
          resolve({
            success: false,
            error: err.message,
            metadata: {
              executionTime: job.processedOn ? job.processedOn - job.timestamp : 0,
              auditTrail: [{
                timestamp: new Date(),
                event: 'job_failed',
                details: { jobId: job.id, error: err.message }
              }]
            }
          });
        }
      });
    });
  }

  /**
   * Setup worker event handlers
   */
  private setupWorkerEventHandlers() {
    this.worker.on('completed', (job) => {
      logger.info(`Job ${job.id} completed successfully`);
    });

    this.worker.on('failed', (job, err) => {
      logger.error(`Job ${job?.id} failed:`, err);
    });

    this.worker.on('stalled', (jobId) => {
      logger.warn(`Job ${jobId} stalled`);
    });

    this.worker.on('error', (err) => {
      logger.error('Worker error:', err);
    });
  }

  /**
   * Start maintenance tasks
   */
  private startMaintenanceTasks() {
    // Clean up expired approval workflows every 5 minutes
    setInterval(async () => {
      try {
        const cleaned = await policyEngine.cleanupExpiredWorkflows();
        if (cleaned > 0) {
          logger.info(`Cleaned up ${cleaned} expired approval workflows`);
        }
      } catch (error) {
        logger.error('Failed to cleanup expired workflows:', error);
      }
    }, 5 * 60 * 1000);

    // Reset circuit breaker failure counts every hour
    setInterval(() => {
      for (const breaker of this.circuitBreakers.values()) {
        if (breaker.state === 'closed' && breaker.failures > 0) {
          breaker.failures = Math.max(0, breaker.failures - 1);
        }
      }
    }, 60 * 60 * 1000);
  }

  /**
   * Get execution statistics
   */
  async getStatistics() {
    const queueStats = await this.jobQueue.getWaiting();
    const circuitBreakerStats = Array.from(this.circuitBreakers.entries()).map(([skillId, breaker]) => ({
      skillId,
      state: breaker.state,
      failures: breaker.failures
    }));

    return {
      registeredSkills: this.skillRegistry.size,
      registeredSagas: this.sagaRegistry.size,
      pendingJobs: queueStats.length,
      circuitBreakers: circuitBreakerStats,
      workerConcurrency: this.worker.opts.concurrency
    };
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    logger.info('Shutting down execution kernel...');
    
    await this.worker.close();
    await this.jobQueue.close();
    await this.redis.quit();
    
    logger.info('Execution kernel shutdown complete');
  }
}

// Export singleton instance
export const executionKernel = new ExecutionKernel();