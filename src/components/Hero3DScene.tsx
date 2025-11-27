import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Float, MeshDistortMaterial, Sphere, Box, Torus } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

function AnimatedShapes() {
  const sphereRef = useRef<THREE.Mesh>(null);
  const boxRef = useRef<THREE.Mesh>(null);
  const torusRef = useRef<THREE.Mesh>(null);

  return (
    <>
      {/* Main floating sphere with distortion */}
      <Float speed={2} rotationIntensity={1} floatIntensity={2}>
        <Sphere ref={sphereRef} args={[1.5, 64, 64]} position={[0, 0, 0]}>
          <MeshDistortMaterial
            color="#8b5cf6"
            attach="material"
            distort={0.4}
            speed={2}
            roughness={0.2}
            metalness={0.8}
          />
        </Sphere>
      </Float>

      {/* Floating box */}
      <Float speed={1.5} rotationIntensity={2} floatIntensity={1.5}>
        <Box ref={boxRef} args={[1, 1, 1]} position={[-3, 1, -2]}>
          <meshStandardMaterial
            color="#06b6d4"
            metalness={0.6}
            roughness={0.3}
          />
        </Box>
      </Float>

      {/* Floating torus */}
      <Float speed={2.5} rotationIntensity={1.5} floatIntensity={2.5}>
        <Torus ref={torusRef} args={[1, 0.4, 16, 100]} position={[3, -1, -1]}>
          <meshStandardMaterial
            color="#ec4899"
            metalness={0.7}
            roughness={0.2}
          />
        </Torus>
      </Float>

      {/* Additional decorative spheres */}
      <Float speed={3} rotationIntensity={1} floatIntensity={3}>
        <Sphere args={[0.5, 32, 32]} position={[2, 2, -3]}>
          <meshStandardMaterial
            color="#f59e0b"
            metalness={0.5}
            roughness={0.4}
          />
        </Sphere>
      </Float>

      <Float speed={2.2} rotationIntensity={1} floatIntensity={2}>
        <Sphere args={[0.4, 32, 32]} position={[-2, -2, -2]}>
          <meshStandardMaterial
            color="#10b981"
            metalness={0.6}
            roughness={0.3}
          />
        </Sphere>
      </Float>
    </>
  );
}

export default function Hero3DScene() {
  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />
        
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#8b5cf6" />
        <pointLight position={[10, 10, 10]} intensity={0.3} color="#06b6d4" />
        <spotLight
          position={[0, 5, 10]}
          angle={0.3}
          penumbra={1}
          intensity={0.5}
          castShadow
        />

        {/* 3D Objects */}
        <AnimatedShapes />

        {/* Orbit Controls for interaction */}
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={5}
          maxDistance={15}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>

      {/* Gradient overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-background/20 to-transparent" />
      
      {/* Floating animation elements (same as before for consistency) */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-12 h-12 sm:w-16 sm:h-16 bg-primary/20 rounded-lg animate-[float_6s_ease-in-out_infinite] blur-xl" />
        <div className="absolute top-1/3 right-1/4 w-16 h-16 sm:w-20 sm:h-20 bg-primary-glow/20 rounded-full animate-[float_8s_ease-in-out_infinite] blur-xl" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-20 h-20 sm:w-24 sm:h-24 bg-accent/20 rounded-lg animate-[float_7s_ease-in-out_infinite] blur-xl" style={{ animationDelay: '2s' }} />
      </div>
    </div>
  );
}
