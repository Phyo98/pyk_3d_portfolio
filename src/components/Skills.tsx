import { Braces, Database, Globe, Layers3, Palette, PanelsTopLeft } from 'lucide-react';

const skillColumns = [
  {
    title: 'Frontend',
    items: ['React', 'Next.js', 'Vue.js', 'TypeScript', 'Tailwind CSS', 'Bootstrap', 'HTML / CSS'],
    icon: PanelsTopLeft,
  },
  {
    title: 'Backend',
    items: ['PHP', 'Laravel', 'REST API', 'MySQL'],
    icon: Database,
  },
  {
    title: 'Creative & Other',
    items: ['Flutter', 'Unity'],
    icon: Palette,
  },
] as const;

const orbitTools = [
  { label: 'React',    icon: Braces   },
  { label: 'Laravel',  icon: Layers3  },
  { label: 'Next.js',  icon: Globe    },
  { label: 'Tailwind', icon: Palette  },
] as const;

export default function Skills() {
  return (
    <section id="skills" className="px-4 py-16 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr]">
          <div className="room-panel p-8 md:p-10">
            <p className="section-kicker">MY SKILLS</p>
            <h2 className="room-heading mt-4 text-4xl md:text-5xl">
              A full stack skill set built for real&nbsp;products.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--text-soft)]">
              From PHP and Laravel on the server to React, Next.js, and Vue on the client — with
              Git keeping it all in order and Flutter and Unity rounding out the creative side.
              Every layer, covered.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {skillColumns.map(({ title, items, icon: Icon }) => (
                <article key={title} className="stack-card">
                  <div className="icon-badge">
                    <Icon size={18} />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
                  <ul className="mt-4 space-y-3 text-sm text-[var(--text-soft)]">
                    {items.map((item) => (
                      <li key={item} className="flex items-center gap-3">
                        <span className="h-2 w-2 rounded-full bg-[var(--accent)] shadow-[0_0_18px_var(--accent)]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>

          <div className="orbital-panel">
            <div className="orbital-core" />
            <div className="orbital-ring orbital-ring-one" />
            <div className="orbital-ring orbital-ring-two" />
            <div className="orbital-ring orbital-ring-three" />

            {orbitTools.map(({ label, icon: Icon }, index) => (
              <div
                key={label}
                className={`orbit-chip orbit-chip-${index + 1}`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </div>
            ))}

            <div className="orbital-copy">
              <p className="section-kicker">LIVE STACK</p>
              <p className="mt-4 text-lg leading-8 text-[var(--text-soft)]">
                Clean implementation, motion-aware UI, and enough visual confidence to make the
                interface feel authored.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
