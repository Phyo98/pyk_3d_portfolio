import { useTexture } from '@react-three/drei';
import { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import luffyImg from '../../assets/posters/luffy.webp';
import tanjiroImg from '../../assets/posters/tanjiro.webp';
import gojoImg from '../../assets/posters/gojo.webp';

/* Three backlit anime posters in neon frames, clipped to the wall under the shelf.
   The artwork (with its name plate) is cut from the reference image; frame, neon
   edge, clip and the light spilling onto the wall are built here. */

const POSTERS = [
  { id: 'luffy',   img: luffyImg,   accent: '#3f6dff', x: 1.4 },
  { id: 'tanjiro', img: tanjiroImg, accent: '#9a4dff', x: 3.2 },
  { id: 'gojo',    img: gojoImg,    accent: '#ff3b5c', x: 5.0 },
];

const ART_W  = 1.06;
const ART_H  = ART_W * (739 / 376);  // keep the artwork's proportions
const BORDER = 0.07;
const OUT_W  = ART_W + BORDER * 2;
const OUT_H  = ART_H + BORDER * 2;
const DEPTH  = 0.06;
const WALL_Z = -5.9;
const TOP_Y  = 5.86;                 // just under the shelf
const CENTER_Y = TOP_Y - OUT_H / 2;

/* keeps bright art (white hair, highlights) from blooming into a blob */
const ART_TINT = new THREE.Color(0.82, 0.82, 0.82);

/* soft radial glow, coloured per poster by the material */
function glowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(64, 64, 10, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,0.9)');
  g.addColorStop(0.5, 'rgba(255,255,255,0.35)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

function Poster({ img, accent, x, glow }: { img: string; accent: string; x: number; glow: number }) {
  const art = useTexture(img);
  const halo = useMemo(glowTexture, []);

  useEffect(() => {
    art.colorSpace = THREE.SRGBColorSpace;
    art.anisotropy = 8;
    art.needsUpdate = true;
  }, [art]);

  const frameMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#140b20', metalness: 0.4, roughness: 0.45, emissive: accent }),
    [accent],
  );
  const neonMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: accent, emissive: accent, toneMapped: false }),
    [accent],
  );

  /* hover / active brightens the frame and its neon edge */
  frameMat.emissiveIntensity = glow * 0.18;
  neonMat.emissiveIntensity = glow * 0.9;

  /* frame bars: top, bottom, left, right */
  const bars: [number, number, number, number][] = [
    [0,  OUT_H / 2 - BORDER / 2, OUT_W, BORDER],
    [0, -OUT_H / 2 + BORDER / 2, OUT_W, BORDER],
    [-OUT_W / 2 + BORDER / 2, 0, BORDER, OUT_H - BORDER * 2],
    [ OUT_W / 2 - BORDER / 2, 0, BORDER, OUT_H - BORDER * 2],
  ];
  /* neon strips just inside the frame */
  const s = 0.012;
  const strips: [number, number, number, number][] = [
    [0,  ART_H / 2 + s / 2, ART_W + s * 2, s],
    [0, -ART_H / 2 - s / 2, ART_W + s * 2, s],
    [-ART_W / 2 - s / 2, 0, s, ART_H],
    [ ART_W / 2 + s / 2, 0, s, ART_H],
  ];

  return (
    <group position={[x, CENTER_Y, WALL_Z]}>
      {/* light spilling onto the wall */}
      <mesh position={[0, 0, -0.02]} scale={[OUT_W * 1.9, OUT_H * 1.45, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={halo}
          color={accent}
          transparent
          opacity={0.12 + glow * 0.05}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* backing board */}
      <mesh position={[0, 0, DEPTH / 2 - 0.01]} castShadow>
        <boxGeometry args={[OUT_W, OUT_H, DEPTH - 0.02]} />
        <meshStandardMaterial color="#0a0612" roughness={0.8} />
      </mesh>

      {bars.map(([bx, by, w, h], i) => (
        <mesh key={i} material={frameMat} position={[bx, by, DEPTH / 2]}>
          <boxGeometry args={[w, h, DEPTH]} />
        </mesh>
      ))}
      {strips.map(([sx, sy, w, h], i) => (
        <mesh key={`n${i}`} material={neonMat} position={[sx, sy, DEPTH + 0.002]}>
          <boxGeometry args={[w, h, 0.006]} />
        </mesh>
      ))}

      {/* artwork, lit from behind so it reads in the dim room */}
      <mesh position={[0, 0, DEPTH - 0.004]}>
        <planeGeometry args={[ART_W, ART_H]} />
        <meshBasicMaterial map={art} color={ART_TINT} />
      </mesh>

      {/* hanging clip at the top */}
      <group position={[0, OUT_H / 2, DEPTH + 0.01]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.09, 0.13, 0.035]} />
          <meshStandardMaterial color="#1b1820" metalness={0.6} roughness={0.35} />
        </mesh>
        <mesh position={[0, -0.03, 0.02]}>
          <boxGeometry args={[0.07, 0.04, 0.01]} />
          <meshStandardMaterial color="#2c2833" metalness={0.6} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
}

type Props = { onSelect: () => void; isActive: boolean };

export default function WallPosters({ onSelect, isActive }: Props) {
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'default';
    return () => { document.body.style.cursor = 'default'; };
  }, [hovered]);

  const glow = (hovered || isActive) ? 3.2 : 1.4;

  return (
    <group
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={onSelect}
    >
      {POSTERS.map((p) => <Poster key={p.id} img={p.img} accent={p.accent} x={p.x} glow={glow} />)}

      {/* Shelf above posters */}
      <mesh position={[3.2, 5.96, -5.76]} castShadow>
        <boxGeometry args={[4.8, 0.08, 0.32]} />
        <meshStandardMaterial color="#1a0e06" roughness={0.65} metalness={0.12} />
      </mesh>

      {/* Shelf bracket left */}
      <mesh position={[0.9, 5.72, -5.76]}>
        <boxGeometry args={[0.06, 0.4, 0.28]} />
        <meshStandardMaterial color="#1a0e06" roughness={0.65} />
      </mesh>

      {/* Shelf bracket right */}
      <mesh position={[5.5, 5.72, -5.76]}>
        <boxGeometry args={[0.06, 0.4, 0.28]} />
        <meshStandardMaterial color="#1a0e06" roughness={0.65} />
      </mesh>

      {/* Small objects on shelf */}
      {/* Tiny figure 1 */}
      <mesh position={[4.4, 6.12, -5.72]}>
        <boxGeometry args={[0.12, 0.24, 0.1]} />
        <meshStandardMaterial color="#220033" roughness={0.7} />
      </mesh>
      {/* Tiny figure 2 */}
      <mesh position={[4.15, 6.14, -5.72]}>
        <sphereGeometry args={[0.08, 6, 6]} />
        <meshStandardMaterial color="#331100" roughness={0.7} />
      </mesh>
    </group>
  );
}
