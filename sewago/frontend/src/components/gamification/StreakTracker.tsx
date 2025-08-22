'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Flame, 
  Calendar, 
  TrendingUp, 
  Star,
  Award,
  Zap,
  Target,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { format, differenceInDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

interface StreakData {
  streaks: Array<{
    type: string;
    currentStreak: number;
    longestStreak: number;
    bonusMultiplier: number;
    isActive: boolean;
    lastActivityAt?: string;
    config: {
      nameEn: string;
      nameNe: string;
      descriptionEn: string;
      descriptionNe: string;
      icon: string;
      color: string;
    };
  }>;
}

interface StreakTrackerProps {
  data: StreakData;
  locale?: string;
  compact?: boolean;
}

export function StreakTracker({ data, locale = 'en', compact = false }: StreakTrackerProps) {
  const [selectedStreak, setSelectedStreak] = useState<string | null>(null);

  const bestStreak = useMemo(() => {
    return data.streaks.reduce((best, current) => 
      current.currentStreak > best.currentStreak ? current : best
    , data.streaks[0]);
  }, [data.streaks]);

  const getStreakIcon = (iconEmoji: string, type: string) => {
    if (iconEmoji && iconEmoji !== '📅') {
      return <span className="text-2xl">{iconEmoji}</span>;
    }
    
    const iconMap = {
      WEEKLY_BOOKING: Calendar,
      MONTHLY_ACTIVITY: TrendingUp,
      REVIEW_STREAK: Star
    };
    
    const IconComponent = iconMap[type] || Flame;
    return <IconComponent className="w-6 h-6" />;
  };

  const getStreakColor = (color: string, isActive: boolean) => {
    if (!isActive) return 'text-gray-400 bg-gray-100';
    
    const colorMap = {
      blue: 'text-blue-600 bg-blue-100',
      green: 'text-green-600 bg-green-100',
      yellow: 'text-yellow-600 bg-yellow-100',
      orange: 'text-orange-600 bg-orange-100',
      red: 'text-red-600 bg-red-100'
    };
    
    return colorMap[color] || 'text-blue-600 bg-blue-100';
  };

  const getBonusMultiplierColor = (multiplier: number) => {
    if (multiplier >= 1.5) return 'text-purple-600 bg-purple-100';
    if (multiplier >= 1.25) return 'text-green-600 bg-green-100';
    if (multiplier >= 1.1) return 'text-blue-600 bg-blue-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getStreakStatus = (streak: any) => {
    if (!streak.lastActivityAt) {
      return {
        status: 'inactive',
        message: locale === 'ne' ? 'निष्क्रिय' : 'Inactive',
        color: 'text-gray-500'
      };
    }

    const daysSinceActivity = differenceInDays(new Date(), new Date(streak.lastActivityAt));
    
    switch (streak.type) {
      case 'WEEKLY_BOOKING':
        if (daysSinceActivity <= 7) {
          return {
            status: 'active',
            message: locale === 'ne' ? 'सक्रिय' : 'Active',
            color: 'text-green-500'
          };
        } else if (daysSinceActivity <= 14) {
          return {
            status: 'warning',
            message: locale === 'ne' ? 'चेतावनी' : 'At Risk',
            color: 'text-yellow-500'
          };
        }
        break;
        
      case 'MONTHLY_ACTIVITY':
        if (daysSinceActivity <= 30) {
          return {
            status: 'active',
            message: locale === 'ne' ? 'सक्रिय' : 'Active',
            color: 'text-green-500'
          };
        } else if (daysSinceActivity <= 45) {
          return {
            status: 'warning',
            message: locale === 'ne' ? 'चेतावनी' : 'At Risk',
            color: 'text-yellow-500'
          };
        }
        break;
        
      case 'REVIEW_STREAK':
        if (daysSinceActivity <= 7) {
          return {
            status: 'active',
            message: locale === 'ne' ? 'सक्रिय' : 'Active',
            color: 'text-green-500'
          };
        } else if (daysSinceActivity <= 14) {
          return {
            status: 'warning',
            message: locale === 'ne' ? 'चेतावनी' : 'At Risk',
            color: 'text-yellow-500'
          };
        }
        break;
    }

    return {
      status: 'expired',
      message: locale === 'ne' ? 'समाप्त' : 'Expired',
      color: 'text-red-500'
    };
  };

  const getNextReward = (currentStreak: number) => {
    const milestones = [1, 2, 4, 8, 12, 20, 30];
    const next = milestones.find(m => m > currentStreak);
    return next || milestones[milestones.length - 1];
  };

  if (compact) {
    return (
      <Card className="h-full hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Flame className="w-5 h-5 text-orange-500" />
            {locale === 'ne' ? 'स्ट्रिकहरू' : 'Streaks'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-4">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-3xl font-bold text-orange-600 mb-2"
            >
              {bestStreak?.currentStreak || 0}
            </motion.div>
            <div className="text-sm text-gray-600">
              {locale === 'ne' ? 'सर्वोत्तम स्ट्रिक' : 'Best Streak'}
            </div>
          </div>
          
          <div className="space-y-2">
            {data.streaks.slice(0, 2).map((streak, index) => (
              <div key={streak.type} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStreakColor(streak.config.color, streak.isActive)}`}>
                    {getStreakIcon(streak.config.icon, streak.type)}
                  </div>
                  <span className="text-sm text-gray-600 truncate">
                    {locale === 'ne' ? streak.config.nameNe : streak.config.nameEn}
                  </span>
                </div>
                <span className="font-medium text-orange-600">
                  {streak.currentStreak}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 border-orange-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Flame className="w-6 h-6 text-orange-500" />
          </motion.div>
          {locale === 'ne' ? 'गतिविधि स्ट्रिकहरू' : 'Activity Streaks'}
        </CardTitle>
        <CardDescription>
          {locale === 'ne' 
            ? 'नियमित गतिविधि राखेर बोनस पुरस्कार कमाउनुहोस्'
            : 'Maintain consistent activity to earn bonus rewards'
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Overall Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white rounded-lg border border-orange-200">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-2xl font-bold text-orange-600"
            >
              {bestStreak?.currentStreak || 0}
            </motion.div>
            <div className="text-sm text-gray-600">
              {locale === 'ne' ? 'सर्वोत्तम स्ट्रिक' : 'Best Streak'}
            </div>
          </div>
          
          <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-600">
              {Math.max(...data.streaks.map(s => s.longestStreak))}
            </div>
            <div className="text-sm text-gray-600">
              {locale === 'ne' ? 'सबैभन्दा लामो' : 'Longest Ever'}
            </div>
          </div>
          
          <div className="text-center p-4 bg-white rounded-lg border border-purple-200">
            <div className="text-2xl font-bold text-purple-600">
              {Math.max(...data.streaks.map(s => s.bonusMultiplier)).toFixed(1)}x
            </div>
            <div className="text-sm text-gray-600">
              {locale === 'ne' ? 'बोनस गुणक' : 'Bonus Multiplier'}
            </div>
          </div>
        </div>

        {/* Individual Streaks */}
        <div className="space-y-4">
          {data.streaks.map((streak, index) => {
            const status = getStreakStatus(streak);
            const nextReward = getNextReward(streak.currentStreak);
            const progressToNext = Math.min(((streak.currentStreak % nextReward) / nextReward) * 100, 100);

            return (
              <motion.div
                key={streak.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border transition-all duration-300 ${
                  selectedStreak === streak.type 
                    ? 'bg-white border-orange-300 shadow-md' 
                    : 'bg-white/50 border-gray-200 hover:bg-white hover:shadow-sm'
                }`}
                onClick={() => setSelectedStreak(
                  selectedStreak === streak.type ? null : streak.type
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getStreakColor(streak.config.color, streak.isActive)}`}>
                      {getStreakIcon(streak.config.icon, streak.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {locale === 'ne' ? streak.config.nameNe : streak.config.nameEn}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {locale === 'ne' ? streak.config.descriptionNe : streak.config.descriptionEn}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="text-2xl font-bold text-orange-600"
                    >
                      {streak.currentStreak}
                    </motion.div>
                    <div className="text-xs text-gray-500">
                      {locale === 'ne' ? 'वर्तमान' : 'Current'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {status.status === 'active' && <CheckCircle className="w-4 h-4 text-green-500" />}
                    {status.status === 'warning' && <AlertCircle className="w-4 h-4 text-yellow-500" />}
                    {status.status === 'expired' && <AlertCircle className="w-4 h-4 text-red-500" />}
                    <span className={`text-sm font-medium ${status.color}`}>
                      {status.message}
                    </span>
                  </div>
                  
                  <Badge 
                    variant="secondary" 
                    className={getBonusMultiplierColor(streak.bonusMultiplier)}
                  >
                    {streak.bonusMultiplier.toFixed(1)}x {locale === 'ne' ? 'बोनस' : 'bonus'}
                  </Badge>
                </div>

                {streak.currentStreak < nextReward && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{locale === 'ne' ? 'अर्को पुरस्कार' : 'Next reward'}</span>
                      <span>{nextReward - streak.currentStreak} {locale === 'ne' ? 'बाँकी' : 'to go'}</span>
                    </div>
                    <Progress value={progressToNext} className="h-2" />
                  </div>
                )}

                <AnimatePresence>
                  {selectedStreak === streak.type && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 pt-4 border-t border-gray-200 space-y-3"
                    >
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">
                            {locale === 'ne' ? 'सबैभन्दा लामो:' : 'Longest streak:'}
                          </span>
                          <span className="font-medium ml-2">{streak.longestStreak}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">
                            {locale === 'ne' ? 'अन्तिम गतिविधि:' : 'Last activity:'}
                          </span>
                          <span className="font-medium ml-2">
                            {streak.lastActivityAt 
                              ? format(new Date(streak.lastActivityAt), 'MMM dd')
                              : locale === 'ne' ? 'कहिल्यै छैन' : 'Never'
                            }
                          </span>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3">
                        <h4 className="font-medium text-sm mb-2">
                          {locale === 'ne' ? 'कसरी कायम राख्ने:' : 'How to maintain:'}
                        </h4>
                        <p className="text-xs text-gray-600">
                          {locale === 'ne' ? streak.config.descriptionNe : streak.config.descriptionEn}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {data.streaks.length === 0 && (
          <div className="text-center py-12">
            <Flame className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              {locale === 'ne' ? 'कुनै स्ट्रिक छैन' : 'No streaks yet'}
            </h3>
            <p className="text-gray-500">
              {locale === 'ne' 
                ? 'नियमित सेवा प्रयोग गरेर आफ्नो पहिलो स्ट्रिक सुरु गर्नुहोस्!'
                : 'Start your first streak by using services regularly!'
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}