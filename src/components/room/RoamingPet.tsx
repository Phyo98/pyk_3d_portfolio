import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { rugHeightAt } from './rug';
import type { PetConfig } from './pets';
import type { ViewName } from './pets/petRig';

/* A pet that wanders the open floor.
 *
 * It is drawn as flat cut-outs that always turn to face the camera, and shows
 * the front, back, left or right drawing depending on which way it walks
 * relative to the viewer. Every drawing is split into a body plus parts
 * (scripts/pet-rig.py): side-view legs swing from the shoulder or hip in a
 * four-beat walk, front/back legs lift in turn, and tails sway. Steps advance
 * with the distance actually covered, so the paws don't skate.
 */

const VIEWS: ViewName[] = ['front', 'back', 'left', 'right'];
type Mode = 'walk' | 'pause' | 'rest';

/* keeps white fur below the bloom threshold so it doesn't glow */
const TINT = new THREE.Color(0.86, 0.84, 0.86);

/* ── where pets may roam: the open floor between the bed and the desk ── */
const BOUNDS = { minX: -1.5, maxX: 1.5, minZ: -0.2, maxZ: 4.5 };

/* ── locomotion ── */
const ACCEL       = 2.6;   // how quickly speed eases toward the wanted speed
const TURN_RATE   = 2.2;   // radians per second; turns are arcs, not snaps
const SLOW_RADIUS = 0.7;   // starts slowing this far from where it will stop
const ARRIVE_DIST = 0.12;
const REST_CHANCE = 0.55;  // otherwise it just pauses for a beat and moves on
const PERSONAL_SPACE = 0.75; // re-routes rather than walking into another pet

/* ── gait ── */
const SWING     = 0.35;   // side-view leg shear at full stride (paw offset / leg length)
const STANCE    = 0.62;   // share of the cycle each paw spends on the floor
const SIDE_LIFT = 0.12;   // side-view leg shortening as the paw swings forward
const FB_LIFT   = 0.22;   // front/back-view leg shortening as it steps
const BOB       = 0.005;  // body rise and fall, twice per cycle
const TAIL_SWAY = 0.12;   // radians; a little livelier when resting

/* ── one-off moves ── */
const HOP_TIME    = 0.5;
const BUBBLE_TIME = 1.8;

/* every pet's floor position, so they can keep out of each other's way */
const positions = new Map<string, THREE.Vector3>();

/* where a paw is in its cycle: swing is +1 fully forward, -1 fully back */
function legPose(phase: number) {
  const p = phase - Math.floor(phase);
  if (p < STANCE) return { swing: 1 - (2 * p) / STANCE, lift: 0 };
  const s = (p - STANCE) / (1 - STANCE);
  return { swing: -1 + (1 - Math.cos(Math.PI * s)), lift: Math.sin(Math.PI * s) };
}

const wrapAngle = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

function pickTarget(from: THREE.Vector3, selfId: string) {
  const p = new THREE.Vector3();
  for (let i = 0; i < 16; i++) {
    p.set(
      THREE.MathUtils.randFloat(BOUNDS.minX, BOUNDS.maxX),
      0,
      THREE.MathUtils.randFloat(BOUNDS.minZ, BOUNDS.maxZ),
    );
    if (p.distanceTo(from) < 1.2) continue;
    let crowded = false;
    for (const [id, q] of positions) if (id !== selfId && q.distanceTo(p) < PERSONAL_SPACE * 1.5) crowded = true;
    if (!crowded) break;
  }
  return p;
}

export default function RoamingPet({ id, rig, textures, height, walkSpeed, start, bubble: bubbleText }: PetConfig) {
  const tex = useTexture(textures);

  useMemo(() => {
    for (const t of Object.values(tex)) {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 4;
    }
  }, [tex]);

  /* one pixel scale for every view of this pet */
  const px = height / rig.front.height;
  /* body distance per full cycle, so a planted paw holds still on the floor */
  const stride = useMemo(() => {
    const side = rig.left;
    const leg = Object.values(side.parts).find((p) => p.mode === 'shear')!;
    return (2 * SWING * (side.height - leg.pivotY) * px) / STANCE;
  }, [rig, px]);

  /* scene graph handles */
  const rootRef   = useRef<THREE.Group>(null);
  const shadowRef = useRef<THREE.Group>(null);
  const spriteRef = useRef<THREE.Group>(null);
  const viewRefs  = useRef<Partial<Record<ViewName, THREE.Group | null>>>({});
  const bodyRefs  = useRef<Partial<Record<ViewName, THREE.Mesh | null>>>({});
  const partRefs  = useRef<Record<string, THREE.Group | null>>({});

  /* behaviour state */
  const pos       = useRef(new THREE.Vector3(start[0], 0, start[1]));
  const target    = useRef(new THREE.Vector3(start[0], 0, start[1]));
  const heading   = useRef(Math.PI);  // radians around Y; 0 faces +z
  const speed     = useRef(0);
  const phase     = useRef(0);
  const gait      = useRef(0);        // 0 = standing still, 1 = full stride
  const mode      = useRef<Mode>('pause');
  const modeTimer = useRef(0.5 + Math.random() * 1.5);
  const view      = useRef<ViewName>('front');
  const lastSide  = useRef<'left' | 'right'>('left');
  const hopTimer  = useRef(0);
  const swaySeed  = useMemo(() => Math.random() * 10, []);

  const [hovered, setHovered] = useState(false);
  const [bubble, setBubble]   = useState(false);

  useEffect(() => {
    positions.set(id, pos.current);
    return () => { positions.delete(id); };
  }, [id]);

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'default';
    return () => { document.body.style.cursor = 'default'; };
  }, [hovered]);

  useEffect(() => {
    if (!bubble) return;
    const tid = setTimeout(() => setBubble(false), BUBBLE_TIME * 1000);
    return () => clearTimeout(tid);
  }, [bubble]);

  const toCam = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05); // a backgrounded tab shouldn't teleport the pet
    const root = rootRef.current;
    const sprite = spriteRef.current;
    if (!root || !sprite) return;
    const t = state.clock.elapsedTime;

    /* ── decide what to do ── */
    let want = 0;
    if (mode.current === 'walk') {
      const dx = target.current.x - pos.current.x;
      const dz = target.current.z - pos.current.z;
      const dist = Math.hypot(dx, dz);

      /* another pet just ahead: pick somewhere else to go */
      const hx = Math.sin(heading.current);
      const hz = Math.cos(heading.current);
      for (const [otherId, q] of positions) {
        if (otherId === id) continue;
        const ox = q.x - pos.current.x;
        const oz = q.z - pos.current.z;
        const od = Math.hypot(ox, oz);
        if (od < PERSONAL_SPACE && (ox * hx + oz * hz) / (od || 1) > 0.3) {
          target.current = pickTarget(pos.current, id);
        }
      }

      if (dist < ARRIVE_DIST) {
        const rest = Math.random() < REST_CHANCE;
        mode.current = rest ? 'rest' : 'pause';
        modeTimer.current = rest ? 2.5 + Math.random() * 3.5 : 0.6 + Math.random() * 1.2;
      } else {
        const diff = wrapAngle(Math.atan2(dx, dz) - heading.current);
        heading.current += THREE.MathUtils.clamp(diff, -TURN_RATE * dt, TURN_RATE * dt);
        /* ease off near the destination and while turning sharply */
        const settle = THREE.MathUtils.clamp(dist / SLOW_RADIUS, 0.3, 1);
        const align  = 0.3 + 0.7 * Math.max(0, Math.cos(diff));
        want = walkSpeed * settle * align;
      }
    } else {
      modeTimer.current -= dt;
      if (modeTimer.current <= 0) {
        mode.current = 'walk';
        target.current = pickTarget(pos.current, id);
      }
    }

    /* ── move ── */
    speed.current += (want - speed.current) * Math.min(1, dt * ACCEL);
    const step = speed.current * dt;
    pos.current.x = THREE.MathUtils.clamp(pos.current.x + Math.sin(heading.current) * step, BOUNDS.minX, BOUNDS.maxX);
    pos.current.z = THREE.MathUtils.clamp(pos.current.z + Math.cos(heading.current) * step, BOUNDS.minZ, BOUNDS.maxZ);
    /* legs cycle by distance covered, not by time, so a slowing pet takes slower steps */
    phase.current += step / stride;
    const gaitTarget = THREE.MathUtils.clamp(speed.current / (walkSpeed * 0.45), 0, 1);
    gait.current += (gaitTarget - gait.current) * Math.min(1, dt * 6);

    /* step up onto the rug's pile rather than sinking into it */
    const floorY = rugHeightAt(pos.current.x, pos.current.z);
    root.position.set(pos.current.x, root.position.y + (floorY - root.position.y) * Math.min(1, dt * 12), pos.current.z);

    /* ── face the camera, pick the drawing ── */
    const cam = state.camera;
    toCam.set(cam.position.x - pos.current.x, 0, cam.position.z - pos.current.z).normalize();
    sprite.rotation.y = Math.atan2(toCam.x, toCam.z);

    const hx = Math.sin(heading.current);
    const hz = Math.cos(heading.current);
    /* + = walking toward the viewer; across: + = toward screen right */
    const towards = hx * toCam.x + hz * toCam.z;
    const across  = hx * toCam.z - hz * toCam.x;
    if (across > 0.12)  lastSide.current = 'right';
    if (across < -0.12) lastSide.current = 'left';

    const cur = view.current;
    let next: ViewName;
    if (mode.current === 'rest') {
      next = 'front';  // settles down facing whoever is looking
    } else if (towards > (cur === 'front' ? 0.5 : 0.68)) {
      next = 'front';
    } else if (towards < (cur === 'back' ? -0.5 : -0.68)) {
      next = 'back';
    } else {
      next = lastSide.current;
    }
    view.current = next;

    for (const v of VIEWS) {
      const g = viewRefs.current[v];
      if (!g) continue;
      g.visible = v === next;
      /* side views squeeze as the walk turns into or out of the screen, like a turn in depth */
      g.scale.x = v === 'left' || v === 'right'
        ? 0.6 + 0.4 * Math.min(1, Math.abs(across) * 1.3)
        : 1;
    }

    /* ── animate the visible view's parts ── */
    const r = rig[next];
    const amp = gait.current;
    const bob = BOB * Math.cos(phase.current * Math.PI * 4) * amp;
    const body = bodyRefs.current[next];
    if (body) body.position.y = (r.height * px) / 2 + bob;

    for (const [key, P] of Object.entries(r.parts)) {
      const g = partRefs.current[`${next}:${key}`];
      if (!g) continue;
      const jx = (P.pivotX - r.width / 2) * px;
      const jy = (r.height - P.pivotY) * px;
      const jz = -0.005 + P.depth * 0.0008;

      if (P.mode === 'sway') {
        const a = Math.sin(t * (mode.current === 'rest' ? 2.6 : 1.8) + swaySeed)
          * TAIL_SWAY * (mode.current === 'rest' ? 1.4 : 1);
        const c = Math.cos(a);
        const s = Math.sin(a);
        g.matrix.set(
          c, -s, 0, jx,
          s,  c, 0, jy + bob,
          0,  0, 1, jz,
          0,  0, 0, 1,
        );
      } else {
        const { swing, lift } = legPose(phase.current + P.phase);
        const shear = P.mode === 'shear' ? -r.facing * SWING * swing * amp : 0;
        const shorten = (P.mode === 'shear' ? SIDE_LIFT : FB_LIFT) * lift * amp;
        /* stretch to keep a planted paw on the floor as the body bobs; shorten as it steps */
        const sy = (1 + bob / jy) * (1 - shorten);
        g.matrix.set(
          1, shear, 0, jx,
          0, sy,    0, jy + bob,
          0, 0,     1, jz,
          0, 0,     0, 1,
        );
      }
      g.matrixWorldNeedsUpdate = true;
    }

    /* ── whole-sprite moves: hop when petted, breathing and a little wiggle at rest ── */
    let up = 0;
    let squashY = mode.current === 'rest' ? 1 + Math.sin(t * 2.4 + swaySeed) * 0.012 : 1;
    sprite.rotation.z = mode.current === 'rest' ? Math.sin(t * 3.1 + swaySeed) * 0.02 : 0;
    if (hopTimer.current > 0) {
      hopTimer.current = Math.max(0, hopTimer.current - dt);
      const p = 1 - hopTimer.current / HOP_TIME;
      up += Math.sin(p * Math.PI) * 0.28;
      squashY *= 1 + Math.sin(p * Math.PI) * 0.05;
    }
    sprite.position.y = up;
    sprite.scale.y = squashY;

    /* the shadow stretches along the body */
    if (shadowRef.current) {
      shadowRef.current.rotation.y = heading.current;
      shadowRef.current.scale.set(0.9, 1, mode.current === 'rest' ? 1.2 : 1.6);
    }
  });

  const onPet = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    hopTimer.current = HOP_TIME;
    setBubble(true);
  };

  return (
    <group ref={rootRef} position={[start[0], 0, start[1]]}>
      {/* soft floor shadow */}
      <group ref={shadowRef}>
        <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.2, 24]} />
          <meshBasicMaterial color="#000" transparent opacity={0.28} depthWrite={false} />
        </mesh>
      </group>

      <group
        ref={spriteRef}
        onClick={onPet}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {VIEWS.map((v) => {
          const r = rig[v];
          return (
            <group key={v} ref={(el) => { viewRefs.current[v] = el; }} visible={v === 'front'}>
              {Object.entries(r.parts).map(([key, P]) => (
                <group
                  key={key}
                  ref={(el) => { partRefs.current[`${v}:${key}`] = el; }}
                  matrixAutoUpdate={false}
                >
                  {/* the part hangs from its joint, which sits at the group origin */}
                  <mesh
                    position={[((P.x0 + P.x1) / 2 - P.pivotX) * px, (P.pivotY - (P.y0 + P.y1) / 2) * px, 0]}
                    scale={[(P.x1 - P.x0) * px, (P.y1 - P.y0) * px, 1]}
                    renderOrder={1 + P.depth}
                  >
                    <planeGeometry args={[1, 1]} />
                    <meshBasicMaterial
                      map={tex[`${v}-${key}`]}
                      color={TINT}
                      transparent
                      alphaTest={0.08}
                      side={THREE.DoubleSide}
                    />
                  </mesh>
                </group>
              ))}
              {/* body drawn last so it covers the tops of the parts */}
              <mesh
                ref={(el) => { bodyRefs.current[v] = el; }}
                position={[0, (r.height * px) / 2, 0]}
                scale={[r.width * px, r.height * px, 1]}
                renderOrder={10}
              >
                <planeGeometry args={[1, 1]} />
                <meshBasicMaterial
                  map={tex[`${v}-body`]}
                  color={TINT}
                  transparent
                  alphaTest={0.08}
                  side={THREE.DoubleSide}
                />
              </mesh>
            </group>
          );
        })}

        {bubble && (
          <Html position={[0, height + 0.16, 0]} center zIndexRange={[10, 0]}>
            <div className="pet-bubble">{bubbleText}</div>
          </Html>
        )}
      </group>
    </group>
  );
}
