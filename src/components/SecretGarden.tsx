import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sparkles, Stars } from '@react-three/drei';
import GardenWalkControls from './GardenWalkControls';
import * as THREE from 'three';

function ground(x: number, z: number) {
  return -0.4 + (Math.sin(x * 0.16 + z * 0.1) + Math.cos(z * 0.2)) * 1.15 * Math.min(1, Math.abs(x) / 8);
}
function Terrain() {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(150, 150, 100, 100);
    geo.rotateX(-Math.PI / 2);
    const positions = geo.attributes.position;
    for (let i = 0; i < positions.count; i++) positions.setY(i, ground(positions.getX(i), positions.getZ(i)));
    geo.computeVertexNormals();
    return geo;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh geometry={geometry}><meshStandardMaterial color="#8067b2" roughness={1} /></mesh>;
}

function Meadow() {
  const grass = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    if (!grass.current) return;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < 1100; i++) {
      const a = i * 2.39996;
      const r = 3 + Math.sqrt(i / 1100) * 36;
      const x = Math.sin(a) * r;
      const z = Math.cos(a) * r - 8;
      const height = 0.25 + (i % 7) * 0.06;
      dummy.position.set(x, ground(x, z) + height / 2, z);
      dummy.rotation.set(0.1, a, Math.sin(i) * 0.15);
      dummy.scale.set(0.12, height, 0.12);
      dummy.updateMatrix();
      grass.current.setMatrixAt(i, dummy.matrix);
      grass.current.setColorAt(i, new THREE.Color(['#c3a4ee', '#ab7cce', '#7966ad', '#d5a7e9'][i % 4]));
    }
    grass.current.instanceMatrix.needsUpdate = true;
    if (grass.current.instanceColor) grass.current.instanceColor.needsUpdate = true;
  }, []);
  return <instancedMesh ref={grass} args={[undefined, undefined, 1100]}><coneGeometry args={[1, 1, 5]} /><meshStandardMaterial roughness={1} /></instancedMesh>;
}

// A tapered, curved petal opens from an upright bud into a six-petal lily.
function petalGeometry() {
  const geometry = new THREE.PlaneGeometry(1, 1, 10, 16);
  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const t = positions.getY(i) + 0.5;
    const width = Math.pow(Math.sin(t * Math.PI), 0.8) * 0.65 + 0.008;
    positions.setXYZ(i, positions.getX(i) * width, t * 0.9, Math.sin(t * Math.PI) * 0.18 - t * t * 0.12);
  }
  geometry.computeVertexNormals();
  return geometry;
}

function Lily({ x, z, index, bloom, reduced, geometry }: { x: number; z: number; index: number; bloom: number; reduced: boolean; geometry: THREE.BufferGeometry }) {
  const petals = useRef<Array<THREE.Group | null>>([]);
  const elapsed = useRef(0);
  const height = 0.8 + index % 4 * 0.16;
  useEffect(() => { elapsed.current = 0; }, [bloom]);
  useFrame((_, dt) => {
    elapsed.current += dt;
    const p = reduced ? 1 : THREE.MathUtils.clamp((elapsed.current - index % 7 * 0.16) / 2.8, 0, 1);
    const open = p * p * (3 - 2 * p);
    petals.current.forEach((petal, i) => { if (petal) petal.rotation.x = -0.12 - open * (i % 2 ? 1.22 : 1.05); });
  });
  return <group position={[x, ground(x, z), z]}>
    <mesh position={[0, height / 2, 0]}><cylinderGeometry args={[0.018, 0.025, height, 6]} /><meshStandardMaterial color="#617e75" /></mesh>
    {[-1, 1].map(side => <mesh key={side} position={[side * 0.14, height * 0.4, 0]} rotation={[0, 0, -side * 0.7]} scale={[0.08, 0.3, 0.025]}><sphereGeometry args={[1, 8, 8]} /><meshStandardMaterial color="#73917c" /></mesh>)}
    <group position={[0, height, 0]}>
      {Array.from({ length: 6 }, (_, i) => <group key={i} rotation={[0, i * Math.PI / 3, 0]}>
        <group ref={node => { petals.current[i] = node; }}><mesh geometry={geometry}><meshStandardMaterial color={index % 3 ? '#f5b6e9' : '#ffead7'} emissive="#e77de1" emissiveIntensity={0.25} side={THREE.DoubleSide} roughness={0.5} /></mesh></group>
        <group position={[Math.sin(i) * 0.09, 0.18, Math.cos(i) * 0.09]}>
          <mesh><cylinderGeometry args={[0.008, 0.008, 0.36, 5]} /><meshStandardMaterial color="#ffe4a0" /></mesh>
          <mesh position={[0, 0.18, 0]} scale={[0.025, 0.055, 0.025]}><sphereGeometry args={[1, 6, 6]} /><meshStandardMaterial color="#ffc45f" emissive="#ffc45f" emissiveIntensity={0.4} /></mesh>
        </group>
      </group>)}
    </group>
  </group>;
}

function Mushroom({ x, z, scale }: { x: number; z: number; scale: number }) {
  return <group position={[x, ground(x, z), z]} scale={scale}>
    <mesh position={[0, 1.2, 0]} rotation={[0, 0, -0.1]}><cylinderGeometry args={[0.18, 0.32, 2.4, 16]} /><meshStandardMaterial color="#dbc6ec" /></mesh>
    <mesh position={[0, 2.35, 0]} scale={[1.25, 0.65, 1.25]}><sphereGeometry args={[1, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#bc52c9" side={THREE.DoubleSide} emissive="#b840a5" emissiveIntensity={0.16} /></mesh>
    <mesh position={[0, 2.35, 0]} rotation={[Math.PI / 2, 0, 0]}><circleGeometry args={[1.25, 24]} /><meshStandardMaterial color="#efb8e0" emissive="#efb8e0" emissiveIntensity={0.3} side={THREE.DoubleSide} /></mesh>
    {Array.from({ length: 9 }, (_, i) => {
      const r = 0.3 + i % 3 * 0.32;
      return <mesh key={i} position={[Math.sin(i * 2.4) * r, 2.35 + Math.sqrt(1 - (r / 1.25) ** 2) * 0.65, Math.cos(i * 2.4) * r]} scale={[0.1, 0.035, 0.1]}><sphereGeometry args={[1, 8, 6]} /><meshStandardMaterial color="#ffe3cf" emissive="#ffe3cf" emissiveIntensity={0.4} /></mesh>;
    })}
  </group>;
}

function GardenWorld({ onReady, reduced, bloom }: { onReady: () => void; reduced: boolean; bloom: number }) {
  const frames = useRef(0);
  const geometry = useMemo(petalGeometry, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame(() => { if (++frames.current === 2) onReady(); });
  return <>
    <color attach="background" args={['#8578bf']} />
    <fog attach="fog" args={['#b6a0d9', 22, 75]} />
    <hemisphereLight args={['#e4cbff', '#655486', 2]} />
    <directionalLight position={[-8, 15, -8]} color="#ffe6be" intensity={2.5} />
    <GardenWalkControls ground={ground} />
    <Stars radius={75} depth={30} count={1200} factor={4} fade speed={reduced ? 0 : 0.15} />
    <mesh position={[8, 17, -37]}><sphereGeometry args={[2.1, 32, 32]} /><meshBasicMaterial color="#fff4c6" fog={false} /></mesh>
    {Array.from({ length: 9 }, (_, i) => <group key={i} position={[-42 + i * 10, 11 + i % 3 * 2, -44 - i % 2 * 8]}>
      {[0, 1, 2, 3].map(j => <mesh key={j} position={[j * 1.7, Math.sin(j * 2 + i) * 0.55, 0]} scale={[2.6, 1.05 + j % 2 * 0.45, 1.4]}><sphereGeometry args={[1, 12, 8]} /><meshStandardMaterial color={i % 2 ? '#d1b3e5' : '#e6bfe5'} roughness={1} /></mesh>)}
    </group>)}
    <Terrain />
    <Meadow />
    {Array.from({ length: 40 }, (_, i) => {
      const a = i * 2.39996;
      const r = 3 + Math.sqrt(i / 40) * 12;
      return <Lily key={i} index={i} x={Math.sin(a) * r} z={Math.cos(a) * r - 4} bloom={bloom} reduced={reduced} geometry={geometry} />;
    })}
    {[[ -10, -10, 2.2 ], [10, -14, 2.8], [7, -3, 1], [-12, 8, 1.7], [13, 10, 2], [-4, -22, 1.3]].map(([x, z, scale], i) => <Mushroom key={i} x={x} z={z} scale={scale} />)}
    {Array.from({ length: 16 }, (_, i) => {
      const a = i * Math.PI / 8;
      const x = Math.sin(a) * 30, z = Math.cos(a) * 30;
      return <group key={i} position={[x, ground(x, z), z]}>
        <mesh position={[0, 2, 0]}><cylinderGeometry args={[0.15, 0.3, 4, 8]} /><meshStandardMaterial color="#60506b" /></mesh>
        <mesh position={[0, 4.5, 0]} scale={[2.3, 3, 2.3]}><icosahedronGeometry args={[1, 2]} /><meshStandardMaterial color={i % 2 ? '#736f9b' : '#8b7ea7'} /></mesh>
      </group>;
    })}
    <Sparkles count={180} position={[0, 2, -3]} scale={[32, 5, 32]} size={4} color="#ffe3a0" speed={reduced ? 0 : 0.3} />
    <Sparkles count={35} position={[0, 4, -6]} scale={[16, 7, 18]} size={7} color="#fff0b8" speed={reduced ? 0 : 0.15} />
  </>;
}

export default function SecretGarden({ onBack }: { onBack: () => void }) {
  const [ready, setReady] = useState(false);
  const [bloom, setBloom] = useState(0);
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  return <div className="secret-garden">
    <Canvas style={{ touchAction: 'none' }} dpr={[1, 1.5]} camera={{ position: [0, 1.4, 8], fov: 62, far: 150 }}><GardenWorld onReady={() => setReady(true)} reduced={reduced} bloom={bloom} /></Canvas>
    <header className="garden-heading"><span>BEYOND THE HIDDEN DOOR</span><h1>A garden of little wonders</h1><p>Moonlight, lilies, and a little magic.</p></header>
    <button className="castle-return" onClick={onBack}>Back to my room</button>
    <div className="garden-controls"><button onClick={() => setBloom(value => value + 1)} disabled={!ready}>Bloom the lilies</button><p>WASD or arrow keys to walk · drag to look · scroll or pinch to zoom</p></div>
    <div className={`room-loading-veil${ready ? ' is-ready' : ''}`} role="status">{!ready && <p>Discovering the garden…</p>}</div>
  </div>;
}
