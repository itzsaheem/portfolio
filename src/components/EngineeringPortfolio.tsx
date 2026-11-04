import React, { useState, useEffect } from 'react';
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

export function EngineeringPortfolio({ onNavigateWithTransition }: EngineeringPortfolioProps) {
  const [activeProjectId, setActiveProjectId] = useState<string>(FLAGSHIP_PROJECTS[0].id);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number>(0);
  const [traceKey, setTraceKey] = useState<number>(0);
  const [expandedCapabilityId, setExpandedCapabilityId] = useState<string | null>('fullstack-web');
  const [activeDoor, setActiveDoor] = useState<number>(2);
  const [showStickyNav, setShowStickyNav] = useState<boolean>(false);

  // Modals / Drawers (No CV Modal)
  const [caseStudyProject, setCaseStudyProject] = useState<FlagshipProject | null>(null);
  const [activeFieldNote, setActiveFieldNote] = useState<FieldNote | null>(null);
  const [isCommandOpen, setIsCommandOpen] = useState<boolean>(false);
  const [commandQuery, setCommandQuery] = useState<string>('');
  const [copiedEmail, setCopiedEmail] = useState<boolean>(false);

  const activeProject =
    FLAGSHIP_PROJECTS.find((p) => p.id === activeProjectId) || FLAGSHIP_PROJECTS[0];
  const activeRoute =
    activeProject.waterfallRoutes[selectedRouteIndex] || activeProject.waterfallRoutes[0];

  const isAnyOverlayOpen = Boolean(caseStudyProject || activeFieldNote || isCommandOpen);

  // Lock background page scroll whenever the Case Study Drawer or any modal is open
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

  // Show sticky sub-header smoothly only after scrolling past the Hero section
  useEffect(() => {
    const onScroll = () => {
      const threshold = window.innerHeight * 0.72;
      const shouldShow = window.scrollY > threshold;
      setShowStickyNav((prev) => (prev !== shouldShow ? shouldShow : prev));
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
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectProject = (projectId: string, scrollToInstrument = false) => {
    setActiveProjectId(projectId);
    setSelectedRouteIndex(0);
    setTraceKey((k) => k + 1);
    if (scrollToInstrument) {
      const el = document.getElementById('instrument');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard?.writeText(PROFILE_DATA.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2200);
  };

  return (
    <div
      id="projects"
      className="relative z-20 bg-gradient-to-b from-transparent via-[#020202] to-[#000000] text-white font-sans selection:bg-white selection:text-black overflow-x-hidden"
    >
      {/* =====================================================================
          FLOATING / STICKY TOP BAR (No saheem.dev, No CV button)
      ===================================================================== */}
      <AnimatePresence>
        {showStickyNav && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.32, ease: EASE_OUT_EXPO }}
            className="fixed top-0 inset-x-0 z-40 bg-black/85 backdrop-blur-md"
          >
            <div className="max-w-[1160px] mx-auto px-6 sm:px-12 lg:px-16 h-14 flex items-center justify-between gap-6">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() =>
                    onNavigateWithTransition
                      ? onNavigateWithTransition('top', 'S MOHAMMED SAHEEM')
                      : window.scrollTo({ top: 0, behavior: 'smooth' })
                  }
                  data-magnetic
                  className="font-bold text-sm tracking-tight text-white hover:opacity-80 transition-opacity whitespace-nowrap shrink-0"
                >
                  {PROFILE_DATA.name}
                </button>
                <span className="hidden md:inline-block text-xs text-neutral-500 whitespace-nowrap truncate">
                  {PROFILE_DATA.tagline}
                </span>
              </div>

              <nav className="flex items-center gap-5 sm:gap-7 text-xs text-neutral-400">
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
                  className="hidden sm:inline-block hover:text-white transition-colors whitespace-nowrap shrink-0"
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
                  className="border border-white/15 bg-white/[0.03] hover:bg-white/10 px-2 py-0.5 text-[11px] font-mono text-neutral-300 hover:text-white transition-colors whitespace-nowrap shrink-0"
                >
                  ⌘K
                </button>
              </nav>
            </div>
            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================================
          SECTION 1: THE THESIS & THREE DOORS
      ===================================================================== */}
      <section id="thesis" className="relative w-full pt-28 sm:pt-36 pb-28">
        <div className="max-w-[1160px] mx-auto px-6 sm:px-12 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.65, ease: EASE_OUT_EXPO }}
          >
            <div className="flex items-center gap-3 text-[11px] font-mono uppercase tracking-[0.22em] text-neutral-400 mb-6">
              <span className="w-2 h-2 bg-white inline-block shrink-0" />
              <span>THE THESIS</span>
            </div>

            <h2 className="text-3xl sm:text-5xl lg:text-[52px] font-bold tracking-[-0.03em] leading-[1.08] max-w-4xl text-balance mb-14">
              Full-stack engineering from relational SQL schemas and OOP backends to live production interfaces — built as an{' '}
              <span className="text-[#8E9299]">engineering discipline</span>.
            </h2>

            {/* 3-Column Proof Strip */}
            <div className="grid grid-cols-1 md:grid-cols-3 border border-white/[0.08] bg-white/[0.01]">
              <div className="p-7 sm:p-8 border-b md:border-b-0 md:border-r border-white/[0.08]">
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500 mb-3">
                  END-TO-END OWNERSHIP
                </div>
                <p className="text-sm text-neutral-200 leading-relaxed">
                  database schema design through API logic and UI deployment — the SQL migrations, backend services, and React commits are the same hands
                </p>
              </div>

              <div className="p-7 sm:p-8 border-b md:border-b-0 md:border-r border-white/[0.08]">
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500 mb-3">
                  PRODUCTION VERIFIED
                </div>
                <p className="text-sm text-neutral-200 leading-relaxed">
                  shipped for a paying multi-branch clinic client with PostgreSQL Row-Level Security, GitHub Actions CI/CD backups, and live Vercel deployments
                </p>
              </div>

              <div className="p-7 sm:p-8">
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500 mb-3">
                  CORE CS + FULL STACK
                </div>
                <p className="text-sm text-neutral-200 leading-relaxed">
                  grounded in Data Structures & Algorithms, OOP, DBMS, and OS alongside TypeScript, React, Java, Python, MySQL, and PostgreSQL
                </p>
              </div>
            </div>
          </motion.div>

          {/* Soft Feathered Divider */}
          <div className="my-24 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* THREE DOORS */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.65, ease: EASE_OUT_EXPO }}
          >
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
              <div className="flex items-center gap-3 text-[11px] font-mono uppercase tracking-[0.22em] text-neutral-400">
                <span className="w-2 h-2 bg-white inline-block shrink-0" />
                <span>THREE DOORS</span>
              </div>
              <ParticleEllipsoid width={240} height={125} glowIntensity={0.15} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 border border-white/[0.08] bg-white/[0.01]">
              {/* Door 01 */}
              <button
                type="button"
                onClick={() => {
                  setActiveDoor(1);
                  handleSelectProject('solvyn', true);
                }}
                data-magnetic
                className={`group text-left p-8 sm:p-9 border-b md:border-b-0 md:border-r border-white/[0.08] transition-all duration-300 hover:bg-white/[0.025] ${
                  activeDoor === 1 ? 'border-t-2 border-t-white/50 bg-white/[0.02]' : ''
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono text-neutral-500 mb-6">
                  <span>01</span>
                  <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
                  The products
                </h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Solvyn (ERP & EdTech Platform), FarmAura (SIH 2025 Grand Finalist), and Bot or Not (Real-Time Turing Game).
                </p>
              </button>

              {/* Door 02 */}
              <button
                type="button"
                onClick={() => {
                  setActiveDoor(2);
                  handleSelectProject('cms', true);
                }}
                data-magnetic
                className={`group text-left p-8 sm:p-9 border-b md:border-b-0 md:border-r border-white/[0.08] transition-all duration-300 hover:bg-white/[0.025] ${
                  activeDoor === 2 ? 'border-t-2 border-t-white/50 bg-white/[0.02]' : ''
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono text-neutral-500 mb-6">
                  <span>02</span>
                  <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
                  The client build
                </h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
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
                className={`group text-left p-8 sm:p-9 transition-all duration-300 hover:bg-white/[0.025] ${
                  activeDoor === 3 ? 'border-t-2 border-t-white/50 bg-white/[0.02]' : ''
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono text-neutral-500 mb-6">
                  <span>03</span>
                  <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
                  The stack & notes
                </h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Java, Python, TypeScript, JavaScript, React, SQL (MySQL & PostgreSQL), DSA, OOP, DBMS, and architecture logs.
                </p>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Soft Feathered Section Transition */}
      <div className="max-w-[1160px] mx-auto px-6 sm:px-12 lg:px-16">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* =====================================================================
          SECTION 2: CAPABILITY INDEX (Properly Contained — No Side Clipping)
      ===================================================================== */}
      <section id="capabilities" className="relative w-full py-28 sm:py-32">
        <div className="max-w-[1160px] mx-auto px-6 sm:px-12 lg:px-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.65, ease: EASE_OUT_EXPO }}
          >
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
              <div className="flex items-center gap-3 text-[11px] font-mono uppercase tracking-[0.22em] text-neutral-400">
                <span className="w-2 h-2 bg-white inline-block shrink-0" />
                <span>CAPABILITY INDEX</span>
              </div>
              <ParticleEllipsoid width={240} height={125} glowIntensity={0.14} />
            </div>

            <div className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
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
                      className="w-full py-9 sm:py-11 text-left group flex items-start justify-between gap-6 transition-colors"
                    >
                      <div className="flex items-baseline gap-6 sm:gap-8 min-w-0">
                        <span className="text-xs font-mono text-neutral-500 tabular-nums shrink-0">
                          {cap.index}
                        </span>
                        <div>
                          <h3 className="text-2xl sm:text-4xl lg:text-[40px] font-bold tracking-[-0.025em] text-white group-hover:text-neutral-300 transition-colors mb-3">
                            {cap.title}
                          </h3>
                          <p className="text-xs sm:text-[13px] font-mono text-neutral-400 max-w-2xl leading-relaxed">
                            {cap.summary}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-sm font-mono text-neutral-500 shrink-0 mt-3 transition-transform duration-300 ${
                          isExpanded ? 'rotate-90 text-white' : 'group-hover:translate-x-1 group-hover:text-white'
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
                          transition={{ duration: 0.32, ease: EASE_OUT_EXPO }}
                          className="overflow-hidden"
                        >
                          <div className="pb-10 pl-8 sm:pl-14 pr-4 grid grid-cols-1 md:grid-cols-12 gap-8 text-sm pt-2">
                            <div className="md:col-span-5">
                              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500 mb-2.5">
                                CORE TECHNOLOGIES
                              </div>
                              <div className="text-xs font-mono text-neutral-200 leading-loose">
                                {cap.primarySkills.map((skill, idx) => (
                                  <React.Fragment key={skill}>
                                    <span className="text-white">{skill}</span>
                                    {idx < cap.primarySkills.length - 1 && (
                                      <span className="text-neutral-600 mx-2">·</span>
                                    )}
                                  </React.Fragment>
                                ))}
                              </div>
                            </div>

                            <div className="md:col-span-7">
                              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500 mb-2.5">
                                APPLIED IN ({cap.appliedIn})
                              </div>
                              <ul className="space-y-2 text-xs sm:text-[13px] text-neutral-300 leading-relaxed">
                                {cap.engineeringPractices.map((practice, i) => (
                                  <li key={i} className="flex items-start gap-3">
                                    <span className="w-1 h-1 bg-white/70 mt-2 shrink-0" />
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

      {/* Soft Feathered Section Transition */}
      <div className="max-w-[1160px] mx-auto px-6 sm:px-12 lg:px-16">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* =====================================================================
          SECTION 3: FLAGSHIP BUILDS (01–04) & LIVE WATERFALL INSTRUMENT
      ===================================================================== */}
      <section id="instrument" className="relative w-full py-28 sm:py-32">
        <div className="max-w-[1160px] mx-auto px-6 sm:px-12 lg:px-16">
          {/* Clean Project Selector Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-10 mb-12 border-b border-white/[0.08]">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="w-2 h-2 bg-white inline-block mr-2 shrink-0" />
              {FLAGSHIP_PROJECTS.map((proj) => {
                const isActive = proj.id === activeProject.id;
                return (
                  <button
                    type="button"
                    key={proj.id}
                    onClick={() => handleSelectProject(proj.id)}
                    data-magnetic
                    className={`px-4 py-2 text-[11px] font-mono uppercase tracking-[0.16em] border transition-all duration-200 whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'border-white bg-white text-black font-bold'
                        : 'border-white/15 bg-transparent text-neutral-400 hover:text-white hover:border-white/35'
                    }`}
                  >
                    {proj.numeral} · {proj.titleWhite}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setCaseStudyProject(activeProject)}
              data-magnetic
              className="text-xs font-mono uppercase tracking-[0.18em] text-neutral-300 hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              CASE STUDY & SCHEMA →
            </button>
          </div>

          {/* Animated Project Header + Properly Contained Giant Metallic Numeral */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeProject.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
            >
              <div className="lg:col-span-8">
                <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-neutral-400 mb-4">
                  {activeProject.kicker}
                </div>

                <h2 className="text-4xl sm:text-5xl lg:text-[62px] font-bold tracking-[-0.035em] leading-[1.04] mb-6">
                  <span className="text-white">{activeProject.titleWhite} </span>
                  <span className="text-[#8E9299] block sm:inline">
                    {activeProject.titleMuted}
                  </span>
                </h2>

                <p className="text-base sm:text-lg text-neutral-300 leading-relaxed max-w-2xl mb-6">
                  {activeProject.summary}
                </p>

                <div className="mb-8 text-xs font-mono text-neutral-400 leading-relaxed max-w-2xl">
                  {activeProject.techStack.map((tech, i) => (
                    <React.Fragment key={tech}>
                      <span className="text-neutral-200">{tech}</span>
                      {i < activeProject.techStack.length - 1 && (
                        <span className="text-neutral-600 mx-2">·</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setCaseStudyProject(activeProject)}
                    data-magnetic
                    className="px-5 py-2.5 bg-white text-black text-xs font-mono font-bold uppercase tracking-[0.18em] hover:bg-neutral-200 transition-colors whitespace-nowrap shrink-0"
                  >
                    INSPECT ARCHITECTURE →
                  </button>

                  {activeProject.liveUrl && (
                    <a
                      href={activeProject.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-magnetic
                      className="px-5 py-2.5 border border-white/20 text-white text-xs font-mono uppercase tracking-[0.18em] hover:bg-white hover:text-black transition-colors whitespace-nowrap shrink-0"
                    >
                      {activeProject.liveLabel || 'LIVE DEPLOYMENT'} ↗
                    </a>
                  )}
                </div>
              </div>

              {/* Giant Metallic Numeral (01, 02, 03, 04) — Contained cleanly inside the right column */}
              <div className="lg:col-span-4 flex justify-start lg:justify-end items-center select-none pointer-events-none pr-2">
                <div className="text-[120px] sm:text-[175px] lg:text-[210px] font-bold tracking-[-0.06em] leading-[0.88] bg-gradient-to-b from-neutral-200 via-neutral-500 to-transparent bg-clip-text text-transparent">
                  {activeProject.numeral}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Seamless Stippled Wave Horizon */}
        <div className="relative max-w-[1160px] mx-auto px-6 sm:px-12 lg:px-16 my-4">
          <ParticleWaveHorizon />
          <div className="hidden md:block absolute left-16 top-1/2 -translate-y-1/2">
            <ParticleEllipsoid width={230} height={120} glowIntensity={0.16} />
          </div>
        </div>

        {/* THE INSTRUMENT — LIVE ROUTE & QUERY WATERFALL */}
        <div className="max-w-[1160px] mx-auto px-6 sm:px-12 lg:px-16 relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="border border-white/12 bg-black/80 px-3.5 py-1.5 text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.2em] text-neutral-300">
              THE INSTRUMENT — LIVE ROUTE & QUERY WATERFALL
            </div>

            <button
              type="button"
              onClick={() => setTraceKey((k) => k + 1)}
              data-magnetic
              className="border border-white/12 bg-black/80 hover:border-white/35 px-3.5 py-1.5 text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.2em] text-neutral-400 hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              ↻ RE-RUN TRACE
            </button>
          </div>

          <div
            key={`${activeProject.id}-${traceKey}`}
            className="border border-white/12 bg-[#050505]/95 p-5 sm:p-8"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 pb-5 mb-5 border-b border-white/[0.08] text-[11px] font-mono text-neutral-400">
              <span className="uppercase tracking-[0.18em]">
                CRAWL — {activeProject.titleWhite.toUpperCase()} {activeProject.titleMuted.toUpperCase()} ROUTE MAP
              </span>
              <span className="tracking-[0.14em] text-neutral-500">
                click any route to inspect sql / logic · status 200
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {activeProject.waterfallRoutes.map((route, idx) => {
                const isSelected = idx === selectedRouteIndex;
                return (
                  <button
                    type="button"
                    key={`${route.path}-${traceKey}`}
                    onClick={() => setSelectedRouteIndex(idx)}
                    data-magnetic
                    className={`w-full text-left grid grid-cols-12 items-center gap-4 py-1.5 px-2.5 -mx-2.5 transition-colors ${
                      isSelected ? 'bg-white/[0.06]' : 'hover:bg-white/[0.025]'
                    }`}
                  >
                    <div
                      className="col-span-12 sm:col-span-4 truncate flex items-center gap-2"
                      style={{ paddingLeft: `${route.indent * 16}px` }}
                    >
                      <span className="text-[10px] text-neutral-500 w-9 shrink-0">
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

                    {/* Loading Bar Track — Animates from 0% start & 0% width to its target waterfall offset & width when viewed */}
                    <div className="col-span-10 sm:col-span-7 h-2.5 bg-white/[0.05] relative overflow-hidden rounded-[1px]">
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

                    <div className="col-span-2 sm:col-span-1 flex items-center justify-end gap-2 tabular-nums">
                      <span className="hidden xl:inline-block text-[10px] text-neutral-500">
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

            {/* Selected Route Inspector */}
            {activeRoute && (
              <motion.div
                key={activeRoute.path}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, ease: EASE_OUT_EXPO }}
                className="mt-7 pt-6 border-t border-white/[0.08] grid grid-cols-1 lg:grid-cols-12 gap-6"
              >
                <div className="lg:col-span-5">
                  <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500 mb-1">
                    ENDPOINT ({activeRoute.method} · {activeRoute.latencyMs}ms)
                  </div>
                  <div className="text-sm font-mono text-white font-semibold mb-1.5">
                    {activeRoute.path}
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    {activeRoute.description}
                  </p>
                </div>
                <div className="lg:col-span-7">
                  <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500 mb-1.5">
                    EXECUTION / SQL POLICY
                  </div>
                  <pre className="text-xs font-mono text-neutral-200 bg-black border border-white/[0.08] p-3.5 overflow-x-auto whitespace-pre-wrap">
                    {activeRoute.sqlOrLogic}
                  </pre>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Soft Feathered Section Transition */}
      <div className="max-w-[1160px] mx-auto px-6 sm:px-12 lg:px-16">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* =====================================================================
          SECTION 4: THE WORK — MANIFEST & EXPERIENCE
      ===================================================================== */}
      <section id="experience" className="relative w-full py-28 sm:py-32">
        <div className="max-w-[1160px] mx-auto px-6 sm:px-12 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.65, ease: EASE_OUT_EXPO }}
          >
            <div className="flex items-center gap-3 mb-14">
              <span className="w-2 h-2 bg-white inline-block shrink-0" />
              <div className="inline-block border border-white/12 bg-white/[0.02] px-3.5 py-1.5 text-[11px] font-mono uppercase tracking-[0.2em] text-neutral-200">
                THE WORK — MANIFEST & EXPERIENCE
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              {/* Left Column: Authentic Manifest Log */}
              <div className="lg:col-span-7 divide-y divide-white/[0.08]">
                {WORK_MANIFEST.map((item) => (
                  <div key={item.code} className="py-9 first:pt-0 last:pb-0">
                    <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-neutral-400 mb-2.5">
                      <span className="text-white font-bold underline decoration-white/40 underline-offset-4">
                        {item.code}
                      </span>
                      <span>·</span>
                      <span className="text-neutral-300">{item.category}</span>
                      <span>·</span>
                      <span className="text-neutral-500">{item.roleAndPeriod}</span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2.5">
                      {item.title}
                    </h3>

                    <p className="text-sm text-neutral-300 leading-relaxed mb-4">
                      {item.description}
                    </p>

                    <ul className="space-y-1.5 mb-5">
                      {item.highlights.map((hl, i) => (
                        <li
                          key={i}
                          className="text-xs sm:text-[13px] text-neutral-400 leading-relaxed flex items-start gap-2.5"
                        >
                          <span className="w-1 h-1 bg-white/60 mt-2 shrink-0" />
                          <span>{hl}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="text-[11px] font-mono text-neutral-400">
                        {item.stack.join(' · ')}
                      </div>

                      {item.projectIdToInspect && (
                        <div className="flex items-center gap-4">
                          <button
                            type="button"
                            onClick={() => {
                              const proj = FLAGSHIP_PROJECTS.find(
                                (p) => p.id === item.projectIdToInspect
                              );
                              if (proj) setCaseStudyProject(proj);
                            }}
                            data-magnetic
                            className="text-[11px] font-mono uppercase tracking-[0.16em] text-neutral-300 hover:text-white whitespace-nowrap shrink-0"
                          >
                            CASE STUDY →
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleSelectProject(item.projectIdToInspect!, true)
                            }
                            data-magnetic
                            className="text-[11px] font-mono uppercase tracking-[0.16em] text-white hover:underline whitespace-nowrap shrink-0"
                          >
                            WATERFALL →
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Column: HOW IT'S DIFFERENT Box */}
              <div className="lg:col-span-5 lg:sticky lg:top-24">
                <div className="border border-white/12 bg-[#060606] p-7 sm:p-9">
                  <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-neutral-400 mb-6">
                    ACHIEVEMENTS & ENGINEERING PRACTICE
                  </div>

                  <ul className="space-y-5 text-sm text-neutral-300 leading-relaxed">
                    <li className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 bg-white mt-2 shrink-0" />
                      <span>
                        <strong className="text-white">Paying client production delivery.</strong>{' '}
                        Architected and built CMS (Clinic Management System) across 3 clinic branches with PostgreSQL Row-Level Security (RLS) and GitHub Actions CI/CD.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 bg-white mt-2 shrink-0" />
                      <span>
                        <strong className="text-white">Grand Finalist — Smart India Hackathon 2025.</strong>{' '}
                        National-level finalist in the AI/AgriTech track with FarmAura (KrishiMitra) and founder of an MSME-registered AgriTech startup.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 bg-white mt-2 shrink-0" />
                      <span>
                        <strong className="text-white">Winner — AICTE IDE Bootcamp 2026 & Hackathon Organizer.</strong>{' '}
                        Organized Mini SIH, a national-level campus hackathon with 400+ participants sponsored by AlgoBharat.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 bg-white mt-2 shrink-0" />
                      <span>
                        <strong className="text-white">Industry Internship & Core CS Foundation.</strong>{' '}
                        Software Engineer Intern at Exposys Data Labs (Bengaluru) with strong fundamentals in DSA, OOP, DBMS, Operating Systems, Java, Python, TypeScript, and SQL.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Soft Feathered Section Transition */}
      <div className="max-w-[1160px] mx-auto px-6 sm:px-12 lg:px-16">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* =====================================================================
          SECTION 5: VERIFY LINKS & FIELD NOTES (No CV Download Row)
      ===================================================================== */}
      <section id="notes" className="relative w-full py-28 sm:py-32">
        <div className="max-w-[1160px] mx-auto px-6 sm:px-12 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.65, ease: EASE_OUT_EXPO }}
          >
            {/* Clean Verification Table */}
            <div className="border border-white/12 bg-[#050505] mb-20">
              <div className="px-5 sm:px-6 py-3.5 border-b border-white/[0.08] text-[10px] font-mono uppercase tracking-[0.22em] text-neutral-400">
                VERIFY: LIVE DEPLOYMENTS, SOURCE REPOSITORIES & NETWORK
              </div>

              <a
                href={PROFILE_DATA.github}
                target="_blank"
                rel="noopener noreferrer"
                data-magnetic
                className="w-full px-5 sm:px-6 py-4 border-b border-white/[0.08] flex items-center justify-between gap-4 hover:bg-white/[0.025] transition-colors text-left group"
              >
                <div className="flex flex-wrap items-baseline gap-4 sm:gap-6">
                  <span className="text-xs font-mono text-neutral-500">01</span>
                  <span className="text-sm font-bold text-white">github · @itzsaheem</span>
                  <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-neutral-400">
                    REPOSITORIES, COMMITS & CI/CD WORKFLOWS
                  </span>
                </div>
                <span className="text-xs font-mono text-neutral-400 group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </a>

              <a
                href={PROFILE_DATA.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                data-magnetic
                className="w-full px-5 sm:px-6 py-4 flex items-center justify-between gap-4 hover:bg-white/[0.025] transition-colors text-left group"
              >
                <div className="flex flex-wrap items-baseline gap-4 sm:gap-6">
                  <span className="text-xs font-mono text-neutral-500">02</span>
                  <span className="text-sm font-bold text-white">linkedin · s-mohammed-saheem</span>
                  <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-neutral-400">
                    SIH 2025 GRAND FINALIST & PROFESSIONAL NETWORK
                  </span>
                </div>
                <span className="text-xs font-mono text-neutral-400 group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </a>
            </div>

            {/* FIELD NOTES */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
              <div className="flex items-center gap-3 text-[11px] font-mono uppercase tracking-[0.22em] text-neutral-400">
                <span className="w-2 h-2 bg-white inline-block shrink-0" />
                <span>FIELD NOTES — ARCHITECTURE LOGS</span>
              </div>
              <ParticleEllipsoid width={220} height={115} glowIntensity={0.15} />
            </div>

            <div className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
              {FIELD_NOTES.map((note) => (
                <button
                  type="button"
                  key={note.id}
                  onClick={() => setActiveFieldNote(note)}
                  data-magnetic
                  className="w-full py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left group hover:bg-white/[0.015] transition-colors px-2 -mx-2"
                >
                  <div className="flex items-start sm:items-center gap-4 sm:gap-6 min-w-0">
                    <span className="border border-white/15 px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-[0.18em] text-neutral-400 shrink-0">
                      NOTE
                    </span>
                    <span className="text-base sm:text-xl font-bold tracking-tight text-white group-hover:text-neutral-300 transition-colors">
                      {note.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono text-neutral-500 shrink-0 self-end sm:self-center">
                    <span className="tabular-nums">{note.date}</span>
                    <span className="group-hover:translate-x-1 group-hover:text-white transition-all">→</span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Soft Feathered Section Transition */}
      <div className="max-w-[1160px] mx-auto px-6 sm:px-12 lg:px-16">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* =====================================================================
          SECTION 6: CLEAN MINIMALIST CONTACT FOOTER (No Phone, No CV Button)
      ===================================================================== */}
      <footer id="contact" className="w-full py-24 sm:py-28">
        <div className="max-w-[1160px] mx-auto px-6 sm:px-12 lg:px-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 pb-16">
            <div>
              <div className="flex items-center gap-3 text-[11px] font-mono uppercase tracking-[0.22em] text-neutral-400 mb-4">
                <span className="w-2 h-2 bg-white inline-block shrink-0" />
                <span>DIRECT CHANNEL · CONTACT</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4 text-balance">
                Ready to ship production full-stack systems.
              </h2>
              <p className="text-sm text-neutral-400 max-w-lg leading-relaxed mb-3">
                {PROFILE_DATA.location} · {PROFILE_DATA.degree}
              </p>
              <div className="flex flex-wrap items-center gap-5 text-xs font-mono text-neutral-300">
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

            <div className="flex flex-wrap items-center gap-3">
              <a
                href={`mailto:${PROFILE_DATA.email}`}
                data-magnetic
                className="px-6 py-3 bg-white text-black text-xs font-mono font-bold uppercase tracking-[0.18em] hover:bg-neutral-200 transition-colors whitespace-nowrap shrink-0"
              >
                {PROFILE_DATA.email} →
              </a>
              <button
                type="button"
                onClick={handleCopyEmail}
                data-magnetic
                className="px-4 py-3 border border-white/15 text-xs font-mono uppercase tracking-[0.18em] text-neutral-300 hover:border-white/40 hover:text-white transition-colors whitespace-nowrap shrink-0"
              >
                {copiedEmail ? 'COPIED ✓' : 'COPY EMAIL'}
              </button>
            </div>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />

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
                onClick={() =>
                  onNavigateWithTransition
                    ? onNavigateWithTransition('top', 'S MOHAMMED SAHEEM')
                    : window.scrollTo({ top: 0, behavior: 'smooth' })
                }
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
          MODALS & CASE STUDY DRAWER (Scroll-Isolated from Background Page)
      ===================================================================== */}
      <AnimatePresence>
        {caseStudyProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex justify-end p-0 sm:p-4 overflow-hidden overscroll-contain"
            onClick={() => setCaseStudyProject(null)}
            onWheel={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ x: 80, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 80, opacity: 0 }}
              transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
              className="w-full max-w-3xl bg-[#070707] border border-white/15 h-full overflow-y-auto overscroll-contain p-6 sm:p-10 flex flex-col justify-between"
              onClick={(e) => e.stopPropagation()}
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
            >
              <div>
                <div className="flex items-center justify-between gap-4 pb-6 mb-8 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-white inline-block" />
                    <span className="text-xs font-mono uppercase tracking-[0.2em] text-neutral-300">
                      {caseStudyProject.numeral} · COMPLETE ARCHITECTURE SPECIFICATION
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCaseStudyProject(null)}
                    className="border border-white/20 px-3 py-1 text-xs font-mono text-neutral-300 hover:text-white hover:border-white/50 transition-colors"
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
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-24 p-4 overscroll-contain"
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
                      handleSelectProject(proj.id, true);
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
