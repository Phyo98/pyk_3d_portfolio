import { RoundedBox, useTexture } from '@react-three/drei';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import skyImg from '../../assets/window/sky.webp';

/* Night window: rounded dark frame with a neon inner edge, cross mullions, a sill,
   a curtain rod with ball finials and rings, and pleated lavender curtains held
   by moon tiebacks. The view (sky, clouds, moon, star garland) is a picture behind
   the glass. Local space: centred on the glass, facing +z. */

const GW = 2.2;                    // glass width
const GH = GW * (688 / 644);       // glass height, matching the sky picture
const GR = 0.2;                    // glass corner radius
const BORDER = 0.18;
/* where the painted cross bars sit in the sky picture (0..1 from the left / top) */
const MULLION_U = 0.5;
const MULLION_V = 0.515;

const ROD_Y = GH / 2 + 0.45;
const SILL_Y = -GH / 2 - BORDER - 0.05;
const CURTAIN_TOP = ROD_Y - 0.06;
const CURTAIN_BOTTOM = SILL_Y - 0.28;
const TIE_V = 0.55;                // tieback height, as a share of the curtain length

const MAT = {
  frame: new THREE.MeshStandardMaterial({ color: '#17121e', roughness: 0.4, metalness: 0.3 }),
  rod: new THREE.MeshStandardMaterial({ color: '#3a2357', roughness: 0.35, metalness: 0.5 }),
  ball: new THREE.MeshStandardMaterial({ color: '#121016', roughness: 0.3, metalness: 0.5 }),
  ring: new THREE.MeshStandardMaterial({ color: '#7148ad', roughness: 0.4, metalness: 0.3 }),
  neon: new THREE.MeshStandardMaterial({ color: '#a15cff', emissive: '#a15cff', emissiveIntensity: 1.1, toneMapped: false }),
  curtain: new THREE.MeshPhysicalMaterial({
    color: '#6d4ea3', roughness: 0.9, sheen: 0.5, sheenColor: new THREE.Color('#c9b2f0'), sheenRoughness: 0.6,
    side: THREE.DoubleSide,
  }),
  band: new THREE.MeshPhysicalMaterial({
    color: '#5f4392', roughness: 0.85, sheen: 0.5, sheenColor: new THREE.Color('#c9b2f0'), sheenRoughness: 0.6,
  }),
  moon: new THREE.MeshStandardMaterial({ color: '#ffe6d2', emissive: '#ffd9bd', emissiveIntensity: 0.7 }),
};

function roundedRect<T extends THREE.Path>(w: number, h: number, r: number, target: T): T {
  const x = -w / 2;
  const y = -h / 2;
  target.moveTo(x + r, y);
  target.lineTo(x + w - r, y);
  target.quadraticCurveTo(x + w, y, x + w, y + r);
  target.lineTo(x + w, y + h - r);
  target.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  target.lineTo(x + r, y + h);
  target.quadraticCurveTo(x, y + h, x, y + h - r);
  target.lineTo(x, y + r);
  target.quadraticCurveTo(x, y, x + r, y);
  return target;
}

const smooth = (a: number, b: number, t: number) => {
  const k = THREE.MathUtils.clamp((t - a) / (b - a), 0, 1);
  return k * k * (3 - 2 * k);
};

/* a pleated drape: straight on its outer edge, gathered at the tieback, flared at the hem.
   side = -1 for the left curtain, +1 for the right. */
function curtainGeometry(side: -1 | 1) {
  const NU = 56;
  const NV = 44;
  const outerX = side * (GW / 2 + 0.95);
  const w0 = 1.0;   // width at the rod
  const wt = 0.36;  // width at the tieback
  const wb = 0.74;  // width at the hem
  const pleats = 6;

  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  for (let j = 0; j <= NV; j++) {
    const v = j / NV;
    const y = CURTAIN_TOP - v * (CURTAIN_TOP - CURTAIN_BOTTOM);
    const w = v < TIE_V
      ? THREE.MathUtils.lerp(w0, wt, smooth(0.08, TIE_V, v))
      : THREE.MathUtils.lerp(wt, wb, smooth(TIE_V, 1, v));
    /* folds deepen where the fabric is gathered */
    const depth = 0.025 + 0.05 * (1 - (w - wt) / (w0 - wt));
    for (let i = 0; i <= NU; i++) {
      const u = i / NU;
      const x = outerX - side * u * w;
      const fold = Math.sin(u * pleats * Math.PI * 2) * depth;
      /* the gathered middle bows out a little from the wall */
      const bow = 0.06 * Math.sin(Math.PI * Math.min(1, v / TIE_V)) * (1 - Math.abs(v - TIE_V));
      pos.push(x, y, 0.16 + fold + bow);
      uv.push(u, 1 - v);
    }
  }
  for (let j = 0; j < NV; j++) {
    for (let i = 0; i < NU; i++) {
      const a = j * (NU + 1) + i;
      const b = a + NU + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return { geometry: g, tieX: outerX - side * wt / 2 };
}

function Curtain({ side }: { side: -1 | 1 }) {
  const { geometry, tieX } = useMemo(() => curtainGeometry(side), [side]);
  const tieY = CURTAIN_TOP - TIE_V * (CURTAIN_TOP - CURTAIN_BOTTOM);
  return (
    <group>
      <mesh geometry={geometry} material={MAT.curtain} castShadow />
      {/* tieback band with a glowing moon clasp */}
      <group position={[tieX, tieY, 0.2]}>
        <RoundedBox args={[0.46, 0.1, 0.16]} radius={0.04} smoothness={3} material={MAT.band} />
        <mesh material={MAT.moon} position={[0, 0, 0.085]}>
          <circleGeometry args={[0.055, 24]} />
        </mesh>
        {/* a disc of band colour bites the moon into a crescent */}
        <mesh material={MAT.band} position={[0.026, 0.018, 0.087]}>
          <circleGeometry args={[0.048, 24]} />
        </mesh>
      </group>
    </group>
  );
}

function Rod() {
  const rings = [-1, 1].flatMap((s) =>
    [0, 1, 2, 3].map((i) => s * (GW / 2 + 0.2 + i * 0.22)),
  );
  return (
    <group position={[0, ROD_Y, 0.2]}>
      <mesh material={MAT.rod} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.035, 0.035, GW + 2.5, 16]} />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * (GW / 2 + 1.3), 0, 0]}>
          <mesh material={MAT.ball} castShadow>
            <sphereGeometry args={[0.1, 20, 16]} />
          </mesh>
          {/* wall bracket */}
          <mesh material={MAT.ball} position={[-s * 0.12, 0, -0.1]}>
            <boxGeometry args={[0.04, 0.04, 0.22]} />
          </mesh>
        </group>
      ))}
      {rings.map((x) => (
        <mesh key={x} material={MAT.ring} position={[x, -0.01, 0]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.055, 0.014, 8, 20]} />
        </mesh>
      ))}
    </group>
  );
}

export default function CozyWindow(props: { position: [number, number, number]; rotation?: [number, number, number] }) {
  const sky = useTexture(skyImg);
  useEffect(() => {
    sky.colorSpace = THREE.SRGBColorSpace;
    sky.anisotropy = 8;
    sky.needsUpdate = true;
  }, [sky]);

  const geo = useMemo(() => {
    /* glass: rounded rectangle, UVs stretched over the whole sky picture */
    const glass = new THREE.ShapeGeometry(roundedRect(GW, GH, GR, new THREE.Shape()), 24);
    const p = glass.attributes.position;
    const uv = glass.attributes.uv;
    for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / GW + 0.5, p.getY(i) / GH + 0.5);

    /* frame: outer rounded rectangle with the glass cut out */
    const outer = roundedRect(GW + BORDER * 2, GH + BORDER * 2, GR + 0.1, new THREE.Shape());
    outer.holes.push(roundedRect(GW, GH, GR, new THREE.Path()));
    const frame = new THREE.ExtrudeGeometry(outer, {
      depth: 0.08, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 3, curveSegments: 24,
    });

    /* neon tube just inside the frame opening */
    const ring = roundedRect(GW - 0.03, GH - 0.03, GR - 0.01, new THREE.Path()).getPoints(40);
    const curve = new THREE.CatmullRomCurve3(ring.map((v) => new THREE.Vector3(v.x, v.y, 0)), true);
    const neon = new THREE.TubeGeometry(curve, 240, 0.022, 8, true);
    return { glass, frame, neon };
  }, []);

  const crossY = GH / 2 - MULLION_V * GH;
  const crossX = -GW / 2 + MULLION_U * GW;

  return (
    <group {...props}>
      {/* the view outside, a little behind the frame */}
      <mesh geometry={geo.glass} position={[0, 0, -0.04]}>
        <meshBasicMaterial map={sky} color="#e6e0f0" />
      </mesh>

      <mesh geometry={geo.frame} material={MAT.frame} position={[0, 0, -0.06]} castShadow receiveShadow />
      <mesh geometry={geo.neon} material={MAT.neon} position={[0, 0, 0.03]} />

      {/* cross mullions over the painted ones */}
      <mesh material={MAT.frame} position={[crossX, 0, -0.01]}>
        <boxGeometry args={[0.055, GH, 0.05]} />
      </mesh>
      <mesh material={MAT.frame} position={[0, crossY, -0.01]}>
        <boxGeometry args={[GW, 0.055, 0.05]} />
      </mesh>

      {/* sill */}
      <RoundedBox args={[GW + BORDER * 2 + 0.5, 0.1, 0.36]} radius={0.03} smoothness={3}
        position={[0, SILL_Y, 0.12]} material={MAT.frame} castShadow receiveShadow />

      <Rod />
      <Curtain side={-1} />
      <Curtain side={1} />
    </group>
  );
}
