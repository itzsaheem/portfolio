import React, { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Plus, Minus, Terminal } from 'lucide-react';
import { Typewriter } from './Typewriter';

export interface ProjectItem {
  id: string;
  index: string;
  title: string;
  category: string;
  year: string;
  problem: string;
  solution: string;
  techStack: string[];
  images: {
    stack1: string;
    stack2: string;
    showcase: string;
  };
}

const DEFAULT_PROJECTS: ProjectItem[] = [
  {
    id: 'cemig',
    index: '01',
    title: 'CEMIG ARCHITECTURE',
    category: 'ENERGY UTILITY // MULTI-CHANNEL DESIGN SYSTEM',
    year: '2022',
    problem:
      'Fragmented UI primitives and disconnected mobile workflows across 5 digital utility channels serving over 8 million residential and industrial energy consumers.',
    solution:
      'Architected an atomic enterprise design system with automated multi-brand token pipelines, low-latency offline sync, and accessible cross-platform native interfaces for technicians and consumers.',
    techStack: ['TypeScript', 'Design Systems', 'React Native', 'GraphQL', 'Tailwind', 'Token CI/CD'],
    images: {
      stack1: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      stack2: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
      showcase: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1400&q=80',
    },
  },
  {
    id: 'nexus',
    index: '02',
    title: 'NEXUS FINTECH CONSOLE',
    category: 'CAPITAL MARKETS // REAL-TIME TRADING PLATFORM',
    year: '2023',
    problem:
      'High-frequency institutional traders suffered from sub-optimal visual feedback, execution latency bottlenecks, and cognitive overload across complex multi-currency order books.',
    solution:
      'Engineered a sub-millisecond execution dashboard with custom 60fps WebGL visualizers, automated reconciliation pipelines, and hardware-accelerated charting for over $3B in daily transactions.',
    techStack: ['Three.js', 'WebGL Shaders', 'React', 'WebSockets', 'Rust/Wasm', 'Financial UX'],
    images: {
      stack1: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
      stack2: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
      showcase: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80',
    },
  },
  {
    id: 'aura',
    index: '03',
    title: 'AURA INTELLIGENCE',
    category: 'SPATIAL COMPUTING // GENERATIVE DESIGN CANVAS',
    year: '2024',
    problem:
      'Creative directors lacked a seamless environment to blend neural generative models with vector typography, procedural layout engines, and spatial 3D viewport feedback.',
    solution:
      'Built an infinite hybrid vector/raster canvas powered by WebGL fragment shaders and node-based workflows, enabling creators to generate over 50M production-ready assets with sub-second feedback.',
    techStack: ['GLSL Shaders', 'Node Canvas', 'TypeScript', 'Tailwind', 'GPU Compute', 'Awwwards SOTD'],
    images: {
      stack1: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      stack2: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      showcase: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1400&q=80',
    },
  },
];

interface StackCardProps {
  project: ProjectItem;
  index: number;
  total: number;
  scrollYProgress: any;
  onCliffhangerClick?: () => void;
  key?: React.Key;
}

function StackCard({ project, index, total, scrollYProgress, onCliffhangerClick }: StackCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Deck of cards physical stacked offset from top of container:
  // 0 -> 18px, 1 -> 66px (+48px), 2 -> 114px (+48px)
  // This ensures the top rim (index "01", "02", silver border) is ALWAYS clearly visible when stacked!
  const topOffsetPx = 18 + index * 48;

  // Animation values for progressive stacking with CLIFFHANGER PEEK
  let yTransform: any = '0vh';
  let scaleTransform: any = 1;
  let opacityTransform: any = 1;
  let overlayOpacityTransform: any = 0;

  if (index === 0) {
    // Card 0: In full focus initially.
    // Scales down smoothly and dims as Card 1 and Card 2 stack on top.
    yTransform = '0vh';
    scaleTransform = useTransform(
      scrollYProgress,
      [0, 0.05, 0.48, 0.54, 0.94],
      [1, 1, 0.94, 0.94, 0.88]
    );
    overlayOpacityTransform = useTransform(
      scrollYProgress,
      [0, 0.05, 0.48, 0.54, 0.94],
      [0, 0, 0.25, 0.25, 0.50]
    );
    opacityTransform = useTransform(
      scrollYProgress,
      [0, 0.05, 0.48, 0.54, 0.94],
      [1, 1, 0.75, 0.75, 0.55]
    );
  } else if (index === 1) {
    // Card 1:
    // Starts in CLIFFHANGER PEEK position (peeking fadingly at the bottom: ~78vh offset)
    // From scroll 0.06 to 0.48, glides up to 0vh and stacks on Card 0 at top: 66px.
    // From scroll 0.54 to 0.94, scales down to 0.94 and dims as Card 2 stacks on top.
    yTransform = useTransform(
      scrollYProgress,
      [0, 0.06, 0.48, 1],
      ['78vh', '78vh', '0vh', '0vh']
    );
    opacityTransform = useTransform(
      scrollYProgress,
      [0, 0.06, 0.40, 0.54, 0.94],
      [0.65, 0.65, 1, 1, 0.75]
    );
    scaleTransform = useTransform(
      scrollYProgress,
      [0, 0.48, 0.54, 0.94],
      [1, 1, 1, 0.94]
    );
    overlayOpacityTransform = useTransform(
      scrollYProgress,
      [0, 0.54, 0.94],
      [0, 0, 0.25]
    );
  } else if (index === 2) {
    // Card 2:
    // Tucked offscreen until 0.16.
    // Rises into CLIFFHANGER PEEK (~78vh) between 0.16 and 0.48 while Card 1 is stacking.
    // Peeks at bottom from 0.48 to 0.54.
    // Glides up from 0.54 to 0.94 to stack on Card 1 at top: 114px.
    yTransform = useTransform(
      scrollYProgress,
      [0, 0.16, 0.48, 0.54, 0.94, 1],
      ['105vh', '105vh', '78vh', '78vh', '0vh', '0vh']
    );
    opacityTransform = useTransform(
      scrollYProgress,
      [0, 0.16, 0.48, 0.54, 0.88, 1],
      [0, 0, 0.65, 0.65, 1, 1]
    );
    scaleTransform = 1;
    overlayOpacityTransform = 0;
  }

  return (
    <motion.div
      style={{
        y: yTransform,
        scale: scaleTransform,
        opacity: opacityTransform,
        top: `${topOffsetPx}px`,
        zIndex: 10 + index,
      }}
      className="absolute inset-x-0 mx-auto w-full max-w-7xl h-[74vh] sm:h-[76vh] lg:h-[78vh] flex flex-col justify-between overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden bg-[#0C0C0C] border-2 border-[#D7E2EA] rounded-[32px] sm:rounded-[44px] md:rounded-[52px] p-5 sm:p-6 md:p-7 shadow-[0_-20px_60px_rgba(0,0,0,0.95)] transition-shadow duration-300"
    >
      {/* Top Luminous Rim Highlight */}
      <div className="absolute top-0 inset-x-12 h-[2px] bg-gradient-to-r from-transparent via-[#D7E2EA]/70 to-transparent pointer-events-none" />

      {/* Dimming overlay when card gets stacked underneath subsequent cards */}
      <motion.div
        style={{ opacity: overlayOpacityTransform }}
        className="absolute inset-0 bg-black/60 rounded-[30px] sm:rounded-[42px] md:rounded-[50px] pointer-events-none z-30 transition-opacity"
      />

      {/* Card Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3.5 border-b border-white/10 shrink-0 relative z-20">
        {/* Left Side: Large Bold Index, Category Subtitle, Title */}
        <div className="space-y-1">
          <div className="flex flex-wrap items-baseline gap-3 sm:gap-4">
            <span className="font-sans text-3xl sm:text-5xl font-black text-[#D7E2EA] tracking-tighter">
              {project.index}
            </span>
            <span className="text-xs sm:text-sm font-mono uppercase tracking-[0.18em] text-neutral-300 font-medium">
              {project.category}
            </span>
          </div>
          <h3 className="text-xl sm:text-3xl lg:text-4xl font-sans font-black uppercase tracking-tight text-white leading-tight">
            {project.title}
          </h3>
        </div>

        {/* Right Side: Clean Round 3D Button */}
        <div className="shrink-0 flex items-center self-end sm:self-auto pt-1 sm:pt-0">
          {/* Clean Round Button with 3D Design */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            title={isExpanded ? 'Close Details' : 'View Details'}
            className="relative w-12 h-12 sm:w-13 sm:h-13 rounded-full flex items-center justify-center cursor-pointer group transition-all duration-300 select-none
              bg-gradient-to-b from-[#2E3238] via-[#16181B] to-[#0A0B0D]
              border border-[#D7E2EA]/40 hover:border-[#D7E2EA]
              shadow-[0_8px_20px_rgba(0,0,0,0.8),inset_0_1.5px_1px_rgba(255,255,255,0.45),inset_0_-2px_4px_rgba(0,0,0,0.85)]
              hover:shadow-[0_10px_25px_rgba(0,0,0,0.9),0_0_15px_rgba(215,226,234,0.25),inset_0_1.5px_2px_rgba(255,255,255,0.6),inset_0_-2px_4px_rgba(0,0,0,0.85)]
              active:translate-y-0.5 active:shadow-[0_3px_8px_rgba(0,0,0,0.9),inset_0_2px_4px_rgba(0,0,0,0.9)]"
          >
            {/* 3D Specular Highlight Rim */}
            <span className="absolute inset-0.5 rounded-full border border-white/10 pointer-events-none" />

            {/* Smooth 3D rotating Plus / Close Icon */}
            <motion.span
              animate={{ rotate: isExpanded ? 45 : 0, scale: isExpanded ? 1.05 : 1 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 flex items-center justify-center text-[#D7E2EA] group-hover:text-white transition-colors"
            >
              <Plus className="w-5 h-5 stroke-[2.4]" />
            </motion.span>
          </button>
        </div>
      </div>

      {/* Interactive Typewriter Reveal Details Section */}
      <motion.div
        initial={false}
        animate={{
          height: isExpanded ? 'auto' : 0,
          opacity: isExpanded ? 1 : 0,
        }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="overflow-hidden relative z-20 shrink-0"
      >
        <div className="py-4 grid grid-cols-1 md:grid-cols-12 gap-4 border-b border-white/10 leading-relaxed text-neutral-200">
          {/* Problem Statement */}
          <div className="md:col-span-5 space-y-2 bg-white/[0.03] p-4 rounded-xl border border-white/10">
            <div className="flex items-center gap-2 text-xs sm:text-sm uppercase tracking-wider text-[#D7E2EA] font-bold font-mono">
              <Terminal className="w-3.5 h-3.5 text-[#D7E2EA]" />
              <span>01 // Problem Statement</span>
            </div>
            <p className="text-sm sm:text-base font-sans text-neutral-300 min-h-[3.5rem] leading-relaxed">
              <Typewriter text={project.problem} isTriggered={isExpanded} speed={12} delay={80} />
            </p>
          </div>

          {/* Solution & Architecture */}
          <div className="md:col-span-5 space-y-2 bg-white/[0.03] p-4 rounded-xl border border-white/10">
            <div className="flex items-center gap-2 text-xs sm:text-sm uppercase tracking-wider text-[#D7E2EA] font-bold font-mono">
              <Terminal className="w-3.5 h-3.5 text-[#D7E2EA]" />
              <span>02 // Solution & Architecture</span>
            </div>
            <p className="text-sm sm:text-base font-sans text-neutral-300 min-h-[3.5rem] leading-relaxed">
              <Typewriter text={project.solution} isTriggered={isExpanded} speed={12} delay={180} />
            </p>
          </div>

          {/* Core Stack */}
          <div className="md:col-span-2 space-y-2 bg-white/[0.03] p-4 rounded-xl border border-white/10 flex flex-col justify-between">
            <div className="text-xs sm:text-sm uppercase tracking-wider text-[#D7E2EA] font-bold font-mono">
              03 // Core Stack
            </div>
            <div className="flex flex-wrap gap-1.5">
              {project.techStack.map((tech) => (
                <span
                  key={tech}
                  className="px-2.5 py-1 rounded text-xs font-mono font-medium bg-white/10 text-white border border-white/15"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Media Grid: Left Column (2 Stacked) + Right Column (1 Large Showcase) */}
      <div className={`flex-1 ${isExpanded ? 'min-h-[180px] sm:min-h-[220px] lg:min-h-[260px]' : 'min-h-[260px] sm:min-h-[310px] lg:min-h-[360px]'} mt-3 flex flex-col md:flex-row gap-3 sm:gap-4 items-stretch relative z-10 transition-all duration-300`}>
        {/* Left Column with 2 stacked images (w-full md:w-[40%]) */}
        <div className="w-full md:w-[40%] flex flex-col gap-2.5 sm:gap-3 justify-between">
          <div className="flex-1 relative group overflow-hidden rounded-[18px] sm:rounded-[24px] md:rounded-[28px] border border-white/10 min-h-[120px] sm:min-h-[145px]">
            <img
              src={project.images.stack1}
              alt={`${project.title} Preview 1`}
              className="w-full h-full object-cover grayscale contrast-125 brightness-95 transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-2.5 left-3.5 text-xs sm:text-sm font-mono text-neutral-200 uppercase tracking-wider font-medium">
              PRIMITIVE // VIEW 01
            </div>
          </div>

          <div className="flex-1 relative group overflow-hidden rounded-[18px] sm:rounded-[24px] md:rounded-[28px] border border-white/10 min-h-[120px] sm:min-h-[145px]">
            <img
              src={project.images.stack2}
              alt={`${project.title} Preview 2`}
              className="w-full h-full object-cover grayscale contrast-125 brightness-95 transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-2.5 left-3.5 text-xs sm:text-sm font-mono text-neutral-200 uppercase tracking-wider font-medium">
              SYSTEM // VIEW 02
            </div>
          </div>
        </div>

        {/* Right Column with 1 large showcase image (w-full md:w-[60%]) */}
        <div className="w-full md:w-[60%] relative group overflow-hidden rounded-[20px] sm:rounded-[28px] md:rounded-[34px] border border-white/10 min-h-[240px] sm:min-h-[300px] md:min-h-[340px]">
          <img
            src={project.images.showcase}
            alt={`${project.title} Main Showcase`}
            className="w-full h-full object-cover grayscale contrast-125 brightness-95 transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-3.5 sm:bottom-4.5 left-4 sm:left-5 right-4 sm:right-5 flex items-center justify-between text-white">
            <span className="font-mono text-xs sm:text-sm uppercase tracking-wider font-semibold text-[#D7E2EA] bg-black/70 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20">
              SHOWCASE ARCHIVE
            </span>
            <span className="font-mono text-sm sm:text-base font-semibold text-neutral-200">
              {project.year}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function ProjectsSection({ projects = DEFAULT_PROJECTS }: { projects?: ProjectItem[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Tracks scroll progress across the exact height of the section:
  // Starts when top of projects hits top of screen ('start start')
  // Finishes when bottom of projects hits bottom of screen ('end end')
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Handler to smoothly scroll to bring a specific card into focus
  const handleScrollToCard = (cardIndex: number) => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const containerTop = scrollTop + rect.top;
    const scrollDistance = container.offsetHeight - window.innerHeight;
    const targetProgress = cardIndex === 0 ? 0.02 : cardIndex === 1 ? 0.48 : 0.94;
    window.scrollTo({
      top: containerTop + targetProgress * scrollDistance,
      behavior: 'smooth',
    });
  };

  return (
    <section
      id="projects"
      ref={containerRef}
      className="relative w-full bg-black text-white h-[250vh] select-none"
    >
      {/* Sticky Full-Viewport Container: Locks into position as soon as cards reach top of viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-start pt-3 sm:pt-4 pb-3 sm:pb-4 px-4 sm:px-6 lg:px-8">
        {/* Sleek Minimalist Architectural Section Header */}
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between border-b border-white/10 pb-3 mb-2.5 shrink-0 z-30">
          <div className="flex items-center gap-3.5">
            <span className="text-xs sm:text-sm font-mono uppercase tracking-[0.2em] text-[#D7E2EA] font-semibold">
              01 / SELECTED WORKS
            </span>
            <span className="text-white/30">•</span>
            <h2 className="text-sm sm:text-base font-sans font-black uppercase tracking-wider text-white">
              PROJECTS
            </h2>
          </div>
          <div className="font-mono text-xs sm:text-sm text-neutral-300 uppercase tracking-wider flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-cyan animate-pulse" />
            <span className="hidden sm:inline">STACK SCROLL // DECK OF CARDS</span>
          </div>
        </div>

        {/* Stacked Cards Viewport: Distinct layered offsets + zero dead space below */}
        <div className="w-full max-w-7xl mx-auto flex-1 relative z-20 min-h-0">
          {projects.map((project, idx) => (
            <StackCard
              key={project.id}
              project={project}
              index={idx}
              total={projects.length}
              scrollYProgress={scrollYProgress}
              onCliffhangerClick={() => handleScrollToCard(idx)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
