import { 
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const contactInfo = [
  {
    icon: MapPinIcon,
    title: 'Visit Us',
    details: ['Kathmandu, Nepal', 'Thamel District'],
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: PhoneIcon,
    title: 'Call Us',
    details: ['+977-1-4XXXXXX', '24/7 Support'],
    color: 'from-green-500 to-green-600',
  },
  {
    icon: EnvelopeIcon,
    title: 'Email Us',
    details: ['info@sewago.com', 'support@sewago.com'],
    color: 'from-purple-500 to-purple-600',
  },
  {
    icon: ClockIcon,
    title: 'Business Hours',
    details: ['Mon-Fri: 8AM-8PM', 'Sat-Sun: 9AM-6PM'],
    color: 'from-orange-500 to-orange-600',
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white pt-16">
      {/* Hero Section */}
      <section className="section bg-slate-50">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              Contact Us
            </h1>
            <p className="text-xl text-slate-600 mb-8">
              Get in touch with our team. We're here to help you with any questions 
              about our services or platform.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="section">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((info, index) => (
              <div key={index} className="text-center group">
                <div className={`w-16 h-16 bg-gradient-to-br ${info.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <info.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">{info.title}</h3>
                <div className="space-y-2">
                  {info.details.map((detail, idx) => (
                    <p key={idx} className="text-slate-600">{detail}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="section bg-slate-50">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Send Us a Message
              </h2>
              <p className="text-slate-600">
                Have a question or need assistance? Fill out the form below and we'll get back to you.
              </p>
            </div>

            <form className="card p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Your first name"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Your last name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="What's this about?"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Tell us how we can help..."
                />
              </div>

              <button type="submit" className="btn-primary w-full text-lg py-4">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-primary text-white">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Whether you need services or want to provide them, we're here to help you 
            every step of the way.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:+977-1-4XXXXXX" className="bg-white text-primary hover:bg-slate-100 px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
              Call Us Now
            </a>
            <a href="mailto:info@sewago.com" className="border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
              Send Email
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}