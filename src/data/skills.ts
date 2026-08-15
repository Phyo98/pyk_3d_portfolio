import { projects } from './projects';

export type Skill = {
  name: string;
  blurb: string;
  /** tags in projects.ts that count as "this skill was used here" */
  match?: string[];
};

export type Ring = {
  id: 'backend' | 'frontend' | 'creative';
  label: string;
  color: string;
  /** orbit radius in svg units */
  r: number;
  /** seconds per full revolution */
  duration: number;
  reverse?: boolean;
  skills: Skill[];
};

export const rings: Ring[] = [
  {
    id: 'backend',
    label: 'Backend',
    color: '#75d8ff',
    r: 78,
    duration: 64,
    skills: [
      { name: 'Laravel',  blurb: 'My main backend framework — routing, Eloquent models, auth and the API layers behind the education platforms.', match: ['Laravel'] },
      { name: 'PHP',      blurb: 'The language under nearly every production system I have shipped.', match: ['PHP'] },
      { name: 'MySQL',    blurb: 'Relational schemas behind course catalogues, admissions intake and clinic appointment booking.', match: ['MySQL'] },
      { name: 'REST API', blurb: 'The contract between my backends and their clients — the same endpoints serve the web apps and the Android builds.', match: ['REST API'] },
      { name: 'Python',   blurb: 'Data and computer-vision work, including the YOLO ensemble in the violence recognition project.', match: ['Python'] },
    ],
  },
  {
    id: 'frontend',
    label: 'Frontend',
    color: '#b98bff',
    r: 143,
    duration: 92,
    reverse: true,
    skills: [
      { name: 'React',      blurb: 'My default for interactive frontends — including the 3D room you are standing in.' },
      { name: 'Next.js',    blurb: 'React with routing and rendering handled, for content-heavy sites that still need to move fast.' },
      { name: 'Vue',        blurb: 'Component-driven frontends where a lighter runtime is the better fit.', match: ['SPA'] },
      { name: 'TypeScript', blurb: 'Types across the whole frontend — this portfolio compiles under strict mode.' },
      { name: 'Tailwind',   blurb: 'Utility-first styling, paired here with a set of hand-written CSS variables.' },
      { name: 'Bootstrap',  blurb: 'Dependable layout for smaller builds, like the no-framework weather client.', match: ['Bootstrap'] },
      { name: 'HTML / CSS', blurb: 'The base layer — semantic markup and hand-written CSS for anything a framework would get in the way of.', match: ['Responsive UI', 'Burmese UI'] },
    ],
  },
  {
    id: 'creative',
    label: 'Creative & Other',
    color: '#ffe17d',
    r: 197,
    duration: 120,
    skills: [
      { name: 'Flutter', blurb: 'Cross-platform mobile interfaces on the Dart side.' },
      { name: 'Unity',   blurb: 'Real-time 3D and interactive scenes — the same instincts that shaped this room.' },
      { name: 'Git',     blurb: 'Branching, review and version control across every project listed here.' },
    ],
  },
];

/** every skill, flattened, with its ring attached */
export const allSkills = rings.flatMap((ring) =>
  ring.skills.map((skill) => ({ ...skill, ring })),
);

/** project titles where this skill shows up in the tag list */
export function projectsUsing(skill: Skill): string[] {
  if (!skill.match?.length) return [];
  return projects
    .filter((p) => p.tags.some((t) => skill.match!.includes(t)))
    .map((p) => p.title);
}
