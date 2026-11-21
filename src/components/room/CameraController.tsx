import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { useEffect, useLayoutEffect, useRef } from 'react';
import type { SectionId } from '../../App';
import { markDrag } from './gesture';

const STATES: Record<SectionId, { pos: [number, number, number]; look: [number, number, number] }> = {
  about:    { pos: [5, 2.8, -0.5], look: [4.7, 2.5, -3.5] },
  skills:   { pos: [2.5, 2.8, 0.5], look: [0, 1.8, -3.5] },
  projects: { pos: [3, 3.5, 0], look: [4.4, 3.8, -5.9] },
  contact:  { pos: [-2, 3.5, -1], look: [-5.5, 2.5, -4.5] },
};

export default function CameraController({ activeSection }: { activeSection: SectionId | null }) {
  const { camera, gl } = useThree();
  const controls = useRef<OrbitControlsImpl>(null);
  const previousSection = useRef<SectionId | null>(null);
  const savedPosition = useRef(new THREE.Vector3());
  const savedTarget = useRef(new THREE.Vector3(0, 2.8, 3));
  const targetPosition = useRef(new THREE.Vector3());
  const targetLook = useRef(new THREE.Vector3());
  const currentLook = useRef(new THREE.Vector3(0, 2.8, 3));

  // Preserve the exact orbit view when opening and closing a portfolio panel.
  useLayoutEffect(() => {
    const orbit = controls.current;
    if (!orbit) return;
    if (activeSection) {
      if (!previousSection.current) {
        savedPosition.current.copy(camera.position);
        savedTarget.current.copy(orbit.target);
        currentLook.current.copy(orbit.target);
      }
      targetPosition.current.set(...STATES[activeSection].pos);
      targetLook.current.set(...STATES[activeSection].look);
    } else if (previousSection.current) {
      camera.position.copy(savedPosition.current);
      orbit.target.copy(savedTarget.current);
      camera.lookAt(savedTarget.current);
      orbit.update();
    }
    previousSection.current = activeSection;
  }, [activeSection, camera]);

  // Capture mouse and touch drags before object click handlers run.
  useEffect(() => {
    const element = gl.domElement;
    const pointers = new Map<number, { x: number; y: number; dragged: boolean }>();
    const down = (event: PointerEvent) => {
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY, dragged: false });
      if (pointers.size > 1) {
        pointers.forEach(pointer => { pointer.dragged = true; });
        markDrag();
      }
    };
    const move = (event: PointerEvent) => {
      const pointer = pointers.get(event.pointerId);
      if (!pointer) return;
      if (Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) > 6) pointer.dragged = true;
      if (pointer.dragged) markDrag();
    };
    const up = (event: PointerEvent) => {
      if (pointers.get(event.pointerId)?.dragged) markDrag();
      pointers.delete(event.pointerId);
    };
    element.addEventListener('pointerdown', down, true);
    element.addEventListener('pointermove', move, true);
    element.addEventListener('pointerup', up, true);
    element.addEventListener('pointercancel', up, true);
    return () => {
      element.removeEventListener('pointerdown', down, true);
      element.removeEventListener('pointermove', move, true);
      element.removeEventListener('pointerup', up, true);
      element.removeEventListener('pointercancel', up, true);
    };
  }, [gl]);

  useFrame((_, delta) => {
    if (!activeSection) return;
    const blend = 1 - Math.exp(-2.8 * delta);
    camera.position.lerp(targetPosition.current, blend);
    currentLook.current.lerp(targetLook.current, blend);
    camera.lookAt(currentLook.current);
  });

  return <OrbitControls
    ref={controls} makeDefault enabled={!activeSection}
    target={[0, 2.8, 3]} enablePan={false}
    minDistance={2.5} maxDistance={6.2}
    minPolarAngle={1} maxPolarAngle={1.85}
    enableDamping dampingFactor={0.06} rotateSpeed={0.45}
  />;
}
