import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  PROFILE_DATA,
  CAPABILITY_INDEX,
  FLAGSHIP_PROJECTS,
  WORK_MANIFEST,
  FIELD_NOTES,
  FlagshipProject,
  FieldNote,
} from '../data/portfolioData';
import { ParticleEllipsoid, ParticleWaveHorizon } from './ParticleInstruments';

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface EngineeringPortfolioProps {
  onNavigateWithTransition?: (sectionId: string, label?: string) => void;
}

const ACHIEVEMENT_PILLARS = [
  {
    index: '01',
    tag: 'PAYING CLIENT DELIVERY',
    metric: '3 Clinic Branches',
    title: 'Multi-Branch CMS in Production',
    detail:
      'Architected and shipped a full-stack Clinic Management System with PostgreSQL Row-Level Security (RLS), GitHub Actions automated backups, and pre-delivery QA.',
  },
  {
    index: '02',
    tag: 'NATIONAL GRAND FINALIST',
    metric: 'SIH 2025 Finals',
    title: 'Smart India Hackathon & MSME Founder',
    detail:
      'Pitched KrishiMitra (FarmAura) at the SIH 2025 National Grand Finals in the AI/AgriTech track and founded an MSME-registered AgriTech startup.',
  },
  {
    index: '03',
    tag: 'NATIONAL WINNER & LEADER',
    metric: '400+ Builders',
    title: 'AICTE IDE Winner & Mini SIH Organizer',
    detail:
      'Winner at the AICTE IDE Bootcamp 2026 and lead organizer of Mini SIH, a national-level campus hackathon with 400+ participants sponsored by AlgoBharat.',
  },
  {
    index: '04',
    tag: 'INDUSTRY INTERNSHIP',
    metric: 'Exposys Data Labs',
    title: 'Software Engineer Intern · Bengaluru',
    detail:
      'Wrote, debugged, and tested production code under senior engineer mentorship using structured Git workflows, code reviews, and iterative sprints.',
  },
];

export function EngineeringPortfolio({ onNavigateWithTransition }: EngineeringPortfolioProps) {
  const [activeProjectIndex, setActiveProjectIndex] = useState<number>(0);
  const [projectScrollProgress, setProjectScrollProgress] = useState<number>(0);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number>(0);
  const [traceKey, setTraceKey] = useState<number>(0);
  const [expandedCapabilityId, setExpandedCapabilityId] = useState<string | null>('fullstack-web');
  const [activeDoor, setActiveDoor] = useState<number>(2);
  const [showStickyNav, setShowStickyNav] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Modals / Drawers
  const [caseStudyProject, setCaseStudyProject] = useState<FlagshipProject | null>(null);
  const [activeFieldNote, setActiveFieldNote] = useState<FieldNote | null>(null);
  const [isCommandOpen, setIsCommandOpen] = useState<boolean>(false);
  const [commandQuery, setCommandQuery] = useState<string>('');
  const [copiedEmail, setCopiedEmail] = useState<boolean>(false);

  // Refs for the sticky scroll-pinned sequential project track & programmatic navigation bypass
  const projectTrackRef = useRef<HTMLDivElement>(null);
  const isProgrammaticNavRef = useRef<boolean>(false);
  const programmaticTimeoutRef = useRef<number | null>(null);

  const activeProject = FLAGSHIP_PROJECTS[activeProjectIndex] || FLAGSHIP_PROJECTS[0];
  const activeRoute =
    activeProject.waterfallRoutes[selectedRouteIndex] || activeProject.waterfallRoutes[0];

  const isAnyOverlayOpen = Boolean(
    caseStudyProject || activeFieldNote || isCommandOpen || isMobileMenuOpen
  );

  // Helper to mark navigation as programmatic so scroll-pinning never hijacks header clicks
  const triggerProgrammaticBypass = useCallback((durationMs = 1000) => {
    isProgrammaticNavRef.current = true;
    if (programmaticTimeoutRef.current) {
      window.clearTimeout(programmaticTimeoutRef.current);
    }
    programmaticTimeoutRef.current = window.setTimeout(() => {
      isProgrammaticNavRef.current = false;
    }, durationMs);
  }, []);

  // Lock background page scroll whenever the Case Study Drawer, Mobile Menu, or any modal is open
  useEffect(() => {
    if (!isAnyOverlayOpen) return;

    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, [isAnyOverlayOpen]);

  // Combined scroll listener:
  // 1) Shows sticky top bar after scrolling past Hero
  // 2) Sequentially cycles projects 01 -> 02 -> 03 -> 04 while scrolling inside #instrument track
  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;

      // 1. Sticky header visibility
      const shouldShowNav = scrollY > vh * 0.72;
      setShowStickyNav((prev) => (prev !== shouldShowNav ? shouldShowNav : prev));

      // 2. Sequential scroll-pinned project showcase (active only during manual scroll)
      if (isProgrammaticNavRef.current) return;

      const trackEl = projectTrackRef.current;
      if (!trackEl) return;

      const rect = trackEl.getBoundingClientRect();
      const stickyOffset = 56; // top-14 header height
      const scrollableDistance = rect.height - (vh - stickyOffset);

      if (scrollableDistance <= 0) return;

      const scrolledInsideTrack = stickyOffset - rect.top;

      if (scrolledInsideTrack >= -40 && scrolledInsideTrack <= scrollableDistance + 40) {
        const clampedProgress = Math.max(
          0,
          Math.min(0.9999, scrolledInsideTrack / scrollableDistance)
        );
        setProjectScrollProgress(clampedProgress);

        const totalProjects = FLAGSHIP_PROJECTS.length;
        const nextIndex = Math.min(
          totalProjects - 1,
          Math.max(0, Math.floor(clampedProgress * totalProjects))
        );

        setActiveProjectIndex((prevIdx) => {
          if (prevIdx !== nextIndex) {
            setSelectedRouteIndex(0);
            setTraceKey((k) => k + 1);
            return nextIndex;
          }
          return prevIdx;
        });
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Keyboard shortcut ⌘K / Ctrl+K & Escape handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setCaseStudyProject(null);
        setActiveFieldNote(null);
        setIsCommandOpen(false);
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Select a specific project by ID and optionally scroll directly to its position in the track or waterfall
  const handleSelectProject = useCallback(
    (projectId: string, scrollMode: 'none' | 'track' | 'waterfall' = 'none') => {
      const idx = FLAGSHIP_PROJECTS.findIndex((p) => p.id === projectId);
      if (idx === -1) return;

      triggerProgrammaticBypass(1050);
      setActiveProjectIndex(idx);
      setProjectScrollProgress((idx + 0.15) / FLAGSHIP_PROJECTS.length);
      setSelectedRouteIndex(0);
      setTraceKey((k) => k + 1);

      if (scrollMode === 'track' && projectTrackRef.current) {
        const trackEl = projectTrackRef.current;
        const trackTop = trackEl.getBoundingClientRect().top + window.scrollY;
        const scrollableDistance = Math.max(
          0,
          trackEl.offsetHeight - (window.innerHeight - 56)
        );
        const targetScrollY =
          trackTop - 56 + (idx / FLAGSHIP_PROJECTS.length) * scrollableDistance + 8;
        window.scrollTo({ top: targetScrollY, behavior: 'smooth' });
      } else if (scrollMode === 'waterfall') {
        const wfEl = document.getElementById('waterfall');
        if (wfEl) wfEl.scrollIntoView({ behavior: 'smooth' });
      }
    },
    [triggerProgrammaticBypass]
  );

  // Direct header navigation that bypasses sequential scroll pinning
  const scrollToSection = useCallback(
    (id: string) => {
      setIsMobileMenuOpen(false);
      triggerProgrammaticBypass(1150);

      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    },
    [triggerProgrammaticBypass]
  );

  const handleCopyEmail = () => {
    navigator.clipboard?.writeText(PROFILE_DATA.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2200);
  };

  return (
    <div
      id="projects"
      className="relative z-20 w-full bg-gradient-to-b from-transparent via-[#020202] to-[#000000] text-white font-sans selection:bg-white selection:text-black"
    >
      {/* =====================================================================
          FULL-WIDTH FLOATING TOP BAR (Desktop, Tablet & Mobile Responsive)
      ===================================================================== */}
      <AnimatePresence>
        {showStickyNav && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
            className="fixed top-0 inset-x-0 z-40 bg-black/88 backdrop-blur-md"
          >
            <div className="w-full px-5 sm:px-8 lg:px-14 xl:px-20 h-14 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => {
                    triggerProgrammaticBypass(1100);
                    if (onNavigateWithTransition) {
                      onNavigateWithTransition('top', 'S MOHAMMED SAHEEM');
                    } else {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  data-magnetic
                  className="font-bold text-xs sm:text-sm tracking-tight text-white hover:opacity-80 transition-opacity whitespace-nowrap shrink-0"
                >
                  {PROFILE_DATA.name}
                </button>
                <span className="hidden md:inline-block text-xs text-neutral-500 whitespace-nowrap truncate">
                  · {PROFILE_DATA.tagline}
                </span>
              </div>

              {/* Desktop & Tablet Navigation */}
              <nav className="hidden sm:flex items-center gap-5 md:gap-7 text-xs text-neutral-400">
                <button
                  type="button"
                  onClick={() => scrollToSection('instrument')}
                  data-magnetic
                  className="hover:text-white transition-colors whitespace-nowrap shrink-0"
                >
                  work
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection('capabilities')}
                  data-magnetic
                  className="hover:text-white transition-colors whitespace-nowrap shrink-0"
                >
                  stack
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection('experience')}
                  data-magnetic
                  className="hover:text-white transition-colors whitespace-nowrap shrink-0"
                >
                  experience
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection('notes')}
                  data-magnetic
                  className="hover:text-white transition-colors whitespace-nowrap shrink-0"
                >
                  notes
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection('contact')}
                  data-magnetic
                  className="hover:text-white transition-colors whitespace-nowrap shrink-0"
                >
                  contact
                </button>
                <button
                  type="button"
                  onClick={() => setIsCommandOpen(true)}
                  data-magnetic
                  title="Open Command Palette (⌘K)"
                  className="border border-white/15 bg-white/[0.03] hover:bg-white/10 px-2.5 py-0.5 text-[11px] font-mono text-neutral-300 hover:text-white transition-colors whitespace-nowrap shrink-0"
                >
                  ⌘K
                </button>
              </nav>

              {/* Mobile Navigation Trigger (< 640px) */}
              <div className="flex sm:hidden items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCommandOpen(true)}
                  className="border border-white/15 bg-white/[0.03] px-2.5 py-1 text-[10px] font-mono text-neutral-300"
                >
                  ⌘K
                </button>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                  className="border border-white/25 bg-white text-black font-mono font-bold text-[10px] uppercase tracking-[0.18em] px-3 py-1"
                >
                  {isMobileMenuOpen ? 'CLOSE ✕' : 'MENU +'}
                </button>
              </div>
            </div>
            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================================
          BESPOKE MOBILE FULL-SCREEN NAVIGATION SHEET (< 640px)
      ===================================================================== */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.28, ease: EASE_OUT_EXPO }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg flex flex-col justify-between p-6 sm:hidden"
          >
            <div className="flex items-center justify-between pb-5 border-b border-white/10">
              <span className="font-bold text-sm tracking-tight text-white">
                {PROFILE_DATA.name}
              </span>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="border border-white/20 px-3 py-1 text-xs font-mono text-white"
              >
                CLOSE ✕
              </button>
            </div>

            <div className="my-auto py-8 space-y-5">
              {[
                { id: 'instrument', num: '01', label: 'Flagship Work & Schemas' },
                { id: 'waterfall', num: '02', label: 'Live Route Waterfall' },
                { id: 'capabilities', num: '03', label: 'Capability Index & Stack' },
                { id: 'experience', num: '04', label: 'Work Manifest & Experience' },
                { id: 'notes', num: '05', label: 'Field Notes & Logs' },
                { id: 'contact', num: '06', label: 'Direct Channel · Contact' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className="w-full flex items-baseline justify-between py-2 border-b border-white/[0.07] text-left group"
                >
                  <div className="flex items-baseline gap-4">
                    <span className="text-xs font-mono text-neutral-500">{item.num}</span>
                    <span className="text-2xl font-bold tracking-tight text-white group-active:text-neutral-300">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-sm font-mono text-neutral-400">→</span>
                </button>
              ))}
            </div>

            <div className="pt-5 border-t border-white/10 flex flex-col gap-3 text-xs font-mono text-neutral-400">
              <a href={`mailto:${PROFILE_DATA.email}`} className="text-white font-bold">
                {PROFILE_DATA.email} →
              </a>
              <div className="flex items-center gap-6">
                <a href={PROFILE_DATA.github} target="_blank" rel="noopener noreferrer">
                  GITHUB ↗
                </a>
                <a href={PROFILE_DATA.linkedin} target="_blank" rel="noopener noreferrer">
                  LINKEDIN ↗
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================================
          SECTION 1: THE THESIS & THREE DOORS (Full Window Width)
      ===================================================================== */}
      <section id="thesis" className="relative w-full pt-24 sm:pt-32 lg:pt-36 pb-20 sm:pb-28">
        <div className="w-full px-5 sm:px-8 lg:px-14 xl:px-20">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
          >
            <div className="flex items-center gap-3 text-[11px] font-mono uppercase tracking-[0.22em] text-neutral-400 mb-6">
              <span className="w-2 h-2 bg-white inline-block shrink-0" />
              <span>THE THESIS</span>
            </div>

            <h2 className="text-3xl sm:text-5xl lg:text-6xl xl:text-[64px] font-bold tracking-[-0.03em] leading-[1.06] max-w-6xl text-balance mb-12 sm:mb-16">
              Full-stack engineering from relational SQL schemas and OOP backends to live production interfaces — built as an{' '}
              <span className="text-[#8E9299]">engineering discipline</span>.
            </h2>

            {/* Full-Width 3-Column Proof Strip */}
            <div className="grid grid-cols-1 md:grid-cols-3 border border-white/[0.09] bg-white/[0.01]">
              <div className="p-6 sm:p-8 lg:p-10 border-b md:border-b-0 md:border-r border-white/[0.09] hover:bg-white/[0.02] transition-colors">
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500 mb-3">
                  01 · END-TO-END OWNERSHIP
                </div>
                <p className="text-sm sm:text-base text-neutral-200 leading-relaxed">
                  database schema design through API logic and UI deployment — the SQL migrations, backend services, and React commits are the same hands
                </p>
              </div>

              <div className="p-6 sm:p-8 lg:p-10 border-b md:border-b-0 md:border-r border-white/[0.09] hover:bg-white/[0.02] transition-colors">
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500 mb-3">
                  02 · PRODUCTION VERIFIED
                </div>
                <p className="text-sm sm:text-base text-neutral-200 leading-relaxed">
                  shipped for a paying multi-branch clinic client with PostgreSQL Row-Level Security, GitHub Actions CI/CD backups, and live Vercel deployments
                </p>
              </div>

              <div className="p-6 sm:p-8 lg:p-10 hover:bg-white/[0.02] transition-colors">
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500 mb-3">
                  03 · CORE CS + FULL STACK
                </div>
                <p className="text-sm sm:text-base text-neutral-200 leading-relaxed">
                  grounded in Data Structures & Algorithms, OOP, DBMS, and OS alongside TypeScript, React, Java, Python, MySQL, and PostgreSQL
                </p>
              </div>
            </div>
          </motion.div>

          {/* Full-Bleed Soft Feathered Divider */}
          <div className="my-20 sm:my-24 h-px w-full bg-gradient-to-r from-transparent via-white/12 to-transparent" />

          {/* THREE DOORS */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
          >
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
              <div className="flex items-center gap-3 text-[11px] font-mono uppercase tracking-[0.22em] text-neutral-400">
                <span className="w-2 h-2 bg-white inline-block shrink-0" />
                <span>THREE DOORS</span>
              </div>
              <div className="hidden sm:block">
                <ParticleEllipsoid width={260} height={130} glowIntensity={0.15} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 border border-white/[0.09] bg-white/[0.01]">
              {/* Door 01 */}
              <button
                type="button"
                onClick={() => {
                  setActiveDoor(1);
                  handleSelectProject('solvyn', 'track');
                }}
                data-magnetic
                className={`group text-left p-7 sm:p-9 lg:p-11 border-b md:border-b-0 md:border-r border-white/[0.09] transition-all duration-300 hover:bg-white/[0.03] ${
                  activeDoor === 1 ? 'border-t-2 border-t-white/60 bg-white/[0.02]' : ''
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono text-neutral-500 mb-6">
                  <span>01</span>
                  <span className="group-hover:translate-x-1.5 transition-transform duration-200">
                    →
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white mb-3">
                  The products
                </h3>
                <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
                  Solvyn (ERP & EdTech Platform), FarmAura (SIH 2025 Grand Finalist), and Bot or Not (Real-Time Turing Game).
                </p>
              </button>

              {/* Door 02 */}
              <button
                type="button"
                onClick={() => {
                  setActiveDoor(2);
                  handleSelectProject('cms', 'track');
                }}
                data-magnetic
                className={`group text-left p-7 sm:p-9 lg:p-11 border-b md:border-b-0 md:border-r border-white/[0.09] transition-all duration-300 hover:bg-white/[0.03] ${
                  activeDoor === 2 ? 'border-t-2 border-t-white/60 bg-white/[0.02]' : ''
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono text-neutral-500 mb-6">
                  <span>02</span>
                  <span className="group-hover:translate-x-1.5 transition-transform duration-200">
                    →
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white mb-3">
                  The client build
                </h3>
                <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
                  CMS (Clinic Management System) built for a paying client across 3 clinic branches with PostgreSQL RLS & GitHub Actions CI/CD.
                </p>
              </button>

              {/* Door 03 */}
              <button
                type="button"
                onClick={() => {
                  setActiveDoor(3);
                  scrollToSection('capabilities');
                }}
                data-magnetic
                className={`group text-left p-7 sm:p-9 lg:p-11 transition-all duration-300 hover:bg-white/[0.03] ${
                  activeDoor === 3 ? 'border-t-2 border-t-white/60 bg-white/[0.02]' : ''
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono text-neutral-500 mb-6">
                  <span>03</span>
                  <span className="group-hover:translate-x-1.5 transition-transform duration-200">
                    →
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white mb-3">
                  The stack & notes
                </h3>
                <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
                  Java, Python, TypeScript, JavaScript, React, SQL (MySQL & PostgreSQL), DSA, OOP, DBMS, and architecture logs.
                </p>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Full-Window Divider */}
      <div className="w-full px-5 sm:px-8 lg:px-14 xl:px-20">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/12 to-transparent" />
      </div>

      {/* =====================================================================
          SECTION 2: CAPABILITY INDEX (Full Window Width + Multi-Viewport)
      ===================================================================== */}
      <section id="capabilities" className="relative w-full py-20 sm:py-28 lg:py-32">
        <div className="w-full px-5 sm:px-8 lg:px-14 xl:px-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.65, ease: EASE_OUT_EXPO }}
          >
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
              <div className="flex items-center gap-3 text-[11px] font-mono uppercase tracking-[0.22em] text-neutral-400">
                <span className="w-2 h-2 bg-white inline-block shrink-0" />
                <span>CAPABILITY INDEX · TECHNICAL SKILLS</span>
              </div>
              <div className="hidden sm:block">
                <ParticleEllipsoid width={250} height={125} glowIntensity={0.14} />
              </div>
            </div>

            <div className="divide-y divide-white/[0.09] border-y border-white/[0.09]">
              {CAPABILITY_INDEX.map((cap) => {
                const isExpanded = expandedCapabilityId === cap.id;
                return (
                  <div key={cap.id}>
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedCapabilityId(isExpanded ? null : cap.id)
                      }
                      data-magnetic
                      className="w-full py-7 sm:py-10 lg:py-11 text-left group flex items-start justify-between gap-4 sm:gap-8 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-baseline gap-3 sm:gap-8 min-w-0 flex-1">
                        <span className="text-xs font-mono text-neutral-500 tabular-nums shrink-0">
                          {cap.index}
                        </span>
                        <div className="flex-1">
                          <h3 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.025em] text-white group-hover:text-neutral-300 transition-colors mb-2.5 sm:mb-3">
                            {cap.title}
                          </h3>
                          <p className="text-xs sm:text-sm font-mono text-neutral-400 max-w-4xl leading-relaxed">
                            {cap.summary}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-sm font-mono text-neutral-500 shrink-0 mt-1 sm:mt-3 transition-transform duration-300 ${
                          isExpanded
                            ? 'rotate-90 text-white'
                            : 'group-hover:translate-x-1.5 group-hover:text-white'
                        }`}
                      >
                        →
                      </span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.34, ease: EASE_OUT_EXPO }}
                          className="overflow-hidden"
                        >
                          <div className="pb-9 sm:pb-11 sm:pl-12 lg:pl-16 grid grid-cols-1 lg:grid-cols-12 gap-8 text-sm pt-2">
                            <div className="lg:col-span-5">
                              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500 mb-3">
                                CORE LANGUAGES, FRAMEWORKS & DATABASES
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {cap.primarySkills.map((skill) => (
                                  <span
                                    key={skill}
                                    className="border border-white/15 bg-white/[0.03] px-3 py-1 text-xs font-mono text-white"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="lg:col-span-7">
                              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500 mb-3">
                                APPLIED IN ({cap.appliedIn})
                              </div>
                              <ul className="space-y-2.5 text-xs sm:text-sm text-neutral-300 leading-relaxed">
                                {cap.engineeringPractices.map((practice, i) => (
                                  <li key={i} className="flex items-start gap-3">
                                    <span className="w-1.5 h-1.5 bg-white/80 mt-2 shrink-0" />
                                    <span>{practice}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Full-Window Divider */}
      <div className="w-full px-5 sm:px-8 lg:px-14 xl:px-20">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/12 to-transparent" />
      </div>

      {/* =====================================================================
          SECTION 3A: STICKY SCROLL-PINNED SEQUENTIAL PROJECT SHOWCASE (01 -> 04)
          Pins viewport during manual scroll to cycle 01 -> 02 -> 03 -> 04, then
          releases into the Query Waterfall below. Bypasses pin on header clicks!
      ===================================================================== */}
      <section id="instrument" className="relative w-full">
        <div
          ref={projectTrackRef}
          className="relative w-full h-[320vh] sm:h-[350vh] lg:h-[370vh]"
        >
          <div className="sticky top-14 w-full min-h-[calc(100vh-3.5rem)] flex flex-col justify-between py-6 sm:py-10 lg:py-12 overflow-hidden bg-black/95">
            {/* Top Bar Inside Pinned Stage: Project Tabs + Sequential Progress Bar */}
            <div className="w-full px-5 sm:px-8 lg:px-14 xl:px-20">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/[0.09]">
                {/* Horizontal Scrollable Pills on Mobile / Full Tabs on Tablet & Desktop */}
                <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar pb-1 md:pb-0">
                  <span className="w-2 h-2 bg-white inline-block mr-1 shrink-0" />
                  {FLAGSHIP_PROJECTS.map((proj, idx) => {
                    const isActive = idx === activeProjectIndex;
                    return (
                      <button
                        type="button"
                        key={proj.id}
                        onClick={() => handleSelectProject(proj.id, 'track')}
                        data-magnetic
                        className={`px-3.5 sm:px-4 py-2 text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.16em] border transition-all duration-200 whitespace-nowrap shrink-0 ${
                          isActive
                            ? 'border-white bg-white text-black font-bold shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                            : 'border-white/15 bg-transparent text-neutral-400 hover:text-white hover:border-white/40'
                        }`}
                      >
                        {proj.numeral} · {proj.titleWhite}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between md:justify-end gap-5">
                  <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-neutral-500">
                    PROJECT {activeProjectIndex + 1} OF {FLAGSHIP_PROJECTS.length} · SCROLL TO CYCLE
                  </span>
                  <button
                    type="button"
                    onClick={() => setCaseStudyProject(activeProject)}
                    data-magnetic
                    className="text-xs font-mono uppercase tracking-[0.18em] text-white hover:underline whitespace-nowrap shrink-0"
                  >
                    CASE STUDY & SCHEMA →
                  </button>
                </div>
              </div>

              {/* Continuous Scroll-Linked Progress Rail (01 -> 02 -> 03 -> 04) */}
              <div className="w-full h-[2px] bg-white/[0.07] relative overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-neutral-400 via-white to-white"
                  style={{
                    width: `${Math.max(
                      12,
                      Math.min(100, ((activeProjectIndex + 1) / FLAGSHIP_PROJECTS.length) * 100)
                    )}%`,
                  }}
                  transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
                />
              </div>
            </div>

            {/* Center Stage: Bespoke Mobile / Tablet / Full-Width Desktop Project Presentation */}
            <div className="w-full px-5 sm:px-8 lg:px-14 xl:px-20 my-auto py-4 sm:py-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeProject.id}
                  initial={{ opacity: 0, y: 26, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -22, filter: 'blur(4px)' }}
                  transition={{ duration: 0.42, ease: EASE_OUT_EXPO }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-center"
                >
                  {/* Left 8 Columns: Kicker, Title, Summary, Metrics, Tech Stack & Actions */}
                  <div className="lg:col-span-8">
                    <div className="flex flex-wrap items-center gap-3 mb-3 sm:mb-4">
                      {/* Mobile/Tablet Compact Numeral Pill */}
                      <span className="lg:hidden px-2.5 py-0.5 bg-white text-black font-mono font-bold text-xs">
                        {activeProject.numeral}
                      </span>
                      <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.2em] text-neutral-400">
                        {activeProject.kicker}
                      </span>
                    </div>

                    <h2 className="text-3xl sm:text-5xl lg:text-6xl xl:text-[72px] font-bold tracking-[-0.035em] leading-[1.02] mb-4 sm:mb-6">
                      <span className="text-white">{activeProject.titleWhite} </span>
                      <span className="text-[#8E9299] block sm:inline">
                        {activeProject.titleMuted}
                      </span>
                    </h2>

                    <p className="text-sm sm:text-lg lg:text-xl text-neutral-200 leading-relaxed max-w-4xl mb-6">
                      {activeProject.summary}
                    </p>

                    {/* 3-Column Project Key Metrics Strip */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 border border-white/10 bg-white/[0.015] mb-6 max-w-4xl">
                      {activeProject.metrics.map((m) => (
                        <div
                          key={m.label}
                          className="px-4 py-3 border-b sm:border-b-0 sm:border-r last:border-r-0 border-white/10"
                        >
                          <div className="text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.18em] text-neutral-500 mb-0.5">
                            {m.label}
                          </div>
                          <div className="text-xs sm:text-sm font-bold text-white truncate">
                            {m.value}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Tech Stack Pills */}
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-6 sm:mb-8 max-w-4xl">
                      {activeProject.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="border border-white/12 bg-white/[0.025] px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-mono text-neutral-200"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
                      <button
                        type="button"
                        onClick={() => setCaseStudyProject(activeProject)}
                        data-magnetic
                        className="px-6 py-3 bg-white text-black text-xs font-mono font-bold uppercase tracking-[0.18em] hover:bg-neutral-200 transition-colors text-center whitespace-nowrap shrink-0"
                      >
                        INSPECT ARCHITECTURE →
                      </button>

                      {activeProject.liveUrl && (
                        <a
                          href={activeProject.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-magnetic
                          className="px-6 py-3 border border-white/25 text-white text-xs font-mono uppercase tracking-[0.18em] hover:bg-white hover:text-black transition-colors text-center whitespace-nowrap shrink-0"
                        >
                          {activeProject.liveLabel || 'LIVE DEPLOYMENT'} ↗
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() => handleSelectProject(activeProject.id, 'waterfall')}
                        data-magnetic
                        className="px-5 py-3 border border-white/12 text-neutral-300 text-xs font-mono uppercase tracking-[0.18em] hover:border-white/35 hover:text-white transition-colors text-center whitespace-nowrap shrink-0"
                      >
                        QUERY WATERFALL ↓
                      </button>
                    </div>
                  </div>

                  {/* Right 4 Columns (Desktop): Giant Metallic Numeral + Next/Prev Controls */}
                  <div className="hidden lg:flex lg:col-span-4 flex-col items-end justify-center select-none">
                    <motion.div
                      key={`num-${activeProject.numeral}`}
                      initial={{ opacity: 0, scale: 0.92, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
                      className="text-[190px] xl:text-[250px] font-bold tracking-[-0.06em] leading-[0.82] bg-gradient-to-b from-white via-neutral-400 to-transparent bg-clip-text text-transparent"
                    >
                      {activeProject.numeral}
                    </motion.div>

                    <div className="mt-6 flex items-center gap-3 pointer-events-auto">
                      <button
                        type="button"
                        disabled={activeProjectIndex === 0}
                        onClick={() => {
                          const prevProj = FLAGSHIP_PROJECTS[Math.max(0, activeProjectIndex - 1)];
                          if (prevProj) handleSelectProject(prevProj.id, 'track');
                        }}
                        className="px-3.5 py-1.5 border border-white/15 text-[11px] font-mono uppercase tracking-[0.16em] text-neutral-300 hover:text-white hover:border-white/40 disabled:opacity-30 transition-all"
                      >
                        ← PREV
                      </button>
                      <button
                        type="button"
                        disabled={activeProjectIndex === FLAGSHIP_PROJECTS.length - 1}
                        onClick={() => {
                          const nextProj =
                            FLAGSHIP_PROJECTS[
                              Math.min(FLAGSHIP_PROJECTS.length - 1, activeProjectIndex + 1)
                            ];
                          if (nextProj) handleSelectProject(nextProj.id, 'track');
                        }}
                        className="px-3.5 py-1.5 border border-white/15 text-[11px] font-mono uppercase tracking-[0.16em] text-neutral-300 hover:text-white hover:border-white/40 disabled:opacity-30 transition-all"
                      >
                        NEXT →
                      </button>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Full-Bleed Stippled Wave Horizon at Bottom of Pinned Stage */}
            <div className="relative w-full">
              <ParticleWaveHorizon className="h-[110px] sm:h-[145px]" />
              <div className="hidden md:block absolute left-[12%] top-1/2 -translate-y-1/2">
                <ParticleEllipsoid width={220} height={110} glowIntensity={0.16} />
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================================
            SECTION 3B: THE INSTRUMENT — LIVE ROUTE & QUERY WATERFALL
            (Bespoke Mobile Cards on <640px | Full-Width Table on Tablet/Desktop)
        ===================================================================== */}
        <div
          id="waterfall"
          className="w-full px-5 sm:px-8 lg:px-14 xl:px-20 pt-12 pb-24 sm:pb-32 relative z-10"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="border border-white/15 bg-black/90 px-3.5 py-1.5 text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.2em] text-neutral-200">
              THE INSTRUMENT — LIVE ROUTE & QUERY WATERFALL ({activeProject.titleWhite.toUpperCase()})
            </div>

            <div className="flex items-center gap-2.5">
              {FLAGSHIP_PROJECTS.map((proj, idx) => (
                <button
                  key={proj.id}
                  type="button"
                  onClick={() => {
                    setActiveProjectIndex(idx);
                    setSelectedRouteIndex(0);
                    setTraceKey((k) => k + 1);
                  }}
                  className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.14em] border transition-colors ${
                    idx === activeProjectIndex
                      ? 'border-white bg-white text-black font-bold'
                      : 'border-white/15 text-neutral-400 hover:text-white'
                  }`}
                >
                  {proj.numeral}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setTraceKey((k) => k + 1)}
                data-magnetic
                className="border border-white/15 bg-black/90 hover:border-white/40 px-3.5 py-1 text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.2em] text-neutral-300 hover:text-white transition-colors whitespace-nowrap shrink-0"
              >
                ↻ RE-RUN TRACE
              </button>
            </div>
          </div>

          <div
            key={`${activeProject.id}-${traceKey}`}
            className="border border-white/15 bg-[#050505]/95 p-5 sm:p-8 lg:p-10"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 pb-5 mb-6 border-b border-white/[0.09] text-[11px] font-mono text-neutral-400">
              <span className="uppercase tracking-[0.18em] text-neutral-200">
                CRAWL — {activeProject.titleWhite.toUpperCase()} {activeProject.titleMuted.toUpperCase()} ROUTE MAP
              </span>
              <span className="tracking-[0.14em] text-neutral-500">
                tap or click any route to inspect sql / execution logic · status 200
              </span>
            </div>

            {/* Desktop & Tablet Waterfall Rows (>= 640px) */}
            <div className="hidden sm:block space-y-3.5 font-mono text-xs">
              {activeProject.waterfallRoutes.map((route, idx) => {
                const isSelected = idx === selectedRouteIndex;
                return (
                  <button
                    type="button"
                    key={`${route.path}-${traceKey}`}
                    onClick={() => setSelectedRouteIndex(idx)}
                    data-magnetic
                    className={`w-full text-left grid grid-cols-12 items-center gap-4 py-2 px-3 -mx-3 transition-colors ${
                      isSelected ? 'bg-white/[0.07]' : 'hover:bg-white/[0.03]'
                    }`}
                  >
                    <div
                      className="col-span-4 truncate flex items-center gap-2.5"
                      style={{ paddingLeft: `${route.indent * 16}px` }}
                    >
                      <span className="text-[10px] px-1.5 py-0.5 bg-white/[0.06] text-neutral-300 w-12 text-center shrink-0">
                        {route.method}
                      </span>
                      <span
                        className={`truncate ${
                          isSelected ? 'text-white font-bold' : 'text-neutral-300'
                        }`}
                      >
                        {route.path}
                      </span>
                    </div>

                    {/* Loading Bar Track */}
                    <div className="col-span-7 h-3 bg-white/[0.05] relative overflow-hidden rounded-[1px]">
                      <motion.div
                        initial={{ left: '0%', width: '0%', opacity: 0.35 }}
                        whileInView={{
                          left: `${route.startPct}%`,
                          width: `${route.widthPct}%`,
                          opacity: 1,
                        }}
                        viewport={{ once: false, amount: 0.2 }}
                        transition={{
                          duration: 0.9,
                          delay: idx * 0.07,
                          ease: EASE_OUT_EXPO,
                        }}
                        className="absolute top-0 bottom-0 bg-gradient-to-r from-neutral-500 via-neutral-200 to-white overflow-hidden"
                      >
                        <motion.div
                          initial={{ x: '-100%' }}
                          whileInView={{ x: '200%' }}
                          viewport={{ once: false, amount: 0.2 }}
                          transition={{
                            duration: 1.0,
                            delay: idx * 0.07 + 0.12,
                            ease: 'easeOut',
                          }}
                          className="w-1/2 h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-80"
                        />
                      </motion.div>
                    </div>

                    <div className="col-span-1 flex items-center justify-end gap-2.5 tabular-nums">
                      <span className="text-[11px] text-neutral-400">
                        {route.latencyMs}ms
                      </span>
                      <span className="text-[#4ADE80] font-semibold">
                        {route.status}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bespoke Mobile Waterfall Cards (< 640px) */}
            <div className="sm:hidden space-y-3 font-mono text-xs">
              {activeProject.waterfallRoutes.map((route, idx) => {
                const isSelected = idx === selectedRouteIndex;
                return (
                  <button
                    type="button"
                    key={`mob-${route.path}-${traceKey}`}
                    onClick={() => setSelectedRouteIndex(idx)}
                    className={`w-full text-left p-3.5 border transition-colors ${
                      isSelected
                        ? 'border-white/40 bg-white/[0.06]'
                        : 'border-white/10 bg-white/[0.015]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[10px] px-1.5 py-0.5 bg-white/10 text-white shrink-0">
                          {route.method}
                        </span>
                        <span className="text-white font-bold truncate">
                          {route.path}
                        </span>
                      </div>
                      <span className="text-[11px] text-neutral-400 shrink-0 tabular-nums">
                        {route.latencyMs}ms ·{' '}
                        <span className="text-[#4ADE80]">{route.status}</span>
                      </span>
                    </div>

                    <div className="w-full h-2 bg-white/[0.06] relative overflow-hidden mb-2">
                      <motion.div
                        initial={{ left: '0%', width: '0%' }}
                        whileInView={{
                          left: `${route.startPct}%`,
                          width: `${route.widthPct}%`,
                        }}
                        viewport={{ once: false, amount: 0.2 }}
                        transition={{
                          duration: 0.85,
                          delay: idx * 0.06,
                          ease: EASE_OUT_EXPO,
                        }}
                        className="absolute inset-y-0 bg-gradient-to-r from-neutral-400 to-white"
                      />
                    </div>

                    <p className="text-[11px] font-sans text-neutral-400 line-clamp-1">
                      {route.description}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Selected Route SQL / Execution Inspector */}
            {activeRoute && (
              <motion.div
                key={activeRoute.path}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, ease: EASE_OUT_EXPO }}
                className="mt-7 pt-6 border-t border-white/[0.09] grid grid-cols-1 lg:grid-cols-12 gap-6"
              >
                <div className="lg:col-span-5">
                  <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500 mb-1">
                    SELECTED ENDPOINT ({activeRoute.method} · {activeRoute.latencyMs}ms)
                  </div>
                  <div className="text-sm sm:text-base font-mono text-white font-semibold mb-1.5 break-all">
                    {activeRoute.path}
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                    {activeRoute.description}
                  </p>
                </div>
                <div className="lg:col-span-7">
                  <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500 mb-1.5">
                    EXECUTION / SQL POLICY
                  </div>
                  <pre className="text-xs font-mono text-neutral-200 bg-black border border-white/[0.09] p-4 overflow-x-auto whitespace-pre-wrap">
                    {activeRoute.sqlOrLogic}
                  </pre>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Full-Window Divider */}
      <div className="w-full px-5 sm:px-8 lg:px-14 xl:px-20">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/12 to-transparent" />
      </div>

      {/* =====================================================================
          SECTION 4: REDESIGNED WORK MANIFEST & EXPERIENCE
          (4-Pillar Achievements Bento Grid + Full-Width 12-Col Experience Ledger)
      ===================================================================== */}
      <section id="experience" className="relative w-full py-20 sm:py-28 lg:py-32">
        <div className="w-full px-5 sm:px-8 lg:px-14 xl:px-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.65, ease: EASE_OUT_EXPO }}
          >
            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-2 h-2 bg-white inline-block shrink-0" />
                  <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-neutral-400">
                    THE WORK — MANIFEST & EXPERIENCE
                  </span>
                </div>
                <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.03em] leading-[1.06] text-white">
                  Production client systems, internships &{' '}
                  <span className="text-[#8E9299]">national finals.</span>
                </h2>
              </div>

              <div className="text-xs font-mono uppercase tracking-[0.18em] text-neutral-400">
                5 VERIFIED ENGAGEMENTS · BENGALURU, INDIA
              </div>
            </div>

            {/* Top 4-Card Achievements & Leadership Bento Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 border border-white/[0.09] bg-white/[0.01] mb-16 sm:mb-20">
              {ACHIEVEMENT_PILLARS.map((pillar, idx) => (
                <motion.div
                  key={pillar.index}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.5,
                    delay: idx * 0.06,
                    ease: EASE_OUT_EXPO,
                  }}
                  className="p-6 sm:p-7 lg:p-8 border-b sm:border-b xl:border-b-0 sm:odd:border-r xl:border-r last:border-r-0 last:border-b-0 border-white/[0.09] hover:bg-white/[0.025] transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500 mb-4">
                      <span>{pillar.index} · {pillar.tag}</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
                      {pillar.metric}
                    </div>
                    <div className="text-xs font-mono text-neutral-300 mb-3">
                      {pillar.title}
                    </div>
                  </div>
                  <p className="text-xs sm:text-[13px] text-neutral-400 leading-relaxed">
                    {pillar.detail}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Full-Width 12-Column Architectural Experience Ledger */}
            <div className="border-t border-white/[0.1] divide-y divide-white/[0.09]">
              {WORK_MANIFEST.map((item, idx) => {
                const linkedProject = item.projectIdToInspect
                  ? FLAGSHIP_PROJECTS.find((p) => p.id === item.projectIdToInspect)
                  : undefined;

                return (
                  <motion.div
                    key={item.code}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{
                      duration: 0.55,
                      delay: idx * 0.05,
                      ease: EASE_OUT_EXPO,
                    }}
                    className="py-8 sm:py-11 lg:py-12 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start hover:bg-white/[0.015] transition-colors px-2 sm:px-4 -mx-2 sm:-mx-4"
                  >
                    {/* Cols 1–3: Index Code, Category Pill & Role/Period */}
                    <div className="lg:col-span-3 flex flex-col gap-2">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-mono font-bold text-white px-2.5 py-0.5 border border-white/20 bg-white/[0.04]">
                          {item.code}
                        </span>
                        <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-neutral-300">
                          {item.category}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-neutral-500 mt-1">
                        {item.roleAndPeriod}
                      </div>
                    </div>

                    {/* Cols 4–8: Title, Executive Description & Impact Highlights */}
                    <div className="lg:col-span-6">
                      <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white mb-3">
                        {item.title}
                      </h3>
                      <p className="text-sm sm:text-base text-neutral-300 leading-relaxed mb-4">
                        {item.description}
                      </p>
                      <ul className="space-y-2">
                        {item.highlights.map((hl, i) => (
                          <li
                            key={i}
                            className="text-xs sm:text-sm text-neutral-400 leading-relaxed flex items-start gap-3"
                          >
                            <span className="w-1.5 h-1.5 bg-white/70 mt-2 shrink-0" />
                            <span>{hl}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Cols 9–12: Tech Stack Pills & Interactive Actions */}
                    <div className="lg:col-span-3 flex flex-col justify-between h-full gap-5">
                      <div>
                        <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-neutral-500 mb-2.5">
                          STACK & TOOLS
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {item.stack.map((tech) => (
                            <span
                              key={tech}
                              className="border border-white/12 bg-white/[0.025] px-2.5 py-1 text-[11px] font-mono text-neutral-200"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>

                      {linkedProject && (
                        <div className="flex flex-wrap items-center gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => setCaseStudyProject(linkedProject)}
                            data-magnetic
                            className="px-4 py-2 bg-white text-black text-[11px] font-mono font-bold uppercase tracking-[0.16em] hover:bg-neutral-200 transition-colors whitespace-nowrap shrink-0"
                          >
                            CASE STUDY →
                          </button>

                          {linkedProject.liveUrl && (
                            <a
                              href={linkedProject.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              data-magnetic
                              className="px-4 py-2 border border-white/20 text-white text-[11px] font-mono uppercase tracking-[0.16em] hover:bg-white hover:text-black transition-colors whitespace-nowrap shrink-0"
                            >
                              {linkedProject.liveLabel || 'LIVE'} ↗
                            </a>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              handleSelectProject(linkedProject.id, 'waterfall')
                            }
                            data-magnetic
                            className="text-[11px] font-mono uppercase tracking-[0.16em] text-neutral-400 hover:text-white transition-colors whitespace-nowrap shrink-0"
                          >
                            WATERFALL →
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Full-Window Divider */}
      <div className="w-full px-5 sm:px-8 lg:px-14 xl:px-20">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/12 to-transparent" />
      </div>

      {/* =====================================================================
          SECTION 5: VERIFY LINKS & FIELD NOTES (Full Window Width)
      ===================================================================== */}
      <section id="notes" className="relative w-full py-20 sm:py-28 lg:py-32">
        <div className="w-full px-5 sm:px-8 lg:px-14 xl:px-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.65, ease: EASE_OUT_EXPO }}
          >
            {/* Full-Width Verification Table */}
            <div className="border border-white/15 bg-[#050505] mb-20">
              <div className="px-5 sm:px-8 py-4 border-b border-white/[0.09] text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.22em] text-neutral-400">
                VERIFY: LIVE DEPLOYMENTS, SOURCE REPOSITORIES & PROFESSIONAL NETWORK
              </div>

              <a
                href={PROFILE_DATA.github}
                target="_blank"
                rel="noopener noreferrer"
                data-magnetic
                className="w-full px-5 sm:px-8 py-5 border-b border-white/[0.09] flex items-center justify-between gap-4 hover:bg-white/[0.025] transition-colors text-left group"
              >
                <div className="flex flex-wrap items-baseline gap-4 sm:gap-8">
                  <span className="text-xs font-mono text-neutral-500">01</span>
                  <span className="text-base sm:text-lg font-bold text-white">
                    github · @itzsaheem
                  </span>
                  <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-neutral-400">
                    REPOSITORIES, COMMITS & CI/CD WORKFLOWS
                  </span>
                </div>
                <span className="text-xs font-mono text-neutral-400 group-hover:translate-x-1.5 transition-transform">
                  ↗
                </span>
              </a>

              <a
                href={PROFILE_DATA.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                data-magnetic
                className="w-full px-5 sm:px-8 py-5 border-b border-white/[0.09] flex items-center justify-between gap-4 hover:bg-white/[0.025] transition-colors text-left group"
              >
                <div className="flex flex-wrap items-baseline gap-4 sm:gap-8">
                  <span className="text-xs font-mono text-neutral-500">02</span>
                  <span className="text-base sm:text-lg font-bold text-white">
                    linkedin · s-mohammed-saheem
                  </span>
                  <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-neutral-400">
                    SIH 2025 GRAND FINALIST & PROFESSIONAL NETWORK
                  </span>
                </div>
                <span className="text-xs font-mono text-neutral-400 group-hover:translate-x-1.5 transition-transform">
                  ↗
                </span>
              </a>

              <a
                href="https://clinic-management-system-two-opal.vercel.app/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                data-magnetic
                className="w-full px-5 sm:px-8 py-5 border-b border-white/[0.09] flex items-center justify-between gap-4 hover:bg-white/[0.025] transition-colors text-left group"
              >
                <div className="flex flex-wrap items-baseline gap-4 sm:gap-8">
                  <span className="text-xs font-mono text-neutral-500">03</span>
                  <span className="text-base sm:text-lg font-bold text-white">
                    cms · live clinical dashboard
                  </span>
                  <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-neutral-400">
                    MULTI-BRANCH CLINIC MANAGEMENT SYSTEM (PRODUCTION)
                  </span>
                </div>
                <span className="text-xs font-mono text-neutral-400 group-hover:translate-x-1.5 transition-transform">
                  ↗
                </span>
              </a>

              <a
                href="https://botronot.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                data-magnetic
                className="w-full px-5 sm:px-8 py-5 flex items-center justify-between gap-4 hover:bg-white/[0.025] transition-colors text-left group"
              >
                <div className="flex flex-wrap items-baseline gap-4 sm:gap-8">
                  <span className="text-xs font-mono text-neutral-500">04</span>
                  <span className="text-base sm:text-lg font-bold text-white">
                    bot or not · live turing arena
                  </span>
                  <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-neutral-400">
                    REAL-TIME MULTIPLAYER & AI TURING GAME (PRODUCTION)
                  </span>
                </div>
                <span className="text-xs font-mono text-neutral-400 group-hover:translate-x-1.5 transition-transform">
                  ↗
                </span>
              </a>
            </div>

            {/* FIELD NOTES */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
              <div className="flex items-center gap-3 text-[11px] font-mono uppercase tracking-[0.22em] text-neutral-400">
                <span className="w-2 h-2 bg-white inline-block shrink-0" />
                <span>FIELD NOTES — ARCHITECTURE LOGS</span>
              </div>
              <div className="hidden sm:block">
                <ParticleEllipsoid width={230} height={115} glowIntensity={0.15} />
              </div>
            </div>

            <div className="divide-y divide-white/[0.09] border-y border-white/[0.09]">
              {FIELD_NOTES.map((note) => (
                <button
                  type="button"
                  key={note.id}
                  onClick={() => setActiveFieldNote(note)}
                  data-magnetic
                  className="w-full py-6 sm:py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left group hover:bg-white/[0.02] transition-colors px-3 -mx-3"
                >
                  <div className="flex items-start sm:items-center gap-4 sm:gap-6 min-w-0">
                    <span className="border border-white/15 px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-[0.18em] text-neutral-400 shrink-0">
                      NOTE
                    </span>
                    <span className="text-base sm:text-2xl font-bold tracking-tight text-white group-hover:text-neutral-300 transition-colors">
                      {note.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono text-neutral-500 shrink-0 self-end sm:self-center">
                    <span className="tabular-nums">{note.date}</span>
                    <span className="group-hover:translate-x-1.5 group-hover:text-white transition-all">
                      →
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Full-Window Divider */}
      <div className="w-full px-5 sm:px-8 lg:px-14 xl:px-20">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/12 to-transparent" />
      </div>

      {/* =====================================================================
          SECTION 6: FULL-WINDOW CONTACT FOOTER
      ===================================================================== */}
      <footer id="contact" className="w-full py-20 sm:py-28">
        <div className="w-full px-5 sm:px-8 lg:px-14 xl:px-20">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 pb-16">
            <div>
              <div className="flex items-center gap-3 text-[11px] font-mono uppercase tracking-[0.22em] text-neutral-400 mb-4">
                <span className="w-2 h-2 bg-white inline-block shrink-0" />
                <span>DIRECT CHANNEL · CONTACT</span>
              </div>
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-4 text-balance">
                Ready to ship production full-stack systems.
              </h2>
              <p className="text-sm sm:text-base text-neutral-400 max-w-2xl leading-relaxed mb-4">
                {PROFILE_DATA.location} · {PROFILE_DATA.degree}
              </p>
              <div className="flex flex-wrap items-center gap-4 sm:gap-5 text-xs sm:text-sm font-mono text-neutral-300">
                <a
                  href={`mailto:${PROFILE_DATA.email}`}
                  className="hover:text-white underline decoration-white/30 underline-offset-4"
                >
                  {PROFILE_DATA.email}
                </a>
                <span className="text-neutral-600">·</span>
                <a
                  href={PROFILE_DATA.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white underline decoration-white/30 underline-offset-4"
                >
                  {PROFILE_DATA.githubHandle}
                </a>
                <span className="text-neutral-600">·</span>
                <a
                  href={PROFILE_DATA.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white underline decoration-white/30 underline-offset-4"
                >
                  {PROFILE_DATA.linkedinHandle}
                </a>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <a
                href={`mailto:${PROFILE_DATA.email}`}
                data-magnetic
                className="px-6 py-3.5 bg-white text-black text-xs font-mono font-bold uppercase tracking-[0.18em] hover:bg-neutral-200 transition-colors text-center whitespace-nowrap shrink-0"
              >
                {PROFILE_DATA.email} →
              </a>
              <button
                type="button"
                onClick={handleCopyEmail}
                data-magnetic
                className="px-5 py-3.5 border border-white/20 text-xs font-mono uppercase tracking-[0.18em] text-neutral-300 hover:border-white/50 hover:text-white transition-colors text-center whitespace-nowrap shrink-0"
              >
                {copiedEmail ? 'COPIED ✓' : 'COPY EMAIL'}
              </button>
            </div>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/12 to-transparent mb-8" />

          <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-neutral-500">
            <span>© {new Date().getFullYear()} S MOHAMMED SAHEEM</span>
            <div className="flex items-center gap-6">
              <a
                href={PROFILE_DATA.github}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                GITHUB
              </a>
              <a
                href={PROFILE_DATA.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                LINKEDIN
              </a>
              <button
                type="button"
                onClick={() => {
                  triggerProgrammaticBypass(1100);
                  if (onNavigateWithTransition) {
                    onNavigateWithTransition('top', 'S MOHAMMED SAHEEM');
                  } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                data-magnetic
                className="hover:text-white transition-colors"
              >
                TOP ↑
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* =====================================================================
          CASE STUDY DRAWER (Bottom Sheet on Mobile, Side Drawer on Desktop)
          Scroll-Isolated from Background Page
      ===================================================================== */}
      <AnimatePresence>
        {caseStudyProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-stretch justify-end p-0 sm:p-4 overflow-hidden overscroll-contain"
            onClick={() => setCaseStudyProject(null)}
            onWheel={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ x: 60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 60, opacity: 0 }}
              transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
              className="w-full max-w-4xl bg-[#070707] border-t sm:border border-white/15 h-[92vh] sm:h-full overflow-y-auto overscroll-contain p-5 sm:p-10 flex flex-col justify-between"
              onClick={(e) => e.stopPropagation()}
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
            >
              <div>
                <div className="flex items-center justify-between gap-4 pb-5 mb-6 sm:mb-8 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-white inline-block" />
                    <span className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.2em] text-neutral-300">
                      {caseStudyProject.numeral} · COMPLETE ARCHITECTURE SPECIFICATION
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCaseStudyProject(null)}
                    className="border border-white/20 px-3 py-1 text-xs font-mono text-neutral-300 hover:text-white hover:border-white/50 transition-colors shrink-0"
                  >
                    ESC ✕
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono uppercase tracking-[0.18em] text-neutral-400 mb-3">
                  <span className="border border-white/20 bg-white/[0.04] px-2.5 py-0.5 text-white">
                    {caseStudyProject.badge}
                  </span>
                  <span>·</span>
                  <span>{caseStudyProject.role}</span>
                  <span>·</span>
                  <span>{caseStudyProject.period}</span>
                </div>

                <h3 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
                  {caseStudyProject.titleWhite}{' '}
                  <span className="text-[#8E9299]">{caseStudyProject.titleMuted}</span>
                </h3>

                <p className="text-sm sm:text-base text-neutral-300 leading-relaxed mb-6">
                  {caseStudyProject.summary}
                </p>

                <div className="mb-8">
                  <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500 mb-2.5">
                    TECHNOLOGY STACK & TOOLS
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {caseStudyProject.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="border border-white/12 bg-white/[0.03] px-3 py-1 text-xs font-mono text-neutral-200"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 border border-white/10 bg-black/60 mb-10">
                  {caseStudyProject.metrics.map((m) => (
                    <div
                      key={m.label}
                      className="p-4 border-b sm:border-b-0 sm:border-r last:border-r-0 border-white/10"
                    >
                      <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-neutral-500 mb-1">
                        {m.label}
                      </div>
                      <div className="text-sm font-bold text-white">{m.value}</div>
                    </div>
                  ))}
                </div>

                <div className="space-y-10 text-sm text-neutral-300 leading-relaxed">
                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-[0.2em] text-white mb-2.5">
                      01 · PROBLEM & OPERATIONAL CONTEXT
                    </h4>
                    <p className="text-neutral-300 leading-relaxed">{caseStudyProject.problem}</p>
                  </div>

                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-[0.2em] text-white mb-2.5">
                      02 · SYSTEM ARCHITECTURE & END-TO-END LAYERS
                    </h4>
                    <p className="text-neutral-300 leading-relaxed mb-5">
                      {caseStudyProject.architecture}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {caseStudyProject.architectureLayers.map((layer) => (
                        <div
                          key={layer.layer}
                          className="border border-white/10 bg-black/50 p-4"
                        >
                          <div className="text-xs font-bold text-white mb-1">
                            {layer.layer}
                          </div>
                          <div className="text-[11px] font-mono text-neutral-400 mb-2">
                            {layer.tech}
                          </div>
                          <p className="text-xs text-neutral-300 leading-relaxed">
                            {layer.details}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-[0.2em] text-white mb-3">
                      03 · KEY MODULES & FEATURES ENGINEERED
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {caseStudyProject.keyFeatures.map((feat) => (
                        <div
                          key={feat.title}
                          className="border border-white/10 bg-white/[0.015] p-4"
                        >
                          <div className="text-xs font-bold text-white mb-1.5">
                            {feat.title}
                          </div>
                          <p className="text-xs text-neutral-300 leading-relaxed">
                            {feat.detail}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-[0.2em] text-white mb-2.5">
                      04 · {caseStudyProject.schemaOrCodeTitle}
                    </h4>
                    <pre className="text-xs font-mono text-neutral-200 bg-black border border-white/10 p-4 overflow-x-auto leading-relaxed">
                      {caseStudyProject.schemaOrCodeSnippet}
                    </pre>
                  </div>

                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-[0.2em] text-white mb-3">
                      05 · ROUTE & QUERY WATERFALL SPECIFICATION
                    </h4>
                    <div className="border border-white/10 bg-black divide-y divide-white/[0.08]">
                      {caseStudyProject.waterfallRoutes.map((rt) => (
                        <div key={rt.path} className="p-3.5 text-xs">
                          <div className="flex flex-wrap items-center justify-between gap-2 font-mono mb-1">
                            <div className="flex items-center gap-2.5">
                              <span className="text-[10px] px-1.5 py-0.5 bg-white/10 text-white">
                                {rt.method}
                              </span>
                              <span className="text-white font-semibold">{rt.path}</span>
                            </div>
                            <span className="text-neutral-400">
                              {rt.latencyMs}ms · <span className="text-[#4ADE80]">{rt.status}</span>
                            </span>
                          </div>
                          <div className="text-neutral-300 mb-1">{rt.description}</div>
                          <div className="font-mono text-[11px] text-neutral-500">
                            {rt.sqlOrLogic}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-[0.2em] text-white mb-2.5">
                      06 · ENGINEERING IMPACT & PRODUCTION OUTCOMES
                    </h4>
                    <ul className="space-y-2.5">
                      {caseStudyProject.impact.map((pt, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <span className="w-1.5 h-1.5 bg-white mt-2 shrink-0" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                <div>
                  {caseStudyProject.liveUrl && (
                    <a
                      href={caseStudyProject.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-5 py-2.5 bg-white text-black text-xs font-mono font-bold uppercase tracking-[0.18em] hover:bg-neutral-200 transition-colors"
                    >
                      {caseStudyProject.liveLabel || 'LIVE DEPLOYMENT'} ↗
                    </a>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setCaseStudyProject(null)}
                  className="px-5 py-2.5 border border-white/20 text-xs font-mono uppercase tracking-[0.18em] text-neutral-300 hover:text-white hover:border-white/50 transition-colors"
                >
                  CLOSE SPECIFICATION
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {activeFieldNote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overscroll-contain"
            onClick={() => setActiveFieldNote(null)}
            onWheel={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.28, ease: EASE_OUT_EXPO }}
              className="w-full max-w-2xl bg-[#070707] border border-white/15 max-h-[85vh] overflow-y-auto overscroll-contain p-6 sm:p-10"
              onClick={(e) => e.stopPropagation()}
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-4 pb-5 mb-6 border-b border-white/10">
                <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-neutral-400">
                  {activeFieldNote.topic} · {activeFieldNote.date}
                </div>
                <button
                  type="button"
                  onClick={() => setActiveFieldNote(null)}
                  className="border border-white/20 px-3 py-1 text-xs font-mono text-neutral-300 hover:text-white"
                >
                  ESC ✕
                </button>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-4">
                {activeFieldNote.title}
              </h3>

              <p className="text-sm text-neutral-400 leading-relaxed mb-6 pb-6 border-b border-white/10">
                {activeFieldNote.summary}
              </p>

              <div className="space-y-6">
                {activeFieldNote.sections.map((sec, idx) => (
                  <div key={idx}>
                    <h4 className="text-sm font-bold text-white mb-2">{sec.heading}</h4>
                    <p className="text-sm text-neutral-300 leading-relaxed mb-3">{sec.body}</p>
                    {sec.codeSnippet && (
                      <pre className="text-xs font-mono text-neutral-200 bg-black border border-white/10 p-4 overflow-x-auto">
                        {sec.codeSnippet}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {isCommandOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-20 sm:pt-24 p-4 overscroll-contain"
            onClick={() => setIsCommandOpen(false)}
            onWheel={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ y: -16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ duration: 0.24, ease: EASE_OUT_EXPO }}
              className="w-full max-w-xl bg-[#070707] border border-white/20 shadow-2xl overflow-hidden overscroll-contain"
              onClick={(e) => e.stopPropagation()}
              onWheel={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between gap-3">
                <input
                  type="text"
                  autoFocus
                  value={commandQuery}
                  onChange={(e) => setCommandQuery(e.target.value)}
                  placeholder="Jump to project, stack layer, CMS, or contact..."
                  className="w-full bg-transparent text-sm font-mono text-white placeholder-neutral-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setIsCommandOpen(false)}
                  className="text-[10px] font-mono text-neutral-500 border border-white/15 px-2 py-0.5"
                >
                  ESC
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-white/5 font-mono text-xs">
                {FLAGSHIP_PROJECTS.filter((p) =>
                  `${p.titleWhite} ${p.titleMuted} ${p.techStack.join(' ')}`
                    .toLowerCase()
                    .includes(commandQuery.toLowerCase())
                ).map((proj) => (
                  <button
                    type="button"
                    key={proj.id}
                    onClick={() => {
                      handleSelectProject(proj.id, 'track');
                      setIsCommandOpen(false);
                    }}
                    className="w-full px-5 py-3.5 text-left hover:bg-white/[0.04] flex items-center justify-between text-neutral-300 hover:text-white"
                  >
                    <span>
                      <strong className="text-white">{proj.numeral}</strong> · {proj.titleWhite}{' '}
                      {proj.titleMuted}
                    </span>
                    <span className="text-neutral-500">INSPECT →</span>
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    setIsCommandOpen(false);
                    scrollToSection('contact');
                  }}
                  className="w-full px-5 py-3.5 text-left hover:bg-white/[0.04] flex items-center justify-between text-neutral-300 hover:text-white"
                >
                  <span>Direct Channel — Contact Details</span>
                  <span className="text-neutral-500">SCROLL TO FOOTER →</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
