'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, TrendingUp, TrendingDown } from 'lucide-react'

export function WeeklyReportsArchive() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-gray-600" />
          <span className="font-medium">Weekly Reports</span>
        </div>
        <Badge variant="outline">8 Reports Available</Badge>
      </div>

      <div className="space-y-3">
        {[
          { 
            week: 'Week ending Dec 24, 2024', 
            bookings: 245, 
            revenue: 125000, 
            trend: 'up',
            health: 85 
          },
          { 
            week: 'Week ending Dec 17, 2024', 
            bookings: 198, 
            revenue: 98000, 
            trend: 'up',
            health: 78 
          },
          { 
            week: 'Week ending Dec 10, 2024', 
            bookings: 156, 
            revenue: 87000, 
            trend: 'down',
            health: 72 
          },
        ].map((report, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{report.week}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {report.bookings} bookings • Rs. {report.revenue.toLocaleString()} revenue
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      Health: {report.health}%
                    </Badge>
                    <div className={`flex items-center space-x-1 text-xs ${
                      report.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {report.trend === 'up' ? 
                        <TrendingUp className="w-3 h-3" /> : 
                        <TrendingDown className="w-3 h-3" />
                      }
                      <span>{report.trend === 'up' ? '+' : '-'}12%</span>
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  View Report
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}