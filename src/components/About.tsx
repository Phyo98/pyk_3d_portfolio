import { Boxes, PenTool, Radar } from 'lucide-react';

const cards = [
  {
    title: 'Spatial Thinking',
    description:
      'I like interfaces that feel arranged in space instead of stacked mechanically. Depth, contrast, and rhythm matter as much as code quality.',
    icon: Boxes,
  },
  {
    title: 'Visual Direction',
    description:
      'My strongest work leans cinematic: strong silhouettes, bold typography, and motion that carries meaning instead of filling space.',
    icon: PenTool,
  },
  {
    title: 'Build Discipline',
    description:
      'The creative layer still has to ship cleanly. I focus on maintainable React structure, responsive behavior, and polished interaction details.',
    icon: Radar,
  },
] as const;

export default function About() {
  return (
    <section id="about" className="px-4 py-16 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="room-panel p-8 md:p-12">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-6">
              <p className="section-kicker">ABOUT / IDENTITY CUBE</p>
              <h2 className="room-heading text-4xl md:text-5xl">
                I build frontend work that feels designed, not assembled.
              </h2>
              <p className="max-w-2xl text-base leading-8 text-[var(--text-soft)] md:text-lg">
                I&apos;m Phyo Yadanar Kyaw, a developer focused on turning ideas into interfaces
                with atmosphere. This portfolio treats the page like a navigable object so the
                presentation says something before the copy even starts.
              </p>
              <p className="max-w-2xl text-base leading-8 text-[var(--text-muted)]">
                The goal behind the design is straightforward: make the work memorable, keep the
                navigation intuitive, and preserve a production-quality React structure underneath
                the creative layer.
              </p>
            </div>

            <div className="grid gap-4">
              {cards.map(({ title, description, icon: Icon }) => (
                <article key={title} className="floating-panel">
                  <div className="icon-badge">
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">{title}</h3>
                    <p className="mt-3 text-sm leading-7 text-[var(--text-soft)]">{description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
