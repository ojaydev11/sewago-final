import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Menu, X, User, LogOut, Settings, Home, Search, Calendar } from 'lucide-react'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
    setIsMenuOpen(false)
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <nav className="bg-white shadow-lg border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2" onClick={closeMenu}>
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold text-primary">Sajilo Sewa</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-1 text-gray-700 hover:text-primary transition-colors">
              <Home size={18} />
              <span>Home</span>
            </Link>
            <Link to="/services" className="flex items-center space-x-1 text-gray-700 hover:text-primary transition-colors">
              <Search size={18} />
              <span>Services</span>
            </Link>
            <Link to="/providers" className="flex items-center space-x-1 text-gray-700 hover:text-primary transition-colors">
              <User size={18} />
              <span>Providers</span>
            </Link>
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link to="/dashboard" className="flex items-center space-x-1 text-gray-700 hover:text-primary transition-colors">
                  <Calendar size={18} />
                  <span>Dashboard</span>
                </Link>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Hi, {user?.full_name}</span>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    <LogOut size={16} className="mr-1" />
                    Logout
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="outline" size="sm">Login</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={toggleMenu}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-3">
              <Link 
                to="/" 
                className="flex items-center space-x-2 text-gray-700 hover:text-primary transition-colors py-2"
                onClick={closeMenu}
              >
                <Home size={18} />
                <span>Home</span>
              </Link>
              <Link 
                to="/services" 
                className="flex items-center space-x-2 text-gray-700 hover:text-primary transition-colors py-2"
                onClick={closeMenu}
              >
                <Search size={18} />
                <span>Services</span>
              </Link>
              <Link 
                to="/providers" 
                className="flex items-center space-x-2 text-gray-700 hover:text-primary transition-colors py-2"
                onClick={closeMenu}
              >
                <User size={18} />
                <span>Providers</span>
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="flex items-center space-x-2 text-gray-700 hover:text-primary transition-colors py-2"
                    onClick={closeMenu}
                  >
                    <Calendar size={18} />
                    <span>Dashboard</span>
                  </Link>
                  <div className="pt-2 border-t">
                    <p className="text-sm text-gray-600 mb-2">Hi, {user?.full_name}</p>
                    <Button variant="outline" size="sm" onClick={handleLogout} className="w-full">
                      <LogOut size={16} className="mr-2" />
                      Logout
                    </Button>
                  </div>
                </>
              ) : (
                <div className="pt-2 border-t space-y-2">
                  <Link to="/login" onClick={closeMenu}>
                    <Button variant="outline" size="sm" className="w-full">Login</Button>
                  </Link>
                  <Link to="/register" onClick={closeMenu}>
                    <Button size="sm" className="w-full">Sign Up</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar

