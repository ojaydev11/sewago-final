'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Gift, 
  Star, 
  ShoppingCart, 
  Percent, 
  Clock,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Ticket,
  Trophy,
  Diamond
} from 'lucide-react';
import { useLocalizedCurrency } from '@/hooks/useLocalizedCurrency';
import { useNotifications } from '@/hooks/useNotifications';

interface RedemptionTier {
  id: string;
  nameEn: string;
  nameNe: string;
  points: number;
  discountPercent: number;
  maxDiscount: number;
  icon: string;
  color: string;
  isAvailable: boolean;
  remaining: number;
}

interface Redemption {
  id: string;
  points: number;
  discountAmount: number;
  status: string;
  createdAt: string;
  redeemedAt?: string;
  bookingId?: string;
}

interface PointsStoreData {
  availablePoints: number;
  tiers: RedemptionTier[];
  redemptions: Redemption[];
}

interface PointsStoreProps {
  locale?: string;
}

export function PointsStore({ locale = 'en' }: PointsStoreProps) {
  const [data, setData] = useState<PointsStoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [serviceAmount, setServiceAmount] = useState<number>(0);
  const [selectedTier, setSelectedTier] = useState<RedemptionTier | null>(null);
  const { formatCurrency } = useLocalizedCurrency();
  const { showNotification } = useNotifications();

  useEffect(() => {
    fetchRedemptionData();
  }, []);

  const fetchRedemptionData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/gamification/redeem');
      
      if (!response.ok) {
        throw new Error('Failed to fetch redemption data');
      }

      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching redemption data:', error);
      showNotification('error', 
        locale === 'ne' 
          ? 'रिडेम्प्सन डेटा लोड गर्न असफल' 
          : 'Failed to load redemption data'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (tier: RedemptionTier) => {
    try {
      setRedeeming(tier.id);
      
      const response = await fetch('/api/gamification/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tierId: tier.id,
          serviceAmount: serviceAmount > 0 ? serviceAmount * 100 : undefined // Convert to paisa
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to redeem points');
      }

      const result = await response.json();
      
      showNotification('success', 
        locale === 'ne' 
          ? `${tier.points} अंक सफलतापूर्वक रिडेम भयो!` 
          : `Successfully redeemed ${tier.points} points!`
      );
      
      // Refresh data
      await fetchRedemptionData();
      setSelectedTier(null);
      setServiceAmount(0);
      
    } catch (error) {
      console.error('Error redeeming points:', error);
      showNotification('error', 
        locale === 'ne' 
          ? 'पोइन्ट रिडेम गर्न असफल' 
          : 'Failed to redeem points'
      );
    } finally {
      setRedeeming(null);
    }
  };

  const getTierIcon = (iconEmoji: string, color: string) => {
    const iconMap = {
      '🎟️': Ticket,
      '🎫': Ticket,
      '🎪': Gift,
      '🏆': Trophy,
      '💎': Diamond
    };
    
    const IconComponent = iconMap[iconEmoji] || Gift;
    return <IconComponent className="w-6 h-6" />;
  };

  const getTierColor = (color: string) => {
    const colorMap = {
      blue: 'from-blue-50 to-blue-100 border-blue-200 text-blue-700',
      green: 'from-green-50 to-green-100 border-green-200 text-green-700',
      orange: 'from-orange-50 to-orange-100 border-orange-200 text-orange-700',
      gold: 'from-yellow-50 to-yellow-100 border-yellow-200 text-yellow-700',
      diamond: 'from-purple-50 to-purple-100 border-purple-200 text-purple-700'
    };
    
    return colorMap[color] || 'from-gray-50 to-gray-100 border-gray-200 text-gray-700';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPLIED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'EXPIRED':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'CANCELLED':
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    if (locale === 'ne') {
      const statusMap = {
        APPLIED: 'लागू',
        PENDING: 'पेन्डिङ',
        EXPIRED: 'समाप्त',
        CANCELLED: 'रद्द'
      };
      return statusMap[status] || status;
    }
    
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  const calculateDiscount = (tier: RedemptionTier, amount: number) => {
    if (amount <= 0) return tier.maxDiscount;
    
    const discountAmount = Math.min(
      Math.floor((amount * tier.discountPercent) / 100),
      tier.maxDiscount
    );
    
    return discountAmount;
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            {locale === 'ne' ? 'पोइन्ट स्टोर' : 'Points Store'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="h-full">
        <CardContent className="pt-6 text-center">
          <p className="text-gray-600">
            {locale === 'ne' ? 'डेटा लोड गर्न सकिएन' : 'Failed to load data'}
          </p>
          <Button onClick={fetchRedemptionData} className="mt-4" size="sm">
            {locale === 'ne' ? 'फेरि प्रयास गर्नुहोस्' : 'Try Again'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="w-6 h-6 text-green-600" />
          {locale === 'ne' ? 'पोइन्ट स्टोर' : 'Points Store'}
        </CardTitle>
        <CardDescription>
          {locale === 'ne' 
            ? 'आफ्नो अंकहरू छुटमा रूपान्तरण गर्नुहोस्'
            : 'Convert your points into valuable discounts'
          }
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Available Points */}
        <div className="bg-white rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="font-medium">
                {locale === 'ne' ? 'उपलब्ध अंकहरू' : 'Available Points'}
              </span>
            </div>
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-2xl font-bold text-green-600"
            >
              {data.availablePoints.toLocaleString()}
            </motion.div>
          </div>
        </div>

        <Tabs defaultValue="redeem" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="redeem">
              {locale === 'ne' ? 'रिडेम गर्नुहोस्' : 'Redeem'}
            </TabsTrigger>
            <TabsTrigger value="history">
              {locale === 'ne' ? 'इतिहास' : 'History'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="redeem" className="space-y-4 mt-4">
            {/* Service Amount Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {locale === 'ne' ? 'सेवा रकम (वैकल्पिक)' : 'Service Amount (Optional)'}
              </label>
              <Input
                type="number"
                placeholder={locale === 'ne' ? 'NPR मा रकम प्रविष्ट गर्नुहोस्' : 'Enter amount in NPR'}
                value={serviceAmount || ''}
                onChange={(e) => setServiceAmount(parseInt(e.target.value) || 0)}
                className="w-full"
              />
              <p className="text-xs text-gray-600">
                {locale === 'ne' 
                  ? 'सटीक छुट गणना गर्न सेवा रकम प्रविष्ट गर्नुहोस्'
                  : 'Enter service amount for accurate discount calculation'
                }
              </p>
            </div>

            {/* Redemption Tiers */}
            <div className="space-y-3">
              {data.tiers.map((tier, index) => (
                <motion.div
                  key={tier.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border-2 transition-all duration-300 bg-gradient-to-r ${getTierColor(tier.color)} ${
                    selectedTier?.id === tier.id 
                      ? 'ring-2 ring-green-400 ring-offset-2' 
                      : tier.isAvailable 
                        ? 'hover:shadow-md cursor-pointer' 
                        : 'opacity-50 cursor-not-allowed'
                  }`}
                  onClick={() => tier.isAvailable && setSelectedTier(tier)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                        {getTierIcon(tier.icon, tier.color)}
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {locale === 'ne' ? tier.nameNe : tier.nameEn}
                        </h3>
                        <p className="text-sm opacity-80">
                          {tier.discountPercent}% {locale === 'ne' ? 'छुट' : 'discount'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-bold text-lg">
                        {tier.points} {locale === 'ne' ? 'अंक' : 'pts'}
                      </div>
                      {serviceAmount > 0 && (
                        <div className="text-sm">
                          ≈ {formatCurrency(calculateDiscount(tier, serviceAmount * 100))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span>
                      {locale === 'ne' ? 'अधिकतम छुट:' : 'Max discount:'} {formatCurrency(tier.maxDiscount)}
                    </span>
                    
                    {!tier.isAvailable && (
                      <Badge variant="outline">
                        {tier.remaining} {locale === 'ne' ? 'अंक चाहिन्छ' : 'points needed'}
                      </Badge>
                    )}
                  </div>

                  {selectedTier?.id === tier.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 pt-3 border-t border-white/30"
                    >
                      <Button
                        onClick={() => handleRedeem(tier)}
                        disabled={redeeming === tier.id}
                        className="w-full bg-white text-green-700 hover:bg-gray-50"
                      >
                        {redeeming === tier.id ? (
                          <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            {locale === 'ne' ? 'रिडेम गर्नुहोस्' : 'Redeem Now'}
                          </>
                        )}
                      </Button>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-3 mt-4">
            {data.redemptions.length > 0 ? (
              <div className="space-y-3">
                {data.redemptions.map((redemption, index) => (
                  <motion.div
                    key={redemption.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(redemption.status)}
                      <div>
                        <div className="font-medium text-sm">
                          {formatCurrency(redemption.discountAmount)} {locale === 'ne' ? 'छुट' : 'discount'}
                        </div>
                        <div className="text-xs text-gray-600">
                          {getStatusText(redemption.status)} • {
                            new Date(redemption.createdAt).toLocaleDateString(
                              locale === 'ne' ? 'ne-NP' : 'en-US'
                            )
                          }
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-red-600">
                        -{redemption.points}
                      </div>
                      <div className="text-xs text-gray-600">
                        {locale === 'ne' ? 'अंक' : 'points'}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="font-medium text-gray-600 mb-1">
                  {locale === 'ne' ? 'कुनै रिडेम्प्सन छैन' : 'No redemptions yet'}
                </h3>
                <p className="text-sm text-gray-500">
                  {locale === 'ne' 
                    ? 'आफ्नो पहिलो छुट रिडेम गर्नुहोस्!'
                    : 'Redeem your first discount!'
                  }
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}