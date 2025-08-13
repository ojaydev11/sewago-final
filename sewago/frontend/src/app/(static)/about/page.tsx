import { 
  UserGroupIcon,
  StarIcon,
  ShieldCheckIcon,
  ClockIcon,
  HeartIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const stats = [
  { number: '10,000+', label: 'Happy Customers' },
  { number: '500+', label: 'Service Providers' },
  { number: '50,000+', label: 'Services Completed' },
  { number: '4.9', label: 'Average Rating' },
];

const values = [
  {
    icon: ShieldCheckIcon,
    title: 'Trust & Safety',
    description: 'All our service providers are thoroughly verified and background-checked.',
  },
  {
    icon: StarIcon,
    title: 'Quality Service',
    description: 'We maintain high standards and ensure customer satisfaction in every service.',
  },
  {
    icon: ClockIcon,
    title: 'Reliability',
    description: 'Dependable service delivery with punctual and professional providers.',
  },
  {
    icon: HeartIcon,
    title: 'Customer Care',
    description: '24/7 customer support to assist you whenever you need help.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white pt-16">
      {/* Hero Section */}
      <section className="section bg-slate-50">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              About SewaGo
            </h1>
            <p className="text-xl text-slate-600 mb-8">
              We're Nepal's leading platform connecting customers with trusted local service providers. 
              Our mission is to make finding reliable services simple, safe, and convenient.
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">
                    {stat.number}
                  </div>
                  <div className="text-slate-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="section">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">
                Our Story
              </h2>
              <p className="text-slate-600 mb-6">
                SewaGo was founded with a simple vision: to bridge the gap between customers 
                seeking reliable services and skilled professionals looking for opportunities. 
                We recognized the challenges people face in finding trustworthy service providers 
                in Nepal.
              </p>
              <p className="text-slate-600 mb-6">
                Since our launch, we've grown to become Nepal's most trusted platform for local 
                services, serving thousands of customers and empowering hundreds of service 
                providers across the country.
              </p>
              <div className="flex items-center">
                <CheckCircleIcon className="w-6 h-6 text-jade mr-3" />
                <span className="text-slate-700 font-medium">
                  Verified and trusted since 2024
                </span>
              </div>
            </div>
            <div className="bg-primary/5 rounded-2xl p-8">
              <UserGroupIcon className="w-16 h-16 text-primary mb-6" />
              <h3 className="text-xl font-bold text-slate-900 mb-4">
                Building Trust in Nepal
              </h3>
              <p className="text-slate-600">
                We're committed to creating a trusted marketplace where quality services 
                meet genuine customer needs, contributing to Nepal's growing service economy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="section bg-slate-50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Our Values
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              These core values guide everything we do and shape our commitment to customers and providers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">{value.title}</h3>
                <p className="text-slate-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}