import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const CANOPY_NODES: [number, number, number][] = [
  [ 0,    4.4,  0   ],
  [-0.55, 4.1,  0.3 ],
  [ 0.65, 4.2, -0.2 ],
  [-0.28, 4.7, -0.38],
  [ 0.32, 4.6,  0.48],
  [-0.72, 4.5, -0.28],
  [ 0,    5.0,  0.18],
  [ 0.5,  4.35, 0.55],
  [-0.4,  4.85, 0.2 ],
];

const CANOPY_SCALES = [0.58, 0.52, 0.54, 0.50, 0.48, 0.55, 0.46, 0.50, 0.52];

type Props = { onSelect: () => void; isActive: boolean };

export default function SakuraTree({ onSelect, isActive }: Props) {
  const [hovered, setHovered] = useState(false);
  const canopyRef = useRef<THREE.Group>(null);
  const petalRef  = useRef<THREE.Points>(null);

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'default';
    return () => { document.body.style.cursor = 'default'; };
  }, [hovered]);

  // Gentle sway animation
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (canopyRef.current) {
      canopyRef.current.rotation.y = Math.sin(t * 0.28) * 0.04;
      canopyRef.current.rotation.z = Math.sin(t * 0.18) * 0.015;
    }
    if (petalRef.current) {
      const pos = petalRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < pos.length; i += 3) {
        pos[i + 1] -= 0.006 + (i % 7) * 0.001;
        pos[i    ] += Math.sin(t + i) * 0.004;
        if (pos[i + 1] < -0.5) pos[i + 1] = 3.5;
      }
      petalRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const glow = (hovered || isActive) ? 5.5 : 1.5;

  // Build petal particle geometry (static, computed once)
  const petalGeo = (() => {
    const g = new THREE.BufferGeometry();
    const n = 80;
    const p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      p[i * 3    ] = (Math.random() - 0.5) * 2.8;
      p[i * 3 + 1] = Math.random() * 3.5;
      p[i * 3 + 2] = (Math.random() - 0.5) * 2.8;
    }
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    return g;
  })();

  return (
    <group
      position={[-5.5, 0, -4.5]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={onSelect}
    >
      {/* ── Trunk ── */}
      <mesh position={[0, 2.25, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.22, 4.5, 9]} />
        <meshStandardMaterial color="#22100a" roughness={0.92} metalness={0.04} />
      </mesh>

      {/* ── Branches ── */}
      <mesh position={[-0.38, 3.2, 0.1]} rotation={[0.1, 0, Math.PI * 0.14]} castShadow>
        <cylinderGeometry args={[0.055, 0.095, 1.5, 6]} />
        <meshStandardMaterial color="#22100a" roughness={0.92} />
      </mesh>
      <mesh position={[0.42, 3.55, 0.22]} rotation={[0.08, 0.3, -Math.PI * 0.11]} castShadow>
        <cylinderGeometry args={[0.045, 0.082, 1.3, 6]} />
        <meshStandardMaterial color="#22100a" roughness={0.92} />
      </mesh>
      <mesh position={[0, 3.85, -0.3]} rotation={[Math.PI * 0.08, 0, 0]}>
        <cylinderGeometry args={[0.035, 0.07, 1.1, 6]} />
        <meshStandardMaterial color="#22100a" roughness={0.92} />
      </mesh>
      <mesh position={[-0.28, 2.8, 0.35]} rotation={[0.15, 0, Math.PI * 0.22]}>
        <cylinderGeometry args={[0.03, 0.06, 0.9, 6]} />
        <meshStandardMaterial color="#22100a" roughness={0.92} />
      </mesh>

      {/* ── Canopy blobs ── */}
      <group ref={canopyRef}>
        {CANOPY_NODES.map(([x, y, z], i) => (
          <mesh key={i} position={[x, y, z]} castShadow>
            <sphereGeometry args={[CANOPY_SCALES[i], 9, 9]} />
            <meshStandardMaterial
              color="#e8407a"
              emissive="#cc2060"
              emissiveIntensity={glow}
              roughness={0.85}
              metalness={0}
            />
          </mesh>
        ))}

        {/* Extra small accent blobs for fullness */}
        {([ [-0.2, 4.25, 0.4], [0.6, 4.55, -0.1], [-0.5, 4.65, 0.45] ] as [number,number,number][]).map(([x,y,z],i) => (
          <mesh key={`s${i}`} position={[x, y, z]}>
            <sphereGeometry args={[0.3, 7, 7]} />
            <meshStandardMaterial
              color="#ff6699"
              emissive="#ee3370"
              emissiveIntensity={glow * 0.7}
              roughness={0.85}
            />
          </mesh>
        ))}
      </group>

      {/* ── Falling petal particles ── */}
      <points ref={petalRef} geometry={petalGeo} position={[0, 0.5, 0]}>
        <pointsMaterial
          color="#ffaacc"
          size={0.06}
          transparent
          opacity={0.75}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* ── Ground glow beneath tree ── */}
      <mesh position={[0, 0.018, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.2, 24]} />
        <meshStandardMaterial
          color="#ff2266"
          emissive="#ff2266"
          emissiveIntensity={0.25}
          transparent
          opacity={0.35}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
