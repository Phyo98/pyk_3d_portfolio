import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const WALK_KEYS = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight']);
const EYE_HEIGHT = 1.8;
const WALK_SPEED = 4;
const BOUNDARY = 45;

export default function GardenWalkControls({ ground }: { ground: (x: number, z: number) => number }) {
  const { camera, gl } = useThree();
  const keys = useRef(new Set<string>());
  const yaw = useRef(0);
  const pitch = useRef(-0.05);
  const rotation = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const direction = useRef(new THREE.Vector3());

  useEffect(() => {
    const canvas = gl.domElement;
    const perspective = camera as THREE.PerspectiveCamera;
    const pointers = new Map<number, { x: number; y: number }>();
    let pinchDistance = 0;
    const typing = (target: EventTarget | null) => target instanceof HTMLElement &&
      (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));
    const down = (event: KeyboardEvent) => {
      if (!WALK_KEYS.has(event.code) || typing(event.target) || event.ctrlKey || event.metaKey || event.altKey) return;
      event.preventDefault();
      keys.current.add(event.code);
    };
    const up = (event: KeyboardEvent) => { keys.current.delete(event.code); };
    const clear = () => { keys.current.clear(); pointers.clear(); pinchDistance = 0; };
    const visibility = () => { if (document.hidden) clear(); };
    const pointerDown = (event: PointerEvent) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      canvas.focus({ preventScroll: true });
      canvas.setPointerCapture(event.pointerId);
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      pinchDistance = 0;
    };
    const zoom = (amount: number) => {
      perspective.fov = THREE.MathUtils.clamp(perspective.fov + amount, 40, 80);
      perspective.updateProjectionMatrix();
    };
    const pointerMove = (event: PointerEvent) => {
      const previous = pointers.get(event.pointerId);
      if (!previous) return;
      const dx = event.clientX - previous.x, dy = event.clientY - previous.y;
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (pointers.size > 1) {
        const [a, b] = [...pointers.values()];
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinchDistance) zoom((pinchDistance - distance) * 0.12);
        pinchDistance = distance;
      } else {
        yaw.current -= dx * 0.003;
        pitch.current = THREE.MathUtils.clamp(pitch.current - dy * 0.003, -1.15, 1.15);
      }
    };
    const pointerUp = (event: PointerEvent) => {
      pointers.delete(event.pointerId);
      pinchDistance = 0;
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    };
    const wheel = (event: WheelEvent) => { event.preventDefault(); zoom(event.deltaY * 0.025); };
    const oldTabIndex = canvas.tabIndex;
    canvas.tabIndex = 0;
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', clear);
    document.addEventListener('visibilitychange', visibility);
    canvas.addEventListener('pointerdown', pointerDown);
    canvas.addEventListener('pointermove', pointerMove);
    canvas.addEventListener('pointerup', pointerUp);
    canvas.addEventListener('pointercancel', pointerUp);
    canvas.addEventListener('lostpointercapture', pointerUp);
    canvas.addEventListener('wheel', wheel, { passive: false });
    return () => {
      clear();
      canvas.tabIndex = oldTabIndex;
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', clear);
      document.removeEventListener('visibilitychange', visibility);
      canvas.removeEventListener('pointerdown', pointerDown);
      canvas.removeEventListener('pointermove', pointerMove);
      canvas.removeEventListener('pointerup', pointerUp);
      canvas.removeEventListener('pointercancel', pointerUp);
      canvas.removeEventListener('lostpointercapture', pointerUp);
      canvas.removeEventListener('wheel', wheel);
    };
  }, [camera, gl]);

  useFrame((_, delta) => {
    const pressed = keys.current;
    const forward = Number(pressed.has('KeyW') || pressed.has('ArrowUp')) - Number(pressed.has('KeyS') || pressed.has('ArrowDown'));
    const right = Number(pressed.has('KeyD') || pressed.has('ArrowRight')) - Number(pressed.has('KeyA') || pressed.has('ArrowLeft'));
    direction.current.set(
      -Math.sin(yaw.current) * forward + Math.cos(yaw.current) * right,
      0,
      -Math.cos(yaw.current) * forward - Math.sin(yaw.current) * right,
    );
    if (direction.current.lengthSq() > 0) camera.position.addScaledVector(direction.current.normalize(), WALK_SPEED * Math.min(delta, 0.05));
    const radius = Math.hypot(camera.position.x, camera.position.z);
    if (radius > BOUNDARY) {
      camera.position.x *= BOUNDARY / radius;
      camera.position.z *= BOUNDARY / radius;
    }
    camera.position.y = ground(camera.position.x, camera.position.z) + EYE_HEIGHT;
    rotation.current.set(pitch.current, yaw.current, 0);
    camera.quaternion.setFromEuler(rotation.current);
  });
  return null;
}
