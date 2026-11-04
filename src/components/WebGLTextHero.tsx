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
  scatterX: number;
  scatterY: number;
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
  // Tornado & scatter intro parameters
  vortexAngle: number;
  vortexHeight: number; // -1 (top crown) to +1 (bottom funnel base)
  vortexRadiusFactor: number;
  orbitSpeed: number;
  settleDelay: number;
  depthZ: number;
}

const INTRO_TOTAL_DURATION = 2.85; // seconds for full scatter -> tornado -> name assembly

export function WebGLTextHero({ onScrollToProjects, onNavigateToSection }: WebGLTextHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isHeroMenuOpen, setIsHeroMenuOpen] = useState(false);
  const [isIntroComplete, setIsIntroComplete] = useState(false);
  const [introProgressPct, setIntroProgressPct] = useState(0);
  const [introStageLabel, setIntroStageLabel] = useState('SCATTERING LUMINOUS MOTES');

  // Lock vertical page scroll briefly while the initial tornado-to-name loading sequence plays
  useEffect(() => {
    if (isIntroComplete) return;
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, [isIntroComplete]);

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

    // Pre-rendered 48x48 radial glow sprite for GPU-accelerated glowing white spheres
    const glowSprite = document.createElement('canvas');
    glowSprite.width = 48;
    glowSprite.height = 48;
    const gCtx = glowSprite.getContext('2d');
    if (gCtx) {
      const grad = gCtx.createRadialGradient(24, 24, 0, 24, 24, 24);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      grad.addColorStop(0.22, 'rgba(255, 255, 255, 0.58)');
      grad.addColorStop(0.52, 'rgba(220, 235, 255, 0.18)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      gCtx.fillStyle = grad;
      gCtx.fillRect(0, 0, 48, 48);
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
    let introFinishedLocal = false;
    let lastReportedPct = -1;

    const CONFIG = {
      line1: 'S Mohammed',
      line2: 'Saheem',
      fontFamily: "'Charles Rosie', 'Charles Rosie Regular', 'Orange Avenue', 'Arexa', serif",
    };

    // Rasterizes crisp text to offscreen canvas and extracts particle grid
    // If preserveFlight is true (e.g. when webfont finishes loading mid-tornado), keeps in-flight coordinates
    const rasterizeAndSampleParticles = (preserveFlight = false) => {
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

      const step = Math.max(4, Math.round(5.2 * (dpr / 1.5)));
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

            const isCore = Math.random() < 0.36;
            const size = isCore ? 2.15 : Math.random() < 0.6 ? 1.65 : 1.3;

            const existing =
              preserveFlight && prevParticles.length > 0
                ? prevParticles[pCount % prevParticles.length]
                : null;

            const scatterX = existing ? existing.scatterX : Math.random() * width;
            const scatterY = existing ? existing.scatterY : Math.random() * height;
            const vortexHeight = existing ? existing.vortexHeight : Math.random() * 2 - 1;
            const vortexAngle = existing ? existing.vortexAngle : Math.random() * Math.PI * 2;
            const vortexRadiusFactor = existing
              ? existing.vortexRadiusFactor
              : 0.28 + Math.random() * 0.98;
            const orbitSpeed = existing ? existing.orbitSpeed : 4.4 + Math.random() * 3.8;
            const settleDelay =
              ((homeX / Math.max(1, width)) * 0.28) + Math.random() * 0.16;

            newParticles.push({
              homeX,
              homeY,
              scatterX,
              scatterY,
              x: existing ? existing.x : scatterX,
              y: existing ? existing.y : scatterY,
              vx: existing ? existing.vx : (Math.random() - 0.5) * 14,
              vy: existing ? existing.vy : (Math.random() - 0.5) * 14,
              size,
              baseAlpha: alpha / 255,
              displaced: introFinishedLocal ? 0 : 1,
              springK: 0.055 + Math.random() * 0.028,
              damping: 0.88 + Math.random() * 0.035,
              wanderAngle: Math.random() * Math.PI * 2,
              wanderSpeed: (0.015 + Math.random() * 0.02) * (Math.random() < 0.5 ? 1 : -1),
              vortexAngle,
              vortexHeight,
              vortexRadiusFactor,
              orbitSpeed,
              settleDelay,
              depthZ: 0,
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

    // Initial build with scatter coordinates
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

    // Load custom Charles Rosie font and update particle home targets without interrupting tornado flight
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

      // Clear main canvas frame
      ctx.clearRect(0, 0, width, height);

      // =======================================================================
      // PHASE A: LOADING TORNADO VORTEX -> "S MOHAMMED SAHEEM" ASSEMBLY
      // =======================================================================
      if (!introFinishedLocal) {
        const rawPct = Math.min(100, Math.round((introElapsed / INTRO_TOTAL_DURATION) * 100));
        if (rawPct !== lastReportedPct) {
          lastReportedPct = rawPct;
          setIntroProgressPct(rawPct);
          if (introElapsed < 0.55) {
            setIntroStageLabel('SCATTERING LUMINOUS MOTES');
          } else if (introElapsed < 1.45) {
            setIntroStageLabel('IGNITING PARTICLE TORNADO VORTEX');
          } else {
            setIntroStageLabel('CONVERGING INTO S MOHAMMED SAHEEM');
          }
        }

        const isMobile = width < 768;
        const centerX = width * 0.5;
        const centerY = isMobile ? height * 0.43 : height * 0.5;
        const maxFunnelW = isMobile ? width * 0.36 : width * 0.25;
        const funnelHalfH = isMobile ? height * 0.34 : height * 0.41;

        // Subtle atmospheric vortex core glow while tornado is active
        const vortexIntensity =
          introElapsed < 1.35
            ? Math.min(1, introElapsed / 0.45)
            : Math.max(0, 1 - (introElapsed - 1.35) / 1.1);

        if (vortexIntensity > 0.02) {
          ctx.save();
          const funnelGrad = ctx.createRadialGradient(
            centerX,
            centerY,
            4,
            centerX,
            centerY,
            maxFunnelW * 1.35
          );
          funnelGrad.addColorStop(0, `rgba(255, 255, 255, ${0.11 * vortexIntensity})`);
          funnelGrad.addColorStop(0.5, `rgba(255, 255, 255, ${0.035 * vortexIntensity})`);
          funnelGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = funnelGrad;
          ctx.fillRect(0, 0, width, height);
          ctx.restore();
        }

        // Progressive base glyph fade-in during the final lock-in (2.15s -> 2.85s)
        const glyphRevealAlpha = Math.max(
          0,
          Math.min(1, (introElapsed - 2.15) / (INTRO_TOTAL_DURATION - 2.15))
        );
        if (glyphRevealAlpha > 0.01 && textCanvas) {
          ctx.save();
          ctx.globalAlpha = glyphRevealAlpha;
          ctx.drawImage(textCanvas, 0, 0, width, height);
          ctx.restore();
        }

        // Update each particle along: Chaotic Scatter -> 3D Swirling Tornado -> Home Glyph Lock-In
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];

          // 1. Chaotic random wandering position ("go here and there randomly")
          const chaosX =
            p.scatterX +
            Math.cos(introElapsed * 5.2 + p.vortexAngle * 2) * 48 +
            Math.sin(introElapsed * 8.1 + i * 0.13) * 24;
          const chaosY =
            p.scatterY +
            Math.sin(introElapsed * 4.8 + p.vortexAngle * 2) * 48 +
            Math.cos(introElapsed * 7.4 + i * 0.17) * 24;

          // 2. 3D Swirling Tornado Funnel coordinates
          // Funnel widens toward top (vortexHeight = -1) and tightens toward base (vortexHeight = +1)
          const hNorm = p.vortexHeight; // -1..1
          const funnelShape = 0.16 + Math.pow((1 - hNorm) * 0.5, 1.25) * 0.92;
          const currentRadius = maxFunnelW * funnelShape * p.vortexRadiusFactor;

          // Sinuous S-curve tornado spine bend
          const spineSwayX =
            Math.sin(hNorm * 3.4 - introElapsed * 6.2) * (isMobile ? 22 : 42) * (1 - Math.abs(hNorm) * 0.35);

          // Fast angular swirl (faster near the tight bottom core)
          const spinAngle =
            p.vortexAngle + introElapsed * p.orbitSpeed * (1.75 - hNorm * 0.45);

          const cosA = Math.cos(spinAngle);
          const sinA = Math.sin(spinAngle); // depthZ: -1 (back of funnel) to +1 (front of funnel)
          p.depthZ = sinA;

          const tornadoX = centerX + spineSwayX + cosA * currentRadius;
          const tornadoY = centerY + hNorm * funnelHalfH + sinA * 16;

          // Blend from initial chaotic scatter into the swirling tornado (0.0s -> 0.65s)
          const pullIntoTornado = Math.min(1, introElapsed / 0.62);
          const smoothPull = pullIntoTornado * pullIntoTornado * (3 - 2 * pullIntoTornado);

          const activeVortexX = chaosX + (tornadoX - chaosX) * smoothPull;
          const activeVortexY = chaosY + (tornadoY - chaosY) * smoothPull;

          // 3. Convergence from Tornado into "S Mohammed Saheem" (1.28s -> 2.80s)
          const settleStart = 1.25 + p.settleDelay;
          const settleDuration = 1.12;
          const rawSettle = Math.max(
            0,
            Math.min(1, (introElapsed - settleStart) / settleDuration)
          );

          // Quartic ease-out for magnetic snap into the letterforms
          const easeSettle = 1 - Math.pow(1 - rawSettle, 4);

          // Spiral arc flair during flight from tornado to letter glyph
          const arcLift = Math.sin(rawSettle * Math.PI) * (1 - rawSettle) * 36;
          const arcAngle = spinAngle + rawSettle * 2.2;

          p.x =
            activeVortexX +
            (p.homeX - activeVortexX) * easeSettle +
            Math.cos(arcAngle) * arcLift;
          p.y =
            activeVortexY +
            (p.homeY - activeVortexY) * easeSettle +
            Math.sin(arcAngle) * arcLift;

          p.displaced = 1 - easeSettle;
          p.vx = 0;
          p.vy = 0;
        }

        // Draw glowing white halos for particles in flight (batched stride for 120fps)
        const glowStride = particles.length > 2200 ? 2 : 1;
        for (let i = 0; i < particles.length; i += glowStride) {
          const p = particles[i];
          if (p.displaced > 0.03) {
            const depthBoost = 1 + p.depthZ * 0.38 * p.displaced;
            const glowR = p.size * (2.6 + p.displaced * 2.4) * Math.max(0.6, depthBoost);
            ctx.drawImage(glowSprite, p.x - glowR, p.y - glowR, glowR * 2, glowR * 2);
          }
        }

        // Draw crisp glowing white spherical cores
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          // Fade out individual particle circles only at the very end as solid vector glyph takes over
          if (p.displaced > 0.01 || glyphRevealAlpha < 0.98) {
            const depthBoost = 1 + p.depthZ * 0.32 * p.displaced;
            const ballRadius = p.size * (0.95 + p.displaced * 0.55) * Math.max(0.65, depthBoost);
            ctx.moveTo(p.x + ballRadius, p.y);
            ctx.arc(p.x, p.y, ballRadius, 0, Math.PI * 2);
          }
        }
        ctx.fill();

        if (introElapsed >= INTRO_TOTAL_DURATION) {
          introFinishedLocal = true;
          for (let i = 0; i < particles.length; i++) {
            particles[i].x = particles[i].homeX;
            particles[i].y = particles[i].homeY;
            particles[i].vx = 0;
            particles[i].vy = 0;
            particles[i].displaced = 0;
          }
          setIntroProgressPct(100);
          setIsIntroComplete(true);
        }

        animId = requestAnimationFrame(render);
        return;
      }

      // =======================================================================
      // PHASE B: INTERACTIVE HERO TEXT DISINTEGRATION & RECONSTRUCTION
      // =======================================================================
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
      const interactRadius = Math.max(52, Math.min(88, width * 0.058));
      const interactRadiusSq = interactRadius * interactRadius;

      // Autonomous harmonic shimmer wave when pointer is idle
      const idleTime = now * 0.0012;
      const idleWaveX = width * (0.5 + Math.sin(idleTime * 1.1) * 0.32);
      const idleWaveY =
        (width < 768 ? height * 0.41 : height * 0.49) +
        Math.cos(idleTime * 1.7) * (height * 0.06);
      const idleRadius = width < 768 ? 26 : 34;
      const idleRadiusSq = idleRadius * idleRadius;

      // Draw the crisp solid text
      if (textCanvas) {
        ctx.drawImage(textCanvas, 0, 0, width, height);
      }

      let hasDisplaced = false;

      // Process particle physics with buttery-smooth spring return
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (mouse.active) {
          const mdx = p.x - mouse.x;
          const mdy = p.y - mouse.y;
          const distSq = mdx * mdx + mdy * mdy;

          if (distSq < interactRadiusSq) {
            const dist = Math.sqrt(distSq);
            const force = Math.pow(1 - dist / interactRadius, 1.35);
            const normX = dist > 0.001 ? mdx / dist : Math.random() - 0.5;
            const normY = dist > 0.001 ? mdy / dist : Math.random() - 0.5;

            const kickMag = (5.8 + mouseSpeed * 0.55) * force;
            p.vx += normX * kickMag;
            p.vy += normY * kickMag;

            p.vx += mouse.vx * 0.32 * force;
            p.vy += mouse.vy * 0.32 * force;

            p.vx += -normY * (Math.random() - 0.5) * 3.2 * force;
            p.vy += normX * (Math.random() - 0.5) * 3.2 * force;

            p.displaced = 1.0;
          }
        } else if (i % 7 === 0) {
          const idx = p.homeX - idleWaveX;
          const idy = p.homeY - idleWaveY;
          const iDistSq = idx * idx + idy * idy;
          if (iDistSq < idleRadiusSq && p.displaced < 0.15) {
            const iDist = Math.sqrt(iDistSq);
            const iForce = (1 - iDist / idleRadius) * 0.45;
            p.vx += Math.cos(idleTime * 2 + i) * 1.4 * iForce;
            p.vy -= (0.9 + Math.random() * 0.8) * iForce;
            p.displaced = 0.65;
          }
        }

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
      {/* Loading Tornado HUD (Visible only while glowing balls swirl in tornado & form S Mohammed Saheem) */}
      <AnimatePresence>
        {!isIntroComplete && (
          <motion.div
            key="tornado-loading-hud"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: 'blur(6px)' }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-none fixed inset-x-0 bottom-8 sm:bottom-12 z-40 flex flex-col items-center justify-center px-6"
          >
            <div className="flex items-center gap-3 text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.24em] text-neutral-300 mb-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_#fff] animate-pulse" />
              <span>{introStageLabel}</span>
              <span className="text-white font-bold tabular-nums">{introProgressPct}%</span>
            </div>
            <div className="w-48 sm:w-64 h-[1.5px] bg-white/15 overflow-hidden relative">
              <div
                className="h-full bg-white shadow-[0_0_12px_#ffffff] transition-all duration-75 ease-out"
                style={{ width: `${introProgressPct}%` }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative ambient star near title (Desktop only, reveals after tornado settles) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={isIntroComplete ? { opacity: 0.8, scale: 1 } : { opacity: 0, scale: 0.5 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="absolute top-[28vh] left-[26vw] z-20 pointer-events-none hidden md:block"
      >
        <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
          <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" />
        </svg>
      </motion.div>

      {/* 1. Top Navigation Bar (Reveals smoothly once glowing tornado settles into S Mohammed Saheem) */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={isIntroComplete ? { opacity: 1, y: 0 } : { opacity: 0, y: -16 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className={`relative z-30 flex items-center justify-between w-full ${
          isIntroComplete ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
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
        initial={{ opacity: 0, x: 20 }}
        animate={isIntroComplete ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
        transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-30 hidden sm:flex flex-col items-center bg-[#84cfc8] text-white py-3 px-1.5 shadow-md rounded-l-md cursor-pointer hover:bg-[#68beb6] transition-colors"
      >
        <span className="font-bold text-xs tracking-tighter mb-1.5">W.</span>
        <span className="text-[9px] font-bold tracking-widest uppercase [writing-mode:vertical-lr] rotate-180 opacity-90">
          SIH '25
        </span>
      </motion.div>

      {/* 3. Center Interactive Text Tornado-to-Name & Disintegration Canvas (100% Unobstructed) */}
      <div className="absolute inset-0 w-full h-full z-10 flex items-center justify-center pointer-events-auto">
        <canvas
          ref={canvasRef}
          className="w-full h-full block md:cursor-none"
          title="Move cursor or touch text to disintegrate into white balls and watch it reconstruct"
        />
      </div>

      {/* Seamless Bottom Atmospheric Feather into the Thesis Section */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-b from-transparent via-black/75 to-black z-10" />

      {/* 4. Bottom Intro Text & Reach Out Link (Reveals smoothly once tornado locks into S Mohammed Saheem) */}
      <motion.footer
        initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
        animate={
          isIntroComplete
            ? { opacity: 1, y: 0, filter: 'blur(0px)' }
            : { opacity: 0, y: 18, filter: 'blur(6px)' }
        }
        transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        className={`relative z-20 flex flex-col sm:flex-row justify-between items-stretch sm:items-end gap-3.5 sm:gap-6 w-full ${
          isIntroComplete ? 'pointer-events-none' : 'pointer-events-none'
        }`}
      >
        <div className={isIntroComplete ? 'pointer-events-auto max-w-md' : 'pointer-events-none max-w-md'}>
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
        <div
          className={`grid grid-cols-2 gap-2.5 sm:hidden pt-0.5 ${
            isIntroComplete ? 'pointer-events-auto' : 'pointer-events-none'
          }`}
        >
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
        <div className={`hidden sm:block ${isIntroComplete ? 'pointer-events-auto' : 'pointer-events-none'}`}>
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
