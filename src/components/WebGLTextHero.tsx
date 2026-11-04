import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Magnetic } from './Magnetic';
import { CHARLES_ROSIE_FONT_DATA_URI } from '../fonts/charlesRosieDataUri';
import { ORANGE_AVENUE_FONT_DATA_URI } from '../fonts/orangeAvenueDataUri';
import { PROFILE_DATA } from '../data/portfolioData';

interface WebGLTextHeroProps {
  onScrollToProjects?: () => void;
  onNavigateToSection?: (sectionId: string, label?: string) => void;
}

interface TextParticle {
  homeX: number;
  homeY: number;
  startX: number;
  startY: number;
  driftX: number;
  driftY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseAlpha: number;
  displaced: number;
  springK: number;
  damping: number;
  wanderAngle: number;
  wanderSpeed: number;
  delay: number;
}

// Calm, slow, non-abrupt duration for fine dots to gently ease into "S Mohammed Saheem"
const GENTLE_SETTLE_DURATION = 3.2;

export function WebGLTextHero({ onScrollToProjects, onNavigateToSection }: WebGLTextHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isHeroMenuOpen, setIsHeroMenuOpen] = useState(false);

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
    let textCtx: CanvasRenderingContext2D | null = textCanvas.getContext('2d', {
      willReadFrequently: true,
    });

    // Subtle, delicate radial glow sprite for fine pinpoint dots
    const glowSprite = document.createElement('canvas');
    glowSprite.width = 24;
    glowSprite.height = 24;
    const gCtx = glowSprite.getContext('2d');
    if (gCtx) {
      const grad = gCtx.createRadialGradient(12, 12, 0, 12, 12, 12);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.55)');
      grad.addColorStop(0.35, 'rgba(255, 255, 255, 0.18)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      gCtx.fillStyle = grad;
      gCtx.fillRect(0, 0, 24, 24);
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
    const introStartTime = performance.now();
    let introDone = false;

    const CONFIG = {
      line1: 'S Mohammed',
      line2: 'Saheem',
      fontFamily: "'Charles Rosie', 'Charles Rosie Regular', 'Orange Avenue', 'Arexa', serif",
    };

    // Rasterizes crisp text to offscreen canvas and extracts fine particle grid
    const rasterizeAndSampleParticles = (preserveIntroPositions = false) => {
      if (!textCanvas || !textCtx) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      textCanvas.width = Math.floor(width * dpr);
      textCanvas.height = Math.floor(height * dpr);

      textCtx.setTransform(1, 0, 0, 1, 0, 0);
      textCtx.scale(dpr, dpr);
      textCtx.clearRect(0, 0, width, height);

      const isMobile = width < 768;
      const targetBlockHeight = height * (isMobile ? 0.23 : 0.44);
      let fontSize = targetBlockHeight * 0.48;

      textCtx.font = `normal ${fontSize}px ${CONFIG.fontFamily}`;
      if ('letterSpacing' in textCtx) {
        (textCtx as any).letterSpacing = '0.015em';
      }

      const measuredW = Math.max(
        textCtx.measureText(CONFIG.line1).width,
        textCtx.measureText(CONFIG.line2).width
      );
      const maxAllowedWidth = width * (isMobile ? 0.78 : 0.9);
      if (measuredW > maxAllowedWidth && measuredW > 0) {
        fontSize = fontSize * (maxAllowedWidth / measuredW);
        textCtx.font = `normal ${fontSize}px ${CONFIG.fontFamily}`;
      }

      const lineGap = fontSize * 0.94;
      textCtx.fillStyle = '#ffffff';
      textCtx.textAlign = 'center';
      textCtx.textBaseline = 'alphabetic';

      const centerX = width * 0.5;
      const centerY = isMobile ? height * 0.43 : height * 0.5;
      const totalVisualHeight = lineGap + fontSize * 0.72;
      const startY1 = centerY - totalVisualHeight * 0.5 + fontSize * 0.72;
      const startY2 = startY1 + lineGap;

      textCtx.fillText(CONFIG.line1, centerX, startY1);
      textCtx.fillText(CONFIG.line2, centerX, startY2);

      // Bounding box of text for targeted sampling
      const pad = 40;
      const boxLeft = Math.max(0, Math.floor(width * 0.05 * dpr));
      const boxRight = Math.min(textCanvas.width, Math.ceil(width * 0.95 * dpr));
      const boxTop = Math.max(0, Math.floor((centerY - totalVisualHeight * 0.55 - pad) * dpr));
      const boxBottom = Math.min(
        textCanvas.height,
        Math.ceil((centerY + totalVisualHeight * 0.55 + pad) * dpr)
      );

      const boxW = boxRight - boxLeft;
      const boxH = boxBottom - boxTop;

      if (boxW <= 0 || boxH <= 0) return;

      const imgData = textCtx.getImageData(boxLeft, boxTop, boxW, boxH);
      const data = imgData.data;

      // Fine density step for delicate pinpoint dots
      const step = Math.max(4, Math.round(4.8 * (dpr / 1.5)));
      const prevParticles = particles;
      const newParticles: TextParticle[] = [];
      let pCount = 0;

      for (let py = 0; py < boxH; py += step) {
        for (let px = 0; px < boxW; px += step) {
          const idx = (py * boxW + px) * 4;
          const alpha = data[idx + 3];

          if (alpha > 120) {
            const homeX = (boxLeft + px) / dpr;
            const homeY = (boxTop + py) / dpr;

            // Fine, delicate dot radius (0.9px to 1.45px) — never bulky
            const size = 0.9 + Math.random() * 0.55;

            const existing =
              preserveIntroPositions && prevParticles.length > 0
                ? prevParticles[pCount % prevParticles.length]
                : null;

            // Soft, airy random dispersion around the canvas
            const angle = Math.random() * Math.PI * 2;
            const spreadRadiusX = (0.12 + Math.pow(Math.random(), 0.85) * 0.42) * width;
            const spreadRadiusY = (0.12 + Math.pow(Math.random(), 0.85) * 0.42) * height;

            const startX = existing
              ? existing.startX
              : centerX + Math.cos(angle) * spreadRadiusX + (Math.random() - 0.5) * 60;
            const startY = existing
              ? existing.startY
              : centerY + Math.sin(angle) * spreadRadiusY + (Math.random() - 0.5) * 60;

            const driftX = existing ? existing.driftX : (Math.random() - 0.5) * 28;
            const driftY = existing ? existing.driftY : (Math.random() - 0.5) * 28;
            const delay = existing ? existing.delay : Math.random() * 0.45;

            newParticles.push({
              homeX,
              homeY,
              startX,
              startY,
              driftX,
              driftY,
              x: existing ? existing.x : startX,
              y: existing ? existing.y : startY,
              vx: 0,
              vy: 0,
              size,
              baseAlpha: (alpha / 255) * (0.75 + Math.random() * 0.25),
              displaced: introDone ? 0 : 1,
              springK: 0.042 + Math.random() * 0.02,
              damping: 0.9 + Math.random() * 0.03,
              wanderAngle: Math.random() * Math.PI * 2,
              wanderSpeed: (0.01 + Math.random() * 0.015) * (Math.random() < 0.5 ? 1 : -1),
              delay,
            });
            pCount++;
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

      rasterizeAndSampleParticles(true);
    };

    // Initial setup
    width = canvas.parentElement?.clientWidth || window.innerWidth;
    height = canvas.parentElement?.clientHeight || window.innerHeight;
    const initDpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(width * initDpr);
    canvas.height = Math.floor(height * initDpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(initDpr, initDpr);
    rasterizeAndSampleParticles(false);

    // Load custom Charles Rosie font and update home coordinates smoothly
    try {
      const charlesFont1 = new FontFace(
        'Charles Rosie',
        `url(${CHARLES_ROSIE_FONT_DATA_URI}) format('woff2')`
      );
      const charlesFont2 = new FontFace(
        'Charles Rosie Regular',
        `url(${CHARLES_ROSIE_FONT_DATA_URI}) format('woff2')`
      );
      const orangeFont1 = new FontFace(
        'Orange Avenue',
        `url(${ORANGE_AVENUE_FONT_DATA_URI})`
      );

      Promise.all([
        charlesFont1.load().catch(() => null),
        charlesFont2.load().catch(() => null),
        orangeFont1.load().catch(() => null),
      ])
        .then((loadedFonts) => {
          loadedFonts.forEach((f) => {
            if (f) document.fonts.add(f);
          });
          Promise.all([
            document.fonts.load('80px "Charles Rosie"'),
            document.fonts.load('80px "Charles Rosie Regular"'),
          ]).then(() => {
            rasterizeAndSampleParticles(true);
          });
        })
        .catch((err) => {
          console.warn('Charles Rosie font load notice:', err);
        });

      if (document.fonts?.ready) {
        document.fonts.ready.then(() => {
          rasterizeAndSampleParticles(true);
        });
      }
    } catch (e) {
      console.warn('Font fallback:', e);
    }

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

      const introElapsed = (now - introStartTime) / 1000;

      ctx.clearRect(0, 0, width, height);

      // =======================================================================
      // PHASE A: SLOW, SMOOTH EASE-IN-OUT CONVERGENCE OF FINE DOTS INTO NAME
      // =======================================================================
      if (!introDone) {
        // Soft, progressive fade-in of the solid crisp letterforms only in the final 35% of settling
        const solidTextAlpha = Math.max(
          0,
          Math.min(1, (introElapsed - GENTLE_SETTLE_DURATION * 0.65) / (GENTLE_SETTLE_DURATION * 0.35))
        );
        // Smooth sine ease for the solid glyph cross-dissolve
        const easedSolidAlpha = 0.5 - 0.5 * Math.cos(solidTextAlpha * Math.PI);

        if (easedSolidAlpha > 0.01 && textCanvas) {
          ctx.save();
          ctx.globalAlpha = easedSolidAlpha;
          ctx.drawImage(textCanvas, 0, 0, width, height);
          ctx.restore();
        }

        const effectiveDuration = GENTLE_SETTLE_DURATION - 0.45;

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          const localTime = Math.max(0, introElapsed - p.delay);
          const t = Math.min(1, localTime / effectiveDuration);

          // Pure, ultra-smooth ease-in-out (sine + cubic blend) — starts slowly, glides smoothly, settles gently
          const easeSine = 0.5 - 0.5 * Math.cos(t * Math.PI);
          const easeCubic = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
          const ease = easeSine * 0.55 + easeCubic * 0.45;

          // Gentle ambient float that fades to zero as the dot eases into its letter position
          const floatEnvelope = Math.sin(t * Math.PI) * (1 - ease);
          const curX =
            p.startX + (p.homeX - p.startX) * ease + p.driftX * floatEnvelope;
          const curY =
            p.startY + (p.homeY - p.startY) * ease + p.driftY * floatEnvelope;

          p.x = curX;
          p.y = curY;
          p.displaced = 1 - ease;
        }

        // Subtle soft glow on a subset of fine dots while airborne
        const dotFadeIn = Math.min(1, introElapsed / 0.55);
        ctx.save();
        ctx.globalAlpha = dotFadeIn * (1 - easedSolidAlpha * 0.85);

        for (let i = 0; i < particles.length; i += 3) {
          const p = particles[i];
          if (p.displaced > 0.05) {
            const gR = p.size * 2.8;
            ctx.drawImage(glowSprite, p.x - gR, p.y - gR, gR * 2, gR * 2);
          }
        }

        // Draw crisp, fine white dots
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          const r = p.size;
          ctx.moveTo(p.x + r, p.y);
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        }
        ctx.fill();
        ctx.restore();

        if (introElapsed >= GENTLE_SETTLE_DURATION) {
          introDone = true;
          for (let i = 0; i < particles.length; i++) {
            particles[i].x = particles[i].homeX;
            particles[i].y = particles[i].homeY;
            particles[i].vx = 0;
            particles[i].vy = 0;
            particles[i].displaced = 0;
          }
        }

        animId = requestAnimationFrame(render);
        return;
      }

      // =======================================================================
      // PHASE B: CALM INTERACTIVE TEXT DISINTEGRATION & RECONSTRUCTION
      // =======================================================================
      if (mouse.x < -1000) {
        mouse.x = mouse.targetX;
        mouse.y = mouse.targetY;
        mouse.lastX = mouse.targetX;
        mouse.lastY = mouse.targetY;
      } else {
        mouse.lastX = mouse.x;
        mouse.lastY = mouse.y;
        mouse.x += (mouse.targetX - mouse.x) * 0.35 * dt;
        mouse.y += (mouse.targetY - mouse.y) * 0.35 * dt;
        mouse.vx = (mouse.x - mouse.lastX) / dt;
        mouse.vy = (mouse.y - mouse.lastY) / dt;
      }

      const mouseSpeed = Math.hypot(mouse.vx, mouse.vy);
      const interactRadius = Math.max(48, Math.min(82, width * 0.055));
      const interactRadiusSq = interactRadius * interactRadius;

      // Draw the crisp solid text
      if (textCanvas) {
        ctx.drawImage(textCanvas, 0, 0, width, height);
      }

      let hasDisplaced = false;

      // Process particle physics with calm, smooth spring return
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (mouse.active) {
          const mdx = p.x - mouse.x;
          const mdy = p.y - mouse.y;
          const distSq = mdx * mdx + mdy * mdy;

          if (distSq < interactRadiusSq) {
            const dist = Math.sqrt(distSq);
            const force = Math.pow(1 - dist / interactRadius, 1.45);
            const normX = dist > 0.001 ? mdx / dist : Math.random() - 0.5;
            const normY = dist > 0.001 ? mdy / dist : Math.random() - 0.5;

            const kickMag = (4.2 + mouseSpeed * 0.42) * force;
            p.vx += normX * kickMag;
            p.vy += normY * kickMag;

            p.vx += mouse.vx * 0.25 * force;
            p.vy += mouse.vy * 0.25 * force;

            p.displaced = 1.0;
          }
        }

        if (p.displaced > 0.001) {
          hasDisplaced = true;

          p.wanderAngle += p.wanderSpeed * dt;
          p.vx += Math.cos(p.wanderAngle) * 0.04 * p.displaced * dt;
          p.vy += Math.sin(p.wanderAngle) * 0.04 * p.displaced * dt;

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
          if (distToHome < 0.65 && curSpeed < 0.12) {
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
            const holeR = p.size * (1.35 + p.displaced * 1.8);
            ctx.moveTo(p.homeX + holeR, p.homeY);
            ctx.arc(p.homeX, p.homeY, holeR, 0, Math.PI * 2);
          }
        }
        ctx.fill();

        ctx.globalCompositeOperation = 'source-over';

        for (let i = 0; i < particles.length; i += 2) {
          const p = particles[i];
          if (p.displaced > 0.04) {
            const glowR = p.size * 2.4;
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

  const handleHeroNav = (sectionId: string, label: string) => {
    setIsHeroMenuOpen(false);
    if (onNavigateToSection) {
      onNavigateToSection(sectionId, label);
    } else if (sectionId === 'contact') {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      onScrollToProjects?.();
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[100svh] sm:h-screen bg-transparent text-white flex flex-col justify-between p-4 sm:p-8 lg:p-14 select-none overflow-hidden"
    >
      {/* Decorative ambient star near title (Desktop only) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{ duration: 1.4, delay: 0.8, ease: 'easeInOut' }}
        className="absolute top-[28vh] left-[26vw] z-20 pointer-events-none hidden md:block"
      >
        <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
          <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" />
        </svg>
      </motion.div>

      {/* 1. Top Navigation Bar */}
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-30 flex items-center justify-between w-full"
      >
        {/* Left Brand Emblem: 4-Point Star + Mobile Compact Identity */}
        <div className="flex items-center gap-2.5">
          <svg className="w-5 h-5 sm:w-8 sm:h-8 fill-white shrink-0" viewBox="0 0 24 24">
            <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" />
          </svg>
          <span className="md:hidden text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-300">
            SAHEEM · BLR
          </span>
        </div>

        {/* Desktop & Tablet Navigation (>= 768px) */}
        <nav className="hidden md:flex items-center gap-8 lg:gap-10 font-sans font-bold text-xs uppercase tracking-[0.2em]">
          <Magnetic strength={0.3} radius={20}>
            <button
              type="button"
              onClick={() => handleHeroNav('instrument', 'THE BUILD · FLAGSHIP SYSTEMS')}
              data-magnetic
              className="text-white hover:opacity-50 transition-opacity py-1 whitespace-nowrap shrink-0 uppercase"
            >
              WORK
            </button>
          </Magnetic>
          <Magnetic strength={0.3} radius={20}>
            <button
              type="button"
              onClick={() => handleHeroNav('capabilities', 'CAPABILITY INDEX · TECH STACK')}
              data-magnetic
              className="text-white hover:opacity-50 transition-opacity py-1 whitespace-nowrap shrink-0 uppercase"
            >
              STACK
            </button>
          </Magnetic>
          <Magnetic strength={0.3} radius={20}>
            <button
              type="button"
              onClick={() => handleHeroNav('experience', 'THE WORK · MANIFEST & EXPERIENCE')}
              data-magnetic
              className="text-white hover:opacity-50 transition-opacity py-1 whitespace-nowrap shrink-0 uppercase"
            >
              EXPERIENCE
            </button>
          </Magnetic>
          <Magnetic strength={0.3} radius={20}>
            <button
              type="button"
              onClick={() => handleHeroNav('contact', 'DIRECT CHANNEL · CONTACT')}
              data-magnetic
              className="text-white border border-white px-3 py-1.5 rounded-sm hover:bg-white hover:text-black transition-colors whitespace-nowrap shrink-0 uppercase"
            >
              CONTACT +
            </button>
          </Magnetic>
        </nav>

        {/* Mobile Hamburger Button (< 768px) */}
        <button
          type="button"
          aria-label="Toggle navigation menu"
          onClick={() => setIsHeroMenuOpen((prev) => !prev)}
          className="md:hidden min-h-[42px] min-w-[42px] px-3 border border-white/25 bg-black/80 backdrop-blur-md flex items-center justify-center gap-2.5 active:scale-95 transition-transform"
        >
          <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-white">
            {isHeroMenuOpen ? 'CLOSE' : 'MENU'}
          </span>
          <div className="w-4 h-3 flex flex-col justify-between items-end">
            <span
              className={`h-[1.5px] bg-white transition-all duration-200 ${
                isHeroMenuOpen ? 'w-4 translate-y-[5px] rotate-45' : 'w-4'
              }`}
            />
            <span
              className={`h-[1.5px] bg-white transition-all duration-200 ${
                isHeroMenuOpen ? 'opacity-0 w-0' : 'w-3'
              }`}
            />
            <span
              className={`h-[1.5px] bg-white transition-all duration-200 ${
                isHeroMenuOpen ? 'w-4 -translate-y-[5.5px] -rotate-45' : 'w-4'
              }`}
            />
          </div>
        </button>
      </motion.header>

      {/* Full-Screen Mobile Hamburger Drawer inside Hero (< 768px) */}
      <AnimatePresence>
        {isHeroMenuOpen && (
          <motion.div
            initial={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
            animate={{ opacity: 1, clipPath: 'inset(0 0 0% 0)' }}
            exit={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 bg-[#040404]/98 backdrop-blur-xl flex flex-col justify-between p-5 md:hidden"
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                  <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" />
                </svg>
                <span className="text-xs font-mono uppercase tracking-[0.18em] text-white font-bold">
                  {PROFILE_DATA.name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsHeroMenuOpen(false)}
                className="min-h-[40px] px-3 border border-white/25 bg-white text-black text-[10px] font-mono font-bold uppercase tracking-[0.18em]"
              >
                CLOSE ✕
              </button>
            </div>

            <div className="my-auto py-4 space-y-1">
              <div className="text-[9px] font-mono uppercase tracking-[0.22em] text-neutral-500 mb-2">
                NAVIGATION DIRECTORY
              </div>
              {[
                { id: 'instrument', num: '01', title: 'Flagship Projects', sub: 'Solvyn · CMS · FarmAura · Bot or Not' },
                { id: 'waterfall', num: '02', title: 'Route & Query Waterfall', sub: 'Live SQL, Auth & Latency Telemetry' },
                { id: 'capabilities', num: '03', title: 'Capability Index', sub: 'Java · Python · TypeScript · SQL · OOP' },
                { id: 'experience', num: '04', title: 'Work & Experience', sub: 'Client Production · SIH Finals · Internship' },
                { id: 'notes', num: '05', title: 'Field Notes & Verify', sub: 'Architecture Logs & Live Deployments' },
                { id: 'contact', num: '06', title: 'Direct Contact', sub: PROFILE_DATA.email },
              ].map((item, idx) => (
                <motion.button
                  key={item.id}
                  type="button"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.32, delay: 0.04 + idx * 0.045, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => handleHeroNav(item.id, item.title.toUpperCase())}
                  className="w-full py-3 border-b border-white/[0.08] flex items-center justify-between text-left active:bg-white/[0.05] transition-colors"
                >
                  <div className="flex items-baseline gap-3 min-w-0">
                    <span className="text-[10px] font-mono text-neutral-500 shrink-0">{item.num}</span>
                    <div className="min-w-0">
                      <div className="text-base font-bold text-white tracking-tight truncate">
                        {item.title}
                      </div>
                      <div className="text-[10px] font-mono text-neutral-400 truncate">
                        {item.sub}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-neutral-400 shrink-0 ml-2">→</span>
                </motion.button>
              ))}
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-neutral-400">
              <a href={`mailto:${PROFILE_DATA.email}`} className="text-white font-bold truncate">
                {PROFILE_DATA.email}
              </a>
              <div className="flex items-center gap-4 shrink-0">
                <a href={PROFILE_DATA.github} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  GH ↗
                </a>
                <a href={PROFILE_DATA.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  IN ↗
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Awwwards-style Ribbon Badge on Right Hero Edge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.1, delay: 0.5, ease: 'easeInOut' }}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-30 hidden sm:flex flex-col items-center bg-[#84cfc8] text-white py-3 px-1.5 shadow-md rounded-l-md cursor-pointer hover:bg-[#68beb6] transition-colors"
      >
        <span className="font-bold text-xs tracking-tighter mb-1.5">W.</span>
        <span className="text-[9px] font-bold tracking-widest uppercase [writing-mode:vertical-lr] rotate-180 opacity-90">
          SIH '25
        </span>
      </motion.div>

      {/* 3. Center Interactive Fine-Particle Convergence & Disintegration Canvas */}
      <div className="absolute inset-0 w-full h-full z-10 flex items-center justify-center pointer-events-auto">
        <canvas
          ref={canvasRef}
          className="w-full h-full block md:cursor-none"
          title="Move cursor or touch text to disintegrate into fine white dots and watch it reconstruct"
        />
      </div>

      {/* Seamless Bottom Atmospheric Feather into the Thesis Section */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-b from-transparent via-black/75 to-black z-10" />

      {/* 4. Bottom Intro Text & Reach Out Link */}
      <motion.footer
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-20 flex flex-col sm:flex-row justify-between items-stretch sm:items-end gap-3.5 sm:gap-6 w-full pointer-events-none"
      >
        <div className="pointer-events-auto max-w-md">
          {/* Mobile Compact Status + Stack Line */}
          <div className="flex md:hidden items-center gap-2 text-[9.5px] font-mono uppercase tracking-[0.18em] text-neutral-300 mb-1.5">
            <span className="w-1.5 h-1.5 bg-white inline-block shrink-0" />
            <span>FULL-STACK ENGINEER · SIH &apos;25 FINALIST</span>
          </div>

          <p className="font-sans text-[11.5px] sm:text-[13px] text-neutral-300 leading-relaxed font-medium">
            Full-stack software engineer building across Java, Python, TypeScript, Node.js, and relational SQL databases. Experienced with scalable backend APIs, RLS data security, and high-performance web systems. Feel free to{' '}
            <button
              type="button"
              onClick={() => handleHeroNav('contact', 'DIRECT CHANNEL · CONTACT')}
              data-magnetic
              className="underline font-bold text-white hover:text-neutral-300 transition-colors inline-block"
            >
              reach out here
            </button>.
          </p>
        </div>

        {/* Mobile Compact Action Pair (< 640px) */}
        <div className="grid grid-cols-2 gap-2.5 sm:hidden pointer-events-auto pt-0.5">
          <button
            type="button"
            onClick={() => handleHeroNav('instrument', 'THE BUILD · FLAGSHIP SYSTEMS')}
            className="min-h-[42px] bg-white text-black text-[10px] font-mono font-bold uppercase tracking-[0.16em] flex items-center justify-center active:scale-[0.98] transition-transform"
          >
            EXPLORE WORK ↓
          </button>
          <button
            type="button"
            onClick={() => handleHeroNav('contact', 'DIRECT CHANNEL · CONTACT')}
            className="min-h-[42px] border border-white/25 bg-black/70 text-white text-[10px] font-mono uppercase tracking-[0.16em] flex items-center justify-center active:scale-[0.98] transition-transform"
          >
            CONTACT +
          </button>
        </div>

        {/* Tablet & Desktop Scroll CTA (>= 640px) */}
        <div className="hidden sm:block pointer-events-auto">
          <Magnetic strength={0.3} radius={25}>
            <button
              onClick={() => handleHeroNav('thesis', 'THE THESIS · ENGINEERING PORTFOLIO')}
              data-magnetic
              className="flex items-center gap-3 text-[10px] font-sans font-black uppercase tracking-[0.25em] text-neutral-400 hover:text-white transition-colors py-2 whitespace-nowrap shrink-0"
            >
              <span className="w-6 h-[1.5px] bg-white inline-block"></span>
              <span>SCROLL FOR ARCHITECTURE ↓</span>
            </button>
          </Magnetic>
        </div>
      </motion.footer>
    </div>
  );
}
