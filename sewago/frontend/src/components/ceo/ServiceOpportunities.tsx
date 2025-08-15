'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Search } from 'lucide-react'

export function ServiceOpportunities() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-gray-600" />
          <span className="font-medium">Market Opportunities</span>
        </div>
        <Badge variant="outline">5 New Opportunities</Badge>
      </div>

      <div className="space-y-3">
        {[
          { 
            service: 'Car Washing', 
            city: 'Kathmandu', 
            searches: 45, 
            potential: 22500,
            priority: 'high'
          },
          { 
            service: 'Pet Grooming', 
            city: 'Pokhara', 
            searches: 23, 
            potential: 11500,
            priority: 'medium'
          },
          { 
            service: 'Interior Design', 
            city: 'Lalitpur', 
            searches: 18, 
            potential: 45000,
            priority: 'high'
          },
          { 
            service: 'Laundry Service', 
            city: 'Kathmandu', 
            searches: 34, 
            potential: 17000,
            priority: 'medium'
          },
        ].map((opportunity, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Search className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="font-medium">{opportunity.service}</div>
                    <div className="text-sm text-gray-600">{opportunity.city}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {opportunity.searches} searches • Rs. {opportunity.potential.toLocaleString()} potential
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={opportunity.priority === 'high' ? 'destructive' : 'secondary'}>
                    {opportunity.priority} priority
                  </Badge>
                  <Button size="sm" variant="outline">
                    Explore
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