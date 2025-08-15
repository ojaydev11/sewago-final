'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, AlertTriangle } from 'lucide-react'

export function ProblematicProviders() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-gray-600" />
          <span className="font-medium">Provider Issues</span>
        </div>
        <Badge variant="outline">3 Requires Attention</Badge>
      </div>

      <div className="space-y-3">
        {[
          { name: 'Provider ABC', issue: 'Multiple low ratings', status: 'PAUSED', severity: 'high' },
          { name: 'Provider XYZ', issue: 'Fake location detected', status: 'PAUSED', severity: 'critical' },
          { name: 'Provider DEF', issue: 'No activity 30+ days', status: 'ACTIVE', severity: 'medium' },
        ].map((provider, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className={`w-5 h-5 ${
                    provider.severity === 'critical' ? 'text-red-500' :
                    provider.severity === 'high' ? 'text-orange-500' : 'text-yellow-500'
                  }`} />
                  <div>
                    <div className="font-medium">{provider.name}</div>
                    <div className="text-sm text-gray-600">{provider.issue}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={provider.status === 'PAUSED' ? 'destructive' : 'secondary'}>
                    {provider.status}
                  </Badge>
                  <Button size="sm" variant="outline">
                    Review
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}