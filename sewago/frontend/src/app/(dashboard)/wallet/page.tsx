
'use client';

// Force dynamic rendering to prevent build-time prerendering
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { walletService } from '@/lib/wallet';
import { FEATURE_FLAGS } from '@/lib/feature-flags';
import type { WalletBalance, WalletEntry } from '@/lib/wallet';
import { safeDownloadFile } from '@/hooks/useClientOnly';

export default function WalletPage() {
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [history, setHistory] = useState<WalletEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'loyalty' | 'referral' | 'resolution' | 'promotion'>('all');

  useEffect(() => {
    if (FEATURE_FLAGS.WALLET_ENABLED) {
      loadWalletData();
    } else {
      setLoading(false);
    }
  }, [filter]);

  const loadWalletData = async () => {
    setLoading(true);
    try {
      // Mock user ID - in real app, get from auth context
      const userId = 'user_123';
      
      const [balanceData, historyData] = await Promise.all([
        walletService.getBalance(userId),
        walletService.getHistory(userId, {
          type: filter === 'all' ? undefined : filter,
          limit: 50
        })
      ]);

      setBalance(balanceData);
      setHistory(historyData);
    } catch (error) {
      console.error('Failed to load wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportHistory = async () => {
    try {
      const userId = 'user_123';
      const csvData = await walletService.exportHistory(userId);
      
      // Use safe download utility
      const filename = `wallet-history-${new Date().toISOString().split('T')[0]}.csv`;
      safeDownloadFile(csvData, filename, 'text/csv');
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

      if (!FEATURE_FLAGS.WALLET_ENABLED) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Wallet Coming Soon</h2>
          <p className="text-gray-600">The SewaGo Wallet feature will be available soon!</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
            <div className="bg-gray-200 h-48 rounded-lg mb-8"></div>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">SewaGo Wallet</h1>
          <p className="text-gray-600 mt-2">
            Manage your credits and view transaction history
          </p>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-8 text-white mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Available Balance</h2>
              <p className="text-4xl font-bold">
                NPR {balance ? (balance.total / 100).toFixed(2) : '0.00'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-75 mb-1">Credits will be auto-applied</p>
              <p className="text-sm opacity-75">at checkout</p>
            </div>
          </div>

          {balance && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <p className="text-sm opacity-75">Loyalty</p>
                <p className="font-semibold">NPR {(balance.breakdown.loyalty / 100).toFixed(2)}</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <p className="text-sm opacity-75">Referral</p>
                <p className="font-semibold">NPR {(balance.breakdown.referral / 100).toFixed(2)}</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <p className="text-sm opacity-75">Resolution</p>
                <p className="font-semibold">NPR {(balance.breakdown.resolution / 100).toFixed(2)}</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <p className="text-sm opacity-75">Promotions</p>
                <p className="font-semibold">NPR {(balance.breakdown.promotion / 100).toFixed(2)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
              <div className="flex gap-4">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Transactions</option>
                  <option value="loyalty">Loyalty Credits</option>
                  <option value="referral">Referral Credits</option>
                  <option value="resolution">Resolution Credits</option>
                  <option value="promotion">Promotion Credits</option>
                </select>
                <button
                  onClick={exportHistory}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Export CSV
                </button>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {history.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions yet</h3>
                <p className="text-gray-600">Your wallet transaction history will appear here.</p>
              </div>
            ) : (
              history.map((entry) => (
                <div key={entry.id} className="p-6 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <div className={`w-3 h-3 rounded-full ${
                          entry.type === 'deduction' ? 'bg-red-500' :
                          entry.type === 'loyalty' ? 'bg-blue-500' :
                          entry.type === 'referral' ? 'bg-green-500' :
                          entry.type === 'resolution' ? 'bg-yellow-500' :
                          'bg-purple-500'
                        }`}></div>
                        <span className="font-medium text-gray-900 capitalize">
                          {entry.type.replace('_', ' ')}
                        </span>
                        {entry.expiresAt && entry.expiresAt < new Date() && (
                          <span className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded-full">
                            Expired
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-1">{entry.description}</p>
                      <p className="text-gray-400 text-xs">
                        {entry.createdAt.toLocaleDateString()} at {entry.createdAt.toLocaleTimeString()}
                      </p>
                      {entry.expiresAt && (
                        <p className="text-gray-400 text-xs">
                          Expires: {entry.expiresAt.toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        entry.amount >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {entry.amount >= 0 ? '+' : ''}NPR {(Math.abs(entry.amount) / 100).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
