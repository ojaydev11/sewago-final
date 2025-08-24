'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Mic,
  Bell,
  Search,
  Wand2,
  Zap,
  Target,
  Users,
  TrendingUp,
  Sparkles,
  Globe,
  MessageSquare,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { SmartNotificationCenter } from '@/components/ai/SmartNotificationCenter';
import { VoiceCommandProcessor } from '@/components/ai/VoiceCommandProcessor';
import { PredictiveSearchEngine } from '@/components/ai/PredictiveSearchEngine';
import { SearchAnalytics } from '@/components/ai/SearchAnalytics';
import { IntelligentFormFiller } from '@/components/ai/IntelligentFormFiller';
import { useVoiceCommands } from '@/hooks/useVoiceCommands';
import { usePredictiveSearch } from '@/hooks/usePredictiveSearch';
import { useSmartNotifications } from '@/hooks/useSmartNotifications';
import { useFormAutofill } from '@/hooks/useFormAutofill';

interface SmartFeaturesShowcaseProps {
  userId?: string;
  className?: string;
}

export function SmartFeaturesShowcase({
  userId = 'demo-user',
  className = ""
}: SmartFeaturesShowcaseProps) {
  const [activeFeature, setActiveFeature] = useState<string>('overview');
  const [featuresEnabled, setFeaturesEnabled] = useState({
    predictiveSearch: true,
    voiceCommands: true,
    smartNotifications: true,
    formAutofill: true,
    analytics: true
  });

  // Initialize smart feature hooks
  const voiceCommands = useVoiceCommands({
    userId,
    language: 'en',
    continuous: false,
    enableAnalytics: true
  });

  const predictiveSearch = usePredictiveSearch({
    userId,
    location: { city: 'Kathmandu', lat: 27.7172, lng: 85.3240 },
    enableAnalytics: true,
    enableCorrections: true
  });

  const smartNotifications = useSmartNotifications({
    userId,
    enableRealtime: true,
    enableAnalytics: true,
    enableOptimization: true
  });

  const formAutofill = useFormAutofill({
    formType: 'booking',
    userId,
    enableBulkFill: true,
    enableValidation: true,
    enableLearning: true
  });

  const features = [
    {
      id: 'overview',
      title: 'Smart Features Overview',
      description: 'AI-powered enhancements for better user experience',
      icon: Brain,
      color: 'blue'
    },
    {
      id: 'search',
      title: 'Predictive Search',
      description: 'AI-powered search with intelligent suggestions',
      icon: Search,
      color: 'green'
    },
    {
      id: 'voice',
      title: 'Voice Commands',
      description: 'Natural language voice interactions',
      icon: Mic,
      color: 'purple'
    },
    {
      id: 'notifications',
      title: 'Smart Notifications',
      description: 'Context-aware, optimized notification delivery',
      icon: Bell,
      color: 'orange'
    },
    {
      id: 'forms',
      title: 'Form Auto-fill',
      description: 'Intelligent form completion and validation',
      icon: Wand2,
      color: 'pink'
    },
    {
      id: 'analytics',
      title: 'Analytics Dashboard',
      description: 'Usage insights and performance metrics',
      icon: TrendingUp,
      color: 'indigo'
    }
  ];

  const getFeatureStats = () => ({
    searchAccuracy: 94,
    voiceRecognition: 89,
    notificationEngagement: 76,
    formCompletion: 85,
    overallSatisfaction: 92
  });

  const stats = getFeatureStats();

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Feature Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.slice(1).map((feature) => (
          <motion.div
            key={feature.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: features.indexOf(feature) * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-${feature.color}-100`}>
                    <feature.icon className={`h-6 w-6 text-${feature.color}-600`} />
                  </div>
                  <Switch 
                    checked={featuresEnabled[feature.id as keyof typeof featuresEnabled]}
                    onCheckedChange={(checked) =>
                      setFeaturesEnabled(prev => ({ ...prev, [feature.id]: checked }))
                    }
                  />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{feature.description}</p>
                
                {/* Feature-specific metrics */}
                <div className="space-y-2">
                  {feature.id === 'search' && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span>Accuracy</span>
                        <span className="font-medium">{stats.searchAccuracy}%</span>
                      </div>
                      <Progress value={stats.searchAccuracy} className="h-2" />
                    </>
                  )}
                  
                  {feature.id === 'voice' && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span>Recognition Rate</span>
                        <span className="font-medium">{stats.voiceRecognition}%</span>
                      </div>
                      <Progress value={stats.voiceRecognition} className="h-2" />
                    </>
                  )}
                  
                  {feature.id === 'notifications' && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span>Engagement</span>
                        <span className="font-medium">{stats.notificationEngagement}%</span>
                      </div>
                      <Progress value={stats.notificationEngagement} className="h-2" />
                    </>
                  )}
                  
                  {feature.id === 'forms' && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span>Completion Rate</span>
                        <span className="font-medium">{stats.formCompletion}%</span>
                      </div>
                      <Progress value={stats.formCompletion} className="h-2" />
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Overall Performance */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-800">
            <Sparkles className="h-5 w-5" />
            <span>AI Performance Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {stats.overallSatisfaction}%
              </div>
              <div className="text-sm text-gray-600">User Satisfaction</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {predictiveSearch.searchHistory.length}
              </div>
              <div className="text-sm text-gray-600">Searches Performed</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {voiceCommands.commandHistory.length}
              </div>
              <div className="text-sm text-gray-600">Voice Commands</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-1">
                {smartNotifications.unreadCount}
              </div>
              <div className="text-sm text-gray-600">Active Notifications</div>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall AI Performance</span>
              <span className="font-medium">{stats.overallSatisfaction}%</span>
            </div>
            <Progress value={stats.overallSatisfaction} className="h-3" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderFeatureDemo = () => {
    switch (activeFeature) {
      case 'search':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI-Powered Predictive Search Demo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <PredictiveSearchEngine
                  placeholder="Try: 'Book house cleaning tomorrow' or 'Find electrical repair near me'"
                  showFilters={true}
                  showVoiceSearch={true}
                  onSearchPerformed={(query, results) => {
                    console.log('Search performed:', query, results);
                  }}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div>
                    <h4 className="font-medium mb-2">Recent Searches</h4>
                    <div className="space-y-1">
                      {predictiveSearch.searchHistory.slice(0, 5).map((query, index) => (
                        <Badge key={index} variant="outline" className="mr-2 mb-1">
                          {query}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Search Analytics</h4>
                    <div className="text-sm text-gray-600">
                      <div>• Predictions: {predictiveSearch.predictions.length}</div>
                      <div>• Suggestions: {predictiveSearch.suggestions.length}</div>
                      <div>• Session ID: {predictiveSearch.sessionId.slice(-8)}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <SearchAnalytics userId={userId} />
          </div>
        );

      case 'voice':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Voice Command Interface Demo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center space-y-4">
                    <Button
                      onClick={voiceCommands.toggleListening}
                      disabled={!voiceCommands.isSupported}
                      className="w-32 h-32 rounded-full"
                      variant={voiceCommands.isListening ? "destructive" : "default"}
                    >
                      <Mic className="h-8 w-8" />
                    </Button>
                    
                    <div className="text-sm text-gray-600">
                      {voiceCommands.isListening ? 'Listening...' : 'Click to start voice commands'}
                    </div>
                    
                    {voiceCommands.currentTranscript && (
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-blue-800">{voiceCommands.currentTranscript}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <VoiceCommandProcessor
              userId={userId}
              enableContinuousListening={false}
              language="en"
            />
          </div>
        );

      case 'notifications':
        return <SmartNotificationCenter userId={userId} />;

      case 'forms':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Intelligent Form Auto-fill Demo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <IntelligentFormFiller
                fieldName="address"
                formType="booking"
                value=""
                onChange={() => {}}
                placeholder="Start typing your address..."
                userId={userId}
                context={{ location: { city: 'Kathmandu' } }}
              />
              
              <IntelligentFormFiller
                fieldName="phoneNumber"
                formType="booking"
                value=""
                onChange={() => {}}
                placeholder="Phone number"
                userId={userId}
                type="tel"
              />
              
              <IntelligentFormFiller
                fieldName="serviceType"
                formType="booking"
                value=""
                onChange={() => {}}
                placeholder="What service do you need?"
                userId={userId}
              />
            </CardContent>
          </Card>
        );

      case 'analytics':
        return <SearchAnalytics userId={userId} adminView={false} />;

      default:
        return renderOverview();
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.h2 
          className="text-3xl font-bold text-gray-900"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Smart Features Powered by AI
        </motion.h2>
        <motion.p 
          className="text-lg text-gray-600 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Experience the future of service booking with intelligent search, voice commands, 
          contextual notifications, and smart form completion.
        </motion.p>
      </div>

      {/* Feature Navigation */}
      <div className="flex flex-wrap justify-center gap-2 p-4 bg-gray-50 rounded-xl">
        {features.map((feature) => (
          <Button
            key={feature.id}
            variant={activeFeature === feature.id ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFeature(feature.id)}
            className="flex items-center space-x-2"
          >
            <feature.icon className="h-4 w-4" />
            <span>{feature.title}</span>
          </Button>
        ))}
      </div>

      {/* Feature Demo Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeFeature}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderFeatureDemo()}
        </motion.div>
      </AnimatePresence>

      {/* Quick Actions */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <h3 className="font-semibold text-green-800 mb-1">
                Ready to experience smart booking?
              </h3>
              <p className="text-sm text-green-700">
                All AI features are production-ready and can be enabled with a single toggle.
              </p>
            </div>
            
            <div className="flex space-x-3">
              <Button className="bg-green-600 hover:bg-green-700">
                Enable All Features
              </Button>
              <Button variant="outline" className="border-green-600 text-green-600">
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}