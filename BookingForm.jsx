import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const BookingForm = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Booking Form Page</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This page will allow customers to book services with date/time selection and job description.</p>
          <p className="mt-2 text-sm text-gray-600">Coming soon in the next development phase...</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default BookingForm

