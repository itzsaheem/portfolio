export interface WaterfallRoute {
  path: string;
  indent: number;
  method: 'GET' | 'POST' | 'RPC' | 'SQL' | 'CRON' | 'WS';
  startPct: number;
  widthPct: number;
  latencyMs: number;
  status: number;
  authLayer: string;
  engine: string;
  operation: string;
  payload: string;
  description: string;
  sqlOrLogic: string;
}

export interface ProjectArchitectureLayer {
  layer: string;
  tech: string;
  details: string;
}

export interface FlagshipProject {
  id: string;
  numeral: string;
  kicker: string;
  titleWhite: string;
  titleMuted: string;
  summary: string;
  subCaption: string;
  role: string;
  period: string;
  badge: string;
  techStack: string[];
  metrics: { label: string; value: string }[];
  problem: string;
  architecture: string;
  architectureLayers: ProjectArchitectureLayer[];
  keyFeatures: { title: string; detail: string }[];
  schemaOrCodeTitle: string;
  schemaOrCodeSnippet: string;
  impact: string[];
  /** Live hosted URL — rendered for projects with a live deployment link */
  liveUrl?: string;
  liveLabel?: string;
  waterfallRoutes: WaterfallRoute[];
}

export interface CapabilityCategory {
  index: string;
  id: string;
  title: string;
  summary: string;
  primarySkills: string[];
  engineeringPractices: string[];
  appliedIn: string;
}

export interface ManifestItem {
  code: string;
  title: string;
  roleAndPeriod: string;
  category: 'CLIENT PRODUCTION' | 'INTERNSHIP' | 'CO-FOUNDER SAAS' | 'NATIONAL FINALS' | 'WEB ENGINEERING';
  description: string;
  highlights: string[];
  stack: string[];
  projectIdToInspect?: string;
}

export interface FieldNote {
  id: string;
  title: string;
  date: string;
  readTime: string;
  topic: string;
  summary: string;
  sections: {
    heading: string;
    body: string;
    codeSnippet?: string;
  }[];
}

export const PROFILE_DATA = {
  name: 'S Mohammed Saheem',
  tagline: 'full-stack engineer who ships',
  location: 'Bengaluru, Karnataka, India',
  email: 'saheemtab@gmail.com',
  github: 'https://github.com/itzsaheem',
  githubHandle: 'github.com/itzsaheem',
  linkedin: 'https://linkedin.com/in/s-mohammed-saheem',
  linkedinHandle: 'linkedin.com/in/s-mohammed-saheem',
  degree: 'B.Tech in Computer Science — Presidency University, Bengaluru (2023 – 2027)',
};

export const CAPABILITY_INDEX: CapabilityCategory[] = [
  {
    index: '01',
    id: 'fullstack-web',
    title: 'full-stack web & frontend engineering',
    summary:
      'React.js, TypeScript, JavaScript, Tailwind CSS, HTML/CSS — responsive UI/UX, multi-portal architectures, and real-time client state',
    primarySkills: [
      'React.js',
      'TypeScript',
      'JavaScript',
      'Tailwind CSS',
      'HTML5 & CSS3',
      'Vite',
      'Figma UI/UX',
    ],
    engineeringPractices: [
      'End-to-end UI/UX design in Figma translated into responsive, modular React + TypeScript interfaces',
      'Multi-portal web architectures separating Student/Faculty, Admin, and Super Admin consoles',
      'Real-time WebSocket client synchronization and clean component state management',
    ],
    appliedIn: 'Solvyn Portals, CMS (Clinic Management System), Bot or Not, Product Landing Pages',
  },
  {
    index: '02',
    id: 'backend-apis',
    title: 'backend architecture, oop & apis',
    summary:
      'Java, Python, Node.js (Express & Fastify), REST APIs, WebSockets — Object-Oriented Programming (OOP) and scalable server logic',
    primarySkills: [
      'Java',
      'Python',
      'Node.js',
      'Express & Fastify',
      'REST APIs',
      'WebSockets',
      'Object-Oriented Programming (OOP)',
    ],
    engineeringPractices: [
      'OOP-driven backend service layers modeling domain entities, access rules, and workflows cleanly',
      'RESTful APIs and real-time WebSocket handlers with Zod schema validation and structured logging',
      'Authentication and session management using Better Auth, Supabase Auth, and role-based access control',
    ],
    appliedIn: 'FarmAura (KrishiMitra), Solvyn Platform, Bot or Not Backend, CMS',
  },
  {
    index: '03',
    id: 'databases-sql',
    title: 'relational databases & security',
    summary:
      'MySQL, PostgreSQL (Supabase), Drizzle ORM, Redis, SQL — schema design, joins, indexing, Row-Level Security (RLS), and CRUD operations',
    primarySkills: [
      'MySQL',
      'PostgreSQL (Supabase)',
      'SQL',
      'Drizzle ORM',
      'Redis',
      'Row-Level Security (RLS)',
      'Schema Design & Indexing',
    ],
    engineeringPractices: [
      'Relational schema design and PostgreSQL Row-Level Security (RLS) policies for strict multi-branch data isolation',
      'Normalized SQL data models for crop, farmer, sensor, clinical, and institutional records',
      'Indexed joins, CRUD operations, and type-safe Drizzle ORM migrations for reliable queries at scale',
    ],
    appliedIn: 'CMS (Clinic Management System), FarmAura SQL Models, Bot or Not (PostgreSQL + Drizzle)',
  },
  {
    index: '04',
    id: 'devops-cs-core',
    title: 'ci/cd workflows & core cs fundamentals',
    summary:
      'Git & GitHub, GitHub Actions (CI/CD), Data Structures & Algorithms, Object-Oriented Programming, DBMS, and Operating Systems',
    primarySkills: [
      'Git & GitHub',
      'GitHub Actions (CI/CD)',
      'Data Structures & Algorithms',
      'Object-Oriented Programming',
      'DBMS',
      'Operating Systems',
      'Agile / Iterative Development',
    ],
    engineeringPractices: [
      'Automated GitHub Actions CI/CD pipelines for scheduled database backups and uptime keep-alive checks',
      'Strong foundation in DSA (arrays, linked lists, trees, graphs, hashing, sorting/searching), DBMS, and OS (processes, threads, memory management)',
      'Structured pre-delivery testing plans and collaborative Git-based version control workflows',
    ],
    appliedIn: 'CMS CI/CD Pipeline, Exposys Data Labs Internship, Smart India Hackathon 2025 Finals',
  },
];

export const FLAGSHIP_PROJECTS: FlagshipProject[] = [
  {
    id: 'solvyn',
    numeral: '01',
    kicker: '01 · CO-FOUNDER & DEVELOPER · ERP & EDTECH PLATFORM',
    titleWhite: 'Solvyn',
    titleMuted: 'ERP & EdTech',
    summary:
      'Co-founded and engineered a dual-pillar platform combining institutional ERP with recorded lectures, live coaching, and AI tutoring, applying Object-Oriented Programming (OOP) principles across the application layer.',
    subCaption:
      'CO-FOUNDER & DEVELOPER (2024 – PRESENT) · REACT, TYPESCRIPT, SUPABASE, TAILWIND CSS & OOP',
    role: 'Co-Founder & Developer',
    period: '2024 – Present',
    badge: 'CO-FOUNDER · ERP & EDTECH',
    techStack: [
      'TypeScript',
      'React.js',
      'Supabase (PostgreSQL)',
      'Tailwind CSS',
      'Radix UI',
      'Recharts',
      'Object-Oriented Programming (OOP)',
      'Git & GitHub Workflows',
      'Figma UI/UX',
    ],
    metrics: [
      { label: 'Architecture', value: 'Dual-Pillar ERP + EdTech' },
      { label: 'Portals Built', value: 'Student/Faculty, Admin & SuperAdmin' },
      { label: 'Core Modules', value: 'ERP, Recorded Lectures, Live Coaching & AI Tutor' },
    ],
    problem:
      'Educational institutions struggle with disconnected tools for campus ERP operations and student learning delivery, creating friction between administrative workflows (portals for students, faculty, parents, admins, and super-admins) and academic engagement (recorded lectures, live coaching, and AI tutoring).',
    architecture:
      'Co-founded and engineered a multi-portal architecture (Student/Faculty/Parent Portal, Admin Portal, and Super Admin console) backed by Supabase/PostgreSQL and modular Object-Oriented Programming (OOP) principles across the application layer. Designed the student app UI/UX in Figma and developed the platform end-to-end with a team using structured Git-based workflows.',
    architectureLayers: [
      {
        layer: 'Student, Faculty & Parent Portal',
        tech: 'React.js, TypeScript, Vite, Tailwind CSS, Radix UI',
        details:
          'Designed the complete student app UI/UX and built interactive modules for recorded lectures, live coaching sessions, academic progress charts (Recharts), and AI tutoring.',
      },
      {
        layer: 'Admin & Super Admin ERP Consoles',
        tech: 'Multi-Config Vite Builds, Role-Based Access, Recharts',
        details:
          'Dedicated institutional Admin and Super Admin portals managing organization onboarding, faculty/student directories, attendance, and platform analytics.',
      },
      {
        layer: 'OOP Application Layer',
        tech: 'TypeScript, Object-Oriented Programming (OOP)',
        details:
          'Applied OOP principles across domain services and application state to keep institutional ERP logic and learning modules modular and maintainable.',
      },
      {
        layer: 'Database & Collaborative Workflow',
        tech: 'Supabase (PostgreSQL), Git & GitHub',
        details:
          'Relational persistence with Supabase and collaborative end-to-end team development using structured Git branching and pull request reviews.',
      },
    ],
    keyFeatures: [
      {
        title: 'Dual-Pillar Institutional ERP & EdTech Suite',
        detail:
          'Unifies institutional management (students, faculty, parents, admins) with learning delivery in a single cohesive ecosystem.',
      },
      {
        title: 'Recorded Lectures & Live Coaching Modules',
        detail:
          'Structured course playback, live coaching schedules, and interactive learning dashboards designed from scratch.',
      },
      {
        title: 'Integrated AI Tutoring Experience',
        detail:
          'Assists students with contextual academic support alongside their lectures and coursework.',
      },
      {
        title: 'Multi-Portal Role Architecture',
        detail:
          'Separate, tailored build targets and interfaces for the Student/Faculty/Parent Portal, Admin Portal, and Super Admin Portal.',
      },
    ],
    schemaOrCodeTitle: 'MULTI-PORTAL OOP SERVICE & SUPABASE INTEGRATION',
    schemaOrCodeSnippet: `// OOP Domain Service managing institutional ERP & EdTech portal modules
export class SolvynPortalService {
  constructor(private readonly supabase: SupabaseClient) {}

  async getStudentDashboard(studentId: string) {
    const [profileRes, lecturesRes, coachingRes] = await Promise.all([
      this.supabase.from('student_profiles').select('*').eq('id', studentId).single(),
      this.supabase.from('recorded_lectures').select('*').order('module_order', { ascending: true }),
      this.supabase.from('live_coaching_sessions').select('*').eq('status', 'UPCOMING'),
    ]);

    return {
      profile: profileRes.data,
      lectures: lecturesRes.data ?? [],
      upcomingCoaching: coachingRes.data ?? [],
    };
  }
}`,
    impact: [
      'Co-founded and engineered a dual-pillar platform combining institutional ERP with recorded lectures, live coaching, and AI tutoring, applying OOP principles across the application layer.',
      'Designed the student app UI/UX and system architecture, developed end-to-end with a team using Git-based workflows.',
      'Built dedicated Student/Faculty/Parent, Admin, and Super Admin portals with React, TypeScript, Tailwind CSS, Radix UI, and Supabase.',
    ],
    waterfallRoutes: [
      {
        path: '/portal/student-faculty-dashboard',
        indent: 0,
        method: 'GET',
        startPct: 0,
        widthPct: 30,
        latencyMs: 34,
        status: 200,
        authLayer: 'Supabase JWT + Role Guard',
        engine: 'React 19 + Supabase PG',
        operation: 'Multi-Portal Workspace Hydration',
        payload: '3.8 KB JSON',
        description: 'Student, Faculty & Parent Portal Hydration (React + TypeScript)',
        sqlOrLogic: 'Loads role-specific ERP & EdTech workspace with Radix UI and Recharts.',
      },
      {
        path: '/erp/admin/institutions',
        indent: 1,
        method: 'GET',
        startPct: 8,
        widthPct: 42,
        latencyMs: 52,
        status: 200,
        authLayer: 'RBAC (Admin / SuperAdmin)',
        engine: 'PostgreSQL + OOP Service',
        operation: 'Institutional Hierarchy Query',
        payload: '6.4 KB JSON',
        description: 'Institutional Admin & SuperAdmin ERP State Sync',
        sqlOrLogic: 'Queries institutional hierarchy, user roles, and active academic batches via Supabase.',
      },
      {
        path: '/edtech/recorded-lectures',
        indent: 2,
        method: 'SQL',
        startPct: 16,
        widthPct: 48,
        latencyMs: 64,
        status: 200,
        authLayer: 'Cohort Enrollment Policy',
        engine: 'Supabase PostgreSQL',
        operation: 'Indexed Curriculum SELECT',
        payload: '5.1 KB Rows',
        description: 'Recorded Lectures & Course Curriculum Manifest',
        sqlOrLogic: 'Fetches structured course modules, lecture metadata, and student completion progress.',
      },
      {
        path: '/edtech/live-coaching',
        indent: 2,
        method: 'GET',
        startPct: 22,
        widthPct: 44,
        latencyMs: 58,
        status: 200,
        authLayer: 'Session Token + Batch Guard',
        engine: 'OOP Coaching Controller',
        operation: 'Live Cohort Schedule Sync',
        payload: '2.2 KB JSON',
        description: 'Live Coaching Cohort Schedule & Classroom Access',
        sqlOrLogic: 'Retrieves upcoming live coaching sessions and cohort enrollment records.',
      },
      {
        path: '/edtech/ai-tutor/assist',
        indent: 1,
        method: 'POST',
        startPct: 14,
        widthPct: 46,
        latencyMs: 82,
        status: 200,
        authLayer: 'Authenticated Student Session',
        engine: 'OOP Domain Tutor Layer',
        operation: 'Contextual Academic Resolution',
        payload: '4.5 KB Stream',
        description: 'Interactive AI Tutoring Module',
        sqlOrLogic: 'Processes student academic queries within the OOP tutoring service layer.',
      },
    ],
  },
  {
    id: 'cms',
    numeral: '02',
    kicker: '02 · CLIENT PROJECT · MULTI-BRANCH HEALTHCARE PLATFORM',
    titleWhite: 'CMS',
    titleMuted: '(Clinic Management System)',
    summary:
      'Architected and built a full-stack Clinic Management System (TypeScript, React, Supabase/PostgreSQL) for a paying client across 3 clinic branches with Row-Level Security (RLS) and automated GitHub Actions CI/CD pipelines.',
    subCaption:
      'CLIENT PROJECT (2025) · TYPESCRIPT, REACT, SUPABASE / POSTGRESQL, RLS & GITHUB ACTIONS CI/CD',
    role: 'Full-Stack Developer (Client Project)',
    period: '2025',
    badge: 'PAYING CLIENT · 3 BRANCHES',
    techStack: [
      'TypeScript',
      'React.js',
      'Supabase / PostgreSQL',
      'Row-Level Security (RLS)',
      'GitHub Actions (CI/CD)',
      'Express.js',
      'Tailwind CSS',
      'Recharts',
    ],
    metrics: [
      { label: 'Client Deployment', value: '3 Clinic Branches' },
      { label: 'Data Isolation', value: 'PostgreSQL RLS Policies' },
      { label: 'CI/CD Automation', value: 'GitHub Actions Backups & Keep-Alive' },
    ],
    problem:
      'A multi-branch healthcare clinic operating across 3 branches needed a full-stack clinic management system to manage patient records, appointments, and branch operations while enforcing strict branch-level data isolation, access control, and automated database backups.',
    architecture:
      'Architected and built a full-stack Clinic Management System using TypeScript, React, and Supabase/PostgreSQL. Designed the relational database schema and implemented PostgreSQL Row-Level Security (RLS) policies for strict branch-level data isolation and access control. Built authentication flows and automated CI/CD pipelines using GitHub Actions for scheduled backups and uptime keep-alive checks, backed by a structured pre-delivery testing plan before client handoff.',
    architectureLayers: [
      {
        layer: 'Multi-Branch Clinical Dashboard',
        tech: 'React 19, TypeScript, React Router, Tailwind CSS, Recharts',
        details:
          'Responsive clinical interface for managing patients, branch dashboards, appointments, and analytics across 3 clinic branches.',
      },
      {
        layer: 'Relational Schema & Row-Level Security',
        tech: 'Supabase / PostgreSQL, Row-Level Security (RLS)',
        details:
          'Designed the relational database schema and enforced PostgreSQL RLS policies so each branch only accesses its authorized clinical records.',
      },
      {
        layer: 'Authentication & Access Control',
        tech: 'Supabase Auth, Role & Branch Policies, Express',
        details:
          'Built authentication flows binding staff sessions to their assigned clinic branch and role permissions.',
      },
      {
        layer: 'CI/CD Backups & Pre-Delivery QA',
        tech: 'GitHub Actions (CI/CD), Pre-Delivery Testing Plan',
        details:
          'Automated GitHub Actions workflows for scheduled database backups and uptime keep-alive checks, validated with a structured pre-delivery testing plan before client handoff.',
      },
    ],
    keyFeatures: [
      {
        title: 'Multi-Branch Clinical Operations (3 Branches)',
        detail:
          'Built and deployed for a paying healthcare client operating across 3 clinic branches.',
      },
      {
        title: 'PostgreSQL Row-Level Security (RLS) Isolation',
        detail:
          'Database-level RLS policies enforcing branch-level data isolation and role-based access control.',
      },
      {
        title: 'Automated GitHub Actions Backups & Keep-Alive',
        detail:
          'CI/CD pipelines running scheduled database backups and automated uptime keep-alive checks.',
      },
      {
        title: 'Structured Pre-Delivery Testing & Validation',
        detail:
          'Comprehensive pre-delivery testing plan executed to verify data integrity and security policies prior to client handoff.',
      },
    ],
    schemaOrCodeTitle: 'POSTGRESQL ROW-LEVEL SECURITY (RLS) & BRANCH ISOLATION',
    schemaOrCodeSnippet: `-- Relational Schema & Row-Level Security (RLS) for 3 Clinic Branches
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "branch_level_data_isolation"
ON public.patients
FOR ALL
TO authenticated
USING (
  branch_id = (auth.jwt() ->> 'branch_id')::uuid
  OR (auth.jwt() ->> 'role') = 'admin'
)
WITH CHECK (
  branch_id = (auth.jwt() ->> 'branch_id')::uuid
  OR (auth.jwt() ->> 'role') = 'admin'
);`,
    impact: [
      'Architected and built a full-stack clinic management system (TypeScript, React, Supabase/PostgreSQL) for a paying client across 3 clinic branches.',
      'Designed the relational database schema and implemented Row-Level Security (RLS) policies for branch-level data isolation and access control.',
      'Built authentication flows and automated CI/CD pipelines (GitHub Actions) for scheduled backups and uptime keep-alive checks.',
      'Developed a structured pre-delivery testing plan to validate data integrity and security policies before client handoff.',
    ],
    liveUrl: 'https://clinic-management-system-two-opal.vercel.app/dashboard',
    liveLabel: 'LIVE DASHBOARD',
    waterfallRoutes: [
      {
        path: '/dashboard',
        indent: 0,
        method: 'GET',
        startPct: 0,
        widthPct: 30,
        latencyMs: 36,
        status: 200,
        authLayer: 'Supabase Auth + Branch JWT',
        engine: 'React + Express + Supabase',
        operation: 'Branch Context Hydration',
        payload: '3.2 KB JSON',
        description: 'Multi-Branch Clinical Dashboard & Auth Session Check',
        sqlOrLogic: 'Authenticates staff session and hydrates branch-scoped dashboard metrics.',
      },
      {
        path: '/rest/v1/patients?select=*',
        indent: 1,
        method: 'SQL',
        startPct: 8,
        widthPct: 48,
        latencyMs: 52,
        status: 200,
        authLayer: 'PostgreSQL RLS Policy',
        engine: 'PostgreSQL (3 Branches)',
        operation: 'RLS-Isolated SELECT Query',
        payload: '4.8 KB Rows',
        description: 'RLS-Enforced Branch Patient Records Query',
        sqlOrLogic: 'PostgreSQL RLS policy filters rows by authenticated branch_id claim.',
      },
      {
        path: '/rest/v1/appointments',
        indent: 2,
        method: 'POST',
        startPct: 16,
        widthPct: 50,
        latencyMs: 61,
        status: 200,
        authLayer: 'WITH CHECK Branch Guard',
        engine: 'PostgreSQL ACID Transaction',
        operation: 'INSERT + Conflict Check',
        payload: '1.4 KB JSON',
        description: 'Branch Appointment Scheduling & Clinical Workflow',
        sqlOrLogic: 'Validates branch access control and commits appointment record to PostgreSQL.',
      },
      {
        path: '/.github/workflows/backup-keepalive.yml',
        indent: 1,
        method: 'CRON',
        startPct: 10,
        widthPct: 40,
        latencyMs: 78,
        status: 200,
        authLayer: 'GitHub Actions Secret Vault',
        engine: 'GitHub Actions CI/CD Runner',
        operation: 'Automated PG Dump & Keep-Alive',
        payload: 'Snapshot OK',
        description: 'GitHub Actions Scheduled Backup & Uptime Keep-Alive',
        sqlOrLogic: 'Automated CI/CD cron workflow executing scheduled database backups and keep-alive pings.',
      },
      {
        path: '/qa/pre-delivery-validation',
        indent: 1,
        method: 'RPC',
        startPct: 18,
        widthPct: 34,
        latencyMs: 38,
        status: 200,
        authLayer: 'Pre-Handoff Security Audit',
        engine: 'PostgreSQL RLS Verification',
        operation: 'Cross-Branch Isolation Check',
        payload: '100% Pass',
        description: 'Pre-Delivery Data Integrity & RLS Policy Verification',
        sqlOrLogic: 'Validates cross-branch isolation and CRUD integrity before client handoff.',
      },
    ],
  },
  {
    id: 'farmaura',
    numeral: '03',
    kicker: '03 · GRAND FINALIST, SMART INDIA HACKATHON 2025 · AGRITECH AI',
    titleWhite: 'FarmAura',
    titleMuted: 'AI Crop Advisory',
    summary:
      'Designed and built a full-stack AI crop advisory platform using OOP-driven backend architecture and structured relational SQL models—delivering real-time, localized guidance on crop health, irrigation, and yield. Pitched KrishiMitra at the SIH 2025 National Finals.',
    subCaption:
      'GRAND FINALIST, SMART INDIA HACKATHON 2025 · OOP BACKEND, SQL, JAVA, PYTHON & REACT',
    role: 'Full-Stack Developer & Startup Founder (SIH 2025 Grand Finalist)',
    period: '2025',
    badge: 'SIH 2025 GRAND FINALIST',
    techStack: [
      'Java',
      'Python',
      'React.js',
      'TypeScript / JavaScript',
      'SQL (MySQL / PostgreSQL)',
      'Object-Oriented Programming (OOP)',
      'REST APIs',
      'HTML5 & CSS3',
    ],
    metrics: [
      { label: 'National Recognition', value: 'SIH 2025 Grand Finalist' },
      { label: 'Flagship Product', value: 'KrishiMitra Advisory' },
      { label: 'Venture Milestone', value: 'MSME AgriTech Startup & AICTE Winner' },
    ],
    problem:
      'Farmers need reliable, localized, real-time guidance on crop health, irrigation scheduling, and expected yield backed by structured crop, farmer, and sensor data.',
    architecture:
      'Designed and built a full-stack AI crop advisory platform using an Object-Oriented Programming (OOP) backend architecture paired with structured relational SQL data models for crop, farmer, and sensor data to support fast, reliable queries at scale.',
    architectureLayers: [
      {
        layer: 'KrishiMitra Advisory Frontend',
        tech: 'React.js, JavaScript / TypeScript, HTML/CSS',
        details:
          'User-friendly web interface delivering localized guidance on crop health, irrigation, yield, and farming inventory management.',
      },
      {
        layer: 'OOP-Driven Backend Architecture',
        tech: 'Java, Python, Object-Oriented Programming (OOP), REST APIs',
        details:
          'Modular OOP service classes processing crop health parameters, irrigation rules, and yield advisory logic.',
      },
      {
        layer: 'Relational SQL Data Models',
        tech: 'SQL (MySQL / PostgreSQL), Indexed Joins & Schema Design',
        details:
          'Structured relational schemas modeling farmers, crops, and sensor data to support fast, reliable queries at scale.',
      },
      {
        layer: 'National Finale & Startup Validation',
        tech: 'SIH 2025 National Finals, MSME Registration, AICTE IDE Bootcamp 2026',
        details:
          'Pitched KrishiMitra at the Smart India Hackathon 2025 National Finals, founded an MSME-registered AgriTech startup, and won the AICTE IDE Bootcamp 2026.',
      },
    ],
    keyFeatures: [
      {
        title: 'Real-Time Localized Crop Health & Irrigation Advisory',
        detail:
          'Delivers actionable guidance on crop health, irrigation timing, and yield optimization for farmers.',
      },
      {
        title: 'Structured Relational SQL Models',
        detail:
          'Normalized SQL schemas for crop, farmer, and sensor data built for fast, reliable queries at scale.',
      },
      {
        title: 'OOP-Driven Backend Service Layer',
        detail:
          'Clean Object-Oriented backend architecture separating data ingestion, advisory rules, and API controllers.',
      },
      {
        title: 'KrishiMitra — SIH 2025 National Finals Pitch',
        detail:
          'Shortlisted and pitched at the Smart India Hackathon 2025 National Grand Finals against top teams across India.',
      },
    ],
    schemaOrCodeTitle: 'RELATIONAL SQL DATA MODELS FOR CROP, FARMER & SENSOR DATA',
    schemaOrCodeSnippet: `-- Structured Relational SQL Schema for Farmers, Crops & Sensor Telemetry
CREATE TABLE farmers (
  farmer_id SERIAL PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  region VARCHAR(80) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE crops (
  crop_id SERIAL PRIMARY KEY,
  farmer_id INT NOT NULL REFERENCES farmers(farmer_id),
  crop_name VARCHAR(80) NOT NULL,
  growth_stage VARCHAR(50) NOT NULL,
  expected_yield_kg NUMERIC(10, 2)
);

CREATE TABLE sensor_data (
  reading_id BIGSERIAL PRIMARY KEY,
  crop_id INT NOT NULL REFERENCES crops(crop_id),
  soil_moisture_pct NUMERIC(5, 2) NOT NULL,
  temperature_c NUMERIC(5, 2) NOT NULL,
  recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sensor_crop_time ON sensor_data (crop_id, recorded_at DESC);`,
    impact: [
      'Designed and built a full-stack AI crop advisory platform using OOP-driven backend architecture, delivering real-time, localized guidance on crop health, irrigation, and yield to farmers.',
      'Structured relational data models (SQL) for crop, farmer, and sensor data to support fast, reliable queries at scale.',
      'Pitched KrishiMitra, the flagship product, at the SIH 2025 national finals against teams shortlisted from across India.',
      'Founder of an MSME-registered AgriTech startup and Winner of the AICTE IDE Bootcamp 2026.',
    ],
    waterfallRoutes: [
      {
        path: '/krishimitra/advisory',
        indent: 0,
        method: 'GET',
        startPct: 0,
        widthPct: 30,
        latencyMs: 32,
        status: 200,
        authLayer: 'Farmer Region Session',
        engine: 'React + REST API Gateway',
        operation: 'Localized Advisory Hydration',
        payload: '2.9 KB JSON',
        description: 'KrishiMitra Farmer Advisory Console',
        sqlOrLogic: 'Loads localized crop health, irrigation guidance, and yield indicators.',
      },
      {
        path: '/api/sensors/ingest',
        indent: 1,
        method: 'POST',
        startPct: 8,
        widthPct: 44,
        latencyMs: 51,
        status: 200,
        authLayer: 'Sensor Node API Key',
        engine: 'MySQL / PostgreSQL Engine',
        operation: 'Batch Telemetry INSERT',
        payload: '1.2 KB Frame',
        description: 'Sensor & Crop Data Ingestion Endpoint',
        sqlOrLogic: 'INSERT INTO sensor_data (crop_id, soil_moisture_pct, temperature_c) VALUES (...);',
      },
      {
        path: '/api/advisory/evaluate',
        indent: 2,
        method: 'RPC',
        startPct: 16,
        widthPct: 52,
        latencyMs: 84,
        status: 200,
        authLayer: 'OOP Domain Service Guard',
        engine: 'Java & Python OOP Backend',
        operation: 'Crop Health & Irrigation Rules',
        payload: '3.6 KB JSON',
        description: 'OOP Crop Health, Irrigation & Yield Advisory Service',
        sqlOrLogic: 'Evaluates sensor telemetry and crop stage inside the OOP domain service layer.',
      },
      {
        path: '/sql/farmer-crop-sensor-join',
        indent: 2,
        method: 'SQL',
        startPct: 22,
        widthPct: 40,
        latencyMs: 42,
        status: 200,
        authLayer: 'Relational Schema Policy',
        engine: 'Indexed SQL (idx_sensor_crop)',
        operation: '3-Table Inner Join + Aggregate',
        payload: '4.1 KB Rows',
        description: 'Indexed Relational Join Across Farmer, Crop & Sensor Tables',
        sqlOrLogic: 'SELECT c.crop_name, s.soil_moisture_pct FROM crops c JOIN sensor_data s ON c.crop_id = s.crop_id;',
      },
    ],
  },
  {
    id: 'bot-or-not',
    numeral: '04',
    kicker: '04 · REAL-TIME MULTIPLAYER & AI TURING GAME · FULL-STACK WEB',
    titleWhite: 'Bot or Not',
    titleMuted: 'Turing Arena',
    summary:
      'A real-time multiplayer and AI Turing game built with a React 19, TypeScript, Vite, Tailwind CSS, and Framer Motion frontend and a production Fastify, WebSocket, Drizzle ORM, PostgreSQL, Redis, and Better Auth backend.',
    subCaption:
      'FULL-STACK WEB APPLICATION · REACT 19, TYPESCRIPT, FASTIFY, WEBSOCKETS, DRIZZLE ORM, POSTGRESQL & REDIS',
    role: 'Full-Stack Developer',
    period: '2025 – 2026',
    badge: 'LIVE TURING GAME',
    techStack: [
      'TypeScript',
      'React 19',
      'Fastify',
      'WebSockets (@fastify/websocket)',
      'PostgreSQL',
      'Drizzle ORM',
      'Redis (ioredis)',
      'Better Auth',
      'Tailwind CSS',
      'Zod',
    ],
    metrics: [
      { label: 'Realtime Engine', value: 'Fastify + WebSockets + Redis' },
      { label: 'Database & ORM', value: 'PostgreSQL + Drizzle ORM' },
      { label: 'Frontend Stack', value: 'React 19 + TypeScript + Vite' },
    ],
    problem:
      'Building a real-time multiplayer Turing test game requires low-latency matchmaking, synchronized WebSocket chat rooms, AI opponent orchestration, persistent player stats, quests, and secure authentication.',
    architecture:
      'Engineered a decoupled full-stack monorepo (`frontend` and `backend`). The frontend is built with React 19, TypeScript, Vite, Tailwind CSS v4, Framer Motion, and Better Auth. The production backend runs on Fastify 5 with `@fastify/websocket`, Redis (`ioredis`) for real-time matchmaking and session state, PostgreSQL managed through type-safe Drizzle ORM migrations, Zod request validation, and Pino structured logging.',
    architectureLayers: [
      {
        layer: 'Interactive Game Frontend',
        tech: 'React 19, TypeScript, Vite, Tailwind CSS v4, Framer Motion',
        details:
          'Responsive game interface featuring live matchmaking queues, real-time interrogation chat, verdict voting, quests, and leaderboards.',
      },
      {
        layer: 'Fastify & WebSocket Realtime Server',
        tech: 'Fastify 5, @fastify/websocket, Pino Logger, Zod',
        details:
          'Modular backend architecture (`matchmaking`, `games`, `chat`, `ai`, `quests`, `stats`, `tokens`, `subscriptions`) handling live bi-directional WebSocket game events.',
      },
      {
        layer: 'Matchmaking & State Cache',
        tech: 'Redis (ioredis), Background Jobs',
        details:
          'Coordinates active matchmaking queues, ephemeral room state, turn timers, and low-latency pub/sub events.',
      },
      {
        layer: 'Relational Persistence & Auth',
        tech: 'PostgreSQL, Drizzle ORM, Better Auth',
        details:
          'Type-safe Drizzle ORM schemas and migrations storing user accounts, game histories, quest progression, token balances, and player stats.',
      },
    ],
    keyFeatures: [
      {
        title: 'Real-Time WebSocket Matchmaking & Chat',
        detail:
          'Pairs players in live interrogation rooms over `@fastify/websocket` backed by Redis state management.',
      },
      {
        title: 'AI Opponent & Human Interrogation Modules',
        detail:
          'Dedicated backend modules (`ai`, `chat`, `games`, `matchmaking`) orchestrating blind Turing test rounds and verdict scoring.',
      },
      {
        title: 'Quests, Tokens & Player Statistics',
        detail:
          'Persistent progression system tracking win rates, detection accuracy, quests (`/api/quests`), and stats (`/api/stats`).',
      },
      {
        title: 'Type-Safe Drizzle ORM + PostgreSQL Backend',
        detail:
          'Schema-driven PostgreSQL persistence with Drizzle Kit migrations, Better Auth sessions, and Vitest test suites.',
      },
    ],
    schemaOrCodeTitle: 'FASTIFY WEBSOCKET & DRIZZLE ORM GAME ARCHITECTURE',
    schemaOrCodeSnippet: `// Fastify + WebSocket + Drizzle ORM Backend Route & Module Structure
// Modules: ai | chat | extensions | games | matchmaking | quests | stats | subscriptions | tokens

app.register(async function gameRoutes(fastify) {
  fastify.get('/ws/game/:gameId', { websocket: true }, (socket, req) => {
    const { gameId } = z.object({ gameId: z.string().uuid() }).parse(req.params);
    matchmakingManager.attachPlayerSocket(gameId, socket);
  });

  fastify.get('/api/stats', async (req, reply) => {
    const stats = await db.select().from(playerStats).where(eq(playerStats.userId, req.user.id));
    return reply.send({ status: 'ok', data: stats });
  });
});`,
    impact: [
      'Engineered and deployed the full-stack Bot or Not game with a React 19 + TypeScript frontend and a Fastify + PostgreSQL + Redis backend.',
      'Built modular backend services for real-time WebSocket chat, matchmaking, AI opponents, quests, tokens, and player statistics using Drizzle ORM and Better Auth.',
      'Designed and shipped responsive marketing and product landing websites end-to-end across multiple ventures (UI/UX, copywriting, and deployment).',
    ],
    liveUrl: 'https://botronot.vercel.app',
    liveLabel: 'LIVE ARENA',
    waterfallRoutes: [
      {
        path: '/api/health',
        indent: 0,
        method: 'GET',
        startPct: 0,
        widthPct: 24,
        latencyMs: 22,
        status: 200,
        authLayer: 'Public Liveness Probe',
        engine: 'Fastify 5 + PG + Redis',
        operation: 'Connection Pool & Ping Check',
        payload: '256 B JSON',
        description: 'Fastify Server, PostgreSQL & Redis Health Check',
        sqlOrLogic: 'Verifies Fastify HTTP server, Drizzle PostgreSQL pool, and ioredis connection.',
      },
      {
        path: '/api/me',
        indent: 1,
        method: 'GET',
        startPct: 6,
        widthPct: 34,
        latencyMs: 35,
        status: 200,
        authLayer: 'Better Auth Session Cookie',
        engine: 'Better Auth + Drizzle ORM',
        operation: 'Session & Token Resolution',
        payload: '1.6 KB JSON',
        description: 'Better Auth Session & Player Profile Resolution',
        sqlOrLogic: 'Validates session cookie via Better Auth and fetches user profile & token balance.',
      },
      {
        path: '/ws/matchmaking',
        indent: 1,
        method: 'WS',
        startPct: 12,
        widthPct: 48,
        latencyMs: 44,
        status: 200,
        authLayer: 'WS Handshake + Zod Guard',
        engine: '@fastify/websocket + ioredis',
        operation: 'Pub/Sub Queue & Room Pairing',
        payload: '128 B WS Frame',
        description: 'Redis-Backed Matchmaking & WebSocket Game Room Handshake',
        sqlOrLogic: 'Pairs player in Redis matchmaking queue and provisions live game session.',
      },
      {
        path: '/api/games',
        indent: 2,
        method: 'POST',
        startPct: 18,
        widthPct: 50,
        latencyMs: 62,
        status: 200,
        authLayer: 'Verified Room Participant',
        engine: 'PostgreSQL + Drizzle ORM',
        operation: 'Round State & Verdict Commit',
        payload: '3.4 KB JSON',
        description: 'Game Round State, Chat Relay & Verdict Submission',
        sqlOrLogic: 'Persists round outcome and chat transcript via Drizzle ORM into PostgreSQL.',
      },
      {
        path: '/api/quests & /api/stats',
        indent: 1,
        method: 'SQL',
        startPct: 14,
        widthPct: 40,
        latencyMs: 41,
        status: 200,
        authLayer: 'Better Auth User Guard',
        engine: 'Drizzle ORM + PostgreSQL',
        operation: 'Indexed Leaderboard Aggregation',
        payload: '2.8 KB Rows',
        description: 'Player Quests & Leaderboard Statistics Aggregation',
        sqlOrLogic: 'Queries player_stats and quest progression tables via Drizzle ORM.',
      },
    ],
  },
];

export const WORK_MANIFEST: ManifestItem[] = [
  {
    code: 'W-01',
    title: 'CMS (Clinic Management System) — Multi-Branch Healthcare Platform',
    roleAndPeriod: 'Client Project · 2025',
    category: 'CLIENT PRODUCTION',
    description:
      'Architected and built a full-stack clinic management system (TypeScript, React, Supabase/PostgreSQL) for a paying client across 3 clinic branches.',
    highlights: [
      'Designed the relational database schema and implemented Row-Level Security (RLS) policies for branch-level data isolation and access control.',
      'Built authentication flows and automated CI/CD pipelines (GitHub Actions) for scheduled backups and uptime keep-alive checks.',
      'Developed a structured pre-delivery testing plan to validate data integrity and security policies before client handoff.',
    ],
    stack: ['TypeScript', 'React.js', 'Supabase / PostgreSQL', 'Row-Level Security (RLS)', 'GitHub Actions (CI/CD)'],
    projectIdToInspect: 'cms',
  },
  {
    code: 'W-02',
    title: 'Software Engineer Intern — Exposys Data Labs, Bengaluru',
    roleAndPeriod: 'Jun 2025 – Jul 2025',
    category: 'INTERNSHIP',
    description:
      'Completed a hands-on software development internship, writing, debugging, and testing code for assigned engineering tasks under senior engineer guidance.',
    highlights: [
      'Collaborated using Git-based version control workflows and followed structured development processes.',
      'Recognized for punctuality, ownership, and consistent delivery throughout the internship.',
    ],
    stack: ['Java', 'Python', 'TypeScript', 'JavaScript', 'SQL', 'Git & GitHub'],
  },
  {
    code: 'W-03',
    title: 'Solvyn — ERP & EdTech Platform',
    roleAndPeriod: 'Co-Founder & Developer · 2024 – Present',
    category: 'CO-FOUNDER SAAS',
    description:
      'Co-founded and engineered a dual-pillar platform combining institutional ERP with recorded lectures, live coaching, and AI tutoring, applying OOP principles across the application layer.',
    highlights: [
      'Designed the student app UI/UX and system architecture, developed end-to-end with a team using Git-based workflows.',
    ],
    stack: ['TypeScript', 'React.js', 'Supabase (PostgreSQL)', 'OOP', 'Tailwind CSS', 'Figma', 'Git'],
    projectIdToInspect: 'solvyn',
  },
  {
    code: 'W-04',
    title: 'FarmAura — AI Crop Advisory Platform (KrishiMitra)',
    roleAndPeriod: 'Grand Finalist, Smart India Hackathon 2025 · 2025',
    category: 'NATIONAL FINALS',
    description:
      'Designed and built a full-stack AI crop advisory platform using OOP-driven backend architecture, delivering real-time, localized guidance on crop health, irrigation, and yield to farmers.',
    highlights: [
      'Structured relational data models (SQL) for crop, farmer, and sensor data to support fast, reliable queries at scale.',
      'Pitched KrishiMitra, the flagship product, at the SIH 2025 national finals against teams shortlisted from across India.',
      'Founder of an MSME-registered AgriTech startup, Winner at AICTE IDE Bootcamp 2026, and Organizer of Mini SIH (400+ participants, sponsored by AlgoBharat).',
    ],
    stack: ['Java', 'Python', 'SQL (MySQL / PostgreSQL)', 'OOP', 'React.js', 'REST APIs'],
    projectIdToInspect: 'farmaura',
  },
  {
    code: 'W-05',
    title: 'Bot or Not & Product Landing Pages — Multiple Ventures',
    roleAndPeriod: 'Full-Stack Developer · 2025 – 2026',
    category: 'WEB ENGINEERING',
    description:
      'Built the Bot or Not real-time Turing game (React 19, TypeScript, Fastify, WebSockets, Drizzle ORM, PostgreSQL, Redis) and designed and shipped responsive marketing/landing websites end-to-end across multiple ventures.',
    highlights: [
      'Handled complete UI/UX design, copywriting, frontend/backend implementation, and production deployment.',
    ],
    stack: ['React 19', 'TypeScript', 'Fastify', 'PostgreSQL', 'Drizzle ORM', 'Redis', 'Tailwind CSS'],
    projectIdToInspect: 'bot-or-not',
  },
];

export const FIELD_NOTES: FieldNote[] = [
  {
    id: 'rls-cms-isolation',
    title: 'CMS Architecture: isolating 3 clinic branches in PostgreSQL with Row-Level Security',
    date: '2026-10-28',
    readTime: '3 min read',
    topic: 'POSTGRESQL · RLS · CLIENT PROJECT',
    summary:
      'How we enforced branch-level data isolation in our paying client Clinic Management System using PostgreSQL Row-Level Security (RLS) policies and GitHub Actions CI/CD backups.',
    sections: [
      {
        heading: 'Database-Level Branch Isolation',
        body: 'In a multi-branch healthcare platform serving 3 clinic branches, access control must be enforced at the database layer. Using PostgreSQL Row-Level Security (RLS) ensures each branch only accesses its own records.',
        codeSnippet: `ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "branch_isolation_policy"
ON public.patients
FOR ALL TO authenticated
USING (branch_id = (auth.jwt() ->> 'branch_id')::uuid)
WITH CHECK (branch_id = (auth.jwt() ->> 'branch_id')::uuid);`,
      },
      {
        heading: 'Automated Backups & Pre-Delivery Testing',
        body: 'Alongside RLS policies, we configured GitHub Actions CI/CD workflows for scheduled database backups and uptime keep-alive checks, and validated all security policies with a structured pre-delivery testing plan before client handoff.',
      },
    ],
  },
  {
    id: 'botornot-realtime-architecture',
    title: 'Bot or Not: real-time WebSocket matchmaking with Fastify, Drizzle ORM, PostgreSQL & Redis',
    date: '2026-10-14',
    readTime: '3 min read',
    topic: 'FASTIFY · WEBSOCKETS · DRIZZLE ORM',
    summary:
      'Structuring a low-latency multiplayer and AI Turing game using Fastify WebSockets, Redis matchmaking state, Better Auth, and type-safe Drizzle ORM schemas.',
    sections: [
      {
        heading: 'Decoupled Frontend & Fastify WebSocket Backend',
        body: 'The frontend runs on React 19, TypeScript, Vite, and Tailwind CSS, while the backend separates matchmaking, live chat rooms, AI agents, quests, and player stats into clean Fastify modules backed by PostgreSQL (Drizzle ORM) and Redis (ioredis).',
      },
    ],
  },
  {
    id: 'oop-and-sql-at-sih',
    title: 'FarmAura (KrishiMitra) & Solvyn: applying OOP principles and relational SQL models at scale',
    date: '2026-09-21',
    readTime: '4 min read',
    topic: 'OOP · SQL · SYSTEM ARCHITECTURE',
    summary:
      'How Object-Oriented Programming (OOP) and structured SQL schemas powered our SIH 2025 Grand Finale pitch (KrishiMitra) and the Solvyn ERP & EdTech platform.',
    sections: [
      {
        heading: 'OOP Application Layer & Relational SQL Design',
        body: 'Both FarmAura and Solvyn rely on clean Object-Oriented domain modeling combined with normalized SQL tables—enabling fast queries across crop, farmer, and sensor telemetry in FarmAura, and cohesive multi-portal ERP + EdTech workflows in Solvyn.',
      },
    ],
  },
];
