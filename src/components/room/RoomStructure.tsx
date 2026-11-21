import { useTexture } from '@react-three/drei';
import { Suspense, useEffect } from 'react';
import * as THREE from 'three';
import galaxyImg from '../../assets/ceiling/galaxy.webp';
import Flooring from './Flooring';

/* the galaxy picture is cropped to the ceiling's 14 × 18 proportions */
function GalaxyCeiling() {
  const galaxy = useTexture(galaxyImg);
  useEffect(() => {
    galaxy.colorSpace = THREE.SRGBColorSpace;
    galaxy.anisotropy = 8;
    galaxy.needsUpdate = true;
  }, [galaxy]);
  return (
    <mesh position={[0, 8, 3]} rotation={[Math.PI / 2, 0, 0]}>
      <planeGeometry args={[14, 18]} />
      {/* unlit so the stars read at night; dimmed a touch so the bright core glows rather than blows out */}
      <meshBasicMaterial map={galaxy} color="#c4bcd4" />
    </mesh>
  );
}

const WALL  = '#080015';
const WALL2 = '#0a0018';

export default function RoomStructure() {
  return (
    <group>
      {/* ── Back wall ── */}
      <mesh position={[0, 4, -6]} receiveShadow>
        <planeGeometry args={[14, 8]} />
        <meshStandardMaterial color={WALL} roughness={0.92} metalness={0.06} />
      </mesh>

      {/* Front wall closes the room for a full 360-degree interior view. */}
      <mesh position={[0, 4, 12]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[14, 8]} />
        <meshStandardMaterial color={WALL2} roughness={0.92} metalness={0.06} />
      </mesh>

      {/* ── Left wall ── */}
      <mesh position={[-7, 4, 3]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[18, 8]} />
        <meshStandardMaterial color={WALL2} roughness={0.92} metalness={0.06} />
      </mesh>

      {/* ── Right wall ── */}
      <mesh position={[7, 4, 3]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[18, 8]} />
        <meshStandardMaterial color={WALL2} roughness={0.92} metalness={0.06} />
      </mesh>

      {/* ── Floor, baseboards and rug ── */}
      <Flooring />

      {/* ── Ceiling: galaxy sky; loads its picture, so it suspends on its own ── */}
      <Suspense fallback={null}>
        <GalaxyCeiling />
      </Suspense>

      {/* ── LED strip — back ceiling edge ── */}
      <mesh position={[0, 7.88, -5.92]}>
        <boxGeometry args={[14, 0.07, 0.07]} />
        <meshStandardMaterial color="#7b00ff" emissive="#7b00ff" emissiveIntensity={4} />
      </mesh>

      {/* ── LED strip — left ceiling edge ── */}
      <mesh position={[-6.92, 7.88, 3]}>
        <boxGeometry args={[0.07, 0.07, 18]} />
        <meshStandardMaterial color="#7b00ff" emissive="#7b00ff" emissiveIntensity={4} />
      </mesh>

      {/* ── LED strip — right ceiling edge ── */}
      <mesh position={[6.92, 7.88, 3]}>
        <boxGeometry args={[0.07, 0.07, 18]} />
        <meshStandardMaterial color="#7b00ff" emissive="#7b00ff" emissiveIntensity={4} />
      </mesh>

      {/* ── LED strip — front ceiling edge ── */}
      <mesh position={[0, 7.88, 11.92]}>
        <boxGeometry args={[14, 0.07, 0.07]} />
        <meshStandardMaterial color="#7b00ff" emissive="#7b00ff" emissiveIntensity={4} />
      </mesh>

    </group>
  );
}
