import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const BookingSchema = z.object({ 
  serviceId: z.string().min(1), 
  time: z.string().min(10), 
  address: z.string().min(5), 
  notes: z.string().optional(), 
  total: z.coerce.number().int().min(0).default(0) 
})

// Extend global type to include our hits map
declare global {
  var __hits: Map<string, { count: number; ts: number }> | undefined
}

function rateLimit(ip: string, windowMs = 300000, limit = 60) {
  const now = Date.now()
  
  if (!global.__hits) {
    global.__hits = new Map()
  }
  
  const hits = global.__hits
  const rec = hits.get(ip) ?? { count: 0, ts: now }
  
  if (now - rec.ts > windowMs) {
    rec.count = 0
    rec.ts = now
  }
  
  rec.count++
  hits.set(ip, rec)
  
  return rec.count <= limit
}

export async function POST(req: Request) {
  try {
    const headersList = await headers()
    const ip = (headersList.get('x-forwarded-for') || '').split(',')[0] || 'local'
    
    if (!rateLimit(ip)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }
    
    const cookie = headersList.get('cookie') || ''
    const isAuthed = cookie.includes('sg_session=')
    
    if (!isAuthed) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await req.json()
    const parsed = BookingSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }
    
    const b = await prisma.booking.create({ 
      data: { 
        userId: 'mock-user', 
        serviceId: parsed.data.serviceId, 
        time: new Date(parsed.data.time), 
        address: parsed.data.address, 
        notes: parsed.data.notes, 
        total: parsed.data.total 
      } 
    })
    
    return NextResponse.json({ ok: true, booking: b }, { status: 201 })
  } catch (e: any) {
    console.error('BOOKING_CREATE_FAIL', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
