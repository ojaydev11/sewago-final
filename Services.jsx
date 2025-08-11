import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { API_BASE_URL } from '../config/api'

const Services = () => {
  const [categories, setCategories] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/services/categories`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        // API returns array directly, not wrapped in categories property
        setCategories(Array.isArray(data) ? data : data.categories || [])
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getIconForCategory = (iconName) => {
    const iconMap = {
      'wrench': '🔧',
      'zap': '⚡',
      'sparkles': '✨',
      'book': '📚',
      'settings': '⚙️',
      'hammer': '🔨'
    }
    return iconMap[iconName] || '🛠️'
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg">Loading services...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Our Services</h1>
        <p className="text-lg text-gray-600 mb-6">Browse all available service categories</p>
        
        <div className="max-w-md mx-auto">
          <Input
            type="text"
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => (
          <Card key={category.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <div className="text-4xl mb-2">{getIconForCategory(category.icon)}</div>
              <CardTitle className="text-xl">{category.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-4">{category.description}</p>
              <Link to={`/providers?category=${category.name.toLowerCase()}`}>
                <Button className="w-full">
                  Find {category.name}s
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No services found matching your search.</p>
        </div>
      )}
    </div>
  )
}

export default Services

