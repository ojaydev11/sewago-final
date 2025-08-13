import { 
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

const contactInfo = [
  {
    icon: PhoneIcon,
    title: "Phone",
    details: ["+977-1-4XXXXXX", "+977-98XXXXXXX"],
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: EnvelopeIcon,
    title: "Email",
    details: ["info@sewago.com", "support@sewago.com"],
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: MapPinIcon,
    title: "Address",
    details: ["Thamel, Kathmandu", "Nepal"],
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: ClockIcon,
    title: "Business Hours",
    details: ["Mon-Fri: 9:00 AM - 6:00 PM", "Sat: 10:00 AM - 4:00 PM"],
    color: "from-orange-500 to-red-500"
  }
];

const faqs = [
  {
    question: "How do I book a service?",
    answer: "Simply browse our services, select the one you need, and click 'Book Now'. You'll be guided through a simple booking process."
  },
  {
    question: "Are your service providers verified?",
    answer: "Yes! All our service providers undergo thorough background checks and verification processes to ensure your safety and satisfaction."
  },
  {
    question: "What if I'm not satisfied with the service?",
    answer: "We offer a satisfaction guarantee. If you're not happy with the service, contact us within 24 hours and we'll make it right."
  },
  {
    question: "Do you offer emergency services?",
    answer: "Yes, we offer 24/7 emergency services for critical issues like electrical problems, plumbing emergencies, and more."
  },
  {
    question: "How do I become a service provider?",
    answer: "Visit our provider registration page, fill out the application form, and our team will guide you through the verification process."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept cash, digital wallets, bank transfers, and major credit cards. All payments are secure and protected."
  }
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6">
              <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
              <span>Get in Touch</span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">
              Contact <span className="text-gradient-secondary">Us</span>
            </h1>
            
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Have questions? Need help? We're here for you! Reach out to our friendly team 
              and we'll get back to you as soon as possible. 🇳🇵
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((info, index) => (
              <div key={index} className="text-center group">
                <div className={`w-20 h-20 bg-gradient-to-br ${info.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <info.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">{info.title}</h3>
                <div className="space-y-2">
                  {info.details.map((detail, idx) => (
                    <p key={idx} className="text-gray-600">{detail}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div className="animate-slide-in-left">
              <h2 className="text-4xl font-bold text-gray-800 mb-8">
                Send us a <span className="text-gradient-primary">Message</span>
              </h2>
              
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="input-modern w-full"
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="input-modern w-full"
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    className="input-modern w-full"
                    placeholder="Enter your email address"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="input-modern w-full"
                    placeholder="Enter your phone number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <select className="input-modern w-full">
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="support">Customer Support</option>
                    <option value="booking">Booking Issue</option>
                    <option value="provider">Become a Provider</option>
                    <option value="partnership">Partnership</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    required
                    rows={5}
                    className="input-modern w-full resize-none"
                    placeholder="Tell us how we can help you..."
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  className="btn-primary w-full py-4 text-lg font-semibold"
                >
                  Send Message
                </button>
              </form>
            </div>
            
            {/* Map & Additional Info */}
            <div className="animate-slide-in-right">
              <div className="space-y-8">
                {/* Map Placeholder */}
                <div className="bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl h-80 flex items-center justify-center">
                  <div className="text-center">
                    <MapPinIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Interactive Map</p>
                    <p className="text-gray-500 text-sm">Kathmandu, Nepal</p>
                  </div>
                </div>
                
                {/* Quick Contact */}
                <div className="card-modern p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    Need Immediate Help?
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-gradient-primary rounded-full"></div>
                      <span className="text-gray-700">24/7 Customer Support</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-gradient-primary rounded-full"></div>
                      <span className="text-gray-700">WhatsApp Support Available</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-gradient-primary rounded-full"></div>
                      <span className="text-gray-700">Response within 2 hours</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <a
                      href="https://wa.me/977XXXXXXXXX"
                      className="inline-flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-300"
                    >
                      <span>💬</span>
                      <span>Chat on WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Frequently Asked <span className="text-gradient-primary">Questions</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Find answers to common questions about our services and platform
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="card-modern group hover:shadow-lg transition-all duration-300">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 group-hover:text-red-600 transition-colors duration-300">
                      {faq.question}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Office Location */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Visit Our <span className="text-gradient-primary">Office</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Drop by our office in the heart of Kathmandu for a personal consultation
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="card-modern p-8 text-center">
              <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPinIcon className="w-10 h-10 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                SewaGo Headquarters
              </h3>
              
              <div className="space-y-4 text-gray-600 mb-8">
                <p className="text-lg">📍 Thamel, Kathmandu, Nepal</p>
                <p className="text-lg">🏢 3rd Floor, Service Plaza Building</p>
                <p className="text-lg">🚶‍♂️ 5 minutes walk from Thamel Chowk</p>
                <p className="text-lg">🚗 Parking available on premises</p>
              </div>
              
              <div className="bg-gradient-primary text-white p-6 rounded-2xl">
                <h4 className="text-xl font-bold mb-2">Office Hours</h4>
                <div className="space-y-2">
                  <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                  <p>Saturday: 10:00 AM - 4:00 PM</p>
                  <p>Sunday: Closed (Emergency support available)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Whether you need services or want to provide them, we're here to help you 
            every step of the way.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:+977-1-4XXXXXX" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105">
              Call Us Now
            </a>
            <a href="mailto:info@sewago.com" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300">
              Send Email
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}


