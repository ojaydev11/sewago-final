'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, AlertTriangle, CheckCircle, TrendingUp, Users } from 'lucide-react'

interface HealthMetrics {
  systemStatus: 'healthy' | 'warning' | 'critical'
  activeAlerts: number
  criticalAlerts: number
  aiModulesOnline: number
  totalAiModules: number
  lastReportGenerated: string
  recentActions: number
}

export function SystemHealthOverview() {
  const [metrics, setMetrics] = useState<HealthMetrics>({
    systemStatus: 'healthy',
    activeAlerts: 0,
    criticalAlerts: 0,
    aiModulesOnline: 5,
    totalAiModules: 5,
    lastReportGenerated: new Date().toISOString(),
    recentActions: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHealthMetrics()
    
    // Update metrics every minute
    const interval = setInterval(fetchHealthMetrics, 60000)
    return () => clearInterval(interval)
  }, [])

  const fetchHealthMetrics = async () => {
    try {
      // Fetch basic system health metrics
      const alertsResponse = await fetch('/api/dashboard/alerts?status=UNREAD&limit=100')
      const alertsData = await alertsResponse.json()
      
      const criticalAlerts = alertsData.alerts?.filter((a: any) => a.level === 'CRITICAL').length || 0
      const totalAlerts = alertsData.alerts?.length || 0
      
      setMetrics({
        systemStatus: criticalAlerts > 0 ? 'critical' : totalAlerts > 10 ? 'warning' : 'healthy',
        activeAlerts: totalAlerts,
        criticalAlerts,
        aiModulesOnline: 5, // All modules online
        totalAiModules: 5,
        lastReportGenerated: new Date().toISOString(),
        recentActions: Math.floor(Math.random() * 50) + 20, // Simulated
      })
    } catch (error) {
      console.error('Error fetching health metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100'
      case 'warning': return 'text-yellow-600 bg-yellow-100'
      case 'critical': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5" />
      case 'warning': return <AlertTriangle className="w-5 h-5" />
      case 'critical': return <AlertTriangle className="w-5 h-5" />
      default: return <Activity className="w-5 h-5" />
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">System Status</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center space-x-2">
            <Badge className={`${getStatusColor(metrics.systemStatus)} border-0 px-3 py-1`}>
              <div className="flex items-center space-x-1">
                {getStatusIcon(metrics.systemStatus)}
                <span className="capitalize font-medium">{metrics.systemStatus}</span>
              </div>
            </Badge>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {metrics.aiModulesOnline}/{metrics.totalAiModules} AI modules online
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Active Alerts</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-gray-900">
              {metrics.activeAlerts}
            </div>
            {metrics.criticalAlerts > 0 && (
              <Badge variant="destructive" className="text-xs">
                {metrics.criticalAlerts} Critical
              </Badge>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Unread system alerts
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
            <Activity className="w-4 h-4 mr-1" />
            AI Actions (24h)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold text-gray-900">
            {metrics.recentActions}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Automated actions executed
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Last Report</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-sm font-medium text-gray-900">
            {new Date(metrics.lastReportGenerated).toLocaleDateString()}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Weekly empire report
          </p>
        </CardContent>
      </Card>
    </div>
  )
}