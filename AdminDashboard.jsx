import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { API_BASE_URL } from '../config/api'

const AdminDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProviders: 0,
    totalBookings: 0,
    totalCategories: 0
  })
  const [users, setUsers] = useState([])
  const [providers, setProviders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const statsResponse = await fetch(`${API_BASE_URL}/api/admin/stats`, {
        credentials: 'include'
      })
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      // Fetch users
      const usersResponse = await fetch(`${API_BASE_URL}/api/admin/users`, {
        credentials: 'include'
      })
      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setUsers(Array.isArray(usersData) ? usersData : [])
      }

      // Fetch providers
      const providersResponse = await fetch(`${API_BASE_URL}/api/services/providers`, {
        credentials: 'include'
      })
      if (providersResponse.ok) {
        const providersData = await providersResponse.json()
        const processedProviders = (Array.isArray(providersData) ? providersData : []).map(provider => ({
          ...provider,
          skills: typeof provider.skills === 'string' ? JSON.parse(provider.skills) : provider.skills
        }))
        setProviders(processedProviders)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/toggle-status`, {
        method: 'POST',
        credentials: 'include'
      })
      if (response.ok) {
        fetchDashboardData() // Refresh data
      }
    } catch (error) {
      console.error('Failed to toggle user status:', error)
    }
  }

  const toggleProviderVerification = async (providerId, currentStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/providers/${providerId}/toggle-verification`, {
        method: 'POST',
        credentials: 'include'
      })
      if (response.ok) {
        fetchDashboardData() // Refresh data
      }
    } catch (error) {
      console.error('Failed to toggle provider verification:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg">Loading admin dashboard...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
        <p className="text-lg text-gray-600">Manage users, services, and platform analytics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Service Providers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProviders}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Service Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCategories}</div>
          </CardContent>
        </Card>
      </div>

      {/* Management Tabs */}
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users">Manage Users</TabsTrigger>
          <TabsTrigger value="providers">Manage Providers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{user.full_name}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-sm text-gray-500">
                        {user.user_type} • {user.location}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleUserStatus(user.id, user.is_active)}
                      >
                        {user.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="providers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Provider Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {providers.map((provider) => (
                  <div key={provider.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{provider.user.full_name}</h3>
                      <p className="text-sm text-gray-600">{provider.user.email}</p>
                      <p className="text-sm text-gray-500">
                        NPR {provider.hourly_rate}/hour • {provider.experience_years} years exp
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {provider.skills.map((skill, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        provider.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {provider.is_verified ? 'Verified' : 'Pending'}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleProviderVerification(provider.id, provider.is_verified)}
                      >
                        {provider.is_verified ? 'Unverify' : 'Verify'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AdminDashboard

