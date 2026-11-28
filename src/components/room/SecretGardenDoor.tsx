import { useState } from 'react';
import { Html, useCursor } from '@react-three/drei';
import * as THREE from 'three';
import { recentlyDragged } from './gesture';

type Vec3 = [number, number, number];
const GOLD = '#cba260';
const arch = new THREE.Shape();
arch.moveTo(-1.3, 0); arch.lineTo(1.3, 0); arch.lineTo(1.3, 3.2);
arch.absarc(0, 3.2, 1.3, 0, Math.PI, false); arch.closePath();
const vines = [-1, 1].map(side => new THREE.CatmullRomCurve3(Array.from({ length: 24 }, (_, i) => {
  const y = i / 23 * 4.95;
  return new THREE.Vector3(side * (1.55 + Math.sin(i * 0.8) * 0.09 - Math.max(0, y - 3.5) * 0.6), y, 0.15);
})));

function Flower({ at, color = '#e8a8c4', size = 1 }: { at: Vec3; color?: string; size?: number }) {
  return <group position={at} scale={size}>
    {Array.from({ length: 5 }, (_, i) => {
      const angle = i * Math.PI * 2 / 5;
      return <mesh key={i} position={[Math.sin(angle) * 0.12, Math.cos(angle) * 0.12, 0]} rotation={[0, 0, -angle]} scale={[0.09, 0.15, 0.045]}><sphereGeometry args={[1, 10, 8]} /><meshStandardMaterial color={color} roughness={0.8} /></mesh>;
    })}
    <mesh position={[0, 0, 0.05]}><sphereGeometry args={[0.055, 10, 8]} /><meshStandardMaterial color="#efd18b" /></mesh>
  </group>;
}

function Butterfly({ at, size = 1 }: { at: Vec3; size?: number }) {
  return <group position={at} rotation={[0.1, -0.15, 0.3]} scale={size}>
    {[-1, 1].map(side => <group key={side} rotation={[0, side * 0.3, 0]}>
      <mesh position={[side * 0.15, 0.08, 0]} rotation={[0, 0, -side * 0.4]} scale={[0.14, 0.23, 0.025]}><sphereGeometry args={[1, 12, 8]} /><meshStandardMaterial color="#d3a1c8" roughness={0.8} /></mesh>
      <mesh position={[side * 0.12, -0.13, 0]} scale={[0.12, 0.13, 0.025]}><sphereGeometry args={[1, 12, 8]} /><meshStandardMaterial color="#ad7fae" /></mesh>
      <mesh position={[side * 0.14, 0.06, 0.03]} rotation={[0, 0, -side * 0.4]}><boxGeometry args={[0.01, 0.3, 0.008]} /><meshStandardMaterial color="#795a77" /></mesh>
    </group>)}
    <mesh scale={[0.025, 0.2, 0.03]}><sphereGeometry args={[1, 8, 8]} /><meshStandardMaterial color="#70536a" /></mesh>
  </group>;
}

export default function SecretGardenDoor({ onEnter, enabled }: { onEnter: () => void; enabled: boolean }) {
  const [hover, setHover] = useState(false);
  useCursor(hover && enabled);
  const enter = () => { if (enabled && !recentlyDragged()) onEnter(); };
  return <group position={[6.82, 0.1, 6.5]} rotation={[0, -Math.PI / 2, 0]}
    onPointerOver={event => { event.stopPropagation(); setHover(true); }} onPointerOut={() => setHover(false)}
    onClick={event => { event.stopPropagation(); if (event.delta <= 6) enter(); }}>
    <mesh position={[0, 0, -0.04]} scale={[1.08, 1.025, 1]}><shapeGeometry args={[arch]} /><meshStandardMaterial color={GOLD} metalness={0.4} roughness={0.45} /></mesh>
    <mesh><shapeGeometry args={[arch]} /><meshStandardMaterial color="#b785bb" emissive="#c98cd4" emissiveIntensity={hover ? 0.3 : 0.03} /></mesh>
    {/* Each plank follows the rounded arch instead of ending in a flat top. */}
    {Array.from({ length: 12 }, (_, i) => {
      const x = -1.19 + i * 0.216;
      const edge = Math.min(1.3, Math.abs(x) + 0.1);
      const height = 3.2 + Math.sqrt(1.3 ** 2 - edge ** 2);
      return <group key={i}>
        <mesh position={[x, height / 2, 0.025]}><boxGeometry args={[0.205, height, 0.045]} /><meshStandardMaterial color={['#bf93c4', '#b183b8', '#cba1cd'][i % 3]} emissive="#ce9bd5" emissiveIntensity={hover ? 0.15 : 0} roughness={0.85} /></mesh>
        {[0.06, -0.04].map((offset, j) => <mesh key={j} position={[x + offset, height / 2, 0.051]}><boxGeometry args={[0.008, height * (j ? 0.86 : 0.7), 0.003]} /><meshStandardMaterial color="#a376aa" transparent opacity={0.4} /></mesh>)}
      </group>;
    })}
    <mesh position={[0, 3.2, 0.09]}><torusGeometry args={[1.36, 0.055, 10, 40, Math.PI]} /><meshStandardMaterial color={GOLD} metalness={0.45} roughness={0.35} /></mesh>
    {[-1.36, 1.36].map(x => <mesh key={x} position={[x, 1.6, 0.08]}><cylinderGeometry args={[0.055, 0.055, 3.2, 10]} /><meshStandardMaterial color={GOLD} /></mesh>)}
    {[0.65, 1.8, 3.65].map((y, i) => <group key={y} position={[i === 2 ? 0.68 : -0.85, y, 0.12]}>
      <mesh><boxGeometry args={[0.78, 0.08, 0.055]} /><meshStandardMaterial color={GOLD} metalness={0.5} roughness={0.35} /></mesh>
      {[-0.38, 0.38].map(x => <mesh key={x} position={[x, 0, 0]} scale={[0.12, 0.09, 0.05]}><sphereGeometry args={[1, 10, 8]} /><meshStandardMaterial color={GOLD} /></mesh>)}
    </group>)}
    {[-1, 1].map(side => <group key={side}>
      <mesh position={[side * 0.2, 2.1, 0.14]} rotation={[0, 0, side * 0.4]}><torusGeometry args={[0.1, 0.027, 8, 20, Math.PI * 1.7]} /><meshStandardMaterial color="#b48a46" metalness={0.6} roughness={0.3} /></mesh>
      <mesh position={[side * 0.2, 2.65, 0.11]} rotation={[0, 0, side * 0.5]}><torusGeometry args={[0.12, 0.025, 8, 20, Math.PI * 1.6]} /><meshStandardMaterial color={GOLD} /></mesh>
      <mesh geometry={undefined}><tubeGeometry args={[vines[side === -1 ? 0 : 1], 48, 0.035, 6, false]} /><meshStandardMaterial color="#8e794a" /></mesh>
      {Array.from({ length: 14 }, (_, i) => {
        const point = vines[side === -1 ? 0 : 1].getPoint(i / 14);
        return <mesh key={i} position={[point.x + (i % 2 ? 0.12 : -0.12), point.y, 0.17]} rotation={[0.1, 0, side * (i % 2 ? 0.6 : -0.7)]} scale={[0.12, 0.23, 0.035]}><sphereGeometry args={[1, 8, 6]} /><meshStandardMaterial color={i % 2 ? '#8d9562' : '#6c805d'} /></mesh>;
      })}
      {[0.55, 2.7, 3.9, 4.65].map((y, i) => <Flower key={y} at={[side * (1.58 - Math.max(0, y - 3.5) * 0.6), y, 0.25]} size={i % 2 ? 1 : 1.3} />)}
      {Array.from({ length: 6 }, (_, i) => <mesh key={i} position={[side * (1.15 + i * 0.1), 0.25, 0.3]} rotation={[0, 0, side * (i - 2) * 0.2]} scale={[0.04, 0.3 + i % 3 * 0.12, 0.04]}><sphereGeometry args={[1, 6, 8]} /><meshStandardMaterial color="#829369" /></mesh>)}
      <Flower at={[side * 1.1, 0.4, 0.36]} color="#fff0d0" size={0.7} />
    </group>)}
    <Butterfly at={[0.25, 4.95, 0.25]} size={1.2} />
    <Butterfly at={[1.65, 4.5, 0.3]} size={0.8} />
    <Butterfly at={[-0.65, 3.15, 0.18]} size={0.5} />
    <Html position={[0, 5.55, 0.3]} center occlude>
      <button className="secret-garden-label" disabled={!enabled} onClick={event => { event.stopPropagation(); enter(); }}>A secret garden · Enter</button>
    </Html>
  </group>;
}
