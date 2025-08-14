import Link from 'next/link'
import { Suspense } from 'react'

export default function Page({ searchParams }: { searchParams: { [k: string]: string } }) {
  const q = (searchParams?.query || '').toLowerCase()
  const all = [
    { id: 'svc-electrician', name: 'Electrician', slug: 'electrician', price: 'from Rs. 800' },
    { id: 'svc-plumber', name: 'Plumber', slug: 'plumber', price: 'from Rs. 700' },
    { id: 'svc-cleaner', name: 'Cleaner', slug: 'cleaner', price: 'from Rs. 600' },
    { id: 'svc-tutor', name: 'Tutor', slug: 'tutor', price: 'from Rs. 500' }
  ]
  const items = q ? all.filter(s => s.name.toLowerCase().includes(q) || s.slug.includes(q)) : all

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-sg-text mb-6">
        Services {q && <span className="text-sg-text/60">(search: {q})</span>}
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(s => (
          <div key={s.id} className="bg-white shadow-card rounded-2xl p-6">
            <div className="font-semibold text-sg-text">{s.name}</div>
            <div className="text-sg-text/70 text-sm mt-1">{s.price}</div>
            <a 
              href={`/services/${s.slug}/book`} 
              className="mt-4 inline-block bg-sg-primary text-white px-4 py-2 rounded-xl hover:bg-sg-primaryDark"
            >
              Book now
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}


