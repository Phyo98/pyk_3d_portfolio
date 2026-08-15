import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type Props = { onSelect: () => void; isActive: boolean };

const GONDOLA_COUNT = 6;
const RADIUS = 0.95;

export default function FerrisWheel({ onSelect, isActive }: Props) {
  const [hovered, setHovered] = useState(false);
  const wheelRef = useRef<THREE.Group>(null);

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'default';
    return () => { document.body.style.cursor = 'default'; };
  }, [hovered]);

  useFrame((_, delta) => {
    if (wheelRef.current) wheelRef.current.rotation.z += delta * 0.35;
  });

  const glow = (hovered || isActive) ? 4.5 : 1.6;

  return (
    <group
      position={[0.0, 0, -3.5]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={onSelect}
    >
      {/* Base platform */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[1.5, 0.1, 0.35]} />
        <meshStandardMaterial color="#120820" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* Left support leg */}
      <mesh position={[-0.62, 0.93, 0]} rotation={[0, 0, Math.PI * 0.09]}>
        <cylinderGeometry args={[0.038, 0.05, 1.86, 6]} />
        <meshStandardMaterial color="#1a0a2a" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Right support leg */}
      <mesh position={[0.62, 0.93, 0]} rotation={[0, 0, -Math.PI * 0.09]}>
        <cylinderGeometry args={[0.038, 0.05, 1.86, 6]} />
        <meshStandardMaterial color="#1a0a2a" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Center axle hub */}
      <mesh position={[0, 1.82, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.22, 10]} />
        <meshStandardMaterial
          color="#cc88ff"
          emissive="#8800ff"
          emissiveIntensity={glow * 1.2}
          metalness={0.3}
          roughness={0.2}
        />
      </mesh>

      {/* Rotating wheel */}
      <group ref={wheelRef} position={[0, 1.82, 0]}>
        {/* Outer rim */}
        <mesh>
          <torusGeometry args={[RADIUS, 0.042, 8, 40]} />
          <meshStandardMaterial
            color="#cc88ff"
            emissive="#9944ff"
            emissiveIntensity={glow}
            metalness={0.3}
            roughness={0.2}
          />
        </mesh>

        {/* Inner hub ring */}
        <mesh>
          <torusGeometry args={[RADIUS * 0.32, 0.028, 8, 16]} />
          <meshStandardMaterial
            color="#ff88cc"
            emissive="#ff44aa"
            emissiveIntensity={glow * 0.8}
          />
        </mesh>

        {/* Spokes */}
        {Array.from({ length: GONDOLA_COUNT }).map((_, i) => {
          const angle = (i / GONDOLA_COUNT) * Math.PI * 2;
          return (
            <mesh key={`spoke-${i}`} rotation={[0, 0, angle]}>
              <boxGeometry args={[RADIUS * 1.85, 0.022, 0.022]} />
              <meshStandardMaterial
                color="#aa66ff"
                emissive="#7722cc"
                emissiveIntensity={glow * 0.5}
              />
            </mesh>
          );
        })}

        {/* Gondolas */}
        {Array.from({ length: GONDOLA_COUNT }).map((_, i) => {
          const angle = (i / GONDOLA_COUNT) * Math.PI * 2;
          const x = Math.sin(angle) * RADIUS;
          const y = Math.cos(angle) * RADIUS;
          return (
            <group key={`gondola-${i}`} position={[x, y, 0]}>
              <mesh>
                <boxGeometry args={[0.19, 0.14, 0.13]} />
                <meshStandardMaterial
                  color="#2a0a3a"
                  emissive="#550088"
                  emissiveIntensity={glow * 0.45}
                  metalness={0.3}
                />
              </mesh>
              {/* Gondola window */}
              <mesh position={[0, 0, 0.068]}>
                <planeGeometry args={[0.1, 0.08]} />
                <meshStandardMaterial
                  color="#ffaaff"
                  emissive="#dd88ff"
                  emissiveIntensity={glow}
                  transparent
                  opacity={0.9}
                  depthWrite={false}
                  side={THREE.DoubleSide}
                />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* Ground glow */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.75, 24]} />
        <meshStandardMaterial
          color="#9922ff"
          emissive="#9922ff"
          emissiveIntensity={0.3}
          transparent
          opacity={0.35}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
