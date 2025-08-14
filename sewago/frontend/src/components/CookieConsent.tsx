'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';
import { Cookie, Shield, Settings, X, CheckCircle } from 'lucide-react';

export default function CookieConsent() {
  const t = useTranslations();
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Always required
    analytics: false,
    marketing: false,
    functional: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const allPreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    };
    
    setPreferences(allPreferences);
    saveConsent(allPreferences);
    setIsVisible(false);
  };

  const handleAcceptSelected = () => {
    saveConsent(preferences);
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    const minimalPreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    };
    
    setPreferences(minimalPreferences);
    saveConsent(minimalPreferences);
    setIsVisible(false);
  };

  const saveConsent = (consent: typeof preferences) => {
    localStorage.setItem('cookie-consent', JSON.stringify(consent));
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    
    // Update analytics based on consent
    if (consent.analytics && typeof window !== 'undefined') {
      // Enable analytics
      window.gtag?.('consent', 'update', {
        analytics_storage: 'granted'
      });
    } else if (typeof window !== 'undefined') {
      // Disable analytics
      window.gtag?.('consent', 'update', {
        analytics_storage: 'denied'
      });
    }
  };

  const updatePreference = (key: keyof typeof preferences, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-black/50 backdrop-blur-sm">
      <Card className="max-w-4xl mx-auto bg-white shadow-2xl border-0">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-accent to-primary rounded-lg flex items-center justify-center">
                <Cookie className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Cookie Preferences</CardTitle>
                <CardDescription>
                  We use cookies to enhance your experience and analyze site usage
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Cookie Categories */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-green-600" />
                <div>
                  <h4 className="font-medium">Necessary Cookies</h4>
                  <p className="text-sm text-gray-600">Essential for website functionality</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Always Active
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-blue-600" />
                <div>
                  <h4 className="font-medium">Analytics Cookies</h4>
                  <p className="text-sm text-gray-600">Help us improve our website</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) => updatePreference('analytics', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Cookie className="w-5 h-5 text-purple-600" />
                <div>
                  <h4 className="font-medium">Marketing Cookies</h4>
                  <p className="text-sm text-gray-600">Used for personalized advertising</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={(e) => updatePreference('marketing', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-orange-600" />
                <div>
                  <h4 className="font-medium">Functional Cookies</h4>
                  <p className="text-sm text-gray-600">Enable enhanced features</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.functional}
                  onChange={(e) => updatePreference('functional', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
            <Button
              onClick={handleAcceptAll}
              className="flex-1 bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Accept All Cookies
            </Button>
            
            <Button
              onClick={handleAcceptSelected}
              variant="outline"
              className="flex-1"
            >
              Accept Selected
            </Button>
            
            <Button
              onClick={handleRejectAll}
              variant="outline"
              className="flex-1"
            >
              Reject All
            </Button>
          </div>

          {/* Privacy Policy Link */}
          <div className="text-center text-sm text-gray-600">
            By continuing to use this site, you agree to our{' '}
            <a href="/privacy" className="text-accent hover:underline">
              Privacy Policy
            </a>{' '}
            and{' '}
            <a href="/terms" className="text-accent hover:underline">
              Terms of Service
            </a>
            .
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
