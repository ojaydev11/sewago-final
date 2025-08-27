'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Star, 
  Flame, 
  Gift, 
  TrendingUp, 
  Calendar,
  Award,
  Zap,
  Crown,
  Target
} from 'lucide-react';
import { LoyaltyPointsCard } from './LoyaltyPointsCard';
import { BadgeCollection } from './BadgeCollection';
import { StreakTracker } from './StreakTracker';
import { ChallengeCard } from './ChallengeCard';
import { PointsStore } from './PointsStore';
import { useNotifications } from '@/hooks/useNotifications';
import dynamic from 'next/dynamic';

const ParticleField = dynamic(() => import('@/components/ui/ParticleField').then(mod => ({ default: mod.ParticleField })), { 
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-100 w-full h-full" />
});

interface GamificationData {
  points: {
    balance: {
      totalPoints: number;
      availablePoints: number;
      lifetimeEarned: number;
    };
    transactions: Array<{
      id: string;
      points: number;
      type: string;
      source: string;
      description: string;
      createdAt: string;
    }>;
  };
  badges: {
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
  };
  streaks: {
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
  };
  challenges: {
    challenges: Array<{
      id: string;
      name: string;
      nameNe: string;
      description: string;
      descriptionNe: string;
      type: string;
      festival?: string;
      startDate: string;
      endDate: string;
      target: number;
      reward: number;
      badgeReward?: string;
      progress: number;
      isJoined: boolean;
      isCompleted: boolean;
      rewardClaimed: boolean;
      daysRemaining: number;
      config: {
        icon: string;
        color: string;
        category: string;
      };
    }>;
    activeCount: number;
    joinedCount: number;
    completedCount: number;
  };
}

interface GamificationDashboardProps {
  locale?: string;
}

export function GamificationDashboard({ locale = 'en' }: GamificationDashboardProps) {
  const [data, setData] = useState<GamificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showParticles, setShowParticles] = useState(false);
  const { createNotification } = useNotifications();

  useEffect(() => {
    fetchGamificationData();
  }, []);

  const fetchGamificationData = async () => {
    try {
      setLoading(true);
      
      const [pointsRes, badgesRes, streaksRes, challengesRes] = await Promise.all([
        fetch('/api/gamification/points'),
        fetch('/api/gamification/badges'),
        fetch('/api/gamification/streaks'),
        fetch('/api/gamification/challenges')
      ]);

      if (!pointsRes.ok || !badgesRes.ok || !streaksRes.ok || !challengesRes.ok) {
        throw new Error('Failed to fetch gamification data');
      }

      const [points, badges, streaks, challenges] = await Promise.all([
        pointsRes.json(),
        badgesRes.json(),
        streaksRes.json(),
        challengesRes.json()
      ]);

      setData({ points, badges, streaks, challenges });
      
      // Show celebration particles for new achievements
      const hasNewAchievements = badges.badges.some((badge: any) => 
        badge.isUnlocked && 
        badge.unlockedAt && 
        new Date(badge.unlockedAt).getTime() > Date.now() - 24 * 60 * 60 * 1000
      );
      
      if (hasNewAchievements) {
        setShowParticles(true);
        setTimeout(() => setShowParticles(false), 3000);
      }

    } catch (error) {
      console.error('Error fetching gamification data:', error);
      createNotification({
        type: 'system',
        title: 'Error',
        message: 'Failed to load gamification data',
        priority: 'high',
        category: 'error',
        tags: ['gamification', 'dashboard']
      });
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (locale === 'ne') {
      if (hour < 12) return 'शुभ बिहान';
      if (hour < 17) return 'नमस्कार';
      return 'शुभ साँझ';
    }
    
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getMotivationalMessage = () => {
    if (!data) return '';
    
    const { points, badges, streaks, challenges } = data;
    const totalProgress = badges.unlockedCount + challenges.completedCount;
    
    if (locale === 'ne') {
      if (totalProgress === 0) return 'तपाईंको सेवा यात्रा सुरु गर्नुहोस्!';
      if (totalProgress < 5) return 'राम्रो प्रगति! जारी राख्नुहोस्!';
      if (totalProgress < 10) return 'उत्कृष्ट! तपाईं राम्रो गर्दै हुनुहुन्छ!';
      return 'बधाई छ! तपाईं एक च्याम्पियन हुनुहुन्छ!';
    }
    
    if (totalProgress === 0) return 'Start your reward journey!';
    if (totalProgress < 5) return 'Great start! Keep going!';
    if (totalProgress < 10) return 'Excellent! You\'re on fire!';
    return 'Amazing! You\'re a champion!';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">
            {locale === 'ne' ? 'लोड हुँदैछ...' : 'Loading rewards...'}
          </p>
        </motion.div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="pt-6">
            <p className="text-gray-600">
              {locale === 'ne' ? 'डेटा लोड गर्न सकिएन' : 'Failed to load data'}
            </p>
            <Button onClick={fetchGamificationData} className="mt-4">
              {locale === 'ne' ? 'फेरि प्रयास गर्नुहोस्' : 'Try Again'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { points, badges, streaks, challenges } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      <AnimatePresence>
        {showParticles && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none z-10"
          >
            <ParticleField 
              particleCount={50} 
              colors={['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1']} 
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            {getGreeting()}!
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            {getMotivationalMessage()}
          </p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-lg p-4 shadow-sm border border-blue-100"
            >
              <div className="flex items-center justify-center mb-2">
                <Star className="w-6 h-6 text-yellow-500" />
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {points.balance.availablePoints.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">
                {locale === 'ne' ? 'अंकहरू' : 'Points'}
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-lg p-4 shadow-sm border border-purple-100"
            >
              <div className="flex items-center justify-center mb-2">
                <Trophy className="w-6 h-6 text-purple-500" />
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {badges.unlockedCount}
              </div>
              <div className="text-sm text-gray-600">
                {locale === 'ne' ? 'ब्याज' : 'Badges'}
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-lg p-4 shadow-sm border border-orange-100"
            >
              <div className="flex items-center justify-center mb-2">
                <Flame className="w-6 h-6 text-orange-500" />
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {Math.max(...streaks.streaks.map(s => s.currentStreak))}
              </div>
              <div className="text-sm text-gray-600">
                {locale === 'ne' ? 'स्ट्रिक' : 'Streak'}
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-lg p-4 shadow-sm border border-green-100"
            >
              <div className="flex items-center justify-center mb-2">
                <Target className="w-6 h-6 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-green-600">
                {challenges.completedCount}
              </div>
              <div className="text-sm text-gray-600">
                {locale === 'ne' ? 'चुनौतीहरू' : 'Challenges'}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 max-w-3xl mx-auto mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">
                {locale === 'ne' ? 'सिंहावलोकन' : 'Overview'}
              </span>
            </TabsTrigger>
            <TabsTrigger value="points" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              <span className="hidden sm:inline">
                {locale === 'ne' ? 'अंकहरू' : 'Points'}
              </span>
            </TabsTrigger>
            <TabsTrigger value="badges" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">
                {locale === 'ne' ? 'ब्याज' : 'Badges'}
              </span>
            </TabsTrigger>
            <TabsTrigger value="streaks" className="flex items-center gap-2">
              <Flame className="w-4 h-4" />
              <span className="hidden sm:inline">
                {locale === 'ne' ? 'स्ट्रिक' : 'Streaks'}
              </span>
            </TabsTrigger>
            <TabsTrigger value="challenges" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">
                {locale === 'ne' ? 'चुनौती' : 'Challenges'}
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <LoyaltyPointsCard 
                  data={points} 
                  locale={locale} 
                  compact 
                />
                <BadgeCollection 
                  data={badges} 
                  locale={locale} 
                  compact 
                />
                <StreakTracker 
                  data={streaks} 
                  locale={locale} 
                  compact 
                />
              </div>
              
              {challenges.challenges.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold mb-4">
                    {locale === 'ne' ? 'सक्रिय चुनौतीहरू' : 'Active Challenges'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {challenges.challenges.slice(0, 3).map((challenge) => (
                      <ChallengeCard
                        key={challenge.id}
                        challenge={challenge}
                        locale={locale}
                        onUpdate={fetchGamificationData}
                        compact
                      />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="points">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <LoyaltyPointsCard data={points} locale={locale} />
                </div>
                <div>
                  <PointsStore locale={locale} />
                </div>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="badges">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <BadgeCollection data={badges} locale={locale} />
            </motion.div>
          </TabsContent>

          <TabsContent value="streaks">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <StreakTracker data={streaks} locale={locale} />
            </motion.div>
          </TabsContent>

          <TabsContent value="challenges">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="space-y-6">
                {challenges.challenges.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {challenges.challenges.map((challenge) => (
                      <ChallengeCard
                        key={challenge.id}
                        challenge={challenge}
                        locale={locale}
                        onUpdate={fetchGamificationData}
                      />
                    ))}
                  </div>
                ) : (
                  <Card className="text-center py-12">
                    <CardContent>
                      <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">
                        {locale === 'ne' ? 'कुनै सक्रिय चुनौती छैन' : 'No Active Challenges'}
                      </h3>
                      <p className="text-gray-500">
                        {locale === 'ne' 
                          ? 'नयाँ चुनौतीहरू छिट्टै आउनेछ!' 
                          : 'New challenges coming soon!'
                        }
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}