import { useState } from 'react';
import Scene3D from './components/Scene3D';
import ContentPanel from './components/ui/ContentPanel';

export type SectionId = 'about' | 'skills' | 'projects' | 'contact';

function App() {
  const [activeSection, setActiveSection] = useState<SectionId | null>(null);

  return (
    <div className="experience-root">
      <Scene3D
        activeSection={activeSection}
        onSelectSection={setActiveSection}
      />
      {!activeSection && (
        <p className="room-touch-hint">Tap an object to explore · drag to look around · pinch to zoom</p>
      )}
      {activeSection && (
        <ContentPanel section={activeSection} onClose={() => setActiveSection(null)} />
      )}
    </div>
  );
}

export default App;
