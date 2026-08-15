export default function RoomLighting() {
  return (
    <>
      {/* General fill */}
      <ambientLight intensity={1.6} color="#ffffff" />
      <hemisphereLight args={['#ffffff', '#cccccc', 2.2]} />

      {/* Main ceiling washes */}
      <pointLight position={[-3, 7.5, -2]} intensity={55}  color="#ffffff" distance={22} decay={2} castShadow shadow-mapSize={[512,512]} />
      <pointLight position={[ 3, 7.5, -1]} intensity={45}  color="#ffffff" distance={20} decay={2} />
      <pointLight position={[ 0, 7.5,  3]} intensity={35}  color="#ffffff" distance={18} decay={2} />

      {/* Mid-room fill */}
      <pointLight position={[0, 4.5, 0]}  intensity={30}   color="#ffffff" distance={22} decay={1.4} />
      <pointLight position={[0, 3,   2]}  intensity={20}   color="#ffffff" distance={16} decay={1.6} />
      <pointLight position={[0, 5,  -3]}  intensity={22}   color="#ffffff" distance={18} decay={1.5} />

      {/* Sakura tree */}
      <pointLight position={[2.5, 5, -2.5]} intensity={26} color="#ffffff" distance={12} decay={2} />
      <pointLight position={[2.5, 3, -2.5]} intensity={16}  color="#ffffff" distance={8}  decay={2} />

      {/* Monitor glow */}
      <pointLight position={[-3.5, 2.6, -3]} intensity={18} color="#ffffff" distance={7}  decay={2} />

      {/* Keyboard RGB strip */}
      <pointLight position={[-3.2, 2,   -2.7]} intensity={8} color="#ffffff" distance={5} decay={2} />

      {/* Crystal lamp on desk */}
      <pointLight position={[-1.7, 2.2, -3.3]} intensity={12} color="#ffffff" distance={6} decay={2} />

      {/* Window ambient (right wall) */}
      <pointLight position={[6.5, 4, -0.5]} intensity={20} color="#ffffff" distance={12} decay={1.8} />

      {/* Crystal ball on nightstand */}
      <pointLight position={[6.2, 1.5, 0.5]} intensity={10}  color="#ffffff" distance={5}  decay={2} />

      {/* Candle flicker */}
      <pointLight position={[5.7, 1.5, 0.5]} intensity={6}  color="#ffffff" distance={4}  decay={2} />

      {/* Neon sign back wall glow */}
      <pointLight position={[-2, 2.5, -5.5]} intensity={12}  color="#ffffff" distance={6}  decay={2} />

      {/* Right wall glow */}
      <pointLight position={[6.5, 3.5, -1.5]} intensity={10} color="#ffffff" distance={6}  decay={2} />
    </>
  );
}
