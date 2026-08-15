import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Open-area waypoints avoiding the bed (left) and desk (right)
const WAYPOINTS: [number, number, number][] = [
  [  0,   0,  4.2 ],
  [ -1.5, 0,  3   ],
  [ -1,   0,  0.8 ],
  [  0,   0, -0.2 ],
  [  1,   0,  0.8 ],
  [  1.5, 0,  3   ],
  [  0.5, 0,  4.5 ],
  [ -0.5, 0,  2   ],
];

const WALK_SPEED   = 1.3;
const ARRIVE_DIST  = 0.25;
const WAVE_DURATION = 3.0;

const SKIN  = '#ffccaa';
const HAIR  = '#180a2e';
const SHIRT = '#f0f0f8';
const SKIRT = '#1e1060';
const SHOE  = '#111018';
const PINK  = '#ff4488';

export default function NpcCharacter() {
  const groupRef     = useRef<THREE.Group>(null);
  const leftLegRef   = useRef<THREE.Group>(null);
  const rightLegRef  = useRef<THREE.Group>(null);
  const leftArmRef   = useRef<THREE.Group>(null);
  const rightArmRef  = useRef<THREE.Group>(null);

  const wpIdx     = useRef(0);
  const pos       = useRef(new THREE.Vector3(0, 0, 4.2));
  const isWaving  = useRef(false);
  const waveTimer = useRef(0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'default';
    return () => { document.body.style.cursor = 'default'; };
  }, [hovered]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    const target = new THREE.Vector3(...WAYPOINTS[wpIdx.current]);
    const dir    = target.clone().sub(pos.current);
    const dist   = dir.length();

    if (dist < ARRIVE_DIST) {
      wpIdx.current = (wpIdx.current + 1) % WAYPOINTS.length;
    } else {
      dir.normalize();
      pos.current.addScaledVector(dir, Math.min(WALK_SPEED * delta, dist));
      groupRef.current.rotation.y = Math.atan2(dir.x, dir.z);
    }

    groupRef.current.position.set(pos.current.x, Math.abs(Math.sin(t * 6)) * 0.035, pos.current.z);

    // Advance wave timer
    if (isWaving.current) {
      waveTimer.current += delta;
      if (waveTimer.current >= WAVE_DURATION) {
        isWaving.current  = false;
        waveTimer.current = 0;
      }
    }

    const swing = Math.sin(t * 6) * 0.45;
    if (leftLegRef.current)  leftLegRef.current.rotation.x  =  swing;
    if (rightLegRef.current) rightLegRef.current.rotation.x = -swing;
    if (leftArmRef.current)  leftArmRef.current.rotation.x  = -swing * 0.5;

    if (isWaving.current && rightArmRef.current) {
      // Raise arm up and wave side-to-side
      rightArmRef.current.rotation.x = -1.65;
      rightArmRef.current.rotation.z = Math.sin(t * 9) * 0.38;
    } else if (rightArmRef.current) {
      rightArmRef.current.rotation.x = swing * 0.5;
      rightArmRef.current.rotation.z = 0;
    }
  });

  return (
    <group
      ref={groupRef}
      position={[0, 0, 4.2]}
      onClick={() => { isWaving.current = true; waveTimer.current = 0; }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Floor shadow */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.22, 16]} />
        <meshStandardMaterial color="#000" transparent opacity={0.18} depthWrite={false} />
      </mesh>

      {/* ── Legs ── */}
      <group ref={leftLegRef} position={[-0.075, 0.52, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.1, 0.26, 0.1]} />
          <meshStandardMaterial color={SKIRT} roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.24, 0.015]} castShadow>
          <boxGeometry args={[0.09, 0.24, 0.09]} />
          <meshStandardMaterial color={SKIN} roughness={0.75} />
        </mesh>
        <mesh position={[0, -0.39, 0.03]} castShadow>
          <boxGeometry args={[0.1, 0.07, 0.15]} />
          <meshStandardMaterial color={SHOE} roughness={0.6} />
        </mesh>
      </group>

      <group ref={rightLegRef} position={[0.075, 0.52, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.1, 0.26, 0.1]} />
          <meshStandardMaterial color={SKIRT} roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.24, 0.015]} castShadow>
          <boxGeometry args={[0.09, 0.24, 0.09]} />
          <meshStandardMaterial color={SKIN} roughness={0.75} />
        </mesh>
        <mesh position={[0, -0.39, 0.03]} castShadow>
          <boxGeometry args={[0.1, 0.07, 0.15]} />
          <meshStandardMaterial color={SHOE} roughness={0.6} />
        </mesh>
      </group>

      {/* ── Skirt ── */}
      <mesh position={[0, 0.72, 0]} castShadow>
        <boxGeometry args={[0.3, 0.22, 0.21]} />
        <meshStandardMaterial color={SKIRT} roughness={0.8} />
      </mesh>

      {/* ── Torso ── */}
      <mesh position={[0, 1.0, 0]} castShadow>
        <boxGeometry args={[0.27, 0.34, 0.18]} />
        <meshStandardMaterial color={SHIRT} roughness={0.7} />
      </mesh>

      {/* Ribbon / bow */}
      <mesh position={[0, 1.02, 0.095]}>
        <boxGeometry args={[0.09, 0.055, 0.01]} />
        <meshStandardMaterial color={PINK} emissive={PINK} emissiveIntensity={0.5} />
      </mesh>

      {/* ── Arms ── */}
      <group ref={leftArmRef} position={[-0.185, 1.04, 0]}>
        <mesh position={[0, -0.1, 0]} castShadow>
          <boxGeometry args={[0.08, 0.28, 0.09]} />
          <meshStandardMaterial color={SHIRT} roughness={0.7} />
        </mesh>
        <mesh position={[0, -0.28, 0]}>
          <sphereGeometry args={[0.052, 7, 7]} />
          <meshStandardMaterial color={SKIN} roughness={0.75} />
        </mesh>
      </group>

      <group ref={rightArmRef} position={[0.185, 1.04, 0]}>
        <mesh position={[0, -0.1, 0]} castShadow>
          <boxGeometry args={[0.08, 0.28, 0.09]} />
          <meshStandardMaterial color={SHIRT} roughness={0.7} />
        </mesh>
        <mesh position={[0, -0.28, 0]}>
          <sphereGeometry args={[0.052, 7, 7]} />
          <meshStandardMaterial color={SKIN} roughness={0.75} />
        </mesh>
      </group>

      {/* ── Neck ── */}
      <mesh position={[0, 1.21, 0]}>
        <cylinderGeometry args={[0.052, 0.052, 0.1, 8]} />
        <meshStandardMaterial color={SKIN} roughness={0.75} />
      </mesh>

      {/* ── Head ── */}
      <mesh position={[0, 1.4, 0]} castShadow>
        <sphereGeometry args={[0.185, 12, 12]} />
        <meshStandardMaterial color={SKIN} roughness={0.72} />
      </mesh>

      {/* Hair cap */}
      <mesh position={[0, 1.46, -0.01]}>
        <sphereGeometry args={[0.2, 12, 12]} />
        <meshStandardMaterial color={HAIR} roughness={0.85} />
      </mesh>

      {/* Fringe */}
      <mesh position={[0, 1.4, 0.155]}>
        <boxGeometry args={[0.32, 0.13, 0.06]} />
        <meshStandardMaterial color={HAIR} roughness={0.85} />
      </mesh>

      {/* Side locks */}
      <mesh position={[-0.185, 1.3, 0.04]} rotation={[0, 0, 0.28]}>
        <boxGeometry args={[0.07, 0.3, 0.07]} />
        <meshStandardMaterial color={HAIR} roughness={0.85} />
      </mesh>
      <mesh position={[0.185, 1.3, 0.04]} rotation={[0, 0, -0.28]}>
        <boxGeometry args={[0.07, 0.3, 0.07]} />
        <meshStandardMaterial color={HAIR} roughness={0.85} />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.068, 1.4, 0.18]}>
        <planeGeometry args={[0.065, 0.055]} />
        <meshStandardMaterial color="#5533cc" emissive="#5533cc" emissiveIntensity={1.2} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0.068, 1.4, 0.18]}>
        <planeGeometry args={[0.065, 0.055]} />
        <meshStandardMaterial color="#5533cc" emissive="#5533cc" emissiveIntensity={1.2} side={THREE.DoubleSide} />
      </mesh>

      {/* Blush */}
      <mesh position={[-0.108, 1.365, 0.178]}>
        <planeGeometry args={[0.058, 0.022]} />
        <meshStandardMaterial color="#ff9999" transparent opacity={0.55} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh position={[0.108, 1.365, 0.178]}>
        <planeGeometry args={[0.058, 0.022]} />
        <meshStandardMaterial color="#ff9999" transparent opacity={0.55} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
}
