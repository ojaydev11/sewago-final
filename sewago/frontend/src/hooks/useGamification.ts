'use client';

import { useState, useEffect, useCallback } from 'react';
import { useNotifications } from './useNotifications';
import { useAchievementNotifications, Achievement } from '@/components/gamification/AchievementNotification';

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
      config: any;
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
      config: any;
    }>;
  };
  challenges: {
    challenges: Array<any>;
    activeCount: number;
    joinedCount: number;
    completedCount: number;
  };
}

export function useGamification(locale = 'en') {
  const [data, setData] = useState<GamificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { createNotification } = useNotifications();
  const { showAchievement, AchievementNotificationComponent } = useAchievementNotifications(locale);

  const fetchGamificationData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
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

      const newData = { points, badges, streaks, challenges };
      
      // Check for new achievements
      if (data) {
        checkForNewAchievements(data, newData);
      }
      
      setData(newData);
    } catch (err) {
      console.error('Error fetching gamification data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [data, locale]);

  const checkForNewAchievements = (oldData: GamificationData, newData: GamificationData) => {
    // Check for new badges
    const newBadges = newData.badges.badges.filter(newBadge => 
      newBadge.isUnlocked && 
      !oldData.badges.badges.find(oldBadge => 
        oldBadge.type === newBadge.type && oldBadge.isUnlocked
      )
    );

    newBadges.forEach(badge => {
      showAchievement({
        id: `badge-${badge.type}`,
        type: 'badge',
        title: badge.config.nameEn,
        titleNe: badge.config.nameNe,
        description: badge.config.descriptionEn,
        descriptionNe: badge.config.descriptionNe,
        icon: badge.config.icon,
        color: badge.config.color,
        badgeType: badge.type,
        isRare: ['EARLY_ADOPTER', 'CHALLENGE_CHAMPION', 'LOYAL_MEMBER'].includes(badge.type)
      });
    });

    // Check for significant point increases
    const pointIncrease = newData.points.balance.totalPoints - oldData.points.balance.totalPoints;
    if (pointIncrease >= 100) {
      showAchievement({
        id: `points-${Date.now()}`,
        type: 'points',
        title: 'Points Milestone!',
        titleNe: 'अंक माइलस्टोन!',
        description: `You earned ${pointIncrease} points!`,
        descriptionNe: `तपाईंले ${pointIncrease} अंक कमाउनुभयो!`,
        icon: '⭐',
        color: 'gold',
        value: pointIncrease,
        isRare: pointIncrease >= 500
      });
    }

    // Check for new streak milestones
    newData.streaks.streaks.forEach(newStreak => {
      const oldStreak = oldData.streaks.streaks.find(s => s.type === newStreak.type);
      if (oldStreak && newStreak.currentStreak > oldStreak.currentStreak && newStreak.currentStreak % 5 === 0) {
        showAchievement({
          id: `streak-${newStreak.type}-${newStreak.currentStreak}`,
          type: 'streak',
          title: 'Streak Milestone!',
          titleNe: 'स्ट्रिक माइलस्टोन!',
          description: `${newStreak.currentStreak} ${newStreak.config.nameEn} streak!`,
          descriptionNe: `${newStreak.currentStreak} ${newStreak.config.nameNe} स्ट्रिक!`,
          icon: newStreak.config.icon,
          color: newStreak.config.color,
          value: newStreak.currentStreak * 10,
          isRare: newStreak.currentStreak >= 10
        });
      }
    });
  };

  const awardPoints = useCallback(async (
    points: number, 
    source: string, 
    sourceId?: string, 
    description?: string
  ) => {
    try {
      const response = await fetch('/api/gamification/points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          points,
          source,
          sourceId,
          description: description || `Earned ${points} points from ${source}`
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to award points');
      }

      const result = await response.json();
      
      // Refresh data to update UI
      await fetchGamificationData();
      
      return result;
    } catch (error) {
      console.error('Error awarding points:', error);
      throw error;
    }
  }, [fetchGamificationData]);

  const updateStreak = useCallback(async (type: string, activity: string) => {
    try {
      const response = await fetch('/api/gamification/streaks', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          activity
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update streak');
      }

      const result = await response.json();
      
      // Refresh data to update UI
      await fetchGamificationData();
      
      return result;
    } catch (error) {
      console.error('Error updating streak:', error);
      throw error;
    }
  }, [fetchGamificationData]);

  const joinChallenge = useCallback(async (challengeId: string) => {
    try {
      const response = await fetch('/api/gamification/challenges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          challengeId,
          action: 'join'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to join challenge');
      }

      const result = await response.json();
      
      createNotification({
        type: 'system',
        title: locale === 'ne' 
          ? 'चुनौती सफलतापूर्वक जोडियो!' 
          : 'Successfully joined challenge!',
        message: locale === 'ne' 
          ? 'चुनौती सफलतापूर्वक जोडियो!' 
          : 'Successfully joined challenge!',
        priority: 'medium',
        category: 'success',
        tags: ['challenge', 'gamification']
      });
      
      // Refresh data to update UI
      await fetchGamificationData();
      
      return result;
    } catch (error) {
      console.error('Error joining challenge:', error);
      createNotification({
        type: 'system',
        title: locale === 'ne' 
          ? 'चुनौती जोड्न असफल' 
          : 'Failed to join challenge',
        message: locale === 'ne' 
          ? 'चुनौती जोड्न असफल' 
          : 'Failed to join challenge',
        priority: 'high',
        category: 'error',
        tags: ['challenge', 'error']
      });
      throw error;
    }
  }, [fetchGamificationData, createNotification, locale]);

  const redeemPoints = useCallback(async (tierId: string, serviceAmount?: number) => {
    try {
      const response = await fetch('/api/gamification/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tierId,
          serviceAmount
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to redeem points');
      }

      const result = await response.json();
      
      createNotification({
        type: 'system',
        title: locale === 'ne' 
          ? `${result.redemption.points} अंक सफलतापूर्वक रिडेम भयो!` 
          : `Successfully redeemed ${result.redemption.points} points!`,
        message: locale === 'ne' 
          ? `${result.redemption.points} अंक सफलतापूर्वक रिडेम भयो!` 
          : `Successfully redeemed ${result.redemption.points} points!`,
        priority: 'medium',
        category: 'success',
        tags: ['redemption', 'gamification']
      });
      
      // Refresh data to update UI
      await fetchGamificationData();
      
      return result;
    } catch (error) {
      console.error('Error redeeming points:', error);
      createNotification({
        type: 'system',
        title: locale === 'ne' 
          ? 'पोइन्ट रिडेम गर्न असफल' 
          : 'Failed to redeem points',
        message: locale === 'ne' 
          ? 'पोइन्ट रिडेम गर्न असफल' 
          : 'Failed to redeem points',
        priority: 'high',
        category: 'error',
        tags: ['redemption', 'error']
      });
      throw error;
    }
  }, [fetchGamificationData, createNotification, locale]);

  // Handle gamification events from booking flow
  const handleBookingComplete = useCallback(async (bookingId: string, serviceCategory: string, amount: number) => {
    try {
      // Award base points for booking completion
      const basePoints = Math.min(Math.floor(amount / 100), 50); // 1 point per NPR 1, max 50 points
      await awardPoints(basePoints, 'booking', bookingId, 'Booking completed');

      // Update booking streak
      await updateStreak('WEEKLY_BOOKING', 'booking_completed');

      // Check if this triggers any specific achievements
      await fetchGamificationData();
    } catch (error) {
      console.error('Error handling booking completion:', error);
    }
  }, [awardPoints, updateStreak, fetchGamificationData]);

  const handleReviewSubmit = useCallback(async (reviewId: string, rating: number) => {
    try {
      // Award points based on review quality
      const reviewPoints = rating >= 4 ? 20 : 10;
      await awardPoints(reviewPoints, 'review', reviewId, 'Review submitted');

      // Update review streak
      await updateStreak('REVIEW_STREAK', 'review_submitted');

      await fetchGamificationData();
    } catch (error) {
      console.error('Error handling review submission:', error);
    }
  }, [awardPoints, updateStreak, fetchGamificationData]);

  const handleReferralSuccess = useCallback(async (referralId: string) => {
    try {
      // Award referral bonus
      await awardPoints(100, 'referral', referralId, 'Successful referral');
      
      await fetchGamificationData();
    } catch (error) {
      console.error('Error handling referral success:', error);
    }
  }, [awardPoints, fetchGamificationData]);

  // Initial data fetch
  useEffect(() => {
    fetchGamificationData();
  }, []);

  return {
    data,
    loading,
    error,
    refresh: fetchGamificationData,
    awardPoints,
    updateStreak,
    joinChallenge,
    redeemPoints,
    handleBookingComplete,
    handleReviewSubmit,
    handleReferralSuccess,
    AchievementNotificationComponent
  };
}