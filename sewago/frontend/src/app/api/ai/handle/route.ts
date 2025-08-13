import { NextRequest, NextResponse } from 'next/server';
import { route, type Intent, type Slots } from '@/lib/ai/router';
import * as tools from '@/lib/ai/tools';
import { retrieve, getPolicy } from '@/lib/ai/rag';
import { moderate, ground, formatAnswer, checkAnswerQuality, generateFallbackResponse } from '@/lib/ai/guardrails';
import { generateAIResponse } from '@/lib/ai/provider';
import { t, tInterpolate, type Locale } from '@/lib/i18n';
import { connectDB } from '@/lib/mongodb';
import { Service } from '@/models/Service';
import { checkRateLimit } from '@/lib/rate-limit-adapters';
import { ratePolicies } from '@/lib/rate-policies';
import { getIdentifier } from '@/lib/request-identity';

export interface AIHandleRequest {
  text: string;
  threadId?: string;
  context?: {
    bookingId?: string;
    serviceId?: string;
    district?: string;
    userId?: string;
  };
  locale: 'en' | 'ne';
}

export interface AIHandleResponse {
  answer: string;
  intent: Intent;
  slots: Slots;
  sources: Array<{ kind: 'db' | 'doc'; label: string; section?: string }>;
  confidence: number;
  needs?: string[];
  toolResult?: any;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting defense in depth
    const identifier = getIdentifier(request);
    const rateLimitResult = await checkRateLimit(identifier, ratePolicies.aiHandle);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Too many AI requests. Please wait before trying again.',
          retryAfter: rateLimitResult.retryAfter 
        },
        { 
          status: 429,
          headers: rateLimitResult.headers
        }
      );
    }

    const body: AIHandleRequest = await request.json();
    const { text, context, locale } = body;
    
    // 1. Content moderation
    const moderationResult = await moderate(text);
    if (!moderationResult.allowed) {
      return NextResponse.json({
        error: moderationResult.reason,
        flags: moderationResult.flags
      }, { status: 400 });
    }
    
    // 2. Intent routing and slot extraction
    const routingResult = await route({
      text,
      userId: context?.userId || 'anonymous',
      locale
    });
    
    const { intent, slots, needs } = routingResult;
    
    // 3. Enrich slots from context and database
    const enrichedSlots = await enrichSlots(slots, context, locale);
    
    // 4. Handle actionable intents
    let toolResult = null;
    let answer = '';
    let sources: Array<{ kind: 'db' | 'doc'; label: string; section?: string }> = [];
    
    if (intent === 'book_service' && enrichedSlots.service && enrichedSlots.district && enrichedSlots.date && enrichedSlots.time) {
      // Handle service booking
      const service = await findServiceByName(enrichedSlots.service);
      if (service) {
        toolResult = await tools.bookService({
          userId: context?.userId || 'anonymous',
          serviceId: service._id.toString(),
          date: enrichedSlots.date,
          time: enrichedSlots.time,
          address: enrichedSlots.district,
          notes: enrichedSlots.details
        });
        
        if (toolResult.ok) {
          answer = tInterpolate('ai_booking_success', {
            service: enrichedSlots.service,
            date: enrichedSlots.date,
            time: enrichedSlots.time,
            district: enrichedSlots.district
          }, locale);
          
          sources.push({ kind: 'db', label: 'Services Database' });
          sources.push({ kind: 'db', label: 'Booking Data' });
        } else {
          answer = toolResult.error || t('error_database_error', locale);
        }
      } else {
        answer = t('error_service_not_found', locale);
      }
    } else if (intent === 'price_quote' && enrichedSlots.service && enrichedSlots.district) {
      // Handle price quote
      const service = await findServiceByName(enrichedSlots.service);
      if (service) {
        toolResult = await tools.getQuote({
          serviceId: service._id.toString(),
          district: enrichedSlots.district,
          hours: enrichedSlots.details ? parseFloat(enrichedSlots.details) : 1
        });
        
        if (toolResult.ok) {
          answer = tInterpolate('ai_quote_response', {
            amount: toolResult.data.estimatedPrice,
            service: enrichedSlots.service,
            district: enrichedSlots.district
          }, locale);
          
          sources.push({ kind: 'db', label: 'Services Database' });
        } else {
          answer = toolResult.error || t('error_database_error', locale);
        }
      } else {
        answer = t('error_service_not_found', locale);
      }
    } else if (intent === 'cancel_booking' && enrichedSlots.bookingId) {
      // Handle booking cancellation
      toolResult = await tools.cancelBooking({
        bookingId: enrichedSlots.bookingId
      });
      
      if (toolResult.ok) {
        answer = tInterpolate('ai_cancellation_success', {
          bookingId: enrichedSlots.bookingId
        }, locale);
        
        sources.push({ kind: 'db', label: 'Booking Data' });
      } else {
        answer = toolResult.error || t('error_database_error', locale);
      }
    } else if (intent === 'service_info' || intent === 'general_question') {
      // Handle information questions using RAG
      const documents = await retrieve(text, 3);
      
      if (documents.length > 0) {
        // Use AI to generate a coherent response from retrieved documents
        const prompt = `Based on these documents, answer the user's question: "${text}"

Documents:
${documents.map(doc => `${doc.title} ${doc.section}: ${doc.text}`).join('\n\n')}

Answer in ${locale === 'ne' ? 'Nepali' : 'English'}:`;
        
        const aiResponse = await generateAIResponse(prompt, { locale });
        answer = aiResponse.text;
        
        // Add document sources
        documents.forEach(doc => {
          sources.push({ 
            kind: 'doc', 
            label: doc.title, 
            section: doc.section 
          });
        });
      } else {
        answer = t('ai_no_info', locale);
      }
    } else if (intent === 'handoff_support') {
      // Handle support handoff
      answer = t('ai_escalate', locale);
      sources.push({ kind: 'doc', label: 'Support Policy' });
    }
    
    // 5. If no tool was called or slots are missing, ask for missing information
    if (!answer && needs.length > 0) {
      const missingFields = needs.slice(0, 2).map(field => t(field, locale)).join(', ');
      answer = tInterpolate('ai_ask_missing', { fields: missingFields }, locale);
    }
    
    // 6. Quality check
    const qualityCheck = checkAnswerQuality(answer, {
      hasDirectAnswer: answer.length > 0,
      hasSources: sources.length > 0,
      followUpCount: needs.length,
      confidence: routingResult.confidence
    });
    
    if (!qualityCheck.passes) {
      answer = generateFallbackResponse(qualityCheck.issues, locale);
    }
    
    // 7. Grounding check
    const facts = sources.map(source => ({
      source: source.kind,
      key: source.label,
      value: source.label
    }));
    
    const groundingResult = await ground(answer, facts);
    
    // 8. Format final answer
    const formattedAnswer = formatAnswer({
      answer,
      sources,
      locale
    });
    
    // 9. Return response
    const response: AIHandleResponse = {
      answer: formattedAnswer,
      intent,
      slots: enrichedSlots,
      sources,
      confidence: routingResult.confidence,
      needs: needs.length > 0 ? needs : undefined,
      toolResult
    };
    
    const nextResponse = NextResponse.json(response);
    
    // Add rate limit headers to successful response
    Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
      nextResponse.headers.set(key, value);
    });
    
    return nextResponse;
    
  } catch (error) {
    console.error('AI handler error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Helper function to enrich slots with context and database data
async function enrichSlots(slots: Slots, context?: any, locale: Locale = 'en'): Promise<Slots> {
  const enriched = { ...slots };
  
  try {
    await connectDB();
    
    // Enrich from context
    if (context?.district && !enriched.district) {
      enriched.district = context.district;
    }
    
    if (context?.serviceId && !enriched.service) {
      const service = await Service.findById(context.serviceId);
      if (service) {
        enriched.service = service.title;
      }
    }
    
    // Enrich from database if needed
    if (enriched.service && !enriched.service.includes(' ')) {
      // Try to find full service name
      const services = await Service.find({ 
        title: { $regex: enriched.service, $options: 'i' } 
      });
      
      if (services.length > 0) {
        enriched.service = services[0].title;
      }
    }
    
  } catch (error) {
    console.error('Error enriching slots:', error);
  }
  
  return enriched;
}

// Helper function to find service by name
async function findServiceByName(serviceName: string) {
  try {
    const services = await Service.find({ 
      title: { $regex: serviceName, $options: 'i' } 
    });
    
    return services.length > 0 ? services[0] : null;
  } catch (error) {
    console.error('Error finding service:', error);
    return null;
  }
}
