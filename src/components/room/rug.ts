/* Shape and placement of the cloud rug, shared by the rug itself (Flooring)
   and anything that walks across it (RoamingPet). */

export const RUG_CENTER: [number, number] = [0, 1.8];   // room x, z
export const RUG_SCALE = 1.25;
export const RUG_THICK = 0.022;

/* puffs that make up the cloud, in rug-local units (x across, y toward the back wall) */
export const PUFFS: [number, number, number][] = [
  [0, 0, 1.15], [-1.05, -0.15, 0.85], [1.05, -0.15, 0.85],
  [-0.5, 0.55, 0.78], [0.45, 0.62, 0.85], [-1.55, -0.35, 0.55], [1.6, -0.3, 0.55],
  [-0.4, -0.55, 0.75], [0.5, -0.55, 0.72],
];

/** Height of the rug's top surface at a room floor point (0 off the rug), so
    anything walking across it can step up onto the pile instead of sinking in. */
export const RUG_TOP = (RUG_THICK + 0.012) * RUG_SCALE + 0.002;
export function rugHeightAt(x: number, z: number) {
  const px = (x - RUG_CENTER[0]) / RUG_SCALE;
  const py = (RUG_CENTER[1] - z) / RUG_SCALE;
  for (const [cx, cy, r] of PUFFS) {
    if ((px - cx) ** 2 + (py - cy) ** 2 < r * r) return RUG_TOP;
  }
  return 0;
}
