'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Clock, 
  Calendar, 
  Thermometer, 
  Cloud, 
  Car,
  Zap,
  Bell,
  X,
  CheckCircle,
  AlertTriangle,
  Info,
  Lightbulb,
  TrendingUp,
  Users,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { useLocalizedCurrency } from '@/hooks/useLocalizedCurrency';

interface ContextualNotificationData {
  id: string;
  type: 'location' | 'time' | 'weather' | 'traffic' | 'seasonal' | 'behavioral' | 'promotional';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  context: {
    location?: {
      lat: number;
      lng: number;
      area: string;
      city: string;
    };
    time?: {
      current: Date;
      optimal: Date;
      timezone: string;
    };
    weather?: {
      condition: string;
      temperature: number;
      humidity: number;
      suitable: boolean;
    };
    traffic?: {
      level: 'low' | 'medium' | 'high';
      delay: number;
      alternative: string;
    };
    user?: {
      preferences: string[];
      history: string[];
      behavior: string;
    };
  };
  actions?: Array<{
    label: string;
    action: string;
    style?: 'primary' | 'secondary' | 'danger';
  }>;
  autoHide?: boolean;
  hideDelay?: number; // milliseconds
  relevanceScore: number;
  metadata?: any;
}

interface ContextualNotificationsProps {
  userId?: string;
  location?: { lat: number; lng: number; city?: string };
  className?: string;
  maxNotifications?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export function ContextualNotifications({
  userId,
  location,
  className = "",
  maxNotifications = 3,
  position = 'top-right'
}: ContextualNotificationsProps) {
  const [notifications, setNotifications] = useState<ContextualNotificationData[]>([]);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [trafficData, setTrafficData] = useState<any>(null);
  const [userContext, setUserContext] = useState<any>(null);

  const { formatPrice } = useLocalizedCurrency();

  useEffect(() => {
    if (location) {
      fetchContextualData();
      startContextualUpdates();
    }
  }, [location, userId]);

  const fetchContextualData = async () => {
    if (!location) return;

    try {
      // Fetch weather data
      const weatherResponse = await fetch(`/api/weather?lat=${location.lat}&lng=${location.lng}`);
      if (weatherResponse.ok) {
        const weather = await weatherResponse.json();
        setWeatherData(weather);
        generateWeatherNotifications(weather);
      }

      // Fetch traffic data
      const trafficResponse = await fetch(`/api/traffic?area=${location.city}`);
      if (trafficResponse.ok) {
        const traffic = await trafficResponse.json();
        setTrafficData(traffic);
        generateTrafficNotifications(traffic);
      }

      // Fetch user context
      if (userId) {
        const userResponse = await fetch(`/api/user/context?userId=${userId}`);
        if (userResponse.ok) {
          const context = await userResponse.json();
          setUserContext(context);
          generateBehavioralNotifications(context);
        }
      }

      // Generate location-based notifications
      generateLocationNotifications(location);
      
      // Generate time-based notifications
      generateTimeBasedNotifications();

    } catch (error) {
      console.error('Failed to fetch contextual data:', error);
    }
  };

  const startContextualUpdates = () => {
    // Update contextual notifications every 5 minutes
    const interval = setInterval(() => {
      fetchContextualData();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  };

  const generateWeatherNotifications = (weather: any) => {
    const notifications = [];
    const now = new Date();

    // Rain warning for outdoor services
    if (weather.condition?.toLowerCase().includes('rain') && weather.precipitation > 5) {
      notifications.push({
        id: `weather-rain-${now.getTime()}`,
        type: 'weather' as const,
        priority: 'medium' as const,
        title: 'Weather Alert',
        message: `Heavy rain expected (${weather.precipitation}mm). Consider rescheduling outdoor services.`,
        context: {
          weather: {
            condition: weather.condition,
            temperature: weather.temperature,
            humidity: weather.humidity,
            suitable: false
          }
        },
        actions: [
          { label: 'Find Indoor Services', action: 'find_indoor_services', style: 'primary' as const },
          { label: 'Reschedule', action: 'reschedule_booking', style: 'secondary' as const }
        ],
        autoHide: false,
        relevanceScore: 0.85
      });
    }

    // Hot weather advisory
    if (weather.temperature > 35) {
      notifications.push({
        id: `weather-hot-${now.getTime()}`,
        type: 'weather' as const,
        priority: 'low' as const,
        title: 'Hot Weather Advisory',
        message: `Very hot today (${weather.temperature}°C). AC maintenance services are in high demand.`,
        context: {
          weather: {
            condition: weather.condition,
            temperature: weather.temperature,
            humidity: weather.humidity,
            suitable: true
          }
        },
        actions: [
          { label: 'Book AC Service', action: 'book_ac_service', style: 'primary' as const }
        ],
        autoHide: true,
        hideDelay: 10000,
        relevanceScore: 0.7
      });
    }

    addNotifications(notifications);
  };

  const generateTrafficNotifications = (traffic: any) => {
    const notifications = [];
    const now = new Date();

    if (traffic.level === 'high') {
      notifications.push({
        id: `traffic-delay-${now.getTime()}`,
        type: 'traffic' as const,
        priority: 'medium' as const,
        title: 'Traffic Alert',
        message: `Heavy traffic in ${location?.city}. Service delays expected (+${traffic.estimatedDelay} min).`,
        context: {
          traffic: {
            level: traffic.level,
            delay: traffic.estimatedDelay,
            alternative: traffic.alternativeRoute
          }
        },
        actions: [
          { label: 'Reschedule', action: 'reschedule_for_traffic', style: 'primary' as const },
          { label: 'Accept Delay', action: 'accept_delay', style: 'secondary' as const }
        ],
        autoHide: false,
        relevanceScore: 0.9
      });
    }

    addNotifications(notifications);
  };

  const generateLocationNotifications = (location: { lat: number; lng: number; city?: string }) => {
    const notifications = [];
    const now = new Date();

    // Popular services in area
    notifications.push({
      id: `location-popular-${now.getTime()}`,
      type: 'location' as const,
      priority: 'low' as const,
      title: 'Popular in Your Area',
      message: `House cleaning and electrical services are trending in ${location.city}.`,
      context: {
        location: {
          lat: location.lat,
          lng: location.lng,
          area: location.city || 'your area',
          city: location.city || 'Unknown'
        }
      },
      actions: [
        { label: 'Explore Services', action: 'explore_popular_services', style: 'primary' as const }
      ],
      autoHide: true,
      hideDelay: 15000,
      relevanceScore: 0.6
    });

    // New providers in area
    if (Math.random() > 0.7) { // 30% chance
      notifications.push({
        id: `location-providers-${now.getTime()}`,
        type: 'location' as const,
        priority: 'low' as const,
        title: 'New Providers Available',
        message: `3 new verified providers joined in ${location.city} this week.`,
        context: {
          location: {
            lat: location.lat,
            lng: location.lng,
            area: location.city || 'your area',
            city: location.city || 'Unknown'
          }
        },
        actions: [
          { label: 'View Providers', action: 'view_new_providers', style: 'primary' as const }
        ],
        autoHide: true,
        hideDelay: 12000,
        relevanceScore: 0.55
      });
    }

    addNotifications(notifications);
  };

  const generateTimeBasedNotifications = () => {
    const notifications = [];
    const now = new Date();
    const hour = now.getHours();

    // Morning cleaning reminder
    if (hour >= 8 && hour <= 10) {
      notifications.push({
        id: `time-morning-${now.getTime()}`,
        type: 'time' as const,
        priority: 'low' as const,
        title: 'Good Morning!',
        message: 'Perfect time to schedule house cleaning. Get 10% off morning bookings.',
        context: {
          time: {
            current: now,
            optimal: new Date(now.setHours(9, 0, 0, 0)),
            timezone: 'Asia/Kathmandu'
          }
        },
        actions: [
          { label: 'Book Cleaning', action: 'book_morning_cleaning', style: 'primary' as const }
        ],
        autoHide: true,
        hideDelay: 20000,
        relevanceScore: 0.65
      });
    }

    // Evening maintenance reminder
    if (hour >= 18 && hour <= 20) {
      notifications.push({
        id: `time-evening-${now.getTime()}`,
        type: 'time' as const,
        priority: 'low' as const,
        title: 'Evening Special',
        message: 'Schedule maintenance services for tomorrow. Avoid the rush!',
        context: {
          time: {
            current: now,
            optimal: new Date(now.setHours(19, 0, 0, 0)),
            timezone: 'Asia/Kathmandu'
          }
        },
        actions: [
          { label: 'Schedule Tomorrow', action: 'schedule_tomorrow', style: 'primary' as const }
        ],
        autoHide: true,
        hideDelay: 18000,
        relevanceScore: 0.6
      });
    }

    addNotifications(notifications);
  };

  const generateBehavioralNotifications = (context: any) => {
    const notifications = [];
    const now = new Date();

    // Repeat customer offer
    if (context.bookingHistory?.length > 5) {
      notifications.push({
        id: `behavioral-loyal-${now.getTime()}`,
        type: 'behavioral' as const,
        priority: 'medium' as const,
        title: 'Loyal Customer Reward',
        message: 'You\'ve booked 5+ services! Enjoy 15% off your next booking.',
        context: {
          user: {
            preferences: context.preferences || [],
            history: context.bookingHistory || [],
            behavior: 'loyal_customer'
          }
        },
        actions: [
          { label: 'Use Discount', action: 'apply_loyal_discount', style: 'primary' as const }
        ],
        autoHide: false,
        relevanceScore: 0.9
      });
    }

    // Service reminder based on history
    if (context.lastBooking) {
      const daysSinceLastBooking = Math.floor(
        (now.getTime() - new Date(context.lastBooking.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceLastBooking > 30 && daysSinceLastBooking < 60) {
        notifications.push({
          id: `behavioral-reminder-${now.getTime()}`,
          type: 'behavioral' as const,
          priority: 'low' as const,
          title: 'Service Reminder',
          message: `It's been a month since your last ${context.lastBooking.service}. Time for maintenance?`,
          context: {
            user: {
              preferences: context.preferences || [],
              history: context.bookingHistory || [],
              behavior: 'returning_customer'
            }
          },
          actions: [
            { label: 'Book Again', action: 'rebook_service', style: 'primary' as const },
            { label: 'Not Now', action: 'dismiss', style: 'secondary' as const }
          ],
          autoHide: false,
          relevanceScore: 0.75
        });
      }
    }

    addNotifications(notifications);
  };

  const addNotifications = (newNotifications: ContextualNotificationData[]) => {
    setNotifications(prev => {
      const combined = [...prev, ...newNotifications];
      // Sort by relevance score and priority, then limit to max notifications
      const sorted = combined
        .sort((a, b) => {
          const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
          const aPriority = priorityWeight[a.priority];
          const bPriority = priorityWeight[b.priority];
          
          if (aPriority !== bPriority) {
            return bPriority - aPriority;
          }
          
          return b.relevanceScore - a.relevanceScore;
        })
        .slice(0, maxNotifications);
      
      return sorted;
    });
  };

  const handleNotificationAction = useCallback(async (notification: ContextualNotificationData, action: string) => {
    try {
      // Track the action
      await fetch('/api/notifications/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationId: notification.id,
          action,
          userId,
          context: notification.context
        })
      });

      // Handle specific actions
      switch (action) {
        case 'dismiss':
          dismissNotification(notification.id);
          break;
        case 'find_indoor_services':
          window.location.href = '/services?category=indoor&weather=suitable';
          break;
        case 'book_ac_service':
          window.location.href = '/services/ac-repair';
          break;
        case 'explore_popular_services':
          window.location.href = `/services?location=${location?.city}`;
          break;
        case 'book_morning_cleaning':
          window.location.href = '/services/house-cleaning?time=morning&discount=10';
          break;
        case 'apply_loyal_discount':
          toast.success('Loyal customer discount applied!');
          dismissNotification(notification.id);
          break;
        default:
          console.log('Unhandled action:', action);
      }
    } catch (error) {
      console.error('Failed to handle notification action:', error);
    }
  }, [userId, location]);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Auto-hide notifications
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    notifications.forEach(notification => {
      if (notification.autoHide && notification.hideDelay) {
        const timer = setTimeout(() => {
          dismissNotification(notification.id);
        }, notification.hideDelay);
        timers.push(timer);
      }
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [notifications, dismissNotification]);

  const getNotificationIcon = (type: string, priority: string) => {
    switch (type) {
      case 'weather':
        return <Cloud className="h-5 w-5" />;
      case 'traffic':
        return <Car className="h-5 w-5" />;
      case 'location':
        return <MapPin className="h-5 w-5" />;
      case 'time':
        return <Clock className="h-5 w-5" />;
      case 'behavioral':
        return <Users className="h-5 w-5" />;
      case 'promotional':
        return <Star className="h-5 w-5" />;
      default:
        return priority === 'urgent' ? <AlertTriangle className="h-5 w-5" /> : <Info className="h-5 w-5" />;
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'urgent') return 'border-red-500 bg-red-50';
    if (priority === 'high') return 'border-orange-500 bg-orange-50';
    
    switch (type) {
      case 'weather':
        return 'border-blue-500 bg-blue-50';
      case 'traffic':
        return 'border-yellow-500 bg-yellow-50';
      case 'location':
        return 'border-green-500 bg-green-50';
      case 'time':
        return 'border-purple-500 bg-purple-50';
      case 'behavioral':
        return 'border-indigo-500 bg-indigo-50';
      case 'promotional':
        return 'border-pink-500 bg-pink-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'top-4 right-4';
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className={`fixed ${getPositionClasses()} z-50 space-y-3 max-w-sm ${className}`}>
      <AnimatePresence mode="popLayout">
        {notifications.map((notification, index) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: position.includes('right') ? 100 : -100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: position.includes('right') ? 100 : -100, scale: 0.9 }}
            transition={{ 
              type: "spring", 
              duration: 0.4,
              delay: index * 0.1 
            }}
            layout
          >
            <Card className={`shadow-lg border-l-4 ${getNotificationColor(notification.type, notification.priority)}`}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 ${notification.priority === 'urgent' ? 'text-red-600' : notification.priority === 'high' ? 'text-orange-600' : 'text-blue-600'}`}>
                    {getNotificationIcon(notification.type, notification.priority)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 text-sm">
                        {notification.title}
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                        onClick={() => dismissNotification(notification.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">
                      {notification.message}
                    </p>
                    
                    {/* Context indicators */}
                    {notification.context && (
                      <div className="flex items-center space-x-3 text-xs text-gray-500 mb-3">
                        {notification.context.weather && (
                          <div className="flex items-center space-x-1">
                            <Thermometer className="h-3 w-3" />
                            <span>{notification.context.weather.temperature}°C</span>
                          </div>
                        )}
                        {notification.context.traffic && (
                          <div className="flex items-center space-x-1">
                            <Car className="h-3 w-3" />
                            <span>{notification.context.traffic.level} traffic</span>
                          </div>
                        )}
                        {notification.context.time && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(notification.context.time.current).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Relevance score */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>Relevance</span>
                        <span>{Math.round(notification.relevanceScore * 100)}%</span>
                      </div>
                      <Progress 
                        value={notification.relevanceScore * 100} 
                        className="h-1"
                      />
                    </div>
                    
                    {/* Actions */}
                    {notification.actions && (
                      <div className="flex flex-wrap gap-2">
                        {notification.actions.map((action, actionIndex) => (
                          <Button
                            key={actionIndex}
                            size="sm"
                            variant={action.style === 'primary' ? 'default' : action.style === 'danger' ? 'destructive' : 'outline'}
                            className="text-xs h-7"
                            onClick={() => handleNotificationAction(notification, action.action)}
                          >
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}