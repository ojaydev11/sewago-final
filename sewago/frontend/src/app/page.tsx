import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import SearchBar from '@/components/SearchBar'
import ServicesGrid from '@/components/ServicesGrid'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar/>
      <Hero/>
      <div className="relative z-10">
        <SearchBar/>
      </div>
      <ServicesGrid/>
    </main>
  )
}
