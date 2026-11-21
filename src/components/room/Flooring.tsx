import { useMemo } from 'react';
import * as THREE from 'three';
import { PUFFS, RUG_CENTER, RUG_SCALE, RUG_THICK } from './rug';

/* Lavender herringbone wood floor, dark purple baseboards with an LED strip that
   washes light up the walls, and a fluffy cloud-shaped rug with a cream piped
   edge and an embroidered moon and stars. */

const ROOM_W = 14;
const ROOM_D = 12;

/* ── herringbone floor texture ──────────────────────────────────────────────
   Planks W × L (L = 4W) in a 90° herringbone, drawn rotated 45° so they run
   diagonally to the walls. Rotated, the pattern repeats every (L√2, W√2), so a
   canvas that is a whole number of repeats tiles seamlessly. */
const TEX = 1024;
const STEP_X = 128;                 // L√2 in pixels
const STEP_Y = 32;                  // W√2 in pixels
const PW = STEP_Y / Math.SQRT2;     // plank width
const PL = STEP_X / Math.SQRT2;     // plank length
const PLANK_LENGTH_WORLD = 0.8;     // metres-ish a plank spans in the room
const TILE_WORLD = (TEX / PL) * PLANK_LENGTH_WORLD;   // room units one texture tile covers

/* deterministic per-plank variation that repeats with the tile */
function hash(a: number, b: number, c: number) {
  const s = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453;
  return s - Math.floor(s);
}

function herringboneTextures() {
  const color = document.createElement('canvas');
  color.width = color.height = TEX;
  const ctx = color.getContext('2d')!;
  const bump = document.createElement('canvas');
  bump.width = bump.height = TEX;
  const bctx = bump.getContext('2d')!;

  ctx.fillStyle = '#5c4b74';
  ctx.fillRect(0, 0, TEX, TEX);
  bctx.fillStyle = '#000';
  bctx.fillRect(0, 0, TEX, TEX);

  const nI = TEX / STEP_Y;  // repeats along (W, W)
  const nJ = TEX / STEP_X;  // repeats along (L, -L)

  const drawPlank = (x: number, y: number, w: number, h: number, seed: number, vertical: boolean) => {
    const tone = 0.86 + hash(seed, 1, 2) * 0.22;
    const r = Math.round(176 * tone);
    const g = Math.round(152 * tone);
    const b = Math.round(196 * tone);
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(x, y, w, h);

    /* grain: a few soft wavy lines along the plank */
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.strokeStyle = `rgba(90, 60, 120, ${0.1 + hash(seed, 3, 4) * 0.08})`;
    ctx.lineWidth = 0.8;
    const lines = 5;
    for (let k = 0; k < lines; k++) {
      const off = (k + 0.5) / lines;
      const phase = hash(seed, k, 9) * 6.28;
      ctx.beginPath();
      for (let t = 0; t <= 1.0001; t += 0.05) {
        const along = vertical ? y + t * h : x + t * w;
        const wave = Math.sin(t * 9 + phase) * 1.4;
        const across = (vertical ? x + off * w : y + off * h) + wave;
        if (vertical) {
          if (t === 0) ctx.moveTo(across, along); else ctx.lineTo(across, along);
        } else if (t === 0) ctx.moveTo(along, across); else ctx.lineTo(along, across);
      }
      ctx.stroke();
    }
    ctx.restore();

    /* seams */
    ctx.strokeStyle = 'rgba(70, 45, 95, 0.55)';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(x, y, w, h);
    bctx.fillStyle = '#fff';
    bctx.fillRect(x + 1, y + 1, w - 2, h - 2);
  };

  for (const c of [ctx, bctx]) {
    c.save();
    c.translate(0, 0);
    c.rotate(Math.PI / 4);
  }
  /* cover the rotated canvas generously; indices wrap so colours repeat with the tile */
  for (let i = -nI * 2; i < nI * 3; i++) {
    for (let j = -nJ * 2; j < nJ * 2; j++) {
      const ox = i * PW + j * PL;
      const oy = i * PW - j * PL;
      const wi = ((i % nI) + nI) % nI;
      const wj = ((j % nJ) + nJ) % nJ;
      drawPlank(ox, oy, PL, PW, wi * 31 + wj * 7, false);               // horizontal
      drawPlank(ox, oy + PW, PW, PL, wi * 31 + wj * 7 + 1000, true);    // vertical
    }
  }
  ctx.restore();
  bctx.restore();

  const map = new THREE.CanvasTexture(color);
  map.colorSpace = THREE.SRGBColorSpace;
  const bumpMap = new THREE.CanvasTexture(bump);
  for (const t of [map, bumpMap]) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(ROOM_W / TILE_WORLD, ROOM_D / TILE_WORLD);
    t.anisotropy = 8;
  }
  return { map, bumpMap };
}

function Floor() {
  const { map, bumpMap } = useMemo(herringboneTextures, []);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[ROOM_W, ROOM_D]} />
      {/* darker than the reference so the room keeps its night mood */}
      <meshStandardMaterial map={map} bumpMap={bumpMap} bumpScale={0.6} color="#8a7c9e" roughness={0.5} metalness={0.05} />
    </mesh>
  );
}

/* ── baseboards with an LED strip and a glow washing up the wall ────────── */
function glowTexture() {
  const c = document.createElement('canvas');
  c.width = 4;
  c.height = 128;
  const ctx = c.getContext('2d')!;
  const g = ctx.createLinearGradient(0, 128, 0, 0);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.35, 'rgba(255,255,255,0.35)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 4, 128);
  return new THREE.CanvasTexture(c);
}

const BASE_H = 0.2;
const BASE_T = 0.06;
const LED = '#b04dff';

function Baseboards() {
  const glow = useMemo(glowTexture, []);
  const board = useMemo(() => new THREE.MeshStandardMaterial({ color: '#2e1550', roughness: 0.55, metalness: 0.1 }), []);
  const led = useMemo(() => new THREE.MeshStandardMaterial({ color: LED, emissive: LED, emissiveIntensity: 1.6, toneMapped: false }), []);

  /* each wall: centre of the baseboard, its length, and the rotation that faces it into the room */
  const walls: { pos: [number, number]; len: number; rotY: number }[] = [
    { pos: [0, -ROOM_D / 2 + BASE_T / 2], len: ROOM_W, rotY: 0 },             // back
    { pos: [0, ROOM_D / 2 - BASE_T / 2], len: ROOM_W, rotY: Math.PI },        // front
    { pos: [-ROOM_W / 2 + BASE_T / 2, 0], len: ROOM_D, rotY: Math.PI / 2 },   // left
    { pos: [ROOM_W / 2 - BASE_T / 2, 0], len: ROOM_D, rotY: -Math.PI / 2 },   // right
  ];

  return (
    <>
      {walls.map(({ pos, len, rotY }, i) => (
        <group key={i} position={[pos[0], 0, pos[1]]} rotation={[0, rotY, 0]}>
          <mesh material={board} position={[0, BASE_H / 2, 0]} receiveShadow>
            <boxGeometry args={[len, BASE_H, BASE_T]} />
          </mesh>
          {/* LED strip along the top edge */}
          <mesh material={led} position={[0, BASE_H + 0.012, BASE_T / 2 - 0.012]}>
            <boxGeometry args={[len, 0.024, 0.024]} />
          </mesh>
          {/* light washing up the wall */}
          <mesh position={[0, BASE_H + 0.35, -BASE_T / 2 + 0.035]}>
            <planeGeometry args={[len, 0.7]} />
            <meshBasicMaterial
              map={glow}
              color={LED}
              transparent
              opacity={0.45}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}
    </>
  );
}

/* ── cloud rug ─────────────────────────────────────────────────────────────── */
/* outline of the union of the puffs, traced as a radius per angle from the centre */
function cloudOutline(grow = 0, samples = 220) {
  const pts: THREE.Vector2[] = [];
  for (let k = 0; k < samples; k++) {
    const a = (k / samples) * Math.PI * 2;
    const dx = Math.cos(a);
    const dy = Math.sin(a);
    let best = 0;
    for (const [cx, cy, r] of PUFFS) {
      /* farthest hit of the ray with this puff */
      const b = dx * cx + dy * cy;
      const disc = b * b - (cx * cx + cy * cy - (r + grow) * (r + grow));
      if (disc >= 0) best = Math.max(best, b + Math.sqrt(disc));
    }
    pts.push(new THREE.Vector2(dx * best, dy * best));
  }
  return pts;
}

function furTextures() {
  const S = 512;
  const color = document.createElement('canvas');
  color.width = color.height = S;
  const ctx = color.getContext('2d')!;
  ctx.fillStyle = '#9d7ac9';
  ctx.fillRect(0, 0, S, S);
  const bump = document.createElement('canvas');
  bump.width = bump.height = S;
  const bctx = bump.getContext('2d')!;
  bctx.fillStyle = '#808080';
  bctx.fillRect(0, 0, S, S);
  /* thousands of short tufts in slightly different lavenders */
  for (let i = 0; i < 9000; i++) {
    const x = Math.random() * S;
    const y = Math.random() * S;
    const a = Math.random() * Math.PI * 2;
    const len = 3 + Math.random() * 5;
    const l = 58 + Math.random() * 18;
    ctx.strokeStyle = `hsla(272, 42%, ${l}%, 0.5)`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
    ctx.stroke();
    const v = Math.round(90 + Math.random() * 165);
    bctx.strokeStyle = `rgba(${v},${v},${v},0.6)`;
    bctx.lineWidth = 1.2;
    bctx.beginPath();
    bctx.moveTo(x, y);
    bctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
    bctx.stroke();
  }
  const map = new THREE.CanvasTexture(color);
  map.colorSpace = THREE.SRGBColorSpace;
  const bumpMap = new THREE.CanvasTexture(bump);
  for (const t of [map, bumpMap]) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(2.5, 2.5);
  }
  return { map, bumpMap };
}

function starShape(outer: number, inner: number, points = 4) {
  const s = new THREE.Shape();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 ? inner : outer;
    const a = Math.PI / 2 + (i * Math.PI) / points;
    if (i === 0) s.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else s.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  s.closePath();
  return s;
}

/* crescent: outer arc of one circle, back along the inner arc of an offset one */
function crescentShape(r: number) {
  const s = new THREE.Shape();
  s.absarc(0, 0, r, Math.PI * 0.62, Math.PI * 1.88, false);
  s.absarc(r * 0.42, r * 0.28, r * 0.86, Math.PI * 1.78, Math.PI * 0.72, true);
  s.closePath();
  return s;
}

function CloudRug() {
  const { geo, piping, fur, embroidery } = useMemo(() => {
    const outline = cloudOutline();
    const shape = new THREE.Shape(outline);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: RUG_THICK, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.03, bevelSegments: 3, curveSegments: 4,
    });
    /* map the fur across the rug's own footprint */
    const pos = geo.attributes.position;
    const uv = geo.attributes.uv;
    for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) / 2 + 0.5, pos.getY(i) / 2 + 0.5);

    const edge = cloudOutline(0.02).map((p) => new THREE.Vector3(p.x, p.y, 0));
    const piping = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(edge, true), 400, 0.035, 8, true);

    const embroidery = [
      { g: new THREE.ShapeGeometry(crescentShape(0.22), 24), at: [1.05, 0.35] as [number, number], rot: -0.3 },
      { g: new THREE.ShapeGeometry(starShape(0.12, 0.03)), at: [0.62, 0.62] as [number, number], rot: 0 },
      { g: new THREE.ShapeGeometry(starShape(0.08, 0.02)), at: [0.72, 0.05] as [number, number], rot: 0.2 },
    ];
    return { geo, piping, fur: furTextures(), embroidery };
  }, []);

  const rugMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    map: fur.map, bumpMap: fur.bumpMap, bumpScale: 2, color: '#7c62a8',
    roughness: 1, sheen: 0.6, sheenColor: new THREE.Color('#c9b0ee'), sheenRoughness: 0.8,
  }), [fur]);
  const cream = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#d9c7b4', roughness: 0.9, sheen: 0.6, sheenColor: new THREE.Color('#fff3e6'), sheenRoughness: 0.6,
  }), []);
  const thread = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#efe0cf', emissive: '#ffe8d0', emissiveIntensity: 0.12, roughness: 0.7,
  }), []);

  const top = RUG_THICK + 0.012;

  return (
    /* drawn in plan (x, y) then laid flat: plan y → room -z */
    <group position={[RUG_CENTER[0], 0.002, RUG_CENTER[1]]} rotation={[-Math.PI / 2, 0, 0]} scale={RUG_SCALE}>
      <mesh geometry={geo} material={rugMat} receiveShadow />
      <mesh geometry={piping} material={cream} position={[0, 0, top * 0.55]} />
      {embroidery.map(({ g, at, rot }, i) => (
        <mesh key={i} geometry={g} material={thread} position={[at[0], at[1], top + 0.002]} rotation={[0, 0, rot]} />
      ))}
    </group>
  );
}

export default function Flooring() {
  return (
    <group>
      <Floor />
      <Baseboards />
      <CloudRug />
    </group>
  );
}
