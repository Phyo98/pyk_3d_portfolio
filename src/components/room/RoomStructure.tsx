import * as THREE from 'three';

const WALL  = '#080015';
const WALL2 = '#0a0018';
const FLOOR = '#120a04';
const CEIL  = '#040008';

export default function RoomStructure() {
  return (
    <group>
      {/* ── Back wall ── */}
      <mesh position={[0, 4, -6]} receiveShadow>
        <planeGeometry args={[14, 8]} />
        <meshStandardMaterial color={WALL} roughness={0.92} metalness={0.06} />
      </mesh>

      {/* ── Left wall ── */}
      <mesh position={[-7, 4, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[12, 8]} />
        <meshStandardMaterial color={WALL2} roughness={0.92} metalness={0.06} />
      </mesh>

      {/* ── Right wall ── */}
      <mesh position={[7, 4, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[12, 8]} />
        <meshStandardMaterial color={WALL2} roughness={0.92} metalness={0.06} />
      </mesh>

      {/* ── Floor (dark wood) ── */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 12]} />
        <meshStandardMaterial color={FLOOR} roughness={0.85} metalness={0.05} />
      </mesh>

      {/* Floor plank lines */}
      {[-4.5, -3, -1.5, 0, 1.5, 3, 4.5].map((x) => (
        <mesh key={x} position={[x, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.03, 12]} />
          <meshStandardMaterial color="#0a0602" />
        </mesh>
      ))}

      {/* ── Ceiling ── */}
      <mesh position={[0, 8, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 12]} />
        <meshStandardMaterial color={CEIL} roughness={0.95} />
      </mesh>

      {/* ── LED strip — back ceiling edge ── */}
      <mesh position={[0, 7.88, -5.92]}>
        <boxGeometry args={[14, 0.07, 0.07]} />
        <meshStandardMaterial color="#7b00ff" emissive="#7b00ff" emissiveIntensity={4} />
      </mesh>

      {/* ── LED strip — left ceiling edge ── */}
      <mesh position={[-6.92, 7.88, 0]}>
        <boxGeometry args={[0.07, 0.07, 12]} />
        <meshStandardMaterial color="#7b00ff" emissive="#7b00ff" emissiveIntensity={4} />
      </mesh>

      {/* ── LED strip — right ceiling edge ── */}
      <mesh position={[6.92, 7.88, 0]}>
        <boxGeometry args={[0.07, 0.07, 12]} />
        <meshStandardMaterial color="#7b00ff" emissive="#7b00ff" emissiveIntensity={4} />
      </mesh>

      {/* ── LED strip — front ceiling edge ── */}
      <mesh position={[0, 7.88, 5.92]}>
        <boxGeometry args={[14, 0.07, 0.07]} />
        <meshStandardMaterial color="#7b00ff" emissive="#7b00ff" emissiveIntensity={4} />
      </mesh>

      {/* ── Rug (center, subtle sakura pattern glow) ── */}
      <mesh position={[0, 0.012, 1.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5.5, 3.5]} />
        <meshStandardMaterial
          color="#180028"
          emissive="#220044"
          emissiveIntensity={0.18}
          roughness={1}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* Rug border */}
      <mesh position={[0, 0.013, 1.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.5, 2.75, 4]} />
        <meshStandardMaterial
          color="#3a0055"
          emissive="#550088"
          emissiveIntensity={0.25}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── Skirting / baseboard — front ── */}
      <mesh position={[0, 0.1, 5.98]}>
        <boxGeometry args={[14, 0.2, 0.06]} />
        <meshStandardMaterial color="#0e0008" roughness={0.8} />
      </mesh>
      <mesh position={[-6.98, 0.1, 0]}>
        <boxGeometry args={[0.06, 0.2, 12]} />
        <meshStandardMaterial color="#0e0008" roughness={0.8} />
      </mesh>
      <mesh position={[6.98, 0.1, 0]}>
        <boxGeometry args={[0.06, 0.2, 12]} />
        <meshStandardMaterial color="#0e0008" roughness={0.8} />
      </mesh>
    </group>
  );
}
