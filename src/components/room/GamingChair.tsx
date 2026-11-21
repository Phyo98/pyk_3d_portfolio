import { RoundedBox } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';

/* Lavender racing-style gaming chair with cat ears, a star lumbar pillow,
   piped edges, adjustable arms and a five-star base on casters.
   Origin is on the floor under the seat; the chair faces +z. */

const MAT = {
  shell: new THREE.MeshPhysicalMaterial({
    color: '#56208f', roughness: 0.8, sheen: 0.5, sheenColor: new THREE.Color('#a26ae0'), sheenRoughness: 0.6,
  }),
  cushion: new THREE.MeshPhysicalMaterial({
    color: '#7a5cad', roughness: 0.92, sheen: 0.4, sheenColor: new THREE.Color('#b9a0e0'), sheenRoughness: 0.6,
  }),
  piping: new THREE.MeshStandardMaterial({ color: '#b293de', roughness: 0.6 }),
  earInner: new THREE.MeshStandardMaterial({ color: '#e7a9d9', roughness: 0.8 }),
  plastic: new THREE.MeshStandardMaterial({ color: '#4a1b7c', roughness: 0.45, metalness: 0.05 }),
  caster: new THREE.MeshStandardMaterial({ color: '#a988dc', roughness: 0.5 }),
  seam: new THREE.MeshStandardMaterial({ color: '#7e5ab4', roughness: 0.9 }),
};

const SEAT_Y   = 0.86;  // underside of the seat shell
const SEAT_W   = 0.86;
const SEAT_D   = 0.78;
const BACK_LEAN = -0.13; // radians, top tilts away from the front

/* right half of the backrest silhouette (x, y), bottom to top; y = 0 is seat level */
const BACK_OUTLINE: [number, number][] = [
  [0.31, 0.0], [0.34, 0.12], [0.3, 0.38], [0.34, 0.62], [0.39, 0.86],
  [0.37, 1.06], [0.29, 1.2], [0.15, 1.29], [0, 1.31],
];

/* closed loop through the outline, mirrored, scaled and lifted */
function backLoop(sx = 1, sy = 1, dy = 0) {
  const right = BACK_OUTLINE.map(([x, y]) => new THREE.Vector2(x * sx, y * sy + dy));
  const left = right.slice(0, -1).reverse().map((v) => new THREE.Vector2(-v.x, v.y));
  return [new THREE.Vector2(0, dy), ...right, ...left];
}

function backShape(sx = 1, sy = 1, dy = 0) {
  const pts = backLoop(sx, sy, dy);
  const s = new THREE.Shape();
  s.moveTo(pts[0].x, pts[0].y);
  s.splineThru(pts.slice(1));
  s.closePath();
  return s;
}

function starShape(outer: number, inner: number) {
  const s = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? inner : outer;
    const a = Math.PI / 2 + (i * Math.PI) / 5;
    if (i === 0) s.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else s.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  s.closePath();
  return s;
}

function Backrest() {
  const geo = useMemo(() => {
    const shell = new THREE.ExtrudeGeometry(backShape(), {
      depth: 0.1, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.035, bevelSegments: 4, curveSegments: 24,
    });
    const pad = new THREE.ExtrudeGeometry(backShape(0.6, 0.82, 0.08), {
      depth: 0.03, bevelEnabled: true, bevelThickness: 0.035, bevelSize: 0.03, bevelSegments: 4, curveSegments: 24,
    });
    /* piping traced just inside the shell's front edge */
    const loop = new THREE.SplineCurve(backLoop(0.9, 0.95, 0.03)).getPoints(120);
    const curve = new THREE.CatmullRomCurve3(loop.map((p) => new THREE.Vector3(p.x, p.y, 0)), true);
    const piping = new THREE.TubeGeometry(curve, 160, 0.011, 6, true);
    return { shell, pad, piping };
  }, []);

  return (
    <group position={[0, SEAT_Y + 0.12, -SEAT_D / 2 + 0.06]} rotation={[BACK_LEAN, 0, 0]}>
      {/* shell: front face at z = 0 */}
      <mesh geometry={geo.shell} material={MAT.shell} position={[0, 0, -0.1]} castShadow />
      <mesh geometry={geo.piping} material={MAT.piping} position={[0, 0, 0.04]} />
      {/* lavender cushion with tufted channels */}
      <mesh geometry={geo.pad} material={MAT.cushion} position={[0, 0, 0.02]} />
      {[0.42, 0.66, 0.88].map((y) => (
        <mesh key={y} material={MAT.seam} position={[0, y, 0.088]}>
          <boxGeometry args={[0.36, 0.012, 0.01]} />
        </mesh>
      ))}

      {/* cat ears */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.2, 1.34, -0.03]} rotation={[0, 0, s * -0.3]}>
          <mesh material={MAT.shell} scale={[1, 1, 0.5]} castShadow>
            <coneGeometry args={[0.1, 0.2, 24]} />
          </mesh>
          <mesh material={MAT.earInner} position={[0, -0.015, 0.04]} scale={[1, 1, 0.25]}>
            <coneGeometry args={[0.062, 0.14, 24]} />
          </mesh>
        </group>
      ))}

      <LumbarPillow />
    </group>
  );
}

function LumbarPillow() {
  const star = useMemo(() => {
    const s = starShape(0.055, 0.024);
    s.holes.push(new THREE.Path(starShape(0.043, 0.017).getPoints().reverse()));
    return new THREE.ShapeGeometry(s);
  }, []);
  return (
    <group position={[0, 0.25, 0.14]}>
      <mesh material={MAT.cushion} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 0.75]} castShadow>
        <capsuleGeometry args={[0.085, 0.3, 8, 20]} />
      </mesh>
      <mesh geometry={star} material={MAT.piping} position={[0.12, 0.005, 0.066]} />
    </group>
  );
}

function Seat() {
  return (
    <group position={[0, SEAT_Y, 0]}>
      {/* bucket shell */}
      <RoundedBox args={[SEAT_W, 0.14, SEAT_D]} radius={0.05} smoothness={4}
        position={[0, 0.07, 0]} material={MAT.shell} castShadow receiveShadow />
      {/* raised side bolsters with piping along their tops */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * (SEAT_W / 2 - 0.09), 0.18, 0.01]}>
          <RoundedBox args={[0.17, 0.11, SEAT_D - 0.04]} radius={0.05} smoothness={4}
            material={MAT.shell} castShadow />
          <mesh material={MAT.piping} position={[s * -0.06, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.009, 0.009, SEAT_D - 0.1, 6]} />
          </mesh>
        </group>
      ))}
      {/* lavender cushion */}
      <RoundedBox args={[SEAT_W - 0.34, 0.1, SEAT_D - 0.06]} radius={0.045} smoothness={4}
        position={[0, 0.18, 0.02]} material={MAT.cushion} receiveShadow />
      {/* tilt mechanism and height lever */}
      <mesh material={MAT.plastic} position={[0, -0.04, 0]}>
        <boxGeometry args={[0.3, 0.07, 0.3]} />
      </mesh>
      <mesh material={MAT.plastic} position={[0.22, -0.05, 0.08]} rotation={[0, 0, Math.PI / 2 - 0.25]}>
        <cylinderGeometry args={[0.013, 0.013, 0.22, 8]} />
      </mesh>
    </group>
  );
}

function Armrests() {
  return (
    <>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * (SEAT_W / 2 + 0.03), SEAT_Y, -0.04]}>
          {/* mounting bracket under the seat, then the upright post */}
          <mesh material={MAT.plastic} position={[s * -0.06, 0.03, 0]}>
            <boxGeometry args={[0.14, 0.05, 0.12]} />
          </mesh>
          <mesh material={MAT.plastic} position={[0, 0.2, 0]} castShadow>
            <boxGeometry args={[0.06, 0.36, 0.1]} />
          </mesh>
          <mesh material={MAT.plastic} position={[s * 0.035, 0.16, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.025, 0.025, 0.02, 14]} />
          </mesh>
          {/* padded top */}
          <RoundedBox args={[0.13, 0.06, 0.34]} radius={0.028} smoothness={4}
            position={[0, 0.4, 0.04]} material={MAT.cushion} castShadow />
        </group>
      ))}
    </>
  );
}

function Base() {
  const legs = Array.from({ length: 5 }, (_, i) => (i * Math.PI * 2) / 5 + Math.PI / 10);
  return (
    <group>
      {/* gas lift with a lavender cover */}
      <mesh material={MAT.plastic} position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.7, 14]} />
      </mesh>
      <mesh material={MAT.caster} position={[0, 0.34, 0]}>
        <cylinderGeometry args={[0.055, 0.06, 0.3, 18]} />
      </mesh>
      <mesh material={MAT.plastic} position={[0, 0.17, 0]}>
        <cylinderGeometry args={[0.09, 0.11, 0.08, 18]} />
      </mesh>
      {/* five-star base with casters */}
      {legs.map((a) => (
        <group key={a} rotation={[0, a, 0]}>
          <mesh material={MAT.plastic} position={[0, 0.15, 0.21]} rotation={[0.12, 0, 0]} castShadow>
            <boxGeometry args={[0.07, 0.05, 0.42]} />
          </mesh>
          <group position={[0, 0, 0.42]}>
            <mesh material={MAT.plastic} position={[0, 0.1, 0]}>
              <boxGeometry args={[0.05, 0.05, 0.06]} />
            </mesh>
            {[-1, 1].map((s) => (
              <mesh key={s} material={MAT.caster} position={[s * 0.022, 0.045, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.045, 0.045, 0.03, 18]} />
              </mesh>
            ))}
          </group>
        </group>
      ))}
    </group>
  );
}

export default function GamingChair({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <Base />
      <Seat />
      <Armrests />
      <Backrest />
    </group>
  );
}
