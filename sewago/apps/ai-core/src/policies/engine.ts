import { 
  PolicyRule, 
  ExecutionContext, 
  ApprovalWorkflow,
  PolicyViolationError,
  ApprovalRequiredError,
  AISkill,
  UserRole,
  PermissionLevel
} from '../types/core';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

export class PolicyEngine {
  private rules: Map<string, PolicyRule[]> = new Map();
  private approvalQueue: Map<string, ApprovalWorkflow> = new Map();

  constructor() {
    this.loadDefaultPolicies();
  }

  /**
   * Load default policies for SewaGo AI system
   */
  private loadDefaultPolicies() {
    const defaultPolicies: PolicyRule[] = [
      // Financial safety policies
      {
        id: 'financial-high-value',
        name: 'High Value Transaction Approval',
        action: '*',
        conditions: [
          { field: 'spendingAmount', operator: 'gt', value: 50000 }, // NPR 50,000
          { field: 'userRole', operator: 'in', value: [UserRole.CUSTOMER, UserRole.PROVIDER] }
        ],
        effect: 'require_approval',
        priority: 1,
        metadata: {
          reason: 'High value transactions require approval for financial safety',
          approver: 'admin',
          timeout: 30
        }
      },
      
      // Destructive operation policies
      {
        id: 'destructive-operations',
        name: 'Destructive Operations Control',
        action: '*',
        conditions: [
          { field: 'skill.destructive', operator: 'eq', value: true }
        ],
        effect: 'require_approval',
        priority: 1,
        metadata: {
          reason: 'Destructive operations require explicit approval',
          approver: 'admin',
          timeout: 60
        }
      },

      // Customer permission restrictions
      {
        id: 'customer-act-full-deny',
        name: 'Customer ACT_FULL Restriction',
        action: '*',
        conditions: [
          { field: 'userRole', operator: 'eq', value: UserRole.CUSTOMER },
          { field: 'skill.requiredPermissionLevel', operator: 'eq', value: PermissionLevel.ACT_FULL }
        ],
        effect: 'deny',
        priority: 1,
        metadata: {
          reason: 'Customers cannot perform ACT_FULL operations for security'
        }
      },

      // Provider restrictions on admin skills
      {
        id: 'provider-admin-skills-deny',
        name: 'Provider Admin Skills Restriction',
        action: '*',
        conditions: [
          { field: 'userRole', operator: 'eq', value: UserRole.PROVIDER },
          { field: 'skill.category', operator: 'eq', value: 'admin' }
        ],
        effect: 'deny',
        priority: 1,
        metadata: {
          reason: 'Providers cannot access administrative skills'
        }
      },

      // Rate limiting enforcement
      {
        id: 'rate-limit-exceeded',
        name: 'Rate Limit Enforcement',
        action: '*',
        conditions: [
          { field: 'rateLimitExceeded', operator: 'eq', value: true }
        ],
        effect: 'deny',
        priority: 1,
        metadata: {
          reason: 'Rate limit exceeded for user or skill'
        }
      },

      // Business hours restrictions for certain operations
      {
        id: 'business-hours-payments',
        name: 'Payment Operations Business Hours',
        action: 'payment-*',
        conditions: [
          { field: 'currentHour', operator: 'lt', value: 9 },
          { field: 'currentHour', operator: 'gt', value: 18 },
          { field: 'spendingAmount', operator: 'gt', value: 10000 }
        ],
        effect: 'require_approval',
        priority: 2,
        metadata: {
          reason: 'Large payments outside business hours require approval',
          approver: 'admin',
          timeout: 120
        }
      },

      // Geofencing policy
      {
        id: 'geo-restriction',
        name: 'Geographic Restriction',
        action: '*',
        conditions: [
          { field: 'geofence', operator: 'ne', value: 'nepal' },
          { field: 'userRole', operator: 'in', value: [UserRole.CUSTOMER, UserRole.PROVIDER] }
        ],
        effect: 'deny',
        priority: 1,
        metadata: {
          reason: 'Operations restricted to Nepal geography for compliance'
        }
      }
    ];

    // Group policies by action pattern
    defaultPolicies.forEach(policy => {
      const actionKey = policy.action.includes('*') ? policy.action : 'specific';
      const existing = this.rules.get(actionKey) || [];
      existing.push(policy);
      this.rules.set(actionKey, existing);
    });

    logger.info(`Loaded ${defaultPolicies.length} default policies`);
  }

  /**
   * Add or update a policy rule
   */
  addPolicy(rule: PolicyRule) {
    const actionKey = rule.action.includes('*') ? rule.action : 'specific';
    const existing = this.rules.get(actionKey) || [];
    
    // Remove existing rule with same ID
    const filtered = existing.filter(r => r.id !== rule.id);
    filtered.push(rule);
    
    // Sort by priority (lower number = higher priority)
    filtered.sort((a, b) => a.priority - b.priority);
    
    this.rules.set(actionKey, filtered);
    logger.info(`Added/updated policy: ${rule.id}`);
  }

  /**
   * Remove a policy rule
   */
  removePolicy(policyId: string) {
    for (const [actionKey, rules] of this.rules.entries()) {
      const filtered = rules.filter(r => r.id !== policyId);
      if (filtered.length !== rules.length) {
        this.rules.set(actionKey, filtered);
        logger.info(`Removed policy: ${policyId}`);
        return true;
      }
    }
    return false;
  }

  /**
   * Evaluate policies for a skill execution request
   */
  async evaluate(
    skill: AISkill,
    context: ExecutionContext,
    input: any
  ): Promise<{
    allowed: boolean;
    requiresApproval: boolean;
    workflowId?: string;
    reason?: string;
    violatedPolicies?: string[];
  }> {
    const applicableRules = this.getApplicableRules(skill.id);
    const violatedPolicies: string[] = [];
    let requiresApproval = false;
    let approvalReason = '';

    // Create evaluation context with computed fields
    const evalContext = {
      ...context,
      skill,
      input,
      spendingAmount: this.calculateSpendingAmount(skill, input),
      currentHour: new Date().getHours(),
      rateLimitExceeded: await this.checkRateLimit(context, skill)
    };

    // Evaluate each rule in priority order
    for (const rule of applicableRules) {
      const matches = this.evaluateConditions(rule.conditions, evalContext);
      
      if (matches) {
        logger.debug(`Policy ${rule.id} matched for skill ${skill.id}`);
        
        switch (rule.effect) {
          case 'deny':
            violatedPolicies.push(rule.id);
            throw new PolicyViolationError(
              rule.metadata.reason,
              rule.id,
              'DENIAL',
              skill.id,
              context
            );

          case 'require_approval':
            requiresApproval = true;
            approvalReason = rule.metadata.reason;
            
            // Create approval workflow
            const workflowId = await this.createApprovalWorkflow(
              skill,
              context,
              input,
              rule
            );
            
            return {
              allowed: false,
              requiresApproval: true,
              workflowId,
              reason: approvalReason
            };

          case 'allow':
            // Explicit allow - skip remaining rules
            return {
              allowed: true,
              requiresApproval: false
            };
        }
      }
    }

    // If no rules matched or all were allows
    return {
      allowed: true,
      requiresApproval: false
    };
  }

  /**
   * Get all applicable rules for an action
   */
  private getApplicableRules(action: string): PolicyRule[] {
    const rules: PolicyRule[] = [];
    
    // Add wildcard rules
    for (const [pattern, patternRules] of this.rules.entries()) {
      if (pattern === '*' || this.matchesPattern(action, pattern)) {
        rules.push(...patternRules);
      }
    }
    
    // Add specific rules
    const specificRules = this.rules.get(action) || [];
    rules.push(...specificRules);
    
    // Sort by priority
    return rules.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Check if action matches pattern
   */
  private matchesPattern(action: string, pattern: string): boolean {
    if (pattern === '*') return true;
    
    const regex = new RegExp(
      pattern.replace(/\*/g, '.*').replace(/\?/g, '.'),
      'i'
    );
    
    return regex.test(action);
  }

  /**
   * Evaluate policy conditions against context
   */
  private evaluateConditions(
    conditions: PolicyRule['conditions'],
    context: any
  ): boolean {
    return conditions.every(condition => {
      const value = this.getNestedValue(context, condition.field);
      return this.evaluateCondition(value, condition.operator, condition.value);
    });
  }

  /**
   * Get nested value from context using dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Evaluate individual condition
   */
  private evaluateCondition(
    contextValue: any,
    operator: string,
    policyValue: any
  ): boolean {
    switch (operator) {
      case 'eq':
        return contextValue === policyValue;
      case 'ne':
        return contextValue !== policyValue;
      case 'gt':
        return contextValue > policyValue;
      case 'lt':
        return contextValue < policyValue;
      case 'gte':
        return contextValue >= policyValue;
      case 'lte':
        return contextValue <= policyValue;
      case 'in':
        return Array.isArray(policyValue) && policyValue.includes(contextValue);
      case 'not_in':
        return Array.isArray(policyValue) && !policyValue.includes(contextValue);
      case 'contains':
        return typeof contextValue === 'string' && contextValue.includes(policyValue);
      case 'regex':
        return new RegExp(policyValue, 'i').test(contextValue);
      default:
        logger.warn(`Unknown operator: ${operator}`);
        return false;
    }
  }

  /**
   * Calculate spending amount for the request
   */
  private calculateSpendingAmount(skill: AISkill, input: any): number {
    // Base cost from skill
    let amount = skill.spendingCost || 0;
    
    // Add dynamic costs based on input
    if (input?.amount) amount += input.amount;
    if (input?.serviceValue) amount += input.serviceValue;
    if (input?.hours) amount += (input.hours * (skill.spendingCost || 0));
    
    return amount;
  }

  /**
   * Check rate limit status (placeholder - would integrate with rate limiter)
   */
  private async checkRateLimit(
    context: ExecutionContext,
    skill: AISkill
  ): Promise<boolean> {
    // This would integrate with the existing rate limiting system
    // For now, return false (no rate limit exceeded)
    return false;
  }

  /**
   * Create approval workflow
   */
  private async createApprovalWorkflow(
    skill: AISkill,
    context: ExecutionContext,
    input: any,
    rule: PolicyRule
  ): Promise<string> {
    const workflowId = uuidv4();
    const now = new Date();
    const timeout = rule.metadata.timeout || 60;
    
    const workflow: ApprovalWorkflow = {
      workflowId,
      initiator: context.userId,
      skillId: skill.id,
      requestDetails: {
        action: skill.id,
        input,
        context,
        riskScore: this.calculateRiskScore(skill, context, input)
      },
      steps: [{
        stepId: uuidv4(),
        approverRole: rule.metadata.approver || 'admin',
        timeoutMinutes: timeout,
        status: 'waiting'
      }],
      currentStep: 0,
      status: 'pending',
      timeline: {
        initiated: now,
        deadline: new Date(now.getTime() + timeout * 60 * 1000)
      },
      metadata: {
        policyId: rule.id,
        reason: rule.metadata.reason
      }
    };
    
    this.approvalQueue.set(workflowId, workflow);
    
    // Here you would integrate with notification system to alert approvers
    logger.info(`Created approval workflow ${workflowId} for skill ${skill.id}`);
    
    return workflowId;
  }

  /**
   * Calculate risk score for a request
   */
  private calculateRiskScore(
    skill: AISkill,
    context: ExecutionContext,
    input: any
  ): number {
    let score = 0;
    
    // Base risk from skill properties
    if (skill.destructive) score += 0.3;
    if (skill.requiredPermissionLevel === PermissionLevel.ACT_FULL) score += 0.2;
    if (skill.spendingCost > 10000) score += 0.2;
    
    // Context-based risk
    if (context.userRole === UserRole.CUSTOMER) score += 0.1;
    if (context.geofence !== 'nepal') score += 0.2;
    
    // Input-based risk
    if (input?.amount && input.amount > 50000) score += 0.3;
    
    return Math.min(score, 1.0);
  }

  /**
   * Get approval workflow status
   */
  getApprovalStatus(workflowId: string): ApprovalWorkflow | null {
    return this.approvalQueue.get(workflowId) || null;
  }

  /**
   * Process approval response
   */
  async processApproval(
    workflowId: string,
    stepId: string,
    approved: boolean,
    approver: string,
    rationale?: string
  ): Promise<{ completed: boolean; approved: boolean }> {
    const workflow = this.approvalQueue.get(workflowId);
    if (!workflow) {
      throw new Error(`Approval workflow ${workflowId} not found`);
    }

    const step = workflow.steps[workflow.currentStep];
    if (!step || step.stepId !== stepId) {
      throw new Error(`Invalid step ${stepId} for workflow ${workflowId}`);
    }

    // Update step
    step.status = approved ? 'approved' : 'rejected';
    step.completedAt = new Date();
    step.rationale = rationale;
    step.approverUser = approver;

    if (!approved) {
      // Rejection completes the workflow
      workflow.status = 'rejected';
      workflow.timeline.completed = new Date();
      
      logger.info(`Approval workflow ${workflowId} rejected by ${approver}`);
      return { completed: true, approved: false };
    }

    // Check if more steps needed
    if (workflow.currentStep < workflow.steps.length - 1) {
      workflow.currentStep++;
      logger.info(`Approval workflow ${workflowId} advanced to step ${workflow.currentStep}`);
      return { completed: false, approved: true };
    }

    // All steps completed and approved
    workflow.status = 'approved';
    workflow.timeline.completed = new Date();
    
    logger.info(`Approval workflow ${workflowId} fully approved`);
    return { completed: true, approved: true };
  }

  /**
   * Clean up expired workflows
   */
  async cleanupExpiredWorkflows(): Promise<number> {
    const now = new Date();
    let cleaned = 0;
    
    for (const [workflowId, workflow] of this.approvalQueue.entries()) {
      if (workflow.timeline.deadline < now && workflow.status === 'pending') {
        workflow.status = 'expired';
        workflow.timeline.completed = now;
        
        // Mark current step as expired
        const currentStep = workflow.steps[workflow.currentStep];
        if (currentStep) {
          currentStep.status = 'expired';
        }
        
        logger.info(`Approval workflow ${workflowId} expired`);
        cleaned++;
      }
    }
    
    return cleaned;
  }

  /**
   * Get policy statistics
   */
  getStatistics(): {
    totalPolicies: number;
    policiesByEffect: Record<string, number>;
    activeWorkflows: number;
    expiredWorkflows: number;
  } {
    let totalPolicies = 0;
    const policiesByEffect: Record<string, number> = {};
    
    for (const rules of this.rules.values()) {
      totalPolicies += rules.length;
      for (const rule of rules) {
        policiesByEffect[rule.effect] = (policiesByEffect[rule.effect] || 0) + 1;
      }
    }
    
    let activeWorkflows = 0;
    let expiredWorkflows = 0;
    
    for (const workflow of this.approvalQueue.values()) {
      if (workflow.status === 'pending') activeWorkflows++;
      if (workflow.status === 'expired') expiredWorkflows++;
    }
    
    return {
      totalPolicies,
      policiesByEffect,
      activeWorkflows,
      expiredWorkflows
    };
  }
}

// Singleton instance
export const policyEngine = new PolicyEngine();