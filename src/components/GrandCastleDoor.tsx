import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

type Vec3 = [number, number, number];
const TRIM = '#edc279';
function arch(width: number, height: number) {
  const shape = new THREE.Shape();
  shape.moveTo(-width / 2, 0);
  shape.lineTo(width / 2, 0);
  shape.lineTo(width / 2, height - width / 2);
  shape.absarc(0, height - width / 2, width / 2, 0, Math.PI, false);
  shape.closePath();
  return shape;
}
function Block({ at, size, color }: { at: Vec3; size: Vec3; color: string }) {
  return <mesh position={at}><boxGeometry args={size} /><meshStandardMaterial color={color} roughness={0.5} /></mesh>;
}

const panelFrame = arch(1.38, 3.9);
const panelInset = arch(1.18, 3.65);
const crest = new THREE.Shape();
for (let i = 0; i < 8; i++) {
  const angle = Math.PI / 2 + i * Math.PI / 4;
  const radius = i % 2 ? 0.1 : 0.36;
  if (i === 0) crest.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
  else crest.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
}
crest.closePath();
const grandDoorFrame = arch(4.6, 6.75);
const grandDoorOpening = arch(3.9, 6.4);
const grandDoorLeaf = new THREE.Shape();
grandDoorLeaf.moveTo(0, 0);
grandDoorLeaf.lineTo(1.95, 0);
grandDoorLeaf.lineTo(1.95, 4.45);
grandDoorLeaf.absarc(0, 4.45, 1.95, 0, Math.PI / 2, false);
grandDoorLeaf.closePath();

export default function GrandCastleDoor({ active, onExit, position = [0, 0.1, 9.45], rotation = Math.PI, scale = 1, opening = false, reduced = false, label }: {
  active: boolean; onExit: () => void; position?: Vec3; rotation?: number; scale?: number;
  opening?: boolean; reduced?: boolean; label?: string;
}) {
  const left = useRef<THREE.Group>(null);
  const right = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    for (const [door, side] of [[left, -1], [right, 1]] as const) {
      if (!door.current) continue;
      const target = opening ? side * 1.35 : 0;
      door.current.rotation.y = reduced ? target : THREE.MathUtils.damp(door.current.rotation.y, target, 4, delta);
    }
  });
  const [hover, setHover] = useState(false);
  useEffect(() => {
    if (hover && active) document.body.style.cursor = 'pointer';
    return () => { document.body.style.cursor = ''; };
  }, [hover, active]);
  return <group position={position} rotation={[0, rotation, 0]} scale={scale}
    onPointerOver={event => { event.stopPropagation(); setHover(true); }}
    onPointerOut={() => setHover(false)}
    onClick={event => { event.stopPropagation(); if (active && event.delta <= 6) onExit(); }}>
    <mesh position={[0, 0, -0.04]}><shapeGeometry args={[grandDoorFrame]} /><meshStandardMaterial color="#aa80cc" roughness={0.45} /></mesh>
    <mesh position={[0, 0, -0.02]}><shapeGeometry args={[grandDoorOpening]} /><meshBasicMaterial color="#ffe5b1" /></mesh>
    {[-1, 1].map(side => <group key={side}>
      <group ref={side === -1 ? left : right} position={[side * 1.95, 0, 0]}>
      <group position={[-side * 1.95, 0, 0]}>
      <mesh scale={[side, 1, 1]}><shapeGeometry args={[grandDoorLeaf]} /><meshStandardMaterial color="#381450" side={THREE.DoubleSide} emissive="#9146c7" emissiveIntensity={hover && active ? 0.45 : 0.08} metalness={0.2} roughness={0.35} /></mesh>
      <group position={[side * 0.98, 0.35, 0.06]}>
        <mesh><shapeGeometry args={[panelFrame]} /><meshStandardMaterial color={TRIM} metalness={0.65} roughness={0.3} /></mesh>
        <mesh position={[0, 0.12, 0.025]}><shapeGeometry args={[panelInset]} /><meshStandardMaterial color="#663184" emissive="#9b55cc" emissiveIntensity={hover && active ? 0.28 : 0.06} roughness={0.4} /></mesh>
        {/* Mirrored gold scrollwork follows the tall inset panels. */}
        {[0.65, 1.5, 2.35].map((y, i) => <group key={y} position={[0, y, 0.065]} rotation={[0, 0, i % 2 ? Math.PI : 0]}>
          <mesh position={[-0.16, 0, 0]} rotation={[0, 0, -Math.PI / 2]}><torusGeometry args={[0.22, 0.022, 6, 24, Math.PI * 1.6]} /><meshStandardMaterial color={TRIM} metalness={0.65} roughness={0.25} /></mesh>
          <mesh position={[0.16, 0.22, 0]} rotation={[0, 0, Math.PI / 2]}><torusGeometry args={[0.22, 0.022, 6, 24, Math.PI * 1.6]} /><meshStandardMaterial color={TRIM} metalness={0.65} roughness={0.25} /></mesh>
        </group>)}
      </group>
      <mesh position={[side * 0.9, 4.85, 0.1]} scale={[0.7, 1, 1]}><shapeGeometry args={[crest]} /><meshStandardMaterial color="#ffde9c" emissive="#ffd27b" emissiveIntensity={0.8} /></mesh>
      <mesh position={[side * 0.24, 2.25, 0.14]} scale={[0.13, 0.28, 0.05]}><octahedronGeometry args={[1]} /><meshStandardMaterial color={TRIM} metalness={0.7} roughness={0.25} /></mesh>
      <mesh position={[side * 0.24, 2.14, 0.24]}><torusGeometry args={[0.16, 0.035, 8, 24]} /><meshStandardMaterial color={TRIM} metalness={0.7} roughness={0.25} /></mesh>
      <Block at={[side * 0.02, 2.22, 0.08]} size={[0.035, 4.45, 0.07]} color={TRIM} />
      </group>
      </group>
      <mesh position={[side * 2.12, 2.22, 0.13]}><cylinderGeometry args={[0.14, 0.18, 4.45, 20]} /><meshStandardMaterial color="#d4b9ec" /></mesh>
      {[0.5, 1.5, 2.5, 3.5, 4.2].map(y => <mesh key={y} position={[side * 2.12, y, 0.13]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.15, 0.025, 6, 20]} /><meshStandardMaterial color={TRIM} metalness={0.5} roughness={0.3} /></mesh>)}
      {[0.15, 4.4].map(y => <Block key={y} at={[side * 2.12, y, 0.13]} size={[0.34, 0.24, 0.35]} color="#edc279" />)}
    </group>)}
    {[2.03, 2.24].map((radius, i) => <mesh key={radius} position={[0, 4.45, 0.13]}><torusGeometry args={[radius, i ? 0.065 : 0.045, 10, 48, Math.PI]} /><meshStandardMaterial color={TRIM} metalness={0.55} roughness={0.25} /></mesh>)}
    {Array.from({ length: 9 }, (_, i) => {
      const angle = (i + 1) * Math.PI / 10;
      return <mesh key={i} position={[Math.cos(angle) * 2.14, 4.45 + Math.sin(angle) * 2.14, 0.16]} scale={[0.055, 0.09, 0.04]}><octahedronGeometry args={[1]} /><meshStandardMaterial color="#ffe4af" emissive="#ffcf7d" emissiveIntensity={0.5} /></mesh>;
    })}
    <mesh position={[0, 6.65, 0.22]} scale={[0.85, 0.85, 1]}><shapeGeometry args={[crest]} /><meshStandardMaterial color="#ffde9c" emissive="#ffc86c" emissiveIntensity={0.9} /></mesh>
    <Block at={[0, 0.03, 0.25]} size={[4.6, 0.1, 0.75]} color="#d4b9ec" />
    {label && <Html position={[0, 3.85, 0.3]} center occlude style={{ pointerEvents: 'none' }}><span className="hall-door-label">{label}</span></Html>}
  </group>;
}

