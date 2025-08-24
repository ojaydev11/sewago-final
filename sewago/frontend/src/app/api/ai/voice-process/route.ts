import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimit(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { 
      transcript, 
      userId, 
      language = 'en', 
      context,
      sessionId 
    } = body;

    if (!transcript || transcript.trim().length === 0) {
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    // Process the voice command
    const result = await processVoiceCommand(
      transcript.trim(),
      language,
      context,
      userId
    );

    const processingTime = Date.now() - startTime;

    // Log voice interaction
    await logVoiceInteraction(
      userId,
      transcript,
      result.intent,
      result.confidence,
      language,
      result.success,
      result.error,
      processingTime
    );

    return NextResponse.json({
      ...result,
      processingTime
    });

  } catch (error) {
    console.error('Voice processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function processVoiceCommand(
  transcript: string,
  language: string,
  context: any,
  userId?: string | null
) {
  // Normalize transcript
  const normalizedTranscript = normalizeTranscript(transcript, language);
  
  // Extract intent and entities
  const intentAnalysis = await extractIntentAndEntities(normalizedTranscript, language);
  
  // Get confidence score
  const confidence = calculateConfidence(normalizedTranscript, intentAnalysis);
  
  if (confidence < 0.6) {
    return {
      success: false,
      confidence,
      intent: 'unknown',
      message: language === 'ne' 
        ? 'माफ गर्नुहोस्, मैले बुझिन। कृपया फेरि प्रयास गर्नुहोस्।'
        : 'Sorry, I didn\'t understand that. Please try again.',
      suggestions: await getSuggestions(normalizedTranscript, language)
    };
  }

  // Process based on intent
  try {
    const response = await executeCommand(
      intentAnalysis.intent,
      intentAnalysis.entities,
      context,
      userId,
      language
    );

    return {
      success: true,
      confidence,
      intent: intentAnalysis.intent,
      entities: intentAnalysis.entities,
      response: response.message,
      action: response.action,
      data: response.data,
      followUp: response.followUp
    };
  } catch (error) {
    return {
      success: false,
      confidence,
      intent: intentAnalysis.intent,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: language === 'ne' 
        ? 'आदेश प्रसंस्करणमा त्रुटि भयो।'
        : 'An error occurred while processing the command.'
    };
  }
}

function normalizeTranscript(transcript: string, language: string): string {
  // Convert to lowercase and trim
  let normalized = transcript.toLowerCase().trim();
  
  // Remove filler words
  const fillerWords = language === 'ne' 
    ? ['उम्', 'आह्', 'ओहो', 'एर्', 'हो', 'ठिक']
    : ['um', 'uh', 'er', 'ah', 'like', 'you know'];
  
  fillerWords.forEach(filler => {
    normalized = normalized.replace(new RegExp(`\\b${filler}\\b`, 'gi'), '');
  });
  
  // Clean up extra spaces
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  return normalized;
}

async function extractIntentAndEntities(transcript: string, language: string) {
  // Get voice commands from database
  const commands = await prisma.voiceCommand.findMany({
    where: {
      language,
      isActive: true
    }
  });

  let bestMatch = {
    intent: 'unknown',
    entities: {},
    matchScore: 0
  };

  // Try to match against known commands
  for (const command of commands) {
    const patterns = [command.command, ...command.patterns];
    
    for (const pattern of patterns) {
      const matchScore = calculatePatternMatch(transcript, pattern);
      
      if (matchScore > bestMatch.matchScore && matchScore >= command.confidence) {
        bestMatch = {
          intent: command.intent,
          entities: extractEntities(transcript, command.parameters),
          matchScore
        };
      }
    }
  }

  // If no good match found, try NLP-based intent detection
  if (bestMatch.matchScore < 0.6) {
    bestMatch = await nlpIntentDetection(transcript, language);
  }

  return bestMatch;
}

function calculatePatternMatch(transcript: string, pattern: string): number {
  // Simple pattern matching with wildcards and optional words
  const patternRegex = pattern
    .replace(/\*/g, '.*')  // * matches any text
    .replace(/\[([^\]]+)\]/g, '($1)?')  // [word] makes word optional
    .replace(/\{([^}]+)\}/g, '([^\\s]+)');  // {entity} captures entity

  try {
    const regex = new RegExp(`^${patternRegex}$`, 'i');
    const match = regex.test(transcript);
    
    if (match) {
      // Calculate similarity score
      const similarity = calculateSimilarity(transcript, pattern);
      return similarity;
    }
  } catch (error) {
    console.error('Pattern matching error:', error);
  }
  
  return 0;
}

function calculateSimilarity(str1: string, str2: string): number {
  // Use Levenshtein distance to calculate similarity
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i += 1) {
    matrix[0][i] = i;
  }

  for (let j = 0; j <= str2.length; j += 1) {
    matrix[j][0] = j;
  }

  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }

  const maxLength = Math.max(str1.length, str2.length);
  return 1 - (matrix[str2.length][str1.length] / maxLength);
}

function extractEntities(transcript: string, parameterRules: any): any {
  const entities: any = {};
  
  if (!parameterRules || typeof parameterRules !== 'object') {
    return entities;
  }

  // Extract service names
  if (parameterRules.service) {
    const serviceKeywords = [
      'cleaning', 'electrical', 'plumbing', 'gardening', 'repair',
      'maintenance', 'installation', 'fixing', 'ac', 'aircon'
    ];
    
    const foundService = serviceKeywords.find(keyword => 
      transcript.includes(keyword)
    );
    
    if (foundService) {
      entities.service = foundService;
    }
  }

  // Extract locations
  if (parameterRules.location) {
    const locationPattern = /(?:in|at|near) ([a-zA-Z\s]+?)(?:\s|$|,)/i;
    const locationMatch = transcript.match(locationPattern);
    
    if (locationMatch) {
      entities.location = locationMatch[1].trim();
    }
  }

  // Extract time expressions
  if (parameterRules.time) {
    const timePatterns = [
      /(?:at|around) (\d{1,2}(?::\d{2})?\s*(?:am|pm))/i,
      /(tomorrow|today|next week)/i,
      /(morning|afternoon|evening)/i
    ];
    
    for (const pattern of timePatterns) {
      const match = transcript.match(pattern);
      if (match) {
        entities.time = match[1];
        break;
      }
    }
  }

  return entities;
}

async function nlpIntentDetection(transcript: string, language: string) {
  // Fallback NLP-based intent detection
  const intentKeywords = {
    'search': ['find', 'search', 'look for', 'show me', 'khojnu', 'dekhau'],
    'book': ['book', 'schedule', 'arrange', 'appointment', 'book garnu', 'samaya'],
    'navigate': ['go to', 'take me to', 'navigate', 'open', 'janu', 'kholnu'],
    'query': ['what is', 'how much', 'when', 'where', 'kati', 'kaha', 'kile'],
    'cancel': ['cancel', 'stop', 'abort', 'raddu garnu', 'banda garnu'],
    'help': ['help', 'assist', 'support', 'sahayata', 'maddat']
  };

  let bestIntent = 'unknown';
  let maxScore = 0;

  for (const [intent, keywords] of Object.entries(intentKeywords)) {
    const score = keywords.reduce((acc, keyword) => {
      return acc + (transcript.includes(keyword) ? 1 : 0);
    }, 0) / keywords.length;

    if (score > maxScore) {
      maxScore = score;
      bestIntent = intent;
    }
  }

  return {
    intent: bestIntent,
    entities: {},
    matchScore: maxScore
  };
}

function calculateConfidence(transcript: string, intentAnalysis: any): number {
  let confidence = intentAnalysis.matchScore;

  // Boost confidence for clear, complete sentences
  if (transcript.length > 10 && transcript.split(' ').length >= 3) {
    confidence += 0.1;
  }

  // Reduce confidence for very short or unclear inputs
  if (transcript.length < 5) {
    confidence -= 0.2;
  }

  // Boost confidence if entities were extracted
  if (Object.keys(intentAnalysis.entities).length > 0) {
    confidence += 0.15;
  }

  return Math.max(0, Math.min(1, confidence));
}

async function executeCommand(
  intent: string,
  entities: any,
  context: any,
  userId?: string | null,
  language = 'en'
) {
  switch (intent) {
    case 'search':
      return await handleSearchCommand(entities, language);
    
    case 'book':
      return await handleBookCommand(entities, userId, language);
    
    case 'navigate':
      return await handleNavigateCommand(entities, language);
    
    case 'query':
      return await handleQueryCommand(entities, context, language);
    
    case 'cancel':
      return await handleCancelCommand(entities, userId, language);
    
    case 'help':
      return await handleHelpCommand(language);
    
    default:
      return {
        message: language === 'ne' 
          ? 'माफ गर्नुहोस्, मैले त्यो आदेश बुझिन।'
          : 'Sorry, I don\'t understand that command.',
        action: 'none',
        data: null
      };
  }
}

async function handleSearchCommand(entities: any, language: string) {
  const service = entities.service || entities.query;
  const location = entities.location || 'your area';

  if (service) {
    const searchUrl = `/search?q=${encodeURIComponent(service)}&location=${encodeURIComponent(location)}`;
    
    return {
      message: language === 'ne'
        ? `${location} मा ${service} खोज्दै... परिणामहरू देखाइँदै।`
        : `Searching for ${service} in ${location}. Showing results...`,
      action: 'navigate',
      data: { url: searchUrl },
      followUp: language === 'ne'
        ? 'के तपाईं कुनै विशेष प्रकारको सेवा चाहनुहुन्छ?'
        : 'Would you like to filter by any specific criteria?'
    };
  }

  return {
    message: language === 'ne'
      ? 'कृपया खोज्न चाहेको सेवा बताउनुहोस्।'
      : 'Please specify what service you\'d like to search for.',
    action: 'prompt',
    data: null
  };
}

async function handleBookCommand(entities: any, userId: string | null, language: string) {
  if (!userId) {
    return {
      message: language === 'ne'
        ? 'पहिले लगइन गर्नुहोस्।'
        : 'Please log in first to book a service.',
      action: 'navigate',
      data: { url: '/auth/login' }
    };
  }

  const service = entities.service;
  const time = entities.time;
  const location = entities.location;

  if (service) {
    const bookingUrl = `/services/${service}/book${time ? `?time=${encodeURIComponent(time)}` : ''}${location ? `&location=${encodeURIComponent(location)}` : ''}`;
    
    return {
      message: language === 'ne'
        ? `${service} को लागि बुकिङ पेज खोल्दै...`
        : `Opening booking page for ${service}...`,
      action: 'navigate',
      data: { url: bookingUrl },
      followUp: language === 'ne'
        ? 'के तपाईं अन्य कुनै विशेषता थप्न चाहनुहुन्छ?'
        : 'Would you like to add any specific requirements?'
    };
  }

  return {
    message: language === 'ne'
      ? 'कृपया बुक गर्न चाहेको सेवा बताउनुहोस्।'
      : 'Please specify which service you\'d like to book.',
    action: 'prompt',
    data: { availableServices: ['cleaning', 'electrical', 'plumbing', 'gardening'] }
  };
}

async function handleNavigateCommand(entities: any, language: string) {
  const destination = entities.page || entities.section;
  
  const navigationMap: { [key: string]: string } = {
    'home': '/',
    'services': '/services',
    'bookings': '/account/bookings',
    'profile': '/account',
    'settings': '/settings',
    'help': '/support',
    'dashboard': '/dashboard'
  };

  if (destination && navigationMap[destination]) {
    return {
      message: language === 'ne'
        ? `${destination} मा जाँदै...`
        : `Going to ${destination}...`,
      action: 'navigate',
      data: { url: navigationMap[destination] }
    };
  }

  return {
    message: language === 'ne'
      ? 'कुन पेजमा जान चाहनुहुन्छ?'
      : 'Where would you like to go?',
    action: 'prompt',
    data: { availablePages: Object.keys(navigationMap) }
  };
}

async function handleQueryCommand(entities: any, context: any, language: string) {
  const queryType = entities.type || 'general';
  
  switch (queryType) {
    case 'price':
    case 'cost':
      return {
        message: language === 'ne'
          ? 'मूल्यहरू सेवाको प्रकार र स्थानमा निर्भर गर्दछ। के तपाईं कुनै विशेष सेवाको मूल्य जान्न चाहनुहुन्छ?'
          : 'Prices vary by service type and location. Which specific service would you like to know about?',
        action: 'prompt',
        data: null
      };
    
    case 'time':
    case 'schedule':
      return {
        message: language === 'ne'
          ? 'हामी बिहान ७ बजे देखि बेलुका ८ बजे सम्म सेवा प्रदान गर्छौं।'
          : 'We provide services from 7 AM to 8 PM daily.',
        action: 'info',
        data: { hours: '7:00 AM - 8:00 PM' }
      };
    
    default:
      return {
        message: language === 'ne'
          ? 'म तपाईंको प्रश्न बुझिन। कृपया थप स्पष्ट रूपमा सोध्नुहोस्।'
          : 'I don\'t understand your question. Please be more specific.',
        action: 'prompt',
        data: null
      };
  }
}

async function handleCancelCommand(entities: any, userId: string | null, language: string) {
  const bookingId = entities.booking || entities.id;
  
  if (bookingId && userId) {
    // This would integrate with the booking cancellation system
    return {
      message: language === 'ne'
        ? 'बुकिङ रद्द गर्ने प्रक्रिया सुरु गरिएको छ।'
        : 'Booking cancellation process initiated.',
      action: 'navigate',
      data: { url: `/bookings/${bookingId}/cancel` }
    };
  }

  return {
    message: language === 'ne'
      ? 'कुन बुकिङ रद्द गर्न चाहनुहुन्छ?'
      : 'Which booking would you like to cancel?',
    action: 'prompt',
    data: null
  };
}

async function handleHelpCommand(language: string) {
  const commands = language === 'ne' ? [
    '"house cleaning खोज्नुहोस्" - सेवाहरू खोज्न',
    '"electrical service book गर्नुहोस्" - सेवा बुक गर्न',
    '"settings मा जानुहोस्" - पेजहरूमा navigate गर्न',
    '"मूल्य कति छ?" - जानकारी सोध्न'
  ] : [
    '"search for house cleaning" - to find services',
    '"book electrical service" - to book a service',
    '"go to settings" - to navigate pages',
    '"what is the price?" - to get information'
  ];

  return {
    message: language === 'ne'
      ? 'यहाँ केही आदेशहरू छन् जुन तपाईं प्रयोग गर्न सक्नुहुन्छ:'
      : 'Here are some commands you can use:',
    action: 'info',
    data: { commands },
    followUp: language === 'ne'
      ? 'अन्य कुनै प्रश्न छ?'
      : 'Do you have any other questions?'
  };
}

async function getSuggestions(transcript: string, language: string): Promise<string[]> {
  // Provide helpful suggestions based on partial matches
  const suggestions = language === 'ne' ? [
    'House cleaning खोज्नुहोस्',
    'Electrical service book गर्नुहोस्',
    'मेरो bookings देखाउनुहोस्',
    'Settings मा जानुहोस्'
  ] : [
    'Search for house cleaning',
    'Book electrical service',
    'Show my bookings',
    'Go to settings'
  ];

  return suggestions;
}

async function logVoiceInteraction(
  userId: string | null,
  command: string,
  intent: string,
  confidence: number,
  language: string,
  successful: boolean,
  errorMessage?: string,
  responseTime?: number
) {
  try {
    await prisma.voiceInteraction.create({
      data: {
        userId,
        command,
        intent,
        confidence,
        language,
        successful,
        errorMessage,
        responseTime: responseTime || 0
      }
    });
  } catch (error) {
    console.error('Failed to log voice interaction:', error);
  }
}