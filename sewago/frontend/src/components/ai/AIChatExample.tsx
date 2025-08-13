'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, Bot } from 'lucide-react';
import { CompactAssistantBubble } from './AssistantBubble';
import { t } from '@/lib/i18n';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  aiResponse?: {
    intent: string;
    slots: any;
    sources: Array<{ kind: 'db' | 'doc'; label: string; section?: string }>;
    confidence: number;
  };
}

interface AIChatExampleProps {
  locale?: 'en' | 'ne';
  userId?: string;
  context?: {
    serviceId?: string;
    district?: string;
  };
}

export function AIChatExample({ 
  locale = 'en', 
  userId = 'user-123',
  context = {}
}: AIChatExampleProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: locale === 'ne' 
        ? 'नमस्ते! म तपाईंलाई कसरी मद्दत गर्न सक्छु?'
        : 'Hello! How can I help you today?',
      isUser: false,
      timestamp: new Date(),
      aiResponse: {
        intent: 'general_question',
        slots: {},
        sources: [],
        confidence: 1.0
      }
    }
  ]);
  
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    
    try {
      // Call AI API
      const response = await fetch('/api/ai/handle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText,
          locale,
          context: {
            userId,
            ...context
          }
        })
      });
      
      if (!response.ok) {
        throw new Error('AI request failed');
      }
      
      const aiData = await response.json();
      
      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiData.answer,
        isUser: false,
        timestamp: new Date(),
        aiResponse: {
          intent: aiData.intent,
          slots: aiData.slots,
          sources: aiData.sources,
          confidence: aiData.confidence
        }
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // If this was a successful booking, show success message
      if (aiData.intent === 'book_service' && aiData.toolResult?.ok) {
        const successMessage: Message = {
          id: (Date.now() + 2).toString(),
          text: locale === 'ne' 
            ? `✅ बुकिङ सफल! बुकिङ ID: ${aiData.toolResult.data.bookingId}`
            : `✅ Booking successful! Booking ID: ${aiData.toolResult.data.bookingId}`,
          isUser: false,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, successMessage]);
      }
      
    } catch (error) {
      console.error('AI chat error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: locale === 'ne' 
          ? 'माफ गर्नुहोस्, मलाई एउटा त्रुटि भयो। कृपया पुनः प्रयास गर्नुहोस्।'
          : 'Sorry, I encountered an error. Please try again.',
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Smart reply suggestions
  const getSmartReplies = () => {
    const replies = {
      en: [
        'Book house cleaning for tomorrow',
        'How much does electrical work cost?',
        'What is your cancellation policy?',
        'I need a plumber in Kathmandu'
      ],
      ne: [
        'भोलि घर सफाई बुक गर्नुहोस्',
        'बिजुली कामको लागत कति छ?',
        'तपाईंको रद्दीकरण नीति के हो?',
        'मलाई काठमाडौंमा प्लम्बर चाहिन्छ'
      ]
    };
    
    return replies[locale];
  };
  
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 rounded-t-lg">
        <div className="flex items-center space-x-3">
          <Bot className="w-6 h-6" />
          <div>
            <h3 className="font-semibold">
              {locale === 'ne' ? 'SewaGo AI सहायक' : 'SewaGo AI Assistant'}
            </h3>
            <p className="text-blue-100 text-sm">
              {locale === 'ne' 
                ? 'स्थानीय सेवाहरू बुक गर्न र प्रश्नहरूको जवाफ पाउन' 
                : 'Book local services and get answers to your questions'
              }
            </p>
          </div>
        </div>
      </div>
      
      {/* Messages */}
      <div className="h-96 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
            {!message.isUser && (
              <div className="flex-shrink-0 mr-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-blue-600" />
                </div>
              </div>
            )}
            
            <div className={`max-w-xs lg:max-w-md ${message.isUser ? 'order-2' : 'order-1'}`}>
              {message.isUser ? (
                <div className="bg-blue-600 text-white rounded-lg px-4 py-2">
                  <p className="text-sm">{message.text}</p>
                </div>
              ) : (
                <CompactAssistantBubble
                  message={message.text}
                  sources={message.aiResponse?.sources || []}
                  confidence={message.aiResponse?.confidence || 1.0}
                  locale={locale}
                />
              )}
              
              <div className={`text-xs text-gray-500 mt-1 ${message.isUser ? 'text-right' : 'text-left'}`}>
                {message.timestamp.toLocaleTimeString(locale === 'ne' ? 'ne-NP' : 'en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
            
            {message.isUser && (
              <div className="flex-shrink-0 ml-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-gray-600" />
                </div>
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex-shrink-0 mr-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Smart Replies */}
      <div className="px-4 pb-2">
        <div className="flex flex-wrap gap-2">
          {getSmartReplies().map((reply, index) => (
            <button
              key={index}
              onClick={() => setInputText(reply)}
              className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
            >
              {reply}
            </button>
          ))}
        </div>
      </div>
      
      {/* Input */}
      <div className="border-t p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={locale === 'ne' 
              ? 'आफ्नो सन्देश यहाँ लेख्नुहोस्...' 
              : 'Type your message here...'
            }
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        
        <p className="text-xs text-gray-500 mt-2 text-center">
          {locale === 'ne' 
            ? 'AI सहायकले तपाईंको सहायता गर्नेछ। तपाईंले सेवा बुक गर्न, मूल्य जान्न, र प्रश्नहरूको जवाफ पाउन सक्नुहुन्छ।'
            : 'AI assistant is here to help. You can book services, get pricing, and ask questions.'
          }
        </p>
      </div>
    </div>
  );
}
