import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { bookingId } = await req.json()
    
    // Fake success path: mark as paid
    await prisma.booking.update({
      where: { id: bookingId },
      data: { paid: true, status: 'confirmed' }
    })
    
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Khalti payment error:', error)
    return NextResponse.json({ error: 'Payment failed' }, { status: 500 })
  }
}
