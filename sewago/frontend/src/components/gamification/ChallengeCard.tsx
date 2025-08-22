'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  Calendar, 
  Gift, 
  Clock, 
  CheckCircle,
  Star,
  Trophy,
  Sparkles,
  AlertCircle,
  PlayCircle,
  Award
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { useNotifications } from '@/hooks/useNotifications';

interface Challenge {
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
}

interface ChallengeCardProps {
  challenge: Challenge;
  locale?: string;
  onUpdate?: () => void;
  compact?: boolean;
}

export function ChallengeCard({ challenge, locale = 'en', onUpdate, compact = false }: ChallengeCardProps) {
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotifications();

  const handleJoinChallenge = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/gamification/challenges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          challengeId: challenge.id,
          action: 'join'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to join challenge');
      }

      const result = await response.json();
      
      showNotification('success', 
        locale === 'ne' 
          ? 'चुनौती सफलतापूर्वक जोडियो!' 
          : 'Successfully joined challenge!'
      );
      
      onUpdate?.();
    } catch (error) {
      console.error('Error joining challenge:', error);
      showNotification('error', 
        locale === 'ne' 
          ? 'चुनौती जोड्न असफल' 
          : 'Failed to join challenge'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClaimReward = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/gamification/challenges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          challengeId: challenge.id,
          action: 'claimReward'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to claim reward');
      }

      const result = await response.json();
      
      showNotification('success', 
        locale === 'ne' 
          ? `${result.reward} अंक पुरस्कार प्राप्त भयो!` 
          : `Claimed ${result.reward} points reward!`
      );
      
      onUpdate?.();
    } catch (error) {
      console.error('Error claiming reward:', error);
      showNotification('error', 
        locale === 'ne' 
          ? 'पुरस्कार प्राप्त गर्न असफल' 
          : 'Failed to claim reward'
      );
    } finally {
      setLoading(false);
    }
  };

  const getChallengeIcon = (iconEmoji: string, type: string) => {
    if (iconEmoji && iconEmoji !== '🎯') {
      return <span className="text-3xl">{iconEmoji}</span>;
    }
    
    const iconMap = {
      DASHAIN_CLEANING: '🏠',
      NEW_YEAR_ORGANIZE: '🎊',
      SUMMER_MAINTENANCE: '🔧',
      MONSOON_PREP: '☔',
      TIHAR_DECORATION: '🪔',
      GENERAL_SEASONAL: '🎯'
    };
    
    return <span className="text-3xl">{iconMap[type] || '🎯'}</span>;
  };

  const getChallengeColor = (color: string) => {
    const colorMap = {
      red: 'from-red-50 to-pink-50 border-red-200',
      gold: 'from-yellow-50 to-orange-50 border-yellow-200',
      orange: 'from-orange-50 to-red-50 border-orange-200',
      blue: 'from-blue-50 to-indigo-50 border-blue-200',
      purple: 'from-purple-50 to-pink-50 border-purple-200',
      green: 'from-green-50 to-teal-50 border-green-200'
    };
    
    return colorMap[color] || 'from-gray-50 to-slate-50 border-gray-200';
  };

  const getProgressColor = (progress: number, target: number) => {
    const percentage = (progress / target) * 100;
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  const getStatusBadge = () => {
    if (challenge.rewardClaimed) {
      return (
        <Badge className="bg-green-100 text-green-700 border-green-300">
          <Trophy className="w-3 h-3 mr-1" />
          {locale === 'ne' ? 'पुरस्कार प्राप्त' : 'Reward Claimed'}
        </Badge>
      );
    }
    
    if (challenge.isCompleted) {
      return (
        <Badge className="bg-blue-100 text-blue-700 border-blue-300">
          <CheckCircle className="w-3 h-3 mr-1" />
          {locale === 'ne' ? 'पूरा भयो' : 'Completed'}
        </Badge>
      );
    }
    
    if (challenge.isJoined) {
      return (
        <Badge className="bg-orange-100 text-orange-700 border-orange-300">
          <Target className="w-3 h-3 mr-1" />
          {locale === 'ne' ? 'सक्रिय' : 'Active'}
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline">
        <PlayCircle className="w-3 h-3 mr-1" />
        {locale === 'ne' ? 'उपलब्ध' : 'Available'}
      </Badge>
    );
  };

  const getTimeRemaining = () => {
    if (challenge.daysRemaining <= 0) {
      return {
        text: locale === 'ne' ? 'समाप्त' : 'Ended',
        color: 'text-red-500',
        urgent: true
      };
    }
    
    if (challenge.daysRemaining === 1) {
      return {
        text: locale === 'ne' ? '१ दिन बाँकी' : '1 day left',
        color: 'text-red-500',
        urgent: true
      };
    }
    
    if (challenge.daysRemaining <= 3) {
      return {
        text: locale === 'ne' ? `${challenge.daysRemaining} दिन बाँकी` : `${challenge.daysRemaining} days left`,
        color: 'text-orange-500',
        urgent: true
      };
    }
    
    return {
      text: locale === 'ne' ? `${challenge.daysRemaining} दिन बाँकी` : `${challenge.daysRemaining} days left`,
      color: 'text-gray-600',
      urgent: false
    };
  };

  const timeRemaining = getTimeRemaining();
  const progressPercentage = Math.min((challenge.progress / challenge.target) * 100, 100);

  if (compact) {
    return (
      <Card className={`hover:shadow-lg transition-all duration-300 bg-gradient-to-br ${getChallengeColor(challenge.config.color)}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {getChallengeIcon(challenge.config.icon, challenge.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-sm leading-tight">
                  {locale === 'ne' ? challenge.nameNe : challenge.name}
                </h3>
                {getStatusBadge()}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>{challenge.progress}/{challenge.target}</span>
                  <span className={timeRemaining.color}>{timeRemaining.text}</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
              
              {!challenge.isJoined && !challenge.isCompleted && (
                <Button
                  size="sm"
                  className="w-full mt-3"
                  onClick={handleJoinChallenge}
                  disabled={loading || challenge.daysRemaining <= 0}
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    locale === 'ne' ? 'सामेल हुनुहोस्' : 'Join'
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`hover:shadow-xl transition-all duration-300 bg-gradient-to-br ${getChallengeColor(challenge.config.color)} relative overflow-hidden`}>
      {timeRemaining.urgent && (
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-400 to-orange-400"
        />
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="flex-shrink-0"
            >
              {getChallengeIcon(challenge.config.icon, challenge.type)}
            </motion.div>
            
            <div>
              <CardTitle className="text-lg leading-tight mb-1">
                {locale === 'ne' ? challenge.nameNe : challenge.name}
              </CardTitle>
              <CardDescription className="text-sm">
                {locale === 'ne' ? challenge.descriptionNe : challenge.description}
              </CardDescription>
            </div>
          </div>
          
          {getStatusBadge()}
        </div>
        
        {challenge.festival && (
          <Badge variant="outline" className="w-fit">
            <Sparkles className="w-3 h-3 mr-1" />
            {challenge.festival}
          </Badge>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">
              {locale === 'ne' ? 'प्रगति' : 'Progress'}
            </span>
            <span className="text-sm text-gray-600">
              {challenge.progress}/{challenge.target}
            </span>
          </div>
          <div className="relative">
            <Progress value={progressPercentage} className="h-3" />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`absolute top-0 left-0 h-3 rounded-full ${getProgressColor(challenge.progress, challenge.target)}`}
            />
          </div>
          <div className="text-center text-xs text-gray-600">
            {Math.round(progressPercentage)}% {locale === 'ne' ? 'पूरा' : 'complete'}
          </div>
        </div>

        {/* Rewards */}
        <div className="bg-white/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              {locale === 'ne' ? 'पुरस्कारहरू' : 'Rewards'}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium">{challenge.reward}</span>
              <span className="text-xs text-gray-600">
                {locale === 'ne' ? 'अंक' : 'points'}
              </span>
            </div>
            
            {challenge.badgeReward && (
              <div className="flex items-center gap-1">
                <Award className="w-4 h-4 text-purple-500" />
                <span className="text-xs text-gray-600">
                  {locale === 'ne' ? 'ब्याज' : 'Badge'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Time and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm">
            <Clock className="w-4 h-4" />
            <span className={timeRemaining.color}>{timeRemaining.text}</span>
          </div>
          
          <div className="flex gap-2">
            {!challenge.isJoined && !challenge.isCompleted && challenge.daysRemaining > 0 && (
              <Button
                onClick={handleJoinChallenge}
                disabled={loading}
                size="sm"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <PlayCircle className="w-4 h-4 mr-1" />
                    {locale === 'ne' ? 'सामेल हुनुहोस्' : 'Join Challenge'}
                  </>
                )}
              </Button>
            )}
            
            {challenge.isCompleted && !challenge.rewardClaimed && (
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Button
                  onClick={handleClaimReward}
                  disabled={loading}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Gift className="w-4 h-4 mr-1" />
                      {locale === 'ne' ? 'पुरस्कार लिनुहोस्' : 'Claim Reward'}
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Challenge dates */}
        <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
          {format(new Date(challenge.startDate), 'MMM dd')} - {format(new Date(challenge.endDate), 'MMM dd, yyyy')}
        </div>
      </CardContent>
    </Card>
  );
}