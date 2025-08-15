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
    const limit = parseInt(searchParams.get('limit') || '20')
    const reportId = searchParams.get('reportId')

    // If specific report requested
    if (reportId) {
      const report = await prisma.weeklyReport.findUnique({
        where: { id: reportId },
      })
      
      if (!report) {
        return NextResponse.json({ error: 'Report not found' }, { status: 404 })
      }
      
      return NextResponse.json({ report })
    }

    // Get all reports
    const reports = await prisma.weeklyReport.findMany({
      orderBy: { weekEnding: 'desc' },
      take: limit,
      select: {
        id: true,
        weekEnding: true,
        createdAt: true,
        summaryData: true,
      },
    })

    // Extract key metrics for list view
    const reportsWithSummary = reports.map(report => {
      const data = report.summaryData as any
      return {
        id: report.id,
        weekEnding: report.weekEnding,
        createdAt: report.createdAt,
        keyMetrics: {
          totalBookings: data.bookings?.total || 0,
          totalRevenue: data.revenue?.total || 0,
          newUsers: data.users?.newSignups || 0,
          newProviders: data.providers?.newSignups || 0,
          overallHealth: data.trends?.overallHealth || 0,
        },
        trends: {
          bookings: data.trends?.bookings || 0,
          users: data.trends?.users || 0,
          revenue: data.trends?.revenue || 0,
        },
        alerts: {
          critical: data.alerts?.critical || 0,
          warnings: data.alerts?.warnings || 0,
          total: (data.alerts?.critical || 0) + (data.alerts?.warnings || 0) + (data.alerts?.info || 0),
        },
      }
    })

    return NextResponse.json({
      reports: reportsWithSummary,
      summary: {
        total: reports.length,
        latestWeek: reports[0]?.weekEnding,
      },
    })
  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    )
  }
}

function isAuthorizedCEO(user: any): boolean {
  return user.email === 'ceo@sewago.com' || 
         user.role === 'admin' || 
         user.email?.endsWith('@sewago.com')
}