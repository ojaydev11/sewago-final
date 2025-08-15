import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  Star, 
  Shield, 
  Zap,
  CheckCircle,
  AlertCircle,
  Target,
  Award
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Performance Dashboard - SewaGo',
  description: 'Real-time performance metrics and KPIs for SewaGo platform',
  keywords: 'performance, metrics, KPIs, SewaGo, Nepal, service platform',
};

// Static data for ISR - this would come from your analytics service
const performanceData = {
  overview: {
    totalBookings: 15420,
    activeProviders: 847,
    customerSatisfaction: 4.8,
    averageResponseTime: '12min',
    completionRate: 98.5,
    repeatCustomers: 73.2
  },
  monthly: {
    bookings: 1247,
    revenue: 2845000,
    newUsers: 156,
    providerGrowth: 23
  },
  cities: [
    { name: 'Kathmandu', bookings: 8920, providers: 456, satisfaction: 4.9 },
    { name: 'Pokhara', bookings: 3240, providers: 187, satisfaction: 4.7 },
    { name: 'Lalitpur', bookings: 1890, providers: 134, satisfaction: 4.8 },
    { name: 'Bhaktapur', bookings: 1370, providers: 70, satisfaction: 4.6 }
  ],
  services: [
    { name: 'Electrical Work', bookings: 4560, satisfaction: 4.9, avgPrice: 2500 },
    { name: 'House Cleaning', bookings: 3890, satisfaction: 4.7, avgPrice: 1800 },
    { name: 'Plumbing', bookings: 3240, satisfaction: 4.8, avgPrice: 2200 },
    { name: 'Tutoring', bookings: 2730, satisfaction: 4.9, avgPrice: 1500 }
  ]
};

// Revalidate every hour
export const revalidate = 3600;

export default function PerformancePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Performance Dashboard
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Real-time metrics and KPIs showcasing SewaGo's platform performance, 
            customer satisfaction, and operational excellence across Nepal.
          </p>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Total Bookings */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-blue-900 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Total Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900 mb-2">
                {performanceData.overview.totalBookings.toLocaleString()}
              </div>
              <p className="text-blue-700 text-sm">
                Lifetime platform bookings
              </p>
            </CardContent>
          </Card>

          {/* Active Providers */}
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-green-900 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Active Providers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900 mb-2">
                {performanceData.overview.activeProviders}
              </div>
              <p className="text-green-700 text-sm">
                Verified service professionals
              </p>
            </CardContent>
          </Card>

          {/* Customer Satisfaction */}
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-yellow-900 flex items-center gap-2">
                <Star className="h-5 w-5" />
                Customer Satisfaction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-900 mb-2">
                {performanceData.overview.customerSatisfaction}/5.0
              </div>
              <p className="text-yellow-700 text-sm">
                Average rating across all services
              </p>
            </CardContent>
          </Card>

          {/* Response Time */}
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-purple-900 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Avg Response Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900 mb-2">
                {performanceData.overview.averageResponseTime}
              </div>
              <p className="text-purple-700 text-sm">
                Provider response to booking requests
              </p>
            </CardContent>
          </Card>

          {/* Completion Rate */}
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-emerald-900 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Completion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-900 mb-2">
                {performanceData.overview.completionRate}%
              </div>
              <p className="text-emerald-700 text-sm">
                Successful service completions
              </p>
            </CardContent>
          </Card>

          {/* Repeat Customers */}
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-orange-900 flex items-center gap-2">
                <Award className="h-5 w-5" />
                Repeat Customers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-900 mb-2">
                {performanceData.overview.repeatCustomers}%
              </div>
              <p className="text-orange-700 text-sm">
                Customers who book again
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Performance */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-900">Monthly Performance</CardTitle>
            <CardDescription>Current month statistics and growth metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {performanceData.monthly.bookings.toLocaleString()}
                </div>
                <p className="text-gray-600 text-sm">Bookings</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  रू {performanceData.monthly.revenue.toLocaleString()}
                </div>
                <p className="text-gray-600 text-sm">Revenue</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {performanceData.monthly.newUsers}
                </div>
                <p className="text-gray-600 text-sm">New Users</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 mb-1">
                  +{performanceData.monthly.providerGrowth}
                </div>
                <p className="text-gray-600 text-sm">Provider Growth</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* City Performance */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-900">City Performance</CardTitle>
            <CardDescription>Performance metrics across major cities in Nepal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {performanceData.cities.map((city) => (
                <div key={city.name} className="text-center p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">{city.name}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Bookings:</span>
                      <span className="font-medium">{city.bookings.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Providers:</span>
                      <span className="font-medium">{city.providers}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Satisfaction:</span>
                      <span className="font-medium text-yellow-600">{city.satisfaction}/5.0</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Service Performance */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-900">Service Performance</CardTitle>
            <CardDescription>Performance metrics by service category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {performanceData.services.map((service) => (
                <div key={service.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{service.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span>{service.bookings.toLocaleString()} bookings</span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        {service.satisfaction}/5.0
                      </span>
                      <span>Avg: रू {service.avgPrice.toLocaleString()}</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Active
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quality Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-gray-900">Quality & Trust Metrics</CardTitle>
            <CardDescription>Platform reliability and trust indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <Shield className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Provider Verification</h3>
                <p className="text-2xl font-bold text-blue-600">100%</p>
                <p className="text-gray-600 text-sm">All providers verified</p>
              </div>
              
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Service Guarantee</h3>
                <p className="text-2xl font-bold text-green-600">98.5%</p>
                <p className="text-gray-600 text-sm">Satisfaction rate</p>
              </div>
              
              <div className="text-center p-6 bg-purple-50 rounded-lg">
                <Zap className="h-12 w-12 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Response Speed</h3>
                <p className="text-2xl font-bold text-purple-600">12min</p>
                <p className="text-gray-600 text-sm">Average response time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
