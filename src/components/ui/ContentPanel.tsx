import {
  AnimatePresence,
  animate,
  LayoutGroup,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion';
import phyoImg from '../../assets/phyo.webp';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Boxes,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Database,
  Github,
  Mail,
  Palette,
  PanelsTopLeft,
  PenTool,
  Radar,
  RotateCcw,
  Send,
  Sparkles,
  User,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type { SectionId } from '../../App';
import { projectFilters, projects } from '../../data/projects';
import type { ProjectCategory } from '../../data/projects';
import { allSkills, projectsUsing, rings } from '../../data/skills';
import type { Ring, Skill } from '../../data/skills';
import SkillOrbit from './SkillOrbit';

/* ── shared stagger wrapper ── */
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } },
};

const PAGE_LABELS: Record<SectionId, string> = {
  about:    'ABOUT · 1 / 4',
  skills:   'SKILLS · 2 / 4',
  projects: 'PROJECTS · 3 / 4',
  contact:  'CONTACT · 4 / 4',
};

/* ── count-up number, animates whenever it mounts ── */
function Counter({ to }: { to: number }) {
  const count   = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));

  useEffect(() => {
    const controls = animate(count, to, { duration: 1.1, ease: [0.22, 1, 0.36, 1] });
    return () => controls.stop();
  }, [count, to]);

  return <motion.span>{rounded}</motion.span>;
}

/* ── portrait that leans toward the cursor ── */
function TiltAvatar({ className = 'fp-avatar-wrap' }: { className?: string }) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const spring = { stiffness: 180, damping: 18, mass: 0.6 };

  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-14, 14]),  spring);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [12, -12]),  spring);
  const glowX   = useSpring(useTransform(mx, [-0.5, 0.5], [-24, 24]),  spring);
  const glowY   = useSpring(useTransform(my, [-0.5, 0.5], [-24, 24]),  spring);

  const track = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width  - 0.5);
    my.set((e.clientY - r.top)  / r.height - 0.5);
  };
  const reset = () => { mx.set(0); my.set(0); };

  return (
    <motion.div
      className={`fp-avatar-wrap ${className}`}
      variants={item}
      onMouseMove={track}
      onMouseLeave={reset}
      style={{ perspective: 900 }}
    >
      <motion.div className="fp-avatar" style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}>
        <motion.div className="fp-avatar-halo" style={{ x: glowX, y: glowY }} />
        <div className="fp-avatar-ring fp-avatar-ring-1" />
        <div className="fp-avatar-ring fp-avatar-ring-2" />
        <motion.img
          src={phyoImg}
          alt="Phyo Yadanar Kyaw"
          className="fp-avatar-core"
          style={{ translateZ: 40 }}
          draggable={false}
        />
      </motion.div>
      <div className="fp-avatar-label">Phyo Yadanar Kyaw</div>
      <div className="fp-avatar-sub">Full Stack Developer</div>
      <p className="fp-avatar-hint">Move your cursor over the portrait</p>
    </motion.div>
  );
}

/* ═══════════════════ ABOUT ═══════════════════ */
const FACETS = [
  {
    id: 'range',
    title: 'Full Stack Range',
    desc:  'Comfortable from Laravel APIs and MySQL schemas to React, Next.js, and Vue frontends.',
    Icon:  Boxes,
    color: '#75d8ff',
    detail: 'Laravel and MySQL on the server, React / Next.js / Vue on the client, and REST APIs joining the two — the same shape as the education platforms and mobile backends in my project list.',
    points: [
      'Laravel · PHP · MySQL · REST APIs',
      'React · Next.js · Vue · TypeScript',
      'One API layer for web and Android',
    ],
  },
  {
    id: 'craft',
    title: 'Creative Execution',
    desc:  'Interfaces that carry visual intention — typography, motion, and layout treated as craft.',
    Icon:  PenTool,
    color: '#ff7d66',
    detail: 'I care about how a build feels, not just whether it works. This portfolio is a navigable 3D room rather than a stack of sections — that choice is the argument.',
    points: [
      'Three.js / React Three Fiber',
      'Motion design with Framer Motion',
      'Flutter and Unity on the creative side',
    ],
  },
  {
    id: 'engineering',
    title: 'Solid Engineering',
    desc:  'Clean REST APIs, structured codebases, and responsive UIs built to hold up under real use.',
    Icon:  Radar,
    color: '#ffe17d',
    detail: 'Most of what I have shipped is in daily production use — admissions intake, subscription billing, clinic appointment booking. That work has to survive real traffic and real edge cases.',
    points: [
      'Live platforms in education and healthcare',
      'Subscription and payment flows',
      'Burmese-first, bilingual interfaces',
    ],
  },
] as const;

/* a tile that turns over to show its detail */
function FacetTile({ facet }: { facet: (typeof FACETS)[number] }) {
  const [flipped, setFlipped] = useState(false);
  const { Icon } = facet;

  return (
    <div
      className="fp-tile fp-flip b-4"
      style={{ '--pc': facet.color } as React.CSSProperties}
      onClick={() => setFlipped((f) => !f)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFlipped((f) => !f); }
      }}
      role="button"
      tabIndex={0}
      aria-label={`${facet.title} — turn over`}
    >
      <motion.div
        className="fp-flip-inner"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* front */}
        <div className="fp-flip-face">
          <div className="fp-card-icon"><Icon size={18} /></div>
          <h3>{facet.title}</h3>
          <p>{facet.desc}</p>
          <span className="fp-flip-cue"><RotateCcw size={12} /> Turn over</span>
        </div>

        {/* back */}
        <div className="fp-flip-face fp-flip-back">
          <p className="fp-chip-label">{facet.title}</p>
          <p className="fp-flip-detail">{facet.detail}</p>
          <ul>
            {facet.points.map((pt) => (
              <li key={pt}><span className="fp-dot" />{pt}</li>
            ))}
          </ul>
        </div>
      </motion.div>
    </div>
  );
}

function AboutPage() {
  const stats = [
    { label: 'Projects shipped',   value: projects.length },
    { label: 'Live web platforms', value: projects.filter((p) => p.category === 'web').length },
    { label: 'Mobile backends',    value: projects.filter((p) => p.category === 'mobile').length },
    { label: 'Built solo',         value: projects.filter((p) => p.role === 'Solo').length },
  ];

  /* doubled so the marquee can loop seamlessly */
  const marquee = [...allSkills, ...allSkills];

  return (
    <motion.div className="fp-body" variants={container} initial="hidden" animate="show">
      <motion.div className="fp-bento" variants={container}>
        {/* intro */}
        <motion.div className="fp-tile b-7 fp-tile-intro" variants={item}>
          <p className="fp-kicker">ABOUT / IDENTITY</p>
          <h1 className="fp-h1">
            I build full&nbsp;stack work that feels designed, not just developed.
          </h1>
          <p className="fp-para">
            I'm Phyo Yadanar Kyaw, a full stack developer who blends technical depth with a strong
            eye for creative execution — from Laravel APIs and MySQL-backed systems to polished
            React, Next.js, and Vue interfaces.
          </p>
          <p className="fp-para fp-para-muted">
            My work spans PHP, Laravel, REST APIs, TypeScript, React, Next.js, and Vue, with a
            focus on experiences that feel as considered as they are functional. This portfolio
            is one example of that thinking.
          </p>
        </motion.div>

        {/* portrait */}
        <TiltAvatar className="fp-tile b-5" />

        {/* counters, derived from the project list */}
        {stats.map(({ label, value }) => (
          <motion.div key={label} className="fp-tile b-3 fp-stat" variants={item}>
            <div className="fp-stat-num"><Counter to={value} /></div>
            <div className="fp-stat-label">{label}</div>
          </motion.div>
        ))}

        {/* turnable facets */}
        {FACETS.map((f) => <FacetTile key={f.id} facet={f} />)}

        {/* stack marquee */}
        <motion.div className="fp-tile b-12 fp-marquee" variants={item}>
          <p className="fp-chip-label">Things I work with</p>
          <div className="fp-marquee-window">
            <div className="fp-marquee-track">
              {marquee.map((s, i) => (
                <span key={`${s.name}-${i}`} style={{ '--pc': s.ring.color } as React.CSSProperties}>
                  <span className="fp-dot" />{s.name}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════ SKILLS ═══════════════════ */
const RING_ICONS: Record<Ring['id'], typeof Database> = {
  backend:  Database,
  frontend: PanelsTopLeft,
  creative: Palette,
};

function SkillsPage() {
  const [focus, setFocus]   = useState<Ring['id'] | null>(null);
  const [active, setActive] = useState<{ skill: Skill; ring: Ring }>({
    skill: rings[0].skills[0],
    ring:  rings[0],
  });

  const used = projectsUsing(active.skill);
  const RingIcon = RING_ICONS[active.ring.id];

  return (
    <motion.div className="fp-body" variants={container} initial="hidden" animate="show">
      <div className="fp-skills-header">
        <motion.p className="fp-kicker" variants={item}>SKILLS / ORBIT STACK</motion.p>
        <motion.h1 className="fp-h1" variants={item}>
          A full stack skill set built for real&nbsp;products.
        </motion.h1>
        <motion.p className="fp-para" variants={item}>
          Three orbits around one core: backend closest in, frontend around it, creative work on
          the outside. Hover or tap any node to inspect it — the orbits hold still while you read.
        </motion.p>
      </div>

      <div className="fp-orbit-layout">
        {/* left — the orbit */}
        <motion.div className="fp-orbit-stage" variants={item}>
          <SkillOrbit
            focus={focus}
            activeName={active.skill.name}
            onPick={(skill, ring) => setActive({ skill, ring })}
          />
        </motion.div>

        {/* right — legend + readout */}
        <div className="fp-orbit-side">
          <motion.div className="fp-legend" variants={container}>
            {rings.map((ring) => {
              const Icon = RING_ICONS[ring.id];
              const on = focus === ring.id;
              return (
                <motion.button
                  key={ring.id}
                  type="button"
                  variants={item}
                  onClick={() => setFocus(on ? null : ring.id)}
                  className={`fp-legend-btn${on ? ' is-active' : ''}`}
                  style={{ '--pc': ring.color } as React.CSSProperties}
                >
                  <Icon size={15} />
                  <span className="fp-legend-label">{ring.label}</span>
                  <span className="fp-legend-count">{ring.skills.length}</span>
                </motion.button>
              );
            })}
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={active.skill.name}
              className="fp-skill-readout"
              style={{ '--pc': active.ring.color } as React.CSSProperties}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{    opacity: 0, y: -8 }}
              transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="fp-readout-ring">
                <RingIcon size={13} /> {active.ring.label}
              </div>
              <h3>{active.skill.name}</h3>
              <p>{active.skill.blurb}</p>

              {used.length > 0 ? (
                <div className="fp-readout-used">
                  <p className="fp-chip-label">
                    Used in {used.length} listed {used.length === 1 ? 'project' : 'projects'}
                  </p>
                  <div className="fp-readout-chips">
                    {used.slice(0, 4).map((t) => <span key={t}>{t}</span>)}
                    {used.length > 4 && <span className="is-more">+{used.length - 4} more</span>}
                  </div>
                </div>
              ) : (
                <div className="fp-readout-used">
                  <p className="fp-chip-label">Where it shows up</p>
                  <div className="fp-readout-chips"><span>This portfolio</span></div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <motion.p className="fp-orbit-note" variants={item}>
            {focus ? 'Tap the highlighted orbit again to show all three.' : 'Tap an orbit to isolate it.'}
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════ PROJECTS ═══════════════════ */
const ROLE_FILTERS = [
  { id: 'all',  label: 'Everyone' },
  { id: 'Solo', label: 'Solo'     },
  { id: 'Team', label: 'With a team' },
] as const;

const CATEGORY_LABEL: Record<ProjectCategory, string> = {
  web:      'Web platform',
  mobile:   'Mobile backend',
  personal: 'Personal',
};

function ProjectsPage() {
  const [filter, setFilter]   = useState<ProjectCategory | 'all'>('all');
  const [role,   setRole]     = useState<(typeof ROLE_FILTERS)[number]['id']>('all');
  const [active,  setActive]  = useState(0);
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const shown = projects.filter(
    (p) => (filter === 'all' || p.category === filter) && (role === 'all' || p.role === role),
  );

  /* active can dangle past the end when a filter shrinks the list */
  const idx     = Math.min(active, Math.max(shown.length - 1, 0));
  const current = shown[idx];
  const open    = openIdx === null ? null : shown[openIdx];

  const step = (d: number) => setActive((i) => {
    const n = shown.length;
    return n === 0 ? 0 : (Math.min(i, n - 1) + d + n) % n;
  });

  /* arrows walk the index; enter opens, esc closes */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (openIdx !== null) {
        if (e.key === 'Escape')     setOpenIdx(null);
        if (e.key === 'ArrowRight') setOpenIdx((i) => ((i ?? 0) + 1) % shown.length);
        if (e.key === 'ArrowLeft')  setOpenIdx((i) => ((i ?? 0) - 1 + shown.length) % shown.length);
        return;
      }
      if (e.key === 'ArrowDown') { e.preventDefault(); step(1);  }
      if (e.key === 'ArrowUp')   { e.preventDefault(); step(-1); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openIdx, shown.length]);

  const pickFilter = (id: ProjectCategory | 'all') => { setOpenIdx(null); setActive(0); setFilter(id); };
  const pickRole   = (id: (typeof ROLE_FILTERS)[number]['id']) => { setOpenIdx(null); setActive(0); setRole(id); };

  return (
    <motion.div className="fp-body" variants={container} initial="hidden" animate="show">
      <div className="fp-projects-header">
        <motion.p className="fp-kicker" variants={item}>PROJECTS / PROTOTYPE WALL</motion.p>
        <motion.h1 className="fp-h1" variants={item}>
          Production platforms, mobile backends, and things I built for myself.
        </motion.h1>
        <motion.p className="fp-para" variants={item}>
          Run down the index — each line previews itself on the right. Open one for the full case.
        </motion.p>

        <motion.div className="fp-filter-row" variants={item}>
          {projectFilters.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => pickFilter(id)}
              className={`fp-filter-btn${filter === id ? ' is-active' : ''}`}
            >
              {label}
              <span className="fp-filter-count">
                {id === 'all' ? projects.length : projects.filter((p) => p.category === id).length}
              </span>
            </button>
          ))}
        </motion.div>

        <motion.div className="fp-filter-row fp-filter-row-sub" variants={item}>
          <span className="fp-filter-axis">Built</span>
          {ROLE_FILTERS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => pickRole(id)}
              className={`fp-role-pill${role === id ? ' is-active' : ''}`}
            >
              {id === 'Solo' && <User size={12} />}
              {id === 'Team' && <Users size={12} />}
              {label}
            </button>
          ))}
          <span className="fp-showing">
            Showing <strong>{shown.length}</strong> of {projects.length}
          </span>
        </motion.div>
      </div>

      <LayoutGroup>
        <div className="fp-index-layout">
          {/* ── left: the index ── */}
          <motion.ul className="fp-index-list" variants={item}>
            <AnimatePresence mode="popLayout">
              {shown.map((p, i) => (
                <motion.li
                  key={p.title}
                  layout
                  initial={{ opacity: 0, x: -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{    opacity: 0, x: 18 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <button
                    type="button"
                    className={`fp-index-row${i === idx ? ' is-active' : ''}`}
                    style={{ '--pc': p.color } as React.CSSProperties}
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    onClick={() => setOpenIdx(i)}
                  >
                    {i === idx && (
                      <motion.span
                        layoutId="fp-index-highlight"
                        className="fp-index-hl"
                        transition={{ type: 'spring', stiffness: 420, damping: 38 }}
                      />
                    )}
                    <span className="fp-index-num">{String(i + 1).padStart(2, '0')}</span>
                    <span className="fp-index-title">{p.title}</span>
                    <span className="fp-index-cat">{CATEGORY_LABEL[p.category]}</span>
                    <span className={`fp-index-role${p.role === 'Solo' ? ' is-solo' : ''}`}>
                      {p.role === 'Solo' ? <User size={11} /> : <Users size={11} />}
                    </span>
                    <ArrowUpRight size={14} className="fp-index-arrow" />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>

            {shown.length === 0 && (
              <li className="fp-index-empty">Nothing matches those filters.</li>
            )}
          </motion.ul>

          {/* ── right: live preview of the active row ── */}
          {current && (
            <motion.div
              className="fp-preview-stage"
              style={{ '--pc': current.color } as React.CSSProperties}
              variants={item}
            >
              <div className="fp-preview-glow" />

              <motion.article layoutId={`case-${current.title}`} className="fp-preview">
                <div className="fp-project-accent-line" />

                <AnimatePresence mode="wait">
                  <motion.div
                    key={current.title}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{    opacity: 0, y: -12 }}
                    transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                    className="fp-preview-body"
                  >
                    <div className="fp-preview-top">
                      <span className="fp-preview-num">{String(idx + 1).padStart(2, '0')}</span>
                      <span className={`fp-role-badge${current.role === 'Solo' ? ' is-solo' : ''}`}>
                        {current.role === 'Solo' ? <User size={11} /> : <Users size={11} />}
                        {current.role}
                      </span>
                      <span className="fp-project-meta">{current.meta}</span>
                    </div>

                    <h3>{current.title}</h3>
                    <p>{current.desc}</p>

                    <div className="fp-preview-split">
                      <div>
                        <p className="fp-chip-label">What I built</p>
                        <div className="fp-project-scope">
                          {current.scope.map((s) => <span key={s}>{s}</span>)}
                        </div>
                      </div>
                      <div>
                        <p className="fp-chip-label">Stack</p>
                        <div className="fp-project-tags">
                          {current.tags.map((t) => <span key={t}>{t}</span>)}
                        </div>
                      </div>
                    </div>

                    <div className="fp-project-links">
                      <button type="button" className="fp-link" onClick={() => setOpenIdx(idx)}>
                        Open case <ArrowUpRight size={13} />
                      </button>
                      {current.live && (
                        <a href={current.live} target="_blank" rel="noreferrer" className="fp-link fp-link-ghost">
                          Visit site <ArrowUpRight size={13} />
                        </a>
                      )}
                      {current.source && (
                        <a href={current.source} target="_blank" rel="noreferrer" className="fp-link fp-link-ghost">
                          <Github size={13} /> Source
                        </a>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </motion.article>

              <p className="fp-preview-hint">
                <kbd>↑</kbd> <kbd>↓</kbd> to move through the index
              </p>
            </motion.div>
          )}
        </div>

        {/* ── expanded case study ── */}
        <AnimatePresence>
          {open && (
            <motion.div
              className="fp-case-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{    opacity: 0 }}
              onClick={() => setOpenIdx(null)}
            >
              <motion.article
                layoutId={`case-${open.title}`}
                className="fp-case"
                style={{ '--pc': open.color } as React.CSSProperties}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="fp-project-accent-line" />

                <button type="button" className="fp-case-close" onClick={() => setOpenIdx(null)}>
                  <X size={16} />
                </button>

                <motion.div
                  className="fp-case-body"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.14, duration: 0.3 } }}
                  exit={{    opacity: 0 }}
                >
                  <div className="fp-project-top">
                    <span className={`fp-role-badge${open.role === 'Solo' ? ' is-solo' : ''}`}>
                      {open.role === 'Solo' ? <User size={11} /> : <Users size={11} />}
                      {open.role}
                    </span>
                    <span className="fp-project-meta">{open.meta}</span>
                  </div>

                  <h3>{open.title}</h3>
                  <p className="fp-case-desc">{open.desc}</p>

                  <div className="fp-case-grid">
                    <div>
                      <p className="fp-chip-label">What I built</p>
                      <div className="fp-project-scope">
                        {open.scope.map((s) => <span key={s}>{s}</span>)}
                      </div>
                    </div>
                    <div>
                      <p className="fp-chip-label">Stack</p>
                      <div className="fp-project-tags">
                        {open.tags.map((t) => <span key={t}>{t}</span>)}
                      </div>
                    </div>
                  </div>

                  <div className="fp-project-links">
                    {open.live && (
                      <a href={open.live} target="_blank" rel="noreferrer" className="fp-link">
                        Visit site <ArrowUpRight size={13} />
                      </a>
                    )}
                    {open.source && (
                      <a href={open.source} target="_blank" rel="noreferrer" className="fp-link fp-link-ghost">
                        <Github size={13} /> Source
                      </a>
                    )}
                  </div>

                  <div className="fp-case-foot">
                    <button
                      type="button"
                      className="fp-case-nav"
                      onClick={() => setOpenIdx((i) => ((i ?? 0) - 1 + shown.length) % shown.length)}
                    >
                      <ChevronLeft size={15} /> Prev
                    </button>
                    <span className="fp-case-count">
                      {openIdx! + 1} / {shown.length} · <kbd>←</kbd> <kbd>→</kbd> to move · <kbd>Esc</kbd> to close
                    </span>
                    <button
                      type="button"
                      className="fp-case-nav"
                      onClick={() => setOpenIdx((i) => ((i ?? 0) + 1) % shown.length)}
                    >
                      Next <ChevronRight size={15} />
                    </button>
                  </div>
                </motion.div>
              </motion.article>
            </motion.div>
          )}
        </AnimatePresence>
      </LayoutGroup>
    </motion.div>
  );
}

/* ═══════════════════ CONTACT ═══════════════════ */
/* TODO: this is the address every enquiry lands in — swap in the real one */
const CONTACT_EMAIL = 'violet@gmail.com';

const WORK_TYPES = [
  'Full stack web app',
  'Laravel + React build',
  'REST API / integration',
  'Corporate or landing site',
  'Mobile app backend',
  'Something else',
];

const TIMELINES = ['Ready to start', 'Within 1–3 months', 'Just exploring'];

const STEPS = ['Intent', 'Who', 'Brief'] as const;

/* live clock in Yangon, so visitors abroad know when I am at a desk */
function YangonClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const time = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Yangon',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(now);

  const hour = Number(
    new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Yangon', hour: '2-digit', hour12: false })
      .format(now),
  );
  const awake = hour >= 9 && hour < 22;

  return (
    <div className="fp-contact-chip">
      <div className="fp-card-icon"><Clock size={16} /></div>
      <div>
        <p className="fp-chip-label">Local time · Yangon</p>
        <p className="fp-clock">{time}</p>
        <p className={`fp-clock-state${awake ? ' is-awake' : ''}`}>
          <span className="fp-clock-dot" />
          {awake ? 'Working hours' : 'Outside working hours'}
        </p>
      </div>
    </div>
  );
}

function ContactPage() {
  const [step, setStep]     = useState(0);
  const [dir, setDir]       = useState(1);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [copied, setCopied] = useState(false);
  const [form, setForm]     = useState({
    types: [] as string[],
    timeline: '',
    name: '',
    email: '',
    message: '',
  });

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const toggleType = (t: string) =>
    setForm((f) => ({
      ...f,
      types: f.types.includes(t) ? f.types.filter((x) => x !== t) : [...f.types, t],
    }));

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const valid = [
    form.types.length > 0 && !!form.timeline,
    form.name.trim().length > 1 && emailOk,
    form.message.trim().length > 9,
  ];

  const go = (to: number) => { setDir(to > step ? 1 : -1); setStep(to); };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch { /* clipboard blocked — the address is on screen anyway */ }
  };

  /* no backend is wired yet, so the brief is handed to the mail client.
     swap the body of this function to post to Supabase when that exists. */
  const send = () => {
    setStatus('sending');
    const subject = `Project enquiry — ${form.types.join(', ') || 'General'}`;
    const body = [
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      `Looking for: ${form.types.join(', ')}`,
      `Timeline: ${form.timeline}`,
      '',
      form.message,
    ].join('\n');
    setTimeout(() => {
      /* flip the panel first — handing off to a mail client can navigate away */
      setStatus('sent');
      window.location.href =
        `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }, 800);
  };

  const reset = () => {
    setForm({ types: [], timeline: '', name: '', email: '', message: '' });
    setStep(0);
    setDir(-1);
    setStatus('idle');
  };

  const slide = {
    enter:  (d: number) => ({ opacity: 0, x: d * 40 }),
    center: { opacity: 1, x: 0 },
    exit:   (d: number) => ({ opacity: 0, x: d * -40 }),
  };

  return (
    <motion.div className="fp-body" variants={container} initial="hidden" animate="show">
      <div className="fp-two-col">
        {/* left */}
        <div className="fp-left">
          <motion.p className="fp-kicker" variants={item}>CONTACT / SIGNAL PORTAL</motion.p>
          <motion.h1 className="fp-h1" variants={item}>
            Have a project in mind? Let's build it together.
          </motion.h1>
          <motion.p className="fp-para" variants={item}>
            I'm open to full stack web projects, Laravel + React builds, REST API integrations,
            and creative frontend work. Three short steps — tell me what you need and it lands
            in my inbox.
          </motion.p>

          <motion.div className="fp-contact-chips" variants={container}>
            <motion.div className="fp-contact-chip" variants={item}>
              <div className="fp-card-icon"><Mail size={16} /></div>
              <div>
                <p className="fp-chip-label">Email</p>
                <p>{CONTACT_EMAIL}</p>
              </div>
              <button type="button" className="fp-copy-btn" onClick={copyEmail}>
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </motion.div>

            <motion.div variants={item}><YangonClock /></motion.div>

            <motion.div className="fp-contact-chip" variants={item}>
              <div className="fp-card-icon"><Sparkles size={16} /></div>
              <div>
                <p className="fp-chip-label">Focus</p>
                <p>Full stack web, REST APIs, creative frontends</p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* right — stepped portal */}
        <motion.div className="fp-portal" variants={item}>
          <AnimatePresence mode="wait">
            {status === 'sent' ? (
              <motion.div
                key="sent"
                className="fp-portal-done"
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{    opacity: 0 }}
              >
                <motion.div
                  className="fp-done-mark"
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 14 }}
                >
                  <Check size={30} />
                </motion.div>
                <h3>Signal sent</h3>
                <p>
                  Your brief was handed to your mail client, addressed to {CONTACT_EMAIL}.
                  If nothing opened, copy the address above and send it across directly.
                </p>
                <button type="button" className="fp-link" onClick={reset}>
                  <RotateCcw size={13} /> Start another
                </button>
              </motion.div>
            ) : (
              <motion.div key="form" className="fp-portal-form" exit={{ opacity: 0 }}>
                {/* progress */}
                <div className="fp-steps">
                  {STEPS.map((label, i) => (
                    <button
                      key={label}
                      type="button"
                      className={`fp-step${i === step ? ' is-active' : ''}${i < step ? ' is-done' : ''}`}
                      onClick={() => i < step && go(i)}
                      disabled={i > step}
                    >
                      <span className="fp-step-num">{i < step ? <Check size={11} /> : i + 1}</span>
                      {label}
                    </button>
                  ))}
                  <div className="fp-step-track">
                    <motion.div
                      className="fp-step-fill"
                      animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                </div>

                <AnimatePresence mode="wait" custom={dir}>
                  <motion.div
                    key={step}
                    custom={dir}
                    variants={slide}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    className="fp-step-panel"
                  >
                    {step === 0 && (
                      <>
                        <p className="fp-chip-label">What do you need building?</p>
                        <div className="fp-choice-grid">
                          {WORK_TYPES.map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => toggleType(t)}
                              className={`fp-choice${form.types.includes(t) ? ' is-on' : ''}`}
                            >
                              {form.types.includes(t) && <Check size={12} />}
                              {t}
                            </button>
                          ))}
                        </div>

                        <p className="fp-chip-label fp-chip-label-gap">Timeline</p>
                        <div className="fp-choice-grid">
                          {TIMELINES.map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => set('timeline', t)}
                              className={`fp-choice${form.timeline === t ? ' is-on' : ''}`}
                            >
                              {form.timeline === t && <Check size={12} />}
                              {t}
                            </button>
                          ))}
                        </div>
                      </>
                    )}

                    {step === 1 && (
                      <>
                        <div className="fp-field">
                          <label htmlFor="name">Name</label>
                          <input
                            id="name" name="name" type="text" autoComplete="name"
                            value={form.name} placeholder="Your name"
                            onChange={(e) => set('name', e.target.value)}
                          />
                        </div>
                        <div className="fp-field">
                          <label htmlFor="email">Email</label>
                          <input
                            id="email" name="email" type="email" autoComplete="email"
                            value={form.email} placeholder="your.email@example.com"
                            onChange={(e) => set('email', e.target.value)}
                          />
                          {form.email.length > 3 && !emailOk && (
                            <span className="fp-field-warn">That address looks incomplete.</span>
                          )}
                        </div>
                      </>
                    )}

                    {step === 2 && (
                      <>
                        <div className="fp-recap">
                          {form.types.map((t) => <span key={t}>{t}</span>)}
                          <span className="is-accent">{form.timeline}</span>
                        </div>
                        <div className="fp-field">
                          <label htmlFor="message">Project brief</label>
                          <textarea
                            id="message" name="message"
                            value={form.message}
                            placeholder="Tell me what you want to build."
                            onChange={(e) => set('message', e.target.value)}
                          />
                          <span className="fp-field-hint">
                            {form.message.trim().length < 10
                              ? 'A sentence or two is plenty to start.'
                              : `${form.message.trim().length} characters`}
                          </span>
                        </div>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* controls */}
                <div className="fp-portal-foot">
                  <button
                    type="button"
                    className="fp-link fp-link-ghost"
                    onClick={() => go(step - 1)}
                    disabled={step === 0}
                  >
                    <ArrowLeft size={13} /> Back
                  </button>

                  {step < STEPS.length - 1 ? (
                    <button
                      type="button"
                      className="fp-submit"
                      onClick={() => go(step + 1)}
                      disabled={!valid[step]}
                    >
                      Continue <ArrowRight size={15} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="fp-submit"
                      onClick={send}
                      disabled={!valid[2] || status === 'sending'}
                    >
                      {status === 'sending' ? 'Sending…' : 'Send message'}
                      <Send size={15} />
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════ WRAPPER ═══════════════════ */
type Props = { section: SectionId; onClose: () => void };

export default function ContentPanel({ section, onClose }: Props) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={section}
        className="fp-overlay"
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{    opacity: 0, y: 60 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] as const }}
      >
        {/* ambient glow orbs */}
        <div className="fp-glow fp-glow-1" />
        <div className="fp-glow fp-glow-2" />

        <div className="fp-page">
          {/* top bar */}
          <div className="fp-topbar">
            <button className="fp-back-btn" onClick={onClose} type="button">
              <ArrowLeft size={16} />
              Back to Room
            </button>
            <span className="fp-page-tag">{PAGE_LABELS[section]}</span>
          </div>

          {/* section content */}
          {section === 'about'    && <AboutPage    />}
          {section === 'skills'   && <SkillsPage   />}
          {section === 'projects' && <ProjectsPage />}
          {section === 'contact'  && <ContactPage  />}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
