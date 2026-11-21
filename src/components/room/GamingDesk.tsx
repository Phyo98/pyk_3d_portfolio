import { RoundedBox } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';

/* Lavender gaming desk: ergonomic top with a curved front cut-out and a glowing
   purple edge band, a slanted metal sled leg on the left, a floating two-drawer
   pedestal on the right, and a frame beam underneath.
   Positioned so the top surface sits at y = 1.86, where the monitor, keyboard
   and the rest of the desk items already rest. Front faces +z. */

const CX = 3.2;           // desk centre
const CZ = -3;
const HALF_W = 1.9;       // 3.8 wide
const HALF_D = 0.825;     // 1.65 deep
const TOP_Y = 1.86;       // upper surface
const SLAB = 0.06;        // lavender top thickness
const BAND = 0.025;       // neon band under the top
const CUT = 0.18;         // depth of the ergonomic front cut-out
const CORNER = 0.2;

const MAT = {
  /* darker than the reference so it reads lavender, not white, under the room's exposure */
  top: new THREE.MeshStandardMaterial({ color: '#6f5a9c', roughness: 0.55, metalness: 0.05 }),
  metal: new THREE.MeshStandardMaterial({ color: '#3b3450', roughness: 0.38, metalness: 0.65 }),
  cabinet: new THREE.MeshStandardMaterial({ color: '#3a1a5c', roughness: 0.6, metalness: 0.08 }),
  seam: new THREE.MeshStandardMaterial({ color: '#1c0b2e', roughness: 0.8 }),
  grommet: new THREE.MeshStandardMaterial({ color: '#6f5a96', roughness: 0.4, metalness: 0.3 }),
};

/* desk outline in plan view: x across, y toward the back (front edge at y = -HALF_D) */
function deskShape(inset = 0) {
  const W = HALF_W - inset;
  const D = HALF_D - inset;
  const r = CORNER;
  const s = new THREE.Shape();
  s.moveTo(-W + r, -D);
  s.lineTo(-1.0, -D);
  s.bezierCurveTo(-0.6, -D, -0.6, -D + CUT, 0, -D + CUT);
  s.bezierCurveTo(0.6, -D + CUT, 0.6, -D, 1.0, -D);
  s.lineTo(W - r, -D);
  s.quadraticCurveTo(W, -D, W, -D + r);
  s.lineTo(W, D - r);
  s.quadraticCurveTo(W, D, W - r, D);
  s.lineTo(-W + r, D);
  s.quadraticCurveTo(-W, D, -W, D - r);
  s.lineTo(-W, -D + r);
  s.quadraticCurveTo(-W, -D, -W + r, -D);
  return s;
}

/* a metal tube between two points */
function Strut({ from, to, size = 0.06 }: { from: [number, number, number]; to: [number, number, number]; size?: number }) {
  const { pos, quat, len } = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const dir = b.clone().sub(a);
    return {
      pos: a.clone().add(b).multiplyScalar(0.5),
      quat: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize()),
      len: dir.length(),
    };
  }, [from, to]);
  return (
    <mesh position={pos} quaternion={quat} material={MAT.metal} castShadow>
      <boxGeometry args={[size, len, size]} />
    </mesh>
  );
}

type Props = {
  glow: number;
  onPointerOver: () => void;
  onPointerOut: () => void;
  onClick: () => void;
};

export default function GamingDesk({ glow, onPointerOver, onPointerOut, onClick }: Props) {
  const { slab, band } = useMemo(() => ({
    slab: new THREE.ExtrudeGeometry(deskShape(0.02), {
      depth: SLAB - 0.02, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.02, bevelSegments: 3, curveSegments: 24,
    }),
    band: new THREE.ExtrudeGeometry(deskShape(0.012), { depth: BAND, bevelEnabled: false, curveSegments: 24 }),
  }), []);

  const neon = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#8f3bff', emissive: '#8f3bff', toneMapped: false }),
    [],
  );
  neon.emissiveIntensity = 0.35 + glow * 0.22;

  /* the shapes are drawn in plan; this turns them flat (shape y → room -z) */
  const flat: [number, number, number] = [-Math.PI / 2, 0, 0];
  const underTop = TOP_Y - SLAB - BAND;

  /* left sled leg: two slanted posts, a floor rail and a diagonal brace */
  const legX = CX - HALF_W + 0.22;
  const zF = CZ + HALF_D - 0.22;
  const zB = CZ - HALF_D + 0.22;

  /* right pedestal hanging under the top */
  const pedW = 0.78;
  const pedD = 1.15;
  const pedH = 0.86;
  const pedX = CX + HALF_W - 0.2 - pedW / 2;
  const pedY = underTop - pedH / 2 - 0.04;
  const pedZ = CZ - 0.05;

  return (
    <group>
      {/* ── top: lavender slab over a neon band, clickable for the Skills section ── */}
      <group onPointerOver={onPointerOver} onPointerOut={onPointerOut} onClick={onClick}>
        <mesh geometry={slab} material={MAT.top} rotation={flat} position={[CX, TOP_Y - SLAB + 0.01, CZ]} castShadow receiveShadow />
        <mesh geometry={band} material={neon} rotation={flat} position={[CX, underTop, CZ]} />
      </group>

      {/* cable grommet at the back */}
      <mesh material={MAT.grommet} position={[CX - 0.9, TOP_Y + 0.003, CZ - HALF_D + 0.2]}>
        <boxGeometry args={[0.5, 0.008, 0.13]} />
      </mesh>
      <mesh material={MAT.seam} position={[CX - 0.9, TOP_Y + 0.006, CZ - HALF_D + 0.2]}>
        <boxGeometry args={[0.44, 0.006, 0.07]} />
      </mesh>

      {/* ── under-frame: side rails and a beam along the back ── */}
      <mesh material={MAT.metal} position={[CX, underTop - 0.04, CZ - HALF_D + 0.3]}>
        <boxGeometry args={[HALF_W * 2 - 0.4, 0.07, 0.06]} />
      </mesh>
      {[legX, CX + HALF_W - 0.22].map((x) => (
        <mesh key={x} material={MAT.metal} position={[x, underTop - 0.035, CZ]}>
          <boxGeometry args={[0.07, 0.07, HALF_D * 2 - 0.3]} />
        </mesh>
      ))}

      {/* ── left sled leg ── */}
      <Strut from={[legX - 0.14, 0.03, zF + 0.12]} to={[legX, underTop - 0.06, zF]} />
      <Strut from={[legX - 0.14, 0.03, zB - 0.12]} to={[legX, underTop - 0.06, zB]} />
      <Strut from={[legX - 0.14, 0.03, zB - 0.15]} to={[legX - 0.14, 0.03, zF + 0.15]} size={0.07} />
      <Strut from={[legX - 0.12, 0.08, zF + 0.1]} to={[legX + 0.7, underTop - 0.08, zF]} size={0.045} />

      {/* ── right pedestal: two drawers, floating, held by a slim rear post ── */}
      <group position={[pedX, pedY, pedZ]}>
        <RoundedBox args={[pedW, pedH, pedD]} radius={0.025} smoothness={3} material={MAT.cabinet} castShadow receiveShadow />
        {/* drawer split and recessed pulls on the front face */}
        <mesh material={MAT.seam} position={[0, 0, pedD / 2 + 0.001]}>
          <boxGeometry args={[pedW - 0.06, 0.012, 0.004]} />
        </mesh>
        {[pedH * 0.25, -pedH * 0.25].map((y) => (
          <mesh key={y} material={MAT.seam} position={[0, y + pedH * 0.17, pedD / 2 + 0.002]}>
            <boxGeometry args={[0.3, 0.018, 0.004]} />
          </mesh>
        ))}
      </group>
      <Strut from={[pedX + pedW / 2 - 0.02, 0.03, pedZ - pedD / 2 - 0.06]} to={[pedX + pedW / 2 - 0.02, underTop - 0.06, pedZ - pedD / 2 - 0.06]} size={0.05} />
      <Strut from={[pedX + pedW / 2 - 0.02, 0.03, pedZ - pedD / 2 - 0.06]} to={[pedX + pedW / 2 - 0.02, 0.03, pedZ + pedD / 2 - 0.1]} size={0.05} />
    </group>
  );
}
