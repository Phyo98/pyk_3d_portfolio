import { ArrowUpRight, Github } from 'lucide-react';

const projects = [
  {
    title: 'Commerce Control Room',
    description:
      'An e-commerce build structured around inventory, payment flow, and a cleaner buying experience with dashboard-level visibility.',
    tags: ['Laravel', 'Vue', 'Payments', 'Realtime'],
    tone: 'from-[#ff7d66]/30 via-transparent to-transparent',
  },
  {
    title: 'Project Orbit',
    description:
      'A collaborative task system with prioritization, timelines, and a UI language designed to keep dense workflow data readable.',
    tags: ['React', 'Tailwind', 'Kanban', 'Analytics'],
    tone: 'from-[#75d8ff]/30 via-transparent to-transparent',
  },
  {
    title: 'Signal Dashboard',
    description:
      'A multi-account reporting interface for social channels with emphasis on insight hierarchy and scanning speed.',
    tags: ['React', 'Laravel', 'Insights', 'Data UI'],
    tone: 'from-[#ffe17d]/28 via-transparent to-transparent',
  },
] as const;

export default function Projects() {
  return (
    <section id="projects" className="px-4 py-16 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 max-w-3xl">
          <p className="section-kicker">PROJECTS / PROTOTYPE WALL</p>
          <h2 className="room-heading mt-4 text-4xl md:text-5xl">
            Selected work presented as floating project artifacts.
          </h2>
          <p className="mt-5 text-base leading-8 text-[var(--text-soft)]">
            These cards are treated like suspended panels rather than flat thumbnails. The point is
            to make the portfolio feel curated, but still let the project details stay legible.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {projects.map((project, index) => (
            <article
              key={project.title}
              className="project-card"
              style={{ animationDelay: `${index * 160}ms` }}
            >
              <div className={`project-card-glow bg-gradient-to-br ${project.tone}`} />
              <div className="project-card-topline" />
              <div className="relative z-10 flex h-full flex-col">
                <div className="project-index">0{index + 1}</div>
                <h3 className="mt-6 text-2xl font-semibold text-white">{project.title}</h3>
                <p className="mt-4 text-sm leading-7 text-[var(--text-soft)]">
                  {project.description}
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span key={tag} className="project-tag">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-auto flex gap-3 pt-8">
                  <a href="#" className="project-link">
                    View case study
                    <ArrowUpRight size={16} />
                  </a>
                  <a href="#" className="project-link project-link-muted">
                    <Github size={16} />
                    Source
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
