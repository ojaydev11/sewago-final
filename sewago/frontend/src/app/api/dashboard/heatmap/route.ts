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
    
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    // Get booking data aggregated by city and service category
    const bookingData = await prisma.booking.findMany({
      where: {
        createdAt: { gte: startDate },
      },
      include: {
        service: {
          select: {
            city: true,
            category: true,
          },
        },
      },
    })

    // Aggregate data by city
    const cityStats = new Map()
    
    bookingData.forEach(booking => {
      const city = booking.service.city
      const category = booking.service.category
      
      if (!cityStats.has(city)) {
        cityStats.set(city, {
          city,
          totalBookings: 0,
          categories: new Map(),
          coordinates: getCityCoordinates(city), // You'll need to implement this
        })
      }
      
      const cityData = cityStats.get(city)
      cityData.totalBookings++
      
      if (!cityData.categories.has(category)) {
        cityData.categories.set(category, 0)
      }
      cityData.categories.set(category, cityData.categories.get(category) + 1)
    })

    // Convert to array and add intensity scoring
    const heatmapData = Array.from(cityStats.values()).map(city => ({
      ...city,
      categories: Object.fromEntries(city.categories),
      intensity: calculateIntensity(city.totalBookings),
    }))

    return NextResponse.json({
      heatmapData,
      summary: {
        totalCities: heatmapData.length,
        totalBookings: bookingData.length,
        timeframe: `${days} days`,
        generatedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Error generating heatmap data:', error)
    return NextResponse.json(
      { error: 'Failed to generate heatmap data' },
      { status: 500 }
    )
  }
}

function getCityCoordinates(city: string): { lat: number; lng: number } {
  // This should be replaced with actual city coordinates
  // You could store these in your database or use a geocoding service
  const coordinates: Record<string, { lat: number; lng: number }> = {
    'Kathmandu': { lat: 27.7172, lng: 85.3240 },
    'Pokhara': { lat: 28.2096, lng: 83.9856 },
    'Lalitpur': { lat: 27.6588, lng: 85.3247 },
    'Bhaktapur': { lat: 27.6710, lng: 85.4298 },
    'Chitwan': { lat: 27.5292, lng: 84.3542 },
  }
  
  return coordinates[city] || { lat: 27.7172, lng: 85.3240 } // Default to Kathmandu
}

function calculateIntensity(bookingCount: number): 'low' | 'medium' | 'high' | 'very-high' {
  if (bookingCount < 10) return 'low'
  if (bookingCount < 50) return 'medium'
  if (bookingCount < 100) return 'high'
  return 'very-high'
}

function isAuthorizedCEO(user: any): boolean {
  return user.email === 'ceo@sewago.com' || 
         user.role === 'admin' || 
         user.email?.endsWith('@sewago.com')
}