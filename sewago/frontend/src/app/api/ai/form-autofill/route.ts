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
      userId, 
      formType, 
      fieldName, 
      currentValue, 
      context,
      formData = {}
    } = body;

    if (!formType || !fieldName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate smart form suggestions
    const suggestions = await generateFormSuggestions(
      userId,
      formType,
      fieldName,
      currentValue,
      context,
      formData
    );

    // Log form behavior for learning
    if (userId) {
      await logFormBehavior(userId, formType, fieldName, currentValue, context);
    }

    return NextResponse.json({
      suggestions,
      confidence: calculateSuggestionConfidence(suggestions, currentValue),
      fieldType: await getFieldType(formType, fieldName),
      validationRules: await getValidationRules(formType, fieldName),
      smartFeatures: {
        hasAddressPrediction: isAddressField(fieldName),
        hasPhonePrediction: isPhoneField(fieldName),
        hasServicePrediction: isServiceField(fieldName),
        hasBulkFill: canBulkFill(formType, fieldName)
      }
    });

  } catch (error) {
    console.error('Form autofill error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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
    const { userId, formType, completedData, completionTime, errors } = body;

    if (!userId || !formType || !completedData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Record form completion for learning
    await recordFormCompletion(userId, formType, completedData, completionTime, errors);

    // Update form templates based on successful completion
    await updateFormTemplates(formType, completedData);

    return NextResponse.json({
      success: true,
      message: 'Form behavior recorded successfully'
    });

  } catch (error) {
    console.error('Form completion recording error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function generateFormSuggestions(
  userId: string | null,
  formType: string,
  fieldName: string,
  currentValue: string | null,
  context: any,
  formData: any
) {
  const suggestions = [];

  // Get user-specific suggestions
  if (userId) {
    const userSuggestions = await getUserSpecificSuggestions(userId, formType, fieldName);
    suggestions.push(...userSuggestions);
  }

  // Get template-based suggestions
  const templateSuggestions = await getTemplateSuggestions(formType, fieldName, currentValue);
  suggestions.push(...templateSuggestions);

  // Get context-based suggestions
  const contextSuggestions = await getContextualSuggestions(fieldName, context, formData);
  suggestions.push(...contextSuggestions);

  // Get location-based suggestions
  if (isAddressField(fieldName) && context?.location) {
    const locationSuggestions = await getLocationSuggestions(context.location, currentValue);
    suggestions.push(...locationSuggestions);
  }

  // Get service-based suggestions
  if (isServiceField(fieldName)) {
    const serviceSuggestions = await getServiceSuggestions(currentValue, context);
    suggestions.push(...serviceSuggestions);
  }

  // Deduplicate and rank suggestions
  return rankAndDedupeSuggestions(suggestions, currentValue);
}

async function getUserSpecificSuggestions(userId: string, formType: string, fieldName: string) {
  // Get user's previous form data
  const userForms = await prisma.formBehavior.findMany({
    where: {
      userId,
      formType
    },
    orderBy: {
      timestamp: 'desc'
    },
    take: 10
  });

  const suggestions = [];
  
  for (const form of userForms) {
    if (form.fieldData && typeof form.fieldData === 'object') {
      const data = form.fieldData as any;
      if (data[fieldName] && typeof data[fieldName] === 'string') {
        suggestions.push({
          value: data[fieldName],
          type: 'user_history',
          confidence: 0.8,
          label: 'From your previous entries'
        });
      }
    }
  }

  return suggestions;
}

async function getTemplateSuggestions(formType: string, fieldName: string, currentValue: string | null) {
  const template = await prisma.formTemplate.findUnique({
    where: {
      formType_fieldName: {
        formType,
        fieldName
      }
    }
  });

  if (!template || !template.predictions) {
    return [];
  }

  const predictions = template.predictions as any[];
  return predictions
    .filter(p => !currentValue || p.value.toLowerCase().includes(currentValue.toLowerCase()))
    .map(p => ({
      value: p.value,
      type: 'template',
      confidence: p.frequency || 0.5,
      label: p.label || 'Popular choice'
    }))
    .slice(0, 5);
}

async function getContextualSuggestions(fieldName: string, context: any, formData: any) {
  const suggestions = [];

  // Phone number suggestions based on existing data
  if (isPhoneField(fieldName) && formData.email) {
    // Could integrate with user database to suggest phone based on email
    const phonePattern = /^\+977/; // Nepal phone pattern
    if (!formData.phone || !phonePattern.test(formData.phone)) {
      suggestions.push({
        value: '+977-',
        type: 'contextual',
        confidence: 0.6,
        label: 'Nepal phone format'
      });
    }
  }

  // Address suggestions based on other fields
  if (isAddressField(fieldName)) {
    if (context?.location?.city) {
      suggestions.push({
        value: context.location.city,
        type: 'contextual',
        confidence: 0.7,
        label: 'Current city'
      });
    }

    // Common areas in Kathmandu
    if (context?.location?.city === 'Kathmandu') {
      const commonAreas = [
        'Thamel', 'Durbar Marg', 'New Road', 'Asan', 'Patan', 
        'Bhaktapur', 'Lalitpur', 'Baneshwor', 'Maharajgunj', 'Baluwatar'
      ];
      
      commonAreas.forEach(area => {
        if (!formData.address || !formData.address.includes(area)) {
          suggestions.push({
            value: `${area}, Kathmandu`,
            type: 'contextual',
            confidence: 0.5,
            label: 'Popular area'
          });
        }
      });
    }
  }

  // Time-based suggestions
  if (fieldName.toLowerCase().includes('time') || fieldName.toLowerCase().includes('schedule')) {
    const now = new Date();
    const hour = now.getHours();
    
    let suggestedTimes = [];
    if (hour < 12) {
      suggestedTimes = ['9:00 AM', '10:00 AM', '11:00 AM'];
    } else if (hour < 17) {
      suggestedTimes = ['2:00 PM', '3:00 PM', '4:00 PM'];
    } else {
      suggestedTimes = ['Tomorrow 9:00 AM', 'Tomorrow 10:00 AM'];
    }

    suggestedTimes.forEach(time => {
      suggestions.push({
        value: time,
        type: 'contextual',
        confidence: 0.6,
        label: 'Optimal time'
      });
    });
  }

  return suggestions;
}

async function getLocationSuggestions(location: any, currentValue: string | null) {
  // This would integrate with a geocoding service
  const suggestions = [];

  if (currentValue && currentValue.length >= 2) {
    // Mock location suggestions - in production, use Google Places API or similar
    const mockSuggestions = [
      'Kathmandu, Nepal',
      'Lalitpur, Nepal', 
      'Bhaktapur, Nepal',
      'Pokhara, Nepal'
    ].filter(place => 
      place.toLowerCase().includes(currentValue.toLowerCase())
    );

    mockSuggestions.forEach(place => {
      suggestions.push({
        value: place,
        type: 'location',
        confidence: 0.8,
        label: 'Location suggestion'
      });
    });
  }

  return suggestions;
}

async function getServiceSuggestions(currentValue: string | null, context: any) {
  const suggestions = [];

  // Get popular services
  const services = await prisma.service.findMany({
    where: {
      isActive: true,
      ...(currentValue && {
        OR: [
          { name: { contains: currentValue, mode: 'insensitive' } },
          { category: { contains: currentValue, mode: 'insensitive' } }
        ]
      })
    },
    orderBy: {
      createdAt: 'desc' // In production, order by popularity
    },
    take: 5
  });

  services.forEach(service => {
    suggestions.push({
      value: service.name,
      type: 'service',
      confidence: 0.7,
      label: `${service.category} service`,
      metadata: {
        serviceId: service.id,
        category: service.category,
        price: service.basePrice
      }
    });
  });

  return suggestions;
}

function rankAndDedupeSuggestions(suggestions: any[], currentValue: string | null) {
  // Remove duplicates
  const uniqueSuggestions = suggestions.reduce((acc, current) => {
    const exists = acc.find(item => 
      item.value.toLowerCase() === current.value.toLowerCase()
    );
    
    if (!exists) {
      acc.push(current);
    } else if (current.confidence > exists.confidence) {
      // Replace with higher confidence suggestion
      const index = acc.indexOf(exists);
      acc[index] = current;
    }
    
    return acc;
  }, []);

  // Rank by relevance and confidence
  return uniqueSuggestions
    .map(suggestion => ({
      ...suggestion,
      relevanceScore: calculateRelevance(suggestion.value, currentValue, suggestion.confidence)
    }))
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 8);
}

function calculateRelevance(suggestionValue: string, currentValue: string | null, confidence: number) {
  let relevance = confidence;

  if (currentValue) {
    const currentLower = currentValue.toLowerCase();
    const suggestionLower = suggestionValue.toLowerCase();

    // Boost score for exact start matches
    if (suggestionLower.startsWith(currentLower)) {
      relevance += 0.3;
    }
    // Boost score for containing the current value
    else if (suggestionLower.includes(currentLower)) {
      relevance += 0.1;
    }

    // Calculate string similarity
    const similarity = calculateStringSimilarity(currentLower, suggestionLower);
    relevance += similarity * 0.2;
  }

  return Math.min(1, relevance);
}

function calculateStringSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1;

  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
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

  return matrix[str2.length][str1.length];
}

function calculateSuggestionConfidence(suggestions: any[], currentValue: string | null) {
  if (suggestions.length === 0) return 0;
  
  const avgConfidence = suggestions.reduce((sum, s) => sum + s.confidence, 0) / suggestions.length;
  
  // Boost confidence if we have exact matches
  if (currentValue && suggestions.some(s => s.value.toLowerCase() === currentValue.toLowerCase())) {
    return Math.min(1, avgConfidence + 0.2);
  }
  
  return avgConfidence;
}

async function getFieldType(formType: string, fieldName: string) {
  // Determine field type based on name and form type
  const fieldTypes = {
    email: 'email',
    phone: 'tel',
    address: 'text',
    city: 'text',
    name: 'text',
    description: 'textarea',
    notes: 'textarea',
    time: 'time',
    date: 'date',
    price: 'number'
  };

  for (const [key, type] of Object.entries(fieldTypes)) {
    if (fieldName.toLowerCase().includes(key)) {
      return type;
    }
  }

  return 'text';
}

async function getValidationRules(formType: string, fieldName: string) {
  const rules: any = {};

  // Common validation rules based on field type
  if (isPhoneField(fieldName)) {
    rules.pattern = '^[+]?[977][0-9]{8,10}$';
    rules.message = 'Please enter a valid Nepal phone number';
  } else if (fieldName.toLowerCase().includes('email')) {
    rules.pattern = '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$';
    rules.message = 'Please enter a valid email address';
  } else if (isAddressField(fieldName)) {
    rules.minLength = 5;
    rules.message = 'Please enter a complete address';
  }

  return rules;
}

function isAddressField(fieldName: string): boolean {
  const addressFields = ['address', 'location', 'area', 'city', 'district'];
  return addressFields.some(field => fieldName.toLowerCase().includes(field));
}

function isPhoneField(fieldName: string): boolean {
  const phoneFields = ['phone', 'mobile', 'contact', 'tel'];
  return phoneFields.some(field => fieldName.toLowerCase().includes(field));
}

function isServiceField(fieldName: string): boolean {
  const serviceFields = ['service', 'category', 'type'];
  return serviceFields.some(field => fieldName.toLowerCase().includes(field));
}

function canBulkFill(formType: string, fieldName: string): boolean {
  // Define which fields support bulk filling
  const bulkFillForms = ['booking', 'registration'];
  const bulkFillFields = ['address', 'phone', 'email', 'name'];
  
  return bulkFillForms.includes(formType) && 
         bulkFillFields.some(field => fieldName.toLowerCase().includes(field));
}

async function logFormBehavior(
  userId: string,
  formType: string,
  fieldName: string,
  value: string | null,
  context: any
) {
  try {
    // Find existing form behavior for this session or create new
    const sessionId = context?.sessionId || `form_${Date.now()}`;
    
    const formBehavior = await prisma.formBehavior.findFirst({
      where: {
        userId,
        formType,
        fieldData: {
          path: ['sessionId'],
          equals: sessionId
        }
      }
    });

    const fieldData = formBehavior?.fieldData as any || { sessionId };
    fieldData[fieldName] = value;
    fieldData.lastUpdated = new Date().toISOString();

    if (formBehavior) {
      await prisma.formBehavior.update({
        where: { id: formBehavior.id },
        data: { fieldData }
      });
    } else {
      await prisma.formBehavior.create({
        data: {
          userId,
          formType,
          fieldData,
          completionTime: 0, // Will be updated when form is completed
          abandonedFields: [],
          correctedFields: {}
        }
      });
    }
  } catch (error) {
    console.error('Failed to log form behavior:', error);
  }
}

async function recordFormCompletion(
  userId: string,
  formType: string,
  completedData: any,
  completionTime: number,
  errors: any
) {
  await prisma.formBehavior.create({
    data: {
      userId,
      formType,
      fieldData: completedData,
      completionTime,
      abandonedFields: errors?.abandonedFields || [],
      correctedFields: errors?.correctedFields || {}
    }
  });
}

async function updateFormTemplates(formType: string, completedData: any) {
  // Update form templates based on successful completions
  for (const [fieldName, value] of Object.entries(completedData)) {
    if (typeof value !== 'string' || !value.trim()) continue;

    try {
      await prisma.formTemplate.upsert({
        where: {
          formType_fieldName: {
            formType,
            fieldName
          }
        },
        update: {
          predictions: {
            // This would need more sophisticated logic to update predictions array
            push: {
              value: value.trim(),
              frequency: 1,
              lastUsed: new Date()
            }
          },
          popularity: {
            increment: 1
          }
        },
        create: {
          formType,
          fieldName,
          predictions: [{
            value: value.trim(),
            frequency: 1,
            lastUsed: new Date()
          }],
          dependencies: {},
          validation: {},
          autoFillRules: {},
          popularity: 1
        }
      });
    } catch (error) {
      console.error(`Failed to update template for ${fieldName}:`, error);
    }
  }
}