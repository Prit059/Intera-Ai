import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Text, Environment, ContactShadows } from '@react-three/drei';

const Robot = () => {
  const headRef = useRef();

  // Make the head look slightly towards the mouse
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(t / 2) * 0.2;
      headRef.current.rotation.x = Math.cos(t / 2) * 0.1;
    }
  });

  return (
    // Float makes the entire group hover up and down smoothly
    <Float speed={2} rotationIntensity={0.2} floatIntensity={1.5}>
      
      {/* --- THE BASE --- */}
      <mesh position={[0, -1.2, 0]}>
        <cylinderGeometry args={[1.8, 1.8, 0.4, 32]} />
        <meshStandardMaterial color="#111111" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, -0.9, 0]}>
        <boxGeometry args={[2.2, 0.3, 2.2]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* --- THE GLOWING NECK --- */}
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.8, 16]} />
        {/* Emissive makes it glow like a lightbulb */}
        <meshStandardMaterial color="#ea580c" emissive="#ea580c" emissiveIntensity={2} />
      </mesh>

      {/* --- THE HEAD & EYES --- */}
      <group ref={headRef} position={[0, 0.6, 0]}>
        {/* Head Box */}
        <mesh>
          <boxGeometry args={[1.8, 1.2, 1.4]} />
          {/* A bronze/gold metallic material */}
          <meshStandardMaterial color="#cc7700" metalness={0.7} roughness={0.2} />
        </mesh>

        {/* Left Eye */}
        <mesh position={[-0.4, 0, 0.71]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#ff1111" emissive="#ff1111" emissiveIntensity={4} />
        </mesh>

        {/* Right Eye */}
        <mesh position={[0.4, 0, 0.71]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#ff1111" emissive="#ff1111" emissiveIntensity={4} />
        </mesh>
      </group>

      {/* --- FLOATING TEXT: "Intera" --- */}
      <Text 
        position={[-2.8, 0.5, 0]} 
        fontSize={0.8} 
        color="#888888" 
        anchorX="center" 
        anchorY="middle"
      >
        Intera
      </Text>

      {/* --- FLOATING TEXT: "AI" --- */}
      <Text 
        position={[2.5, 0, 0]} 
        fontSize={1.2} 
        color="#ea580c" 
        anchorX="center" 
        anchorY="middle"
      >
        AI
      </Text>

    </Float>
  );
};

export default function RobotModel() {
  return (
    <div className="w-full h-full cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 0, 7], fov: 45 }}>
        {/* Lighting setup for that dramatic dark theme look */}
        <ambientLight intensity={0.2} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ea580c" />
        
        <Robot />
        
        {/* Adds realistic reflections to the metal */}
        <Environment preset="city" />
        
        {/* Adds a soft shadow underneath the robot on the "floor" */}
        <ContactShadows position={[0, -2.5, 0]} opacity={0.6} scale={10} blur={2.5} far={4} color="#ea580c" />
      </Canvas>
    </div>
  );
}