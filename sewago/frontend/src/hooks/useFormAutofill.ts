'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useDebounce } from './useDebounce';

interface FormSuggestion {
  value: string;
  type: 'user_history' | 'template' | 'contextual' | 'location' | 'service';
  confidence: number;
  label: string;
  metadata?: any;
  relevanceScore?: number;
}

interface ValidationRule {
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  required?: boolean;
  message: string;
}

interface SmartFeatures {
  hasAddressPrediction: boolean;
  hasPhonePrediction: boolean;
  hasServicePrediction: boolean;
  hasBulkFill: boolean;
}

interface FormField {
  name: string;
  value: string;
  type: string;
  suggestions: FormSuggestion[];
  validationRules?: ValidationRule;
  smartFeatures?: SmartFeatures;
  confidence: number;
  isLoading: boolean;
  error?: string;
}

interface BulkFillData {
  [fieldName: string]: string;
}

interface UseFormAutofillConfig {
  formType: string;
  userId?: string;
  context?: any;
  debounceMs?: number;
  minQueryLength?: number;
  enableBulkFill?: boolean;
  enableValidation?: boolean;
  enableLearning?: boolean;
}

interface UseFormAutofillReturn {
  // Field management
  fields: Map<string, FormField>;
  getField: (fieldName: string) => FormField | undefined;
  setFieldValue: (fieldName: string, value: string) => void;
  registerField: (fieldName: string, initialValue?: string, type?: string) => void;
  unregisterField: (fieldName: string) => void;
  
  // Suggestions
  getSuggestions: (fieldName: string) => FormSuggestion[];
  applySuggestion: (fieldName: string, suggestion: FormSuggestion) => void;
  
  // Validation
  validateField: (fieldName: string) => boolean;
  validateForm: () => boolean;
  getFieldErrors: () => Record<string, string>;
  
  // Bulk operations
  bulkFill: () => Promise<boolean>;
  clearForm: () => void;
  fillFromTemplate: (templateName: string) => Promise<boolean>;
  
  // Form state
  formData: Record<string, string>;
  isValid: boolean;
  hasChanges: boolean;
  isLoading: boolean;
  
  // Learning and analytics
  recordFormCompletion: (completionTime: number, errors?: any) => Promise<void>;
  recordFieldInteraction: (fieldName: string, action: string, data?: any) => Promise<void>;
  
  // Utilities
  reset: () => void;
  export: () => Record<string, any>;
  import: (data: Record<string, any>) => void;
}

export function useFormAutofill(config: UseFormAutofillConfig): UseFormAutofillReturn {
  const {
    formType,
    userId,
    context = {},
    debounceMs = 300,
    minQueryLength = 1,
    enableBulkFill = true,
    enableValidation = true,
    enableLearning = true
  } = config;

  // State
  const [fields, setFields] = useState<Map<string, FormField>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Refs
  const sessionIdRef = useRef(`form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const startTimeRef = useRef<number>(Date.now());
  const interactionLogRef = useRef<Array<{
    fieldName: string;
    action: string;
    timestamp: number;
    data?: any;
  }>>([]);

  // Initialize
  useEffect(() => {
    startTimeRef.current = Date.now();
    setHasChanges(false);
  }, []);

  // Auto-save interactions periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (interactionLogRef.current.length > 0 && enableLearning) {
        flushInteractionLog();
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [enableLearning]);

  const registerField = useCallback((fieldName: string, initialValue = '', type = 'text') => {
    setFields(prev => {
      const newFields = new Map(prev);
      newFields.set(fieldName, {
        name: fieldName,
        value: initialValue,
        type,
        suggestions: [],
        confidence: 0,
        isLoading: false
      });
      return newFields;
    });

    // Fetch initial suggestions and validation rules
    if (initialValue.length >= minQueryLength) {
      fetchFieldData(fieldName, initialValue);
    } else {
      fetchFieldMetadata(fieldName);
    }
  }, [minQueryLength]);

  const unregisterField = useCallback((fieldName: string) => {
    setFields(prev => {
      const newFields = new Map(prev);
      newFields.delete(fieldName);
      return newFields;
    });
  }, []);

  const setFieldValue = useCallback((fieldName: string, value: string) => {
    setFields(prev => {
      const newFields = new Map(prev);
      const field = newFields.get(fieldName);
      
      if (field) {
        newFields.set(fieldName, {
          ...field,
          value,
          error: enableValidation ? validateFieldValue(field, value) : undefined
        });
      }
      
      return newFields;
    });

    setHasChanges(true);
    
    // Log interaction
    logInteraction(fieldName, 'value_changed', { value, timestamp: Date.now() });

    // Fetch suggestions with debouncing
    const timeoutId = setTimeout(() => {
      if (value.length >= minQueryLength) {
        fetchFieldData(fieldName, value);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [enableValidation, minQueryLength, debounceMs]);

  const fetchFieldData = async (fieldName: string, value: string) => {
    setFields(prev => {
      const newFields = new Map(prev);
      const field = newFields.get(fieldName);
      if (field) {
        newFields.set(fieldName, { ...field, isLoading: true });
      }
      return newFields;
    });

    try {
      const response = await fetch('/api/ai/form-autofill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          formType,
          fieldName,
          currentValue: value,
          context: {
            ...context,
            sessionId: sessionIdRef.current
          },
          formData: getFormData()
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        setFields(prev => {
          const newFields = new Map(prev);
          const field = newFields.get(fieldName);
          
          if (field) {
            newFields.set(fieldName, {
              ...field,
              suggestions: data.suggestions || [],
              confidence: data.confidence || 0,
              validationRules: data.validationRules,
              smartFeatures: data.smartFeatures,
              type: data.fieldType || field.type,
              isLoading: false,
              error: enableValidation && field.value 
                ? validateFieldValue({...field, validationRules: data.validationRules}, field.value)
                : undefined
            });
          }
          
          return newFields;
        });
      }
    } catch (error) {
      console.error('Failed to fetch field data:', error);
      
      setFields(prev => {
        const newFields = new Map(prev);
        const field = newFields.get(fieldName);
        if (field) {
          newFields.set(fieldName, { ...field, isLoading: false });
        }
        return newFields;
      });
    }
  };

  const fetchFieldMetadata = async (fieldName: string) => {
    try {
      const response = await fetch('/api/ai/form-autofill/metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formType,
          fieldName
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        setFields(prev => {
          const newFields = new Map(prev);
          const field = newFields.get(fieldName);
          
          if (field) {
            newFields.set(fieldName, {
              ...field,
              validationRules: data.validationRules,
              smartFeatures: data.smartFeatures,
              type: data.fieldType || field.type
            });
          }
          
          return newFields;
        });
      }
    } catch (error) {
      console.error('Failed to fetch field metadata:', error);
    }
  };

  const applySuggestion = useCallback((fieldName: string, suggestion: FormSuggestion) => {
    setFieldValue(fieldName, suggestion.value);
    
    // Log suggestion usage
    logInteraction(fieldName, 'suggestion_applied', {
      suggestion,
      timestamp: Date.now()
    });

    // Track suggestion usage for learning
    if (enableLearning) {
      trackSuggestionUsage(fieldName, suggestion);
    }
  }, [enableLearning]);

  const validateFieldValue = (field: FormField, value: string): string | undefined => {
    if (!field.validationRules) return undefined;
    
    const rules = field.validationRules;
    
    if (rules.required && !value.trim()) {
      return 'This field is required';
    }
    
    if (rules.minLength && value.length < rules.minLength) {
      return `Must be at least ${rules.minLength} characters long`;
    }
    
    if (rules.maxLength && value.length > rules.maxLength) {
      return `Must not exceed ${rules.maxLength} characters`;
    }
    
    if (rules.pattern && !new RegExp(rules.pattern).test(value)) {
      return rules.message || 'Invalid format';
    }
    
    return undefined;
  };

  const validateField = useCallback((fieldName: string): boolean => {
    const field = fields.get(fieldName);
    if (!field) return true;
    
    const error = enableValidation ? validateFieldValue(field, field.value) : undefined;
    
    setFields(prev => {
      const newFields = new Map(prev);
      newFields.set(fieldName, { ...field, error });
      return newFields;
    });
    
    return !error;
  }, [fields, enableValidation]);

  const validateForm = useCallback((): boolean => {
    let isValid = true;
    
    for (const fieldName of Array.from(fields.keys())) {
      const fieldValid = validateField(fieldName);
      isValid = isValid && fieldValid;
    }
    
    return isValid;
  }, [fields, validateField]);

  const bulkFill = async (): Promise<boolean> => {
    if (!enableBulkFill || !userId) return false;

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/ai/form-autofill/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          formType,
          currentData: getFormData(),
          context
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const bulkData: BulkFillData = data.bulkFillData || {};
        
        // Apply bulk fill data
        setFields(prev => {
          const newFields = new Map(prev);
          
          Object.entries(bulkData).forEach(([fieldName, value]) => {
            const field = newFields.get(fieldName);
            if (field && !field.value) { // Only fill empty fields
              newFields.set(fieldName, { ...field, value });
            }
          });
          
          return newFields;
        });

        setHasChanges(true);
        logInteraction('form', 'bulk_filled', { fieldsCount: Object.keys(bulkData).length });
        
        return true;
      }
    } catch (error) {
      console.error('Bulk fill error:', error);
    } finally {
      setIsLoading(false);
    }
    
    return false;
  };

  const clearForm = useCallback(() => {
    setFields(prev => {
      const newFields = new Map(prev);
      
      for (const [fieldName, field] of newFields.entries()) {
        newFields.set(fieldName, {
          ...field,
          value: '',
          error: undefined,
          suggestions: []
        });
      }
      
      return newFields;
    });
    
    setHasChanges(false);
    logInteraction('form', 'cleared');
  }, []);

  const fillFromTemplate = async (templateName: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/ai/form-autofill/template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formType,
          templateName,
          userId
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const templateData = data.templateData || {};
        
        setFields(prev => {
          const newFields = new Map(prev);
          
          Object.entries(templateData).forEach(([fieldName, value]) => {
            const field = newFields.get(fieldName);
            if (field) {
              newFields.set(fieldName, { ...field, value: value as string });
            }
          });
          
          return newFields;
        });

        setHasChanges(true);
        logInteraction('form', 'template_filled', { templateName });
        
        return true;
      }
    } catch (error) {
      console.error('Template fill error:', error);
    }
    
    return false;
  };

  const recordFormCompletion = async (completionTime: number, errors?: any) => {
    if (!enableLearning) return;

    try {
      await fetch('/api/ai/form-autofill', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          formType,
          completedData: getFormData(),
          completionTime,
          errors: errors || getFieldErrors()
        }),
      });
    } catch (error) {
      console.error('Failed to record form completion:', error);
    }
  };

  const recordFieldInteraction = async (fieldName: string, action: string, data?: any) => {
    logInteraction(fieldName, action, data);
  };

  const logInteraction = (fieldName: string, action: string, data?: any) => {
    interactionLogRef.current.push({
      fieldName,
      action,
      timestamp: Date.now(),
      data
    });

    // Flush if log gets too large
    if (interactionLogRef.current.length > 50) {
      flushInteractionLog();
    }
  };

  const flushInteractionLog = async () => {
    if (interactionLogRef.current.length === 0) return;

    const log = [...interactionLogRef.current];
    interactionLogRef.current = [];

    try {
      await fetch('/api/ai/form-autofill/interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          formType,
          sessionId: sessionIdRef.current,
          interactions: log
        }),
      });
    } catch (error) {
      console.error('Failed to flush interaction log:', error);
      // Put back the log on failure
      interactionLogRef.current.unshift(...log);
    }
  };

  const trackSuggestionUsage = async (fieldName: string, suggestion: FormSuggestion) => {
    try {
      await fetch('/api/ai/form-autofill/usage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          fieldName,
          formType,
          suggestion,
          sessionId: sessionIdRef.current
        }),
      });
    } catch (error) {
      console.error('Failed to track suggestion usage:', error);
    }
  };

  // Utility functions
  const getField = useCallback((fieldName: string): FormField | undefined => {
    return fields.get(fieldName);
  }, [fields]);

  const getSuggestions = useCallback((fieldName: string): FormSuggestion[] => {
    const field = fields.get(fieldName);
    return field?.suggestions || [];
  }, [fields]);

  const getFormData = useCallback((): Record<string, string> => {
    const data: Record<string, string> = {};
    for (const [fieldName, field] of fields.entries()) {
      data[fieldName] = field.value;
    }
    return data;
  }, [fields]);

  const getFieldErrors = useCallback((): Record<string, string> => {
    const errors: Record<string, string> = {};
    for (const [fieldName, field] of fields.entries()) {
      if (field.error) {
        errors[fieldName] = field.error;
      }
    }
    return errors;
  }, [fields]);

  const reset = useCallback(() => {
    setFields(new Map());
    setHasChanges(false);
    setIsLoading(false);
    startTimeRef.current = Date.now();
    interactionLogRef.current = [];
    sessionIdRef.current = `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const exportData = useCallback(() => {
    return {
      formData: getFormData(),
      formType,
      sessionId: sessionIdRef.current,
      startTime: startTimeRef.current,
      interactions: interactionLogRef.current,
      hasChanges,
      isValid: validateForm()
    };
  }, [getFormData, formType, hasChanges, validateForm]);

  const importData = useCallback((data: Record<string, any>) => {
    if (data.formData) {
      Object.entries(data.formData).forEach(([fieldName, value]) => {
        registerField(fieldName, value as string);
      });
    }
  }, [registerField]);

  const isValid = Array.from(fields.values()).every(field => !field.error);

  return {
    // Field management
    fields,
    getField,
    setFieldValue,
    registerField,
    unregisterField,
    
    // Suggestions
    getSuggestions,
    applySuggestion,
    
    // Validation
    validateField,
    validateForm,
    getFieldErrors,
    
    // Bulk operations
    bulkFill,
    clearForm,
    fillFromTemplate,
    
    // Form state
    formData: getFormData(),
    isValid,
    hasChanges,
    isLoading,
    
    // Learning and analytics
    recordFormCompletion,
    recordFieldInteraction,
    
    // Utilities
    reset,
    export: exportData,
    import: importData
  };
}