import React from 'react'
import { redirect } from 'next/navigation'
import { auth } from '@/providers/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LiveAlertsFeed } from '@/components/ceo/LiveAlertsFeed'
import { DemandHeatmap } from '@/components/ceo/DemandHeatmap'
import { ProblematicProviders } from '@/components/ceo/ProblematicProviders'
import { FraudLogbook } from '@/components/ceo/FraudLogbook'
import { WeeklyReportsArchive } from '@/components/ceo/WeeklyReportsArchive'
import { ServiceOpportunities } from '@/components/ceo/ServiceOpportunities'
import { SystemHealthOverview } from '@/components/ceo/SystemHealthOverview'
import { AlertTriangle, Shield, TrendingUp, Users, MapPin, FileText } from 'lucide-react'

export default async function CEODashboardPage() {
  const session = await auth()

  // Check if user is authorized (implement your own admin check)
  if (!session?.user || !isAuthorizedCEO(session.user)) {
    redirect('/auth/signin')
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CEO Control Panel</h1>
          <p className="text-gray-600 mt-1">
            Empire Autopilot System - Real-time monitoring and AI-driven insights
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>AI Systems Online</span>
          </div>
        </div>
      </div>

      {/* System Health Overview */}
      <SystemHealthOverview />

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="alerts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="alerts" className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Live Alerts</span>
          </TabsTrigger>
          <TabsTrigger value="demand" className="flex items-center space-x-2">
            <MapPin className="w-4 h-4" />
            <span>Demand Map</span>
          </TabsTrigger>
          <TabsTrigger value="providers" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Providers</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>Security</span>
          </TabsTrigger>
          <TabsTrigger value="opportunities" className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>Opportunities</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Reports</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Live System Alerts</CardTitle>
              <CardDescription>
                Real-time alerts from all AI modules. Critical alerts require immediate attention.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LiveAlertsFeed />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demand" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Service Demand Heatmap</CardTitle>
              <CardDescription>
                Visualize service demand intensity across different locations and categories.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DemandHeatmap />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="providers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Provider Management</CardTitle>
              <CardDescription>
                Monitor provider performance, warnings, and take corrective actions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProblematicProviders />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security & Fraud Detection</CardTitle>
              <CardDescription>
                Monitor security flags, investigate suspicious activities, and manage fraud prevention.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FraudLogbook />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="opportunities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Market Opportunities</CardTitle>
              <CardDescription>
                Discover new service opportunities based on user search patterns and demand analysis.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ServiceOpportunities />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Reports Archive</CardTitle>
              <CardDescription>
                Access historical weekly reports generated by the EmpireWatchdog AI system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WeeklyReportsArchive />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Helper function to check CEO authorization
function isAuthorizedCEO(user: any): boolean {
  // Implement your own authorization logic
  // This could check for specific roles, email domains, etc.
  return user.email === 'ceo@sewago.com' || 
         user.role === 'admin' || 
         user.email?.endsWith('@sewago.com')
}