import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { AICore } from '../index';
import { SkillSDK } from '../skills/sdk';
import { policyEngine } from '../policies/engine';
import {
  UserRole,
  PermissionLevel,
  SkillCategory,
  AutonomyLevel,
  ExecutionContext,
  PolicyRule
} from '../types/core';
import { z } from 'zod';

describe('AI Core Integration Tests', () => {
  let aiCore: AICore;
  let testSkillId: string;
  
  beforeAll(async () => {
    aiCore = new AICore();
    await aiCore.initialize({
      logLevel: 'error', // Reduce noise in tests
      disableSkills: [] // Enable all skills for testing
    });
  });

  afterAll(async () => {
    await aiCore.shutdown();
  });

  beforeEach(() => {
    // Register a test skill for each test
    testSkillId = SkillSDK.createSkill()
      .name('Test Skill')
      .description('A skill for testing purposes')
      .category(SkillCategory.CUSTOMER)
      .permissions(['test:read', 'test:execute'])
      .permissionLevel(PermissionLevel.ACT_LOW)
      .spendingCost(10)
      .inputSchema(z.object({
        message: z.string(),
        value: z.number().optional()
      }))
      .outputSchema(z.object({
        result: z.string(),
        processed: z.boolean()
      }))
      .execute(async (input, context) => {
        return {
          result: `Processed: ${input.message}`,
          processed: true
        };
      })
      .register();
  });

  describe('Basic Skill Execution', () => {
    it('should execute a skill successfully', async () => {
      const context: ExecutionContext = {
        userId: 'test-user-123',
        userRole: UserRole.CUSTOMER,
        sessionId: 'sess-123',
        transactionId: 'tx-123',
        autonomyLevel: AutonomyLevel.ACT_LOW,
        geofence: 'nepal',
        spendingLimit: 5000,
        rateLimits: [],
        timestamp: new Date()
      };

      const result = await aiCore.executeSkill(testSkillId, {
        message: 'Hello World',
        value: 42
      }, context);

      expect(result.success).toBe(true);
      expect(result.result).toEqual({
        result: 'Processed: Hello World',
        processed: true
      });
      expect(result.metadata.executionTime).toBeGreaterThan(0);
    });

    it('should validate input schema', async () => {
      const context: ExecutionContext = {
        userId: 'test-user-123',
        userRole: UserRole.CUSTOMER,
        sessionId: 'sess-123',
        transactionId: 'tx-123',
        autonomyLevel: AutonomyLevel.ACT_LOW,
        geofence: 'nepal',
        spendingLimit: 5000,
        rateLimits: [],
        timestamp: new Date()
      };

      const result = await aiCore.executeSkill(testSkillId, {
        // Missing required 'message' field
        value: 42
      }, context);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Input validation failed');
    });
  });

  describe('Policy Engine Integration', () => {
    it('should enforce permission-based policies', async () => {
      // Create a skill that requires ADMIN permission
      const adminSkillId = SkillSDK.createSkill()
        .name('Admin Only Skill')
        .description('A skill that requires admin permissions')
        .category(SkillCategory.ADMIN)
        .permissionLevel(PermissionLevel.ACT_FULL)
        .destructive() // Mark as destructive
        .execute(async (input, context) => ({ result: 'Admin operation complete' }))
        .register();

      const customerContext: ExecutionContext = {
        userId: 'customer-123',
        userRole: UserRole.CUSTOMER,
        sessionId: 'sess-123',
        transactionId: 'tx-123',
        autonomyLevel: AutonomyLevel.ACT_LOW,
        geofence: 'nepal',
        spendingLimit: 5000,
        rateLimits: [],
        timestamp: new Date()
      };

      const result = await aiCore.executeSkill(adminSkillId, {}, customerContext);

      expect(result.success).toBe(false);
      expect(result.error).toContain('not permitted');
    });

    it('should require approval for high-cost operations', async () => {
      // Create a high-cost skill
      const expensiveSkillId = SkillSDK.createSkill()
        .name('Expensive Skill')
        .description('A skill with high cost')
        .category(SkillCategory.CUSTOMER)
        .spendingCost(100000) // High cost to trigger approval
        .execute(async (input, context) => ({ result: 'Expensive operation' }))
        .register();

      const context: ExecutionContext = {
        userId: 'test-user-123',
        userRole: UserRole.CUSTOMER,
        sessionId: 'sess-123',
        transactionId: 'tx-123',
        autonomyLevel: AutonomyLevel.ACT_LOW,
        geofence: 'nepal',
        spendingLimit: 5000,
        rateLimits: [],
        timestamp: new Date()
      };

      const result = await aiCore.executeSkill(expensiveSkillId, {}, context);

      expect(result.success).toBe(false);
      expect(result.error).toContain('approval');
    });

    it('should enforce geofencing policies', async () => {
      const context: ExecutionContext = {
        userId: 'test-user-123',
        userRole: UserRole.CUSTOMER,
        sessionId: 'sess-123',
        transactionId: 'tx-123',
        autonomyLevel: AutonomyLevel.ACT_LOW,
        geofence: 'global', // Outside Nepal
        spendingLimit: 5000,
        rateLimits: [],
        timestamp: new Date()
      };

      const result = await aiCore.executeSkill(testSkillId, {
        message: 'Test from outside Nepal'
      }, context);

      expect(result.success).toBe(false);
      expect(result.error).toContain('restricted to Nepal');
    });
  });

  describe('Error Handling', () => {
    it('should handle skill execution errors gracefully', async () => {
      const errorSkillId = SkillSDK.createSkill()
        .name('Error Skill')
        .description('A skill that always throws an error')
        .category(SkillCategory.CUSTOMER)
        .execute(async (input, context) => {
          throw new Error('Intentional test error');
        })
        .register();

      const context: ExecutionContext = {
        userId: 'test-user-123',
        userRole: UserRole.CUSTOMER,
        sessionId: 'sess-123',
        transactionId: 'tx-123',
        autonomyLevel: AutonomyLevel.ACT_LOW,
        geofence: 'nepal',
        spendingLimit: 5000,
        rateLimits: [],
        timestamp: new Date()
      };

      const result = await aiCore.executeSkill(errorSkillId, {}, context);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Intentional test error');
      expect(result.metadata.auditTrail).toBeDefined();
    });

    it('should handle timeout errors', async () => {
      const slowSkillId = SkillSDK.createSkill()
        .name('Slow Skill')
        .description('A skill that takes too long')
        .category(SkillCategory.CUSTOMER)
        .timeout(1000) // 1 second timeout
        .execute(async (input, context) => {
          // Simulate slow operation
          await new Promise(resolve => setTimeout(resolve, 2000));
          return { result: 'Should not reach here' };
        })
        .register();

      const context: ExecutionContext = {
        userId: 'test-user-123',
        userRole: UserRole.CUSTOMER,
        sessionId: 'sess-123',
        transactionId: 'tx-123',
        autonomyLevel: AutonomyLevel.ACT_LOW,
        geofence: 'nepal',
        spendingLimit: 5000,
        rateLimits: [],
        timestamp: new Date()
      };

      const result = await aiCore.executeSkill(slowSkillId, {}, context);

      expect(result.success).toBe(false);
      expect(result.error).toContain('timeout');
    });
  });

  describe('Approval Workflow', () => {
    it('should create approval workflow for restricted operations', async () => {
      // Add a custom policy that requires approval
      const customPolicy: PolicyRule = {
        id: 'test-approval-policy',
        name: 'Test Approval Policy',
        action: testSkillId,
        conditions: [
          { field: 'input.message', operator: 'contains', value: 'approval' }
        ],
        effect: 'require_approval',
        priority: 1,
        metadata: {
          reason: 'Message contains approval keyword',
          approver: 'admin',
          timeout: 30
        }
      };

      policyEngine.addPolicy(customPolicy);

      const context: ExecutionContext = {
        userId: 'test-user-123',
        userRole: UserRole.CUSTOMER,
        sessionId: 'sess-123',
        transactionId: 'tx-123',
        autonomyLevel: AutonomyLevel.ACT_LOW,
        geofence: 'nepal',
        spendingLimit: 5000,
        rateLimits: [],
        timestamp: new Date()
      };

      const result = await aiCore.executeSkill(testSkillId, {
        message: 'This message needs approval'
      }, context);

      expect(result.success).toBe(false);
      expect(result.error).toContain('approval');
      
      // Clean up
      policyEngine.removePolicy(customPolicy.id);
    });
  });

  describe('Metrics and Monitoring', () => {
    it('should collect execution metrics', async () => {
      const context: ExecutionContext = {
        userId: 'test-user-123',
        userRole: UserRole.CUSTOMER,
        sessionId: 'sess-123',
        transactionId: 'tx-123',
        autonomyLevel: AutonomyLevel.ACT_LOW,
        geofence: 'nepal',
        spendingLimit: 5000,
        rateLimits: [],
        timestamp: new Date()
      };

      const result = await aiCore.executeSkill(testSkillId, {
        message: 'Metrics test'
      }, context);

      expect(result.success).toBe(true);
      expect(result.metadata).toBeDefined();
      expect(result.metadata.executionTime).toBeGreaterThan(0);
      expect(result.metadata.auditTrail).toBeDefined();
      expect(result.metadata.auditTrail.length).toBeGreaterThan(0);
    });

    it('should provide system statistics', async () => {
      const stats = await aiCore.getStatistics();

      expect(stats.system.initialized).toBe(true);
      expect(stats.execution.registeredSkills).toBeGreaterThan(0);
      expect(stats.policies.totalPolicies).toBeGreaterThan(0);
      expect(stats.skills.registered).toBeGreaterThan(0);
    });

    it('should provide health check information', async () => {
      const health = await aiCore.getHealth();

      expect(health.status).toBe('healthy');
      expect(health.checks.initialization).toBe(true);
      expect(health.checks.executionKernel).toBe(true);
      expect(health.checks.policyEngine).toBe(true);
    });
  });

  describe('Booking Assistant Skill', () => {
    it('should provide booking recommendations', async () => {
      // This would test the actual booking assistant skill
      // For now, we'll test that the skill is registered
      const stats = await aiCore.getStatistics();
      expect(stats.skills.registered).toBeGreaterThan(0);
    });
  });

  describe('Performance Tests', () => {
    it('should handle concurrent executions', async () => {
      const context: ExecutionContext = {
        userId: 'test-user-123',
        userRole: UserRole.CUSTOMER,
        sessionId: 'sess-123',
        transactionId: 'tx-123',
        autonomyLevel: AutonomyLevel.ACT_LOW,
        geofence: 'nepal',
        spendingLimit: 5000,
        rateLimits: [],
        timestamp: new Date()
      };

      const promises = Array.from({ length: 10 }, (_, i) =>
        aiCore.executeSkill(testSkillId, {
          message: `Concurrent test ${i}`
        }, {
          ...context,
          transactionId: `tx-123-${i}`
        })
      );

      const results = await Promise.all(promises);

      results.forEach((result, i) => {
        expect(result.success).toBe(true);
        expect(result.result.result).toBe(`Processed: Concurrent test ${i}`);
      });
    });

    it('should complete executions within reasonable time', async () => {
      const context: ExecutionContext = {
        userId: 'test-user-123',
        userRole: UserRole.CUSTOMER,
        sessionId: 'sess-123',
        transactionId: 'tx-123',
        autonomyLevel: AutonomyLevel.ACT_LOW,
        geofence: 'nepal',
        spendingLimit: 5000,
        rateLimits: [],
        timestamp: new Date()
      };

      const startTime = Date.now();
      const result = await aiCore.executeSkill(testSkillId, {
        message: 'Performance test'
      }, context);
      const endTime = Date.now();

      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});