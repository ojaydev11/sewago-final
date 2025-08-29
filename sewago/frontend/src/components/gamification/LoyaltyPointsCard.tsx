'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Star, 
  TrendingUp, 
  TrendingDown, 
  Gift, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Sparkles
} from 'lucide-react';
import { format } from 'date-fns';
import { useLocalizedCurrency } from '@/hooks/useLocalizedCurrency';

interface PointsData {
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
}

interface LoyaltyPointsCardProps {
  data: PointsData;
  locale?: string;
  compact?: boolean;
}

export function LoyaltyPointsCard({ data, locale = 'en', compact = false }: LoyaltyPointsCardProps) {
  const [showTransactions, setShowTransactions] = useState(false);
  const [animatePoints, setAnimatePoints] = useState(false);
  const { formatCurrency } = useLocalizedCurrency();

  useEffect(() => {
    // Animate points when component mounts or data changes
    setAnimatePoints(true);
    const timer = setTimeout(() => setAnimatePoints(false), 1000);
    return () => clearTimeout(timer);
  }, [data.balance.availablePoints]);

  const getPointsEquivalent = (points: number) => {
    // 100 points = NPR 10 equivalent value
    const nprValue = points / 10;
    return formatCurrency(nprValue * 100); // Convert to paisa
  };

  const getTransactionIcon = (type: string, source: string) => {
    if (type === 'EARNED') {
      switch (source) {
        case 'booking':
          return <Calendar className="w-4 h-4 text-green-500" />;
        case 'review':
          return <Star className="w-4 h-4 text-yellow-500" />;
        case 'referral':
          return <Gift className="w-4 h-4 text-purple-500" />;
        case 'challenge':
          return <Sparkles className="w-4 h-4 text-blue-500" />;
        default:
          return <ArrowUpRight className="w-4 h-4 text-green-500" />;
      }
    } else {
      return <ArrowDownRight className="w-4 h-4 text-red-500" />;
    }
  };

  const getSourceText = (source: string, type: string) => {
    if (locale === 'ne') {
          const sourceMap: Record<string, string> = {
      booking: 'बुकिङ',
      review: 'समीक्षा',
      referral: 'रेफरल',
      challenge: 'चुनौती',
      redemption: 'रिडेम्प्सन'
    };
    return sourceMap[source] || source;
    }
    
    const sourceMap: Record<string, string> = {
      booking: 'Booking',
      review: 'Review',
      referral: 'Referral',
      challenge: 'Challenge',
      redemption: 'Redemption'
    };
    return sourceMap[source] || source;
  };

  const nextMilestone = () => {
    const current = data.balance.availablePoints;
    const milestones = [100, 250, 500, 1000, 2000, 5000];
    return milestones.find(m => m > current) || milestones[milestones.length - 1];
  };

  const progressToNext = () => {
    const current = data.balance.availablePoints;
    const next = nextMilestone();
    const previous = [...[0], ...milestones.filter(m => m < next)].pop() || 0;
    return ((current - previous) / (next - previous)) * 100;
  };

  const milestones = [100, 250, 500, 1000, 2000, 5000];

  if (compact) {
    return (
      <Card className="h-full hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <motion.div
              animate={animatePoints ? { scale: [1, 1.2, 1], rotate: [0, 10, 0] } : {}}
              transition={{ duration: 0.5 }}
            >
              <Star className="w-5 h-5 text-yellow-500" />
            </motion.div>
            {locale === 'ne' ? 'अंकहरू' : 'Points'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <motion.div
              animate={animatePoints ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.6 }}
              className="text-3xl font-bold text-yellow-600 mb-2"
            >
              {data.balance.availablePoints.toLocaleString()}
            </motion.div>
            <div className="text-sm text-gray-600 mb-3">
              {locale === 'ne' ? 'उपलब्ध' : 'Available'}
            </div>
            <div className="text-xs text-gray-500">
              ≈ {getPointsEquivalent(data.balance.availablePoints)}
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>{locale === 'ne' ? 'अर्को माइलस्टोन' : 'Next milestone'}</span>
              <span>{nextMilestone()}</span>
            </div>
            <Progress value={progressToNext()} className="h-2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 border-yellow-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              animate={animatePoints ? { scale: [1, 1.2, 1], rotate: [0, 10, 0] } : {}}
              transition={{ duration: 0.5 }}
            >
              <Star className="w-6 h-6 text-yellow-500" />
            </motion.div>
            {locale === 'ne' ? 'लयल्टी अंकहरू' : 'Loyalty Points'}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTransactions(!showTransactions)}
          >
            <Clock className="w-4 h-4 mr-1" />
            {locale === 'ne' ? 'इतिहास' : 'History'}
          </Button>
        </CardTitle>
        <CardDescription>
          {locale === 'ne' 
            ? 'सेवा प्रयोग गरेर अंक कमाउनुहोस् र पुरस्कार पाउनुहोस्'
            : 'Earn points by using services and unlock rewards'
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Points Balance */}
        <div className="grid grid-cols-3 gap-4">
          <motion.div
            animate={animatePoints ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 0.6 }}
            className="text-center p-4 bg-white rounded-lg border border-yellow-200"
          >
            <div className="text-2xl font-bold text-yellow-600">
              {data.balance.availablePoints.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">
              {locale === 'ne' ? 'उपलब्ध' : 'Available'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              ≈ {getPointsEquivalent(data.balance.availablePoints)}
            </div>
          </motion.div>
          
          <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-600">
              {data.balance.totalPoints.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">
              {locale === 'ne' ? 'कुल' : 'Total'}
            </div>
          </div>
          
          <div className="text-center p-4 bg-white rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-600">
              {data.balance.lifetimeEarned.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">
              {locale === 'ne' ? 'जीवनकाल' : 'Lifetime'}
            </div>
          </div>
        </div>

        {/* Progress to Next Milestone */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">
              {locale === 'ne' ? 'अर्को माइलस्टोन' : 'Next Milestone'}
            </span>
            <Badge variant="outline" className="text-xs">
              {nextMilestone()} {locale === 'ne' ? 'अंक' : 'points'}
            </Badge>
          </div>
          <Progress value={progressToNext()} className="h-3" />
          <div className="text-xs text-gray-500 text-center">
            {nextMilestone() - data.balance.availablePoints} {locale === 'ne' ? 'अंक बाँकी' : 'points to go'}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Gift className="w-4 h-4 mr-1" />
            {locale === 'ne' ? 'रिडेम गर्नुहोस्' : 'Redeem'}
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <TrendingUp className="w-4 h-4 mr-1" />
            {locale === 'ne' ? 'कमाउन तरिकाहरू' : 'Earn More'}
          </Button>
        </div>

        {/* Recent Transactions */}
        <AnimatePresence>
          {showTransactions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-3 border-t pt-4"
            >
              <h4 className="font-medium text-sm">
                {locale === 'ne' ? 'हालका कारोबारहरू' : 'Recent Transactions'}
              </h4>
              
              {data.transactions.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {data.transactions.map((transaction, index) => (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getTransactionIcon(transaction.type, transaction.source)}
                        <div>
                          <div className="text-sm font-medium">
                            {transaction.description}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-2">
                            <span>{getSourceText(transaction.source, transaction.type)}</span>
                            <span>•</span>
                            <span>{format(new Date(transaction.createdAt), 'MMM dd')}</span>
                          </div>
                        </div>
                      </div>
                      <div className={`text-sm font-medium ${
                        transaction.type === 'EARNED' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'EARNED' ? '+' : '-'}{Math.abs(transaction.points)}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 text-sm">
                  {locale === 'ne' 
                    ? 'कुनै कारोबार भेटिएन' 
                    : 'No transactions found'
                  }
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}