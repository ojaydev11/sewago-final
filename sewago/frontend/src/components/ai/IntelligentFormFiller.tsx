'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Brain,
  MapPin,
  Phone,
  Mail,
  User,
  Clock,
  Target,
  CheckCircle,
  XCircle,
  Lightbulb,
  Wand2,
  ArrowRight,
  Sparkles,
  Globe,
  Calendar
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface FormSuggestion {
  value: string;
  type: 'user_history' | 'template' | 'contextual' | 'location' | 'service';
  confidence: number;
  label: string;
  metadata?: any;
  relevanceScore?: number;
}

interface IntelligentFormFillerProps {
  fieldName: string;
  formType: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  userId?: string;
  context?: any;
  formData?: Record<string, any>;
  className?: string;
  disabled?: boolean;
  type?: string;
}

export function IntelligentFormFiller({
  fieldName,
  formType,
  value,
  onChange,
  placeholder,
  userId,
  context,
  formData = {},
  className = "",
  disabled = false,
  type = 'text'
}: IntelligentFormFillerProps) {
  const [suggestions, setSuggestions] = useState<FormSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [validationRules, setValidationRules] = useState<any>(null);
  const [fieldType, setFieldType] = useState(type);
  const [smartFeatures, setSmartFeatures] = useState<any>(null);
  const [confidence, setConfidence] = useState(0);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef(`form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  // Debounced suggestion fetching
  useEffect(() => {
    if (!aiEnabled || disabled) return;

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    const timeout = setTimeout(() => {
      if (value.length >= 1 || fieldName.toLowerCase().includes('address')) {
        fetchSuggestions();
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    setTypingTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [value, fieldName, formType, aiEnabled, disabled]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showSuggestions || suggestions.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
            applySuggestion(suggestions[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setShowSuggestions(false);
          break;
      }
    };

    if (showSuggestions) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [showSuggestions, suggestions, selectedIndex]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        ((inputRef.current && !inputRef.current.contains(event.target as Node)) ||
         (textareaRef.current && !textareaRef.current.contains(event.target as Node)))
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async () => {
    setIsLoading(true);
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
            sessionId: sessionId.current,
            timestamp: new Date().toISOString()
          },
          formData
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
        setConfidence(data.confidence || 0);
        setValidationRules(data.validationRules);
        setFieldType(data.fieldType || type);
        setSmartFeatures(data.smartFeatures);
        
        if (data.suggestions?.length > 0) {
          setShowSuggestions(true);
          setSelectedIndex(0);
        }
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applySuggestion = useCallback(async (suggestion: FormSuggestion) => {
    onChange(suggestion.value);
    setShowSuggestions(false);
    
    // Log the suggestion usage
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
          sessionId: sessionId.current
        }),
      });
    } catch (error) {
      console.error('Failed to log suggestion usage:', error);
    }

    toast.success('Auto-fill applied!', {
      duration: 1500,
      icon: <Zap className="h-4 w-4" />
    });
  }, [onChange, userId, fieldName, formType]);

  const handleBulkFill = async () => {
    if (!smartFeatures?.hasBulkFill) return;

    try {
      const response = await fetch('/api/ai/form-autofill/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          formType,
          currentData: formData,
          context
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.bulkFillData) {
          Object.entries(data.bulkFillData).forEach(([field, fillValue]) => {
            if (field === fieldName) {
              onChange(fillValue as string);
            }
            // For other fields, you'd need to pass a callback to update them
          });
          
          toast.success('Form auto-filled with your data!');
        }
      }
    } catch (error) {
      console.error('Bulk fill error:', error);
      toast.error('Failed to auto-fill form');
    }
  };

  const getSuggestionIcon = (type: string) => {
    const icons = {
      user_history: User,
      template: Target,
      contextual: Brain,
      location: MapPin,
      service: Sparkles
    };
    
    const IconComponent = icons[type as keyof typeof icons] || Lightbulb;
    return <IconComponent className="h-4 w-4" />;
  };

  const getSuggestionColor = (type: string) => {
    const colors = {
      user_history: 'text-blue-600 bg-blue-100',
      template: 'text-green-600 bg-green-100',
      contextual: 'text-purple-600 bg-purple-100',
      location: 'text-orange-600 bg-orange-100',
      service: 'text-pink-600 bg-pink-100'
    };
    
    return colors[type as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  const getFieldIcon = () => {
    if (fieldName.toLowerCase().includes('phone')) return <Phone className="h-4 w-4" />;
    if (fieldName.toLowerCase().includes('email')) return <Mail className="h-4 w-4" />;
    if (fieldName.toLowerCase().includes('address')) return <MapPin className="h-4 w-4" />;
    if (fieldName.toLowerCase().includes('time')) return <Clock className="h-4 w-4" />;
    if (fieldName.toLowerCase().includes('date')) return <Calendar className="h-4 w-4" />;
    if (fieldName.toLowerCase().includes('location')) return <Globe className="h-4 w-4" />;
    return <User className="h-4 w-4" />;
  };

  const renderInput = () => {
    const commonProps = {
      value,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
        onChange(e.target.value),
      placeholder,
      disabled,
      className: `${className} ${aiEnabled ? 'pr-10' : ''}`,
      onFocus: () => {
        if (suggestions.length > 0) {
          setShowSuggestions(true);
        }
      }
    };

    if (fieldType === 'textarea') {
      return <Textarea {...commonProps} rows={3} ref={textareaRef} />;
    }

    return <Input {...commonProps} type={fieldType} ref={inputRef} />;
  };

  return (
    <div className="relative">
      {/* AI Toggle and Smart Features */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {getFieldIcon()}
          <span className="text-sm font-medium text-gray-700 capitalize">
            {fieldName.replace(/([A-Z])/g, ' $1').toLowerCase()}
          </span>
          {aiEnabled && confidence > 0 && (
            <Badge variant="secondary" className="text-xs">
              <Brain className="h-3 w-3 mr-1" />
              {Math.round(confidence * 100)}% confident
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {smartFeatures?.hasBulkFill && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkFill}
              className="h-7 text-xs"
            >
              <Wand2 className="h-3 w-3 mr-1" />
              Auto-fill
            </Button>
          )}
          
          <div className="flex items-center space-x-1">
            <Switch
              checked={aiEnabled}
              onCheckedChange={setAiEnabled}
              disabled={disabled}
            />
            <span className="text-xs text-gray-500">AI</span>
          </div>
        </div>
      </div>

      {/* Input Field */}
      <div className="relative">
        {renderInput()}
        
        {/* AI Indicator */}
        {aiEnabled && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {isLoading ? (
              <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
            ) : suggestions.length > 0 ? (
              <Brain className="h-4 w-4 text-blue-500" />
            ) : (
              <Zap className="h-4 w-4 text-gray-400" />
            )}
          </div>
        )}
      </div>

      {/* Validation Feedback */}
      {validationRules && value && (
        <div className="mt-1">
          {validationRules.pattern && !new RegExp(validationRules.pattern).test(value) && (
            <div className="flex items-center space-x-1 text-red-600 text-xs">
              <XCircle className="h-3 w-3" />
              <span>{validationRules.message}</span>
            </div>
          )}
        </div>
      )}

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            ref={suggestionsRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50 max-h-80 overflow-y-auto"
          >
            {/* Header */}
            <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Smart Suggestions</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {suggestions.length}
                </Badge>
              </div>
            </div>

            {/* Suggestions List */}
            <div className="py-1">
              {suggestions.map((suggestion, index) => (
                <motion.div
                  key={`${suggestion.value}-${index}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`px-3 py-2 cursor-pointer transition-colors duration-150 ${
                    index === selectedIndex
                      ? 'bg-blue-50 border-l-2 border-l-blue-500'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => applySuggestion(suggestion)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${getSuggestionColor(suggestion.type)}`}>
                      {getSuggestionIcon(suggestion.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {suggestion.value}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-500 truncate">
                          {suggestion.label}
                        </span>
                        <div className="flex items-center space-x-1">
                          <div className={`w-2 h-2 rounded-full ${
                            suggestion.confidence >= 0.8 ? 'bg-green-500' :
                            suggestion.confidence >= 0.6 ? 'bg-yellow-500' : 'bg-orange-500'
                          }`} />
                          <span className="text-xs text-gray-400">
                            {Math.round(suggestion.confidence * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  </div>

                  {/* Metadata */}
                  {suggestion.metadata && (
                    <div className="mt-2 pl-9">
                      {suggestion.metadata.category && (
                        <Badge variant="outline" className="text-xs mr-2">
                          {suggestion.metadata.category}
                        </Badge>
                      )}
                      {suggestion.metadata.price && (
                        <Badge variant="outline" className="text-xs">
                          NPR {suggestion.metadata.price}
                        </Badge>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-3 py-2 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Use ↑↓ keys to navigate, Enter to select</span>
                <div className="flex items-center space-x-1">
                  <Brain className="h-3 w-3" />
                  <span>AI-powered</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Smart Features Indicators */}
      {aiEnabled && smartFeatures && (
        <div className="flex items-center space-x-2 mt-2">
          {smartFeatures.hasAddressPrediction && (
            <Badge variant="outline" className="text-xs">
              <MapPin className="h-3 w-3 mr-1" />
              Location AI
            </Badge>
          )}
          {smartFeatures.hasPhonePrediction && (
            <Badge variant="outline" className="text-xs">
              <Phone className="h-3 w-3 mr-1" />
              Phone AI
            </Badge>
          )}
          {smartFeatures.hasServicePrediction && (
            <Badge variant="outline" className="text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              Service AI
            </Badge>
          )}
        </div>
      )}

      {/* Confidence Indicator */}
      {aiEnabled && confidence > 0 && (
        <div className="mt-2">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>AI Confidence</span>
            <span>{Math.round(confidence * 100)}%</span>
          </div>
          <Progress value={confidence * 100} className="h-1" />
        </div>
      )}
    </div>
  );
}