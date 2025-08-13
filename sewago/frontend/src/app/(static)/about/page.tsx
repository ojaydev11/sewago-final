import Link from 'next/link';
import { 
  HeartIcon,
  StarIcon,
  UserGroupIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TrophyIcon,
  HandshakeIcon
} from '@heroicons/react/24/outline';

const stats = [
  { number: "10K+", label: "Happy Customers", icon: HeartIcon, color: "text-red-500" },
  { number: "500+", label: "Verified Providers", icon: UserGroupIcon, color: "text-blue-500" },
  { number: "50+", label: "Cities Covered", icon: GlobeAltIcon, color: "text-green-500" },
  { number: "4.9", label: "Customer Rating", icon: StarIcon, color: "text-yellow-500" }
];

const values = [
  {
    icon: ShieldCheckIcon,
    title: "Trust & Reliability",
    description: "We believe in building lasting relationships based on trust, transparency, and reliability.",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: HeartIcon,
    title: "Customer First",
    description: "Your satisfaction is our priority. We go above and beyond to exceed your expectations.",
    color: "from-red-500 to-pink-500"
  },
  {
    icon: SparklesIcon,
    title: "Quality Excellence",
    description: "We maintain the highest standards of quality in every service we provide.",
    color: "from-purple-500 to-indigo-500"
  },
  {
    icon: HandshakeIcon,
    title: "Community Impact",
    description: "Supporting local businesses and creating employment opportunities in Nepal.",
    color: "from-green-500 to-emerald-500"
  }
];

const team = [
  {
    name: "Rajesh Thapa",
    role: "Founder & CEO",
    image: "🇳🇵",
    description: "Former tech executive with 15+ years experience in building scalable platforms."
  },
  {
    name: "Priya Sharma",
    role: "Head of Operations",
    image: "🇳🇵",
    description: "Operations expert focused on delivering exceptional customer experiences."
  },
  {
    name: "Amit Kumar",
    role: "CTO",
    image: "🇳🇵",
    description: "Technology leader passionate about building innovative solutions for Nepal."
  },
  {
    name: "Sita Tamang",
    role: "Head of Customer Success",
    image: "🇳🇵",
    description: "Customer advocate ensuring every interaction exceeds expectations."
  }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6">
              <SparklesIcon className="w-4 h-4 mr-2" />
              <span>Our Story</span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">
              About <span className="text-gradient-secondary">SewaGo</span>
            </h1>
            
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Connecting Nepal's trusted service providers with customers who need quality services. 
              Building a community of excellence, one service at a time. 🇳🇵
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="animate-slide-in-left">
              <h2 className="text-4xl font-bold text-gray-800 mb-6">
                Our <span className="text-gradient-primary">Mission</span>
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                To revolutionize the local service industry in Nepal by creating a trusted platform 
                that connects skilled professionals with customers who need reliable, quality services.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                We believe that every Nepali household deserves access to professional, verified, 
                and trustworthy service providers. Our platform makes this possible through 
                technology, transparency, and community.
              </p>
              
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center">
                  <TrophyIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Excellence in Service</h3>
                  <p className="text-gray-600">Award-winning platform recognized for quality</p>
                </div>
              </div>
            </div>
            
            <div className="animate-slide-in-right">
              <div className="relative">
                <div className="card-modern p-8 bg-gradient-to-br from-blue-50 to-cyan-50">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                    Our Vision
                  </h3>
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-3 h-3 bg-gradient-primary rounded-full mt-2"></div>
                      <p className="text-gray-700">
                        To become Nepal's most trusted and comprehensive service marketplace
                      </p>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="w-3 h-3 bg-gradient-primary rounded-full mt-2"></div>
                      <p className="text-gray-700">
                        Empowering local businesses and creating employment opportunities
                      </p>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="w-3 h-3 bg-gradient-primary rounded-full mt-2"></div>
                      <p className="text-gray-700">
                        Building a sustainable ecosystem for quality services
                      </p>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="w-3 h-3 bg-gradient-primary rounded-full mt-2"></div>
                      <p className="text-gray-700">
                        Promoting digital transformation in traditional service sectors
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              SewaGo by the <span className="text-gradient-accent">Numbers</span>
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Our impact in numbers - growing stronger every day
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className={`${stat.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-12 h-12 mx-auto" />
                </div>
                <div className="text-4xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Our <span className="text-gradient-primary">Values</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do at SewaGo
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center group">
                <div className={`w-20 h-20 bg-gradient-to-br ${value.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <value.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Meet Our <span className="text-gradient-primary">Team</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The passionate individuals behind SewaGo's success
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center group">
                <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 text-4xl group-hover:scale-110 transition-transform duration-300">
                  {member.image}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{member.name}</h3>
                <p className="text-red-600 font-semibold mb-3">{member.role}</p>
                <p className="text-gray-600 text-sm leading-relaxed">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-800 mb-8">
              Our <span className="text-gradient-primary">Story</span>
            </h2>
            
            <div className="space-y-8 text-lg text-gray-600 leading-relaxed">
              <p>
                SewaGo was born from a simple observation: finding reliable local services in Nepal 
                was often challenging, time-consuming, and sometimes risky. Many people struggled to 
                find trustworthy providers for basic home services like cleaning, electrical work, 
                or plumbing.
              </p>
              
              <p>
                Founded in 2024, we set out to solve this problem by creating a platform that 
                connects verified, skilled professionals with customers who need quality services. 
                Our journey began in Kathmandu, and we've since expanded to serve communities 
                across Nepal.
              </p>
              
              <p>
                Today, SewaGo is more than just a service marketplace. We're a community of 
                professionals, customers, and team members who believe in the power of quality 
                service to improve lives and strengthen communities.
              </p>
              
              <p>
                As we continue to grow, our commitment to quality, trust, and community remains 
                unwavering. We're building the future of local services in Nepal, one connection 
                at a time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Join the SewaGo Family
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Whether you're looking for services or want to provide them, we'd love to have you 
            as part of our growing community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/services" className="bg-white text-red-600 hover:bg-gray-100 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105">
              Explore Services
            </Link>
            <Link href="/provider/register" className="border-2 border-white text-white hover:bg-white hover:text-red-600 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300">
              Become a Provider
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}


