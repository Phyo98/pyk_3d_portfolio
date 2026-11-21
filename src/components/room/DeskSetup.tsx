import { useTexture } from '@react-three/drei';
import { useEffect, useState } from 'react';
import * as THREE from 'three';
import phyoImg from '../../assets/phyo.webp';
import GamingChair from './GamingChair';
import GamingDesk from './GamingDesk';
import Monitor from './Monitor';

/* circular portrait, centred on the screen (screen is 1.72 × 1.08) */
const PHOTO_R = 0.44;
const PHOTO_X = 3.5;
const PHOTO_Y = 2.88;

/* the source is portrait (1750 × 2432); crop it square so the circle does not
   squash the image. The square starts near the top of the photo so the whole
   head is in frame rather than cut by a centred crop. three.js UVs start
   bottom-left, so the offset is measured up from the bottom of the image. */
const PHOTO_ASPECT = 1750 / 2432;
const CROP_TOP = 0.04;             // share of the image height above the crop
const CROP_OFFSET_Y = 1 - CROP_TOP - PHOTO_ASPECT;

type Props = {
  onSelectAbout: () => void;
  onSelectSkills: () => void;
  isAboutActive: boolean;
  isSkillsActive: boolean;
};

export default function DeskSetup({ onSelectAbout, onSelectSkills, isAboutActive, isSkillsActive }: Props) {
  const [hoverMonitor, setHoverMonitor] = useState(false);
  const [hoverDesk,    setHoverDesk]    = useState(false);

  const photo = useTexture(phyoImg);

  useEffect(() => {
    photo.colorSpace = THREE.SRGBColorSpace;
    photo.repeat.set(1, PHOTO_ASPECT);
    photo.offset.set(0, CROP_OFFSET_Y);
    photo.needsUpdate = true;
  }, [photo]);

  useEffect(() => {
    document.body.style.cursor = (hoverMonitor || hoverDesk) ? 'pointer' : 'default';
    return () => { document.body.style.cursor = 'default'; };
  }, [hoverMonitor, hoverDesk]);

  const monitorGlow = (hoverMonitor || isAboutActive) ? 8 : 1.8;
  const kbGlow      = (hoverDesk   || isSkillsActive) ? 5 : 2.2;
  /* just enough self-lighting to read against the screen, not to blow out */
  const photoGlow   = (hoverMonitor || isAboutActive) ? 0.28 : 0.12;

  return (
    <group>
      {/* ── Desk: lavender top with neon edge, sled leg, drawer pedestal ── */}
      <GamingDesk
        glow={kbGlow}
        onPointerOver={() => setHoverDesk(true)}
        onPointerOut={() => setHoverDesk(false)}
        onClick={onSelectSkills}
      />

      {/* ── Monitor: lavender bezel, night-sky screen, stand ── */}
      <Monitor
        brightness={(hoverMonitor || isAboutActive) ? 1 : 0.8}
        onPointerOver={() => setHoverMonitor(true)}
        onPointerOut={() => setHoverMonitor(false)}
        onClick={onSelectAbout}
      />

      {/* Dark disc behind the portrait, so the wallpaper does not bleed through */}
      <mesh position={[PHOTO_X, PHOTO_Y, -3.49]}>
        <circleGeometry args={[PHOTO_R + 0.02, 64]} />
        <meshStandardMaterial
          color="#1a1030"
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* My photo — circular, centred on the screen */}
      <mesh
        position={[PHOTO_X, PHOTO_Y, -3.48]}
        onPointerOver={() => setHoverMonitor(true)}
        onPointerOut={() => setHoverMonitor(false)}
        onClick={onSelectAbout}
      >
        <circleGeometry args={[PHOTO_R, 64]} />
        <meshStandardMaterial
          map={photo}
          color="#8f97ad"
          emissive="#ffffff"
          emissiveMap={photo}
          emissiveIntensity={photoGlow}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Neon ring around the portrait */}
      <mesh position={[PHOTO_X, PHOTO_Y, -3.47]}>
        <ringGeometry args={[PHOTO_R + 0.02, PHOTO_R + 0.05, 64]} />
        <meshStandardMaterial
          color="#c39bff"
          emissive="#b07aff"
          emissiveIntensity={monitorGlow * 0.6}
          side={THREE.DoubleSide}
          transparent
          opacity={0.7}
          depthWrite={false}
        />
      </mesh>

      {/* ── Keyboard ── */}
      <mesh
        position={[3.2, 1.87, -2.62]}
        onPointerOver={() => setHoverDesk(true)}
        onPointerOut={() => setHoverDesk(false)}
        onClick={onSelectSkills}
      >
        <boxGeometry args={[1.45, 0.045, 0.52]} />
        <meshStandardMaterial color="#0c0c1c" roughness={0.4} metalness={0.32} />
      </mesh>

      {/* Keyboard RGB top glow */}
      <mesh position={[3.2, 1.897, -2.62]}>
        <planeGeometry args={[1.4, 0.48]} />
        <meshStandardMaterial
          color="#aa44ff"
          emissive="#aa44ff"
          emissiveIntensity={kbGlow}
          transparent
          opacity={0.85}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Keyboard edge glow outline */}
      <mesh position={[3.2, 1.895, -2.62]}>
        <boxGeometry args={[1.48, 0.01, 0.55]} />
        <meshStandardMaterial
          color="#cc66ff"
          emissive="#cc66ff"
          emissiveIntensity={kbGlow * 1.2}
          transparent
          opacity={0.5}
          depthWrite={false}
        />
      </mesh>

      {/* ── Mouse ── */}
      <mesh position={[2.12, 1.87, -2.6]}>
        <boxGeometry args={[0.13, 0.04, 0.22]} />
        <meshStandardMaterial color="#1a1a2c" roughness={0.4} metalness={0.4} />
      </mesh>

      {/* ── Crystal galaxy lamp ── */}
      <mesh position={[1.7, 2.12, -3.32]}>
        <cylinderGeometry args={[0.09, 0.14, 0.42, 8]} />
        <meshStandardMaterial
          color="#cc88ff"
          emissive="#8800ff"
          emissiveIntensity={2.5}
          transparent
          opacity={0.88}
          roughness={0.05}
          metalness={0.1}
        />
      </mesh>

      {/* Lamp base */}
      <mesh position={[1.7, 1.89, -3.32]}>
        <cylinderGeometry args={[0.16, 0.18, 0.04, 8]} />
        <meshStandardMaterial color="#1a1a2a" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* ── Small photo frame on desk ── */}
      <mesh position={[4.8, 1.98, -3.5]}>
        <boxGeometry args={[0.52, 0.68, 0.05]} />
        <meshStandardMaterial color="#0a0010" roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[4.8, 1.98, -3.47]}>
        <planeGeometry args={[0.44, 0.6]} />
        <meshStandardMaterial
          color="#1a0a2a"
          emissive="#440066"
          emissiveIntensity={0.4}
        />
      </mesh>


      {/* ── Gaming chair: lavender, cat ears, facing the room ── */}
      <GamingChair position={[2.5, 0, -1.2]} />
    </group>
  );
}
