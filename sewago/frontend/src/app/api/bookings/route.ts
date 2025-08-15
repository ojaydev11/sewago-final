import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { pricing as pricingConfig } from '@/config/pricing'
import { generateBookingId } from '@/lib/utils'
import { z } from 'zod'
import { prisma as prismaClient } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
const MOCK_MODE = (process.env.MOCK_MODE ?? 'true') === 'true'

// Backward-compatible schema (legacy + new payload)
const BookingSchema = z.union([
  z.object({ 
    serviceId: z.string().min(1), 
    time: z.string().min(10), 
    address: z.string().min(5), 
    notes: z.string().optional(), 
    total: z.coerce.number().int().min(0).default(0) 
  }),
  z.object({
    serviceSlug: z.string().min(1),
    serviceName: z.string().min(1),
    customerName: z.string().min(1),
    phone: z.string().min(5),
    address: z.string().min(5),
    area: z.string().min(2),
    preferredTime: z.string().min(1),
    notes: z.string().optional(),
    isExpress: z.boolean().default(false),
    hasWarranty: z.boolean().default(false),
    totalPrice: z.coerce.number().int().min(0),
    priceBreakdown: z.any()
  })
])

// Extend global type to include our hits map
declare global {
  var __hits: Map<string, { count: number; ts: number }> | undefined
  var __idem_bookings: Map<string, any> | undefined
  var __mock_bookings: Map<string, any> | undefined
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
    const idemKey = headersList.get('idempotency-key') || headersList.get('Idempotency-Key') || ''
    
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
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400, headers: { 'Cache-Control': 'no-store' } })
    }
    
    // Handle idempotency
    if (idemKey) {
      if (!global.__idem_bookings) global.__idem_bookings = new Map()
      const prev = global.__idem_bookings.get(idemKey)
      if (prev) {
        return NextResponse.json({ ok: true, booking: prev }, { status: 200, headers: { 'Cache-Control': 'no-store' } })
      }
    }

    // Handle both legacy and new payloads and do server-side authoritative pricing
    let booking
    if (MOCK_MODE) {
      // In-memory mock booking creation
      if (!global.__mock_bookings) global.__mock_bookings = new Map()
      const id = generateBookingId()
      const now = new Date().toISOString()
      if ('serviceId' in parsed.data) {
        booking = {
          id,
          status: 'CREATED',
          userId: 'mock-user',
          serviceId: parsed.data.serviceId,
          address: parsed.data.address,
          notes: parsed.data.notes,
          total: parsed.data.total,
          scheduledAt: new Date(parsed.data.time).toISOString(),
          createdAt: now
        }
      } else {
        const basePrice = parsed.data.totalPrice // fallback; UI shows base
        const extraBlocks = parsed.data.priceBreakdown?.extraBlocks ?? 0
        const extra15 = (pricingConfig.services as any)?.[parsed.data.serviceSlug]?.extra15 ?? 150
        const extras = extraBlocks * extra15
        const expressSurcharge = parsed.data.isExpress ? pricingConfig.expressAddon.price : 0
        const warrantyFee = parsed.data.hasWarranty ? (pricingConfig.warrantyAddon?.price ?? Math.round(basePrice * 0.15)) : 0
        const bookingFee = pricingConfig.bookingFee
        const total = Math.round(basePrice + extras + expressSurcharge + warrantyFee + bookingFee)
        booking = {
          id,
          status: 'CREATED',
          userId: 'mock-user',
          serviceSlug: parsed.data.serviceSlug,
          address: parsed.data.address,
          notes: parsed.data.notes,
          total,
          scheduledAt: now,
          createdAt: now
        }
      }
      global.__mock_bookings.set(id, booking)
    } else {
      if ('serviceId' in parsed.data) {
        booking = await prisma.booking.create({ 
          data: { 
            userId: 'mock-user', 
            serviceId: parsed.data.serviceId, 
            scheduledAt: new Date(parsed.data.time), 
            address: parsed.data.address, 
            notes: parsed.data.notes, 
            total: parsed.data.total, 
            status: 'CREATED'
          } 
        })
      } else {
        // Ensure service exists by slug
        const service = await prisma.service.upsert({
          where: { slug: parsed.data.serviceSlug },
          update: { name: parsed.data.serviceName },
          create: {
            slug: parsed.data.serviceSlug,
            name: parsed.data.serviceName,
            description: parsed.data.serviceName,
            basePrice: parsed.data.totalPrice,
            city: 'Kathmandu',
            category: 'general'
          }
        })
        // authoritative server pricing
        const basePrice = service.basePrice
        const extraBlocks = parsed.data.priceBreakdown?.extraBlocks ?? 0
        const extra15 = (pricingConfig.services as any)?.[parsed.data.serviceSlug]?.extra15 ?? 150
        const extras = extraBlocks * extra15
        const expressSurcharge = parsed.data.isExpress ? pricingConfig.expressAddon.price : 0
        const warrantyFee = parsed.data.hasWarranty ? (pricingConfig.warrantyAddon?.price ?? Math.round(basePrice * 0.15)) : 0
        const bookingFee = pricingConfig.bookingFee
        const total = Math.round(basePrice + extras + expressSurcharge + warrantyFee + bookingFee)

        booking = await prisma.booking.create({
          data: {
            userId: 'mock-user',
            serviceId: service.id,
            address: parsed.data.address,
            notes: parsed.data.notes,
            total,
            status: 'CREATED',
            scheduledAt: new Date(),
          }
        })
      }
    }
    if (idemKey) {
      global.__idem_bookings!.set(idemKey, booking)
    }
    return NextResponse.json({ ok: true, booking }, { status: 201, headers: { 'Cache-Control': 'no-store' } })
  } catch (e: any) {
    console.error('BOOKING_CREATE_FAIL', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500, headers: { 'Cache-Control': 'no-store' } })
  }
}

export async function GET() {
  return new NextResponse('Method Not Allowed', { status: 405, headers: { Allow: 'POST', 'Cache-Control': 'no-store' } })
}
