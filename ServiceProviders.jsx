import React, { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { API_BASE_URL } from '../config/api'

const ServiceProviders = () => {
  const [providers, setProviders] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [searchParams] = useSearchParams()
  const categoryFilter = searchParams.get('category')

  useEffect(() => {
    fetchProviders()
  }, [categoryFilter])

  const fetchProviders = async () => {
    try {
      let url = `${API_BASE_URL}/api/services/providers`
      if (categoryFilter) {
        url += `?category=${categoryFilter}`
      }
      
      const response = await fetch(url, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        // API returns array directly, parse skills JSON strings
        const processedProviders = (Array.isArray(data) ? data : data.providers || []).map(provider => ({
          ...provider,
          skills: typeof provider.skills === 'string' ? JSON.parse(provider.skills) : provider.skills
        }))
        setProviders(processedProviders)
      }
    } catch (error) {
      console.error('Failed to fetch providers:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProviders = providers.filter(provider =>
    provider.user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
    provider.user.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0
    
    for (let i = 0; i < fullStars; i++) {
      stars.push('⭐')
    }
    if (hasHalfStar) {
      stars.push('⭐')
    }
    return stars.join('')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg">Loading service providers...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {categoryFilter ? `${categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1)} Providers` : 'Service Providers'}
        </h1>
        <p className="text-lg text-gray-600 mb-6">Find trusted professionals in your area</p>
        
        <div className="max-w-md mx-auto">
          <Input
            type="text"
            placeholder="Search providers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProviders.map((provider) => (
          <Card key={provider.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{provider.user.full_name}</CardTitle>
                {provider.is_verified && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    ✓ Verified
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-yellow-500">{renderStars(provider.rating)}</span>
                <span className="text-sm text-gray-600">
                  {provider.rating} ({provider.total_reviews} reviews)
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Skills:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {provider.skills.map((skill, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Rate:</p>
                  <p className="text-lg font-bold text-green-600">NPR {provider.hourly_rate}/hour</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Experience:</p>
                  <p className="text-sm text-gray-600">{provider.experience_years} years</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Location:</p>
                  <p className="text-sm text-gray-600">{provider.user.location}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">About:</p>
                  <p className="text-sm text-gray-600 line-clamp-2">{provider.description}</p>
                </div>
                
                <div className="pt-2">
                  <Link to={`/provider/${provider.id}`}>
                    <Button className="w-full">
                      View Profile & Book
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProviders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No service providers found matching your criteria.</p>
          <Link to="/services" className="mt-4 inline-block">
            <Button variant="outline">Browse All Services</Button>
          </Link>
        </div>
      )}
    </div>
  )
}

export default ServiceProviders

