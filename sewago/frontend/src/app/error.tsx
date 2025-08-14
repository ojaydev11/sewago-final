"use client"

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold text-sg-text mb-2">Something went wrong</h1>
      <p className="text-sg-text/70 mb-6">{error.message}</p>
      <button 
        onClick={reset} 
        className="bg-sg-primary text-white px-4 py-2 rounded-xl"
      >
        Try again
      </button>
    </div>
  )
}