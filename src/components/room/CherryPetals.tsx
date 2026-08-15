import { Sparkles } from '@react-three/drei';

export default function CherryPetals() {
  return (
    <group>
      {/* Dense cluster near the sakura tree */}
      <Sparkles
        count={40}
        size={1.1}
        color="#ffaad4"
        speed={0.32}
        scale={[3, 4.5, 3]}
        position={[-5.5, 3.5, -4.5]}
        opacity={0.85}
      />

      {/* Star / galaxy ceiling projection (like a galaxy projector lamp) */}
      <Sparkles
        count={120}
        size={0.55}
        color="#aa88ff"
        speed={0.04}
        scale={[13, 0.4, 11]}
        position={[0, 7.6, -1]}
        opacity={0.45}
      />

    </group>
  );
}
