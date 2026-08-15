export type ProjectCategory = 'web' | 'mobile' | 'personal';

export type Project = {
  title: string;
  meta: string;
  desc: string;
  scope: string[];
  role: 'Solo' | 'Team';
  tags: string[];
  category: ProjectCategory;
  color: string;
  live?: string;
  source?: string;
};

const PURPLE = '#b98bff';
const CORAL  = '#ff7d66';
const CYAN   = '#75d8ff';
const AMBER  = '#ffe17d';
const MINT   = '#7dffb0';

export const projects: Project[] = [
  /* ── web platforms ── */
  {
    title: 'Strategy First International College',
    meta: 'strategyfirst.edu.mm',
    desc: 'Public site for a private international college in Myanmar — programme catalogues across undergraduate, postgraduate and professional tracks, campus directories, and a news and events stream.',
    scope: ['Website'],
    role: 'Team',
    tags: ['Laravel', 'PHP', 'Responsive UI'],
    category: 'web',
    color: CORAL,
    live: 'https://strategyfirst.edu.mm/',
  },
  {
    title: 'Strategy First Global',
    meta: 'strategyfirstglobal.com',
    desc: "Group-level corporate site for Strategy First's international arm, built as a single-page app served by a shared content backend.",
    scope: ['Website', 'Backend'],
    role: 'Team',
    tags: ['SPA', 'Laravel', 'REST API', 'MySQL'],
    category: 'web',
    color: CYAN,
    live: 'https://strategyfirstglobal.com/#/',
  },
  {
    title: 'Waso Learn',
    meta: 'wasolearn.com',
    desc: 'K–12 e-learning platform delivering recorded lessons from KG through Grade 12, with premium subscriptions, teacher profiles and payment handling behind the front end.',
    scope: ['Website', 'Backend'],
    role: 'Team',
    tags: ['Laravel', 'MySQL', 'Subscriptions', 'Payments'],
    category: 'web',
    color: AMBER,
    live: 'https://wasolearn.com/',
  },
  {
    title: 'SFUx',
    meta: 'sfux.strategyfirst.edu.mm',
    desc: 'Online business and management course platform for Strategy First Education Group — course catalogue, enrolment flow and short-course workshop delivery.',
    scope: ['Website', 'Backend'],
    role: 'Team',
    tags: ['Laravel', 'REST API', 'MySQL'],
    category: 'web',
    color: PURPLE,
    live: 'https://sfux.strategyfirst.edu.mm/',
  },
  {
    title: 'Strategy First Undergraduate Website',
    meta: 'ug.strategyfirst.edu.mm',
    desc: 'Undergraduate programme portal I built end to end on my own — interface, backend, and the API layer that feeds programme and application content.',
    scope: ['Website', 'Backend'],
    role: 'Solo',
    tags: ['Laravel', 'MySQL', 'REST API'],
    category: 'web',
    color: MINT,
    live: 'https://ug.strategyfirst.edu.mm/',
  },
  {
    title: 'Lin Yaung Chi Clinic',
    meta: 'linyaungchi.com.mm',
    desc: 'Clinic and diagnostic centre platform in Yangon — a directory of 30+ medical specialties, daily consultation timetables, patient accounts and appointment booking, in a Burmese-first interface.',
    scope: ['Website', 'Backend'],
    role: 'Team',
    tags: ['Laravel', 'MySQL', 'Booking', 'Burmese UI'],
    category: 'web',
    color: CORAL,
    live: 'https://linyaungchi.com.mm/',
  },
  {
    title: 'SSBU eLearn',
    meta: 'ssbu.strategyfirst.edu.mm',
    desc: 'eLearning platform for Shan State Buddhist University covering mindfulness, ethics and Buddhist philosophy courses, sharing one backend with its mobile apps.',
    scope: ['Website', 'Backend'],
    role: 'Team',
    tags: ['Laravel', 'REST API', 'Course Platform'],
    category: 'web',
    color: CYAN,
    live: 'https://ssbu.strategyfirst.edu.mm/',
  },
  {
    title: 'Strategy First Admissions',
    meta: 'admissions.strategyfirst.edu.mm',
    desc: "Admissions portal handling programme applications and applicant intake across Strategy First's college programmes.",
    scope: ['Website', 'Backend'],
    role: 'Team',
    tags: ['Laravel', 'MySQL', 'Forms', 'Workflow'],
    category: 'web',
    color: AMBER,
    live: 'https://admissions.strategyfirst.edu.mm/',
  },
  {
    title: 'Strategy First Research Portal',
    meta: 'research.strategyfirst.edu.mm',
    desc: 'Searchable repository of student research papers and journal archives, browsable by programme with featured and recently published sections.',
    scope: ['Website', 'Backend'],
    role: 'Team',
    tags: ['Laravel', 'MySQL', 'Search', 'Publishing'],
    category: 'web',
    color: PURPLE,
    live: 'https://research.strategyfirst.edu.mm/',
  },

  /* ── mobile app backends ── */
  {
    title: 'Waso Learn App',
    meta: 'Google Play · backend',
    desc: 'REST APIs and content backend powering the Waso Learn Android app — authentication, subscription state, and lesson delivery shared with the web platform.',
    scope: ['Backend'],
    role: 'Team',
    tags: ['Laravel', 'REST API', 'MySQL'],
    category: 'mobile',
    color: AMBER,
    live: 'https://play.google.com/store/search?q=waso%20learn&c=apps&hl=en',
  },
  {
    title: 'Strategy First Learn App',
    meta: 'Google Play · backend',
    desc: "API layer serving course content, accounts and progress to the college's learning app on Android.",
    scope: ['Backend'],
    role: 'Team',
    tags: ['Laravel', 'REST API', 'MySQL'],
    category: 'mobile',
    color: CORAL,
    live: 'https://play.google.com/store/search?q=strategy%20first%20learn&c=apps&hl=en',
  },
  {
    title: 'SFUx App',
    meta: 'Google Play · backend',
    desc: 'Backend services behind the SFUx mobile app, exposing the same course catalogue and enrolment endpoints as the web platform.',
    scope: ['Backend'],
    role: 'Team',
    tags: ['Laravel', 'REST API', 'MySQL'],
    category: 'mobile',
    color: PURPLE,
    live: 'https://play.google.com/store/search?q=sfux&c=apps&hl=en',
  },
  {
    title: 'Liberty Global School App',
    meta: 'Google Play · backend',
    desc: 'Backend and API work for the Liberty Global School app under the Strategy First education group.',
    scope: ['Backend'],
    role: 'Team',
    tags: ['Laravel', 'REST API', 'MySQL'],
    category: 'mobile',
    color: CYAN,
    live: 'https://play.google.com/store/apps/details?id=com.sfu.libertyglobalschool&hl=en',
  },

  /* ── personal ── */
  {
    title: 'Violence Recognition',
    meta: 'research project',
    desc: 'Deep-learning system that detects aggressive behaviour and fighting in still images. Benchmarks YOLOv5L/X, YOLOv8M/L and YOLOv11L, then ensembles v5L + v5X with test-time augmentation to reach 0.904 mAP over 3,300+ annotated images.',
    scope: ['Research', 'Model training'],
    role: 'Solo',
    tags: ['Python', 'YOLO', 'Computer Vision', 'Jupyter'],
    category: 'personal',
    color: MINT,
    source: 'https://github.com/Phyo98/Violence_Recognition',
  },
  {
    title: 'Vanilla Weather App',
    meta: 'no-framework build',
    desc: 'A weather client written in plain JavaScript with no framework — city search against the OpenWeatherMap API, current conditions with humidity and wind, a six-day forecast, and a °C / °F toggle.',
    scope: ['Frontend'],
    role: 'Solo',
    tags: ['JavaScript', 'Axios', 'Bootstrap', 'OpenWeatherMap API'],
    category: 'personal',
    color: CYAN,
    source: 'https://github.com/Phyo98/weather_app',
  },
];

export const projectFilters: { id: ProjectCategory | 'all'; label: string }[] = [
  { id: 'all',      label: 'All work'      },
  { id: 'web',      label: 'Web platforms' },
  { id: 'mobile',   label: 'Mobile'        },
  { id: 'personal', label: 'Personal'      },
];
