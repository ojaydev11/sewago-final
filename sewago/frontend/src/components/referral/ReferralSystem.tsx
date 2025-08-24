'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Share2, Gift, TrendingUp, Users2, CreditCard, Copy, CheckCircle, Plus, Settings, Award, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  completedReferrals: number;
  totalEarnings: number;
  referralCode: string;
}

interface SocialCircle {
  circleId: string;
  circleName: string;
  members: string[];
  maxMembers: number;
  splitPaymentEnabled: boolean;
  splitMethod: string;
}

interface ReferralReward {
  type: string;
  amount: number;
  currency: string;
  claimed: boolean;
  claimedAt?: string;
}

export default function ReferralSystem() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [socialCircles, setSocialCircles] = useState<SocialCircle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateCircle, setShowCreateCircle] = useState(false);
  const [showJoinCircle, setShowJoinCircle] = useState(false);
  const [showSplitPayment, setShowSplitPayment] = useState(false);
  const [circleName, setCircleName] = useState('');
  const [circleId, setCircleId] = useState('');
  const [splitMethod, setSplitMethod] = useState('EQUAL');

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch referral stats
      const statsResponse = await fetch('/api/referral/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setReferralStats(statsData.stats);
      }

      // Fetch social circles
      const circlesResponse = await fetch('/api/referral/social-circles', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (circlesResponse.ok) {
        const circlesData = await circlesResponse.json();
        setSocialCircles(circlesData.circles);
      }

    } catch (error) {
      console.error('Error fetching referral data:', error);
      toast.error('Failed to fetch referral data');
    } finally {
      setIsLoading(false);
    }
  };

  const generateReferralCode = async () => {
    try {
      const response = await fetch('/api/referral/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReferralStats(prev => prev ? { ...prev, referralCode: data.referralCode } : null);
        toast.success('Referral code generated successfully!');
      } else {
        toast.error('Failed to generate referral code');
      }
    } catch (error) {
      console.error('Error generating referral code:', error);
      toast.error('Failed to generate referral code');
    }
  };

  const copyReferralCode = async () => {
    if (referralStats?.referralCode) {
      try {
        await navigator.clipboard.writeText(referralStats.referralCode);
        toast.success('Referral code copied to clipboard!');
      } catch (error) {
        toast.error('Failed to copy referral code');
      }
    }
  };

  const createSocialCircle = async () => {
    if (!circleName.trim()) {
      toast.error('Please enter a circle name');
      return;
    }

    try {
      const response = await fetch('/api/referral/social-circle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          circleName: circleName.trim(),
          maxMembers: 10
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Social circle created successfully!');
        setCircleName('');
        setShowCreateCircle(false);
        fetchReferralData();
      } else {
        toast.error('Failed to create social circle');
      }
    } catch (error) {
      console.error('Error creating social circle:', error);
      toast.error('Failed to create social circle');
    }
  };

  const joinSocialCircle = async () => {
    if (!circleId.trim()) {
      toast.error('Please enter a circle ID');
      return;
    }

    try {
      const response = await fetch('/api/referral/join-circle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ circleId: circleId.trim() })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Joined social circle successfully!');
        setCircleId('');
        setShowJoinCircle(false);
        fetchReferralData();
      } else {
        toast.error('Failed to join social circle');
      }
    } catch (error) {
      console.error('Error joining social circle:', error);
      toast.error('Failed to join social circle');
    }
  };

  const setupSplitPayment = async (circleId: string) => {
    try {
      const response = await fetch('/api/referral/split-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          circleId,
          splitMethod,
          participants: []
        })
      });

      if (response.ok) {
        toast.success('Split payment setup successful!');
        setShowSplitPayment(false);
        fetchReferralData();
      } else {
        toast.error('Failed to setup split payment');
      }
    } catch (error) {
      console.error('Error setting up split payment:', error);
      toast.error('Failed to setup split payment');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Referral & Social Network</h1>
        <p className="text-gray-600">Earn rewards by referring friends and build social circles for group services</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
          <TabsTrigger value="social-circles">Social Circles</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Referral Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Total Referrals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">
                  {referralStats?.totalReferrals || 0}
                </div>
                <p className="text-blue-100 text-sm">People you've referred</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Active Referrals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">
                  {referralStats?.activeReferrals || 0}
                </div>
                <p className="text-green-100 text-sm">Currently active</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  Total Earnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">
                  {referralStats?.totalEarnings || 0} NPR
                </div>
                <p className="text-purple-100 text-sm">From referrals</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Users2 className="w-5 h-5" />
                  Social Circles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">
                  {socialCircles.length}
                </div>
                <p className="text-orange-100 text-sm">Active circles</p>
              </CardContent>
            </Card>
          </div>

          {/* Referral Code Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Your Referral Code
              </CardTitle>
              <CardDescription>
                Share this code with friends to earn rewards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {referralStats?.referralCode ? (
                <div className="flex items-center gap-4">
                  <div className="flex-1 p-4 bg-gray-50 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <code className="text-lg font-mono text-gray-900">
                        {referralStats.referralCode}
                      </code>
                      <Button
                        onClick={copyReferralCode}
                        variant="outline"
                        size="sm"
                        className="ml-4"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">You don't have a referral code yet</p>
                  <Button onClick={generateReferralCode}>
                    <Plus className="w-4 h-4 mr-2" />
                    Generate Referral Code
                  </Button>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-green-500" />
                  <span>You earn 100 NPR for each successful referral</span>
                </div>
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-blue-500" />
                  <span>Your friend gets 50 NPR welcome bonus</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your referral and social network activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  onClick={() => setShowCreateCircle(true)}
                  className="w-full h-12"
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Social Circle
                </Button>
                
                <Button 
                  onClick={() => setShowJoinCircle(true)}
                  className="w-full h-12"
                  variant="outline"
                >
                  <Users2 className="w-4 h-4 mr-2" />
                  Join Circle
                </Button>
                
                <Button 
                  className="w-full h-12"
                  variant="outline"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Referral
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referrals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Referral Performance
              </CardTitle>
              <CardDescription>Track your referral success and earnings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Referral Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {referralStats?.totalReferrals || 0}
                    </div>
                    <div className="text-blue-800 font-medium">Total Referrals</div>
                    <div className="text-blue-600 text-sm">All time</div>
                  </div>
                  
                  <div className="text-center p-6 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {referralStats?.activeReferrals || 0}
                    </div>
                    <div className="text-green-800 font-medium">Active Referrals</div>
                    <div className="text-green-600 text-sm">Currently using SewaGo</div>
                  </div>
                  
                  <div className="text-center p-6 bg-purple-50 rounded-lg">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {referralStats?.totalEarnings || 0} NPR
                    </div>
                    <div className="text-purple-800 font-medium">Total Earnings</div>
                    <div className="text-purple-600 text-sm">From successful referrals</div>
                  </div>
                </div>

                {/* Referral Tips */}
                <div className="border-t pt-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Tips for Successful Referrals</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                        1
                      </div>
                      <p className="text-gray-600">Share your referral code on social media</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                        2
                      </div>
                      <p className="text-gray-600">Tell friends about your positive experiences</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                        3
                      </div>
                      <p className="text-gray-600">Encourage them to book their first service</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                        4
                      </div>
                      <p className="text-gray-600">Follow up to ensure they complete booking</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social-circles" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users2 className="w-5 h-5" />
                    Social Circles
                  </CardTitle>
                  <CardDescription>Create and manage social circles for group services</CardDescription>
                </div>
                <Button onClick={() => setShowCreateCircle(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Circle
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {socialCircles.map((circle, index) => (
                  <motion.div
                    key={circle.circleId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-medium text-gray-900">{circle.circleName}</h4>
                        <p className="text-sm text-gray-500">
                          {circle.members.length} / {circle.maxMembers} members
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {circle.splitPaymentEnabled && (
                          <Badge variant="secondary">Split Payment Enabled</Badge>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCircleId(circle.circleId);
                            setShowSplitPayment(true);
                          }}
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Settings
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-blue-600">{circle.members.length}</div>
                        <div className="text-xs text-gray-600">Members</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-green-600">{circle.maxMembers}</div>
                        <div className="text-xs text-gray-600">Max Capacity</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-purple-600">
                          {circle.splitPaymentEnabled ? 'Yes' : 'No'}
                        </div>
                        <div className="text-xs text-gray-600">Split Payment</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-orange-600">
                          {circle.splitMethod}
                        </div>
                        <div className="text-xs text-gray-600">Split Method</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {socialCircles.length === 0 && (
                  <div className="text-center py-12">
                    <Users2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No Social Circles Yet</h3>
                    <p className="text-gray-500">Create your first social circle to start group services</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Referral Rewards
              </CardTitle>
              <CardDescription>Track your earnings and claim rewards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Rewards Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-gradient-to-br from-green-100 to-green-200 rounded-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <Gift className="w-8 h-8 text-green-600" />
                      <div>
                        <h4 className="font-semibold text-green-800">Referrer Rewards</h4>
                        <p className="text-green-600 text-sm">What you earn</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-green-700">Per Referral:</span>
                        <span className="font-semibold text-green-800">100 NPR</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">Total Earned:</span>
                        <span className="font-semibold text-green-800">{referralStats?.totalEarnings || 0} NPR</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <Target className="w-8 h-8 text-blue-600" />
                      <div>
                        <h4 className="font-semibold text-blue-800">Friend Rewards</h4>
                        <p className="text-blue-600 text-sm">What they get</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-blue-700">Welcome Bonus:</span>
                        <span className="font-semibold text-blue-800">50 NPR</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">First Service:</span>
                        <span className="font-semibold text-blue-800">10% Off</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reward Tiers */}
                <div className="border-t pt-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Reward Tiers</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="w-12 h-12 bg-bronze-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Award className="w-6 h-6 text-bronze-600" />
                      </div>
                      <h5 className="font-medium text-gray-900 mb-1">Bronze</h5>
                      <p className="text-sm text-gray-600">1-5 referrals</p>
                      <p className="text-xs text-gray-500">100 NPR per referral</p>
                    </div>
                    
                    <div className="text-center p-4 border rounded-lg bg-gradient-to-br from-gray-50 to-gray-100">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Award className="w-6 h-6 text-gray-600" />
                      </div>
                      <h5 className="font-medium text-gray-900 mb-1">Silver</h5>
                      <p className="text-sm text-gray-600">6-15 referrals</p>
                      <p className="text-xs text-gray-500">110 NPR per referral</p>
                    </div>
                    
                    <div className="text-center p-4 border rounded-lg bg-gradient-to-br from-yellow-50 to-yellow-100">
                      <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Award className="w-6 h-6 text-yellow-600" />
                      </div>
                      <h5 className="font-medium text-gray-900 mb-1">Gold</h5>
                      <p className="text-sm text-gray-600">16+ referrals</p>
                      <p className="text-xs text-gray-500">125 NPR per referral</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Social Circle Modal */}
      <AnimatePresence>
        {showCreateCircle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
            >
              <h3 className="text-lg font-semibold mb-4">Create Social Circle</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Circle Name</label>
                  <Input
                    value={circleName}
                    onChange={(e) => setCircleName(e.target.value)}
                    placeholder="Enter circle name"
                  />
                </div>
                
                <div className="flex gap-3">
                  <Button onClick={createSocialCircle} className="flex-1">
                    Create Circle
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCreateCircle(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Join Social Circle Modal */}
      <AnimatePresence>
        {showJoinCircle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
            >
              <h3 className="text-lg font-semibold mb-4">Join Social Circle</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Circle ID</label>
                  <Input
                    value={circleId}
                    onChange={(e) => setCircleId(e.target.value)}
                    placeholder="Enter circle ID"
                  />
                </div>
                
                <div className="flex gap-3">
                  <Button onClick={joinSocialCircle} className="flex-1">
                    Join Circle
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowJoinCircle(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Split Payment Setup Modal */}
      <AnimatePresence>
        {showSplitPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
            >
              <h3 className="text-lg font-semibold mb-4">Setup Split Payment</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Split Method</label>
                  <select
                    value={splitMethod}
                    onChange={(e) => setSplitMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="EQUAL">Equal Split</option>
                    <option value="PERCENTAGE">Percentage Based</option>
                    <option value="CUSTOM">Custom Amounts</option>
                  </select>
                </div>
                
                <div className="flex gap-3">
                  <Button onClick={() => setupSplitPayment(circleId)} className="flex-1">
                    Setup Split Payment
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowSplitPayment(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
