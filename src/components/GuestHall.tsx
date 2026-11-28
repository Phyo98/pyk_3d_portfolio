import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sparkles } from '@react-three/drei';
import GrandCastleDoor from './GrandCastleDoor';
import CastleRoomDoor from './CastleRoomDoor';
import * as THREE from 'three';

type Destination = 'room' | 'library';
type Vec3 = [number, number, number];
const TRIM = '#edc279';
const ENTRY_DURATION = 4.8;
function Block({ at, size, color }: { at: Vec3; size: Vec3; color: string }) {
  return <mesh position={at}><boxGeometry args={size} /><meshStandardMaterial color={color} roughness={0.5} /></mesh>;
}
function arch(width: number, height: number) {
  const shape = new THREE.Shape();
  shape.moveTo(-width / 2, 0); shape.lineTo(width / 2, 0);
  shape.lineTo(width / 2, height - width / 2);
  shape.absarc(0, height - width / 2, width / 2, 0, Math.PI, false);
  shape.closePath();
  return shape;
}
const windowShape = arch(2.6, 5.3);

function Column({ x, z }: { x: number; z: number }) {
  return <group position={[x, 0, z]}>
    <mesh position={[0, 3.1, 0]}><cylinderGeometry args={[0.22, 0.3, 5.8, 24]} /><meshStandardMaterial color="#b49bd9" /></mesh>
    {[0.2, 0.45, 5.8, 6.1].map(y => <mesh key={y} position={[0, y, 0]}><cylinderGeometry args={[0.43, 0.43, 0.18, 24]} /><meshStandardMaterial color={y === 0.45 || y === 5.8 ? TRIM : '#d4b9ec'} /></mesh>)}
    <Block at={[0, 3.1, 0.27]} size={[0.07, 5.2, 0.05]} color={TRIM} />
  </group>;
}

function Chandelier({ at }: { at: Vec3 }) {
  return <group position={at}>
    <mesh position={[0, 0.65, 0]}><cylinderGeometry args={[0.025, 0.025, 1.3, 8]} /><meshStandardMaterial color={TRIM} metalness={0.6} roughness={0.3} /></mesh>
    <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.7, 0.045, 8, 32]} /><meshStandardMaterial color={TRIM} /></mesh>
    <mesh position={[0, -0.4, 0]}><octahedronGeometry args={[0.22]} /><meshStandardMaterial color="#d9b8f2" metalness={0.5} roughness={0.2} /></mesh>
    {Array.from({ length: 6 }, (_, i) => {
      const a = i * Math.PI / 3;
      return <group key={i} position={[Math.cos(a) * 0.7, 0.2, Math.sin(a) * 0.7]}>
        <mesh><cylinderGeometry args={[0.045, 0.045, 0.45, 8]} /><meshStandardMaterial color="#ffe8a3" /></mesh>
        <mesh position={[0, 0.3, 0]} scale={[0.06, 0.15, 0.06]}><sphereGeometry args={[1, 8, 8]} /><meshBasicMaterial color="#fff1d4" /></mesh>
      </group>;
    })}
    <pointLight color="#ffb968" intensity={14} distance={12} decay={2} />
  </group>;
}

function Staircase({ side }: { side: number }) {
  return <group position={[side * 5.35, 0, -0.4]}>
    {Array.from({ length: 11 }, (_, i) => <group key={i}>
      <Block at={[0, 0.12 + i * 0.115, -i * 0.34]} size={[2.3, 0.24 + i * 0.23, 0.35]} color={i % 2 ? '#b2a1bc' : '#a598b5'} />
      <Block at={[-side * 1.06, 0.75 + i * 0.23, -i * 0.34]} size={[0.055, 1, 0.055]} color={TRIM} />
    </group>)}
    <mesh position={[-side * 1.06, 2.4, -1.7]} rotation={[Math.PI / 2 + 0.595, 0, 0]}><cylinderGeometry args={[0.07, 0.07, 4.3, 12]} /><meshStandardMaterial color="#dfb795" /></mesh>
    <Block at={[0, 2.5, -4.1]} size={[2.4, 0.2, 1.5]} color="#b2a1bc" />
  </group>;
}


function HallWorld({ destination, reduced, onEnter, onInside, onReady, onBack }: { destination: Destination | null; reduced: boolean; onEnter: (destination: Destination) => void; onInside: () => void; onReady: () => void; onBack: () => void }) {
  const entering = destination !== null;
  const side = destination === 'library' ? 1 : -1;
  const frames = useRef(0);
  const elapsed = useRef(0);
  const finished = useRef(false);
  const origin = useRef(new THREE.Vector3());
  const path = useRef<THREE.CurvePath<THREE.Vector3> | null>(null);
  const look = useRef(new THREE.Vector3(0, 3, -3));
  const ahead = useRef(new THREE.Vector3());
  useFrame(({ camera }, dt) => {
    if (++frames.current === 2) onReady();
    if (!entering) {
      origin.current.copy(camera.position);
      // Preserve the visitor's current view when a door is selected.
      camera.getWorldDirection(look.current);
      look.current.multiplyScalar(5).add(camera.position);
    } else {
      elapsed.current += dt;
      if (!path.current) {
        // Join curves with matching forward tangents: no pause or sideways
        // turn at the stair foot. The entire climb stays on the stair center.
        const route = new THREE.CurvePath<THREE.Vector3>();
        route.add(new THREE.CubicBezierCurve3(
          origin.current.clone(),
          new THREE.Vector3(origin.current.x * 0.6, 2.5, Math.max(origin.current.z, 2.5)),
          new THREE.Vector3(side * 5.35, 1.8, 2.5),
          new THREE.Vector3(side * 5.35, 1.8, 0.35),
        ));
        route.add(new THREE.CubicBezierCurve3(
          new THREE.Vector3(side * 5.35, 1.8, 0.35),
          new THREE.Vector3(side * 5.35, 1.8, -0.4),
          new THREE.Vector3(side * 5.35, 4.2, -2.9),
          new THREE.Vector3(side * 5.35, 4.2, -3.8),
        ));
        route.add(new THREE.LineCurve3(
          new THREE.Vector3(side * 5.35, 4.2, -3.8),
          new THREE.Vector3(side * 5.35, 4.2, -4.28),
        ));
        path.current = route;
      }
      const p = Math.min(1, elapsed.current / (reduced ? 0.15 : ENTRY_DURATION));
      const travel = p * p * (3 - 2 * p);
      if (!reduced) {
        // Arc-length sampling keeps travel continuous across curve joins.
        camera.position.copy(path.current.getPointAt(travel));
        ahead.current.copy(path.current.getPointAt(Math.min(1, travel + 0.08)));
        if (travel > 0.94) ahead.current.set(side * 5.35, 4.2, -5.5);
        look.current.lerp(ahead.current, 1 - Math.exp(-5 * dt));
        camera.lookAt(look.current);
      }
      if (p === 1 && !finished.current) { finished.current = true; onInside(); }
    }
  });
  return <>
    {!entering && <OrbitControls
      makeDefault target={[0, 3, 2.5]} enablePan={false}
      minDistance={2.5} maxDistance={5.5}
      minPolarAngle={1.05} maxPolarAngle={1.75}
      enableDamping dampingFactor={0.06} rotateSpeed={0.45}
    />}
    <color attach="background" args={['#172347']} />
    <ambientLight intensity={1.5} color="#c9c9ff" />
    <directionalLight position={[0, 5, -2]} intensity={2.5} color="#ffdae7" />
    <Sparkles count={100} position={[0, 3.3, 0]} scale={[12, 5.5, 10]} size={3} speed={reduced ? 0 : 0.3} opacity={0.8} color="#ffd5a0" />
    <Sparkles count={35} position={[0, 2.8, 1]} scale={[10, 4.5, 8]} size={5} speed={reduced ? 0 : 0.18} opacity={0.65} color="#d9b8f2" />
    <Block at={[0, -0.16, 0]} size={[15, 0.3, 22]} color="#6b698b" />
    {/* Close and furnish the rear wall so every viewing direction is an interior. */}
    <Block at={[0, 3.6, 9.8]} size={[15, 7.2, 0.3]} color="#b49bd9" />
    <GrandCastleDoor active={!entering} onExit={onBack} label="Castle exterior · Click to exit" />
    {[0.25, 6.6, 6.9].map(y => <Block key={y} at={[0, y, 9.6]} size={[15, 0.08, 0.1]} color={TRIM} />)}
    {[-1, 1].map(side => <Column key={side} x={side * 6.8} z={8.8} />)}
    <Chandelier at={[0, 5.5, 8]} />
    <Block at={[0, 3.6, -4.5]} size={[15, 7.2, 0.3]} color="#b49bd9" />
    {[-1, 1].map(side => <group key={side}>
      <Block at={[side * 7.4, 3.6, 0]} size={[0.25, 7.2, 20]} color="#b49bd9" />
      <Block at={[side * 7.2, 0.4, 0]} size={[0.08, 0.1, 20]} color={TRIM} />
      <Staircase side={side} />
      {[-3.9, 0, 4].map(z => <Column key={z} x={side * 6.8} z={z} />)}
      <Column x={side * 1.9} z={-4} />
      <Chandelier at={[side * 3.8, 5.6, 0.3]} />
      <mesh position={[side * 1.58, 3.1, -4.05]} scale={[0.3, 2.85, 0.22]}><sphereGeometry args={[1, 16, 16]} /><meshStandardMaterial color="#7839a6" /></mesh>
    </group>)}
    <Block at={[0, 7.2, 0]} size={[15, 0.2, 22]} color="#9953bb" />
    {[0.25, 6.6, 6.9].map(y => <Block key={y} at={[0, y, -4.25]} size={[15, 0.08, 0.1]} color={TRIM} />)}
    <mesh position={[0, 0.7, -4.28]} scale={[1.12, 1.06, 1]}><shapeGeometry args={[windowShape]} /><meshStandardMaterial color={TRIM} /></mesh>
    <mesh position={[0, 0.8, -4.2]}><shapeGeometry args={[windowShape]} /><meshBasicMaterial color="#ffe8a3" /></mesh>
    {[-0.65, 0, 0.65].map(x => <Block key={x} at={[x, 3.25, -4.1]} size={[0.045, 4.85, 0.05]} color="#b87556" />)}
    {[2.2, 4.2].map(y => <Block key={y} at={[0, y, -4.1]} size={[2.6, 0.045, 0.05]} color="#b87556" />)}
    <Block at={[0, 0.015, 1.4]} size={[2.7, 0.025, 11]} color="#7839a6" />
    {[-1.28, 1.28].map(x => <Block key={x} at={[x, 0.035, 1.4]} size={[0.045, 0.015, 11]} color={TRIM} />)}
    {Array.from({ length: 9 }, (_, i) => <Block key={i} at={[0, 0.005, -4 + i * 1.4]} size={[14.8, 0.01, 0.025]} color="#b2a1bc" />)}
    {[-5, -2.5, 2.5, 5].map(x => <Block key={x} at={[x, 0.005, 1]} size={[0.025, 0.01, 18]} color="#b2a1bc" />)}
    <CastleRoomDoor reduced={reduced} x={-5.35} active entering={destination === 'room'} onEnter={() => onEnter('room')} />
    <CastleRoomDoor reduced={reduced} x={5.35} active entering={destination === 'library'} onEnter={() => onEnter('library')} />
    <Chandelier at={[0, 5.5, 4]} />
  </>;
}

export default function GuestHall({ onInside, onBack }: { onInside: (destination: Destination) => void; onBack: () => void }) {
  const [ready, setReady] = useState(false);
  const [destination, setDestination] = useState<Destination | null>(null);
  const entering = destination !== null;
  const enter = (next: Destination) => { if (ready) setDestination(current => current ?? next); };
  const [reduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  return <div className={`guest-hall${entering ? ' hall-entering' : ''}`}>
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 3.2, 8], fov: 68, far: 100 }}>
      <HallWorld onBack={onBack} destination={destination} reduced={reduced} onEnter={enter} onInside={() => { if (destination) onInside(destination); }} onReady={() => setReady(true)} />
    </Canvas>
    <header className="hall-heading"><span>MAKE YOURSELF AT HOME</span><h1>The guest hall</h1><p>My room to the left. A little magic to the right.</p><p className="hall-view-hint">Drag for a 360° view · scroll or pinch to zoom</p></header>
    <div className="hall-choices"><button disabled={entering || !ready} onClick={() => enter('room')}>Upstairs left · My room</button><button disabled={entering || !ready} onClick={() => enter('library')}>Upstairs right · Library</button></div>
    <button className="castle-return" disabled={entering} onClick={onBack}>Back to castle</button>
    <div className={`room-loading-veil${ready ? ' is-ready' : ''}`} role="status">{!ready && <p>Opening the guest hall…</p>}</div>
    <div className="hall-crossing" style={{ animationDuration: `${ENTRY_DURATION}s` }} aria-hidden="true" />
    <span className="sr-only" role="status">{entering ? (destination === 'library' ? 'Entering the library' : 'Entering my room') : 'Guest hall. The door at the top of the left staircase leads to my room. The door at the top of the right staircase leads to the library. The door on the opposite wall returns to the castle exterior.'}</span>
  </div>;
}
