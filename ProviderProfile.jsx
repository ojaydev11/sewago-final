import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const ProviderProfile = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Provider Profile Page</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This page will show detailed provider information, reviews, and booking options.</p>
          <p className="mt-2 text-sm text-gray-600">Coming soon in the next development phase...</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default ProviderProfile

