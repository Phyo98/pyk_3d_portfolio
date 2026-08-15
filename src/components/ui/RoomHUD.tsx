import type { SectionId } from '../../App';

const HOTSPOTS: { id: SectionId; label: string; hint: string }[] = [
  { id: 'about',    label: 'Monitor',      hint: 'About me'       },
  { id: 'skills',   label: 'Desk',         hint: 'My skills'      },
  { id: 'projects', label: 'Posters',      hint: 'My projects'    },
  { id: 'contact',  label: 'Sakura Tree',  hint: 'Get in touch'   },
];

type Props = {
  activeSection: SectionId | null;
  onSelectSection: (id: SectionId) => void;
};

export default function RoomHUD({ activeSection, onSelectSection }: Props) {
  if (activeSection) return null;

  return (
    <div className="room-hud">
      <div className="hud-title">
        <div className="hud-brand">PHYO'S ROOM</div>
        <div className="hud-subtitle">Click an object to explore</div>
      </div>

      <div className="hud-hotspots">
        {HOTSPOTS.map(({ id, label, hint }) => (
          <button
            key={id}
            className="hud-hotspot-btn"
            onClick={() => onSelectSection(id)}
            type="button"
          >
            <div className="hud-dot" />
            <div>
              <div className="hud-label">{label}</div>
              <div className="hud-hint">{hint}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
