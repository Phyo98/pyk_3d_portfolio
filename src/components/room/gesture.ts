/* Shared between the camera's touch gestures and the scene's click handlers:
   a finger that drags to pan the room should not also "tap" the object it
   lands on when it lifts. */
let lastDragAt = 0;

export const markDrag = () => { lastDragAt = performance.now(); };

export const recentlyDragged = () => performance.now() - lastDragAt < 300;
