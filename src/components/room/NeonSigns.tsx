import { useMemo } from 'react';
import * as THREE from 'three';

function neonCanvas(
  lines: string[],
  color: string,
  w: number,
  h: number,
  fontSize: number,
) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d')!;
  ctx.clearRect(0, 0, w, h);

  const lineH = fontSize * 1.55;
  const totalH = lines.length * lineH;
  const startY = (h - totalH) / 2 + fontSize;

  lines.forEach((line, i) => {
    const y = startY + i * lineH;

    for (let pass = 4; pass >= 1; pass--) {
      ctx.save();
      ctx.shadowColor = color;
      ctx.shadowBlur  = pass * 18;
      ctx.globalAlpha = 0.18 * pass;
      ctx.fillStyle   = color;
      ctx.font        = `bold ${fontSize}px sans-serif`;
      ctx.textAlign   = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(line, w / 2, y);
      ctx.restore();
    }

    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur  = 6;
    ctx.fillStyle   = '#ffffff';
    ctx.font        = `bold ${fontSize}px sans-serif`;
    ctx.textAlign   = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(line, w / 2, y);
    ctx.restore();
  });

  return new THREE.CanvasTexture(c);
}

function NeonPlane({
  lines,
  color,
  canvasW,
  canvasH,
  fontSize,
  planeW,
  planeH,
  position,
  rotation,
}: {
  lines: string[];
  color: string;
  canvasW: number;
  canvasH: number;
  fontSize: number;
  planeW: number;
  planeH: number;
  position: [number, number, number];
  rotation?: [number, number, number];
}) {
  const tex = useMemo(
    () => neonCanvas(lines, color, canvasW, canvasH, fontSize),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <mesh position={position} rotation={rotation ? rotation : [0, 0, 0]}>
      <planeGeometry args={[planeW, planeH]} />
      <meshBasicMaterial map={tex} transparent side={THREE.DoubleSide} />
    </mesh>
  );
}

function ledSignCanvas(
  lines: string[],
  textColor: string,
  ledColor: string,
  w: number,
  h: number,
  fontSize: number,
) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d')!;

  // Dark board background
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#0a080f');
  bg.addColorStop(1, '#100a18');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Subtle inner bevel
  ctx.strokeStyle = '#1e1a2e';
  ctx.lineWidth = 2;
  ctx.strokeRect(3, 3, w - 6, h - 6);

  // LED border dots
  const spacing = Math.round(w / 22);
  const dotR = Math.max(3, spacing * 0.26);
  const pad = Math.round(spacing * 0.7);

  const drawLed = (x: number, y: number) => {
    ctx.save();
    ctx.fillStyle = '#14111e';
    ctx.beginPath();
    ctx.arc(x, y, dotR + 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.shadowColor = ledColor;
    ctx.shadowBlur = dotR * 3.5;
    ctx.fillStyle = ledColor;
    ctx.beginPath();
    ctx.arc(x, y, dotR, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fffbe8';
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.arc(x - dotR * 0.3, y - dotR * 0.3, dotR * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  for (let x = pad; x <= w - pad; x += spacing) { drawLed(x, pad); drawLed(x, h - pad); }
  for (let y = pad + spacing; y < h - pad; y += spacing) { drawLed(pad, y); drawLed(w - pad, y); }

  // Inner separator line
  const inset = pad + spacing * 0.5;
  ctx.strokeStyle = '#1e1a2e';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(inset, inset, w - inset * 2, h - inset * 2);

  // Text
  const lineH = fontSize * 1.45;
  const totalH = lines.length * lineH;
  const startY = (h - totalH) / 2 + fontSize;

  lines.forEach((line, i) => {
    const y = startY + i * lineH;

    for (let pass = 3; pass >= 1; pass--) {
      ctx.save();
      ctx.shadowColor = textColor;
      ctx.shadowBlur = pass * 14;
      ctx.globalAlpha = 0.28 * pass;
      ctx.fillStyle = textColor;
      ctx.font = `bold ${fontSize}px 'Courier New', monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(line, w / 2, y);
      ctx.restore();
    }

    ctx.save();
    ctx.shadowColor = '#fff8e0';
    ctx.shadowBlur = 5;
    ctx.fillStyle = '#fff8e8';
    ctx.font = `bold ${fontSize}px 'Courier New', monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(line, w / 2, y);
    ctx.restore();
  });

  return new THREE.CanvasTexture(c);
}

function LEDSignboard({
  lines,
  textColor,
  ledColor,
  canvasW,
  canvasH,
  fontSize,
  planeW,
  planeH,
  position,
  rotation,
}: {
  lines: string[];
  textColor: string;
  ledColor: string;
  canvasW: number;
  canvasH: number;
  fontSize: number;
  planeW: number;
  planeH: number;
  position: [number, number, number];
  rotation?: [number, number, number];
}) {
  const tex = useMemo(
    () => ledSignCanvas(lines, textColor, ledColor, canvasW, canvasH, fontSize),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const rot: [number, number, number] = rotation ?? [0, 0, 0];

  return (
    <group position={position} rotation={rot}>
      {/* Outer metal frame */}
      <mesh position={[0, 0, -0.028]}>
        <boxGeometry args={[planeW + 0.18, planeH + 0.18, 0.05]} />
        <meshStandardMaterial color="#1a1428" metalness={0.75} roughness={0.35} />
      </mesh>
      {/* Board face */}
      <mesh position={[0, 0, -0.003]}>
        <planeGeometry args={[planeW, planeH]} />
        <meshBasicMaterial map={tex} transparent={false} />
      </mesh>
      {/* Emissive glow halo */}
      <mesh position={[0, 0, -0.06]}>
        <planeGeometry args={[planeW + 0.3, planeH + 0.3]} />
        <meshStandardMaterial
          color={ledColor}
          emissive={ledColor}
          emissiveIntensity={0.35}
          transparent
          opacity={0.18}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

export default function NeonSigns() {
  /* ── "夢を信じて♡" — back wall, left of posters ── */
  /* ── "悲しい少女☽" — right wall, vertical       ── */
  /* ── Sakura neon ring + cherry                   ── */

  return (
    <group>
      {/* LED signboard — above poster shelf */}
      <LEDSignboard
        lines={['Phyo Yadanar Kyaw']}
        textColor="#dd99ff"
        ledColor="#aa44ff"
        canvasW={640} canvasH={128}
        fontSize={42}
        planeW={3.1} planeH={0.62}
        position={[4.4, 6.45, -5.84]}
      />

      {/* Vertical white neon — right wall */}
      <NeonPlane
        lines={['悲', 'し', 'い', '少', '女', '☽']}
        color="#e0d8ff"
        canvasW={80} canvasH={580}
        fontSize={46}
        planeW={0.48} planeH={3.5}
        position={[6.84, 3.5, -1.5]}
        rotation={[0, -Math.PI / 2, 0]}
      />

      {/* Sakura cherry blossom text — right wall */}
      <NeonPlane
        lines={['🌸']}
        color="#ff88cc"
        canvasW={128} canvasH={128}
        fontSize={72}
        planeW={0.62} planeH={0.62}
        position={[6.84, 2.05, -0.28]}
        rotation={[0, -Math.PI / 2, 0]}
      />

      {/* Neon ring around sakura */}
      <mesh position={[6.72, 2.05, -0.28]} rotation={[0, -Math.PI / 2, 0]}>
        <torusGeometry args={[0.38, 0.018, 8, 40]} />
        <meshStandardMaterial
          color="#ff88cc"
          emissive="#ff88cc"
          emissiveIntensity={4}
        />
      </mesh>

    </group>
  );
}
