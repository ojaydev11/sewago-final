'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, MeshDistortMaterial, Sphere, Box } from '@react-three/drei';
import * as THREE from 'three';

// Floating geometric shape component
function GeometricShape() {
  const meshRef = useRef<THREE.Mesh>(null);
  const geometryRef = useRef<THREE.BoxGeometry>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.3;
    }
  });

  const gradientTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d')!;
    
    const gradient = context.createLinearGradient(0, 0, 256, 256);
    gradient.addColorStop(0, '#3B82F6'); // Blue
    gradient.addColorStop(0.5, '#8B5CF6'); // Purple
    gradient.addColorStop(1, '#EC4899'); // Pink
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, 256, 256);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);

  return (
    <Box ref={meshRef} args={[1, 1, 1]} position={[0, 0, 0]}>
      <MeshDistortMaterial
        map={gradientTexture}
        distort={0.4}
        speed={2}
        roughness={0.2}
        metalness={0.8}
      />
    </Box>
  );
}

// Floating spheres for ambient effect
function FloatingSpheres() {
  const sphereCount = 5;
  const spheres = useMemo(() => {
    return Array.from({ length: sphereCount }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
      ] as [number, number, number],
      scale: 0.1 + Math.random() * 0.3,
      color: `hsl(${200 + i * 30}, 70%, 60%)`,
    }));
  }, [sphereCount]);

  return (
    <>
      {spheres.map((sphere, i) => (
        <FloatingSphere key={i} {...sphere} />
      ))}
    </>
  );
}

function FloatingSphere({ 
  position, 
  scale, 
  color 
}: { 
  position: [number, number, number]; 
  scale: number; 
  color: string; 
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime + position[0]) * 0.001;
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.5;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <Sphere ref={meshRef} args={[scale]} position={position}>
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.6}
        roughness={0.3}
        metalness={0.7}
      />
    </Sphere>
  );
}

// Main 3D scene component
export default function FloatingGeometry({ className = '' }: { className?: string }) {
  return (
    <div className={`h-96 w-96 ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        {/* Lighting setup */}
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3B82F6" />
        <spotLight
          position={[0, 10, 0]}
          angle={0.3}
          intensity={1}
          color="#8B5CF6"
          castShadow
        />
        
        {/* 3D Objects */}
        <GeometricShape />
        <FloatingSpheres />
        
        {/* Controls (disabled for auto-rotation) */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}