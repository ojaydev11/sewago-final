import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { User, Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react'

const Register = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    user_type: 'customer'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    setError('')

    try {
      const result = await register(formData)
      if (result.success) {
        navigate('/dashboard')
      } else {
        setError(result.error || 'Registration failed')
      }
    } catch (error) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Back to Home */}
        <Link 
          to="/" 
          className="inline-flex items-center text-[#0F62FE] hover:text-[#0052CC] mb-8 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Home
        </Link>

        {/* Register Card */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[#F4AF1B] to-[#E69A0D] rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <User className="text-white" size={32} />
            </div>
            <CardTitle className="text-2xl font-bold text-[#0B1220]">
              Create Account
            </CardTitle>
            <p className="text-[#475569]">
              Join SewaGo and start booking services today
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Full Name Field */}
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-[#0B1220] mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F62FE] focus:border-transparent transition-all duration-200"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#0B1220] mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F62FE] focus:border-transparent transition-all duration-200"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* User Type Selection */}
              <div>
                <label className="block text-sm font-medium text-[#0B1220] mb-2">
                  I want to
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="relative cursor-pointer">
                    <input
                      type="radio"
                      name="user_type"
                      value="customer"
                      checked={formData.user_type === 'customer'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className={`p-3 border-2 rounded-lg text-center transition-all duration-200 ${
                      formData.user_type === 'customer'
                        ? 'border-[#0F62FE] bg-[#0F62FE]/5 text-[#0F62FE]'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}>
                      <CheckCircle size={20} className="mx-auto mb-1" />
                      <span className="text-sm font-medium">Book Services</span>
                    </div>
                  </label>
                  <label className="relative cursor-pointer">
                    <input
                      type="radio"
                      name="user_type"
                      value="provider"
                      checked={formData.user_type === 'provider'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className={`p-3 border-2 rounded-lg text-center transition-all duration-200 ${
                      formData.user_type === 'provider'
                        ? 'border-[#0F62FE] bg-[#0F62FE]/5 text-[#0F62FE]'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}>
                      <CheckCircle size={20} className="mx-auto mb-1" />
                      <span className="text-sm font-medium">Provide Services</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#0B1220] mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F62FE] focus:border-transparent transition-all duration-200"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <p className="text-xs text-[#475569] mt-1">
                  Must be at least 6 characters long
                </p>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#0B1220] mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F62FE] focus:border-transparent transition-all duration-200"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start">
                <input
                  type="checkbox"
                  required
                  className="w-4 h-4 text-[#0F62FE] border-gray-300 rounded focus:ring-[#0F62FE] focus:ring-2 mt-1"
                />
                <label className="ml-2 text-sm text-[#475569]">
                  I agree to the{' '}
                  <Link to="/terms" className="text-[#0F62FE] hover:text-[#0052CC]">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-[#0F62FE] hover:text-[#0052CC]">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0F62FE] hover:bg-[#0052CC] text-white font-semibold py-3 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-sm text-[#475569]">or</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Social Registration */}
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full border-gray-300 text-[#0B1220] hover:bg-gray-50 font-medium py-3 rounded-lg"
              >
                Continue with Google
              </Button>
              <Button
                variant="outline"
                className="w-full border-gray-300 text-[#0B1220] hover:bg-gray-50 font-medium py-3 rounded-lg"
              >
                Continue with Facebook
              </Button>
            </div>

            {/* Sign In Link */}
            <div className="text-center mt-6">
              <p className="text-[#475569]">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="text-[#0F62FE] hover:text-[#0052CC] font-medium transition-colors"
                >
                  Sign in
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
