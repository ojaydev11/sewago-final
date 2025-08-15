'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { MapPin } from 'lucide-react'

export function DemandHeatmap() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Demand Heatmap</h3>
          <p className="text-gray-600 mb-4">Interactive map showing service demand intensity by location</p>
          <p className="text-sm text-gray-500">Component ready for map integration (Google Maps, Mapbox, etc.)</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-gray-600">High Demand Areas</div>
            <div className="text-2xl font-bold text-red-600 mt-1">Kathmandu</div>
            <div className="text-xs text-gray-500">150+ bookings/week</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-gray-600">Medium Demand</div>
            <div className="text-2xl font-bold text-yellow-600 mt-1">Pokhara</div>
            <div className="text-xs text-gray-500">80+ bookings/week</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-gray-600">Emerging Markets</div>
            <div className="text-2xl font-bold text-green-600 mt-1">Chitwan</div>
            <div className="text-xs text-gray-500">25+ bookings/week</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}