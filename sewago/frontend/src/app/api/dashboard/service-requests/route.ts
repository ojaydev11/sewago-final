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
    const days = parseInt(searchParams.get('days') || '30')
    const city = searchParams.get('city')
    const minRequests = parseInt(searchParams.get('minRequests') || '3')
    
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const where: any = {
      lastSearchedAt: { gte: startDate },
      count: { gte: minRequests },
    }
    
    if (city) {
      where.city = city
    }

    const serviceRequests = await prisma.serviceRequestLog.findMany({
      where,
      orderBy: [
        { count: 'desc' },
        { lastSearchedAt: 'desc' },
      ],
    })

    // Group by city for better organization
    const opportunitiesByCity = new Map()
    
    serviceRequests.forEach(request => {
      if (!opportunitiesByCity.has(request.city)) {
        opportunitiesByCity.set(request.city, {
          city: request.city,
          opportunities: [],
          totalRequests: 0,
        })
      }
      
      const cityData = opportunitiesByCity.get(request.city)
      cityData.opportunities.push({
        searchTerm: request.searchTerm,
        requestCount: request.count,
        lastSearched: request.lastSearchedAt,
        potentialRevenue: estimatePotentialRevenue(request.count),
      })
      cityData.totalRequests += request.count
    })

    // Convert to array and sort by opportunity potential
    const cityOpportunities = Array.from(opportunitiesByCity.values())
      .map(city => ({
        ...city,
        opportunities: city.opportunities.slice(0, 10), // Top 10 per city
        score: calculateOpportunityScore(city),
      }))
      .sort((a, b) => b.score - a.score)

    // Get overall statistics
    const totalRequests = serviceRequests.reduce((sum, req) => sum + req.count, 0)
    const uniqueServices = new Set(serviceRequests.map(req => req.searchTerm)).size
    const uniqueCities = opportunitiesByCity.size

    return NextResponse.json({
      opportunities: cityOpportunities,
      summary: {
        totalRequests,
        uniqueServices,
        uniqueCities,
        timeframe: `${days} days`,
        generatedAt: new Date().toISOString(),
      },
      insights: generateOpportunityInsights(cityOpportunities),
    })
  } catch (error) {
    console.error('Error fetching service opportunities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch service opportunities' },
      { status: 500 }
    )
  }
}

function estimatePotentialRevenue(requestCount: number): number {
  // Assume 20% conversion rate and average booking value of Rs. 500
  const conversionRate = 0.2
  const avgBookingValue = 500
  return Math.round(requestCount * conversionRate * avgBookingValue)
}

function calculateOpportunityScore(cityData: any): number {
  // Score based on total requests and diversity of services
  const requestScore = cityData.totalRequests * 0.7
  const diversityScore = cityData.opportunities.length * 0.3
  return Math.round(requestScore + diversityScore)
}

function generateOpportunityInsights(opportunities: any[]): string[] {
  const insights = []
  
  if (opportunities.length === 0) {
    insights.push('No significant service opportunities detected in the current timeframe')
    return insights
  }

  const topCity = opportunities[0]
  insights.push(`${topCity.city} shows the highest opportunity potential with ${topCity.totalRequests} total requests`)
  
  // Find most requested service across all cities
  const allOpportunities = opportunities.flatMap(city => city.opportunities)
  const topService = allOpportunities.reduce((max, curr) => 
    curr.requestCount > max.requestCount ? curr : max
  )
  
  insights.push(`"${topService.searchTerm}" is the most requested unavailable service with ${topService.requestCount} searches`)
  
  // Revenue potential
  const totalPotentialRevenue = allOpportunities.reduce((sum, opp) => sum + opp.potentialRevenue, 0)
  insights.push(`Total estimated revenue potential: Rs. ${totalPotentialRevenue.toLocaleString()}`)
  
  return insights
}

function isAuthorizedCEO(user: any): boolean {
  return user.email === 'ceo@sewago.com' || 
         user.role === 'admin' || 
         user.email?.endsWith('@sewago.com')
}