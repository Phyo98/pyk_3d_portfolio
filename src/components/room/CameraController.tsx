import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useEffect, useRef } from 'react';
import type { SectionId } from '../../App';

const STATES: Record<'room' | SectionId, { pos: [number, number, number]; look: [number, number, number] }> = {
  room:     { pos: [0,    4,    9],   look: [0,    2,    0]    },
  about:    { pos: [5,    2.8, -0.5], look: [4.7,  2.5, -3.5]  },
  skills:   { pos: [2.5,  2.8,  0.5], look: [ 0.0, 1.8, -3.5]  },
  projects: { pos: [3,    3.5,  0],   look: [4.4,  3.8, -5.9]  },
  contact:  { pos: [-2,   3.5, -1],   look: [-5.5, 2.5, -4.5]  },
};

const ZOOM_MIN = -5;
const ZOOM_MAX =  8;

export default function CameraController({ activeSection }: { activeSection: SectionId | null }) {
  const { camera } = useThree();
  const targetPos  = useRef(new THREE.Vector3(...STATES.room.pos));
  const targetLook = useRef(new THREE.Vector3(...STATES.room.look));
  const curLook    = useRef(new THREE.Vector3(...STATES.room.look));
  const zoomOffset = useRef(0);
  const activeSectionRef = useRef(activeSection);

  useEffect(() => { activeSectionRef.current = activeSection; }, [activeSection]);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (activeSectionRef.current) return;
      zoomOffset.current = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoomOffset.current + e.deltaY * 0.012));
    };
    window.addEventListener('wheel', onWheel, { passive: true });
    return () => window.removeEventListener('wheel', onWheel);
  }, []);

  useEffect(() => {
    const s = activeSection ? STATES[activeSection] : STATES.room;
    targetPos.current.set(...s.pos);
    targetLook.current.set(...s.look);
  }, [activeSection]);

  useFrame((_, delta) => {
    const t = Math.min(delta * 2.8, 1);
    const effective = targetPos.current.clone();
    if (!activeSectionRef.current) effective.z += zoomOffset.current;
    camera.position.lerp(effective, t);
    curLook.current.lerp(targetLook.current, t);
    camera.lookAt(curLook.current);
  });

  return null;
}
