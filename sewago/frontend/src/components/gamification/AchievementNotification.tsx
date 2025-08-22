'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Star, 
  Gift, 
  Sparkles, 
  X,
  Award,
  Crown,
  Target,
  Flame,
  CheckCircle
} from 'lucide-react';
import { ParticleField } from '@/components/ui/ParticleField';
import confetti from 'canvas-confetti';

export interface Achievement {
  id: string;
  type: 'badge' | 'points' | 'streak' | 'challenge' | 'level';
  title: string;
  titleNe: string;
  description: string;
  descriptionNe: string;
  icon: string;
  color: string;
  value?: number;
  badgeType?: string;
  isRare?: boolean;
}

interface AchievementNotificationProps {
  achievement: Achievement | null;
  locale?: string;
  onClose: () => void;
  onClaim?: () => void;
}

export function AchievementNotification({ 
  achievement, 
  locale = 'en', 
  onClose, 
  onClaim 
}: AchievementNotificationProps) {
  const [showParticles, setShowParticles] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);
      setShowParticles(true);
      
      // Trigger confetti for rare achievements
      if (achievement.isRare) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']
        });
      }
      
      // Auto-hide particles after animation
      const timer = setTimeout(() => setShowParticles(false), 3000);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [achievement]);

  const getAchievementIcon = (icon: string, type: string, isRare = false) => {
    // Handle emoji icons
    if (icon && icon.length === 2) {
      return (
        <motion.span 
          className={`text-6xl ${isRare ? 'filter drop-shadow-lg' : ''}`}
          animate={isRare ? { 
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0]
          } : {
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: isRare ? 2 : 1, 
            repeat: isRare ? Infinity : 3 
          }}
        >
          {icon}
        </motion.span>
      );
    }
    
    // Fallback to Lucide icons
    const iconMap = {
      badge: Trophy,
      points: Star,
      streak: Flame,
      challenge: Target,
      level: Crown
    };
    
    const IconComponent = iconMap[type] || Trophy;
    const iconColor = isRare ? 'text-yellow-400' : getIconColor(type);
    
    return (
      <motion.div
        animate={isRare ? { 
          scale: [1, 1.2, 1],
          rotate: [0, 10, -10, 0]
        } : {
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: isRare ? 2 : 1, 
          repeat: isRare ? Infinity : 3 
        }}
      >
        <IconComponent className={`w-16 h-16 ${iconColor}`} />
      </motion.div>
    );
  };

  const getIconColor = (type: string) => {
    const colorMap = {
      badge: 'text-purple-500',
      points: 'text-yellow-500',
      streak: 'text-orange-500',
      challenge: 'text-blue-500',
      level: 'text-green-500'
    };
    
    return colorMap[type] || 'text-gray-500';
  };

  const getBackgroundGradient = (color: string, isRare = false) => {
    if (isRare) {
      return 'from-yellow-100 via-orange-50 to-red-50 border-yellow-300';
    }
    
    const gradientMap = {
      gold: 'from-yellow-50 to-orange-50 border-yellow-200',
      blue: 'from-blue-50 to-indigo-50 border-blue-200',
      purple: 'from-purple-50 to-pink-50 border-purple-200',
      green: 'from-green-50 to-teal-50 border-green-200',
      orange: 'from-orange-50 to-red-50 border-orange-200',
      teal: 'from-teal-50 to-cyan-50 border-teal-200'
    };
    
    return gradientMap[color] || 'from-gray-50 to-slate-50 border-gray-200';
  };

  const getAchievementTypeText = (type: string) => {
    if (locale === 'ne') {
      const typeMap = {
        badge: 'ब्याज अनलक!',
        points: 'अंक कमाएको!',
        streak: 'स्ट्रिक बनाएको!',
        challenge: 'चुनौती पूरा!',
        level: 'स्तर बढेको!'
      };
      return typeMap[type] || 'उपलब्धि!';
    }
    
    const typeMap = {
      badge: 'Badge Unlocked!',
      points: 'Points Earned!',
      streak: 'Streak Achieved!',
      challenge: 'Challenge Complete!',
      level: 'Level Up!'
    };
    return typeMap[type] || 'Achievement!';
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(), 300);
  };

  const handleClaim = () => {
    if (onClaim) {
      onClaim();
    }
    handleClose();
  };

  if (!achievement) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={handleClose}
        >
          {/* Particle Effect */}
          <AnimatePresence>
            {showParticles && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 pointer-events-none"
              >
                <ParticleField 
                  particleCount={achievement.isRare ? 80 : 50} 
                  colors={achievement.isRare 
                    ? ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']
                    : ['#FFD700', '#4ECDC4', '#45B7D1']
                  } 
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Achievement Card */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ 
              type: "spring", 
              damping: 15, 
              stiffness: 300 
            }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-md w-full"
          >
            <Card className={`overflow-hidden bg-gradient-to-br ${getBackgroundGradient(achievement.color, achievement.isRare)} border-2 shadow-2xl`}>
              {/* Rare Achievement Glow */}
              {achievement.isRare && (
                <motion.div
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-red-400/20"
                />
              )}

              {/* Close Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-white/80 hover:bg-white"
              >
                <X className="w-4 h-4" />
              </Button>

              {/* Content */}
              <div className="p-8 text-center relative">
                {/* Achievement Type Badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mb-4"
                >
                  <Badge 
                    className={`${achievement.isRare ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' : 'bg-white/80'} text-sm font-semibold`}
                  >
                    {achievement.isRare && <Sparkles className="w-3 h-3 mr-1" />}
                    {getAchievementTypeText(achievement.type)}
                    {achievement.isRare && ' ✨'}
                  </Badge>
                </motion.div>

                {/* Achievement Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    delay: 0.3, 
                    type: "spring", 
                    damping: 10, 
                    stiffness: 100 
                  }}
                  className="mb-6"
                >
                  {getAchievementIcon(achievement.icon, achievement.type, achievement.isRare)}
                </motion.div>

                {/* Achievement Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className={`text-2xl font-bold mb-2 ${achievement.isRare ? 'text-transparent bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text' : 'text-gray-900'}`}
                >
                  {locale === 'ne' ? achievement.titleNe : achievement.title}
                </motion.h2>

                {/* Achievement Description */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-gray-600 mb-6 leading-relaxed"
                >
                  {locale === 'ne' ? achievement.descriptionNe : achievement.description}
                </motion.p>

                {/* Achievement Value */}
                {achievement.value && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mb-6"
                  >
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${achievement.isRare ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white' : 'bg-white border-2 border-gray-200'}`}>
                      <Star className="w-5 h-5" />
                      <span className="font-bold text-lg">
                        +{achievement.value} {locale === 'ne' ? 'अंक' : 'points'}
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex gap-3 justify-center"
                >
                  {onClaim && (
                    <Button
                      onClick={handleClaim}
                      className={`${achievement.isRare ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600' : 'bg-green-600 hover:bg-green-700'} text-white font-semibold px-6`}
                    >
                      <Gift className="w-4 h-4 mr-2" />
                      {locale === 'ne' ? 'पुरस्कार लिनुहोस्' : 'Claim Reward'}
                    </Button>
                  )}
                  
                  <Button
                    onClick={handleClose}
                    variant="outline"
                    className="bg-white/80 hover:bg-white"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {locale === 'ne' ? 'ठिक छ' : 'Awesome!'}
                  </Button>
                </motion.div>

                {/* Rare Achievement Special Message */}
                {achievement.isRare && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-4 text-xs text-orange-600 font-medium"
                  >
                    {locale === 'ne' 
                      ? '🎉 यो एक दुर्लभ उपलब्धि हो! बधाई छ!'
                      : '🎉 This is a rare achievement! Congratulations!'
                    }
                  </motion.div>
                )}
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook for managing achievement notifications
export function useAchievementNotifications(locale = 'en') {
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  const [achievementQueue, setAchievementQueue] = useState<Achievement[]>([]);

  const showAchievement = (achievement: Achievement) => {
    if (currentAchievement) {
      // Add to queue if one is already showing
      setAchievementQueue(prev => [...prev, achievement]);
    } else {
      setCurrentAchievement(achievement);
    }
  };

  const closeCurrentAchievement = () => {
    setCurrentAchievement(null);
    
    // Show next achievement from queue
    setTimeout(() => {
      setAchievementQueue(prev => {
        if (prev.length > 0) {
          setCurrentAchievement(prev[0]);
          return prev.slice(1);
        }
        return prev;
      });
    }, 500);
  };

  const AchievementNotificationComponent = ({ onClaim }: { onClaim?: () => void }) => (
    <AchievementNotification
      achievement={currentAchievement}
      locale={locale}
      onClose={closeCurrentAchievement}
      onClaim={onClaim}
    />
  );

  return {
    showAchievement,
    AchievementNotificationComponent,
    hasActiveAchievement: !!currentAchievement,
    queueLength: achievementQueue.length
  };
}