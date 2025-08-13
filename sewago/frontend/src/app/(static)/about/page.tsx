
import { Metadata } from 'next';
import { 
  ShieldCheckIcon, 
  UserGroupIcon, 
  MapPinIcon,
  PhoneIcon,
  ClockIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'About SewaGo - Professional Home Services in Nepal',
  description: 'Learn about SewaGo, Nepal\'s trusted platform for professional home services. Our mission, vetting process, and commitment to quality.',
  keywords: 'about sewago, home services nepal, professional services, trusted platform',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            About SewaGo
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Nepal's most trusted platform for professional home services. 
            Connecting homeowners with verified, skilled professionals across major cities.
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-white rounded-lg p-8 mb-12">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-600 mb-6">
                To revolutionize home services in Nepal by providing a reliable, transparent, 
                and convenient platform that connects homeowners with skilled professionals. 
                We believe every home deserves quality service at fair prices.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckBadgeIcon className="w-6 h-6 text-green-600" />
                  <span>Quality guaranteed services</span>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
                  <span>30-day workmanship warranty</span>
                </div>
                <div className="flex items-center gap-3">
                  <UserGroupIcon className="w-6 h-6 text-purple-600" />
                  <span>Thoroughly vetted professionals</span>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Why Choose SewaGo?</h3>
              <div className="space-y-3 text-sm">
                <p><strong>Verified Professionals:</strong> All service providers undergo background checks and skill verification</p>
                <p><strong>Transparent Pricing:</strong> Clear, upfront pricing with no hidden fees</p>
                <p><strong>Quality Guarantee:</strong> 30-day warranty on all services</p>
                <p><strong>Easy Booking:</strong> Simple online booking with cash on delivery</p>
                <p><strong>Local Expertise:</strong> Professionals familiar with local requirements</p>
              </div>
            </div>
          </div>
        </div>

        {/* Vetting Process */}
        <div className="bg-white rounded-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Our Professional Vetting Process
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: '1',
                title: 'Application Review',
                description: 'Detailed application with work history and references'
              },
              {
                step: '2',
                title: 'Background Check',
                description: 'Comprehensive background verification and identity checks'
              },
              {
                step: '3',
                title: 'Skill Assessment',
                description: 'Practical skills test and certification verification'
              },
              {
                step: '4',
                title: 'Ongoing Monitoring',
                description: 'Continuous performance monitoring and customer feedback'
              }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Service Areas */}
        <div className="bg-white rounded-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Cities We Serve
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                city: 'Kathmandu',
                description: 'Nepal\'s capital and largest metropolitan area',
                areas: ['Thamel', 'Baluwatar', 'New Baneshwor', 'Kalanki', 'Koteshwor', 'Durbarmarg'],
                professionals: '200+'
              },
              {
                city: 'Lalitpur',
                description: 'Historic city known for arts and culture',
                areas: ['Patan', 'Jawalakhel', 'Sanepa', 'Kupondole', 'Pulchowk', 'Lagankhel'],
                professionals: '150+'
              },
              {
                city: 'Bhaktapur',
                description: 'Ancient city with rich cultural heritage',
                areas: ['Durbar Square', 'Thimi', 'Madhyapur', 'Suryabinayak', 'Changunarayan'],
                professionals: '100+'
              }
            ].map((location, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-3">
                  <MapPinIcon className="w-5 h-5 text-blue-600" />
                  <h3 className="text-xl font-semibold">{location.city}</h3>
                </div>
                <p className="text-gray-600 mb-4">{location.description}</p>
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-900 mb-2">Service Areas:</p>
                  <div className="text-sm text-gray-600">
                    {location.areas.join(', ')}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <UserGroupIcon className="w-4 h-4 text-green-600" />
                  <span className="text-green-600 font-medium">{location.professionals} Active Professionals</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Support Information */}
        <div className="bg-white rounded-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Customer Support
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Get Help When You Need It</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <PhoneIcon className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Phone Support</p>
                    <p className="text-sm text-gray-600">+977-9800000000</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <ClockIcon className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium">Available Hours</p>
                    <p className="text-sm text-gray-600">7 AM - 10 PM, 7 days a week</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold mb-3">Payment Policy</h4>
              <div className="space-y-2 text-sm">
                <p><strong>Cash on Service Delivery:</strong> Pay only after the service is completed to your satisfaction</p>
                <p><strong>No Advance Payment:</strong> We don't require any upfront payment for bookings</p>
                <p><strong>Transparent Pricing:</strong> All costs are clearly communicated before service begins</p>
                <p><strong>Warranty:</strong> 30-day guarantee on all completed work</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
