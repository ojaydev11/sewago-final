'use client';

import dynamic from 'next/dynamic';

// Dynamically import Three.js components to prevent SSR issues
const ThreeParticleField = dynamic(() => import('./ThreeParticleField'), { 
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 to-purple-50/20 animate-pulse" style={{ zIndex: -1 }} />
});

// Main particle field component
export function ParticleField({ 
  className = '',
  showWireframe = true,
  particleCount,
  colors
}: { 
  className?: string;
  showWireframe?: boolean;
  particleCount?: number;
  colors?: string[];
}) {
  return (
    <div className={`absolute inset-0 ${className}`} style={{ zIndex: -1 }}>
      <ThreeParticleField 
        showWireframe={showWireframe} 
        particleCount={particleCount}
        colors={colors}
      />
    </div>
  );
}

export default ParticleField;