'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AlertTriangle, CheckCircle, Clock, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SystemAlert {
  id: string
  level: 'INFO' | 'WARNING' | 'CRITICAL'
  title: string
  message: string
  details?: any
  status: 'UNREAD' | 'READ' | 'ARCHIVED'
  resolvedAt?: string
  createdAt: string
}

interface AlertsResponse {
  alerts: SystemAlert[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

export function LiveAlertsFeed() {
  const [alerts, setAlerts] = useState<SystemAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<{
    level?: string
    status?: string
  }>({})
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetchAlerts()
    
    // Set up real-time updates (polling every 30 seconds)
    const interval = setInterval(fetchAlerts, 30000)
    return () => clearInterval(interval)
  }, [filter])

  const fetchAlerts = async () => {
    try {
      const params = new URLSearchParams()
      if (filter.level) params.append('level', filter.level)
      if (filter.status) params.append('status', filter.status)
      
      const response = await fetch(`/api/dashboard/alerts?${params}`)
      const data: AlertsResponse = await response.json()
      
      if (response.ok) {
        setAlerts(data.alerts)
      }
    } catch (error) {
      console.error('Error fetching alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateAlertStatus = async (alertId: string, status: string) => {
    setUpdating(alertId)
    try {
      const response = await fetch('/api/dashboard/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId, status }),
      })

      if (response.ok) {
        setAlerts(prev => 
          prev.map(alert => 
            alert.id === alertId 
              ? { ...alert, status: status as any, resolvedAt: new Date().toISOString() }
              : alert
          )
        )
      }
    } catch (error) {
      console.error('Error updating alert:', error)
    } finally {
      setUpdating(null)
    }
  }

  const getAlertIcon = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      case 'WARNING':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      default:
        return <AlertTriangle className="w-5 h-5 text-blue-500" />
    }
  }

  const getAlertBadgeColor = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'WARNING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center space-x-4">
        <Filter className="w-4 h-4 text-gray-500" />
        <Select 
          value={filter.level || 'all'} 
          onValueChange={(value) => setFilter(prev => ({ 
            ...prev, 
            level: value === 'all' ? undefined : value 
          }))}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="CRITICAL">Critical</SelectItem>
            <SelectItem value="WARNING">Warning</SelectItem>
            <SelectItem value="INFO">Info</SelectItem>
          </SelectContent>
        </Select>

        <Select 
          value={filter.status || 'all'} 
          onValueChange={(value) => setFilter(prev => ({ 
            ...prev, 
            status: value === 'all' ? undefined : value 
          }))}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="UNREAD">Unread</SelectItem>
            <SelectItem value="READ">Read</SelectItem>
            <SelectItem value="ARCHIVED">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
            <p>No alerts found for the current filters</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <Card 
              key={alert.id} 
              className={cn(
                "transition-all duration-200",
                alert.status === 'UNREAD' && "ring-2 ring-blue-200 bg-blue-50/50",
                alert.level === 'CRITICAL' && "border-red-200"
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    {getAlertIcon(alert.level)}
                    <div>
                      <CardTitle className="text-base">{alert.title}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge 
                          variant="outline" 
                          className={getAlertBadgeColor(alert.level)}
                        >
                          {alert.level}
                        </Badge>
                        <Badge variant="outline">
                          {alert.status}
                        </Badge>
                        <span className="text-xs text-gray-500 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(alert.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {alert.status === 'UNREAD' && (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateAlertStatus(alert.id, 'READ')}
                        disabled={updating === alert.id}
                      >
                        Mark Read
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateAlertStatus(alert.id, 'ARCHIVED')}
                        disabled={updating === alert.id}
                      >
                        Archive
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-gray-700 mb-3">{alert.message}</p>
                
                {alert.details && (
                  <details className="text-sm">
                    <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                      View Details
                    </summary>
                    <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-auto">
                      {JSON.stringify(alert.details, null, 2)}
                    </pre>
                  </details>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}