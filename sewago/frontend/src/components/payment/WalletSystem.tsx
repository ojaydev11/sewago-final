'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, CreditCard, TrendingUp, Shield, Zap, RefreshCw, Plus, Minus, DollarSign, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
// Mock useAuth hook for development
const useAuth = () => ({ user: { id: 'mock-user-id', name: 'Mock User', email: 'mock@example.com' } });

interface WalletData {
  balance: number;
  currency: string;
  transactions: Array<{
    type: 'CREDIT' | 'DEBIT' | 'REFUND' | 'BONUS' | 'REFERRAL' | 'CASHBACK';
    amount: number;
    description: string;
    timestamp: string;
  }>;
  linkedPaymentMethods: Array<{
    method: string;
    accountId: string;
    isDefault: boolean;
  }>;
  autoRecharge: {
    enabled: boolean;
    threshold: number;
    amount: number;
    paymentMethod: string;
  };
  bnplEnabled: boolean;
  creditLimit: number;
  usedCredit: number;
}

interface Transaction {
  type: 'CREDIT' | 'DEBIT' | 'REFUND' | 'BONUS' | 'REFERRAL' | 'CASHBACK';
  amount: number;
  description: string;
  timestamp: string;
}

export default function WalletSystem() {
  const { user } = useAuth();
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [showBNPL, setShowBNPL] = useState(false);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('ESEWA');

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/wallet', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setWalletData(data.wallet);
      } else {
        toast.error('Failed to fetch wallet data');
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      toast.error('Failed to fetch wallet data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFunds = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      const response = await fetch('/api/wallet/add-funds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          paymentMethod,
          referenceId: `WALLET_${Date.now()}`
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Successfully added ${data.newBalance} ${walletData?.currency} to wallet`);
        setAmount('');
        setShowAddFunds(false);
        fetchWalletData();
      } else {
        toast.error('Failed to add funds');
      }
    } catch (error) {
      console.error('Error adding funds:', error);
      toast.error('Failed to add funds');
    }
  };

  const handleSetupBNPL = async () => {
    try {
      const response = await fetch('/api/wallet/setup-bnpl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          creditLimit: 5000,
          paymentMethod: 'ESEWA'
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`BNPL setup successful! Credit limit: ${data.creditLimit} ${walletData?.currency}`);
        setShowBNPL(false);
        fetchWalletData();
      } else {
        toast.error('Failed to setup BNPL');
      }
    } catch (error) {
      console.error('Error setting up BNPL:', error);
      toast.error('Failed to setup BNPL');
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'CREDIT':
        return <Plus className="w-4 h-4 text-green-500" />;
      case 'DEBIT':
        return <Minus className="w-4 h-4 text-red-500" />;
      case 'REFUND':
        return <RefreshCw className="w-4 h-4 text-blue-500" />;
      case 'BONUS':
        return <Zap className="w-4 h-4 text-yellow-500" />;
      case 'REFERRAL':
        return <TrendingUp className="w-4 h-4 text-purple-500" />;
      case 'CASHBACK':
        return <DollarSign className="w-4 h-4 text-green-600" />;
      default:
        return <DollarSign className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'CREDIT':
      case 'REFUND':
      case 'BONUS':
      case 'REFERRAL':
      case 'CASHBACK':
        return 'text-green-600';
      case 'DEBIT':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!walletData) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">Wallet Not Found</h3>
        <p className="text-gray-500">Unable to load wallet information.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Digital Wallet</h1>
        <p className="text-gray-600">Manage your funds, payments, and credit options</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Balance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="w-5 h-5" />
                  Available Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">
                  {walletData.balance} {walletData.currency}
                </div>
                <p className="text-blue-100 text-sm">Ready to use for payments</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  BNPL Credit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">
                  {walletData.creditLimit - walletData.usedCredit} {walletData.currency}
                </div>
                <p className="text-green-100 text-sm">
                  {walletData.bnplEnabled ? 'Available credit' : 'Not enabled'}
                </p>
                {walletData.bnplEnabled && (
                  <Progress 
                    value={(walletData.usedCredit / walletData.creditLimit) * 100} 
                    className="mt-2 bg-green-400"
                  />
                )}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Auto-Recharge
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">
                  {walletData.autoRecharge.enabled ? 'Active' : 'Inactive'}
                </div>
                <p className="text-purple-100 text-sm">
                  {walletData.autoRecharge.enabled 
                    ? `Recharges at ${walletData.autoRecharge.threshold} ${walletData.currency}`
                    : 'Set up automatic recharging'
                  }
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your wallet quickly</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  onClick={() => setShowAddFunds(true)}
                  className="w-full h-12"
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Funds
                </Button>
                
                <Button 
                  onClick={() => setShowBNPL(true)}
                  className="w-full h-12"
                  variant="outline"
                  disabled={walletData.bnplEnabled}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  {walletData.bnplEnabled ? 'BNPL Active' : 'Setup BNPL'}
                </Button>
                
                <Button 
                  className="w-full h-12"
                  variant="outline"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Auto-Recharge
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>View all your wallet transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {walletData.transactions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No transactions yet
                  </div>
                ) : (
                  walletData.transactions.map((transaction, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        {getTransactionIcon(transaction.type)}
                        <div>
                          <p className="font-medium text-gray-900">{transaction.description}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(transaction.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                        {transaction.type === 'DEBIT' ? '-' : '+'}{transaction.amount} {walletData.currency}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment-methods" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Linked Payment Methods</CardTitle>
              <CardDescription>Manage your connected payment options</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {walletData.linkedPaymentMethods.map((method, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-900">{method.method}</p>
                        <p className="text-sm text-gray-500">****{method.accountId.slice(-4)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {method.isDefault && (
                        <Badge variant="secondary">Default</Badge>
                      )}
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
                
                <Button className="w-full" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Payment Method
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Auto-Recharge Settings</CardTitle>
              <CardDescription>Configure automatic wallet recharging</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto-Recharge</p>
                  <p className="text-sm text-gray-500">Automatically add funds when balance is low</p>
                </div>
                <Button variant={walletData.autoRecharge.enabled ? "default" : "outline"}>
                  {walletData.autoRecharge.enabled ? 'Active' : 'Inactive'}
                </Button>
              </div>
              
              {walletData.autoRecharge.enabled && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Threshold</label>
                    <p className="text-lg font-semibold">{walletData.autoRecharge.threshold} {walletData.currency}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Recharge Amount</label>
                    <p className="text-lg font-semibold">{walletData.autoRecharge.amount} {walletData.currency}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Funds Modal */}
      <AnimatePresence>
        {showAddFunds && (
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
              <h3 className="text-lg font-semibold mb-4">Add Funds to Wallet</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount ({walletData.currency})
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter amount"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ESEWA">eSewa</option>
                    <option value="KHALTI">Khalti</option>
                    <option value="BANK">Bank Transfer</option>
                  </select>
                </div>
                
                <div className="flex gap-3">
                  <Button onClick={handleAddFunds} className="flex-1">
                    Add Funds
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAddFunds(false)}
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

      {/* BNPL Setup Modal */}
      <AnimatePresence>
        {showBNPL && (
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
              <h3 className="text-lg font-semibold mb-4">Setup Buy Now, Pay Later</h3>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-800">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Credit Check Passed</span>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">
                    You're eligible for BNPL services based on your booking history.
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Credit Limit
                  </label>
                  <p className="text-lg font-semibold text-green-600">5,000 {walletData.currency}</p>
                  <p className="text-sm text-gray-500">Available for immediate use</p>
                </div>
                
                <div className="flex gap-3">
                  <Button onClick={handleSetupBNPL} className="flex-1">
                    Activate BNPL
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowBNPL(false)}
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
