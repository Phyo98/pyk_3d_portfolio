import { CORGI_RIG } from './corgiRig';
import type { PetRig } from './petRig';
import { WHITE_CAT_RIG } from './whitecatRig';

export type PetConfig = {
  id: string;
  rig: PetRig;
  /** texture name (e.g. "left-body", "front-l") → bundled url */
  textures: Record<string, string>;
  /** world height of the front view, ear tips (or raised tail) to paws */
  height: number;
  /** world units per second at full stride */
  walkSpeed: number;
  /** where it first appears, [x, z] */
  start: [number, number];
  /** what it says when petted */
  bubble: string;
};

/* glob patterns must be literal, so each pet gets its own */
const byName = (urls: Record<string, string>) =>
  Object.fromEntries(Object.entries(urls).map(([path, url]) => [path.split('/').pop()!.replace('.webp', ''), url]));

const corgiTextures = byName(
  import.meta.glob<string>('../../../assets/pets/corgi/*.webp', { eager: true, import: 'default' }),
);
const whiteCatTextures = byName(
  import.meta.glob<string>('../../../assets/pets/whitecat/*.webp', { eager: true, import: 'default' }),
);

export const PETS: PetConfig[] = [
  {
    id: 'corgi',
    rig: CORGI_RIG,
    textures: corgiTextures,
    height: 0.78,
    walkSpeed: 0.45,
    start: [0.6, 3.4],
    bubble: 'woof ♡',
  },
  {
    id: 'whitecat',
    rig: WHITE_CAT_RIG,
    textures: whiteCatTextures,
    height: 0.8,
    walkSpeed: 0.4,
    start: [-0.9, 1.2],
    bubble: 'meow ♡',
  },
];
