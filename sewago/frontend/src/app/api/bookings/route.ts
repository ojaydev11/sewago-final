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

function rateLimit(ip: string, windowMs = 300000, limit = 60) {
  const now = Date.now()
  // @ts-ignore
  global.__hits = global.__hits || new Map()
  // @ts-ignore
  const hits: Map<string, { count: number; ts: number }> = global.__hits
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
  const headersList = await headers()
  const ip = (headersList.get('x-forwarded-for') || '').split(',')[0] || 'local'
  
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }
  
  const json = await req.json()
  const parsed = BookingSchema.safeParse(json)
  
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  
  // TODO: replace with real session user id once auth is wired
  const isAuthed = (headersList.get('cookie') || '').includes('sg_session')
  
  if (!isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const data = parsed.data
  const booking = await prisma.booking.create({
    data: {
      userId: 'mock-user',
      serviceId: data.serviceId,
      time: new Date(data.time),
      address: data.address,
      notes: data.notes,
      total: data.total
    }
  })
  
  return NextResponse.json({ ok: true, booking }, { status: 201 })
}
