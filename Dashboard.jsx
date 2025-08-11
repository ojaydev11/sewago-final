import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const Dashboard = () => {
  const { user, isCustomer, isServiceProvider } = useAuth()

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome, {user?.full_name}!
        </h1>
        <p className="text-lg text-gray-600">
          {isCustomer ? 'Manage your bookings and find services' : 'Manage your services and bookings'}
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>
            {isCustomer ? 'Customer Dashboard' : 'Service Provider Dashboard'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            This dashboard will show {isCustomer ? 'your bookings, favorite providers, and booking history' : 'your profile, incoming bookings, earnings, and reviews'}.
          </p>
          <p className="mt-2 text-sm text-gray-600">Coming soon in the next development phase...</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard

