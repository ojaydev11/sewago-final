'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  CreditCard, 
  Calendar, 
  Download, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  Smartphone,
  Wallet,
  RefreshCw,
  X,
  Eye
} from 'lucide-react';
import { TierBadge } from './TierBadge';
import { cn } from '@/lib/utils';

interface SubscriptionBillingProps {
  userId: string;
  subscription: any;
}

interface BillingData {
  subscription: {
    tier: string;
    status: string;
    nextBilling?: string;
    lastPayment?: string;
    autoRenew: boolean;
    paymentMethod?: string;
  };
  billing: {
    currentCost: number;
    billingCycle: string;
    currency: string;
    nextBillingAmount: number;
    nextBillingDate?: string;
    daysUntilBilling?: number;
  };
  upcomingBilling?: {
    date: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    autoRenew: boolean;
  };
  history: Array<{
    id: string;
    date: string;
    amount: number;
    currency: string;
    status: string;
    paymentMethod: string;
    description: string;
  }>;
  paymentMethods: Array<{
    id: string;
    name: string;
    type: string;
    supported: boolean;
    icon: string;
  }>;
}

export function SubscriptionBilling({ userId, subscription }: SubscriptionBillingProps) {
  const [billingData, setBillingData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpdatePaymentDialog, setShowUpdatePaymentDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');

  const fetchBillingData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check if we're in a build environment
      if (typeof window === 'undefined') {
        // Use mock data during build/SSR
        setBillingData(getMockBillingData());
        return;
      }
      
      const response = await fetch(`/api/subscriptions/billing?userId=${userId}`);
      const data = await response.json();
      
      if (response.ok) {
        setBillingData(data);
        setSelectedPaymentMethod(data.subscription.paymentMethod || '');
      } else {
        console.error('Failed to fetch billing data:', data.error);
        // Fallback to mock data
        setBillingData(getMockBillingData());
      }
    } catch (error) {
      console.error('Error fetching billing data:', error);
      // Fallback to mock data
      setBillingData(getMockBillingData());
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchBillingData();
  }, [fetchBillingData]);

  // Mock data for build/fallback scenarios
  const getMockBillingData = (): BillingData => ({
    subscription: {
      tier: subscription.tier,
      status: 'ACTIVE',
      nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      lastPayment: new Date().toISOString(),
      autoRenew: true,
      paymentMethod: 'khalti'
    },
    billing: {
      currentCost: subscription.tier === 'PRO' ? 2999 : 1999,
      billingCycle: 'monthly',
      currency: 'NPR',
      nextBillingAmount: subscription.tier === 'PRO' ? 2999 : 1999,
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      daysUntilBilling: 30
    },
    upcomingBilling: {
      date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      amount: subscription.tier === 'PRO' ? 2999 : 1999,
      currency: 'NPR',
      paymentMethod: 'khalti',
      autoRenew: true
    },
    history: [
      {
        id: 'bill-1',
        date: new Date().toISOString(),
        amount: subscription.tier === 'PRO' ? 2999 : 1999,
        currency: 'NPR',
        status: 'PAID',
        paymentMethod: 'khalti',
        description: 'Monthly subscription'
      }
    ],
    paymentMethods: [
      {
        id: 'pm-1',
        name: 'Khalti',
        type: 'khalti',
        supported: true,
        icon: 'khalti'
      },
      {
        id: 'pm-2',
        name: 'Esewa',
        type: 'esewa',
        supported: false,
        icon: 'esewa'
      }
    ]
  });

  const updatePaymentMethod = async () => {
    try {
      const response = await fetch('/api/subscriptions/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_payment_method',
          userId,
          paymentMethod: selectedPaymentMethod
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        await fetchBillingData();
        setShowUpdatePaymentDialog(false);
      } else {
        console.error('Failed to update payment method:', data.error);
      }
    } catch (error) {
      console.error('Error updating payment method:', error);
    }
  };

  const toggleAutoRenew = async (autoRenew: boolean) => {
    try {
      const response = await fetch('/api/subscriptions/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_auto_renew',
          userId,
          autoRenew
        })
      });

      if (response.ok) {
        await fetchBillingData();
      } else {
        const data = await response.json();
        console.error('Failed to toggle auto-renew:', data.error);
      }
    } catch (error) {
      console.error('Error toggling auto-renew:', error);
    }
  };

  const cancelSubscription = async (cancelImmediately: boolean = false) => {
    try {
      const response = await fetch('/api/subscriptions/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cancel_subscription',
          userId,
          cancelImmediately,
          reason: 'User requested cancellation'
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        await fetchBillingData();
        setShowCancelDialog(false);
      } else {
        console.error('Failed to cancel subscription:', data.error);
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Cancelled</Badge>;
      case 'EXPIRED':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Expired</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'khalti':
        return <Smartphone className="h-4 w-4" />;
      case 'esewa':
        return <Wallet className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!billingData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Billing Information</h3>
          <p className="text-gray-600">Unable to load your billing information.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="h-6 w-6" />
              <span>Current Subscription</span>
            </div>
            <TierBadge tier={billingData.subscription.tier as any} />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-gray-600">Status</div>
              <div className="mt-1">
                {getStatusBadge(billingData.subscription.status)}
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-600">Monthly Cost</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                NPR {Math.round(billingData.billing.currentCost / 100)}
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-600">Billing Cycle</div>
              <div className="text-lg font-medium text-gray-900 mt-1 capitalize">
                {billingData.billing.billingCycle}
              </div>
            </div>
          </div>

          {/* Auto-Renew Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Auto-Renewal</div>
              <div className="text-sm text-gray-600">
                Automatically renew your subscription each month
              </div>
            </div>
            <Switch
              checked={billingData.subscription.autoRenew}
              onCheckedChange={toggleAutoRenew}
            />
          </div>
        </CardContent>
      </Card>

      {/* Next Billing */}
      {billingData.upcomingBilling && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Next Billing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-blue-700">Next Payment</div>
                    <div className="text-2xl font-bold text-blue-900">
                      NPR {Math.round(billingData.upcomingBilling.amount / 100)}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-blue-700">Due Date</div>
                    <div className="text-lg font-medium text-blue-900">
                      {new Date(billingData.upcomingBilling.date).toLocaleDateString()}
                    </div>
                    {billingData.billing.daysUntilBilling && (
                      <div className="text-sm text-blue-700">
                        ({billingData.billing.daysUntilBilling} days remaining)
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <div className="text-sm text-blue-700">Payment Method</div>
                    <div className="flex items-center gap-2 mt-1">
                      {getPaymentMethodIcon(billingData.upcomingBilling.paymentMethod)}
                      <span className="font-medium capitalize">
                        {billingData.upcomingBilling.paymentMethod}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  {billingData.upcomingBilling.autoRenew ? (
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Auto-renewal enabled</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-orange-700">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm">Auto-renewal disabled</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Method Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Payment Method
            </div>
            <Dialog open={showUpdatePaymentDialog} onOpenChange={setShowUpdatePaymentDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Update
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Payment Method</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    {billingData.paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        onClick={() => method.supported && setSelectedPaymentMethod(method.id)}
                        className={cn(
                          'p-4 border rounded-lg cursor-pointer transition-all',
                          method.supported ? 'hover:border-blue-300' : 'opacity-50 cursor-not-allowed',
                          selectedPaymentMethod === method.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          {getPaymentMethodIcon(method.id)}
                          <div className="flex-1">
                            <div className="font-medium">{method.name}</div>
                            <div className="text-sm text-gray-600 capitalize">{method.type.replace('_', ' ')}</div>
                          </div>
                          {method.supported ? (
                            selectedPaymentMethod === method.id && (
                              <CheckCircle className="h-5 w-5 text-blue-600" />
                            )
                          ) : (
                            <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="outline" onClick={() => setShowUpdatePaymentDialog(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={updatePaymentMethod}
                      disabled={!selectedPaymentMethod || selectedPaymentMethod === billingData.subscription.paymentMethod}
                    >
                      Update Payment Method
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {billingData.subscription.paymentMethod ? (
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              {getPaymentMethodIcon(billingData.subscription.paymentMethod)}
              <div>
                <div className="font-medium capitalize">
                  {billingData.subscription.paymentMethod}
                </div>
                <div className="text-sm text-gray-600">
                  Primary payment method
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No payment method configured
            </div>
          )}
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Billing History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {billingData.history.length > 0 ? (
            <div className="space-y-4">
              {billingData.history.map((transaction) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-green-100 rounded-full">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {transaction.description}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center gap-4">
                        <span>{new Date(transaction.date).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1">
                          {getPaymentMethodIcon(transaction.paymentMethod)}
                          <span className="capitalize">{transaction.paymentMethod}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      NPR {Math.round(transaction.amount / 100)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                        {transaction.status}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No billing history available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium text-red-900 mb-2">Cancel Subscription</h4>
                <p className="text-sm text-red-700">
                  Cancel your subscription and lose access to premium features. 
                  This action cannot be undone.
                </p>
              </div>
              
              <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-50">
                    Cancel Subscription
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="text-red-600">Cancel Subscription</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <span className="font-medium text-red-900">Warning</span>
                      </div>
                      <p className="text-sm text-red-700">
                        Cancelling your subscription will:
                      </p>
                      <ul className="list-disc list-inside text-sm text-red-700 mt-2 space-y-1">
                        <li>Remove access to premium features</li>
                        <li>Cancel any remaining service credits</li>
                        <li>Downgrade your account to Free tier</li>
                        <li>End family plan benefits (if applicable)</li>
                      </ul>
                    </div>
                    
                    <div className="flex justify-end gap-3 pt-4 border-t">
                      <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                        Keep Subscription
                      </Button>
                      <Button 
                        onClick={() => cancelSubscription(false)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Cancel at Period End
                      </Button>
                      <Button 
                        onClick={() => cancelSubscription(true)}
                        variant="destructive"
                      >
                        Cancel Immediately
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}