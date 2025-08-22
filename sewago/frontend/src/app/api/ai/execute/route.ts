import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rate-limit-adapters';
import { ratePolicies } from '@/lib/rate-policies';
import { getIdentifier } from '@/lib/request-identity';
import { auditLogger } from '@/lib/audit-logger';
import { UserRole, PermissionLevel, AutonomyLevel, SkillCategory } from '@/types/ai-core';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Request/Response schemas
const ExecuteRequestSchema = z.object({
  skillId: z.string().uuid(),
  input: z.any(),
  context: z.object({
    userId: z.string(),
    userRole: z.nativeEnum(UserRole).optional().default(UserRole.CUSTOMER),
    sessionId: z.string(),
    autonomyLevel: z.nativeEnum(AutonomyLevel).optional().default(AutonomyLevel.SUGGEST),
    geofence: z.enum(['nepal', 'global']).optional().default('nepal'),
    metadata: z.record(z.any()).optional()
  }),
  platform: z.enum(['web', 'mobile', 'api']).default('web'),
  options: z.object({
    sync: z.boolean().default(true),
    timeout: z.number().optional(),
    priority: z.number().optional()
  }).optional()
});

const ExecuteResponseSchema = z.object({
  success: z.boolean(),
  result: z.any().optional(),
  error: z.string().optional(),
  jobId: z.string().optional(),
  approvalRequired: z.boolean().optional(),
  workflowId: z.string().optional(),
  metadata: z.object({
    executionTime: z.number(),
    cached: z.boolean().optional(),
    rollbackId: z.string().optional(),
    auditTrail: z.array(z.object({
      timestamp: z.date(),
      event: z.string(),
      details: z.any()
    }))
  })
});

type ExecuteRequest = z.infer<typeof ExecuteRequestSchema>;
type ExecuteResponse = z.infer<typeof ExecuteResponseSchema>;

// Lazy load AI core (to avoid startup issues)
let aiCoreInstance: any = null;

async function getAICore() {
  if (!aiCoreInstance) {
    try {
      // Skip AI core in build phase
      if (process.env.NEXT_PHASE === 'phase-production-build') {
        throw new Error('AI Core not available during build');
      }
      
      // Dynamic import to prevent build-time issues
      // Note: @sewago/ai-core package not available in current build
      throw new Error('AI Core package not installed');
      
      // Initialize if not already done
      if (!aiCore.initialized) {
        await aiCore.initialize({
          logLevel: process.env.AI_LOG_LEVEL || 'info',
          disableSkills: (process.env.AI_DISABLED_SKILLS || '').split(',').filter(Boolean)
        });
      }
      
      aiCoreInstance = aiCore;
    } catch (error) {
      console.error('Failed to load AI Core:', error);
      throw new Error('AI service unavailable');
    }
  }
  return aiCoreInstance;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // 1. Rate limiting
    const identifier = getIdentifier(request);
    const rateLimitResult = await checkRateLimit(identifier, ratePolicies.aiExecute);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          success: false,
          error: 'AI execution rate limit exceeded',
          retryAfter: rateLimitResult.retryAfter 
        },
        { 
          status: 429,
          headers: rateLimitResult.headers
        }
      );
    }

    // 2. Parse and validate request
    const body = await request.json();
    let validatedRequest: ExecuteRequest;
    
    try {
      validatedRequest = ExecuteRequestSchema.parse(body);
    } catch (validationError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request format',
        details: validationError instanceof Error ? validationError.message : 'Validation failed'
      }, { status: 400 });
    }

    // 3. Audit log the request
    auditLogger.info('ai_execution_request', {
      skillId: validatedRequest.skillId,
      userId: validatedRequest.context.userId,
      platform: validatedRequest.platform,
      timestamp: new Date().toISOString(),
      ipAddress: request.ip,
      userAgent: request.headers.get('user-agent')
    });

    // 4. Get AI Core instance
    const aiCore = await getAICore();

    // 5. Prepare execution context
    const executionContext = {
      userId: validatedRequest.context.userId,
      userRole: validatedRequest.context.userRole,
      sessionId: validatedRequest.context.sessionId,
      transactionId: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      autonomyLevel: validatedRequest.context.autonomyLevel,
      geofence: validatedRequest.context.geofence,
      spendingLimit: getSpendingLimit(validatedRequest.context.userRole),
      rateLimits: await getRateLimits(validatedRequest.context.userId, validatedRequest.context.userRole),
      timestamp: new Date(),
      metadata: {
        ...validatedRequest.context.metadata,
        platform: validatedRequest.platform,
        sync: validatedRequest.options?.sync ?? true,
        requestId: `req-${Date.now()}`
      }
    };

    // 6. Execute the skill
    const result = await aiCore.executeSkill(
      validatedRequest.skillId,
      validatedRequest.input,
      executionContext
    );

    // 7. Prepare response
    const executionTime = Date.now() - startTime;
    const response: ExecuteResponse = {
      success: result.success,
      result: result.result,
      error: result.error,
      jobId: result.result?.jobId,
      approvalRequired: result.error?.includes('approval'),
      workflowId: result.result?.workflowId,
      metadata: {
        executionTime,
        cached: result.metadata?.cached,
        rollbackId: result.metadata?.rollbackId,
        auditTrail: result.metadata?.auditTrail || []
      }
    };

    // 8. Audit log the response
    auditLogger.info('ai_execution_response', {
      skillId: validatedRequest.skillId,
      userId: validatedRequest.context.userId,
      success: result.success,
      executionTime,
      timestamp: new Date().toISOString()
    });

    // 9. Return response with rate limit headers
    const nextResponse = NextResponse.json(response);
    Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
      nextResponse.headers.set(key, value);
    });

    return nextResponse;

  } catch (error) {
    const executionTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Log error
    console.error('AI execution error:', error);
    auditLogger.error('ai_execution_error', {
      error: errorMessage,
      executionTime,
      timestamp: new Date().toISOString()
    });

    // Determine error response based on error type
    if (errorMessage.includes('Policy violation') || errorMessage.includes('POLICY_VIOLATION')) {
      return NextResponse.json({
        success: false,
        error: 'Operation not permitted by security policy',
        metadata: {
          executionTime,
          auditTrail: [{
            timestamp: new Date(),
            event: 'policy_violation',
            details: { error: errorMessage }
          }]
        }
      }, { status: 403 });
    }

    if (errorMessage.includes('Approval required') || errorMessage.includes('APPROVAL_REQUIRED')) {
      return NextResponse.json({
        success: false,
        error: 'Operation requires approval',
        approvalRequired: true,
        metadata: {
          executionTime,
          auditTrail: [{
            timestamp: new Date(),
            event: 'approval_required',
            details: { error: errorMessage }
          }]
        }
      }, { status: 202 });
    }

    if (errorMessage.includes('Rate limit') || errorMessage.includes('RATE_LIMIT')) {
      return NextResponse.json({
        success: false,
        error: 'Rate limit exceeded',
        metadata: {
          executionTime,
          auditTrail: [{
            timestamp: new Date(),
            event: 'rate_limit_exceeded',
            details: { error: errorMessage }
          }]
        }
      }, { status: 429 });
    }

    // Generic error response
    return NextResponse.json({
      success: false,
      error: process.env.NODE_ENV === 'production' ? 'Internal server error' : errorMessage,
      metadata: {
        executionTime,
        auditTrail: [{
          timestamp: new Date(),
          event: 'execution_error',
          details: { error: errorMessage }
        }]
      }
    }, { status: 500 });
  }
}

// Health check endpoint
export async function GET(request: NextRequest) {
  try {
    const aiCore = await getAICore();
    const health = await aiCore.getHealth();
    
    return NextResponse.json(health, {
      status: health.status === 'healthy' ? 200 : 503
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Service unavailable',
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
}

// Helper functions
function getSpendingLimit(userRole: UserRole): number {
  const limits: Record<UserRole, number> = {
    [UserRole.CUSTOMER]: 5000,    // NPR 5,000
    [UserRole.PROVIDER]: 20000,   // NPR 20,000
    [UserRole.ADMIN]: 100000,     // NPR 100,000
    [UserRole.SUPER_ADMIN]: 500000, // NPR 500,000
    [UserRole.SYSTEM]: 1000000    // NPR 1,000,000
  };
  
  return limits[userRole] || limits[UserRole.CUSTOMER];
}

async function getRateLimits(userId: string, userRole: UserRole): Promise<any[]> {
  const baseLimits: Record<UserRole, any[]> = {
    [UserRole.CUSTOMER]: [
      { resource: 'ai_requests', limit: 60, window: 3600000 }, // 60/hour
      { resource: 'skill_executions', limit: 30, window: 3600000 } // 30/hour
    ],
    [UserRole.PROVIDER]: [
      { resource: 'ai_requests', limit: 120, window: 3600000 }, // 120/hour
      { resource: 'skill_executions', limit: 80, window: 3600000 } // 80/hour
    ],
    [UserRole.ADMIN]: [
      { resource: 'ai_requests', limit: 500, window: 3600000 }, // 500/hour
      { resource: 'skill_executions', limit: 300, window: 3600000 } // 300/hour
    ],
    [UserRole.SUPER_ADMIN]: [
      { resource: 'ai_requests', limit: 1000, window: 3600000 }, // 1000/hour
      { resource: 'skill_executions', limit: 500, window: 3600000 } // 500/hour
    ],
    [UserRole.SYSTEM]: [
      { resource: 'ai_requests', limit: 10000, window: 3600000 }, // 10000/hour
      { resource: 'skill_executions', limit: 5000, window: 3600000 } // 5000/hour
    ]
  };
  
  return baseLimits[userRole] || baseLimits[UserRole.CUSTOMER];
}