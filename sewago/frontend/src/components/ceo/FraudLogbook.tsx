'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Shield, AlertTriangle } from 'lucide-react'

export function FraudLogbook() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-gray-600" />
          <span className="font-medium">Security Monitoring</span>
        </div>
        <Badge variant="outline">2 Pending Review</Badge>
      </div>

      <div className="space-y-3">
        {[
          { 
            type: 'PHONE_ABUSE', 
            description: 'Phone number used across 4 accounts', 
            severity: 'warning',
            status: 'PENDING_REVIEW',
            user: 'user***@gmail.com'
          },
          { 
            type: 'FAKE_LOCATION', 
            description: 'Provider traveling at 150 km/h', 
            severity: 'critical',
            status: 'PENDING_REVIEW',
            user: 'Provider #P123'
          },
          { 
            type: 'EXCESSIVE_BOOKINGS', 
            description: '15 bookings in 2 hours', 
            severity: 'warning',
            status: 'INVESTIGATED',
            user: 'user***@yahoo.com'
          },
        ].map((flag, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className={`w-5 h-5 ${
                    flag.severity === 'critical' ? 'text-red-500' : 'text-yellow-500'
                  }`} />
                  <div>
                    <div className="font-medium">{flag.type.replace('_', ' ')}</div>
                    <div className="text-sm text-gray-600">{flag.description}</div>
                    <div className="text-xs text-gray-500 mt-1">{flag.user}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={flag.status === 'PENDING_REVIEW' ? 'destructive' : 'secondary'}>
                    {flag.status.replace('_', ' ')}
                  </Badge>
                  {flag.status === 'PENDING_REVIEW' && (
                    <Button size="sm" variant="outline">
                      Investigate
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}