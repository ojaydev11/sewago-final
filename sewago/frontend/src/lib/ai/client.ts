import { 
  AIExecuteRequest, 
  AIExecuteResponse, 
  AISystemHealth, 
  AISystemStatistics,
  UserRole,
  AutonomyLevel,
  BookingAssistantInput,
  BookingAssistantOutput
} from '@/types/ai-core';

export class AIClient {
  private baseUrl: string;
  private defaultHeaders: HeadersInit;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || '/api/ai';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Execute an AI skill
   */
  async executeSkill<TInput = any, TOutput = any>(
    skillId: string,
    input: TInput,
    options?: {
      userId?: string;
      sessionId?: string;
      userRole?: UserRole;
      autonomyLevel?: AutonomyLevel;
      platform?: 'web' | 'mobile' | 'api';
      sync?: boolean;
      timeout?: number;
    }
  ): Promise<AIExecuteResponse> {
    const request: AIExecuteRequest = {
      skillId,
      input,
      context: {
        userId: options?.userId || 'anonymous',
        sessionId: options?.sessionId || this.generateSessionId(),
        userRole: options?.userRole || UserRole.CUSTOMER,
        autonomyLevel: options?.autonomyLevel || AutonomyLevel.SUGGEST,
        geofence: 'nepal'
      },
      platform: options?.platform || 'web',
      options: {
        sync: options?.sync ?? true,
        timeout: options?.timeout
      }
    };

    const response = await fetch(`${this.baseUrl}/execute`, {
      method: 'POST',
      headers: this.defaultHeaders,
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new AIExecutionError(
        errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        skillId,
        errorData
      );
    }

    return response.json();
  }

  /**
   * Get AI system health status
   */
  async getHealth(): Promise<AISystemHealth> {
    const response = await fetch(`${this.baseUrl}/execute`, {
      method: 'GET',
      headers: this.defaultHeaders
    });

    return response.json();
  }

  /**
   * Specialized method for booking assistance
   */
  async getBookingAssistance(
    input: BookingAssistantInput,
    options?: {
      userId?: string;
      sessionId?: string;
    }
  ): Promise<BookingAssistantOutput> {
    const skillId = 'booking-assistant'; // This would be the registered skill ID
    
    const result = await this.executeSkill<BookingAssistantInput, BookingAssistantOutput>(
      skillId,
      input,
      {
        userId: options?.userId || input.userId,
        sessionId: options?.sessionId || input.sessionId,
        userRole: UserRole.CUSTOMER,
        autonomyLevel: AutonomyLevel.ACT_LOW,
        platform: 'web'
      }
    );

    if (!result.success) {
      throw new Error(result.error || 'Booking assistance failed');
    }

    return result.result;
  }

  /**
   * Enhanced conversation handling with memory
   */
  async continueConversation(
    conversationId: string,
    message: string,
    context?: Record<string, any>,
    options?: {
      userId?: string;
      sessionId?: string;
    }
  ): Promise<{
    response: string;
    actions?: Array<{
      type: string;
      label: string;
      data: any;
    }>;
    context?: Record<string, any>;
  }> {
    const skillId = 'conversation-manager'; // Would need to implement this skill
    
    const result = await this.executeSkill(
      skillId,
      {
        conversationId,
        message,
        context: context || {}
      },
      {
        userId: options?.userId,
        sessionId: options?.sessionId,
        autonomyLevel: AutonomyLevel.ACT_LOW
      }
    );

    return result.result;
  }

  /**
   * Get intelligent search suggestions
   */
  async getSearchSuggestions(
    query: string,
    filters?: {
      serviceType?: string;
      location?: string;
      budget?: { min?: number; max?: number };
    },
    options?: {
      userId?: string;
      sessionId?: string;
    }
  ): Promise<{
    suggestions: Array<{
      text: string;
      type: 'service' | 'provider' | 'location';
      confidence: number;
    }>;
    refinements: Array<{
      field: string;
      suggestions: string[];
    }>;
  }> {
    const skillId = 'smart-search'; // Would need to implement this skill
    
    const result = await this.executeSkill(
      skillId,
      {
        query,
        filters: filters || {}
      },
      {
        userId: options?.userId,
        sessionId: options?.sessionId,
        autonomyLevel: AutonomyLevel.READ
      }
    );

    return result.result;
  }

  /**
   * Get personalized recommendations
   */
  async getPersonalizedRecommendations(
    context: {
      serviceHistory?: string[];
      preferences?: Record<string, any>;
      location?: { district: string; area?: string };
    },
    options?: {
      userId?: string;
      sessionId?: string;
      limit?: number;
    }
  ): Promise<{
    services: Array<{
      id: string;
      name: string;
      description: string;
      estimatedPrice: number;
      confidence: number;
      reason: string;
    }>;
    providers: Array<{
      id: string;
      name: string;
      rating: number;
      services: string[];
      distance?: number;
      confidence: number;
    }>;
  }> {
    const skillId = 'personalized-recommendations'; // Would need to implement this skill
    
    const result = await this.executeSkill(
      skillId,
      {
        context,
        limit: options?.limit || 10
      },
      {
        userId: options?.userId,
        sessionId: options?.sessionId,
        autonomyLevel: AutonomyLevel.READ
      }
    );

    return result.result;
  }

  /**
   * Real-time assistance during booking flow
   */
  async getBookingFlowAssistance(
    step: 'service_selection' | 'location_input' | 'time_selection' | 'provider_comparison' | 'payment',
    currentData: Record<string, any>,
    options?: {
      userId?: string;
      sessionId?: string;
    }
  ): Promise<{
    suggestions: string[];
    warnings?: string[];
    nextSteps: string[];
    validation?: {
      field: string;
      message: string;
      severity: 'error' | 'warning' | 'info';
    }[];
  }> {
    const skillId = 'booking-flow-assistant'; // Would need to implement this skill
    
    const result = await this.executeSkill(
      skillId,
      {
        step,
        data: currentData
      },
      {
        userId: options?.userId,
        sessionId: options?.sessionId,
        autonomyLevel: AutonomyLevel.SUGGEST
      }
    );

    return result.result;
  }

  /**
   * Handle errors and provide recovery suggestions
   */
  async handleError(
    error: Error,
    context?: Record<string, any>,
    options?: {
      userId?: string;
      sessionId?: string;
    }
  ): Promise<{
    recovery: string[];
    alternative: string[];
    escalate?: boolean;
  }> {
    const skillId = 'error-recovery-assistant'; // Would need to implement this skill
    
    const result = await this.executeSkill(
      skillId,
      {
        error: {
          message: error.message,
          name: error.name,
          stack: error.stack
        },
        context: context || {}
      },
      {
        userId: options?.userId,
        sessionId: options?.sessionId,
        autonomyLevel: AutonomyLevel.SUGGEST
      }
    );

    return result.result;
  }

  /**
   * Batch execute multiple skills
   */
  async executeBatch(
    requests: Array<{
      skillId: string;
      input: any;
      priority?: number;
    }>,
    options?: {
      userId?: string;
      sessionId?: string;
      userRole?: UserRole;
      maxConcurrency?: number;
    }
  ): Promise<Array<{
    success: boolean;
    result?: any;
    error?: string;
    skillId: string;
  }>> {
    const batchId = `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Sort by priority (higher first)
    const sortedRequests = requests
      .map((req, index) => ({ ...req, originalIndex: index }))
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));

    const maxConcurrency = options?.maxConcurrency || 3;
    const results: Array<any> = new Array(requests.length);
    
    // Execute in batches with concurrency control
    for (let i = 0; i < sortedRequests.length; i += maxConcurrency) {
      const batch = sortedRequests.slice(i, i + maxConcurrency);
      
      const batchPromises = batch.map(async (req) => {
        try {
          const result = await this.executeSkill(
            req.skillId,
            req.input,
            {
              userId: options?.userId,
              sessionId: options?.sessionId || `${batchId}-${req.originalIndex}`,
              userRole: options?.userRole
            }
          );
          
          return {
            success: result.success,
            result: result.result,
            error: result.error,
            skillId: req.skillId,
            originalIndex: req.originalIndex
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error),
            skillId: req.skillId,
            originalIndex: req.originalIndex
          };
        }
      });
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result, batchIndex) => {
        const originalIndex = batch[batchIndex].originalIndex;
        if (result.status === 'fulfilled') {
          results[originalIndex] = result.value;
        } else {
          results[originalIndex] = {
            success: false,
            error: result.reason instanceof Error ? result.reason.message : String(result.reason),
            skillId: batch[batchIndex].skillId
          };
        }
      });
    }

    return results;
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `sess-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Set authentication headers
   */
  setAuth(token: string) {
    this.defaultHeaders = {
      ...this.defaultHeaders,
      Authorization: `Bearer ${token}`
    };
  }

  /**
   * Clear authentication
   */
  clearAuth() {
    const { Authorization, ...headers } = this.defaultHeaders as any;
    this.defaultHeaders = headers;
  }
}

// Custom error class for AI execution errors
export class AIExecutionError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public skillId?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AIExecutionError';
  }

  get isRateLimited(): boolean {
    return this.statusCode === 429;
  }

  get requiresApproval(): boolean {
    return this.statusCode === 202 || this.details?.approvalRequired === true;
  }

  get isPolicyViolation(): boolean {
    return this.statusCode === 403 || this.message.includes('policy');
  }
}

// Export a default instance
export const aiClient = new AIClient();

// React hook for AI operations (would be used in components)
export function useAI() {
  return {
    client: aiClient,
    executeSkill: aiClient.executeSkill.bind(aiClient),
    getBookingAssistance: aiClient.getBookingAssistance.bind(aiClient),
    continueConversation: aiClient.continueConversation.bind(aiClient),
    getSearchSuggestions: aiClient.getSearchSuggestions.bind(aiClient),
    getPersonalizedRecommendations: aiClient.getPersonalizedRecommendations.bind(aiClient),
    handleError: aiClient.handleError.bind(aiClient)
  };
}