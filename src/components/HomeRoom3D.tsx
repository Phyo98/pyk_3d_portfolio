import { useEffect, useMemo, useRef, useState } from 'react';

type HotspotId = 'about' | 'skills' | 'projects' | 'contact';

type HomeRoom3DProps = {
  activeHotspot: HotspotId;
  onHoverHotspot: (id: HotspotId) => void;
  onSelectHotspot: (id: HotspotId) => void;
};

const hotspotConfig: Array<{
  id: HotspotId;
  label: string;
  style: React.CSSProperties;
}> = [
  { id: 'about', label: 'Laptop', style: { left: '18%', top: '24%' } },
  { id: 'skills', label: 'Desk', style: { left: '49%', top: '18%' } },
  { id: 'projects', label: 'Bed', style: { left: '14%', top: '70%' } },
  { id: 'contact', label: 'Sakura Tree', style: { left: '71%', top: '28%' } },
];

export default function HomeRoom3D({
  activeHotspot,
  onHoverHotspot,
  onSelectHotspot,
}: HomeRoom3DProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: -10, rotateY: -18 });

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;

    const handlePointerMove = (event: PointerEvent) => {
      const rect = shell.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      setTilt({
        rotateX: -10 - y * 18,
        rotateY: -18 + x * 20,
      });
    };

    const handlePointerLeave = () => {
      setTilt({ rotateX: -10, rotateY: -18 });
    };

    shell.addEventListener('pointermove', handlePointerMove);
    shell.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      shell.removeEventListener('pointermove', handlePointerMove);
      shell.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, []);

  const sceneStyle = useMemo(
    () => ({
      transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
    }),
    [tilt]
  );

  return (
    <div className="room-canvas-shell" ref={shellRef}>
      <div className="room-aurora room-aurora-one" />
      <div className="room-aurora room-aurora-two" />

      <div className="room-scene" style={sceneStyle}>
        <div className="room-wall room-wall-back" />
        <div className="room-wall room-wall-left" />
        <div className="room-floor" />
        <div className="room-rug" />
        <div className="window-panel" />
        <div className="window-glow" />

        <button
          className={`room-object room-object-desk ${
            activeHotspot === 'skills' ? 'room-object-active' : ''
          }`}
          onClick={() => onSelectHotspot('skills')}
          onMouseEnter={() => onHoverHotspot('skills')}
          type="button"
        >
          <span className="room-object-label">Desk</span>
          <span className="desk-top" />
          <span className="desk-leg desk-leg-one" />
          <span className="desk-leg desk-leg-two" />
          <span className="desk-drawer" />
        </button>

        <button
          className={`room-object room-object-laptop ${
            activeHotspot === 'about' ? 'room-object-active' : ''
          }`}
          onClick={() => onSelectHotspot('about')}
          onMouseEnter={() => onHoverHotspot('about')}
          type="button"
        >
          <span className="room-object-label">Laptop</span>
          <span className="laptop-screen" />
          <span className="laptop-base" />
          <span className="laptop-glow" />
        </button>

        <button
          className={`room-object room-object-bed ${
            activeHotspot === 'projects' ? 'room-object-active' : ''
          }`}
          onClick={() => onSelectHotspot('projects')}
          onMouseEnter={() => onHoverHotspot('projects')}
          type="button"
        >
          <span className="room-object-label">Bed</span>
          <span className="bed-frame" />
          <span className="bed-mattress" />
          <span className="bed-pillow bed-pillow-one" />
          <span className="bed-pillow bed-pillow-two" />
          <span className="bed-blanket" />
        </button>

        <button
          className={`room-object room-object-tree ${
            activeHotspot === 'contact' ? 'room-object-active' : ''
          }`}
          onClick={() => onSelectHotspot('contact')}
          onMouseEnter={() => onHoverHotspot('contact')}
          type="button"
        >
          <span className="room-object-label">Sakura Tree</span>
          <span className="tree-trunk" />
          <span className="tree-branch tree-branch-one" />
          <span className="tree-branch tree-branch-two" />
          <span className="tree-canopy tree-canopy-one" />
          <span className="tree-canopy tree-canopy-two" />
          <span className="tree-canopy tree-canopy-three" />
          <span className="tree-petal tree-petal-one" />
          <span className="tree-petal tree-petal-two" />
          <span className="tree-petal tree-petal-three" />
        </button>
      </div>

      {hotspotConfig.map((hotspot) => (
        <button
          key={hotspot.id}
          type="button"
          className={`hotspot-marker ${activeHotspot === hotspot.id ? 'hotspot-marker-active' : ''}`}
          style={hotspot.style}
          onMouseEnter={() => onHoverHotspot(hotspot.id)}
          onClick={() => onSelectHotspot(hotspot.id)}
        >
          <span>{hotspot.label}</span>
        </button>
      ))}
    </div>
  );
}
