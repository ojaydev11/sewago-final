import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import {
  AISkill,
  ExecutionContext,
  ExecutionResult,
  SkillCategory,
  PermissionLevel,
  AIMetrics,
  AuditEvent
} from '../types/core';
import { executionKernel } from '../runners/execution-kernel';
import { logger, auditLogger, performanceLogger } from '../utils/logger';

// Skill decorator types
export interface SkillMetadata {
  name: string;
  description: string;
  category: SkillCategory;
  permissions: string[];
  permissionLevel: PermissionLevel;
  rateLimit?: {
    requests: number;
    windowMs: number;
  };
  spendingCost?: number;
  rollbackCapable?: boolean;
  destructive?: boolean;
  schema?: {
    input: z.ZodSchema<any>;
    output: z.ZodSchema<any>;
  };
}

export interface SkillOptions {
  timeout?: number;
  retries?: number;
  cacheable?: boolean;
  cacheKey?: string;
  cacheTtl?: number;
  enableMetrics?: boolean;
  enableAudit?: boolean;
}

// Skill execution wrapper
export class SkillExecutionWrapper {
  constructor(
    private skill: AISkill,
    private executor: (input: any, context: ExecutionContext) => Promise<any>,
    private options: SkillOptions = {}
  ) {}

  async execute(input: any, context: ExecutionContext): Promise<ExecutionResult> {
    const startTime = Date.now();
    const executionId = uuidv4();
    
    try {
      // Pre-execution logging
      if (this.options.enableAudit !== false) {
        this.logAuditEvent('skill_execution_started', {
          skillId: this.skill.id,
          userId: context.userId,
          input: this.sanitizeForAudit(input),
          context: this.sanitizeContextForAudit(context)
        });
      }

      // Input validation
      if (this.skill.schema?.input) {
        try {
          this.skill.schema.input.parse(input);
        } catch (validationError) {
          const error = `Input validation failed: ${validationError}`;
          this.logAuditEvent('skill_validation_failed', {
            skillId: this.skill.id,
            error,
            input: this.sanitizeForAudit(input)
          });
          throw new Error(error);
        }
      }

      // Cache check
      if (this.options.cacheable) {
        const cached = await this.getCachedResult(input, context);
        if (cached) {
          this.recordMetrics(startTime, true, 0, true);
          return {
            success: true,
            result: cached,
            metadata: {
              executionTime: Date.now() - startTime,
              cached: true,
              auditTrail: [{
                timestamp: new Date(),
                event: 'cache_hit',
                details: { skillId: this.skill.id }
              }]
            }
          };
        }
      }

      // Execute with timeout
      const timeoutMs = this.options.timeout || 30000; // 30 second default
      const result = await Promise.race([
        this.executor(input, context),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Execution timeout')), timeoutMs)
        ),
      ]);

      // Output validation
      if (this.skill.schema?.output) {
        try {
          this.skill.schema.output.parse(result);
        } catch (validationError) {
          const error = `Output validation failed: ${validationError}`;
          this.logAuditEvent('skill_output_validation_failed', {
            skillId: this.skill.id,
            error,
            output: this.sanitizeForAudit(result)
          });
          throw new Error(error);
        }
      }

      // Cache result
      if (this.options.cacheable) {
        await this.cacheResult(input, context, result);
      }

      // Record success metrics
      if (this.options.enableMetrics !== false) {
        this.recordMetrics(startTime, true, this.skill.spendingCost || 0, false);
      }

      // Post-execution audit
      if (this.options.enableAudit !== false) {
        this.logAuditEvent('skill_execution_completed', {
          skillId: this.skill.id,
          userId: context.userId,
          executionTime: Date.now() - startTime,
          success: true
        });
      }

      return {
        success: true,
        result,
        metadata: {
          executionTime: Date.now() - startTime,
          auditTrail: [{
            timestamp: new Date(),
            event: 'skill_executed',
            details: { 
              skillId: this.skill.id, 
              executionId,
              cached: false 
            }
          }]
        }
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Record failure metrics
      if (this.options.enableMetrics !== false) {
        this.recordMetrics(startTime, false, 0, false);
      }

      // Error audit
      if (this.options.enableAudit !== false) {
        this.logAuditEvent('skill_execution_failed', {
          skillId: this.skill.id,
          userId: context.userId,
          error: errorMessage,
          executionTime
        });
      }

      return {
        success: false,
        error: errorMessage,
        metadata: {
          executionTime,
          auditTrail: [{
            timestamp: new Date(),
            event: 'skill_failed',
            details: { 
              skillId: this.skill.id, 
              executionId,
              error: errorMessage 
            }
          }]
        }
      };
    }
  }

  private logAuditEvent(event: string, details: any) {
    auditLogger.info(event, {
      timestamp: new Date().toISOString(),
      event,
      ...details
    });
  }

  private recordMetrics(startTime: number, success: boolean, cost: number, cached: boolean) {
    const executionTime = Date.now() - startTime;
    
    performanceLogger.info('skill_metrics', {
      skillId: this.skill.id,
      timestamp: new Date().toISOString(),
      executionTime,
      success,
      cost,
      cached
    });
  }

  private sanitizeForAudit(data: any): any {
    // Remove sensitive data for audit logs
    if (typeof data !== 'object' || data === null) return data;
    
    const sanitized = { ...data };
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'cardNumber', 'ssn'];
    
    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }
    
    return sanitized;
  }

  private sanitizeContextForAudit(context: ExecutionContext): any {
    return {
      userId: context.userId,
      userRole: context.userRole,
      sessionId: context.sessionId,
      autonomyLevel: context.autonomyLevel,
      geofence: context.geofence,
      timestamp: context.timestamp
      // Exclude potentially sensitive metadata
    };
  }

  private async getCachedResult(input: any, context: ExecutionContext): Promise<any> {
    // Implement caching logic here
    // This would integrate with Redis or another cache
    return null;
  }

  private async cacheResult(input: any, context: ExecutionContext, result: any): Promise<void> {
    // Implement cache storage logic here
    // This would integrate with Redis or another cache
  }
}

// Skill builder class
export class SkillBuilder {
  private metadata: Partial<SkillMetadata> = {};
  private executor?: (input: any, context: ExecutionContext) => Promise<any>;
  private rollbackFn?: (transactionId: string) => Promise<void>;
  private options: SkillOptions = {};

  name(name: string): SkillBuilder {
    this.metadata.name = name;
    return this;
  }

  description(description: string): SkillBuilder {
    this.metadata.description = description;
    return this;
  }

  category(category: SkillCategory): SkillBuilder {
    this.metadata.category = category;
    return this;
  }

  permissions(permissions: string[]): SkillBuilder {
    this.metadata.permissions = permissions;
    return this;
  }

  permissionLevel(level: PermissionLevel): SkillBuilder {
    this.metadata.permissionLevel = level;
    return this;
  }

  rateLimit(requests: number, windowMs: number): SkillBuilder {
    this.metadata.rateLimit = { requests, windowMs };
    return this;
  }

  spendingCost(cost: number): SkillBuilder {
    this.metadata.spendingCost = cost;
    return this;
  }

  rollbackCapable(rollbackFn?: (transactionId: string) => Promise<void>): SkillBuilder {
    this.metadata.rollbackCapable = true;
    this.rollbackFn = rollbackFn;
    return this;
  }

  destructive(): SkillBuilder {
    this.metadata.destructive = true;
    return this;
  }

  inputSchema(schema: z.ZodSchema<any>): SkillBuilder {
    if (!this.metadata.schema) this.metadata.schema = {};
    this.metadata.schema.input = schema;
    return this;
  }

  outputSchema(schema: z.ZodSchema<any>): SkillBuilder {
    if (!this.metadata.schema) this.metadata.schema = {};
    this.metadata.schema.output = schema;
    return this;
  }

  execute(fn: (input: any, context: ExecutionContext) => Promise<any>): SkillBuilder {
    this.executor = fn;
    return this;
  }

  timeout(ms: number): SkillBuilder {
    this.options.timeout = ms;
    return this;
  }

  retries(count: number): SkillBuilder {
    this.options.retries = count;
    return this;
  }

  cacheable(ttl?: number): SkillBuilder {
    this.options.cacheable = true;
    if (ttl) this.options.cacheTtl = ttl;
    return this;
  }

  register(): string {
    // Validate required fields
    if (!this.metadata.name || !this.metadata.description || !this.metadata.category) {
      throw new Error('Skill must have name, description, and category');
    }

    if (!this.executor) {
      throw new Error('Skill must have an executor function');
    }

    // Generate skill ID
    const skillId = uuidv4();

    // Create skill definition
    const skill: AISkill = {
      id: skillId,
      name: this.metadata.name!,
      description: this.metadata.description!,
      category: this.metadata.category!,
      version: '1.0.0',
      permissions: this.metadata.permissions || [],
      requiredPermissionLevel: this.metadata.permissionLevel || PermissionLevel.READ,
      rateLimit: this.metadata.rateLimit || { requests: 100, windowMs: 60000 },
      spendingCost: this.metadata.spendingCost || 0,
      schema: this.metadata.schema || { input: z.any(), output: z.any() },
      rollbackCapable: this.metadata.rollbackCapable || false,
      destructive: this.metadata.destructive || false,
      auditLevel: this.metadata.destructive ? 'full' : 'basic'
    };

    // Create execution wrapper
    const wrapper = new SkillExecutionWrapper(skill, this.executor!, this.options);

    // Register with execution kernel
    executionKernel.registerSkill(skill, (input, context) => wrapper.execute(input, context));

    logger.info(`Registered skill: ${skill.name} (${skillId})`);
    
    return skillId;
  }
}

// Main SDK class
export class SkillSDK {
  static createSkill(): SkillBuilder {
    return new SkillBuilder();
  }

  static async executeSkill(
    skillId: string,
    input: any,
    context: ExecutionContext
  ): Promise<ExecutionResult> {
    return executionKernel.executeSkill(skillId, input, context);
  }

  static async getStatistics() {
    return executionKernel.getStatistics();
  }
}

// Convenience decorators (for future class-based skills)
export function Skill(metadata: SkillMetadata) {
  return function (target: any) {
    const skillId = uuidv4();
    
    const skill: AISkill = {
      id: skillId,
      name: metadata.name,
      description: metadata.description,
      category: metadata.category,
      version: '1.0.0',
      permissions: metadata.permissions,
      requiredPermissionLevel: metadata.permissionLevel,
      rateLimit: metadata.rateLimit || { requests: 100, windowMs: 60000 },
      spendingCost: metadata.spendingCost || 0,
      schema: metadata.schema || { input: z.any(), output: z.any() },
      rollbackCapable: metadata.rollbackCapable || false,
      destructive: metadata.destructive || false,
      auditLevel: metadata.destructive ? 'full' : 'basic'
    };

    // Store skill metadata on the class
    target.skillMetadata = skill;
    target.skillId = skillId;
  };
}

export function Execute() {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    // Mark the method as the skill executor
    target.executorMethod = propertyName;
  };
}

export function Rollback() {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    // Mark the method as the rollback function
    target.rollbackMethod = propertyName;
  };
}