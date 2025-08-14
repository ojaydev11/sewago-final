import { Wrench, ShowerHead, Sparkles, GraduationCap } from 'lucide-react'
import ServiceCard from './ServiceCard'

export default function ServicesGrid() {
  const items = [
    { label: 'Electrician', icon: <Wrench size={20}/> },
    { label: 'Plumber', icon: <ShowerHead size={20}/> },
    { label: 'Cleaner', icon: <Sparkles size={20}/> },
    { label: 'Tutor', icon: <GraduationCap size={20}/> }
  ]
  
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <h2 className="text-2xl font-bold text-sg-text mb-6">Browse Services</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map(item => (
          <ServiceCard key={item.label} icon={item.icon} label={item.label}/>
        ))}
      </div>
    </section>
  )
}
