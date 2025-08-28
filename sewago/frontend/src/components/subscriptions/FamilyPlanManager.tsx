'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Users, 
  UserPlus, 
  UserMinus, 
  Mail, 
  Crown, 
  Clock,
  Check,
  X,
  AlertCircle,
  Copy,
  Settings,
  Shield
} from 'lucide-react';
import { TierBadge } from './TierBadge';
import { cn } from '@/lib/utils';

interface FamilyPlanManagerProps {
  userId: string;
  subscription: any;
  onUpdate: () => void;
}

interface FamilyPlanData {
  id: string;
  ownerId: string;
  tier: 'PLUS' | 'PRO';
  maxMembers: number;
  currentMembers: number;
  sharedCredits: number;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  subscriptions: Array<{
    userId: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  }>;
  invitations: Array<{
    id: string;
    email: string;
    status: string;
    createdAt: string;
    inviter: {
      name: string;
    };
  }>;
}

export function FamilyPlanManager({ userId, subscription, onUpdate }: FamilyPlanManagerProps) {
  const [familyPlan, setFamilyPlan] = useState<FamilyPlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  const fetchFamilyPlan = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check if we're in a build environment
      if (typeof window === 'undefined') {
        // Use mock data during build/SSR
        setFamilyPlan(getMockFamilyPlan());
        return;
      }
      
      const response = await fetch(`/api/subscriptions/family?userId=${userId}`);
      const data = await response.json();
      
      if (response.ok && data) {
        setFamilyPlan(data);
      } else {
        setFamilyPlan(null);
      }
    } catch (error) {
      console.error('Error fetching family plan:', error);
      setFamilyPlan(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchFamilyPlan();
  }, [fetchFamilyPlan]);

  // Mock data for build/fallback scenarios
  const getMockFamilyPlan = (): FamilyPlanData => ({
    id: 'mock-family-123',
    ownerId: userId,
    tier: subscription.tier,
    maxMembers: subscription.tier === 'PRO' ? 6 : 4,
    currentMembers: 1,
    sharedCredits: 10000, // Example shared credits
    owner: {
      id: 'mock-owner-id',
      name: 'Mock Owner',
      email: 'mock.owner@example.com'
    },
    subscriptions: [
      {
        userId: userId,
        user: {
          id: 'mock-owner-id',
          name: 'Mock Owner',
          email: 'mock.owner@example.com'
        }
      }
    ],
    invitations: []
  });

  const createFamilyPlan = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/subscriptions/family', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          ownerId: userId,
          tier: subscription.tier,
          paymentMethod: 'khalti' // Default payment method
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        await fetchFamilyPlan();
        onUpdate();
        setShowCreateDialog(false);
      } else {
        console.error('Failed to create family plan:', data.error);
      }
    } catch (error) {
      console.error('Error creating family plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const inviteMember = async () => {
    if (!inviteEmail.trim() || !familyPlan) return;

    try {
      setInviteLoading(true);
      const response = await fetch('/api/subscriptions/family', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'invite',
          familyPlanId: familyPlan.id,
          email: inviteEmail.trim(),
          invitedBy: userId
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setInviteEmail('');
        setShowInviteDialog(false);
        await fetchFamilyPlan();
      } else {
        console.error('Failed to invite member:', data.error);
      }
    } catch (error) {
      console.error('Error inviting member:', error);
    } finally {
      setInviteLoading(false);
    }
  };

  const removeMember = async (memberId: string) => {
    if (!familyPlan) return;

    try {
      const response = await fetch('/api/subscriptions/family', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'remove_member',
          familyPlanId: familyPlan.id,
          userId: memberId,
          removedBy: userId
        })
      });

      if (response.ok) {
        await fetchFamilyPlan();
        onUpdate();
      } else {
        const data = await response.json();
        console.error('Failed to remove member:', data.error);
      }
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  const copyInviteLink = (invitationId: string) => {
    const link = `${window.location.origin}/family-invite/${invitationId}`;
    navigator.clipboard.writeText(link);
    // Show toast notification
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
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

  // No family plan exists
  if (!familyPlan) {
    return (
      <div className="space-y-6">
        {/* Create Family Plan Card */}
        <Card className="border-2 border-dashed border-gray-300">
          <CardContent className="p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Create a Family Plan
            </h3>
            
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Share your {subscription.tier} benefits with up to {subscription.tier === 'PRO' ? '6' : '4'} family members 
              and save money with our family pricing.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 max-w-md mx-auto text-sm">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span>Shared subscription benefits</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span>Shared service credits pool</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span>Easy member management</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span>Family dashboard</span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">Family Plan Pricing</span>
              </div>
              <p className="text-sm text-blue-800">
                {subscription.tier} Family: NPR {subscription.tier === 'PRO' ? '899' : '499'}/month 
                (vs NPR {subscription.tier === 'PRO' ? '599' : '299'} × {subscription.tier === 'PRO' ? '6' : '4'} = 
                NPR {subscription.tier === 'PRO' ? '3594' : '1196'} individually)
              </p>
            </div>

            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-purple-600 hover:bg-purple-700"
                  disabled={subscription.tier === 'FREE'}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Create Family Plan
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Family Plan</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Family Plan Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Plan Type:</span>
                        <TierBadge tier={subscription.tier} size="sm" />
                      </div>
                      <div className="flex justify-between">
                        <span>Max Members:</span>
                        <span>{subscription.tier === 'PRO' ? '6' : '4'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Monthly Cost:</span>
                        <span className="font-medium">NPR {subscription.tier === 'PRO' ? '899' : '499'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={createFamilyPlan}
                      disabled={loading}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {loading ? 'Creating...' : 'Create Family Plan'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {subscription.tier === 'FREE' && (
              <p className="text-sm text-gray-500 mt-4">
                Upgrade to Plus or Pro to create a family plan
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOwner = familyPlan.ownerId === userId;
  const canInviteMembers = isOwner && familyPlan.currentMembers < familyPlan.maxMembers;

  return (
    <div className="space-y-6">
      {/* Family Plan Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-full">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Family Plan</h3>
                <p className="text-sm text-gray-600">
                  {isOwner ? 'You own this family plan' : 'You are a member of this family plan'}
                </p>
              </div>
            </div>
            <TierBadge tier={familyPlan.tier} />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Plan Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{familyPlan.currentMembers}</div>
              <div className="text-sm text-gray-600">Active Members</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{familyPlan.maxMembers}</div>
              <div className="text-sm text-gray-600">Max Members</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                NPR {Math.round(familyPlan.sharedCredits / 100)}
              </div>
              <div className="text-sm text-gray-600">Shared Credits</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{familyPlan.invitations.length}</div>
              <div className="text-sm text-gray-600">Pending Invites</div>
            </div>
          </div>

          {/* Family Owner */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Crown className="h-4 w-4 text-yellow-500" />
              Family Plan Owner
            </h4>
            <div className="p-4 border border-gray-200 rounded-lg bg-yellow-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-200 rounded-full flex items-center justify-center">
                    <Shield className="h-5 w-5 text-yellow-700" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{familyPlan.owner.name}</div>
                    <div className="text-sm text-gray-600">{familyPlan.owner.email}</div>
                  </div>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                  Owner
                </Badge>
              </div>
            </div>
          </div>

          {/* Family Members */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Family Members ({familyPlan.subscriptions.length})
              </h4>
              {canInviteMembers && (
                <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Invite Family Member</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <Input
                          type="email"
                          placeholder="Enter email address"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                        />
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-blue-900">Invitation Details</span>
                        </div>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• They'll get full {familyPlan.tier} benefits</li>
                          <li>• Shared access to family credits</li>
                          <li>• Invitation expires in 7 days</li>
                        </ul>
                      </div>
                      
                      <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={inviteMember}
                          disabled={inviteLoading || !inviteEmail.trim()}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {inviteLoading ? 'Sending...' : 'Send Invitation'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            
            <div className="space-y-3">
              {familyPlan.subscriptions.map((member) => (
                <div key={member.userId} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{member.user.name}</div>
                        <div className="text-sm text-gray-600">{member.user.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        Active
                      </Badge>
                      {isOwner && member.userId !== familyPlan.ownerId && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeMember(member.userId)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Invitations */}
          {familyPlan.invitations.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Pending Invitations ({familyPlan.invitations.length})
              </h4>
              
              <div className="space-y-3">
                {familyPlan.invitations.map((invitation) => (
                  <div key={invitation.id} className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center">
                          <Clock className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{invitation.email}</div>
                          <div className="text-sm text-gray-600">
                            Invited by {invitation.inviter.name} • {new Date(invitation.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                          Pending
                        </Badge>
                        {isOwner && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyInviteLink(invitation.id)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Family Plan Benefits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Family Plan Benefits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-600" />
                <span className="font-medium">Shared {familyPlan.tier} Benefits</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                All family members get full {familyPlan.tier} subscription benefits
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-purple-600" />
                <span className="font-medium">Shared Credits Pool</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                NPR {Math.round(familyPlan.sharedCredits / 100)} monthly credits shared among all members
              </p>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Easy Management</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Owner can invite, remove members, and manage family settings
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}