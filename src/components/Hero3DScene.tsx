import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Float, Text3D, Center, Sparkles } from '@react-three/drei';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

// Floating document/paper shape
function Document({ position }: { position: [number, number, number] }) {
  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1.5}>
      <mesh position={position} rotation={[0, 0, 0.1]}>
        <boxGeometry args={[1.2, 1.6, 0.05]} />
        <meshStandardMaterial 
          color="#ffffff"
          metalness={0.1}
          roughness={0.3}
          emissive="#8b5cf6"
          emissiveIntensity={0.1}
        />
        {/* Lines on document */}
        <mesh position={[0, 0.3, 0.03]}>
          <boxGeometry args={[0.8, 0.05, 0.01]} />
          <meshStandardMaterial color="#8b5cf6" />
        </mesh>
        <mesh position={[0, 0.1, 0.03]}>
          <boxGeometry args={[0.8, 0.05, 0.01]} />
          <meshStandardMaterial color="#8b5cf6" />
        </mesh>
        <mesh position={[0, -0.1, 0.03]}>
          <boxGeometry args={[0.6, 0.05, 0.01]} />
          <meshStandardMaterial color="#06b6d4" />
        </mesh>
      </mesh>
    </Float>
  );
}

// Pen/Writing tool
function Pen({ position }: { position: [number, number, number] }) {
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <group position={position} rotation={[0, 0, Math.PI / 4]}>
        {/* Pen body */}
        <mesh>
          <cylinderGeometry args={[0.08, 0.08, 2, 16]} />
          <meshStandardMaterial 
            color="#8b5cf6"
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
        {/* Pen tip */}
        <mesh position={[0, -1.1, 0]}>
          <coneGeometry args={[0.08, 0.3, 16]} />
          <meshStandardMaterial 
            color="#ec4899"
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
      </group>
    </Float>
  );
}

// AI Brain/Neural network representation
function AIBrain({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <Float speed={1.8} rotationIntensity={0.5} floatIntensity={1.5}>
      <mesh ref={meshRef} position={position}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial 
          color="#8b5cf6"
          wireframe={true}
          emissive="#8b5cf6"
          emissiveIntensity={0.5}
        />
      </mesh>
      {/* Inner glowing core */}
      <mesh position={position}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial 
          color="#8b5cf6"
          emissive="#a78bfa"
          emissiveIntensity={1}
          transparent
          opacity={0.6}
        />
      </mesh>
    </Float>
  );
}

// Floating letters
function FloatingLetter({ letter, position, color }: { letter: string; position: [number, number, number]; color: string }) {
  return (
    <Float speed={2.5} rotationIntensity={1} floatIntensity={2}>
      <Center position={position}>
        <Text3D
          font="/fonts/helvetiker_regular.typeface.json"
          size={0.5}
          height={0.1}
          curveSegments={12}
        >
          {letter}
          <meshStandardMaterial 
            color={color}
            metalness={0.6}
            roughness={0.3}
            emissive={color}
            emissiveIntensity={0.3}
          />
        </Text3D>
      </Center>
    </Float>
  );
}

function ContentCreationScene() {
  // Generate multiple sparkles for AI magic effect
  const particlePositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    for (let i = 0; i < 100; i++) {
      positions.push([
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      ]);
    }
    return positions;
  }, []);

  return (
    <>
      {/* AI Brain - Center piece */}
      <AIBrain position={[0, 0, 0]} />

      {/* Documents representing content */}
      <Document position={[-2.5, 1, -2]} />
      <Document position={[2.5, -0.5, -1.5]} />

      {/* Writing tools */}
      <Pen position={[-3, -1.5, -1]} />
      
      {/* Floating letters spelling "AI" */}
      <FloatingLetter letter="A" position={[-1.5, 2, -2]} color="#06b6d4" />
      <FloatingLetter letter="I" position={[1.5, 2.2, -2]} color="#ec4899" />

      {/* Magic sparkles for AI effect */}
      <Sparkles
        count={50}
        scale={[8, 8, 8]}
        size={3}
        speed={0.4}
        opacity={0.6}
        color="#8b5cf6"
      />

      {/* Additional small floating elements */}
      <Float speed={3} rotationIntensity={1} floatIntensity={2}>
        <mesh position={[2, 1.5, -3]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial 
            color="#f59e0b"
            emissive="#f59e0b"
            emissiveIntensity={0.5}
          />
        </mesh>
      </Float>

      <Float speed={2.5} rotationIntensity={1} floatIntensity={2.5}>
        <mesh position={[-2, -2, -2.5]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial 
            color="#10b981"
            emissive="#10b981"
            emissiveIntensity={0.5}
          />
        </mesh>
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

        {/* 3D Content Creation Scene */}
        <ContentCreationScene />

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
