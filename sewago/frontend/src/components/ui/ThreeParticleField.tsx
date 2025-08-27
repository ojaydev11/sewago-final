'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Particle system component
function Particles({ particleCount = 150, colors }: { particleCount?: number; colors?: string[] }) {
  const meshRef = useRef<THREE.Points>(null);

  // Generate particle positions
  const positions = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 20; // x
      positions[i + 1] = (Math.random() - 0.5) * 20; // y
      positions[i + 2] = (Math.random() - 0.5) * 20; // z
    }
    return positions;
  }, [particleCount]);

  // Generate particle colors
  const particleColors = useMemo(() => {
    const particleColors = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      const color = new THREE.Color();
      if (colors && colors.length > 0) {
        // Use provided colors
        const colorIndex = Math.floor((i / 3) % colors.length);
        color.set(colors[colorIndex]);
      } else {
        // Create a gradient from blue to purple to pink
        const hue = (i / (particleCount * 3)) * 0.3 + 0.55; // 0.55 to 0.85 (blue to purple)
        color.setHSL(hue, 0.7, 0.6);
      }
      particleColors[i] = color.r;
      particleColors[i + 1] = color.g;
      particleColors[i + 2] = color.b;
    }
    return particleColors;
  }, [particleCount, colors]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.05;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.03;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[particleColors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        transparent
        opacity={0.8}
        vertexColors
        blending={THREE.AdditiveBlending}
        sizeAttenuation={true}
      />
    </points>
  );
}

// Animated geometric wireframe
function WireframeGeometry() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.1;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.15;
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[2, 1]} />
      <meshBasicMaterial
        color="#3B82F6"
        wireframe
        transparent
        opacity={0.3}
      />
    </mesh>
  );
}

// Main particle field component
export default function ThreeParticleField({ 
  showWireframe = true,
  particleCount,
  colors
}: { 
  showWireframe?: boolean;
  particleCount?: number;
  colors?: string[];
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 75 }}
      style={{ background: 'transparent' }}
      gl={{ alpha: true, antialias: true }}
    >
      {/* Subtle ambient lighting */}
      <ambientLight intensity={0.3} />
      
      {/* Particle system */}
      <Particles particleCount={particleCount} colors={colors} />
      
      {/* Optional wireframe geometry */}
      {showWireframe && <WireframeGeometry />}
    </Canvas>
  );
}
