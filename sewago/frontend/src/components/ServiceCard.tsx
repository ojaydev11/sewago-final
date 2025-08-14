import { type ReactNode } from 'react'

interface ServiceCardProps {
  icon: React.ReactNode;
  label: string;
  gradientClass?: string;
}

export default function ServiceCard({ icon, label, gradientClass = 'from-blue-600 to-purple-600' }: ServiceCardProps) {
  return (
    <div className='group relative'>
      {/* Background glow effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500`}></div>
      
      {/* Main card container with glassmorphism */}
      <div className='relative glass-card p-8 text-center transition-all duration-500 hover:scale-105 hover:bg-white/15 group-hover:border-white/40'>
        {/* Icon container with gradient background */}
        <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${gradientClass} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
          <div className='text-white text-3xl'>
            {icon}
          </div>
        </div>
        
        {/* Label with enhanced typography */}
        <h3 className='text-xl font-bold text-white mb-3 group-hover:text-blue-200 transition-colors duration-300'>
          {label}
        </h3>
        
        {/* Subtle description */}
        <p className='text-white/70 text-sm font-medium'>
          Professional {label.toLowerCase()} services
        </p>
        
        {/* Hover indicator */}
        <div className='absolute bottom-4 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
          <div className='w-8 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full'></div>
        </div>
        
        {/* Corner accent */}
        <div className='absolute top-4 right-4 w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-150'></div>
      </div>
    </div>
  );
}
