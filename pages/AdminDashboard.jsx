import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { ArrowLeft, Shield } from 'lucide-react'

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-16">
        <Link 
          to="/" 
          className="inline-flex items-center text-[#0F62FE] hover:text-[#0052CC] mb-8 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Home
        </Link>

        <div className="text-center">
          <div className="w-24 h-24 bg-[#0F62FE]/10 rounded-full mx-auto mb-6 flex items-center justify-center">
            <Shield className="text-[#0F62FE]" size={48} />
          </div>
          <h1 className="text-4xl font-bold text-[#0B1220] mb-4">
            Admin Dashboard
          </h1>
          <p className="text-xl text-[#475569] mb-8 max-w-2xl mx-auto">
            This page is under development. Admin access will be available soon.
          </p>
          <Link to="/">
            <Button className="bg-[#0F62FE] hover:bg-[#0052CC] text-white font-semibold">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
