'use client'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

export default function SearchBar() {
  const r = useRouter()
  
  return (
    <form 
      role="search" 
      className="mx-auto w-full max-w-3xl -mt-14" 
      onSubmit={(e) => {
        e.preventDefault()
        const q = new FormData(e.currentTarget).get('q') || ''
        r.push(`/services?query=${encodeURIComponent(String(q))}`)
      }}
    >
      <label className="sr-only" htmlFor="q">Search for services</label>
      <div className="flex items-center gap-3 bg-white shadow-[0_6px_24px_rgba(15,43,70,0.08)] rounded-2xl px-5 py-4">
        <Search className="text-sg-primary" size={20}/>
        <input 
          id="q" 
          name="q" 
          placeholder="Search for services" 
          className="w-full outline-none text-base placeholder:text-sg-text/50"
        />
      </div>
    </form>
  )
}
