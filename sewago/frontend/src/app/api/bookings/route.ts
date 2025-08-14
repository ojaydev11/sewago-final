import { NextResponse } from 'next/server'
import { bookingSchema } from '@/lib/validators'
import { rateLimit } from '@/lib/rate-limit'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const headersList = await headers()
  const ip = (headersList.get('x-forwarded-for') || '').split(',')[0] || 'local'
  
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }
  
  try {
    const body = await req.json()
    const parsed = bookingSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }
    
    // TODO: replace with real session user
    const userId = (headersList.get('cookie') || '').includes('sg_session') ? 'mock-user' : 'guest'
    
    if (userId === 'guest') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const booking = await prisma.booking.create({
      data: {
        userId,
        serviceId: parsed.data.serviceId,
        time: new Date(parsed.data.time),
        address: parsed.data.address,
        notes: parsed.data.notes,
        total: parsed.data.total
      }
    })
    
    return NextResponse.json({ ok: true, booking }, { status: 201 })
  } catch (error) {
    console.error('Booking creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
