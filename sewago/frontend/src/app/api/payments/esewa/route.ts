import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const { bookingId } = await req.json()
  
  await prisma.booking.update({
    where: { id: bookingId },
    data: { paid: true, status: 'confirmed' }
  })
  
  return NextResponse.json({ ok: true })
}
