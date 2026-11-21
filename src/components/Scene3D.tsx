import { Canvas } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { Suspense } from 'react';
import * as THREE from 'three';
import type { SectionId } from '../App';
import BedSetup from './room/BedSetup';
import CameraController from './room/CameraController';
import FerrisWheel from './room/FerrisWheel';
import CherryPetals from './room/CherryPetals';
import DeskSetup from './room/DeskSetup';
import NeonSigns from './room/NeonSigns';
import RoamingPet from './room/RoamingPet';
import { PETS } from './room/pets';
import RoomLabels from './room/RoomLabels';
import RoomLighting from './room/RoomLighting';
import RoomStructure from './room/RoomStructure';
import SakuraTree from './room/SakuraTree';
import WallPosters from './room/WallPosters';
import { recentlyDragged } from './room/gesture';

/* phones and small tablets: render at a lower pixel ratio and skip shadows */
const isCompact =
  typeof window !== 'undefined' &&
  window.matchMedia('(max-width: 820px), (pointer: coarse)').matches;

type Props = {
  activeSection: SectionId | null;
  onSelectSection: (id: SectionId) => void;
};

export default function Scene3D({ activeSection, onSelectSection: select }: Props) {
  /* a pan gesture that ends on an object is not a tap on it */
  const onSelectSection = (id: SectionId) => {
    if (recentlyDragged()) return;
    select(id);
  };

  return (
    <Canvas
      style={{ position: 'absolute', inset: 0, touchAction: 'none' }}
      dpr={isCompact ? [1, 1.5] : [1, 2]}
      camera={{ position: [0, 4, 9], fov: 52, near: 0.1, far: 100 }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
      }}
      onCreated={({ gl }) => {
        gl.toneMappingExposure = 1.6;
      }}
      shadows={!isCompact}
    >
      <CameraController activeSection={activeSection} />
      <RoomLighting />
      <RoomStructure />
      {/* DeskSetup loads the portrait texture, so it suspends until it is ready */}
      <Suspense fallback={null}>
        <group position={[1.2, 0, 0]}>
          <DeskSetup
            onSelectAbout={() => onSelectSection('about')}
            onSelectSkills={() => onSelectSection('skills')}
            isAboutActive={activeSection === 'about'}
            isSkillsActive={activeSection === 'skills'}
          />
        </group>
      </Suspense>
      {/* the posters load their artwork as textures */}
      <Suspense fallback={null}>
        <group position={[1.2, 0, 0]}>
          <WallPosters
            onSelect={() => onSelectSection('projects')}
            isActive={activeSection === 'projects'}
          />
        </group>
      </Suspense>
      <SakuraTree
        onSelect={() => onSelectSection('contact')}
        isActive={activeSection === 'contact'}
      />
      <FerrisWheel
        onSelect={() => onSelectSection('skills')}
        isActive={activeSection === 'skills'}
      />
      {/* each pet loads its drawings as textures, so it suspends until they are ready */}
      {PETS.map((pet) => (
        <Suspense key={pet.id} fallback={null}>
          <RoamingPet {...pet} />
        </Suspense>
      ))}
      <BedSetup />
      <NeonSigns />
      <RoomLabels />
      <CherryPetals />
      <EffectComposer>
        <Bloom
          intensity={0.4}
          luminanceThreshold={0.7}
          luminanceSmoothing={0.3}
          mipmapBlur
        />
      </EffectComposer>
    </Canvas>
  );
}
