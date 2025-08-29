# SewaGo AI Architecture

## 🎯 Vision Statement

SewaGo's in-built AI system provides autonomous customer operations, provider assistance, and administrative automation while maintaining strict safety boundaries and human oversight. The AI operates across web and mobile platforms through a unified skills-based architecture.

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    SewaGo AI Platform                       │
├─────────────────────┬─────────────────┬─────────────────────┤
│   Web Frontend      │  Mobile Apps    │   Admin Dashboard   │
│   (Next.js)         │  (React Native) │   (Next.js)         │
└─────────────────────┴─────────────────┴─────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │   AI Gateway      │
                    │  (Authentication, │
                    │   Rate Limiting,  │
                    │   Request Router) │
                    └─────────┬─────────┘
                              │
┌─────────────────────────────┼─────────────────────────────┐
│                 AI Core Engine                            │
├─────────────────┬───────────┼───────────┬─────────────────┤
│  Policy Engine  │  Skills   │ Execution │  Memory Store   │
│  - Permissions  │ Registry  │  Kernel   │  - Session      │
│  - Rate Limits  │ - Customer│  - Jobs   │  - Long-term    │
│  - Approval     │ - Provider│  - Saga   │  - Vector DB    │
│    Matrix       │ - Admin   │  - Retry  │  - PII Masked   │
└─────────────────┴───────────┴───────────┴─────────────────┘
                              │
┌─────────────────────────────┼─────────────────────────────┐
│              Infrastructure Layer                         │
├─────────────────┬───────────┼───────────┬─────────────────┤
│    Database     │   Queue   │  Cache    │   Monitoring    │
│   (MongoDB)     │ (BullMQ)  │ (Redis)   │  (Telemetry)    │
│   - Bookings    │ - Jobs    │ - Session │  - Metrics      │
│   - Users       │ - Events  │ - State   │  - Logs         │
│   - Services    │ - Retries │ - Cache   │  - Alerts       │
└─────────────────┴───────────┴───────────┴─────────────────┘
                              │
┌─────────────────────────────┼─────────────────────────────┐
│              External Integrations                        │
├─────────────────┬───────────┼───────────┬─────────────────┤
│   AI Models     │ Payments  │ Messaging │   Monitoring    │
│  - OpenAI GPT   │ - eSewa   │ - SMS     │  - Sentry       │
│  - Claude       │ - Khalti  │ - Email   │  - DataDog      │
│  - Local LLM    │ - Bank    │ - Push    │  - Slack        │
└─────────────────┴───────────┴───────────┴─────────────────┘
```

## 🧠 AI Core Components

### 1. Skills Registry
**Purpose**: Modular AI capabilities with standardized interfaces

```typescript
interface AISkill {
  id: string;
  name: string;
  description: string;
  category: 'customer' | 'provider' | 'admin' | 'content';
  permissions: Permission[];
  rateLimit: RateLimit;
  schema: {
    input: ZodSchema;
    output: ZodSchema;
  };
  execute: (input: any, context: ExecutionContext) => Promise<any>;
  rollback?: (transactionId: string) => Promise<void>;
}
```

### 2. Policy Engine
**Purpose**: Enforce governance, permissions, and safety boundaries

```typescript
interface PolicyRule {
  action: string;
  conditions: Condition[];
  effect: 'allow' | 'deny' | 'require_approval';
  priority: number;
  metadata: {
    reason: string;
    approver?: 'admin' | 'provider' | 'system';
    timeout?: number;
  };
}
```

### 3. Execution Kernel
**Purpose**: Job orchestration, error handling, and recovery

```typescript
interface ExecutionContext {
  userId: string;
  userRole: 'customer' | 'provider' | 'admin';
  sessionId: string;
  transactionId: string;
  autonomyLevel: 'read' | 'suggest' | 'act_low' | 'act_full';
  geofence: 'nepal' | 'global';
  spendingLimit: number;
  rateLimits: RateLimit[];
}
```

### 4. Memory Store
**Purpose**: Context retention and learning with PII protection

```typescript
interface AIMemory {
  shortTerm: {
    sessionId: string;
    conversation: Message[];
    context: Record<string, any>;
    ttl: number;
  };
  longTerm: {
    userId: string;
    preferences: UserPreferences;
    history: InteractionSummary[];
    embeddings: Vector[];
    piiMasked: boolean;
  };
}
```

## 🌐 Multi-Platform Integration

### Web Platform (Next.js)
- **AI Chat Widget**: Embedded assistant with conversation memory
- **Smart Forms**: Auto-completion and validation assistance
- **Dynamic Content**: Personalized recommendations and pricing
- **Admin Tools**: Autonomous moderation and analytics

### Mobile Platform (React Native)
- **Voice Assistant**: Speech-to-text booking assistance
- **Offline Capabilities**: Cached responses and local processing
- **Push Intelligence**: Smart notifications and reminders
- **Location Context**: GPS-aware service recommendations

### Unified API Layer
```typescript
// Common interface for all platforms
POST /api/ai/execute
{
  skillId: string;
  input: any;
  context: ExecutionContext;
  platform: 'web' | 'mobile' | 'api';
}

// Event-driven updates
POST /api/ai/events
{
  eventType: string;
  payload: any;
  platform: string;
  timestamp: number;
}
```

## 🔄 Data Flow Architecture

### 1. Request Processing Flow
```
User Input → Authentication → Policy Check → Skill Selection → 
Execution → Validation → Response → Audit Log
```

### 2. Event-Driven Processing
```
External Event → Event Router → Skill Trigger → 
Policy Validation → Async Execution → Status Update → Notification
```

### 3. Multi-Step Operations (Saga Pattern)
```
Initiate → Step 1 → Compensation Check → Step 2 → 
Compensation Check → Final Step → Commit/Rollback
```

## 🛡️ Safety & Governance Architecture

### Permission Matrix
| Role | Read | Suggest | Act Low | Act Full |
|------|------|---------|---------|----------|
| Customer | ✅ | ✅ | ❌ | ❌ |
| Provider | ✅ | ✅ | ✅* | ❌ |
| Admin | ✅ | ✅ | ✅ | ✅** |

*Provider act_low: Non-destructive actions only  
**Admin act_full: With additional approval gates

### Approval Workflows
```typescript
interface ApprovalFlow {
  automatic: {
    conditions: Condition[];
    maxSpending: number;
    allowedActions: string[];
  };
  reviewRequired: {
    triggers: Trigger[];
    approvers: string[];
    timeout: number;
    escalation: EscalationRule[];
  };
  adminOnly: {
    destructiveOps: boolean;
    paymentConfig: boolean;
    massOperations: boolean;
  };
}
```

## 🔍 Observability Architecture

### Health Monitoring
- **Skill Health**: Individual capability status and performance
- **System Health**: Overall platform availability and response times
- **Model Health**: AI model performance and accuracy metrics
- **Data Health**: Memory store integrity and PII compliance

### Metrics Collection
```typescript
interface AIMetrics {
  performance: {
    skillLatency: Record<string, number>;
    successRate: Record<string, number>;
    errorRate: Record<string, number>;
    queueDepth: number;
  };
  business: {
    conversionRate: number;
    customerSatisfaction: number;
    automationRate: number;
    costSavings: number;
  };
  safety: {
    policyViolations: number;
    promptInjectionBlocked: number;
    rollbacksTriggered: number;
    humanInterventions: number;
  };
}
```

## 🚀 Deployment Architecture

### Environment Tiers
1. **Development**: Full AI capabilities, verbose logging
2. **Staging**: Production-like with test data, canary deployment
3. **Production**: Controlled rollout with circuit breakers

### Feature Flagging
```typescript
interface AIFeatureFlags {
  AI_AUTONOMY_LEVEL: 'read' | 'suggest' | 'act_low' | 'act_full';
  AI_SKILLS_ENABLED: string[];
  AI_MODEL_PRIMARY: 'gpt-4' | 'claude' | 'local';
  AI_MODEL_FALLBACK: string[];
  AI_RATE_LIMITS: RateLimit[];
  AI_GEOFENCE: 'nepal' | 'global';
}
```

### Scaling Strategy
- **Horizontal Scaling**: Multiple AI worker instances with load balancing
- **Model Scaling**: Auto-scaling based on request volume and latency
- **Cache Optimization**: Intelligent caching of common responses
- **Edge Deployment**: Regional deployment for latency optimization

## 🔄 Failure Modes & Recovery

### Circuit Breaker Patterns
```typescript
interface CircuitBreaker {
  skill: string;
  failureThreshold: number;
  recoveryTimeout: number;
  fallbackStrategy: 'human' | 'cached' | 'degraded';
  healthCheck: () => Promise<boolean>;
}
```

### Rollback Strategies
1. **Immediate Rollback**: For critical failures or security violations
2. **Gradual Rollback**: For performance degradation
3. **Compensating Actions**: For partially completed operations
4. **Human Escalation**: For complex failures requiring manual intervention

### Disaster Recovery
- **Database Backup**: Automated backups with point-in-time recovery
- **Model Failover**: Automatic failover to backup models
- **State Recovery**: Session and memory reconstruction
- **Service Degradation**: Graceful degradation to essential functions

## 📱 Mobile-Specific Considerations

### Offline Capabilities
- **Local Model**: Lightweight models for basic operations
- **Cached Responses**: Common queries cached locally
- **Sync Strategy**: Background synchronization when online
- **Conflict Resolution**: Merge conflicts for offline actions

### Platform Integration
- **iOS**: Siri Shortcuts and iOS Automation integration
- **Android**: Google Assistant and Android Intents
- **Cross-Platform**: React Native bridge for native AI features
- **Performance**: Native modules for compute-intensive operations

## 🔐 Security Architecture

### Threat Model
- **Prompt Injection**: Malicious prompts attempting system manipulation
- **Data Poisoning**: Attempts to corrupt training or memory data
- **Model Extraction**: Reverse engineering of AI capabilities
- **Privacy Violation**: Unauthorized access to user data

### Defense Mechanisms
- **Input Sanitization**: Strict validation of all AI inputs
- **Output Filtering**: Content filtering and safety checks
- **Access Control**: Role-based permissions with audit trails
- **Data Encryption**: End-to-end encryption for sensitive data

## 📈 Performance Targets

### Response Time SLAs
- **Simple Queries**: <200ms (95th percentile)
- **Complex Operations**: <2s (95th percentile)
- **Batch Operations**: <30s (95th percentile)
- **Model Inference**: <500ms (99th percentile)

### Availability Targets
- **System Availability**: 99.9% uptime
- **AI Service Availability**: 99.5% uptime
- **Graceful Degradation**: 99.99% (fallback to basic functionality)
- **Recovery Time**: <15 minutes for critical failures

## 🎯 Success Metrics

### Operational Efficiency
- **Automation Rate**: % of operations handled autonomously
- **Response Time**: Average time to resolve customer queries
- **Error Rate**: % of AI decisions requiring human correction
- **Cost Reduction**: Operational cost savings from automation

### Business Impact
- **Customer Satisfaction**: Net Promoter Score improvement
- **Booking Conversion**: Conversion rate improvement
- **Provider Efficiency**: Time saved on routine tasks
- **Revenue Impact**: Revenue generated through AI assistance

---

**Architecture Version**: 1.0  
**Last Updated**: August 21, 2025  
**Next Review**: November 21, 2025  
**Owner**: AI Systems Engineering Team