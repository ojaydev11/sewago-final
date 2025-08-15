import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/providers/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || !isAuthorizedCEO(session.user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const level = searchParams.get('level')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {}
    
    if (level) {
      where.level = level
    }
    
    if (status) {
      where.status = status
    }

    const [alerts, total] = await Promise.all([
      prisma.systemAlert.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.systemAlert.count({ where }),
    ])

    return NextResponse.json({
      alerts,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || !isAuthorizedCEO(session.user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { alertId, status, resolvedAt } = body

    const updatedAlert = await prisma.systemAlert.update({
      where: { id: alertId },
      data: {
        status,
        resolvedAt: status === 'ARCHIVED' ? new Date() : resolvedAt,
      },
    })

    return NextResponse.json({ alert: updatedAlert })
  } catch (error) {
    console.error('Error updating alert:', error)
    return NextResponse.json(
      { error: 'Failed to update alert' },
      { status: 500 }
    )
  }
}

function isAuthorizedCEO(user: any): boolean {
  return user.email === 'ceo@sewago.com' || 
         user.role === 'admin' || 
         user.email?.endsWith('@sewago.com')
}