export type Intent = 
  | 'book_service' 
  | 'reschedule' 
  | 'cancel_booking' 
  | 'price_quote' 
  | 'availability' 
  | 'service_info' 
  | 'account_issue' 
  | 'payment_issue' 
  | 'complaint' 
  | 'general_question' 
  | 'handoff_support';

export type Slots = {
  service?: string;
  district?: string;
  date?: string;
  time?: string;
  bookingId?: string;
  budget?: number;
  details?: string;
  locale?: 'en' | 'ne';
};

export interface RoutingResult {
  intent: Intent;
  confidence: number;
  slots: Slots;
  needs: string[];
}

// Intent classification patterns
const INTENT_PATTERNS: Record<Intent, RegExp[]> = {
  book_service: [
    /book|schedule|hire|need|want.*service|order.*service/i,
    /(electrician|plumber|cleaner|gardener|technician)/i
  ],
  reschedule: [
    /reschedule|change.*time|move.*appointment|postpone/i,
    /change.*date|different.*time/i
  ],
  cancel_booking: [
    /cancel|stop.*booking|don't.*want|refund/i,
    /cancel.*appointment|cancel.*service/i
  ],
  price_quote: [
    /how.*much|cost|price|quote|estimate|rate/i,
    /what.*cost|pricing|fee/i
  ],
  availability: [
    /available|when.*free|open.*slots|free.*time/i,
    /can.*come|what.*time.*available/i
  ],
  service_info: [
    /what.*service|tell.*about|explain|details/i,
    /how.*work|what.*include/i
  ],
  account_issue: [
    /login|password|account|profile|sign.*in/i,
    /can't.*access|forgot.*password/i
  ],
  payment_issue: [
    /payment|billing|charge|transaction|money/i,
    /didn't.*pay|wrong.*amount/i
  ],
  complaint: [
    /complaint|problem|issue|bad|poor.*service/i,
    /not.*happy|dissatisfied|angry/i
  ],
  general_question: [
    /what.*is|how.*to|where.*is|when.*is/i,
    /can.*you|help.*me/i
  ],
  handoff_support: [
    /human|speak.*human|real.*person/i,
    /support.*team|customer.*service/i
  ]
};

// Slot extraction patterns
const SLOT_PATTERNS = {
  service: [
    /(electrician|plumber|cleaner|gardener|technician|house.*clean|electrical|plumbing)/i,
    /(cleaning|electrical|plumbing|gardening|repair)/i
  ],
  district: [
    /(kathmandu|lalitpur|bhaktapur|kirtipur)/i,
    /(thamel|patan|boudha|pulchowk)/i
  ],
  date: [
    /(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
    /(\d{1,2}\/\d{1,2}|\d{1,2}-\d{1,2})/i,
    /(next.*week|this.*week|next.*month)/i
  ],
  time: [
    /(\d{1,2}:\d{2}\s*(am|pm))/i,
    /(morning|afternoon|evening|night)/i,
    /(\d{1,2}\s*(am|pm))/i
  ],
  bookingId: [
    /(bk-|booking.*#|#)\d+/i,
    /(booking|appointment).*(\d+)/i
  ],
  budget: [
    /(rs\.|npr|rupees?)\s*(\d+)/i,
    /(\d+)\s*(rs\.|npr|rupees?)/i,
    /budget.*(\d+)/i
  ]
};

export async function route(input: { 
  text: string; 
  userId: string; 
  locale: 'en' | 'ne' 
}): Promise<RoutingResult> {
  const { text, locale } = input;
  const lowerText = text.toLowerCase();
  
  // Classify intent with confidence scoring
  let bestIntent: Intent = 'general_question';
  let bestConfidence = 0;
  
  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
    let score = 0;
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        score += 1;
      }
    }
    if (score > bestConfidence) {
      bestConfidence = score;
      bestIntent = intent as Intent;
    }
  }
  
  // Normalize confidence to 0-1 range
  const confidence = Math.min(bestConfidence / 2, 1);
  
  // Extract slots
  const slots: Slots = { locale };
  
  for (const [slotType, patterns] of Object.entries(SLOT_PATTERNS)) {
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        switch (slotType) {
          case 'service':
            slots.service = match[1] || match[0];
            break;
          case 'district':
            slots.district = match[1] || match[0];
            break;
          case 'date':
            slots.date = match[1] || match[0];
            break;
          case 'time':
            slots.time = match[1] || match[0];
            break;
          case 'bookingId':
            slots.bookingId = match[0];
            break;
          case 'budget':
            slots.budget = parseInt(match[2] || match[1]);
            break;
        }
        break; // Take first match for each slot type
      }
    }
  }
  
  // Determine what's missing for actionable intents
  const needs: string[] = [];
  
  if (bestIntent === 'book_service') {
    if (!slots.service) needs.push('service');
    if (!slots.district) needs.push('district');
    if (!slots.date) needs.push('date');
    if (!slots.time) needs.push('time');
  } else if (bestIntent === 'reschedule' || bestIntent === 'cancel_booking') {
    if (!slots.bookingId) needs.push('bookingId');
    if (bestIntent === 'reschedule' && !slots.date) needs.push('date');
    if (bestIntent === 'reschedule' && !slots.time) needs.push('time');
  } else if (bestIntent === 'price_quote') {
    if (!slots.service) needs.push('service');
    if (!slots.district) needs.push('district');
  }
  
  return {
    intent: bestIntent,
    confidence,
    slots,
    needs
  };
}
