import { 
  DocumentTextIcon,
  ScaleIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export const metadata = { title: "Terms of Service | SewaGo" };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6">
              <DocumentTextIcon className="w-4 h-4 mr-2" />
              <span>Terms & Conditions</span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">
              Terms of <span className="text-gradient-secondary">Service</span>
            </h1>
            
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Please read these terms carefully before using SewaGo. They govern your 
              use of our platform and services. 🇳🇵
            </p>
          </div>
        </div>
      </section>

      {/* Last Updated */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
              <DocumentTextIcon className="w-4 h-4 mr-2" />
              <span>Last Updated: December 2024</span>
            </div>
            <p className="text-gray-600">
              These terms of service govern your use of the SewaGo platform and services.
            </p>
          </div>
        </div>
      </section>

      {/* Terms Overview */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                Understanding Our <span className="text-gradient-primary">Terms</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Clear, fair, and transparent terms that protect both users and service providers
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {[
                {
                  icon: ScaleIcon,
                  title: "Fair & Legal",
                  description: "Our terms comply with Nepali law and ensure fair treatment for all parties",
                  color: "from-blue-500 to-cyan-500"
                },
                {
                  icon: ShieldCheckIcon,
                  title: "Protection",
                  description: "Clear guidelines that protect your rights and our platform integrity",
                  color: "from-green-500 to-emerald-500"
                },
                {
                  icon: UserGroupIcon,
                  title: "Community",
                  description: "Terms designed to build trust and maintain a safe service community",
                  color: "from-purple-500 to-pink-500"
                }
              ].map((feature, index) => (
                <div key={index} className="text-center group">
                  <div className={`w-20 h-20 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-12">
              {/* Acceptance of Terms */}
              <div className="card-modern p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                  <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center mr-4">
                    <DocumentTextIcon className="w-6 h-6 text-white" />
                  </div>
                  1. Acceptance of Terms
                </h2>
                
                <div className="space-y-4 text-gray-700">
                  <p>
                    By accessing and using the SewaGo platform, you agree to be bound by these Terms of Service. 
                    If you do not agree to these terms, please do not use our services.
                  </p>
                  
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                    <p className="text-blue-800">
                      <strong>Important:</strong> These terms constitute a legally binding agreement 
                      between you and SewaGo regarding your use of our platform.
                    </p>
                  </div>
                </div>
              </div>

              {/* Service Description */}
              <div className="card-modern p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                  <div className="w-10 h-10 bg-gradient-secondary rounded-xl flex items-center justify-center mr-4">
                    <SparklesIcon className="w-6 h-6 text-white" />
                  </div>
                  2. Service Description
                </h2>
                
                <div className="space-y-6 text-gray-700">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Platform Purpose</h3>
                    <p>
                      SewaGo is a digital marketplace that connects customers with verified service providers 
                      offering various local services including cleaning, electrical work, plumbing, gardening, 
                      and more.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Our Role</h3>
                    <ul className="space-y-2 ml-6">
                      <li>• Facilitate connections between customers and service providers</li>
                      <li>• Process payments and handle financial transactions</li>
                      <li>• Provide customer support and dispute resolution</li>
                      <li>• Maintain platform security and quality standards</li>
                    </ul>
                  </div>
                  
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                    <p className="text-yellow-800">
                      <strong>Note:</strong> SewaGo acts as an intermediary platform. We do not directly 
                      provide the services listed on our platform.
                    </p>
                  </div>
                </div>
              </div>

              {/* User Responsibilities */}
              <div className="card-modern p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                  <div className="w-10 h-10 bg-gradient-accent rounded-xl flex items-center justify-center mr-4">
                    <UserGroupIcon className="w-6 h-6 text-white" />
                  </div>
                  3. User Responsibilities
                </h2>
                
                <div className="space-y-6 text-gray-700">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Customer Responsibilities</h3>
                    <ul className="space-y-2 ml-6">
                      <li>• Provide accurate and complete information</li>
                      <li>• Treat service providers with respect and professionalism</li>
                      <li>• Pay for services as agreed upon</li>
                      <li>• Provide honest feedback and reviews</li>
                      <li>• Report any issues or concerns promptly</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Provider Responsibilities</h3>
                    <ul className="space-y-2 ml-6">
                      <li>• Maintain accurate profiles and service descriptions</li>
                      <li>• Provide services with professional standards</li>
                      <li>• Arrive on time and complete work as agreed</li>
                      <li>• Maintain proper licenses and insurance</li>
                      <li>• Communicate clearly with customers</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
                    <p className="text-green-800">
                      <strong>Community Standards:</strong> We expect all users to maintain high standards 
                      of conduct and professionalism.
                    </p>
                  </div>
                </div>
              </div>

              {/* Prohibited Activities */}
              <div className="card-modern p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                  <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center mr-4">
                    <ExclamationTriangleIcon className="w-6 h-6 text-white" />
                  </div>
                  4. Prohibited Activities
                </h2>
                
                <div className="space-y-6 text-gray-700">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">General Prohibitions</h3>
                    <ul className="space-y-2 ml-6">
                      <li>• Violating any applicable laws or regulations</li>
                      <li>• Harassing, threatening, or discriminating against others</li>
                      <li>• Providing false or misleading information</li>
                      <li>• Attempting to circumvent platform security measures</li>
                      <li>• Using the platform for illegal or unauthorized purposes</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Service-Related Prohibitions</h3>
                    <ul className="space-y-2 ml-6">
                      <li>• Offering services without proper qualifications</li>
                      <li>• Engaging in price gouging or unfair practices</li>
                      <li>• Failing to complete agreed-upon services</li>
                      <li>• Providing substandard or dangerous work</li>
                      <li>• Circumventing platform payment systems</li>
                    </ul>
                  </div>
                  
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                    <p className="text-red-800">
                      <strong>Consequences:</strong> Violation of these terms may result in account 
                      suspension, termination, or legal action as appropriate.
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Terms */}
              <div className="card-modern p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                  <div className="w-10 h-10 bg-gradient-secondary rounded-xl flex items-center justify-center mr-4">
                    <ScaleIcon className="w-6 h-6 text-white" />
                  </div>
                  5. Payment & Financial Terms
                </h2>
                
                <div className="space-y-6 text-gray-700">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Payment Processing</h3>
                    <ul className="space-y-2 ml-6">
                      <li>• All payments are processed through secure payment gateways</li>
                      <li>• We accept multiple payment methods including digital wallets</li>
                      <li>• Service fees and commissions are clearly disclosed</li>
                      <li>• Refunds are processed according to our refund policy</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Pricing & Fees</h3>
                    <ul className="space-y-2 ml-6">
                      <li>• Service providers set their own prices</li>
                      <li>• Platform fees are transparent and non-negotiable</li>
                      <li>• Prices may vary based on location and service complexity</li>
                      <li>• All costs are displayed before booking confirmation</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                    <p className="text-blue-800">
                      <strong>Transparency:</strong> We believe in clear, upfront pricing with no hidden fees.
                    </p>
                  </div>
                </div>
              </div>

              {/* Dispute Resolution */}
              <div className="card-modern p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                  <div className="w-10 h-10 bg-gradient-accent rounded-xl flex items-center justify-center mr-4">
                    <ShieldCheckIcon className="w-6 h-6 text-white" />
                  </div>
                  6. Dispute Resolution
                </h2>
                
                <div className="space-y-6 text-gray-700">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Our Process</h3>
                    <ul className="space-y-2 ml-6">
                      <li>• We encourage direct communication between parties</li>
                      <li>• Our support team mediates disputes when needed</li>
                      <li>• We investigate claims thoroughly and fairly</li>
                      <li>• Resolution may include refunds, service corrections, or account actions</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Escalation</h3>
                    <ul className="space-y-2 ml-6">
                      <li>• Complex disputes may be escalated to senior support</li>
                      <li>• We may involve third-party mediators for resolution</li>
                      <li>• Legal action is a last resort for unresolved disputes</li>
                      <li>• We maintain records of all dispute resolutions</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
                    <p className="text-green-800">
                      <strong>Fair Resolution:</strong> We're committed to resolving disputes 
                      fairly and efficiently for all parties involved.
                    </p>
                  </div>
                </div>
              </div>

              {/* Limitation of Liability */}
              <div className="card-modern p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                  <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center mr-4">
                    <ScaleIcon className="w-6 h-6 text-white" />
                  </div>
                  7. Limitation of Liability
                </h2>
                
                <div className="space-y-6 text-gray-700">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Platform Liability</h3>
                    <p>
                      SewaGo's liability is limited to the amount paid for our services. We are not 
                      responsible for the quality, safety, or outcome of third-party services provided 
                      through our platform.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Service Provider Liability</h3>
                    <p>
                      Service providers are responsible for their own work, insurance, and compliance 
                      with applicable laws and regulations.
                    </p>
                  </div>
                  
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                    <p className="text-yellow-800">
                      <strong>Important:</strong> While we strive to ensure quality, we cannot guarantee 
                      the outcome of any service provided by third parties.
                    </p>
                  </div>
                </div>
              </div>

              {/* Changes to Terms */}
              <div className="card-modern p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                  <div className="w-10 h-10 bg-gradient-secondary rounded-xl flex items-center justify-center mr-4">
                    <DocumentTextIcon className="w-6 h-6 text-white" />
                  </div>
                  8. Changes to Terms
                </h2>
                
                <div className="space-y-6 text-gray-700">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Modification Rights</h3>
                    <p>
                      We reserve the right to modify these terms at any time. Changes will be effective 
                      immediately upon posting on our platform.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Notification</h3>
                    <ul className="space-y-2 ml-6">
                      <li>• Users will be notified of significant changes via email</li>
                      <li>• Continued use constitutes acceptance of new terms</li>
                      <li>• Major changes may require explicit consent</li>
                      <li>• Previous terms remain archived for reference</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                    <p className="text-blue-800">
                      <strong>Stay Informed:</strong> We recommend regularly reviewing these terms 
                      to stay updated on any changes.
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="card-modern p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                  <div className="w-10 h-10 bg-gradient-accent rounded-xl flex items-center justify-center mr-4">
                    <SparklesIcon className="w-6 h-6 text-white" />
                  </div>
                  Contact & Questions
                </h2>
                
                <div className="space-y-6 text-gray-700">
                  <p>
                    If you have questions about these terms or need clarification on any provision, 
                    please contact our legal team:
                  </p>
                  
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <span className="font-semibold">Email:</span>
                        <a href="mailto:legal@sewago.com" className="text-red-600 hover:underline">
                          legal@sewago.com
                        </a>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="font-semibold">Phone:</span>
                        <span>+977-1-4XXXXXX</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="font-semibold">Address:</span>
                        <span>Thamel, Kathmandu, Nepal</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600">
                    Our legal team is available to address your questions and concerns about these terms.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Questions About Terms?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Our legal team is here to help clarify any questions about these terms 
            and conditions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:legal@sewago.com" className="bg-white text-red-600 hover:bg-gray-100 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105">
              Contact Legal Team
            </a>
            <a href="/contact" className="border-2 border-white text-white hover:bg-white hover:text-red-600 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300">
              General Support
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}


