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
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = {}
    
    if (type) where.type = type
    if (status) where.status = status

    const [securityFlags, flagCounts] = await Promise.all([
      prisma.securityFlag.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
          // Include user data if userId exists
          ...(where.userId && {
            user: {
              select: {
                id: true,
                email: true,
                phone: true,
                createdAt: true,
              },
            },
          }),
        },
      }),
      // Get counts by type and status
      prisma.securityFlag.groupBy({
        by: ['type', 'status'],
        _count: true,
      }),
    ])

    // Aggregate counts for summary
    const summary = {
      total: securityFlags.length,
      byType: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
    }

    flagCounts.forEach(item => {
      summary.byType[item.type] = (summary.byType[item.type] || 0) + item._count
      summary.byStatus[item.status] = (summary.byStatus[item.status] || 0) + item._count
    })

    return NextResponse.json({
      securityFlags,
      summary,
    })
  } catch (error) {
    console.error('Error fetching security flags:', error)
    return NextResponse.json(
      { error: 'Failed to fetch security flags' },
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
    const { flagId, action, notes } = body

    let newStatus: string
    
    switch (action) {
      case 'investigate':
        newStatus = 'INVESTIGATED'
        break
      case 'dismiss':
        newStatus = 'DISMISSED'
        break
      case 'escalate':
        newStatus = 'ESCALATED'
        break
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const updatedFlag = await prisma.securityFlag.update({
      where: { id: flagId },
      data: { 
        status: newStatus,
        // Add investigation notes to details
        details: {
          ...await prisma.securityFlag.findUnique({ where: { id: flagId } }).then(f => f?.details || {}),
          investigationNotes: notes,
          investigatedBy: session.user.email,
          investigatedAt: new Date().toISOString(),
        },
      },
    })

    // Log the action
    await prisma.automatedActionLog.create({
      data: {
        module: 'CEO_Security_Action',
        trigger: 'Manual security flag review',
        actionTaken: `Security flag ${flagId} marked as ${newStatus}`,
        details: {
          flagId,
          action,
          notes,
          adminUser: session.user.email,
        },
        success: true,
      },
    })

    return NextResponse.json({ flag: updatedFlag })
  } catch (error) {
    console.error('Error updating security flag:', error)
    return NextResponse.json(
      { error: 'Failed to update security flag' },
      { status: 500 }
    )
  }
}

function isAuthorizedCEO(user: any): boolean {
  return user.email === 'ceo@sewago.com' || 
         user.role === 'admin' || 
         user.email?.endsWith('@sewago.com')
}