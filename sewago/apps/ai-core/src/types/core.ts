import { z } from 'zod';

// Base Types
export enum UserRole {
  CUSTOMER = 'customer',
  PROVIDER = 'provider',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
  SYSTEM = 'system'
}

export enum PermissionLevel {
  READ = 'read',
  SUGGEST = 'suggest',
  ACT_LOW = 'act_low',
  ACT_FULL = 'act_full'
}

export enum SkillCategory {
  CUSTOMER = 'customer',
  PROVIDER = 'provider',
  ADMIN = 'admin',
  CONTENT = 'content'
}

export enum AutonomyLevel {
  READ = 'read',
  SUGGEST = 'suggest',
  ACT_LOW = 'act_low',
  ACT_FULL = 'act_full'
}

// Execution Context
export const ExecutionContextSchema = z.object({
  userId: z.string(),
  userRole: z.nativeEnum(UserRole),
  sessionId: z.string(),
  transactionId: z.string(),
  autonomyLevel: z.nativeEnum(AutonomyLevel),
  geofence: z.enum(['nepal', 'global']).default('nepal'),
  spendingLimit: z.number().positive(),
  rateLimits: z.array(z.object({
    resource: z.string(),
    limit: z.number(),
    window: z.number()
  })),
  timestamp: z.date().default(() => new Date()),
  metadata: z.record(z.any()).optional()
});

export type ExecutionContext = z.infer<typeof ExecutionContextSchema>;

// Skill Definition
export const SkillSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.nativeEnum(SkillCategory),
  version: z.string(),
  permissions: z.array(z.string()),
  requiredPermissionLevel: z.nativeEnum(PermissionLevel),
  rateLimit: z.object({
    requests: z.number(),
    windowMs: z.number()
  }),
  spendingCost: z.number().default(0),
  schema: z.object({
    input: z.any(),
    output: z.any()
  }),
  rollbackCapable: z.boolean().default(false),
  destructive: z.boolean().default(false),
  auditLevel: z.enum(['none', 'basic', 'detailed', 'full']).default('basic')
});

export type AISkill = z.infer<typeof SkillSchema>;

// Policy Definition
export const PolicyRuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  action: z.string(),
  conditions: z.array(z.object({
    field: z.string(),
    operator: z.enum(['eq', 'ne', 'gt', 'lt', 'gte', 'lte', 'in', 'not_in', 'contains', 'regex']),
    value: z.any()
  })),
  effect: z.enum(['allow', 'deny', 'require_approval']),
  priority: z.number().default(100),
  metadata: z.object({
    reason: z.string(),
    approver: z.enum(['admin', 'provider', 'system', 'manager']).optional(),
    timeout: z.number().optional(),
    escalation: z.array(z.string()).optional()
  })
});

export type PolicyRule = z.infer<typeof PolicyRuleSchema>;

// Approval Workflow
export const ApprovalStepSchema = z.object({
  stepId: z.string(),
  approverRole: z.string(),
  approverUser: z.string().optional(),
  timeoutMinutes: z.number().default(60),
  escalationRule: z.object({
    escalateTo: z.string(),
    afterMinutes: z.number()
  }).optional(),
  status: z.enum(['waiting', 'approved', 'rejected', 'expired']).default('waiting'),
  completedAt: z.date().optional(),
  rationale: z.string().optional()
});

export const ApprovalWorkflowSchema = z.object({
  workflowId: z.string(),
  initiator: z.string(),
  skillId: z.string(),
  requestDetails: z.object({
    action: z.string(),
    input: z.any(),
    context: ExecutionContextSchema,
    riskScore: z.number().min(0).max(1)
  }),
  steps: z.array(ApprovalStepSchema),
  currentStep: z.number().default(0),
  status: z.enum(['pending', 'approved', 'rejected', 'expired']).default('pending'),
  timeline: z.object({
    initiated: z.date(),
    completed: z.date().optional(),
    deadline: z.date()
  }),
  metadata: z.record(z.any()).optional()
});

export type ApprovalStep = z.infer<typeof ApprovalStepSchema>;
export type ApprovalWorkflow = z.infer<typeof ApprovalWorkflowSchema>;

// Execution Result
export const ExecutionResultSchema = z.object({
  success: z.boolean(),
  result: z.any().optional(),
  error: z.string().optional(),
  metadata: z.object({
    executionTime: z.number(),
    rollbackId: z.string().optional(),
    auditTrail: z.array(z.object({
      timestamp: z.date(),
      event: z.string(),
      details: z.any()
    }))
  })
});

export type ExecutionResult = z.infer<typeof ExecutionResultSchema>;

// Job Definition for Queue
export const JobSchema = z.object({
  id: z.string(),
  type: z.string(),
  skillId: z.string(),
  input: z.any(),
  context: ExecutionContextSchema,
  priority: z.number().default(0),
  delay: z.number().default(0),
  attempts: z.number().default(3),
  backoff: z.object({
    type: z.enum(['fixed', 'exponential']),
    delay: z.number()
  }).default({ type: 'exponential', delay: 2000 }),
  metadata: z.record(z.any()).optional()
});

export type AIJob = z.infer<typeof JobSchema>;

// Circuit Breaker
export const CircuitBreakerSchema = z.object({
  name: z.string(),
  failureThreshold: z.number().default(5),
  recoveryTimeout: z.number().default(60000),
  monitoringPeriod: z.number().default(60000),
  state: z.enum(['closed', 'open', 'half_open']).default('closed'),
  failures: z.number().default(0),
  lastFailureTime: z.date().optional(),
  nextAttempt: z.date().optional()
});

export type CircuitBreaker = z.infer<typeof CircuitBreakerSchema>;

// Metrics and Monitoring
export const MetricsSchema = z.object({
  skillId: z.string(),
  timestamp: z.date(),
  metrics: z.object({
    executionTime: z.number(),
    success: z.boolean(),
    cost: z.number(),
    userSatisfaction: z.number().min(0).max(5).optional(),
    riskScore: z.number().min(0).max(1),
    rollbackTriggered: z.boolean().default(false)
  }),
  tags: z.record(z.string()).optional()
});

export type AIMetrics = z.infer<typeof MetricsSchema>;

// Audit Event
export const AuditEventSchema = z.object({
  eventId: z.string(),
  timestamp: z.date(),
  userId: z.string(),
  skillId: z.string(),
  action: z.string(),
  input: z.any(),
  output: z.any(),
  riskScore: z.number().min(0).max(1),
  approvalRequired: z.boolean(),
  approvalStatus: z.string().optional(),
  executionTime: z.number(),
  cost: z.number(),
  success: z.boolean(),
  metadata: z.object({
    sessionId: z.string(),
    ipAddress: z.string().optional(),
    userAgent: z.string().optional(),
    geolocation: z.object({
      lat: z.number(),
      lng: z.number(),
      country: z.string()
    }).optional(),
    riskFactors: z.array(z.string()),
    complianceFlags: z.array(z.string())
  })
});

export type AuditEvent = z.infer<typeof AuditEventSchema>;

// Error Types
export class AIError extends Error {
  constructor(
    message: string,
    public code: string,
    public skillId?: string,
    public context?: ExecutionContext
  ) {
    super(message);
    this.name = 'AIError';
  }
}

export class PolicyViolationError extends AIError {
  constructor(
    message: string,
    public policyId: string,
    public violationType: string,
    skillId?: string,
    context?: ExecutionContext
  ) {
    super(message, 'POLICY_VIOLATION', skillId, context);
    this.name = 'PolicyViolationError';
  }
}

export class ApprovalRequiredError extends AIError {
  constructor(
    message: string,
    public workflowId: string,
    skillId?: string,
    context?: ExecutionContext
  ) {
    super(message, 'APPROVAL_REQUIRED', skillId, context);
    this.name = 'ApprovalRequiredError';
  }
}

export class RateLimitError extends AIError {
  constructor(
    message: string,
    public retryAfter: number,
    skillId?: string,
    context?: ExecutionContext
  ) {
    super(message, 'RATE_LIMIT_EXCEEDED', skillId, context);
    this.name = 'RateLimitError';
  }
}