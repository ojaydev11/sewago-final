import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const userId = 'mock-user' // TODO: replace with real session user id
  
  const bookings = await prisma.booking.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  })
  
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-sg-text mb-6">Your bookings</h1>
      
      <div className="space-y-3">
        {bookings.length === 0 && (
          <div className="text-sg-text/70">No bookings yet.</div>
        )}
        
        {bookings.map(booking => (
          <div key={booking.id} className="bg-white shadow-card rounded-2xl p-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-semibold">Service: {booking.serviceId}</div>
              <div className="text-sm text-sg-text/70">
                When: {new Date(booking.time).toLocaleString()}
              </div>
              <div className="text-sm text-sg-text/70">
                Address: {booking.address}
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm">
                Status: <span className="font-medium">{booking.status}</span>
              </div>
              <div className="text-sm">
                Paid: {booking.paid ? 'Yes' : 'No'}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
