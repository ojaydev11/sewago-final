import { Search } from 'lucide-react'

export default function SearchBar() {
  return (
    <form role="search" className="mx-auto w-full max-w-3xl -mt-14">
      <label className="sr-only" htmlFor="q">Search for services</label>
      <div className="flex items-center gap-3 bg-white shadow-card rounded-2xl px-5 py-4">
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
