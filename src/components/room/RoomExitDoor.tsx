import GrandCastleDoor from '../GrandCastleDoor';
import { recentlyDragged } from './gesture';

export default function RoomExitDoor({ onBack, enabled }: { onBack: () => void; enabled: boolean }) {
  return <>
    <GrandCastleDoor
      position={[0, 0.08, 11.8]} rotation={Math.PI} scale={0.7}
      active={enabled} onExit={() => { if (!recentlyDragged()) onBack(); }}
      label="Guest hall · Click to return"
    />
    <pointLight position={[0, 3.08, 10.8]} intensity={12} color="#d4b9ec" distance={8} />
  </>;
}
