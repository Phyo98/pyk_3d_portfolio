import GrandCastleDoor from './GrandCastleDoor';

type Vec3 = [number, number, number];

// The upstairs entrances and library exit share the castle's full door design,
// scaled to fit the existing landings without changing their camera paths.
export default function CastleRoomDoor({ x, active, entering, onEnter, at, rotation = 0, label, reduced = false }: {
  x: number; active: boolean; entering: boolean; onEnter: () => void;
  at?: Vec3; rotation?: number; label?: string; reduced?: boolean;
}) {
  return <GrandCastleDoor
    position={at ?? [x, 2.6, -4.22]} rotation={rotation} scale={0.5}
    active={active} opening={entering} onExit={onEnter}
    label={label} reduced={reduced}
  />;
}
