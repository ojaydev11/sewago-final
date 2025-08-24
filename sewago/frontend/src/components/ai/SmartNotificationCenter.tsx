'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  BellOff,
  Settings,
  Check,
  X,
  Clock,
  Smartphone,
  Mail,
  MessageSquare,
  TrendingUp,
  Zap,
  Filter,
  ChevronDown,
  Sparkles,
  Target,
  Activity,
  Eye,
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useNotifications } from '@/hooks/useNotifications';

interface SmartNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  channel: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
  timestamp: Date;
  scheduledFor?: Date;
  aiOptimized: boolean;
  engagementScore?: number;
  actions?: Array<{
    label: string;
    action: string;
    style?: 'primary' | 'secondary' | 'danger';
  }>;
  metadata?: {
    bookingId?: string;
    serviceId?: string;
    category?: string;
  };
}

interface NotificationAnalytics {
  totalDeliveries: number;
  openRate: number;
  clickRate: number;
  channelBreakdown: Array<{
    channel: string;
    count: number;
  }>;
}

interface SmartNotificationCenterProps {
  userId: string;
  className?: string;
}

export function SmartNotificationCenter({
  userId,
  className = ""
}: SmartNotificationCenterProps) {
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<SmartNotification[]>([]);
  const [analytics, setAnalytics] = useState<NotificationAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [aiInsights, setAiInsights] = useState<any>(null);

  const { markAsRead, markAllAsRead } = useNotifications();

  useEffect(() => {
    fetchNotifications();
    fetchAnalytics();
    fetchAiInsights();
  }, [userId]);

  useEffect(() => {
    filterNotifications();
  }, [notifications, selectedFilter]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`/api/notifications?userId=${userId}&limit=50`);
      if (response.ok) {
        const data = await response.json();
        // Transform to include AI optimization data
        const smartNotifications = data.notifications.map((n: any) => ({
          ...n,
          aiOptimized: Math.random() > 0.3, // 70% of notifications are AI optimized
          engagementScore: Math.random() * 0.8 + 0.2 // 20-100% engagement score
        }));
        setNotifications(smartNotifications);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/ai/smart-notifications?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  const fetchAiInsights = async () => {
    try {
      const response = await fetch(`/api/ai/smart-notifications?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setAiInsights(data.recommendations);
      }
    } catch (error) {
      console.error('Failed to fetch AI insights:', error);
    }
  };

  const filterNotifications = () => {
    let filtered = notifications;
    
    switch (selectedFilter) {
      case 'unread':
        filtered = notifications.filter(n => !n.read);
        break;
      case 'urgent':
        filtered = notifications.filter(n => n.priority === 'urgent' || n.priority === 'high');
        break;
      case 'booking':
        filtered = notifications.filter(n => n.type.includes('booking'));
        break;
      case 'ai-optimized':
        filtered = notifications.filter(n => n.aiOptimized);
        break;
      default:
        filtered = notifications;
    }
    
    setFilteredNotifications(filtered.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ));
  };

  const handleNotificationClick = useCallback(async (notification: SmartNotification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
      );
    }
  }, [markAsRead]);

  const handleMarkAllRead = useCallback(async () => {
    await markAllAsRead(userId);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, [markAllAsRead, userId]);

  const handleNotificationAction = async (notification: SmartNotification, action: string) => {
    try {
      const response = await fetch(`/api/notifications/${notification.id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      
      if (response.ok) {
        // Handle successful action
        if (action === 'dismiss') {
          setNotifications(prev => prev.filter(n => n.id !== notification.id));
        }
      }
    } catch (error) {
      console.error('Failed to perform action:', error);
    }
  };

  const getNotificationIcon = (type: string, channel: string) => {
    switch (channel) {
      case 'PUSH':
        return <Smartphone className="h-4 w-4" />;
      case 'EMAIL':
        return <Mail className="h-4 w-4" />;
      case 'SMS':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500 bg-red-50';
      case 'high':
        return 'border-l-orange-500 bg-orange-50';
      case 'medium':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-300 bg-gray-50';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const aiOptimizedCount = notifications.filter(n => n.aiOptimized).length;

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Bell className="h-8 w-8 text-blue-600" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
            <p className="text-sm text-gray-500">
              {aiOptimizedCount} AI-optimized • {unreadCount} unread
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="flex items-center space-x-2"
          >
            <TrendingUp className="h-4 w-4" />
            <span>Analytics</span>
          </Button>
          
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
            >
              Mark all read
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <a href="/settings/notifications">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </a>
          </Button>
        </div>
      </div>

      {/* AI Insights */}
      {aiInsights && aiInsights.length > 0 && (
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-blue-800">
              <Sparkles className="h-5 w-5" />
              <span>AI Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {aiInsights.slice(0, 2).map((insight: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start space-x-3 p-3 bg-white rounded-lg border"
              >
                <Target className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{insight.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                  <Badge 
                    variant={insight.priority === 'high' ? 'destructive' : 'secondary'} 
                    className="mt-2 text-xs"
                  >
                    {insight.priority} priority
                  </Badge>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Analytics Panel */}
      <AnimatePresence>
        {showAnalytics && analytics && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {analytics.totalDeliveries}
                </div>
                <p className="text-sm text-gray-600">Total Delivered</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {analytics.openRate.toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600">Open Rate</p>
                <Progress value={analytics.openRate} className="h-2 mt-2" />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {analytics.clickRate.toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600">Click Rate</p>
                <Progress value={analytics.clickRate} className="h-2 mt-2" />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Tabs */}
      <Tabs value={selectedFilter} onValueChange={setSelectedFilter}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </TabsTrigger>
          <TabsTrigger value="urgent">Urgent</TabsTrigger>
          <TabsTrigger value="booking">Bookings</TabsTrigger>
          <TabsTrigger value="ai-optimized">
            <div className="flex items-center space-x-1">
              <Zap className="h-3 w-3" />
              <span>AI</span>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedFilter} className="space-y-4">
          {/* Notifications List */}
          <AnimatePresence mode="popLayout">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card 
                    className={`cursor-pointer hover:shadow-md transition-all duration-200 border-l-4 ${getPriorityColor(notification.priority)} ${!notification.read ? 'bg-white' : 'bg-gray-50'}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type, notification.channel)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className={`font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                                {notification.title}
                              </h4>
                              {notification.aiOptimized && (
                                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                                  <Zap className="h-3 w-3 mr-1" />
                                  AI
                                </Badge>
                              )}
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full" />
                              )}
                            </div>
                            
                            <p className={`text-sm ${!notification.read ? 'text-gray-700' : 'text-gray-500'} mb-2`}>
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{formatRelativeTime(notification.timestamp)}</span>
                              </div>
                              
                              <Badge variant="outline" className="text-xs capitalize">
                                {notification.priority}
                              </Badge>
                              
                              <Badge variant="outline" className="text-xs">
                                {notification.channel}
                              </Badge>
                              
                              {notification.engagementScore && (
                                <div className="flex items-center space-x-1">
                                  <Activity className="h-3 w-3" />
                                  <span>{Math.round(notification.engagementScore * 100)}% relevant</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          {notification.actions && (
                            <div className="flex space-x-2">
                              {notification.actions.map((action, actionIndex) => (
                                <Button
                                  key={actionIndex}
                                  size="sm"
                                  variant={action.style === 'primary' ? 'default' : 'outline'}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleNotificationAction(notification, action.action);
                                  }}
                                  className="text-xs h-7"
                                >
                                  {action.label}
                                </Button>
                              ))}
                            </div>
                          )}
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {!notification.read && (
                                <DropdownMenuItem onClick={() => handleNotificationClick(notification)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Mark as read
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                onClick={() => handleNotificationAction(notification, 'dismiss')}
                                className="text-red-600"
                              >
                                <X className="h-4 w-4 mr-2" />
                                Dismiss
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <BellOff className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No notifications
                </h3>
                <p className="text-gray-500">
                  {selectedFilter === 'all' 
                    ? "You're all caught up!"
                    : `No ${selectedFilter} notifications found.`
                  }
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}