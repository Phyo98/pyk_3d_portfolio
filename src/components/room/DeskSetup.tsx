import { useTexture } from '@react-three/drei';
import { useEffect, useState } from 'react';
import * as THREE from 'three';
import phyoImg from '../../assets/phyo.webp';

/* circular portrait, centred on the screen (screen is 1.72 × 1.08) */
const PHOTO_R = 0.44;
const PHOTO_X = 3.5;
const PHOTO_Y = 2.88;

/* the source is portrait (1750 × 2432); crop it square so the circle does not
   squash the image. three.js UVs start bottom-left, hence the centred offset. */
const PHOTO_ASPECT = 1750 / 2432;
const CROP_OFFSET_Y = (1 - PHOTO_ASPECT) / 2;

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
      {/* ── Desk surface ── */}
      <mesh
        position={[3.2, 1.8, -3]}
        onPointerOver={() => setHoverDesk(true)}
        onPointerOut={() => setHoverDesk(false)}
        onClick={onSelectSkills}
        castShadow receiveShadow
      >
        <boxGeometry args={[3.8, 0.12, 1.65]} />
        <meshStandardMaterial color="#1a0e06" roughness={0.65} metalness={0.18} />
      </mesh>

      {/* Under-desk LED strip */}
      <mesh position={[3.2, 1.72, -3]}>
        <boxGeometry args={[3.75, 0.025, 1.6]} />
        <meshStandardMaterial
          color="#7b00ff"
          emissive="#7b00ff"
          emissiveIntensity={kbGlow * 0.9}
        />
      </mesh>

      {/* ── Desk legs ── */}
      {([[4.9, -3.7], [4.9, -2.3], [1.5, -3.7], [1.5, -2.3]] as [number, number][]).map(([x, z], i) => (
        <mesh key={i} position={[x, 0.9, z]} castShadow>
          <boxGeometry args={[0.1, 1.75, 0.1]} />
          <meshStandardMaterial color="#120a04" roughness={0.6} />
        </mesh>
      ))}

      {/* ── Monitor frame ── */}
      <mesh
        position={[3.5, 2.88, -3.56]}
        onPointerOver={() => setHoverMonitor(true)}
        onPointerOut={() => setHoverMonitor(false)}
        onClick={onSelectAbout}
        castShadow
      >
        <boxGeometry args={[1.9, 1.25, 0.1]} />
        <meshStandardMaterial color="#0d0920" roughness={0.3} metalness={0.55} />
      </mesh>

      {/* Monitor screen */}
      <mesh
        position={[3.5, 2.88, -3.5]}
        onPointerOver={() => setHoverMonitor(true)}
        onPointerOut={() => setHoverMonitor(false)}
        onClick={onSelectAbout}
      >
        <boxGeometry args={[1.72, 1.08, 0.01]} />
        <meshStandardMaterial
          color="#1133aa"
          emissive="#3355dd"
          emissiveIntensity={monitorGlow}
        />
      </mesh>

      {/* Dark disc behind the portrait, so the screen blue does not bleed through */}
      <mesh position={[PHOTO_X, PHOTO_Y, -3.49]}>
        <circleGeometry args={[PHOTO_R + 0.02, 64]} />
        <meshStandardMaterial
          color="#0a1830"
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
          color="#7788ff"
          emissive="#7788ff"
          emissiveIntensity={monitorGlow * 0.6}
          side={THREE.DoubleSide}
          transparent
          opacity={0.7}
          depthWrite={false}
        />
      </mesh>

      {/* Monitor stand neck */}
      <mesh position={[3.5, 2.32, -3.46]}>
        <boxGeometry args={[0.12, 0.38, 0.18]} />
        <meshStandardMaterial color="#181826" metalness={0.5} roughness={0.3} />
      </mesh>

      {/* Monitor stand base */}
      <mesh position={[3.5, 2.14, -3.4]}>
        <boxGeometry args={[0.65, 0.07, 0.42]} />
        <meshStandardMaterial color="#181826" metalness={0.5} roughness={0.3} />
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


      {/* ── Gaming chair ── */}
      {/* Seat */}
      <mesh position={[2.5, 1.02, -1.2]} castShadow>
        <boxGeometry args={[0.88, 0.13, 0.9]} />
        <meshStandardMaterial color="#080814" roughness={0.75} />
      </mesh>
      {/* Seat cushion */}
      <mesh position={[2.5, 1.1, -1.2]}>
        <boxGeometry args={[0.82, 0.06, 0.84]} />
        <meshStandardMaterial color="#0e0e1e" roughness={0.9} />
      </mesh>
      {/* Backrest */}
      <mesh position={[2.5, 1.75, -1.62]} castShadow>
        <boxGeometry args={[0.88, 1.35, 0.1]} />
        <meshStandardMaterial color="#080814" roughness={0.75} />
      </mesh>
      {/* Backrest padding */}
      <mesh position={[2.5, 1.75, -1.56]}>
        <boxGeometry args={[0.76, 1.22, 0.06]} />
        <meshStandardMaterial color="#0e0e1e" roughness={0.9} />
      </mesh>
      {/* Headrest */}
      <mesh position={[2.5, 2.5, -1.6]}>
        <boxGeometry args={[0.72, 0.4, 0.12]} />
        <meshStandardMaterial color="#080814" roughness={0.75} />
      </mesh>
      {/* Sakura logo on chair */}
      <mesh position={[2.5, 1.9, -1.56]}>
        <circleGeometry args={[0.13, 5]} />
        <meshStandardMaterial
          color="#ff4488"
          emissive="#ff2266"
          emissiveIntensity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Chair central pole */}
      <mesh position={[2.5, 0.55, -1.2]}>
        <cylinderGeometry args={[0.045, 0.045, 0.48, 6]} />
        <meshStandardMaterial color="#3a3a4a" metalness={0.65} roughness={0.28} />
      </mesh>
      {/* Chair base star */}
      <mesh position={[2.5, 0.32, -1.2]}>
        <cylinderGeometry args={[0.55, 0.55, 0.04, 5]} />
        <meshStandardMaterial color="#22222e" metalness={0.55} roughness={0.4} />
      </mesh>

      {/* ── Arm rests ── */}
      <mesh position={[3.0, 1.35, -1.2]}>
        <boxGeometry args={[0.12, 0.1, 0.7]} />
        <meshStandardMaterial color="#0e0e1e" roughness={0.7} />
      </mesh>
      <mesh position={[2.0, 1.35, -1.2]}>
        <boxGeometry args={[0.12, 0.1, 0.7]} />
        <meshStandardMaterial color="#0e0e1e" roughness={0.7} />
      </mesh>
    </group>
  );
}
