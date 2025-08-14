import { type ReactNode } from 'react'

export default function ServiceCard({icon, label}: {icon: ReactNode, label: string}) {
  return (
    <button className="w-full bg-white rounded-2xl shadow-card p-6 text-left hover:shadow-lg transition">
      <div className="h-10 w-10 rounded-xl bg-sg-sky1 grid place-items-center mb-4 text-sg-primary">
        {icon}
      </div>
      <div className="font-semibold text-sg-text">{label}</div>
    </button>
  )
}
