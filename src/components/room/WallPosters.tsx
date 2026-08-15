import { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';

const POSTERS = [
  { title: 'LEVI ACKERMAN',  sub: 'リヴァイ・アッカーマン', accent: '#4488ff', x: 1.4 },
  { title: 'HINATA HYUGA',   sub: '日向ヒナタ',            accent: '#8855ff', x: 3.2 },
  { title: 'MIKASA ACKERMAN', sub: 'ミカサ・アッカーマン',  accent: '#ff4455', x: 5.0 },
];

function buildPosterTex(title: string, sub: string, accent: string) {
  const W = 256, H = 384;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d')!;

  // BG gradient
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#0a0c1a');
  bg.addColorStop(1, '#06040e');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Character silhouette panel
  ctx.fillStyle = '#0d1224';
  ctx.beginPath();
  ctx.roundRect(18, 14, W - 36, 290, 8);
  ctx.fill();

  // Subtle character outline (abstract shapes to suggest a figure)
  ctx.strokeStyle = 'rgba(100, 140, 200, 0.18)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(W / 2, 100, 50, 70, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(W / 2, 210, 60, 90, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Accent bar at bottom of image area
  ctx.fillStyle = accent;
  ctx.globalAlpha = 0.85;
  ctx.fillRect(18, 300, W - 36, 3);
  ctx.globalAlpha = 1;

  // Title text
  ctx.fillStyle = 'rgba(220, 230, 248, 0.92)';
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title.split(' ')[0], W / 2, 326);
  if (title.split(' ')[1]) {
    ctx.fillText(title.split(' ')[1], W / 2, 348);
  }

  // Japanese subtitle
  ctx.fillStyle = 'rgba(140, 160, 200, 0.72)';
  ctx.font = '11px sans-serif';
  ctx.fillText(sub, W / 2, 370);

  // Outer border glow
  ctx.strokeStyle = accent;
  ctx.globalAlpha = 0.3;
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, W - 2, H - 2);
  ctx.globalAlpha = 1;

  return new THREE.CanvasTexture(c);
}

type Props = { onSelect: () => void; isActive: boolean };

export default function WallPosters({ onSelect, isActive }: Props) {
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'default';
    return () => { document.body.style.cursor = 'default'; };
  }, [hovered]);

  const textures = useMemo(
    () => POSTERS.map((p) => buildPosterTex(p.title, p.sub, p.accent)),
    []
  );

  const frameGlow = (hovered || isActive) ? 3.5 : 0.4;

  return (
    <group
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={onSelect}
    >
      {POSTERS.map((p, i) => (
        <group key={p.title} position={[p.x, 4.8, -5.9]}>
          {/* Outer frame */}
          <mesh castShadow>
            <boxGeometry args={[1.35, 1.82, 0.06]} />
            <meshStandardMaterial
              color="#07000f"
              emissive={p.accent}
              emissiveIntensity={frameGlow * 0.25}
              metalness={0.35}
              roughness={0.55}
            />
          </mesh>

          {/* Poster image */}
          <mesh position={[0, 0, 0.035]}>
            <planeGeometry args={[1.22, 1.68]} />
            <meshStandardMaterial map={textures[i]} />
          </mesh>

          {/* Frame accent LED line */}
          <mesh position={[0, -0.88, 0.034]}>
            <boxGeometry args={[1.35, 0.025, 0.01]} />
            <meshStandardMaterial
              color={p.accent}
              emissive={p.accent}
              emissiveIntensity={frameGlow * 1.5}
            />
          </mesh>
        </group>
      ))}

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
