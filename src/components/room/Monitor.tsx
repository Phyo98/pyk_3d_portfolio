import { RoundedBox, useTexture } from '@react-three/drei';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import wallpaperImg from '../../assets/monitor/wallpaper.webp';

/* Lavender monitor: rounded bezel with a deeper chin and star logo, a night-sky
   wallpaper on the screen, a dark purple back housing with vents and a glowing
   ring at the stand mount, a lavender neck with a cable slot, and a rounded base.
   Coordinates are in DeskSetup space: the screen is 1.72 × 1.08, centred on
   (3.5, 2.88) at z = -3.5, exactly where the old one was, so the portrait and
   the "About" camera view still line up. */

const X = 3.5;
const SCREEN_Y = 2.88;
const SCREEN_Z = -3.5;
const SW = 1.72;
const SH = 1.08;
const DESK_TOP = 1.86;

const MAT = {
  bezel: new THREE.MeshStandardMaterial({ color: '#8d76c0', roughness: 0.45, metalness: 0.05 }),
  housing: new THREE.MeshStandardMaterial({ color: '#3b2160', roughness: 0.55, metalness: 0.05 }),
  base: new THREE.MeshStandardMaterial({ color: '#40246a', roughness: 0.5, metalness: 0.05 }),
  dark: new THREE.MeshStandardMaterial({ color: '#1c0f2e', roughness: 0.8 }),
  logo: new THREE.MeshStandardMaterial({ color: '#5d4392', roughness: 0.5 }),
  ring: new THREE.MeshStandardMaterial({ color: '#b07aff', emissive: '#b07aff', emissiveIntensity: 1.2, toneMapped: false }),
};

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

type Props = {
  /** 0..1 — screen brightness, raised on hover / when the About section is open */
  brightness: number;
  onPointerOver: () => void;
  onPointerOut: () => void;
  onClick: () => void;
};

export default function Monitor({ brightness, onPointerOver, onPointerOut, onClick }: Props) {
  const wallpaper = useTexture(wallpaperImg);
  useEffect(() => {
    wallpaper.colorSpace = THREE.SRGBColorSpace;
    wallpaper.anisotropy = 8;
    wallpaper.needsUpdate = true;
  }, [wallpaper]);

  const star = useMemo(() => new THREE.ShapeGeometry(starShape(0.032, 0.014)), []);
  const screenColor = useMemo(() => new THREE.Color(), []);
  screenColor.setScalar(brightness);

  /* bezel: thin at the top and sides, a deeper chin below the screen */
  const top = 0.07;
  const side = 0.07;
  const chin = 0.16;
  const bezelW = SW + side * 2;
  const bezelH = SH + top + chin;
  const bezelY = SCREEN_Y + (top - chin) / 2;
  const bezelZ = SCREEN_Z - 0.045;

  const neckTop = SCREEN_Y - 0.12;
  const neckBottom = DESK_TOP + 0.05;
  const neckZ = SCREEN_Z - 0.2;  // against the back housing

  return (
    <group>
      {/* ── head: bezel, screen, back housing — clickable for the About section ── */}
      <group onPointerOver={onPointerOver} onPointerOut={onPointerOut} onClick={onClick}>
        <RoundedBox args={[bezelW, bezelH, 0.07]} radius={0.03} smoothness={4}
          position={[X, bezelY, bezelZ]} material={MAT.bezel} castShadow />
        <mesh position={[X, SCREEN_Y, SCREEN_Z - 0.008]}>
          <planeGeometry args={[SW, SH]} />
          <meshBasicMaterial map={wallpaper} color={screenColor} />
        </mesh>
        {/* rear housing bulge */}
        <RoundedBox args={[bezelW - 0.16, bezelH - 0.14, 0.09]} radius={0.04} smoothness={4}
          position={[X, bezelY, bezelZ - 0.07]} material={MAT.housing} castShadow />
      </group>

      {/* star logo on the chin */}
      <mesh geometry={star} material={MAT.logo} position={[X, SCREEN_Y - SH / 2 - chin / 2, bezelZ + 0.036]} />

      {/* rear vents, port bay and the glowing ring around the stand mount */}
      {[-1, 1].map((s) => (
        <group key={s} position={[X + s * 0.5, SCREEN_Y + 0.4, bezelZ - 0.116]}>
          {Array.from({ length: 9 }, (_, i) => (
            <mesh key={i} material={MAT.dark} position={[(i - 4) * 0.045, 0, 0]}>
              <boxGeometry args={[0.018, 0.09, 0.004]} />
            </mesh>
          ))}
        </group>
      ))}
      <mesh material={MAT.dark} position={[X + 0.12, SCREEN_Y - 0.36, bezelZ - 0.116]}>
        <boxGeometry args={[0.7, 0.13, 0.004]} />
      </mesh>
      <mesh material={MAT.ring} position={[X, SCREEN_Y + 0.02, bezelZ - 0.118]}>
        <torusGeometry args={[0.15, 0.012, 10, 48]} />
      </mesh>

      {/* ── stand: lavender neck with a cable slot, rounded base ── */}
      <RoundedBox args={[0.17, neckTop - neckBottom, 0.08]} radius={0.035} smoothness={4}
        position={[X, (neckTop + neckBottom) / 2, neckZ]} rotation={[0.1, 0, 0]} material={MAT.bezel} castShadow />
      <RoundedBox args={[0.06, 0.14, 0.02]} radius={0.01} smoothness={2}
        position={[X, neckBottom + 0.2, neckZ + 0.022]} rotation={[0.1, 0, 0]} material={MAT.dark} />
      <RoundedBox args={[0.74, 0.05, 0.44]} radius={0.024} smoothness={4}
        position={[X, DESK_TOP + 0.025, neckZ + 0.1]} material={MAT.base} castShadow receiveShadow />
    </group>
  );
}
