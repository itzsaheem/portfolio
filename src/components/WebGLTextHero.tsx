import React, { useEffect, useRef } from 'react';
import { Magnetic } from './Magnetic';
import { CHARLES_ROSIE_FONT_DATA_URI } from '../fonts/charlesRosieDataUri';
import { ORANGE_AVENUE_FONT_DATA_URI } from '../fonts/orangeAvenueDataUri';
import { AREXA_FONT_DATA_URI } from '../fonts/arexaDataUri';

interface WebGLTextHeroProps {
  onScrollToProjects?: () => void;
  onNavigateToSection?: (sectionId: string, label?: string) => void;
}

interface TextParticle {
  homeX: number;
  homeY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseAlpha: number;
  displaced: number; // 0.0 (sitting at home) to 1.0 (airborne ball)
  springK: number;
  damping: number;
  wanderAngle: number;
  wanderSpeed: number;
}

export function WebGLTextHero({ onScrollToProjects, onNavigateToSection }: WebGLTextHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = canvas.parentElement?.clientWidth || window.innerWidth;
    let height = canvas.parentElement?.clientHeight || window.innerHeight;

    // Offscreen canvas for crisp, vector-sharp base text rendering
    let textCanvas: HTMLCanvasElement | null = document.createElement('canvas');
    let textCtx: CanvasRenderingContext2D | null = textCanvas.getContext('2d', { willReadFrequently: true });

    // Pre-rendered 32x32 radial glow sprite for ultra-smooth GPU-accelerated glowing balls (subtle luminous glow)
    const glowSprite = document.createElement('canvas');
    glowSprite.width = 32;
    glowSprite.height = 32;
    const gCtx = glowSprite.getContext('2d');
    if (gCtx) {
      const grad = gCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
      grad.addColorStop(0.25, 'rgba(255, 255, 255, 0.45)');
      grad.addColorStop(0.55, 'rgba(255, 255, 255, 0.12)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      gCtx.fillStyle = grad;
      gCtx.fillRect(0, 0, 32, 32);
    }

    const mouse = {
      targetX: -2000,
      targetY: -2000,
      x: -2000,
      y: -2000,
      lastX: -2000,
      lastY: -2000,
      vx: 0,
      vy: 0,
      active: false,
    };

    let particles: TextParticle[] = [];

    const CONFIG = {
      line1: 'S Mohammed',
      line2: 'Saheem',
      fontFamily: "'Charles Rosie', 'Charles Rosie Regular', 'Orange Avenue', 'Arexa', serif",
    };

    // Rasterizes crisp text to offscreen canvas and extracts particle grid
    const rasterizeAndSampleParticles = () => {
      if (!textCanvas || !textCtx) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      textCanvas.width = Math.floor(width * dpr);
      textCanvas.height = Math.floor(height * dpr);

      textCtx.setTransform(1, 0, 0, 1, 0, 0);
      textCtx.scale(dpr, dpr);
      textCtx.clearRect(0, 0, width, height);

      const isMobile = width < 768;
      const targetBlockHeight = height * (isMobile ? 0.34 : 0.44);
      let fontSize = targetBlockHeight * 0.48;

      textCtx.font = `normal ${fontSize}px ${CONFIG.fontFamily}`;
      if ('letterSpacing' in textCtx) {
        (textCtx as any).letterSpacing = '0.015em';
      }

      // Ensure line1 and line2 fit comfortably within 88% of viewport width on any screen
      const measuredW = Math.max(
        textCtx.measureText(CONFIG.line1).width,
        textCtx.measureText(CONFIG.line2).width
      );
      const maxAllowedWidth = width * (isMobile ? 0.88 : 0.9);
      if (measuredW > maxAllowedWidth && measuredW > 0) {
        fontSize = fontSize * (maxAllowedWidth / measuredW);
        textCtx.font = `normal ${fontSize}px ${CONFIG.fontFamily}`;
      }

      const lineGap = fontSize * 0.94;
      textCtx.fillStyle = '#ffffff';
      textCtx.textAlign = 'center';
      textCtx.textBaseline = 'alphabetic';

      const centerX = width * 0.5;
      const totalVisualHeight = lineGap + fontSize * 0.72;
      const startY1 = (height * 0.5) - (totalVisualHeight * 0.5) + fontSize * 0.72;
      const startY2 = startY1 + lineGap;

      textCtx.fillText(CONFIG.line1, centerX, startY1);
      textCtx.fillText(CONFIG.line2, centerX, startY2);

      // Bounding box of text for fast, targeted sampling
      const pad = 40;
      const boxLeft = Math.max(0, Math.floor((width * 0.05) * dpr));
      const boxRight = Math.min(textCanvas.width, Math.ceil((width * 0.95) * dpr));
      const boxTop = Math.max(0, Math.floor(((height * 0.5) - (totalVisualHeight * 0.55) - pad) * dpr));
      const boxBottom = Math.min(textCanvas.height, Math.ceil(((height * 0.5) + (totalVisualHeight * 0.55) + pad) * dpr));

      const boxW = boxRight - boxLeft;
      const boxH = boxBottom - boxTop;

      if (boxW <= 0 || boxH <= 0) return;

      const imgData = textCtx.getImageData(boxLeft, boxTop, boxW, boxH);
      const data = imgData.data;

      // Density step: 4-6px for optimal balance of dense visual fidelity and 120fps speed
      const step = Math.max(4, Math.round(5.2 * (dpr / 1.5)));
      const newParticles: TextParticle[] = [];

      for (let py = 0; py < boxH; py += step) {
        for (let px = 0; px < boxW; px += step) {
          const idx = (py * boxW + px) * 4;
          const alpha = data[idx + 3];

          // Sample pixels belonging to the glyphs
          if (alpha > 120) {
            const homeX = (boxLeft + px) / dpr;
            const homeY = (boxTop + py) / dpr;

            // Size distribution matching the cursor companion motes (1.3px to 2.3px)
            const isCore = Math.random() < 0.35;
            const size = isCore ? 2.1 : (Math.random() < 0.6 ? 1.6 : 1.3);

            newParticles.push({
              homeX,
              homeY,
              x: homeX,
              y: homeY,
              vx: 0,
              vy: 0,
              size,
              baseAlpha: alpha / 255,
              displaced: 0,
              // Smooth, magnetic return spring
              springK: 0.055 + Math.random() * 0.028,
              // Liquid viscous damping prevents harsh vibration
              damping: 0.88 + Math.random() * 0.035,
              wanderAngle: Math.random() * Math.PI * 2,
              wanderSpeed: (0.015 + Math.random() * 0.02) * (Math.random() < 0.5 ? 1 : -1),
            });
          }
        }
      }

      particles = newParticles;
    };

    const handleResize = () => {
      width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.parentElement?.clientHeight || window.innerHeight;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      rasterizeAndSampleParticles();
    };

    handleResize();

    // Load custom Charles Rosie font and rebuild particles seamlessly once loaded
    try {
      const charlesFont1 = new FontFace('Charles Rosie', `url(${CHARLES_ROSIE_FONT_DATA_URI}) format('woff2')`);
      const charlesFont2 = new FontFace('Charles Rosie Regular', `url(${CHARLES_ROSIE_FONT_DATA_URI}) format('woff2')`);
      const orangeFont1 = new FontFace('Orange Avenue', `url(${ORANGE_AVENUE_FONT_DATA_URI})`);

      Promise.all([
        charlesFont1.load().catch(() => null),
        charlesFont2.load().catch(() => null),
        orangeFont1.load().catch(() => null),
      ]).then((loadedFonts) => {
        loadedFonts.forEach((f) => {
          if (f) document.fonts.add(f);
        });
        Promise.all([
          document.fonts.load('80px "Charles Rosie"'),
          document.fonts.load('80px "Charles Rosie Regular"'),
        ]).then(() => {
          rasterizeAndSampleParticles();
        });
      }).catch((err) => {
        console.warn('Charles Rosie font load notice:', err);
      });

      // Also listen to document.fonts.ready as a fail-safe
      if (document.fonts?.ready) {
        document.fonts.ready.then(() => {
          rasterizeAndSampleParticles();
        });
      }
    } catch (e) {
      console.warn('Font fallback:', e);
    }

    // Decoupled mousemove: zero heavy loops in the listener ensures zero input thread lag!
    const onMouseMove = (e: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
      mouse.active = true;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!canvas || e.touches.length === 0) return;
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.touches[0].clientX - rect.left;
      mouse.targetY = e.touches[0].clientY - rect.top;
      mouse.active = true;
    };

    const onPointerLeave = () => {
      mouse.active = false;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    canvas.addEventListener('touchmove', onTouchMove, { passive: true });
    canvas.addEventListener('mouseleave', onPointerLeave);
    canvas.addEventListener('touchend', onPointerLeave);

    let lastTime = performance.now();
    let isVisible = true;

    const render = (now: number) => {
      if (!isVisible) {
        animId = 0;
        return;
      }

      const dtMs = Math.min(32, now - lastTime);
      const dt = dtMs / 16.666;
      lastTime = now;

      // Smooth mouse interpolation & velocity tracking
      if (mouse.x < -1000) {
        mouse.x = mouse.targetX;
        mouse.y = mouse.targetY;
        mouse.lastX = mouse.targetX;
        mouse.lastY = mouse.targetY;
      } else {
        mouse.lastX = mouse.x;
        mouse.lastY = mouse.y;
        mouse.x += (mouse.targetX - mouse.x) * 0.42 * dt;
        mouse.y += (mouse.targetY - mouse.y) * 0.42 * dt;
        mouse.vx = (mouse.x - mouse.lastX) / dt;
        mouse.vy = (mouse.y - mouse.lastY) / dt;
      }

      const mouseSpeed = Math.hypot(mouse.vx, mouse.vy);
      // Interaction radius adapts gracefully to viewport scale
      const interactRadius = Math.max(52, Math.min(88, width * 0.058));
      const interactRadiusSq = interactRadius * interactRadius;

      // Clear main canvas frame
      ctx.clearRect(0, 0, width, height);

      // Draw the crisp solid text
      if (textCanvas) {
        ctx.drawImage(textCanvas, 0, 0, width, height);
      }

      let hasDisplaced = false;

      // Process particle physics with buttery-smooth spring return
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // 1. Kick particle into floating white ball when cursor crosses over its area
        if (mouse.active) {
          const mdx = p.x - mouse.x;
          const mdy = p.y - mouse.y;
          const distSq = mdx * mdx + mdy * mdy;

          if (distSq < interactRadiusSq) {
            const dist = Math.sqrt(distSq);
            const force = Math.pow(1 - dist / interactRadius, 1.35);
            const normX = dist > 0.001 ? mdx / dist : (Math.random() - 0.5);
            const normY = dist > 0.001 ? mdy / dist : (Math.random() - 0.5);

            const kickMag = (5.8 + mouseSpeed * 0.55) * force;
            p.vx += normX * kickMag;
            p.vy += normY * kickMag;

            p.vx += mouse.vx * 0.32 * force;
            p.vy += mouse.vy * 0.32 * force;

            p.vx += -normY * (Math.random() - 0.5) * 3.2 * force;
            p.vy += normX * (Math.random() - 0.5) * 3.2 * force;

            p.displaced = 1.0;
          }
        }

        // 2. Physical spring return & reconstruction when cursor moves away
        if (p.displaced > 0.001) {
          hasDisplaced = true;

          p.wanderAngle += p.wanderSpeed * dt;
          p.vx += Math.cos(p.wanderAngle) * 0.06 * p.displaced * dt;
          p.vy += Math.sin(p.wanderAngle) * 0.06 * p.displaced * dt;

          const returnDx = p.homeX - p.x;
          const returnDy = p.homeY - p.y;
          const distToHome = Math.hypot(returnDx, returnDy);

          p.vx += returnDx * p.springK * dt;
          p.vy += returnDy * p.springK * dt;

          p.vx *= Math.pow(p.damping, dt);
          p.vy *= Math.pow(p.damping, dt);

          p.x += p.vx * dt;
          p.y += p.vy * dt;

          const curSpeed = Math.hypot(p.vx, p.vy);
          if (distToHome < 0.75 && curSpeed < 0.14) {
            p.x = p.homeX;
            p.y = p.homeY;
            p.vx = 0;
            p.vy = 0;
            p.displaced = 0;
          } else {
            p.displaced = Math.min(1.0, distToHome / 16);
          }
        }
      }

      if (hasDisplaced) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          if (p.displaced > 0.04) {
            const holeR = p.size * (1.35 + p.displaced * 2.1);
            ctx.moveTo(p.homeX + holeR, p.homeY);
            ctx.arc(p.homeX, p.homeY, holeR, 0, Math.PI * 2);
          }
        }
        ctx.fill();

        ctx.globalCompositeOperation = 'source-over';

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          if (p.displaced > 0.04) {
            const speed = Math.hypot(p.vx, p.vy);
            const glowR = p.size * (1.7 + Math.min(2.0, speed * 0.28));
            ctx.drawImage(glowSprite, p.x - glowR, p.y - glowR, glowR * 2, glowR * 2);
          }
        }

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          if (p.displaced > 0.02) {
            ctx.moveTo(p.x + p.size, p.y);
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          }
        }
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        isVisible = entry.isIntersecting;
        if (isVisible && !animId) {
          lastTime = performance.now();
          animId = requestAnimationFrame(render);
        } else if (!isVisible && animId) {
          cancelAnimationFrame(animId);
          animId = 0;
        }
      },
      { threshold: 0.01 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    animId = requestAnimationFrame(render);

    return () => {
      observer.disconnect();
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      if (canvas) {
        canvas.removeEventListener('touchmove', onTouchMove);
        canvas.removeEventListener('mouseleave', onPointerLeave);
        canvas.removeEventListener('touchend', onPointerLeave);
      }
      textCanvas = null;
      textCtx = null;
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-screen bg-transparent text-white flex flex-col justify-between p-6 sm:p-8 lg:p-14 select-none overflow-hidden"
    >
      {/* 4-Point Star in Top-Left (Exact match to reference) */}
      <div className="absolute top-8 left-8 sm:top-12 sm:left-14 z-20 pointer-events-none">
        <svg className="w-6 h-6 sm:w-8 sm:h-8 fill-white" viewBox="0 0 24 24">
          <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" />
        </svg>
      </div>

      {/* Decorative ambient star near title */}
      <div className="absolute top-[28vh] left-[26vw] z-20 pointer-events-none opacity-80 hidden md:block">
        <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
          <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" />
        </svg>
      </div>

      {/* 1. Top Minimalist Navigation (Top Right) */}
      <header className="relative z-20 flex justify-end items-center w-full">
        <nav className="flex items-center gap-5 sm:gap-8 lg:gap-10 font-sans font-bold text-[11px] sm:text-xs uppercase tracking-[0.2em]">
          <Magnetic strength={0.3} radius={20}>
            <button
              type="button"
              onClick={() =>
                onNavigateToSection
                  ? onNavigateToSection('instrument', 'THE BUILD · FLAGSHIP SYSTEMS')
                  : onScrollToProjects?.()
              }
              data-magnetic
              className="text-white hover:opacity-50 transition-opacity py-1 whitespace-nowrap shrink-0 uppercase"
            >
              WORK
            </button>
          </Magnetic>
          <Magnetic strength={0.3} radius={20}>
            <button
              type="button"
              onClick={() =>
                onNavigateToSection
                  ? onNavigateToSection('capabilities', 'CAPABILITY INDEX · TECH STACK')
                  : onScrollToProjects?.()
              }
              data-magnetic
              className="text-white hover:opacity-50 transition-opacity py-1 whitespace-nowrap shrink-0 uppercase"
            >
              STACK
            </button>
          </Magnetic>
          <Magnetic strength={0.3} radius={20}>
            <button
              type="button"
              onClick={() =>
                onNavigateToSection
                  ? onNavigateToSection('experience', 'THE WORK · MANIFEST & EXPERIENCE')
                  : onScrollToProjects?.()
              }
              data-magnetic
              className="text-white hover:opacity-50 transition-opacity py-1 whitespace-nowrap shrink-0 uppercase"
            >
              EXPERIENCE
            </button>
          </Magnetic>
          <Magnetic strength={0.3} radius={20}>
            <button
              type="button"
              onClick={() =>
                onNavigateToSection
                  ? onNavigateToSection('contact', 'DIRECT CHANNEL · CONTACT')
                  : document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
              }
              data-magnetic
              className="text-white border border-white px-3 py-1.5 rounded-sm hover:bg-white hover:text-black transition-colors whitespace-nowrap shrink-0 uppercase"
            >
              CONTACT +
            </button>
          </Magnetic>
        </nav>
      </header>

      {/* Awwwards-style Ribbon Badge on Right Hero Edge */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 z-30 hidden sm:flex flex-col items-center bg-[#84cfc8] text-white py-3 px-1.5 shadow-md rounded-l-md cursor-pointer hover:bg-[#68beb6] transition-colors">
        <span className="font-bold text-xs tracking-tighter mb-1.5">W.</span>
        <span className="text-[9px] font-bold tracking-widest uppercase [writing-mode:vertical-lr] rotate-180 opacity-90">
          SIH '25
        </span>
      </div>

      {/* 3. Center Interactive Text Disintegration & Reconstruction Canvas */}
      <div className="absolute inset-0 w-full h-full z-10 flex items-center justify-center pointer-events-auto">
        <canvas 
          ref={canvasRef} 
          className="w-full h-full block cursor-none"
          title="Move cursor over text to disintegrate into white balls and watch it reconstruct"
        />
      </div>

      {/* Seamless Bottom Atmospheric Feather into the Thesis Section */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-b from-transparent via-black/75 to-black z-10" />

      {/* 4. Bottom Intro Text & Reach Out Link */}
      <footer className="relative z-20 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 w-full pointer-events-none">
        <p className="max-w-md font-sans text-xs sm:text-[13px] text-neutral-300 leading-relaxed font-medium pointer-events-auto">
          Full-stack software engineer building across Java, Python, TypeScript, Node.js, and relational SQL databases. Experienced with scalable backend APIs, RLS data security, and high-performance web systems. Feel free to{' '}
          <button
            type="button"
            onClick={() =>
              onNavigateToSection
                ? onNavigateToSection('contact', 'DIRECT CHANNEL · CONTACT')
                : document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
            }
            data-magnetic
            className="underline font-bold text-white hover:text-cyan transition-colors inline-block"
          >
            reach out here
          </button>.
        </p>

        <div className="pointer-events-auto">
          <Magnetic strength={0.3} radius={25}>
            <button
              onClick={() =>
                onNavigateToSection
                  ? onNavigateToSection('thesis', 'THE THESIS · ENGINEERING PORTFOLIO')
                  : onScrollToProjects?.()
              }
              data-magnetic
              className="flex items-center gap-3 text-[10px] font-sans font-black uppercase tracking-[0.25em] text-neutral-400 hover:text-white transition-colors py-2 whitespace-nowrap shrink-0"
            >
              <span className="w-6 h-[1.5px] bg-white inline-block"></span>
              <span>SCROLL FOR ARCHITECTURE ↓</span>
            </button>
          </Magnetic>
        </div>
      </footer>
    </div>
  );
}
