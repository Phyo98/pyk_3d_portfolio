import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useEffect, useRef } from 'react';
import type { SectionId } from '../../App';
import { markDrag } from './gesture';

const STATES: Record<'room' | SectionId, { pos: [number, number, number]; look: [number, number, number] }> = {
  room:     { pos: [0,    4,    9],   look: [0,    2,    0]    },
  about:    { pos: [5,    2.8, -0.5], look: [4.7,  2.5, -3.5]  },
  skills:   { pos: [2.5,  2.8,  0.5], look: [ 0.0, 1.8, -3.5]  },
  projects: { pos: [3,    3.5,  0],   look: [4.4,  3.8, -5.9]  },
  contact:  { pos: [-2,   3.5, -1],   look: [-5.5, 2.5, -4.5]  },
};

/* The clickable objects sit roughly between x = -6 and x = 6 near the back
   of the room (z ≈ -4). On narrow / portrait screens the camera backs off
   until that span fits the width; on desktop the default pose already does. */
const CONTENT_HALF_WIDTH = 6;
const CONTENT_PLANE_Z    = -4;
const BASE_FOV           = 52;
const PORTRAIT_FOV       = 62;
const MAX_ROOM_Z         = 20;
const NEAREST_Z          = 4;   // closest zoom, matches the old ZOOM_MIN of -5
const FARTHEST_Z         = 17;  // furthest zoom on desktop, matches ZOOM_MAX of 8
const PAN_LIMIT          = 6;

function roomPose(aspect: number) {
  const fov  = aspect < 1 ? PORTRAIT_FOV : BASE_FOV;
  const tanH = Math.tan(THREE.MathUtils.degToRad(fov / 2)) * aspect;
  const need = CONTENT_PLANE_Z + CONTENT_HALF_WIDTH / tanH;
  const z    = THREE.MathUtils.clamp(need, STATES.room.pos[2], MAX_ROOM_Z);
  /* rise a little as we back off so the floor doesn't swallow the view */
  const y    = STATES.room.pos[1] + (z - STATES.room.pos[2]) * 0.2;
  return { fov, z, y };
}

export default function CameraController({ activeSection }: { activeSection: SectionId | null }) {
  const { camera, size, gl } = useThree();
  const aspect = size.width / Math.max(size.height, 1);

  const targetPos  = useRef(new THREE.Vector3(...STATES.room.pos));
  const targetLook = useRef(new THREE.Vector3(...STATES.room.look));
  const curLook    = useRef(new THREE.Vector3(...STATES.room.look));
  const zoomOffset = useRef(0);
  const panX       = useRef(0);
  const baseZ      = useRef(STATES.room.pos[2]);
  const roomY      = useRef(STATES.room.pos[1]);
  const activeSectionRef = useRef(activeSection);

  useEffect(() => { activeSectionRef.current = activeSection; }, [activeSection]);

  /* zoom limits are expressed as absolute camera z, so they hold at any base distance */
  const clampZoom = (v: number) =>
    THREE.MathUtils.clamp(v, NEAREST_Z - baseZ.current, Math.max(FARTHEST_Z, baseZ.current) - baseZ.current);

  /* refit the room view whenever the viewport shape changes */
  useEffect(() => {
    const { fov, z, y } = roomPose(aspect);
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = fov;
    cam.updateProjectionMatrix();
    baseZ.current = z;
    roomY.current = y;
    zoomOffset.current = clampZoom(zoomOffset.current);
    if (!activeSectionRef.current) targetPos.current.set(0, y, z);
  }, [aspect, camera]);

  /* mouse wheel zoom */
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (activeSectionRef.current) return;
      zoomOffset.current = clampZoom(zoomOffset.current + e.deltaY * 0.012);
    };
    window.addEventListener('wheel', onWheel, { passive: true });
    return () => window.removeEventListener('wheel', onWheel);
  }, []);

  /* touch: one finger drags sideways to pan, two fingers pinch to zoom */
  useEffect(() => {
    const el = gl.domElement;
    let lastX = 0;
    let startX = 0;
    let startY = 0;
    let lastPinch = 0;
    let dragging = false;

    const pinchDist = (t: TouchList) =>
      Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);

    const onStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        lastX = startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        dragging = false;
      } else if (e.touches.length === 2) {
        lastPinch = pinchDist(e.touches);
        markDrag();
      }
    };

    const onMove = (e: TouchEvent) => {
      if (activeSectionRef.current) return;
      if (e.touches.length === 2) {
        const d = pinchDist(e.touches);
        zoomOffset.current = clampZoom(zoomOffset.current - (d - lastPinch) * 0.03);
        lastPinch = d;
        markDrag();
        return;
      }
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      if (!dragging && Math.hypot(t.clientX - startX, t.clientY - startY) > 8) dragging = true;
      if (!dragging) return;
      /* scale finger movement to roughly track the room under it */
      const worldPerPx = (2 * Math.tan(THREE.MathUtils.degToRad((camera as THREE.PerspectiveCamera).fov / 2))
        * (camera.position.z - CONTENT_PLANE_Z)) / el.clientHeight;
      panX.current = THREE.MathUtils.clamp(panX.current - (t.clientX - lastX) * worldPerPx, -PAN_LIMIT, PAN_LIMIT);
      lastX = t.clientX;
      markDrag();
    };

    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchmove',  onMove,  { passive: true });
    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove',  onMove);
    };
  }, [gl, camera]);

  useEffect(() => {
    if (activeSection) {
      const s = STATES[activeSection];
      targetPos.current.set(...s.pos);
      targetLook.current.set(...s.look);
    } else {
      targetPos.current.set(0, roomY.current, baseZ.current);
      targetLook.current.set(...STATES.room.look);
    }
  }, [activeSection]);

  useFrame((_, delta) => {
    const t = Math.min(delta * 2.8, 1);
    const effective = targetPos.current.clone();
    const look = targetLook.current.clone();
    if (!activeSectionRef.current) {
      effective.z += zoomOffset.current;
      effective.x += panX.current;
      look.x      += panX.current;
    }
    camera.position.lerp(effective, t);
    curLook.current.lerp(look, t);
    camera.lookAt(curLook.current);
  });

  return null;
}
