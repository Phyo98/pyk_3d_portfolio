import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sparkles, Stars } from '@react-three/drei';
import * as THREE from 'three';

function arch(width: number, height: number) {
  const s = new THREE.Shape();
  s.moveTo(-width / 2, 0);
  s.lineTo(width / 2, 0);
  s.lineTo(width / 2, height - width / 2);
  s.absarc(0, height - width / 2, width / 2, 0, Math.PI, false);
  s.lineTo(-width / 2, 0);
  return s;
}
const windowShape = arch(0.42, 1);
const doorShape = arch(1.5, 2.4);

function Window({ y, z }: { y: number; z: number }) {
  return <group position={[0, y, z]}>
    <mesh scale={[1.22, 1.12, 1]} position={[0, -0.06, -0.02]}><shapeGeometry args={[windowShape]} /><meshStandardMaterial color="#d9b8f2" /></mesh>
    <mesh><shapeGeometry args={[windowShape]} /><meshStandardMaterial color="#ffe8a3" emissive="#ffb347" emissiveIntensity={1.8} /></mesh>
    <mesh position={[0, 0.44, 0.02]}><boxGeometry args={[0.035, 0.88, 0.035]} /><meshStandardMaterial color="#b87556" /></mesh>
    <mesh position={[0, 0.42, 0.02]}><boxGeometry args={[0.42, 0.035, 0.035]} /><meshStandardMaterial color="#b87556" /></mesh>
  </group>;
}

function Flag({ y, reduced }: { y: number; reduced: boolean }) {
  const flag = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!flag.current || reduced) return;
    const positions = flag.current.geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      positions.setZ(i, Math.sin(x * 7 - clock.elapsedTime * 3) * 0.1 * (x + 0.5));
    }
    positions.needsUpdate = true;
    flag.current.geometry.computeVertexNormals();
  });
  return <group position={[0, y, 0]}>
    <mesh position={[0, 0.45, 0]}><cylinderGeometry args={[0.025, 0.025, 0.9, 8]} /><meshStandardMaterial color="#edc279" metalness={0.5} roughness={0.3} /></mesh>
    <mesh ref={flag} position={[0.49, 0.66, 0]}><planeGeometry args={[0.95, 0.38, 12, 3]} /><meshStandardMaterial color="#ff79bd" side={THREE.DoubleSide} /></mesh>
  </group>;
}

function Tower({ x, z, height, radius, reduced }: { x: number; z: number; height: number; radius: number; reduced: boolean }) {
  return <group position={[x, 0.55, z]}>
    <mesh position={[0, height / 2, 0]}><cylinderGeometry args={[radius * 0.88, radius, height, 32]} /><meshStandardMaterial color="#b49bd9" roughness={0.7} /></mesh>
    {[0.2, height * 0.64, height - 0.1].map((y, i) => <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[radius * (i === 0 ? 1 : 0.92), 0.09, 8, 32]} /><meshStandardMaterial color="#d4b9ec" /></mesh>)}
    <group position={[0, height, 0]}>
      <mesh position={[0, radius * 1.15, 0]}><coneGeometry args={[radius * 1.28, radius * 2.7, 40]} /><meshStandardMaterial color="#7839a6" roughness={0.58} /></mesh>
      {Array.from({ length: 9 }, (_, i) => <mesh key={i} position={[0, -radius * 0.17 + i * radius * 0.29, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[radius * 1.28 * (1 - i / 9.3), 0.035, 5, 40]} /><meshStandardMaterial color={i % 2 ? '#9953bb' : '#8b47b2'} /></mesh>)}
      <Flag y={radius * 2.5} reduced={reduced} />
    </group>
    <Window y={height - 1.5} z={radius * 0.92} />
    {height > 5 && <Window y={height - 3.5} z={radius * 0.95} />}
    {Array.from({ length: 10 }, (_, i) => {
      const a = i * Math.PI / 5;
      return <mesh key={i} position={[Math.sin(a) * radius, height * 0.64 + 0.12, Math.cos(a) * radius]}><boxGeometry args={[0.16, 0.3, 0.18]} /><meshStandardMaterial color="#d4b9ec" /></mesh>;
    })}
  </group>;
}

function World({ entering, reduced, onEnter, onInside }: { entering: boolean; reduced: boolean; onEnter: () => void; onInside: () => void }) {
  const leftDoor = useRef<THREE.Group>(null);
  const rightDoor = useRef<THREE.Group>(null);
  const time = useRef(0);
  const finished = useRef(false);
  const start = useRef(new THREE.Vector3());
  const look = useRef(new THREE.Vector3(0, 4.7, 0));
  const [hovered, setHovered] = useState(false);
  useEffect(() => {
    document.body.style.cursor = hovered && !entering ? 'pointer' : '';
    return () => { document.body.style.cursor = ''; };
  }, [hovered, entering]);
  useFrame(({ camera, size, pointer, clock }, dt) => {
    if (!entering) {
      const distance = Math.max(17, 9 / Math.max(size.width / size.height, 0.35));
      camera.position.set(reduced ? 0 : pointer.x * 0.7, 6.5 + (reduced ? 0 : pointer.y * 0.25), distance);
      camera.lookAt(0, 4.7, 0);
      start.current.copy(camera.position);
    } else {
      time.current += dt;
      const p = Math.min(time.current / (reduced ? 0.15 : 2.6), 1);
      const ease = p * p * (3 - 2 * p);
      if (!reduced) {
        camera.position.lerpVectors(start.current, new THREE.Vector3(0, 1.8, 1.5), ease);
        look.current.set(0, THREE.MathUtils.lerp(4.7, 1.8, ease), 0);
        camera.lookAt(look.current);
      }
      if (leftDoor.current) leftDoor.current.rotation.y = -Math.min(p * 2, 1) * 1.35;
      if (rightDoor.current) rightDoor.current.rotation.y = Math.min(p * 2, 1) * 1.35;
      if (p === 1 && !finished.current) { finished.current = true; onInside(); }
    }
    if (!reduced) waterMaterial.current && (waterMaterial.current.opacity = 0.79 + Math.sin(clock.elapsedTime) * 0.04);
  });
  const waterMaterial = useRef<THREE.MeshStandardMaterial>(null);
  const rocks = useMemo(() => Array.from({ length: 18 }, (_, i) => ({
    x: Math.sin(i * 2.4) * (2.8 + (i % 3) * 0.35), z: Math.cos(i * 2.4) * 2.4,
    size: 0.6 + (i % 4) * 0.16,
  })), []);
  return <>
    <color attach="background" args={['#172347']} />
    <fog attach="fog" args={['#555385', 24, 65]} />
    <hemisphereLight args={['#c9c9ff', '#3a395f', 2]} />
    <directionalLight position={[-6, 12, 7]} intensity={3} color="#ffdae7" />
    <directionalLight position={[7, 6, -5]} intensity={2.4} color="#898bff" />
    <Stars radius={45} depth={25} count={1400} factor={3} fade speed={reduced ? 0 : 0.35} />
    <Sparkles count={55} scale={[12, 10, 8]} position={[0, 4, 0]} size={3} speed={reduced ? 0 : 0.3} color="#ffd5a0" />
    <mesh position={[-7, 12, -15]}><sphereGeometry args={[1, 32, 32]} /><meshBasicMaterial color="#fff1d4" /></mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.45, 0]}><planeGeometry args={[180, 180]} /><meshStandardMaterial ref={waterMaterial} color="#368baf" metalness={0.65} roughness={0.24} transparent opacity={0.8} /></mesh>
    {[6, 9, 12, 16].map(r => <mesh key={r} position={[0, -0.42, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[r, r + 0.035, 100]} /><meshBasicMaterial color="#b3bce5" transparent opacity={0.2} /></mesh>)}
    {[-1, 1].flatMap(side => Array.from({ length: 6 }, (_, i) => <mesh key={`${side}-${i}`} position={[side * (9 + i * 3), 0, -9 - i * 3]}><coneGeometry args={[5, 5 + i % 3 * 2, 5]} /><meshStandardMaterial color={i % 2 ? '#415d83' : '#384c73'} /></mesh>))}
    <mesh position={[0, -0.1, 0]} scale={[4.3, 0.9, 3.3]}><sphereGeometry args={[1, 24, 12]} /><meshStandardMaterial color="#6b698b" /></mesh>
    {rocks.map((r, i) => <group key={i} position={[r.x, 0, r.z]}>
      <mesh scale={[r.size, r.size * 1.4, r.size]} rotation={[i, i, 0]}><dodecahedronGeometry args={[1, 0]} /><meshStandardMaterial color={i % 2 ? '#79718f' : '#625f80'} /></mesh>
      <mesh position={[0, r.size * 0.85, 0]} scale={[0.6, 0.4, 0.6]}><icosahedronGeometry args={[1, 1]} /><meshStandardMaterial color={i % 3 ? '#477c78' : '#c76d9e'} /></mesh>
    </group>)}
    <group onClick={e => { e.stopPropagation(); onEnter(); }} onPointerOver={e => { e.stopPropagation(); setHovered(true); }} onPointerOut={() => setHovered(false)}>
      <Tower x={0.25} z={-0.7} height={7.6} radius={0.95} reduced={reduced} />
      <Tower x={-1.45} z={-0.35} height={5.9} radius={0.72} reduced={reduced} />
      <Tower x={1.6} z={-0.1} height={4.9} radius={0.78} reduced={reduced} />
      <Tower x={-2} z={1} height={3.2} radius={0.62} reduced={reduced} />
      <Tower x={1.95} z={1.1} height={2.8} radius={0.65} reduced={reduced} />
      <Tower x={0} z={0.65} height={3.8} radius={1.05} reduced={reduced} />
      <group position={[0, 0.55, 1.72]}>
        <mesh position={[0, -0.08, -0.04]} scale={[1.2, 1.12, 1]}><shapeGeometry args={[doorShape]} /><meshStandardMaterial color="#dfb9d5" /></mesh>
        <mesh><shapeGeometry args={[doorShape]} /><meshBasicMaterial color="#ffe5b1" /></mesh>
        {[-1, 1].map(side => <group key={side} ref={side === -1 ? leftDoor : rightDoor} position={[side * 0.75, 0, 0.03]}>
          <mesh position={[-side * 0.375, 0.91, 0]}><boxGeometry args={[0.74, 1.82, 0.09]} /><meshStandardMaterial color="#cc8a58" emissive="#d17a38" emissiveIntensity={hovered ? 0.6 : 0.2} /></mesh>
          {[0.16, 0.38, 0.6].map(x => <mesh key={x} position={[-side * x, 0.9, 0.06]}><boxGeometry args={[0.025, 1.7, 0.02]} /><meshStandardMaterial color="#edb676" /></mesh>)}
          <mesh position={[-side * 0.62, 0.9, 0.11]}><sphereGeometry args={[0.06, 10, 10]} /><meshStandardMaterial color="#735039" metalness={0.7} roughness={0.2} /></mesh>
        </group>)}
        <pointLight position={[0, 1, 0.8]} color="#ffb968" intensity={9} distance={5} />
      </group>
    </group>
    {Array.from({ length: 14 }, (_, i) => <group key={i} position={[0, 0.48 - i * 0.055, 2 + i * 0.34]}>
      <mesh><boxGeometry args={[1.9, 0.16, 0.36]} /><meshStandardMaterial color={i % 2 ? '#b2a1bc' : '#a598b5'} /></mesh>
      {i % 2 === 0 && [-1, 1].map(side => <mesh key={side} position={[side, 0.4, 0]}><cylinderGeometry args={[0.035, 0.045, 0.85, 8]} /><meshStandardMaterial color="#c99c7e" /></mesh>)}
    </group>)}
    {[-1, 1].map(side => <mesh key={side} position={[side, 0.95, 4.2]} rotation={[Math.PI / 2 + 0.16, 0, 0]}><cylinderGeometry args={[0.045, 0.045, 4.6, 10]} /><meshStandardMaterial color="#dfb795" /></mesh>)}
  </>;
}

export default function CastleEntrance({ onInside }: { onInside: () => void }) {
  const [entering, setEntering] = useState(false);
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  return <div className={`castle-entrance${entering ? ' is-entering' : ''}${reduced ? ' reduced-motion' : ''}`}>
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 6.5, 19], fov: 46, near: 0.1, far: 120 }}>
      <World entering={entering} reduced={reduced} onEnter={() => setEntering(true)} onInside={onInside} />
    </Canvas>
    <header className="castle-heading"><span>WELCOME TO MY LITTLE WORLD</span><h1>A little magic.<br />A world to explore.</h1></header>
    <div className="castle-invitation"><p>Every story begins at the door.</p><button type="button" disabled={entering} onClick={() => setEntering(true)}>{entering ? 'Opening the door…' : 'Enter the castle'}</button><span>Click the castle or its glowing door</span></div>
    <div className="castle-transition" aria-hidden="true" />
    <p className="sr-only" role="status">{entering ? 'Entering the guest hall' : 'Welcome. Enter the castle to explore my portfolio.'}</p>
  </div>;
}
