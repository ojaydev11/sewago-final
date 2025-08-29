// Re-export types from AI Core for frontend use
// This ensures type compatibility between frontend and AI core

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

export interface ExecutionContext {
  userId: string;
  userRole: UserRole;
  sessionId: string;
  transactionId: string;
  autonomyLevel: AutonomyLevel;
  geofence: 'nepal' | 'global';
  spendingLimit: number;
  rateLimits: Array<{
    resource: string;
    limit: number;
    window: number;
  }>;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface AISkill {
  id: string;
  name: string;
  description: string;
  category: SkillCategory;
  version: string;
  permissions: string[];
  requiredPermissionLevel: PermissionLevel;
  rateLimit: {
    requests: number;
    windowMs: number;
  };
  spendingCost: number;
  schema: {
    input: any;
    output: any;
  };
  rollbackCapable: boolean;
  destructive: boolean;
  auditLevel: 'none' | 'basic' | 'detailed' | 'full';
}

export interface ExecutionResult {
  success: boolean;
  result?: any;
  error?: string;
  metadata: {
    executionTime: number;
    rollbackId?: string;
    cached?: boolean;
    auditTrail: Array<{
      timestamp: Date;
      event: string;
      details: any;
    }>;
  };
}

export interface AIExecuteRequest {
  skillId: string;
  input: any;
  context: {
    userId: string;
    userRole?: UserRole;
    sessionId: string;
    autonomyLevel?: AutonomyLevel;
    geofence?: 'nepal' | 'global';
    metadata?: Record<string, any>;
  };
  platform?: 'web' | 'mobile' | 'api';
  options?: {
    sync?: boolean;
    timeout?: number;
    priority?: number;
  };
}

export interface AIExecuteResponse {
  success: boolean;
  result?: any;
  error?: string;
  jobId?: string;
  approvalRequired?: boolean;
  workflowId?: string;
  metadata: {
    executionTime: number;
    cached?: boolean;
    rollbackId?: string;
    auditTrail: Array<{
      timestamp: Date;
      event: string;
      details: any;
    }>;
  };
}

export interface ApprovalWorkflow {
  workflowId: string;
  initiator: string;
  skillId: string;
  requestDetails: {
    action: string;
    input: any;
    context: ExecutionContext;
    riskScore: number;
  };
  steps: ApprovalStep[];
  currentStep: number;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  timeline: {
    initiated: Date;
    completed?: Date;
    deadline: Date;
  };
  metadata?: Record<string, any>;
}

export interface ApprovalStep {
  stepId: string;
  approverRole: string;
  approverUser?: string;
  timeoutMinutes: number;
  escalationRule?: {
    escalateTo: string;
    afterMinutes: number;
  };
  status: 'waiting' | 'approved' | 'rejected' | 'expired';
  completedAt?: Date;
  rationale?: string;
}

export interface PolicyRule {
  id: string;
  name: string;
  action: string;
  conditions: Array<{
    field: string;
    operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'not_in' | 'contains' | 'regex';
    value: any;
  }>;
  effect: 'allow' | 'deny' | 'require_approval';
  priority: number;
  metadata: {
    reason: string;
    approver?: 'admin' | 'provider' | 'system' | 'manager';
    timeout?: number;
    escalation?: string[];
  };
}

export interface CircuitBreaker {
  name: string;
  failureThreshold: number;
  recoveryTimeout: number;
  monitoringPeriod: number;
  state: 'closed' | 'open' | 'half_open';
  failures: number;
  lastFailureTime?: Date;
  nextAttempt?: Date;
}

export interface AIMetrics {
  skillId: string;
  timestamp: Date;
  metrics: {
    executionTime: number;
    success: boolean;
    cost: number;
    userSatisfaction?: number;
    riskScore: number;
    rollbackTriggered: boolean;
  };
  tags?: Record<string, string>;
}

export interface AuditEvent {
  eventId: string;
  timestamp: Date;
  userId: string;
  skillId: string;
  action: string;
  input: any;
  output: any;
  riskScore: number;
  approvalRequired: boolean;
  approvalStatus?: string;
  executionTime: number;
  cost: number;
  success: boolean;
  metadata: {
    sessionId: string;
    ipAddress?: string;
    userAgent?: string;
    geolocation?: {
      lat: number;
      lng: number;
      country: string;
    };
    riskFactors: string[];
    complianceFlags: string[];
  };
}

// Error classes
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

// Skill-specific types

// Booking Assistant Types
export interface BookingAssistantInput {
  serviceType: string;
  location: {
    district: string;
    area?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  timePreference: {
    date: string; // YYYY-MM-DD format
    timeSlot: 'morning' | 'afternoon' | 'evening' | 'flexible';
    urgency: 'low' | 'medium' | 'high' | 'emergency';
  };
  budget?: {
    min?: number;
    max?: number;
    currency: string;
  };
  requirements?: {
    description?: string;
    duration?: number; // hours
    materials?: string[];
    experience: 'any' | 'beginner' | 'intermediate' | 'expert';
  };
  userId: string;
  sessionId: string;
  previousBookings?: string[];
}

export interface BookingAssistantOutput {
  recommendations: Array<{
    providerId: string;
    providerName: string;
    rating: number;
    reviewCount: number;
    estimatedPrice: {
      amount: number;
      currency: string;
      breakdown?: Array<{
        item: string;
        amount: number;
      }>;
    };
    availability: {
      date: string;
      timeSlots: string[];
    };
    distance?: number;
    specializations?: string[];
    profilePicture?: string;
  }>;
  bookingDraft: {
    id: string;
    serviceType: string;
    providerId?: string;
    scheduledFor?: string;
    estimatedCost: number;
    status: 'draft';
    validUntil: string;
  };
  missingInformation?: string[];
  conversationContext: {
    step: 'service_selection' | 'location_selection' | 'time_selection' | 'provider_selection' | 'confirmation';
    progress: number;
    nextActions: string[];
  };
  alternatives?: Array<{
    suggestion: string;
    reason: string;
    impact: string;
  }>;
}

// System health and statistics
export interface AISystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    initialization: boolean;
    executionKernel: boolean;
    policyEngine: boolean;
    redis: boolean;
  };
  error?: string;
}

export interface AISystemStatistics {
  system: {
    initialized: boolean;
    uptime: number;
    version: string;
  };
  execution: {
    registeredSkills: number;
    registeredSagas: number;
    pendingJobs: number;
    circuitBreakers: Array<{
      skillId: string;
      state: string;
      failures: number;
    }>;
    workerConcurrency: number;
  };
  policies: {
    totalPolicies: number;
    policiesByEffect: Record<string, number>;
    activeWorkflows: number;
    expiredWorkflows: number;
  };
  skills: {
    registered: number;
    list: string[];
  };
}