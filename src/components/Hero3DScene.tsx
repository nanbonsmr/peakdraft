import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Float, Sparkles, Trail, Sphere, MeshDistortMaterial, Text } from '@react-three/drei';
import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';

// Holographic glitch text
function HolographicText({ 
  text, 
  position, 
  size = 0.6 
}: { 
  text: string; 
  position: [number, number, number]; 
  size?: number;
}) {
  const textRef = useRef<THREE.Mesh>(null);
  const [glitchOffset, setGlitchOffset] = useState({ x: 0, y: 0, z: 0 });
  const [colorShift, setColorShift] = useState(0);
  const [opacity, setOpacity] = useState(1);

  useFrame((state) => {
    if (textRef.current) {
      // Smooth rotation
      textRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
      
      // Random glitch effect
      if (Math.random() > 0.98) {
        setGlitchOffset({
          x: (Math.random() - 0.5) * 0.3,
          y: (Math.random() - 0.5) * 0.3,
          z: (Math.random() - 0.5) * 0.1
        });
        setOpacity(0.5 + Math.random() * 0.5);
        
        // Reset after short time
        setTimeout(() => {
          setGlitchOffset({ x: 0, y: 0, z: 0 });
          setOpacity(1);
        }, 50);
      }
      
      // Color shift for holographic effect
      setColorShift(state.clock.elapsedTime * 2);
    }
  });

  const holographicColor = new THREE.Color().setHSL(
    (Math.sin(colorShift) + 1) * 0.5 * 0.3 + 0.5, // Hue shift between cyan and purple
    0.8, 
    0.6
  );

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={1}>
      <Text
        ref={textRef}
        position={[
          position[0] + glitchOffset.x,
          position[1] + glitchOffset.y,
          position[2] + glitchOffset.z
        ]}
        fontSize={size}
        font="/fonts/helvetiker_bold.typeface.json"
        anchorX="center"
        anchorY="middle"
      >
        {text}
        <meshStandardMaterial
          color={holographicColor}
          emissive={holographicColor}
          emissiveIntensity={0.8}
          transparent
          opacity={opacity}
          metalness={1}
          roughness={0.1}
        />
      </Text>
      
      {/* Glitch shadow/duplicate effect */}
      <Text
        position={[
          position[0] + glitchOffset.x * 0.5 + 0.05,
          position[1] + glitchOffset.y * 0.5,
          position[2] + glitchOffset.z * 0.5 - 0.1
        ]}
        fontSize={size}
        font="/fonts/helvetiker_bold.typeface.json"
        anchorX="center"
        anchorY="middle"
      >
        {text}
        <meshStandardMaterial
          color="#06b6d4"
          emissive="#06b6d4"
          emissiveIntensity={0.5}
          transparent
          opacity={opacity * 0.3}
        />
      </Text>
      
      {/* Second glitch layer */}
      <Text
        position={[
          position[0] - glitchOffset.x * 0.5 - 0.05,
          position[1] - glitchOffset.y * 0.5,
          position[2] - glitchOffset.z * 0.5 - 0.1
        ]}
        fontSize={size}
        font="/fonts/helvetiker_bold.typeface.json"
        anchorX="center"
        anchorY="middle"
      >
        {text}
        <meshStandardMaterial
          color="#ec4899"
          emissive="#ec4899"
          emissiveIntensity={0.5}
          transparent
          opacity={opacity * 0.3}
        />
      </Text>
    </Float>
  );
}

// Content block
function ContentBlock({ position, color }: { position: [number, number, number]; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
      meshRef.current.rotation.y = Math.cos(state.clock.elapsedTime * 0.3) * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={2}>
      <mesh ref={meshRef} position={position}>
        <boxGeometry args={[1, 1.4, 0.2]} />
        <meshStandardMaterial
          color={color}
          metalness={0.8}
          roughness={0.2}
          emissive={color}
          emissiveIntensity={0.3}
        />
      </mesh>
    </Float>
  );
}

// Pulsing energy sphere
function EnergySphere({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.8, 32, 32]} />
      <meshStandardMaterial
        color="#a78bfa"
        emissive="#8b5cf6"
        emissiveIntensity={1}
        transparent
        opacity={0.7}
      />
    </mesh>
  );
}

// Orbiting particles
function OrbitingParticle({ radius, speed, color }: { radius: number; speed: number; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      const angle = state.clock.elapsedTime * speed;
      meshRef.current.position.x = Math.cos(angle) * radius;
      meshRef.current.position.z = Math.sin(angle) * radius;
      meshRef.current.position.y = Math.sin(angle * 2) * 0.5;
    }
  });

  return (
    <Trail width={2} length={8} color={color} attenuation={(t) => t * t}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1}
        />
      </mesh>
    </Trail>
  );
}

// Floating ring
function GlowingRing({ position, color }: { position: [number, number, number]; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.015;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1.5}>
      <mesh ref={meshRef} position={position}>
        <torusGeometry args={[1.2, 0.15, 16, 100]} />
        <meshStandardMaterial
          color={color}
          metalness={0.9}
          roughness={0.1}
          emissive={color}
          emissiveIntensity={0.5}
        />
      </mesh>
    </Float>
  );
}

// Distorted sphere (main focal point)
function MainSphere() {
  return (
    <Float speed={1} rotationIntensity={0.5} floatIntensity={1}>
      <Sphere args={[1.5, 64, 64]}>
        <MeshDistortMaterial
          color="#8b5cf6"
          attach="material"
          distort={0.5}
          speed={3}
          roughness={0.1}
          metalness={0.9}
          emissive="#a78bfa"
          emissiveIntensity={0.3}
        />
      </Sphere>
    </Float>
  );
}

function AbstractContentScene() {
  return (
    <>
      {/* Main distorted sphere */}
      <MainSphere />

      {/* Holographic glitch text */}
      <HolographicText text="AI" position={[-2.5, 2, -2]} size={0.8} />
      <HolographicText text="WRITE" position={[2.5, 1.5, -2.5]} size={0.6} />
      <HolographicText text="CREATE" position={[-3, -1, -1.5]} size={0.5} />
      <HolographicText text="CONTENT" position={[2, -1.5, -2]} size={0.5} />
      <HolographicText text="GENERATE" position={[0, 2.5, -3]} size={0.4} />

      {/* Content blocks */}
      <ContentBlock position={[-2.5, 0, -2]} color="#06b6d4" />
      <ContentBlock position={[2.5, -0.5, -2]} color="#ec4899" />
      <ContentBlock position={[-1.5, -2, -1]} color="#f59e0b" />

      {/* Energy spheres */}
      <EnergySphere position={[0, 0, 0]} />
      <EnergySphere position={[3, 0.5, -3]} />

      {/* Glowing rings */}
      <GlowingRing position={[0, 0, 0]} color="#8b5cf6" />
      <GlowingRing position={[-3, 1, -2]} color="#06b6d4" />

      {/* Orbiting particles */}
      <OrbitingParticle radius={3} speed={0.5} color="#ec4899" />
      <OrbitingParticle radius={3.5} speed={-0.7} color="#06b6d4" />
      <OrbitingParticle radius={2.5} speed={0.9} color="#f59e0b" />
      <OrbitingParticle radius={4} speed={-0.4} color="#10b981" />

      {/* Sparkles for magical effect */}
      <Sparkles
        count={80}
        scale={[10, 10, 10]}
        size={2}
        speed={0.3}
        opacity={0.8}
        color="#8b5cf6"
      />

      {/* Additional ambient sparkles */}
      <Sparkles
        count={40}
        scale={[8, 8, 8]}
        size={4}
        speed={0.5}
        opacity={0.4}
        color="#06b6d4"
      />
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

        {/* Abstract Content Scene */}
        <AbstractContentScene />

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
