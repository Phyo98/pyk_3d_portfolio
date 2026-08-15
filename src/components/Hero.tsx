import { ArrowDownRight, MousePointerClick, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import HomeRoom3D from './HomeRoom3D';

const hotspots = [
  { id: 'about', label: 'Laptop', hint: 'Who I am' },
  { id: 'skills', label: 'Desk', hint: 'Tools in motion' },
  { id: 'projects', label: 'Bed', hint: 'Featured builds' },
  { id: 'contact', label: 'Sakura Tree', hint: 'Start a project' },
] as const;

export default function Hero() {
  const [activeHint, setActiveHint] = useState<(typeof hotspots)[number]['id']>('about');

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveHint((current) => {
        const currentIndex = hotspots.findIndex((spot) => spot.id === current);
        return hotspots[(currentIndex + 1) % hotspots.length].id;
      });
    }, 2400);

    return () => window.clearInterval(interval);
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const activeSpot = hotspots.find((spot) => spot.id === activeHint);

  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-28 md:pt-32">
      <div className="mx-auto grid min-h-[calc(100vh-8rem)] max-w-7xl items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative z-10 flex flex-col gap-7">
          <div className="hero-chip">
            <Sparkles size={16} />
            Interactive 3D Portfolio
          </div>

          <div className="space-y-5">
            <p className="section-kicker">DIGITAL SPACE / PHYO YADANAR KYAW</p>
            <h1 className="room-heading text-5xl leading-[0.9] md:text-7xl xl:text-[5.4rem]">
              A creative portfolio staged inside a 3D interior room.
            </h1>
            <p className="max-w-xl text-base leading-8 text-[var(--text-soft)] md:text-lg">
              The homepage is now arranged like a stylized bedroom studio. The laptop, desk, bed,
              and sakura tree each act as a 3D object and navigation point, so the room itself
              becomes the interface for exploring the portfolio.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button onClick={() => scrollToSection('projects')} className="primary-cta">
              Explore projects
              <ArrowDownRight size={18} />
            </button>
            <button onClick={() => scrollToSection('contact')} className="secondary-cta">
              Start a conversation
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              ['3D motion', 'Layered depth, hotspots, and cinematic transitions'],
              ['Creative UI', 'Art direction that avoids a standard template feel'],
              ['Frontend build', 'React, TypeScript, Tailwind, and custom Three.js atmosphere'],
            ].map(([title, text]) => (
              <article key={title} className="info-card">
                <p className="text-xs uppercase tracking-[0.32em] text-[var(--text-muted)]">
                  {title}
                </p>
                <p className="mt-3 text-sm leading-7 text-[var(--text-soft)]">{text}</p>
              </article>
            ))}
          </div>

          <div className="room-note max-w-lg">
            <MousePointerClick size={18} className="text-[var(--accent)]" />
            <span>
              Active hotspot: <strong className="text-white">{activeSpot?.label}</strong>{' '}
              <span className="text-[var(--text-muted)]">/ {activeSpot?.hint}</span>
            </span>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-center">
          <HomeRoom3D
            activeHotspot={activeHint}
            onHoverHotspot={setActiveHint}
            onSelectHotspot={scrollToSection}
          />
        </div>
      </div>
    </section>
  );
}
