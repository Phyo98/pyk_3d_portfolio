import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, RoundedBox, Sparkles } from '@react-three/drei';
import CastleRoomDoor from './CastleRoomDoor';
import * as THREE from 'three';

type Vec3 = [number, number, number];
const bookColors = ['#873c46', '#344f64', '#c09953', '#556047', '#704568', '#a6663d'];
function Box({ at, size, color }: { at: Vec3; size: Vec3; color: string }) {
  return <mesh position={at}><boxGeometry args={size} /><meshStandardMaterial color={color} roughness={0.75} /></mesh>;
}

function Shelf({ at, rotation = 0 }: { at: Vec3; rotation?: number }) {
  return <group position={at} rotation={[0, rotation, 0]}>
    <Box at={[0, 2.9, 0]} size={[1.5, 5.8, 0.22]} color="#382637" />
    {[-0.76, 0.76].map(x => <Box key={x} at={[x, 2.9, 0.2]} size={[0.12, 5.9, 0.55]} color="#78492d" />)}
    {Array.from({ length: 7 }, (_, row) => <group key={row} position={[0, 0.2 + row * 0.8, 0.25]}>
      <Box at={[0, 0, 0]} size={[1.65, 0.12, 0.65]} color="#a16c3c" />
      {Array.from({ length: 7 }, (_, i) => {
        const height = 0.4 + ((i * 7 + row * 3) % 5) * 0.055;
        return <group key={i} position={[-0.6 + i * 0.2, height / 2 + 0.06, 0]} rotation={[0, 0, i === 5 ? -0.1 : 0]}>
          <Box at={[0, 0, 0]} size={[0.15, height, 0.36]} color={bookColors[(i + row) % bookColors.length]} />
          <Box at={[0, height * 0.32, 0.186]} size={[0.13, 0.018, 0.008]} color="#d9b56e" />
        </group>;
      })}
    </group>)}
  </group>;
}

const windowShape = new THREE.Shape();
windowShape.moveTo(-0.65, 0); windowShape.lineTo(0.65, 0); windowShape.lineTo(0.65, 1.6);
windowShape.quadraticCurveTo(0.65, 2.25, 0, 2.7); windowShape.quadraticCurveTo(-0.65, 2.25, -0.65, 1.6); windowShape.closePath();
function Window({ at, rotation = 0 }: { at: Vec3; rotation?: number }) {
  return <group position={at} rotation={[0, rotation, 0]}>
    <mesh scale={[1.2, 1.1, 1]} position={[0, -0.08, -0.03]}><shapeGeometry args={[windowShape]} /><meshStandardMaterial color="#aa8b70" /></mesh>
    <mesh><shapeGeometry args={[windowShape]} /><meshBasicMaterial color="#ffd77e" /></mesh>
    {[-0.3, 0, 0.3].map(x => <Box key={x} at={[x, 1.1, 0.03]} size={[0.035, x === 0 ? 2.2 : 1.9, 0.04]} color="#9c612e" />)}
    {[0.5, 1.15, 1.8].map((y, i) => <mesh key={y} position={[0, y, 0.04]} rotation={[0, 0, Math.PI / 4]}><torusGeometry args={[i === 2 ? 0.32 : 0.4, 0.022, 5, 4]} /><meshStandardMaterial color="#b87635" /></mesh>)}
    <Box at={[0, -0.12, 0.15]} size={[1.65, 0.18, 0.45]} color="#c2a58a" />
    <pointLight position={[0, 1, 0.6]} color="#ffba61" intensity={12} distance={7} />
  </group>;
}

function Cushion({ at, color, rotation = 0 }: { at: Vec3; color: string; rotation?: number }) {
  return <RoundedBox args={[0.9, 0.35, 0.75]} radius={0.15} smoothness={3} position={at} rotation={[0, rotation, 0.12]}><meshStandardMaterial color={color} roughness={1} /></RoundedBox>;
}

function SpiralStairs() {
  const rail = new THREE.CatmullRomCurve3(Array.from({ length: 65 }, (_, i) => {
    const a = i / 64 * Math.PI * 2.2;
    return new THREE.Vector3(Math.cos(a) * 1.05, 1.05 + i / 64 * 4.9, Math.sin(a) * 1.05);
  }));
  return <group position={[4.8, 0.25, -5.1]} rotation={[0, Math.PI, 0]}>
    <mesh position={[0, 2.8, 0]}><cylinderGeometry args={[0.075, 0.09, 5.6, 16]} /><meshStandardMaterial color="#aa7843" metalness={0.5} roughness={0.4} /></mesh>
    {Array.from({ length: 20 }, (_, i) => {
      const a = i / 19 * Math.PI * 2.2;
      return <group key={i} position={[0, i * 4.9 / 19, 0]} rotation={[0, -a, 0]}>
        <RoundedBox position={[0.55, 0, 0]} args={[1.15, 0.13, 0.46]} radius={0.05} smoothness={2}><meshStandardMaterial color="#c69a62" /></RoundedBox>
        <mesh position={[1.05, 0.5, 0]}><cylinderGeometry args={[0.018, 0.018, 1, 8]} /><meshStandardMaterial color="#d4ab63" /></mesh>
      </group>;
    })}
    <mesh><tubeGeometry args={[rail, 64, 0.035, 8, false]} /><meshStandardMaterial color="#d4ab63" metalness={0.5} roughness={0.3} /></mesh>
  </group>;
}

function FloatingBooks({ reduced }: { reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (group.current && !reduced) group.current.position.y = Math.sin(clock.elapsedTime * 0.5) * 0.12;
  });
  return <group ref={group}>
    {Array.from({ length: 6 }, (_, i) => <group key={i} position={[Math.sin(i * 2) * 1.3, 3.5 + i * 0.42, -1.2 + Math.cos(i * 3) * 0.65]} rotation={[0.3, i, 0.2]}>
      {[-1, 1].map(side => <group key={side} rotation={[0, 0, side * 0.25]}>
        <Box at={[side * 0.15, 0, 0]} size={[0.3, 0.04, 0.38]} color="#e4cfa2" />
        <Box at={[side * 0.15, -0.035, 0]} size={[0.32, 0.025, 0.4]} color="#9b653c" />
      </group>)}
    </group>)}
  </group>;
}

function ReadingTable({ at }: { at: Vec3 }) {
  return <group position={at}>
    <RoundedBox position={[0, 1.1, 0]} args={[1.8, 0.16, 1.15]} radius={0.06} smoothness={2}><meshStandardMaterial color="#9b6b40" /></RoundedBox>
    {[-0.7, 0.7].flatMap(x => [-0.4, 0.4].map(z => <Box key={`${x}-${z}`} at={[x, 0.52, z]} size={[0.1, 1.04, 0.1]} color="#63432e" />))}
    {[-1, 1].map(side => <group key={side} position={[0, 0, side * 1.05]}>
      <RoundedBox position={[0, 0.63, 0]} args={[0.85, 0.2, 0.8]} radius={0.08} smoothness={2}><meshStandardMaterial color="#79577f" /></RoundedBox>
      <Box at={[0, 1, side * 0.35]} size={[0.85, 0.85, 0.12]} color="#805839" />
      {[-0.32, 0.32].flatMap(x => [-0.28, 0.28].map(z => <Box key={`${x}-${z}`} at={[x, 0.28, z]} size={[0.07, 0.56, 0.07]} color="#63432e" />))}
    </group>)}
    <Box at={[-0.4, 1.24, 0]} size={[0.55, 0.12, 0.42]} color="#5f7778" />
    <Box at={[-0.35, 1.34, 0.05]} size={[0.5, 0.08, 0.4]} color="#a95c4b" />
    <mesh position={[0.45, 1.45, 0]}><cylinderGeometry args={[0.035, 0.06, 0.6, 12]} /><meshStandardMaterial color="#caa368" /></mesh>
    <mesh position={[0.45, 1.77, 0]}><coneGeometry args={[0.3, 0.3, 24, 1, true]} /><meshStandardMaterial color="#dfa85d" emissive="#ffb755" emissiveIntensity={0.4} side={THREE.DoubleSide} /></mesh>
  </group>;
}

function Chandelier() {
  return <group position={[0, 6.5, 0]}>
    <mesh position={[0, 0.7, 0]}><cylinderGeometry args={[0.03, 0.03, 1.4, 10]} /><meshStandardMaterial color="#c39a58" /></mesh>
    <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[1.25, 0.055, 8, 40]} /><meshStandardMaterial color="#c39a58" /></mesh>
    {Array.from({ length: 10 }, (_, i) => <group key={i} position={[Math.sin(i * Math.PI / 5) * 1.25, 0.2, Math.cos(i * Math.PI / 5) * 1.25]}>
      <Box at={[0, 0, 0]} size={[0.07, 0.4, 0.07]} color="#ffe0ad" />
      <mesh position={[0, 0.25, 0]} scale={[0.05, 0.12, 0.05]}><sphereGeometry args={[1, 8, 8]} /><meshBasicMaterial color="#ffdd8a" /></mesh>
    </group>)}
    <pointLight intensity={45} distance={18} color="#ffd193" />
  </group>;
}

function LibraryWorld({ onReady, reduced, onBack }: { onReady: () => void; reduced: boolean; onBack: () => void }) {
  const frames = useRef(0);
  useFrame(() => { if (++frames.current === 2) onReady(); });
  return <>
    <color attach="background" args={['#101426']} />
    <ambientLight intensity={0.9} color="#a9a6dc" />
    <directionalLight position={[-3, 6, 5]} intensity={2} color="#ffe0a3" />
    <pointLight position={[0, 2.7, 1]} intensity={22} color="#ffc576" distance={12} />
    <OrbitControls makeDefault target={[0, 2.8, 0]} enablePan={false} minDistance={2.5} maxDistance={5.8} minPolarAngle={0.95} maxPolarAngle={1.75} enableDamping dampingFactor={0.06} rotateSpeed={0.45} />
    <Box at={[0, -0.15, 0]} size={[15, 0.3, 17]} color="#8a7480" />
    {/* Enclosed interior: walls, parquet floor, and a timber ceiling. */}
    {Array.from({ length: 17 }, (_, row) => Array.from({ length: 10 }, (_, col) =>
      <Box key={`${row}-${col}`} at={[-6.75 + col * 1.5, 0.01, -8 + row]} size={[1.47, 0.025, 0.97]} color={(row + col) % 3 === 0 ? '#a17f64' : '#b79576'} />
    ))}
    {[-1, 1].map(side => <group key={side}>
      <Box at={[side * 7.5, 4.1, 0]} size={[0.3, 8.2, 17]} color="#625a73" />
      <Box at={[0, 4.1, side * 8.5]} size={[15, 8.2, 0.3]} color="#73677a" />
      <Box at={[side * 7.28, 0.3, 0]} size={[0.12, 0.5, 17]} color="#825836" />
      <Box at={[0, 0.3, side * 8.28]} size={[15, 0.5, 0.12]} color="#825836" />
      {[-6, -3.8, 3.8, 6].map(z => <Shelf key={z} at={[side * 7.05, 0.1, z]} rotation={-side * Math.PI / 2} />)}
      <Window at={[side * 7.3, 1.6, 0]} rotation={-side * Math.PI / 2} />
      {[-5.4, -3.5, 3.5, 5.4].map(x => <Shelf key={x} at={[x, 0.1, side * 8.05]} rotation={side === 1 ? Math.PI : 0} />)}
      {[-6.9, 6.9].map(x => <Box key={x} at={[x, 4, side * 8.2]} size={[0.28, 8, 0.3]} color="#ad8759" />)}
    </group>)}
    <Box at={[0, 8.3, 0]} size={[15, 0.3, 17]} color="#302b45" />
    {[-6, -3, 0, 3, 6].map(z => <Box key={z} at={[0, 8.05, z]} size={[15, 0.3, 0.28]} color="#775438" />)}
    {[-5, 0, 5].map(x => <Box key={x} at={[x, 8, 0]} size={[0.25, 0.35, 17]} color="#775438" />)}
    <Window at={[0, 1.7, -8.28]} />
    {/* Upper gallery connects to the spiral stair landing. */}
    <Box at={[0, 5.14, -7.4]} size={[14.6, 0.25, 2]} color="#805637" />
    <Box at={[4, 5.14, -6.15]} size={[2.1, 0.25, 1.5]} color="#805637" />
    <Box at={[-1.6, 6.25, -6.4]} size={[10.8, 0.09, 0.09]} color="#d4ab63" />
    {Array.from({ length: 25 }, (_, i) => <Box key={i} at={[-6.9 + i * 0.43, 5.75, -6.4]} size={[0.035, 1, 0.035]} color="#d4ab63" />)}
    {[-5.4, -3.5, -1.6, 0.3, 2.2, 4.1, 6].map(x => <group key={x} position={[x, 5.3, -8.02]} scale={[1, 0.43, 1]}><Shelf at={[0, 0, 0]} /></group>)}
    <CastleRoomDoor
      x={0} at={[0, 0.1, 8.28]} rotation={Math.PI}
      active entering={false} onEnter={onBack}
      label="Guest hall · Click to return"
    />
    <ReadingTable at={[-3.6, 0, 0.4]} />
    <ReadingTable at={[3.8, 0, 2.8]} />
    <Chandelier />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, -3.5]}><circleGeometry args={[2.5, 48]} /><meshStandardMaterial color="#755278" /></mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.045, -3.5]}><ringGeometry args={[2.25, 2.3, 48]} /><meshStandardMaterial color="#cfab77" /></mesh>
    {[-1.35, 0, 1.35].map((x, i) => <group key={x} position={[x, 0, -6.7 + Math.abs(x) * 0.25]} rotation={[0, -x * 0.15, 0]}>
      <RoundedBox position={[0, 0.44, 0]} args={[1.42, 0.5, 1]} radius={0.12} smoothness={3}><meshStandardMaterial color="#956540" /></RoundedBox>
      <RoundedBox position={[0, 0.76, 0]} args={[1.43, 0.23, 1]} radius={0.1} smoothness={3}><meshStandardMaterial color="#e5bc83" /></RoundedBox>
      <RoundedBox position={[0, 1.08, -0.35]} args={[1.43, 0.65, 0.25]} radius={0.1} smoothness={3}><meshStandardMaterial color="#ddb38b" /></RoundedBox>
      <Cushion at={[0.2, 1.05, 0]} color={i % 2 ? '#74446f' : '#a56e9e'} rotation={i * 0.4} />
    </group>)}
    <SpiralStairs />
    <Cushion at={[-1.6, 0.25, -3.8]} color="#816098" rotation={0.4} />
    <Cushion at={[1.6, 0.25, -3.8]} color="#ac79a3" rotation={-0.4} />
    <group position={[-0.65, 0.2, -3.5]} rotation={[0, -0.3, 0]}>
      <Box at={[0, 0, 0]} size={[0.65, 0.14, 0.5]} color="#9f5139" />
      <Box at={[0, 0.1, 0]} size={[0.58, 0.09, 0.46]} color="#efcf96" />
    </group>
    <FloatingBooks reduced={reduced} />
    <Sparkles count={110} position={[0, 3.4, 0]} scale={[13, 6, 14]} size={3.5} speed={reduced ? 0 : 0.25} color="#ffd77e" />
    <Sparkles count={25} position={[0, 4.5, -1]} scale={[3, 3, 2]} size={6} speed={reduced ? 0 : 0.15} color="#fff1bf" />
  </>;
}

export default function LibraryRoom({ onBack }: { onBack: () => void }) {
  const [ready, setReady] = useState(false);
  const [reduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  return <div className="library-room">
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 3, 5.6], fov: 72, far: 80 }}>
      <LibraryWorld onReady={() => setReady(true)} reduced={reduced} onBack={onBack} />
    </Canvas>
    <header className="library-heading"><span>THE CASTLE’S READING ROOM</span><h1>The enchanted library</h1></header>
    <button className="castle-return" onClick={onBack}>Back to hall</button>
    <p className="library-hint">Click the wooden door to return to the guest hall.<span>Drag for a 360° view · scroll or pinch to zoom</span></p>
    <div className={`room-loading-veil${ready ? ' is-ready' : ''}`} role="status">{!ready && <p>Opening the library…</p>}</div>
  </div>;
}
