import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Eye, EyeOff, User, Mail, Lock, Phone, MapPin, DollarSign } from 'lucide-react'

const Register = () => {
  const [userType, setUserType] = useState('customer')
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone: '',
    location: '',
    user_type: 'customer',
    provider_profile: {
      skills: [],
      hourly_rate: '',
      experience_years: '',
      description: ''
    }
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (name.startsWith('provider_')) {
      const field = name.replace('provider_', '')
      setFormData({
        ...formData,
        provider_profile: {
          ...formData.provider_profile,
          [field]: value
        }
      })
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
    setError('')
  }

  const handleUserTypeChange = (type) => {
    setUserType(type)
    setFormData({
      ...formData,
      user_type: type
    })
  }

  const handleSkillsChange = (e) => {
    const skills = e.target.value.split(',').map(skill => skill.trim()).filter(skill => skill)
    setFormData({
      ...formData,
      provider_profile: {
        ...formData.provider_profile,
        skills: skills
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    // Prepare data for submission
    const submitData = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      full_name: formData.full_name,
      phone: formData.phone,
      location: formData.location,
      user_type: formData.user_type
    }

    if (formData.user_type === 'service_provider') {
      submitData.provider_profile = {
        skills: formData.provider_profile.skills,
        hourly_rate: parseFloat(formData.provider_profile.hourly_rate) || 0,
        experience_years: parseInt(formData.provider_profile.experience_years) || 0,
        description: formData.provider_profile.description
      }
    }

    const result = await register(submitData)
    
    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.error)
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Join Sajilo Sewa</CardTitle>
            <p className="text-gray-600">Create your account to get started</p>
          </CardHeader>
          <CardContent>
            <Tabs value={userType} onValueChange={handleUserTypeChange} className="mb-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="customer">I need services</TabsTrigger>
                <TabsTrigger value="service_provider">I provide services</TabsTrigger>
              </TabsList>
            </Tabs>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="full_name"
                      name="full_name"
                      placeholder="Enter your full name"
                      value={formData.full_name}
                      onChange={handleChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="username"
                      name="username"
                      placeholder="Choose a username"
                      value={formData.username}
                      onChange={handleChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={handleChange}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="location"
                    name="location"
                    placeholder="Enter your location in Kathmandu"
                    value={formData.location}
                    onChange={handleChange}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Service Provider Additional Fields */}
              {userType === 'service_provider' && (
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-semibold text-lg">Service Provider Information</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="provider_skills">Skills (comma-separated)</Label>
                    <Input
                      id="provider_skills"
                      name="provider_skills"
                      placeholder="e.g., Plumbing, Electrical work, Cleaning"
                      onChange={handleSkillsChange}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="provider_hourly_rate">Hourly Rate (NPR)</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="provider_hourly_rate"
                          name="provider_hourly_rate"
                          type="number"
                          placeholder="500"
                          value={formData.provider_profile.hourly_rate}
                          onChange={handleChange}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="provider_experience_years">Experience (years)</Label>
                      <Input
                        id="provider_experience_years"
                        name="provider_experience_years"
                        type="number"
                        placeholder="5"
                        value={formData.provider_profile.experience_years}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="provider_description">Description</Label>
                    <Textarea
                      id="provider_description"
                      name="provider_description"
                      placeholder="Tell customers about your services and experience"
                      value={formData.provider_profile.description}
                      onChange={handleChange}
                      rows={3}
                    />
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Register

