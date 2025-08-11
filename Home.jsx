import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Wrench, 
  Zap, 
  Sparkles, 
  Book, 
  Settings, 
  Hammer,
  Star,
  Shield,
  Clock,
  MapPin,
  ArrowRight
} from 'lucide-react'

const Home = () => {
  const services = [
    { name: 'Plumber', icon: Wrench, description: 'Water pipe repairs & installations' },
    { name: 'Electrician', icon: Zap, description: 'Electrical repairs & wiring' },
    { name: 'Cleaner', icon: Sparkles, description: 'House cleaning services' },
    { name: 'Tutor', icon: Book, description: 'Educational tutoring' },
    { name: 'Mechanic', icon: Settings, description: 'Vehicle repairs' },
    { name: 'Handyman', icon: Hammer, description: 'General repairs & maintenance' }
  ]

  const features = [
    {
      icon: Shield,
      title: 'Trusted Providers',
      description: 'All service providers are verified and rated by customers'
    },
    {
      icon: Star,
      title: 'Quality Service',
      description: 'Read reviews and ratings from real customers'
    },
    {
      icon: Clock,
      title: 'Quick Booking',
      description: 'Book services instantly with flexible scheduling'
    },
    {
      icon: MapPin,
      title: 'Local Experts',
      description: 'Find service providers in your neighborhood'
    }
  ]

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Find Trusted Local
            <span className="text-primary block">Service Providers</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect with verified professionals in Kathmandu for all your home and personal service needs. 
            Book instantly, pay securely, and get quality service.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/services">
              <Button size="lg" className="w-full sm:w-auto">
                Find Services
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Join as Provider
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Popular Services
          </h2>
          <p className="text-lg text-gray-600">
            Choose from a wide range of professional services
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {services.map((service, index) => {
            const IconComponent = service.icon
            return (
              <Link key={index} to="/services" className="group">
                <Card className="h-full hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <IconComponent className="text-primary" size={24} />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{service.name}</h3>
                    <p className="text-sm text-gray-600 hidden md:block">{service.description}</p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-gray-50 -mx-4 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Sajilo Sewa?
            </h2>
            <p className="text-lg text-gray-600">
              We make finding and booking local services simple and secure
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const IconComponent = feature.icon
              return (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-lg flex items-center justify-center">
                      <IconComponent className="text-primary" size={24} />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of satisfied customers who trust Sajilo Sewa for their service needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Sign Up Now
              </Button>
            </Link>
            <Link to="/providers">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Browse Providers
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home

