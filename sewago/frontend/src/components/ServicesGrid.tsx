import Link from 'next/link'
import ServiceCard from './ServiceCard'
import { Wrench, ShowerHead, Sparkles, GraduationCap } from 'lucide-react'

const items = [
  { label: 'Electrician', slug: 'electrician', icon: <Wrench size={20}/> },
  { label: 'Plumber', slug: 'plumber', icon: <ShowerHead size={20}/> },
  { label: 'Cleaner', slug: 'cleaner', icon: <Sparkles size={20}/> },
  { label: 'Tutor', slug: 'tutor', icon: <GraduationCap size={20}/> }
]

export default function ServicesGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <h2 className="text-2xl font-bold text-sg-text mb-6">Browse Services</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map(item => (
          <Link key={item.slug} href={`/services/${item.slug}/book`} className="block">
            <ServiceCard icon={item.icon} label={item.label}/>
          </Link>
        ))}
      </div>
    </section>
  )
}
