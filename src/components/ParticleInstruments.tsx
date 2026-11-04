import React, { useEffect, useRef } from 'react';

interface ParticleEllipsoidProps {
  className?: string;
  width?: number;
  height?: number;
  glowIntensity?: number;
}

/**
 * Renders the signature monochrome stippled 3D particle ellipsoid cluster
 * with an elliptical radial mask, pre-rendered glow sprite, batched path rendering,
 * and IntersectionObserver viewport gating for zero off-screen CPU cost.
 */
export function ParticleEllipsoid({
  className = '',
  width = 260,
  height = 135,
  glowIntensity = 0.16,
}: ParticleEllipsoidProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let isVisible = false;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    const rx = width * 0.4;
    const ry = height * 0.36;
    const cx = width * 0.5;
    const cy = height * 0.5;

    // Pre-render the static elliptical glow once instead of creating a RadialGradient every frame
    const glowSprite = document.createElement('canvas');
    glowSprite.width = width;
    glowSprite.height = height;
    const gCtx = glowSprite.getContext('2d');
    if (gCtx && glowIntensity > 0) {
      gCtx.save();
      gCtx.translate(cx, cy);
      gCtx.scale(1, ry / rx);
      const grad = gCtx.createRadialGradient(0, 0, 1, 0, 0, rx * 0.85);
      grad.addColorStop(0, `rgba(255, 255, 255, ${glowIntensity})`);
      grad.addColorStop(0.45, `rgba(255, 255, 255, ${glowIntensity * 0.28})`);
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      gCtx.fillStyle = grad;
      gCtx.beginPath();
      gCtx.arc(0, 0, rx * 0.85, 0, Math.PI * 2);
      gCtx.fill();
      gCtx.restore();
    }

    const numParticles = 210;
    const particles: {
      theta: number;
      sinPhi: number;
      cosPhi: number;
      r: number;
      size: number;
      bucket: 0 | 1 | 2;
      speed: number;
    }[] = [];

    for (let i = 0; i < numParticles; i++) {
      const u = Math.random();
      const v = Math.random();
      const r = Math.pow(Math.random(), 0.78);
      const theta = u * Math.PI * 2;
      const phi = Math.acos(2 * v - 1);
      const isBright = r < 0.34;
      const bucket: 0 | 1 | 2 = isBright ? 2 : r < 0.72 ? 1 : 0;

      particles.push({
        theta,
        sinPhi: Math.sin(phi),
        cosPhi: Math.cos(phi),
        r,
        size: isBright ? 2.1 : 1.5,
        bucket,
        speed: 0.0035 + (1 - r) * 0.004,
      });
    }

    let time = 0;
    const bucketStyles = [
      'rgba(255, 255, 255, 0.24)',
      'rgba(255, 255, 255, 0.52)',
      'rgba(255, 255, 255, 0.88)',
    ];

    const render = () => {
      if (!isVisible) {
        animId = 0;
        return;
      }

      time += 1;
      ctx.clearRect(0, 0, width, height);

      if (glowIntensity > 0) {
        ctx.drawImage(glowSprite, 0, 0, width, height);
      }

      // Batch draw by brightness bucket (only 3 fill calls per frame)
      for (let b = 0; b < 3; b++) {
        ctx.fillStyle = bucketStyles[b];
        ctx.beginPath();
        for (let i = 0; i < numParticles; i++) {
          const p = particles[i];
          if (p.bucket !== b) continue;
          const currentTheta = p.theta + time * p.speed;
          const x3d = p.r * p.sinPhi * Math.cos(currentTheta);
          const y3d = p.r * p.cosPhi;
          const z3d = p.r * p.sinPhi * Math.sin(currentTheta);
          const tiltY = y3d * 0.72 + z3d * 0.36;

          const px = cx + x3d * rx;
          const py = cy + tiltY * ry;
          ctx.rect(px, py, p.size, p.size);
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
          animId = requestAnimationFrame(render);
        } else if (!isVisible && animId) {
          cancelAnimationFrame(animId);
          animId = 0;
        }
      },
      { threshold: 0.01 }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
      if (animId) cancelAnimationFrame(animId);
    };
  }, [width, height, glowIntensity]);

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none select-none flex items-center justify-center shrink-0 ${className}`}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          maskImage: 'radial-gradient(ellipse 48% 46% at 50% 50%, black 45%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 48% 46% at 50% 50%, black 45%, transparent 100%)',
        }}
        className="block"
      />
    </div>
  );
}

/**
 * Renders the full-width stippled monochrome dot-wave field with soft top/bottom
 * gradient feathering and IntersectionObserver viewport gating.
 */
export function ParticleWaveHorizon({ className = '' }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let isVisible = false;
    let width = container.clientWidth || window.innerWidth;
    const height = 190;

    const handleResize = () => {
      if (!canvas || !container) return;
      width = container.clientWidth || window.innerWidth;
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };

    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });

    const numDots = 680;
    const seeds = Array.from({ length: numDots }, () => {
      const spread = Math.pow(Math.random(), 1.45);
      const bucket: 0 | 1 | 2 = spread < 0.3 ? 2 : spread < 0.65 ? 1 : 0;
      return {
        u: Math.random(),
        v: (Math.random() - 0.5) * 2,
        spread,
        size: bucket === 2 ? 2.0 : 1.4,
        bucket,
      };
    });

    const bucketStyles = [
      'rgba(220, 224, 230, 0.14)',
      'rgba(220, 224, 230, 0.28)',
      'rgba(220, 224, 230, 0.48)',
    ];

    let t = 0;
    const render = () => {
      if (!isVisible) {
        animId = 0;
        return;
      }

      t += 0.012;
      ctx.clearRect(0, 0, width, height);

      for (let b = 0; b < 3; b++) {
        ctx.fillStyle = bucketStyles[b];
        ctx.beginPath();
        for (let i = 0; i < numDots; i++) {
          const s = seeds[i];
          if (s.bucket !== b) continue;
          const x = s.u * width;
          const waveCenterY =
            height * 0.5 +
            Math.sin(s.u * Math.PI * 2.2 + t) * 22 +
            Math.cos(s.u * Math.PI * 4.6 - t * 0.6) * 9;

          const bandThickness = 32 + Math.sin(s.u * Math.PI * 2.8 + t * 0.4) * 12;
          const y = waveCenterY + s.v * s.spread * bandThickness;

          if (y > 8 && y < height - 8) {
            ctx.rect(x, y, s.size, s.size);
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
          animId = requestAnimationFrame(render);
        } else if (!isVisible && animId) {
          cancelAnimationFrame(animId);
          animId = 0;
        }
      },
      { threshold: 0.01 }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[190px] overflow-hidden pointer-events-none select-none ${className}`}
      style={{
        maskImage:
          'linear-gradient(to bottom, transparent 0%, black 22%, black 78%, transparent 100%)',
        WebkitMaskImage:
          'linear-gradient(to bottom, transparent 0%, black 22%, black 78%, transparent 100%)',
      }}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
