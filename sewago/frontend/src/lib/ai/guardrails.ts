// AI Guardrails for SewaGo
// Ensures AI responses are safe, factual, and properly formatted

export interface ModerationResult {
  allowed: boolean;
  reason?: string;
  flags?: string[];
}

export interface GroundingResult {
  passes: boolean;
  missing: string[];
  confidence: number;
}

export interface Source {
  kind: 'db' | 'doc';
  label: string;
  section?: string;
}

// Content moderation
export async function moderate(textOrImage: string | Buffer): Promise<ModerationResult> {
  if (typeof textOrImage !== 'string') {
    return { allowed: false, reason: 'Image moderation not implemented yet' };
  }
  
  const text = textOrImage.toLowerCase();
  const flags: string[] = [];
  
  // Check for toxic content
  const toxicPatterns = [
    /fuck|shit|bitch|asshole|damn/i,
    /kill.*yourself|die/i,
    /hate.*you|stupid.*idiot/i
  ];
  
  if (toxicPatterns.some(pattern => pattern.test(text))) {
    flags.push('toxic_language');
  }
  
  // Check for PII (personal information)
  const piiPatterns = [
    /\b\d{10}\b/, // Phone numbers
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Emails
    /\b\d{4}\s\d{4}\s\d{4}\s\d{4}\b/, // Credit card numbers
    /\b\d{3}-\d{2}-\d{4}\b/ // SSN pattern
  ];
  
  if (piiPatterns.some(pattern => pattern.test(text))) {
    flags.push('pii_detected');
  }
  
  // Check for spam/abuse
  const spamPatterns = [
    /(buy|sell|discount|offer).*(viagra|casino|loan)/i,
    /(click|visit|go.*to).*(http|www)/i,
    /(urgent|limited.*time|act.*now)/i
  ];
  
  if (spamPatterns.some(pattern => pattern.test(text))) {
    flags.push('spam_detected');
  }
  
  // Decision logic
  if (flags.includes('toxic_language')) {
    return { allowed: false, reason: 'Content contains inappropriate language', flags };
  }
  
  if (flags.includes('pii_detected')) {
    return { allowed: false, reason: 'Personal information detected', flags };
  }
  
  if (flags.includes('spam_detected')) {
    return { allowed: false, reason: 'Spam content detected', flags };
  }
  
  return { allowed: true, flags };
}

// Fact grounding verification
export async function ground(
  answer: string, 
  facts: Array<{ source: 'db' | 'doc'; key: string; value: string }>
): Promise<GroundingResult> {
  const answerLower = answer.toLowerCase();
  const missing: string[] = [];
  let verifiedFacts = 0;
  const totalFacts = facts.length;
  
  // Check each fact against the answer
  for (const fact of facts) {
    const factValue = fact.value.toLowerCase();
    
    // Check if the fact is mentioned in the answer
    if (answerLower.includes(factValue)) {
      verifiedFacts++;
    } else {
      // Check for partial matches or paraphrases
      const factWords = factValue.split(/\s+/);
      const hasPartialMatch = factWords.some(word => 
        word.length > 3 && answerLower.includes(word)
      );
      
      if (hasPartialMatch) {
        verifiedFacts++;
      } else {
        missing.push(`${fact.source}:${fact.key}`);
      }
    }
  }
  
  // Calculate confidence score
  const confidence = totalFacts > 0 ? verifiedFacts / totalFacts : 0;
  const passes = confidence >= 0.8; // 80% threshold
  
  return {
    passes,
    missing,
    confidence
  };
}

// Answer formatting with sources
export function formatAnswer(opts: {
  answer: string;
  sources: Source[];
  locale?: 'en' | 'ne';
}): string {
  const { answer, sources, locale = 'en' } = opts;
  
  // Format sources
  let sourceText = '';
  if (sources.length > 0) {
    const sourceLabels = sources.map(source => {
      if (source.section) {
        return `${source.label} §${source.section}`;
      }
      return source.label;
    });
    
    sourceText = `\n**Source:** ${sourceLabels.join(', ')}`;
  }
  
  // Return formatted answer
  return `${answer}${sourceText}`;
}

// Quality check rubric
export function checkAnswerQuality(answer: string, context: {
  hasDirectAnswer: boolean;
  hasSources: boolean;
  followUpCount: number;
  confidence: number;
}): { passes: boolean; issues: string[] } {
  const issues: string[] = [];
  
  if (!context.hasDirectAnswer) {
    issues.push('No direct answer provided');
  }
  
  if (!context.hasSources) {
    issues.push('No sources cited for factual claims');
  }
  
  if (context.followUpCount > 2) {
    issues.push('Too many follow-up questions (max 2)');
  }
  
  if (context.confidence < 0.7) {
    issues.push('Low confidence in response');
  }
  
  const passes = issues.length === 0;
  
  return { passes, issues };
}

// Generate fallback response when quality check fails
export function generateFallbackResponse(issues: string[], locale: 'en' | 'ne' = 'en'): string {
  const responses = {
    en: {
      noAnswer: "I don't have a reliable answer yet. I can:",
      options: [
        "Ask a specific follow-up question",
        "Hand off to human support"
      ]
    },
    ne: {
      noAnswer: "मलाई अहिले विश्वसनीय जवाफ छैन। म सक्छु:",
      options: [
        "एउटा विशिष्ट प्रश्न सोध्नुहोस्",
        "मानव सहयोगमा हस्तान्तरण गर्नुहोस्"
      ]
    }
  };
  
  const response = responses[locale];
  const optionsList = response.options.map(opt => `• ${opt}`).join('\n');
  
  return `${response.noAnswer}\n${optionsList}`;
}
