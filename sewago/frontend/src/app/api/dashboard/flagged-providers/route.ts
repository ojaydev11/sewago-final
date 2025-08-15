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
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Get providers with warnings or paused status
    const problematicProviders = await prisma.provider.findMany({
      where: {
        OR: [
          { status: status || 'PAUSED' },
          { 
            warnings: {
              some: {},
            },
          },
        ],
      },
      include: {
        warnings: {
          orderBy: { issuedAt: 'desc' },
        },
        bookings: {
          where: {
            createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          },
        },
      },
      take: limit,
      orderBy: { updatedAt: 'desc' },
    })

    // Calculate additional metrics for each provider
    const enrichedProviders = problematicProviders.map(provider => {
      const recentBookings = provider.bookings
      const completedBookings = recentBookings.filter(b => b.status === 'COMPLETED')
      const completionRate = recentBookings.length > 0 
        ? (completedBookings.length / recentBookings.length) * 100 
        : 0

      return {
        ...provider,
        metrics: {
          recentBookings: recentBookings.length,
          completionRate: Math.round(completionRate),
          warningCount: provider.warnings.length,
          lastWarning: provider.warnings[0]?.issuedAt,
        },
      }
    })

    return NextResponse.json({
      providers: enrichedProviders,
      summary: {
        total: enrichedProviders.length,
        paused: enrichedProviders.filter(p => p.status === 'PAUSED').length,
        withWarnings: enrichedProviders.filter(p => p.warnings.length > 0).length,
      },
    })
  } catch (error) {
    console.error('Error fetching flagged providers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch flagged providers' },
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
    const { providerId, action, reason } = body

    let updateData: any = {}
    
    switch (action) {
      case 'reinstate':
        updateData = { status: 'ACTIVE' }
        break
      case 'pause':
        updateData = { status: 'PAUSED' }
        break
      case 'ban':
        updateData = { status: 'BANNED' }
        break
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const updatedProvider = await prisma.provider.update({
      where: { id: providerId },
      data: updateData,
    })

    // Log the action
    await prisma.automatedActionLog.create({
      data: {
        module: 'CEO_Manual_Action',
        trigger: 'Manual provider status change',
        actionTaken: `Provider ${providerId} status changed to ${updateData.status}`,
        details: {
          providerId,
          action,
          reason,
          adminUser: session.user.email,
        },
        success: true,
      },
    })

    return NextResponse.json({ provider: updatedProvider })
  } catch (error) {
    console.error('Error updating provider:', error)
    return NextResponse.json(
      { error: 'Failed to update provider' },
      { status: 500 }
    )
  }
}

function isAuthorizedCEO(user: any): boolean {
  return user.email === 'ceo@sewago.com' || 
         user.role === 'admin' || 
         user.email?.endsWith('@sewago.com')
}