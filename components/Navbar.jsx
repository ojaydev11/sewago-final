import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from './ui/button'
import { Menu, X, Phone } from 'lucide-react'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Providers', path: '/providers' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ]

  const isActive = (path) => location.pathname === path

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-[#0F62FE] to-[#0052CC] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
              <Phone className="text-white" size={24} />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-[#0B1220] group-hover:text-[#0F62FE] transition-colors">
                SewaGo
              </span>
              <span className="text-xs text-[#475569] -mt-1">Premium Services</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`relative font-medium transition-colors duration-200 ${
                  isActive(link.path)
                    ? 'text-[#0F62FE]'
                    : 'text-[#0B1220] hover:text-[#0F62FE]'
                }`}
              >
                {link.name}
                {isActive(link.path) && (
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#0F62FE] rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            <Link to="/login">
              <Button variant="ghost" className="text-[#0B1220] hover:text-[#0F62FE] hover:bg-[#0F62FE]/5">
                Sign In
              </Button>
            </Link>
            <Link to="/services">
              <Button className="bg-[#0F62FE] hover:bg-[#0052CC] text-white font-semibold px-6 py-2.5 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
                Book Now
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden py-6 border-t border-gray-200 bg-white/95 backdrop-blur-md">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-3 rounded-lg font-medium transition-colors duration-200 ${
                    isActive(link.path)
                      ? 'text-[#0F62FE] bg-[#0F62FE]/5'
                      : 'text-[#0B1220] hover:text-[#0F62FE] hover:bg-gray-50'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-gray-200 space-y-3">
                <Link to="/login" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start text-[#0B1220] hover:text-[#0F62FE] hover:bg-[#0F62FE]/5">
                    Sign In
                  </Button>
                </Link>
                <Link to="/services" onClick={() => setIsOpen(false)}>
                  <Button className="w-full bg-[#0F62FE] hover:bg-[#0052CC] text-white font-semibold py-3 rounded-lg transition-all duration-300">
                    Book Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar

