import { useState } from 'react';
import SecretGarden from './components/SecretGarden';
import LibraryRoom from './components/LibraryRoom';
import GuestHall from './components/GuestHall';
import CastleEntrance from './components/CastleEntrance';
import Scene3D from './components/Scene3D';
import ContentPanel from './components/ui/ContentPanel';

export type SectionId = 'about' | 'skills' | 'projects' | 'contact';

function App() {
  const [roomReady, setRoomReady] = useState(false);
  const [location, setLocation] = useState<'castle' | 'hall' | 'room' | 'library' | 'garden'>('castle');
  const inside = location === 'room';
  const [activeSection, setActiveSection] = useState<SectionId | null>(null);

  return (
    <div className="experience-root">
      {location === 'castle' && <CastleEntrance onInside={() => setLocation('hall')} />}
      {location === 'hall' && <GuestHall onInside={(destination) => { setRoomReady(false); setLocation(destination); }} onBack={() => setLocation('castle')} />}
      {location === 'library' && <LibraryRoom onBack={() => setLocation('hall')} />}
      {location === 'garden' && <SecretGarden onBack={() => { setRoomReady(false); setLocation('room'); }} />}
      {inside && <div className="room-arrival">
      <Scene3D
        onGarden={() => { setActiveSection(null); setLocation('garden'); }}
        onBack={() => { setActiveSection(null); setRoomReady(false); setLocation('hall'); }}
        onReady={() => setRoomReady(true)}
        activeSection={activeSection}
        onSelectSection={setActiveSection}
      />
      <div className={`room-loading-veil${roomReady ? ' is-ready' : ''}`} role="status">
        {!roomReady && <p>Opening your room…</p>}
      </div>
      </div>}
      {inside && roomReady && !activeSection && (
        <p className="room-touch-hint">Tap an object to explore · drag for a 360° view · pinch to zoom</p>
      )}
      {inside && roomReady && !activeSection && <button className="castle-return" onClick={() => { setLocation('hall'); setRoomReady(false); }}>Back to hall</button>}
      {inside && activeSection && (
        <ContentPanel section={activeSection} onClose={() => setActiveSection(null)} />
      )}
    </div>
  );
}

export default App;
