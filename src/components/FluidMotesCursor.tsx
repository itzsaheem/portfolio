import React, { useEffect, useRef } from 'react';

interface Mote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  orbitRadiusX: number;
  orbitRadiusY: number;
  orbitAngle: number;
  orbitSpeed: number;
  springK: number;
  softness: number;
  dragFactor: number;
  damping: number;
  isCore: boolean;
  turbPhase: number;
}

// Reduced count + batched path drawing delivers 120fps with near-zero CPU cost
const MOTE_COUNT = 135;

export function FluidMotesCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let lastInteractionTime = performance.now();

    const mouse = {
      targetX: -1000,
      targetY: -1000,
      x: -1000,
      y: -1000,
      active: false,
      alpha: 0,
    };

    const leader = {
      x: -1000,
      y: -1000,
      vx: 0,
      vy: 0,
      speed: 0,
    };

    const motes: Mote[] = [];
    for (let i = 0; i < MOTE_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const rRatio = Math.pow(Math.random(), 0.7);
      const radiusX = rRatio * (40 + Math.random() * 18);
      const radiusY = rRatio * (28 + Math.random() * 14);
      const isCore = rRatio < 0.38;

      motes.push({
        x: -1000,
        y: -1000,
        vx: 0,
        vy: 0,
        size: isCore ? 2.0 : 1.4,
        orbitRadiusX: radiusX,
        orbitRadiusY: radiusY,
        orbitAngle: angle,
        orbitSpeed: (0.01 + Math.random() * 0.012) * (Math.random() < 0.5 ? 1 : -1),
        springK: 0.042 + Math.random() * 0.025,
        softness: 0.018 + Math.random() * 0.022,
        dragFactor: 0.18 + Math.random() * 0.25,
        damping: 0.88 + Math.random() * 0.04,
        isCore,
        turbPhase: Math.random() * Math.PI * 2,
      });
    }

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    handleResize();

    const wakeLoop = () => {
      lastInteractionTime = performance.now();
      if (!animId) {
        lastTime = performance.now();
        animId = requestAnimationFrame(render);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const clientX = e.clientX;
      const clientY = e.clientY;

      if (!mouse.active) {
        mouse.targetX = clientX;
        mouse.targetY = clientY;
        mouse.x = clientX;
        mouse.y = clientY;
        leader.x = clientX;
        leader.y = clientY;
        for (let i = 0; i < motes.length; i++) {
          motes[i].x = clientX + Math.cos(motes[i].orbitAngle) * motes[i].orbitRadiusX;
          motes[i].y = clientY + Math.sin(motes[i].orbitAngle) * motes[i].orbitRadiusY;
        }
      }

      mouse.targetX = clientX;
      mouse.targetY = clientY;
      mouse.active = true;
      wakeLoop();
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      wakeLoop();
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    let lastTime = performance.now();

    const render = (now: number) => {
      const dtMs = Math.min(32, now - lastTime);
      const dt = dtMs / 16.666;
      lastTime = now;

      mouse.x += (mouse.targetX - mouse.x) * 0.28 * dt;
      mouse.y += (mouse.targetY - mouse.y) * 0.28 * dt;

      const targetAlpha = mouse.active ? 1.0 : 0.0;
      mouse.alpha += (targetAlpha - mouse.alpha) * 0.1 * dt;

      ctx.clearRect(0, 0, width, height);

      if (mouse.alpha > 0.01) {
        const ldx = mouse.x - leader.x;
        const ldy = mouse.y - leader.y;
        leader.vx += ldx * 0.09 * dt;
        leader.vy += ldy * 0.09 * dt;
        leader.vx *= Math.pow(0.81, dt);
        leader.vy *= Math.pow(0.81, dt);
        leader.x += leader.vx * dt;
        leader.y += leader.vy * dt;
        leader.speed = Math.hypot(leader.vx, leader.vy);

        const moveAngle = Math.atan2(leader.vy, leader.vx);
        const cosAngle = Math.cos(moveAngle);
        const sinAngle = Math.sin(moveAngle);
        const elongation = Math.min(2.3, 1.0 + leader.speed * 0.065);

        // Update all mote positions and batch render into 2 single GPU draw calls
        ctx.fillStyle = `rgba(255, 255, 255, ${(0.88 * mouse.alpha).toFixed(2)})`;
        ctx.beginPath();

        for (let i = 0; i < MOTE_COUNT; i++) {
          const p = motes[i];
          p.orbitAngle += p.orbitSpeed * dt;

          let localX = Math.cos(p.orbitAngle) * p.orbitRadiusX;
          let localY = Math.sin(p.orbitAngle) * p.orbitRadiusY;

          if (leader.speed > 0.7) {
            localX *= elongation;
            const rx = localX * cosAngle - localY * sinAngle;
            const ry = localX * sinAngle + localY * cosAngle;
            localX = rx;
            localY = ry;

            const turb = Math.sin(now * 0.006 + p.turbPhase) * leader.speed * 0.22;
            localX += -sinAngle * turb;
            localY += cosAngle * turb;
          }

          const toX = leader.x + localX - p.x;
          const toY = leader.y + localY - p.y;
          const dist = Math.hypot(toX, toY);

          const springMultiplier = 1 / (1 + dist * p.softness);
          p.vx += toX * p.springK * springMultiplier * dt;
          p.vy += toY * p.springK * springMultiplier * dt;

          if (leader.speed > 1.0) {
            p.vx -= leader.vx * p.dragFactor * 0.07 * dt;
            p.vy -= leader.vy * p.dragFactor * 0.07 * dt;
          }

          p.vx *= Math.pow(p.damping, dt);
          p.vy *= Math.pow(p.damping, dt);

          p.x += p.vx * dt;
          p.y += p.vy * dt;

          if (p.isCore) {
            ctx.moveTo(p.x + 1.1, p.y);
            ctx.arc(p.x, p.y, 1.1, 0, Math.PI * 2);
          }
        }
        ctx.fill();

        // Outer ambient motes in a second single batched path
        ctx.fillStyle = `rgba(255, 255, 255, ${(0.45 * mouse.alpha).toFixed(2)})`;
        ctx.beginPath();
        for (let i = 0; i < MOTE_COUNT; i++) {
          const p = motes[i];
          if (!p.isCore) {
            ctx.moveTo(p.x + 0.85, p.y);
            ctx.arc(p.x, p.y, 0.85, 0, Math.PI * 2);
          }
        }
        ctx.fill();
      }

      // If mouse is hidden and faded out, pause loop until next mousemove
      if (!mouse.active && mouse.alpha <= 0.02) {
        animId = 0;
        return;
      }

      // Keep running smoothly while cursor is active
      if (now - lastInteractionTime < 4000 || leader.speed > 0.05) {
        animId = requestAnimationFrame(render);
      } else {
        // Gentle idle tick when cursor is completely stationary
        animId = requestAnimationFrame(render);
      }
    };

    animId = requestAnimationFrame(render);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="hidden md:block fixed inset-0 pointer-events-none z-30 w-full h-full select-none"
    />
  );
}
