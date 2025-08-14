import Image from 'next/image'

export default function Hero() {
  return (
    <section className='bg-gradient-to-b from-sg-sky1 to-white'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 pb-24 grid lg:grid-cols-2 gap-8 items-center'>
        <div className='text-center lg:text-left'>
          <h1 className='text-5xl sm:text-6xl font-extrabold text-sg-text leading-tight'>Namaste!</h1>
          <p className='mt-3 text-xl text-sg-text/80'>How can we assist you?</p>
        </div>
        <div className='hidden lg:block'>
          <Image 
            src='/hero-nepal.svg' 
            alt='Nepal skyline with stupa' 
            width={600} 
            height={280} 
            priority 
          />
        </div>
      </div>
    </section>
  )
}
