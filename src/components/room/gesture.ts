/* Shared between the camera's mouse and touch gestures and the scene's click handlers:
   a pointer that drags to rotate the room should not also "tap" the object it
   lands on when it lifts. */
let lastDragAt = 0;

export const markDrag = () => { lastDragAt = performance.now(); };

export const recentlyDragged = () => performance.now() - lastDragAt < 300;
