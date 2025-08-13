import { 
  ShieldCheckIcon,
  EyeIcon,
  LockClosedIcon,
  DocumentTextIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

import { Metadata } from 'next';

// Force dynamic rendering to prevent build-time prerendering
export const dynamic = 'force-dynamic';

export const metadata = { title: "Privacy Policy | SewaGo" };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6">
              <ShieldCheckIcon className="w-4 h-4 mr-2" />
              <span>Privacy & Security</span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">
              Privacy <span className="text-gradient-secondary">Policy</span>
            </h1>
            
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Your privacy and data security are our top priorities. Learn how we protect 
              your information and maintain your trust. 🇳🇵
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
              This privacy policy describes how SewaGo collects, uses, and protects your personal information.
            </p>
          </div>
        </div>
      </section>

      {/* Privacy Overview */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                Your Privacy <span className="text-gradient-primary">Matters</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We're committed to transparency and protecting your personal information
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {[
                {
                  icon: EyeIcon,
                  title: "Transparency",
                  description: "We're clear about what data we collect and how we use it",
                  color: "from-blue-500 to-cyan-500"
                },
                {
                  icon: LockClosedIcon,
                  title: "Security",
                  description: "Your data is protected with industry-standard encryption",
                  color: "from-green-500 to-emerald-500"
                },
                {
                  icon: ShieldCheckIcon,
                  title: "Control",
                  description: "You have full control over your personal information",
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

      {/* Privacy Policy Content */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-12">
              {/* Information We Collect */}
              <div className="card-modern p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                  <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center mr-4">
                    <DocumentTextIcon className="w-6 h-6 text-white" />
                  </div>
                  Information We Collect
                </h2>
                
                <div className="space-y-6 text-gray-700">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Personal Information</h3>
                    <ul className="space-y-2 ml-6">
                      <li>• Name, email address, and phone number</li>
                      <li>• Address and location information</li>
                      <li>• Profile information and preferences</li>
                      <li>• Payment and billing information</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Service Information</h3>
                    <ul className="space-y-2 ml-6">
                      <li>• Service requests and booking details</li>
                      <li>• Communication with service providers</li>
                      <li>• Reviews and ratings</li>
                      <li>• Service history and preferences</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Technical Information</h3>
                    <ul className="space-y-2 ml-6">
                      <li>• Device information and IP addresses</li>
                      <li>• Usage data and analytics</li>
                      <li>• Cookies and similar technologies</li>
                      <li>• Log files and error reports</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* How We Use Information */}
              <div className="card-modern p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                  <div className="w-10 h-10 bg-gradient-secondary rounded-xl flex items-center justify-center mr-4">
                    <SparklesIcon className="w-6 h-6 text-white" />
                  </div>
                  How We Use Your Information
                </h2>
                
                <div className="space-y-6 text-gray-700">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Service Delivery</h3>
                    <ul className="space-y-2 ml-6">
                      <li>• Connect you with service providers</li>
                      <li>• Process bookings and payments</li>
                      <li>• Facilitate communication between parties</li>
                      <li>• Provide customer support</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Platform Improvement</h3>
                    <ul className="space-y-2 ml-6">
                      <li>• Analyze usage patterns and trends</li>
                      <li>• Improve our services and user experience</li>
                      <li>• Develop new features and functionality</li>
                      <li>• Ensure platform security and reliability</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Communication</h3>
                    <ul className="space-y-2 ml-6">
                      <li>• Send service confirmations and updates</li>
                      <li>• Provide important platform notifications</li>
                      <li>• Share relevant offers and promotions</li>
                      <li>• Respond to your inquiries and requests</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Information Sharing */}
              <div className="card-modern p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                  <div className="w-10 h-10 bg-gradient-accent rounded-xl flex items-center justify-center mr-4">
                    <ShieldCheckIcon className="w-6 h-6 text-white" />
                  </div>
                  Information Sharing & Disclosure
                </h2>
                
                <div className="space-y-6 text-gray-700">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Service Providers</h3>
                    <p className="ml-6">
                      We share necessary information with service providers to facilitate your bookings. 
                      This includes your contact details, service requirements, and location information.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Legal Requirements</h3>
                    <p className="ml-6">
                      We may disclose information when required by law, to protect our rights, 
                      or to ensure the safety of our users and the public.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Business Transfers</h3>
                    <p className="ml-6">
                      In the event of a merger, acquisition, or sale of assets, your information 
                      may be transferred as part of the business transaction.
                    </p>
                  </div>
                  
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                    <p className="text-yellow-800">
                      <strong>Important:</strong> We never sell, rent, or trade your personal information 
                      to third parties for marketing purposes.
                    </p>
                  </div>
                </div>
              </div>

              {/* Data Security */}
              <div className="card-modern p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                  <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center mr-4">
                    <LockClosedIcon className="w-6 h-6 text-white" />
                  </div>
                  Data Security & Protection
                </h2>
                
                <div className="space-y-6 text-gray-700">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Encryption & Security</h3>
                    <ul className="space-y-2 ml-6">
                      <li>• End-to-end encryption for sensitive data</li>
                      <li>• Secure HTTPS connections for all communications</li>
                      <li>• Regular security audits and vulnerability assessments</li>
                      <li>• Access controls and authentication measures</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Data Retention</h3>
                    <ul className="space-y-2 ml-6">
                      <li>• Personal data is retained only as long as necessary</li>
                      <li>• Service history is kept for legal and business purposes</li>
                      <li>• You can request deletion of your data at any time</li>
                      <li>• Regular data cleanup and archival processes</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
                    <p className="text-green-800">
                      <strong>Security Commitment:</strong> We continuously invest in the latest 
                      security technologies to protect your information.
                    </p>
                  </div>
                </div>
              </div>

              {/* Your Rights */}
              <div className="card-modern p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                  <div className="w-10 h-10 bg-gradient-secondary rounded-xl flex items-center justify-center mr-4">
                    <EyeIcon className="w-6 h-6 text-white" />
                  </div>
                  Your Privacy Rights
                </h2>
                
                <div className="space-y-6 text-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-3">Access & Control</h3>
                      <ul className="space-y-2 ml-6">
                        <li>• View your personal information</li>
                        <li>• Update or correct your data</li>
                        <li>• Download your data</li>
                        <li>• Delete your account</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-3">Communication Preferences</h3>
                      <ul className="space-y-2 ml-6">
                        <li>• Control email notifications</li>
                        <li>• Manage marketing communications</li>
                        <li>• Set communication frequency</li>
                        <li>• Opt-out of certain messages</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                    <p className="text-blue-800">
                      <strong>Exercise Your Rights:</strong> Contact our privacy team at{' '}
                      <a href="mailto:privacy@sewago.com" className="underline font-semibold">
                        privacy@sewago.com
                      </a>{' '}
                      to exercise any of these rights.
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
                  Contact Us
                </h2>
                
                <div className="space-y-6 text-gray-700">
                  <p>
                    If you have any questions about this privacy policy or our data practices, 
                    please contact us:
                  </p>
                  
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <span className="font-semibold">Email:</span>
                        <a href="mailto:privacy@sewago.com" className="text-red-600 hover:underline">
                          privacy@sewago.com
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
                    We're committed to addressing your privacy concerns promptly and thoroughly.
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
            Questions About Privacy?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Our privacy team is here to help. Reach out to us with any questions 
            or concerns about your data protection.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:privacy@sewago.com" className="bg-white text-red-600 hover:bg-gray-100 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105">
              Contact Privacy Team
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


