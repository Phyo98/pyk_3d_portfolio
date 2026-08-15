import * as THREE from 'three';

export default function BedSetup() {
  return (
    <group>
      {/* ══ BED ══ */}
      {/* Frame */}
      <mesh position={[-4, 0.48, 1.5]} castShadow receiveShadow>
        <boxGeometry args={[3.8, 0.95, 5.6]} />
        <meshStandardMaterial color="#150c07" roughness={0.82} metalness={0.06} />
      </mesh>

      {/* Headboard */}
      <mesh position={[-4, 1.55, -1.22]} castShadow>
        <boxGeometry args={[3.8, 1.5, 0.16]} />
        <meshStandardMaterial color="#150c07" roughness={0.82} metalness={0.06} />
      </mesh>

      {/* Headboard panel inset */}
      <mesh position={[-4, 1.55, -1.14]}>
        <boxGeometry args={[3.4, 1.1, 0.04]} />
        <meshStandardMaterial color="#1a1008" roughness={0.88} />
      </mesh>

      {/* Mattress */}
      <mesh position={[-4, 1.12, 1.5]} receiveShadow>
        <boxGeometry args={[3.44, 0.38, 5.1]} />
        <meshStandardMaterial color="#160a1e" roughness={0.92} />
      </mesh>

      {/* Blanket / duvet — dark floral sakura */}
      <mesh position={[-4, 1.34, 2.2]}>
        <boxGeometry args={[3.24, 0.16, 3.6]} />
        <meshStandardMaterial
          color="#0f0920"
          emissive="#1e0840"
          emissiveIntensity={0.12}
          roughness={1}
        />
      </mesh>

      {/* Blanket fold-over top */}
      <mesh position={[-4, 1.4, 0.35]}>
        <boxGeometry args={[3.24, 0.11, 0.55]} />
        <meshStandardMaterial color="#1c0e2e" roughness={1} />
      </mesh>

      {/* Blanket sakura pattern (subtle emissive plane) */}
      <mesh position={[-4, 1.43, 2.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.0, 3.4]} />
        <meshStandardMaterial
          color="#3a1a50"
          emissive="#550088"
          emissiveIntensity={0.08}
          transparent
          opacity={0.6}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Pillow 1 */}
      <mesh position={[-3.2, 1.46, -0.5]} castShadow>
        <boxGeometry args={[1.1, 0.24, 0.72]} />
        <meshStandardMaterial color="#0d0718" roughness={0.92} />
      </mesh>

      {/* Pillow 2 */}
      <mesh position={[-4.9, 1.46, -0.5]} castShadow>
        <boxGeometry args={[1.1, 0.24, 0.72]} />
        <meshStandardMaterial color="#0d0718" roughness={0.92} />
      </mesh>

      {/* ══ WINDOW (LEFT WALL) ══ */}
      {/* Window frame */}
      <mesh position={[-6.84, 3.8, -0.5]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[2.7, 2.7, 0.1]} />
        <meshStandardMaterial color="#1a0e28" roughness={0.72} />
      </mesh>

      {/* Window glass */}
      <mesh position={[-6.78, 3.8, -0.5]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[2.5, 2.5]} />
        <meshStandardMaterial
          color="#d0c8ff"
          emissive="#9988dd"
          emissiveIntensity={0.7}
          transparent
          opacity={0.32}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Window cross bars */}
      <mesh position={[-6.78, 3.8, -0.5]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.04, 2.5]} />
        <meshStandardMaterial color="#1a0e28" roughness={0.72} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-6.78, 3.8, -0.5]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[2.5, 0.04]} />
        <meshStandardMaterial color="#1a0e28" roughness={0.72} side={THREE.DoubleSide} />
      </mesh>

      {/* Blinds — horizontal slats */}
      {([-1.1, -0.75, -0.4, -0.05, 0.3, 0.65, 1.0] as number[]).map((dy, i) => (
        <mesh key={i} position={[-6.72, 3.8 + dy, -0.5]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[2.46, 0.065, 0.022]} />
          <meshStandardMaterial color="#15102a" roughness={0.82} />
        </mesh>
      ))}
    </group>
  );
}
