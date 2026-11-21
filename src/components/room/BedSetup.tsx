import { RoundedBox } from '@react-three/drei';
import { Suspense, useMemo } from 'react';
import * as THREE from 'three';
import CozyWindow from './CozyWindow';

/* ── Gothic canopy-less bed: black lacquered wood with pointed-arch carving,
   purple heart-quilted velvet, lavender ruffles and bows. Coordinates are
   local to a group centred on the bed's long axis (x = -4 in the room);
   z runs from the headboard (-1.3) to the foot (4.3), which faces the camera. */

const BED_X   = -4;
/* overall size; the bed shrinks toward its headboard, which stays put */
const BED_SCALE = 0.85;
const HEAD_EDGE = -1.3;
/* slides the whole bed toward the front of the room, away from the sakura tree */
const BED_Z_SHIFT = 0.8;
const HALF_W  = 1.9;    // outer half-width
const HEAD_Z  = -1.16;  // post centres
const FOOT_Z  = 4.16;
const POST    = 0.28;   // square post section
const POST_X  = HALF_W - POST / 2;

/* the headboard stays below the sight line to the sakura tree behind it */
const HEAD_PEAK = 3.55;

const WOOD     = '#1d1622';
const LAVENDER = '#7f5cae';

/* ── shared materials: one set for every part of the bed ── */
const MATERIALS = {
  wood: new THREE.MeshStandardMaterial({ color: WOOD, roughness: 0.42, metalness: 0.12 }),
  woodDark: new THREE.MeshStandardMaterial({ color: '#120d16', roughness: 0.6, metalness: 0.08 }),
  velvet: new THREE.MeshPhysicalMaterial({
    color: '#3f1163', roughness: 0.92, sheen: 0.6, sheenColor: new THREE.Color('#9a62d6'), sheenRoughness: 0.5,
  }),
  lavender: new THREE.MeshPhysicalMaterial({
    color: LAVENDER, roughness: 0.9, sheen: 0.5, sheenColor: new THREE.Color('#b9a0e0'), sheenRoughness: 0.6,
    side: THREE.DoubleSide,
  }),
  button: new THREE.MeshStandardMaterial({ color: '#2a0b3e', roughness: 0.5 }),
};
const useMaterials = () => MATERIALS;

/* ── geometry helpers ── */

/* a pointed (gothic) arch, base at y = 0 */
function archShape(w: number, h: number, shape = new THREE.Shape()) {
  const spring = h - w * 0.7;
  shape.moveTo(-w / 2, 0);
  shape.lineTo(-w / 2, spring);
  shape.quadraticCurveTo(-w / 2, h - w * 0.12, 0, h);
  shape.quadraticCurveTo(w / 2, h - w * 0.12, w / 2, spring);
  shape.lineTo(w / 2, 0);
  shape.closePath();
  return shape;
}

function archPath(w: number, h: number, dx: number, dy: number) {
  const spring = h - w * 0.7;
  const p = new THREE.Path();
  p.moveTo(dx - w / 2, dy);
  p.lineTo(dx - w / 2, dy + spring);
  p.quadraticCurveTo(dx - w / 2, dy + h - w * 0.12, dx, dy + h);
  p.quadraticCurveTo(dx + w / 2, dy + h - w * 0.12, dx + w / 2, dy + spring);
  p.lineTo(dx + w / 2, dy);
  p.closePath();
  return p;
}

/* raised arch moulding: an arch outline with the inside cut out */
function archMoulding(w: number, h: number, border = 0.045) {
  const outer = archShape(w, h);
  outer.holes.push(archPath(w - border * 2, h - border * 1.6, 0, border * 0.6));
  return new THREE.ExtrudeGeometry(outer, { depth: 0.03, bevelEnabled: false });
}

/* pleated ruffle strip, hanging from y = 0 down to -h, flaring at the hem */
function ruffleGeometry(length: number, h: number, pleatEvery = 0.2, depth = 0.028) {
  const pleats = Math.round(length / pleatEvery);
  const g = new THREE.PlaneGeometry(length, h, pleats * 6, 3);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const t = (h / 2 - y) / h; // 0 at the top seam, 1 at the hem
    const wave = Math.sin((x / length) * pleats * Math.PI * 2);
    pos.setZ(i, wave * depth * (0.35 + 0.65 * t) + t * 0.03);
    pos.setY(i, y - h / 2 + Math.cos((x / length) * pleats * Math.PI * 2) * 0.008 * t);
  }
  g.computeVertexNormals();
  return g;
}

/* turned bun foot */
function footGeometry() {
  const pts = [
    [0, 0], [0.15, 0], [0.19, 0.04], [0.2, 0.1], [0.17, 0.15], [0.12, 0.17],
    [0.16, 0.22], [0.17, 0.27], [0.14, 0.3], [0.15, 0.33], [0, 0.33],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  return new THREE.LatheGeometry(pts, 20);
}

/* heart-quilted duvet top + matching bump map, drawn once on canvases */
function useQuiltTextures() {
  return useMemo(() => {
    const W = 896;
    const H = 1050;
    const cell = 74;

    const heart = (ctx: CanvasRenderingContext2D, x: number, y: number, s: number) => {
      ctx.beginPath();
      ctx.moveTo(x, y + 0.3 * s);
      ctx.bezierCurveTo(x, y, x - 0.5 * s, y, x - 0.5 * s, y + 0.3 * s);
      ctx.bezierCurveTo(x - 0.5 * s, y + 0.6 * s, x, y + 0.75 * s, x, y + s);
      ctx.bezierCurveTo(x, y + 0.75 * s, x + 0.5 * s, y + 0.6 * s, x + 0.5 * s, y + 0.3 * s);
      ctx.bezierCurveTo(x + 0.5 * s, y, x, y, x, y + 0.3 * s);
      ctx.closePath();
    };

    const eachHeart = (fn: (x: number, y: number) => void) => {
      for (let row = 0, y = 24; y < H - 150; row++, y += cell * 0.86) {
        for (let x = (row % 2 ? cell : cell / 2); x < W; x += cell) fn(x, y);
      }
    };

    /* colour */
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#3a0f5a';
    ctx.fillRect(0, 0, W, H);
    eachHeart((x, y) => {
      const g = ctx.createRadialGradient(x, y + cell * 0.38, 2, x, y + cell * 0.4, cell * 0.55);
      g.addColorStop(0, '#5b2286');
      g.addColorStop(1, '#320b50');
      ctx.fillStyle = g;
      heart(ctx, x, y, cell * 0.92);
      ctx.fill();
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = 'rgba(190, 150, 235, 0.45)';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
    ctx.setLineDash([]);

    /* embroidered scroll border with a heart at the foot */
    ctx.strokeStyle = '#d6c3f2';
    ctx.lineWidth = 3.2;
    ctx.lineCap = 'round';
    const base = H - 92;
    ctx.beginPath();
    for (let x = 40; x <= W - 40; x += 4) {
      const y = base + Math.sin(x * 0.045) * 9;
      if (x === 40) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    for (let x = 70; x < W - 60; x += 72) {
      if (Math.abs(x - W / 2) < 70) continue;
      ctx.beginPath();
      ctx.arc(x, base - 14, 9, Math.PI * 0.2, Math.PI * 1.7);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x + 28, base + 15, 8, Math.PI * 1.2, Math.PI * 2.7);
      ctx.stroke();
    }
    ctx.lineWidth = 4;
    heart(ctx, W / 2, base - 34, 62);
    ctx.stroke();
    /* stitched edge line */
    ctx.lineWidth = 2.5;
    ctx.setLineDash([10, 6]);
    ctx.strokeRect(22, 22, W - 44, H - 44);

    const map = new THREE.CanvasTexture(c);
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 8;

    /* bump: each heart puffs up from its stitched edge */
    const b = document.createElement('canvas');
    b.width = W; b.height = H;
    const bctx = b.getContext('2d')!;
    bctx.fillStyle = '#202020';
    bctx.fillRect(0, 0, W, H);
    eachHeart((x, y) => {
      const g = bctx.createRadialGradient(x, y + cell * 0.4, 2, x, y + cell * 0.4, cell * 0.5);
      g.addColorStop(0, '#ffffff');
      g.addColorStop(1, '#303030');
      bctx.fillStyle = g;
      heart(bctx, x, y, cell * 0.92);
      bctx.fill();
    });
    const bump = new THREE.CanvasTexture(b);

    return { map, bump };
  }, []);
}

/* ── small parts ── */

function Bow({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const m = useMaterials();
  return (
    <group position={position} scale={scale}>
      {[-1, 1].map((s) => (
        <mesh key={s} material={m.lavender} position={[s * 0.075, 0.01, 0]} rotation={[0, 0, s * -0.35]} scale={[0.085, 0.055, 0.03]}>
          <sphereGeometry args={[1, 16, 12]} />
        </mesh>
      ))}
      <mesh material={m.lavender}>
        <sphereGeometry args={[0.035, 12, 10]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={`t${s}`} material={m.lavender} position={[s * 0.035, -0.075, 0]} rotation={[0, 0, s * 0.45]}>
          <boxGeometry args={[0.04, 0.11, 0.012]} />
        </mesh>
      ))}
    </group>
  );
}

function Finial({ y, r = 0.11 }: { y: number; r?: number }) {
  const m = useMaterials();
  return (
    <group position={[0, y, 0]}>
      <mesh material={m.wood} position={[0, 0.02, 0]}>
        <cylinderGeometry args={[r * 0.45, r * 0.7, 0.06, 16]} />
      </mesh>
      <mesh material={m.wood} position={[0, r + 0.04, 0]} castShadow>
        <sphereGeometry args={[r, 20, 16]} />
      </mesh>
    </group>
  );
}

/* square post with turned foot; head posts end in a pyramid spire */
function Post({ x, z, top, spire }: { x: number; z: number; top: number; spire: boolean }) {
  const m = useMaterials();
  const foot = useMemo(footGeometry, []);
  const shaftBottom = 0.33;
  return (
    <group position={[x, 0, z]}>
      <mesh geometry={foot} material={m.wood} castShadow />
      <mesh material={m.wood} position={[0, (shaftBottom + top) / 2, 0]} castShadow>
        <boxGeometry args={[POST, top - shaftBottom, POST]} />
      </mesh>
      {/* recessed panel on the front face */}
      <mesh material={m.woodDark} position={[0, (shaftBottom + top) / 2 + 0.05, POST / 2 + 0.001]}>
        <planeGeometry args={[POST * 0.5, (top - shaftBottom) * 0.7]} />
      </mesh>
      {/* capital mouldings */}
      {[shaftBottom + 0.04, top - 0.02].map((y) => (
        <mesh key={y} material={m.wood} position={[0, y, 0]}>
          <boxGeometry args={[POST + 0.06, 0.07, POST + 0.06]} />
        </mesh>
      ))}
      {spire ? (
        <>
          <mesh material={m.wood} position={[0, top + 0.24, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[POST * 0.72, 0.46, 4]} />
          </mesh>
          <Finial y={top + 0.44} r={0.085} />
          <Bow position={[0, top - 0.16, POST / 2 + 0.03]} scale={0.95} />
        </>
      ) : (
        <>
          <Finial y={top + 0.01} r={0.13} />
          <Bow position={[0, top - 0.1, POST / 2 + 0.03]} />
        </>
      )}
    </group>
  );
}

/* a row of raised pointed arches across a panel face, with a trefoil in the middle */
function ArchRow({ width, y, count, archW, archH, trefoil = true }: {
  width: number; y: number; count: number; archW: number; archH: number; trefoil?: boolean;
}) {
  const m = useMaterials();
  const geo = useMemo(() => archMoulding(archW, archH), [archW, archH]);
  const gap = width / count;
  return (
    <group>
      {Array.from({ length: count }, (_, i) => {
        const x = -width / 2 + gap * (i + 0.5);
        if (trefoil && i === Math.floor(count / 2)) return null;
        return <mesh key={i} geometry={geo} material={m.wood} position={[x, y, 0]} />;
      })}
      {trefoil && <Trefoil position={[0, y + archH * 0.5, 0.015]} r={archH * 0.2} />}
    </group>
  );
}

function Trefoil({ position, r }: { position: [number, number, number]; r: number }) {
  const m = useMaterials();
  return (
    <group position={position}>
      {[90, 210, 330].map((deg) => {
        const a = (deg * Math.PI) / 180;
        return (
          <mesh key={deg} material={m.wood} position={[Math.cos(a) * r * 0.62, Math.sin(a) * r * 0.62, 0]}>
            <torusGeometry args={[r * 0.55, r * 0.14, 8, 24]} />
          </mesh>
        );
      })}
      <mesh material={m.wood}>
        <torusGeometry args={[r * 1.35, r * 0.12, 8, 32]} />
      </mesh>
    </group>
  );
}

/* tall headboard: three pointed arches of tufted velvet under carved gables */
function Headboard() {
  const m = useMaterials();
  const inner = POST_X - POST / 2; // span between the posts
  const base = 0.8;

  const { frame, arches } = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-inner, base);
    s.lineTo(-inner, 2.3);
    s.quadraticCurveTo(-inner, 2.62, -1.08, 2.78);  // left gable
    s.quadraticCurveTo(-0.78, 2.62, -0.66, 2.55);
    s.quadraticCurveTo(-0.6, 3.25, 0, HEAD_PEAK);    // centre gable
    s.quadraticCurveTo(0.6, 3.25, 0.66, 2.55);
    s.quadraticCurveTo(0.78, 2.62, 1.08, 2.78);      // right gable
    s.quadraticCurveTo(inner, 2.62, inner, 2.3);
    s.lineTo(inner, base);
    s.closePath();

    const arches = [
      { x: -1.08, w: 0.62, h: 1.08, y: 1.36 },
      { x: 0,     w: 0.84, h: 1.66, y: 1.36 },
      { x: 1.08,  w: 0.62, h: 1.08, y: 1.36 },
    ];
    for (const a of arches) s.holes.push(archPath(a.w, a.h, a.x, a.y));
    const frame = new THREE.ExtrudeGeometry(s, {
      depth: 0.16, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2,
    });
    return { frame, arches };
  }, [inner]);

  const archGeo = useMemo(
    () => arches.map((a) => new THREE.ShapeGeometry(archShape(a.w + 0.02, a.h + 0.02))),
    [arches],
  );
  const mould = useMemo(() => arches.map((a) => archMoulding(a.w + 0.14, a.h + 0.1, 0.06)), [arches]);

  return (
    <group position={[0, 0, HEAD_Z - 0.02]}>
      <mesh geometry={frame} material={m.wood} position={[0, 0, -0.08]} castShadow receiveShadow />
      {arches.map((a, i) => (
        <group key={i}>
          {/* velvet panel behind the opening, with tufting buttons */}
          <mesh geometry={archGeo[i]} material={m.velvet} position={[a.x, a.y - 0.01, -0.035]} />
          {Array.from({ length: 12 }, (_, j) => {
            const col = (j % 2) - 0.5;
            const row = Math.floor(j / 2);
            const by = a.y + 0.2 + row * 0.2;
            if (by > a.y + a.h - a.w * 0.45) return null;
            return (
              <mesh key={j} material={m.button} position={[a.x + col * a.w * 0.48 + (row % 2 ? 0 : col * -0.4 * a.w * 0.48), by, -0.025]}>
                <sphereGeometry args={[0.018, 8, 6]} />
              </mesh>
            );
          })}
          {/* carved moulding around the arch */}
          <mesh geometry={mould[i]} material={m.wood} position={[a.x, a.y - 0.05, 0.08]} />
        </group>
      ))}
      <Trefoil position={[0, 3.25, 0.1]} r={0.08} />
      <Finial y={HEAD_PEAK - 0.02} r={0.1} />
      <Bow position={[0, HEAD_PEAK - 0.14, 0.13]} />
    </group>
  );
}

export default function BedSetup() {
  const m = useMaterials();
  const quilt = useQuiltTextures();

  const duvetLen = 4.2;
  const duvetZ = (-0.2 + 4.0) / 2;
  const duvetTop = 1.29;
  const ruffleSide = useMemo(() => ruffleGeometry(duvetLen, 0.36), []);
  const ruffleFoot = useMemo(() => ruffleGeometry(POST_X * 2 - POST - 0.04, 0.4), []);

  const quiltTop = useMemo(() => new THREE.MeshPhysicalMaterial({
    map: quilt.map,
    bumpMap: quilt.bump,
    bumpScale: 3,
    roughness: 0.94,
    sheen: 0.5,
    sheenColor: new THREE.Color('#8c5cc4'),
    sheenRoughness: 0.55,
  }), [quilt]);

  return (
    <group>
      <group position={[BED_X, 0, HEAD_EDGE * (1 - BED_SCALE) + BED_Z_SHIFT]} scale={BED_SCALE}>
        {/* ══ FRAME ══ */}
        {[-1, 1].map((sx) => (
          <group key={sx}>
            <Post x={sx * POST_X} z={HEAD_Z} top={2.82} spire />
            <Post x={sx * POST_X} z={FOOT_Z} top={1.55} spire={false} />
          </group>
        ))}

        <Headboard />

        {/* side rails with carved arches on the outer face */}
        {[-1, 1].map((sx) => (
          <group key={`rail${sx}`} position={[sx * (HALF_W - 0.1), 0, (HEAD_Z + FOOT_Z) / 2]}>
            <mesh material={m.wood} position={[0, 0.56, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.12, 0.46, FOOT_Z - HEAD_Z - POST]} />
            </mesh>
            <group position={[sx * 0.06, 0, 0]} rotation={[0, sx * Math.PI / 2, 0]}>
              <ArchRow width={FOOT_Z - HEAD_Z - POST - 0.2} y={0.38} count={9} archW={0.36} archH={0.34} trefoil={false} />
            </group>
          </group>
        ))}

        {/* footboard panel */}
        <group position={[0, 0, FOOT_Z]}>
          <mesh material={m.wood} position={[0, 0.58, 0]} castShadow receiveShadow>
            <boxGeometry args={[POST_X * 2 - POST, 0.56, 0.14]} />
          </mesh>
          <mesh material={m.wood} position={[0, 0.88, 0.01]}>
            <boxGeometry args={[POST_X * 2 - POST, 0.06, 0.18]} />
          </mesh>
          <group position={[0, 0, 0.07]}>
            <ArchRow width={POST_X * 2 - POST - 0.16} y={0.36} count={7} archW={0.38} archH={0.4} />
          </group>
        </group>

        {/* ══ BEDDING ══ */}
        {/* mattress */}
        <RoundedBox args={[HALF_W * 2 - 0.36, 0.34, FOOT_Z - HEAD_Z - 0.1]} radius={0.06} smoothness={3}
          position={[0, 0.98, (HEAD_Z + FOOT_Z) / 2 - 0.02]} material={m.velvet} receiveShadow />

        {/* duvet body + quilted top */}
        <RoundedBox args={[3.6, 0.16, duvetLen]} radius={0.06} smoothness={3}
          position={[0, duvetTop - 0.08, duvetZ]} material={m.velvet} castShadow receiveShadow />
        <mesh material={quiltTop} position={[0, duvetTop + 0.002, duvetZ]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[3.5, duvetLen - 0.1]} />
        </mesh>

        {/* lavender ruffles hanging over the sides and the foot */}
        {[-1, 1].map((sx) => (
          <mesh key={`rf${sx}`} geometry={ruffleSide} material={m.lavender}
            position={[sx * 1.82, duvetTop - 0.12, duvetZ]} rotation={[0, sx * Math.PI / 2, 0]} castShadow />
        ))}
        <mesh geometry={ruffleFoot} material={m.lavender} position={[0, duvetTop - 0.1, 4.03]} castShadow />

        {/* pillows leaning on the headboard */}
        {[-1, 1].map((sx) => (
          <RoundedBox key={`p${sx}`} args={[1.3, 0.62, 0.3]} radius={0.13} smoothness={4}
            position={[sx * 0.74, 1.46, HEAD_Z + 0.42]} rotation={[-0.32, sx * -0.05, sx * 0.04]}
            material={m.lavender} castShadow />
        ))}
      </group>

      {/* ══ WINDOW (LEFT WALL): loads its sky picture, so it suspends on its own ══ */}
      <Suspense fallback={null}>
        <CozyWindow position={[-6.9, 3.8, -0.5]} rotation={[0, Math.PI / 2, 0]} />
      </Suspense>
    </group>
  );
}
