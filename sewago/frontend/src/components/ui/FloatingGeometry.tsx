'use client';

import { useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Three.js components to prevent SSR issues
const ThreeComponents = dynamic(() => import('./ThreeFloatingGeometry'), { 
  ssr: false,
  loading: () => <div className="h-96 w-96 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg animate-pulse" />
});

// Main 3D scene component
export default function FloatingGeometry({ className = '' }: { className?: string }) {
  return (
    <div className={`h-96 w-96 ${className}`}>
      <ThreeComponents />
    </div>
  );
}