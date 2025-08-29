// AI Provider for SewaGo
// Supports OpenAI by default, extensible for other providers

export interface AIProvider {
  generateResponse(prompt: string, options?: AIOptions): Promise<string>;
  moderateContent(content: string): Promise<boolean>;
}

export interface AIOptions {
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  locale?: 'en' | 'ne';
}

export interface AIResponse {
  text: string;
  confidence: number;
  tokens: number;
  model: string;
}

// OpenAI Provider (default)
class OpenAIProvider implements AIProvider {
  private model: string;
  
  constructor() {
    this.model = 'gpt-3.5-turbo';
  }
  
  async generateResponse(prompt: string, options: AIOptions = {}): Promise<string> {
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          options: {
            ...options,
            systemPrompt: options.systemPrompt || this.getDefaultSystemPrompt(options.locale)
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`AI API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.response || 'No response generated';
      
    } catch (error) {
      console.error('AI API error:', error);
      return this.generateFallbackResponse(prompt, options);
    }
  }
  
  async moderateContent(content: string): Promise<boolean> {
    try {
      const response = await fetch('/api/ai/moderate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content
        })
      });
      
      if (!response.ok) {
        return true; // Allow content if moderation fails
      }
      
      const data = await response.json();
      return data.safe;
      
    } catch (error) {
      console.error('AI moderation error:', error);
      return true; // Allow content if moderation fails
    }
  }
  
  private getDefaultSystemPrompt(locale: 'en' | 'ne' = 'en'): string {
    const prompts = {
      en: `You are SewaGo's AI assistant. You help users book local services like electricians, plumbers, cleaners, and gardeners in Nepal.

Rules:
1. Always answer in English
2. Be concise and helpful
3. Only provide information you're certain about
4. If unsure, ask for clarification or suggest contacting support
5. For bookings, confirm all required details before proceeding
6. Use polite, professional language

Current context: User is asking about local services in Nepal.`,
      
      ne: `तपाईं SewaGo को AI सहायक हुनुहुन्छ। तपाईंले नेपालमा बिजुली मिस्त्री, प्लम्बर, सफाई कर्मचारी, र बगैंचा माली जस्ता स्थानीय सेवाहरू बुक गर्न मद्दत गर्नुहुन्छ।

नियमहरू:
१. सधैं नेपालीमा जवाफ दिनुहोस्
२. संक्षिप्त र सहायक हुनुहोस्
३. तपाईंलाई निश्चित छ कि मात्र जानकारी प्रदान गर्नुहोस्
४. यदि अनिश्चित छ भने स्पष्टीकरणको लागि सोध्नुहोस् वा सहयोग सम्पर्क गर्न सुझाव दिनुहोस्
५. बुकिङहरूको लागि, अगाडि बढ्नु अघि सबै आवश्यक विवरणहरू पुष्टि गर्नुहोस्
६. विनम्र, व्यावसायिक भाषा प्रयोग गर्नुहोस्

वर्तमान सन्दर्भ: प्रयोगकर्ता नेपालमा स्थानीय सेवाहरूको बारेमा सोधिरहेका छन्।`
    };
    
    return prompts[locale];
  }
  
  private generateFallbackResponse(prompt: string, options: AIOptions): string {
    // Simple rule-based responses when AI is not available
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('book') || lowerPrompt.includes('schedule')) {
      return options.locale === 'ne' 
        ? 'म तपाईंको सेवा बुक गर्न मद्दत गर्न सक्छु। कृपया सेवा, मिति, र समय बताउनुहोस्।'
        : 'I can help you book a service. Please provide the service type, date, and time.';
    }
    
    if (lowerPrompt.includes('price') || lowerPrompt.includes('cost')) {
      return options.locale === 'ne'
        ? 'मूल्य जानकारीको लागि कृपया सेवा र स्थान बताउनुहोस्।'
        : 'For pricing information, please specify the service and location.';
    }
    
    if (lowerPrompt.includes('cancel') || lowerPrompt.includes('reschedule')) {
      return options.locale === 'ne'
        ? 'बुकिङ रद्द वा पुनर्निर्धारण गर्न कृपया बुकिङ ID प्रदान गर्नुहोस्।'
        : 'To cancel or reschedule a booking, please provide the booking ID.';
    }
    
    return options.locale === 'ne'
      ? 'म तपाईंलाई कसरी मद्दत गर्न सक्छु?'
      : 'How can I help you?';
  }
}

// ShivX Provider (future implementation)
class ShivXProvider implements AIProvider {
  async generateResponse(prompt: string, options: AIOptions = {}): Promise<string> {
    // TODO: Implement ShivX integration
    throw new Error('ShivX provider not implemented yet');
  }
  
  async moderateContent(content: string): Promise<boolean> {
    // TODO: Implement ShivX moderation
    return true;
  }
}

// Provider factory
export function createAIProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER?.toLowerCase();
  
  switch (provider) {
    case 'shivx':
      return new ShivXProvider();
    case 'openai':
    default:
      return new OpenAIProvider();
  }
}

// Default provider instance
export const aiProvider = createAIProvider();

// Utility functions
export async function generateAIResponse(
  prompt: string, 
  options: AIOptions = {}
): Promise<AIResponse> {
  const startTime = Date.now();
  
  try {
    const text = await aiProvider.generateResponse(prompt, options);
    
    // Estimate token count (rough approximation)
    const tokens = Math.ceil(text.length / 4);
    
    return {
      text,
      confidence: 0.9, // Default confidence for now
      tokens,
      model: process.env.AI_PROVIDER || 'openai'
    };
    
  } catch (error) {
    console.error('AI response generation failed:', error);
    
    return {
      text: 'I apologize, but I encountered an error. Please try again or contact support.',
      confidence: 0.0,
      tokens: 0,
      model: 'fallback'
    };
  }
}

export async function moderateContent(content: string): Promise<boolean> {
  try {
    return await aiProvider.moderateContent(content);
  } catch (error) {
    console.error('Content moderation failed:', error);
    return true; // Allow content if moderation fails
  }
}
