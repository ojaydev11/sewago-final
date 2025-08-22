'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Award, 
  Crown, 
  Star, 
  Lock,
  CheckCircle,
  Target,
  Filter,
  Grid,
  List
} from 'lucide-react';

interface BadgeData {
  badges: Array<{
    type: string;
    progress: number;
    target: number;
    isUnlocked: boolean;
    unlockedAt?: string;
    config: {
      nameEn: string;
      nameNe: string;
      descriptionEn: string;
      descriptionNe: string;
      icon: string;
      color: string;
    };
  }>;
  unlockedCount: number;
  totalCount: number;
}

interface BadgeCollectionProps {
  data: BadgeData;
  locale?: string;
  compact?: boolean;
}

export function BadgeCollection({ data, locale = 'en', compact = false }: BadgeCollectionProps) {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredBadges = useMemo(() => {
    switch (filter) {
      case 'unlocked':
        return data.badges.filter(badge => badge.isUnlocked);
      case 'locked':
        return data.badges.filter(badge => !badge.isUnlocked);
      default:
        return data.badges;
    }
  }, [data.badges, filter]);

  const sortedBadges = useMemo(() => {
    return [...filteredBadges].sort((a, b) => {
      // Unlocked badges first, then by progress percentage
      if (a.isUnlocked && !b.isUnlocked) return -1;
      if (!a.isUnlocked && b.isUnlocked) return 1;
      
      if (!a.isUnlocked && !b.isUnlocked) {
        const aProgress = (a.progress / a.target) * 100;
        const bProgress = (b.progress / b.target) * 100;
        return bProgress - aProgress;
      }
      
      return new Date(b.unlockedAt || '').getTime() - new Date(a.unlockedAt || '').getTime();
    });
  }, [filteredBadges]);

  const getBadgeColor = (color: string, isUnlocked: boolean) => {
    if (!isUnlocked) return 'text-gray-400 bg-gray-100';
    
    const colorMap = {
      gold: 'text-yellow-600 bg-yellow-100',
      blue: 'text-blue-600 bg-blue-100',
      purple: 'text-purple-600 bg-purple-100',
      green: 'text-green-600 bg-green-100',
      orange: 'text-orange-600 bg-orange-100',
      teal: 'text-teal-600 bg-teal-100',
      diamond: 'text-indigo-600 bg-indigo-100'
    };
    
    return colorMap[color] || 'text-gray-600 bg-gray-100';
  };

  const getBadgeIcon = (iconEmoji: string, type: string, isUnlocked: boolean) => {
    if (!isUnlocked) {
      return <Lock className="w-6 h-6 text-gray-400" />;
    }
    
    // Return emoji or fallback to icon
    if (iconEmoji && iconEmoji !== '🏆') {
      return <span className="text-2xl">{iconEmoji}</span>;
    }
    
    const iconMap = {
      REGULAR_CUSTOMER: Trophy,
      TOP_REVIEWER: Star,
      EARLY_ADOPTER: Crown,
      SERVICE_EXPERT: Target,
      LOYAL_MEMBER: Award,
      STREAK_MASTER: Crown,
      CHALLENGE_CHAMPION: Trophy,
      REFERRAL_HERO: Award
    };
    
    const IconComponent = iconMap[type] || Trophy;
    return <IconComponent className="w-6 h-6" />;
  };

  const getProgressPercentage = (progress: number, target: number) => {
    return Math.min((progress / target) * 100, 100);
  };

  if (compact) {
    return (
      <Card className="h-full hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="w-5 h-5 text-purple-500" />
            {locale === 'ne' ? 'ब्याजहरू' : 'Badges'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {data.unlockedCount}/{data.totalCount}
            </div>
            <div className="text-sm text-gray-600">
              {locale === 'ne' ? 'अनलक गरिएको' : 'Unlocked'}
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            {data.badges.slice(0, 4).map((badge, index) => (
              <motion.div
                key={badge.type}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`aspect-square rounded-lg flex items-center justify-center ${getBadgeColor(badge.config.color, badge.isUnlocked)}`}
              >
                {getBadgeIcon(badge.config.icon, badge.type, badge.isUnlocked)}
              </motion.div>
            ))}
          </div>
          
          {data.badges.length > 4 && (
            <div className="text-center mt-3">
              <span className="text-xs text-gray-500">
                +{data.badges.length - 4} {locale === 'ne' ? 'थप' : 'more'}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 border-purple-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-purple-500" />
              {locale === 'ne' ? 'ब्याज संग्रह' : 'Badge Collection'}
            </CardTitle>
            <CardDescription>
              {locale === 'ne' 
                ? 'उपलब्धिहरू अनलक गर्नुहोस् र आफ्नो विशेषज्ञता प्रदर्शन गर्नुहोस्'
                : 'Unlock achievements and showcase your expertise'
              }
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white rounded-lg border border-purple-200">
            <div className="text-2xl font-bold text-purple-600">
              {data.unlockedCount}
            </div>
            <div className="text-sm text-gray-600">
              {locale === 'ne' ? 'अनलक गरिएको' : 'Unlocked'}
            </div>
          </div>
          
          <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-600">
              {data.totalCount - data.unlockedCount}
            </div>
            <div className="text-sm text-gray-600">
              {locale === 'ne' ? 'बाँकी' : 'Remaining'}
            </div>
          </div>
          
          <div className="text-center p-4 bg-white rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-600">
              {Math.round((data.unlockedCount / data.totalCount) * 100)}%
            </div>
            <div className="text-sm text-gray-600">
              {locale === 'ne' ? 'पूर्णता' : 'Complete'}
            </div>
          </div>
        </div>

        {/* Filters */}
        <Tabs value={filter} onValueChange={(value) => setFilter(value as typeof filter)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">
              {locale === 'ne' ? 'सबै' : 'All'} ({data.totalCount})
            </TabsTrigger>
            <TabsTrigger value="unlocked">
              {locale === 'ne' ? 'अनलक' : 'Unlocked'} ({data.unlockedCount})
            </TabsTrigger>
            <TabsTrigger value="locked">
              {locale === 'ne' ? 'लक' : 'Locked'} ({data.totalCount - data.unlockedCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Badge Grid/List */}
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' 
          : 'space-y-3'
        }>
          <AnimatePresence mode="wait">
            {sortedBadges.map((badge, index) => (
              <motion.div
                key={badge.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className={`relative overflow-hidden rounded-xl transition-all duration-300 ${
                  badge.isUnlocked 
                    ? 'bg-white shadow-md hover:shadow-lg border-2 border-transparent hover:border-purple-300' 
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                {badge.isUnlocked && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 z-10"
                  >
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </motion.div>
                )}

                <div className={`p-4 ${viewMode === 'list' ? 'flex items-center gap-4' : 'text-center'}`}>
                  <div className={`${viewMode === 'list' ? 'flex-shrink-0' : 'mb-4'}`}>
                    <motion.div
                      whileHover={{ scale: badge.isUnlocked ? 1.1 : 1 }}
                      className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${getBadgeColor(badge.config.color, badge.isUnlocked)}`}
                    >
                      {getBadgeIcon(badge.config.icon, badge.type, badge.isUnlocked)}
                    </motion.div>
                  </div>

                  <div className={`${viewMode === 'list' ? 'flex-1' : ''}`}>
                    <h3 className={`font-semibold mb-1 ${badge.isUnlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                      {locale === 'ne' ? badge.config.nameNe : badge.config.nameEn}
                    </h3>
                    <p className={`text-sm mb-3 ${badge.isUnlocked ? 'text-gray-600' : 'text-gray-400'}`}>
                      {locale === 'ne' ? badge.config.descriptionNe : badge.config.descriptionEn}
                    </p>

                    {!badge.isUnlocked && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{locale === 'ne' ? 'प्रगति' : 'Progress'}</span>
                          <span>{badge.progress}/{badge.target}</span>
                        </div>
                        <Progress 
                          value={getProgressPercentage(badge.progress, badge.target)} 
                          className="h-2"
                        />
                      </div>
                    )}

                    {badge.isUnlocked && badge.unlockedAt && (
                      <Badge variant="secondary" className="text-xs">
                        {locale === 'ne' ? 'अनलक मिति:' : 'Unlocked:'} {
                          new Date(badge.unlockedAt).toLocaleDateString(
                            locale === 'ne' ? 'ne-NP' : 'en-US'
                          )
                        }
                      </Badge>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredBadges.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              {locale === 'ne' ? 'कुनै ब्याज भेटिएन' : 'No badges found'}
            </h3>
            <p className="text-gray-500">
              {locale === 'ne' 
                ? 'सेवा प्रयोग गरेर ब्याज कमाउन सुरु गर्नुहोस्!'
                : 'Start using services to earn your first badge!'
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}