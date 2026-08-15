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
import NpcCharacter from './room/NpcCharacter';
import RoomLabels from './room/RoomLabels';
import RoomLighting from './room/RoomLighting';
import RoomStructure from './room/RoomStructure';
import SakuraTree from './room/SakuraTree';
import WallPosters from './room/WallPosters';

type Props = {
  activeSection: SectionId | null;
  onSelectSection: (id: SectionId) => void;
};

export default function Scene3D({ activeSection, onSelectSection }: Props) {
  return (
    <Canvas
      style={{ position: 'absolute', inset: 0 }}
      camera={{ position: [0, 4, 9], fov: 52, near: 0.1, far: 100 }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
      }}
      onCreated={({ gl }) => {
        gl.toneMappingExposure = 1.6;
      }}
      shadows
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
      <group position={[1.2, 0, 0]}>
        <WallPosters
          onSelect={() => onSelectSection('projects')}
          isActive={activeSection === 'projects'}
        />
      </group>
      <SakuraTree
        onSelect={() => onSelectSection('contact')}
        isActive={activeSection === 'contact'}
      />
      <FerrisWheel
        onSelect={() => onSelectSection('skills')}
        isActive={activeSection === 'skills'}
      />
      <NpcCharacter />
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
