
import Link from 'next/link';
import { 
  WrenchScrewdriverIcon,
  CheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  QuestionMarkCircleIcon,
  StarIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const features = [
  'Electrical repairs and troubleshooting',
  'Outlet and switch installations',
  'Ceiling fan installation',
  'Light fixture installation',
  'Circuit breaker repairs',
  'Electrical safety inspections',
];

const faqs = [
  {
    question: 'Are your electricians licensed and certified?',
    answer: 'Yes, all our electricians are fully licensed, certified, and experienced professionals.',
  },
  {
    question: 'Do you provide emergency electrical services?',
    answer: 'Yes, we offer 24/7 emergency electrical services for urgent repairs.',
  },
  {
    question: 'What types of electrical work do you handle?',
    answer: 'We handle residential electrical repairs, installations, maintenance, and safety inspections.',
  },
  {
    question: 'Do you provide warranties on your work?',
    answer: 'Yes, we provide warranties on all our electrical work and installations.',
  },
];

export default function ElectricalWorkPage() {
  return (
    <div className="min-h-screen bg-white pt-16">
      {/* Hero Section */}
      <section className="section bg-slate-50">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center mb-4">
                <WrenchScrewdriverIcon className="w-8 h-8 text-primary mr-3" />
                <span className="text-primary font-medium">Professional Services</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
                Expert Electrical Work
              </h1>
              <p className="text-xl text-slate-600 mb-8">
                Professional electrical services for your home and office. 
                Our certified electricians ensure safe and reliable electrical solutions.
              </p>
              <div className="flex items-center gap-6 mb-8">
                <div className="flex items-center">
                  <ClockIcon className="w-5 h-5 text-slate-500 mr-2" />
                  <span className="text-slate-600">1-3 hours</span>
                </div>
                <div className="flex items-center">
                  <CurrencyDollarIcon className="w-5 h-5 text-slate-500 mr-2" />
                  <span className="text-slate-600">From Rs. 800</span>
                </div>
                <div className="flex items-center">
                  <StarIcon className="w-5 h-5 text-saffron mr-2" />
                  <span className="text-slate-600">4.8/5 rating</span>
                </div>
              </div>
              <Link href="/book/electrical-work" className="btn-primary text-lg px-8 py-4">
                Book Electrician
              </Link>
            </div>
            <div className="bg-primary/5 rounded-2xl p-8">
              <div className="text-center mb-6">
                <ShieldCheckIcon className="w-16 h-16 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Licensed & Insured
                </h3>
                <p className="text-slate-600">
                  All our electricians are fully certified and insured for your peace of mind
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">300+</div>
                  <div className="text-slate-600 text-sm">Projects Done</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">24/7</div>
                  <div className="text-slate-600 text-sm">Emergency</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Included */}
      <section className="section">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
              Electrical Services We Provide
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center">
                  <CheckIcon className="w-5 h-5 text-jade mr-3 flex-shrink-0" />
                  <span className="text-slate-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section bg-slate-50">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <QuestionMarkCircleIcon className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Frequently Asked Questions
              </h2>
            </div>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="card p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-slate-600">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-primary text-white">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-6">
            Need Electrical Work Done?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Get professional electrical services from certified experts
          </p>
          <Link href="/book/electrical-work" className="bg-white text-primary hover:bg-slate-100 px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
            Book Electrician Now
          </Link>
        </div>
      </section>
    </div>
  );
}
