import { Html } from '@react-three/drei';

const LABELS: { text: string; pos: [number, number, number] }[] = [
  { text: 'About Me',     pos: [4.7,  3.85, -3.5] },
  { text: 'My Skills',    pos: [0.0,  3.0,  -3.5] },
  { text: 'My Projects',  pos: [2.0,  6.35, -5.7] },
  { text: 'Get in Touch', pos: [-5.5, 6.2,  -4.5] },
];

export default function RoomLabels() {
  return (
    <>
      {LABELS.map(({ text, pos }) => (
        <Html key={text} position={pos} center zIndexRange={[10, 0]}>
          <div style={{
            background: 'rgba(8, 0, 18, 0.78)',
            border: '1px solid rgba(255, 80, 180, 0.55)',
            color: '#f9d0ef',
            padding: '3px 11px 3px 11px',
            borderRadius: '20px',
            fontSize: '11px',
            fontFamily: 'sans-serif',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            userSelect: 'none',
            letterSpacing: '0.04em',
            boxShadow: '0 0 8px rgba(255, 80, 180, 0.3)',
          }}>
            {text}
          </div>
        </Html>
      ))}
    </>
  );
}
