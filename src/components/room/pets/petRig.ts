/* Shapes of the generated rig files (scripts/pet-rig.py). Pixel coordinates are
   in the view's own image, origin top-left. */

export type ViewName = 'front' | 'back' | 'left' | 'right';

export type PartRig = {
  x0: number; x1: number; y0: number; y1: number;
  /** joint the part hangs from / swings around */
  pivotX: number; pivotY: number;
  /** offset in the walk cycle */
  phase: number;
  /** shear = leg swings fore/aft (side views); lift = leg shortens as it steps
      (front/back views); sway = tail rocks around its base */
  mode: 'shear' | 'lift' | 'sway';
  /** draw order, back to front; the body is drawn over all parts */
  depth: number;
};

export type ViewRig = { facing: -1 | 0 | 1; width: number; height: number; parts: Record<string, PartRig> };

export type PetRig = Record<ViewName, ViewRig>;
