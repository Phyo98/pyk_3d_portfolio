import { useState } from 'react';
import { Html, useCursor } from '@react-three/drei';
import * as THREE from 'three';
import { recentlyDragged } from './gesture';

const arch = new THREE.Shape();
arch.moveTo(-1.4, 0);
arch.lineTo(1.4, 0);
arch.lineTo(1.4, 3.3);
arch.absarc(0, 3.3, 1.4, 0, Math.PI, false);
arch.closePath();

export default function RoomExitDoor({ onBack, enabled }: { onBack: () => void; enabled: boolean }) {
  const [hover, setHover] = useState(false);
  useCursor(hover && enabled);
  return <group position={[0, 0.08, 11.8]} rotation={[0, Math.PI, 0]}
    onPointerOver={event => { event.stopPropagation(); setHover(true); }}
    onPointerOut={() => setHover(false)}
    onClick={event => {
      event.stopPropagation();
      if (enabled && event.delta <= 6 && !recentlyDragged()) onBack();
    }}>
    <mesh scale={[1.12, 1.05, 1]} position={[0, -0.04, -0.05]}><shapeGeometry args={[arch]} /><meshStandardMaterial color="#d4b9ec" emissive="#a86ce1" emissiveIntensity={0.25} /></mesh>
    <mesh><shapeGeometry args={[arch]} /><meshStandardMaterial color="#4e286d" emissive="#b47ae8" emissiveIntensity={hover && enabled ? 0.45 : 0.06} roughness={0.6} /></mesh>
    {[-1, 1].map(side => <mesh key={side} position={[side * 1.12, 1.8, 0.06]}><boxGeometry args={[0.045, 3.15, 0.04]} /><meshStandardMaterial color="#edc279" /></mesh>)}
    {[0.35, 1.7, 3.25].map(y => <mesh key={y} position={[0, y, 0.06]}><boxGeometry args={[2.25, 0.045, 0.04]} /><meshStandardMaterial color="#edc279" /></mesh>)}
    <mesh position={[0, 3.9, 0.09]} scale={[0.2, 0.3, 0.07]}><octahedronGeometry args={[1]} /><meshStandardMaterial color="#edc279" /></mesh>
    <mesh position={[0.9, 1.8, 0.16]}><torusGeometry args={[0.13, 0.035, 8, 20]} /><meshStandardMaterial color="#edc279" metalness={0.6} roughness={0.3} /></mesh>
    <pointLight position={[0, 3, 1]} intensity={12} color="#d4b9ec" distance={8} />
    <Html position={[0, 5.2, 0.2]} center occlude style={{ pointerEvents: 'none' }}>
      <span className="hall-door-label">Guest hall · Click to return</span>
    </Html>
  </group>;
}
