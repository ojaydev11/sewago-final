
import Link from 'next/link';

// Force dynamic rendering to prevent build-time issues
export const dynamic = "force-dynamic";

import { 
  HomeIcon,
  CheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  QuestionMarkCircleIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const features = [
  'Deep cleaning of all rooms',
  'Kitchen and bathroom sanitization',
  'Vacuum and mop all floors',
  'Dust furniture and surfaces',
  'Clean windows and mirrors',
  'Take out trash and recycling',
];

const faqs = [
  {
    question: 'How long does a typical cleaning take?',
    answer: 'A standard house cleaning takes 2-4 hours depending on the size of your home and level of cleaning required.',
  },
  {
    question: 'Do I need to provide cleaning supplies?',
    answer: 'No, our professional cleaners bring all necessary supplies and equipment.',
  },
  {
    question: 'Can I request specific cleaning tasks?',
    answer: 'Yes, you can customize your cleaning service to focus on specific areas or tasks.',
  },
  {
    question: 'Are your cleaners insured?',
    answer: 'Yes, all our cleaning professionals are fully insured and background-checked.',
  },
];

export default function HouseCleaningPage() {
  return (
    <div className="min-h-screen bg-white pt-16">
      {/* Hero Section */}
      <section className="section bg-slate-50">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center mb-4">
                <HomeIcon className="w-8 h-8 text-primary mr-3" />
                <span className="text-primary font-medium">Home Services</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
                Professional House Cleaning
              </h1>
              <p className="text-xl text-slate-600 mb-8">
                Professional, reliable house cleaning services for your home. 
                Our experienced cleaners ensure your space is spotless and sanitized.
              </p>
              <div className="flex items-center gap-6 mb-8">
                <div className="flex items-center">
                  <ClockIcon className="w-5 h-5 text-slate-500 mr-2" />
                  <span className="text-slate-600">2-4 hours</span>
                </div>
                <div className="flex items-center">
                  <CurrencyDollarIcon className="w-5 h-5 text-slate-500 mr-2" />
                  <span className="text-slate-600">From Rs. 500</span>
                </div>
                <div className="flex items-center">
                  <StarIcon className="w-5 h-5 text-saffron mr-2" />
                  <span className="text-slate-600">4.9/5 rating</span>
                </div>
              </div>
              <Link href="/book/house-cleaning" className="btn-primary text-lg px-8 py-4">
                Book Now
              </Link>
            </div>
            <div className="bg-primary/5 rounded-2xl p-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">500+</div>
                  <div className="text-slate-600">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">4.9</div>
                  <div className="text-slate-600">Average Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">24/7</div>
                  <div className="text-slate-600">Support</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">100%</div>
                  <div className="text-slate-600">Satisfaction</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included Section */}
      <section className="section">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
              What's Included
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
            Ready to Book Your Cleaning?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Get your home professionally cleaned by our trusted experts
          </p>
          <Link href="/book/house-cleaning" className="bg-white text-primary hover:bg-slate-100 px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
            Book Cleaning Service
          </Link>
        </div>
      </section>
    </div>
  );
}
