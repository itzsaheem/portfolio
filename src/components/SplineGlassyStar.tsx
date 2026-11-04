import React, { useEffect, useRef, useState } from 'react';
import { Application } from '@splinetool/runtime';
import { SPLINE_STAR_BYTES } from './splineStarData';

/**
 * SplineGlassyStar
 * Renders the Spline 3D Glassy Star scene natively on a WebGL Canvas:
 * - Instant presentation: particle simulation and intro transitions pre-warmed so the star
 *   is fully formed from the very first frame ("there always" with zero waiting)
 * - Rock-solid 3D interaction: panning disabled and orbital target locked to (0,0,0)
 *   so user interaction smoothly rotates the star in 3D around its center without disappearing or drifting
 * - Fixed 30% reduced scale: zoom locked so the star never grows or shrinks on scroll
 * - Smooth scroll-linked rightward rotation + ambient idle floating rotation
 * - Seamless top and bottom transition into project cards with no abrupt lines
 * - Pure monochrome grayscale theme
 */
export function SplineGlassyStar() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const appRef = useRef<Application | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animId: number;
    let isDisposed = false;
    let lastScrollY = window.scrollY;

    // Initialize with forced WebGL renderer to prevent WebGPU validation errors
    const app = new Application(canvas, { renderer: 'webgl', htmlContentMode: 'inline' });
    appRef.current = app;

    const initSpline = async () => {
      try {
        await (app.start(SPLINE_STAR_BYTES.buffer as any) as any);
        if (isDisposed) {
          try {
            app.dispose();
          } catch (e) {}
          return;
        }

        // Force pitch-black background
        try {
          app.setBackgroundColor('#000000');
        } catch (e) {}

        // 1. PRE-WARM PARTICLES: Run simulation ticks so all 2000 particles are already
        // emitted and pulled into the star attractor geometry immediately
        try {
          const scene = (app as any)._scene;
          if (scene) {
            for (let step = 0; step < 75; step++) {
              scene.traverse?.((entity: any) => {
                if (entity && entity.type === 'ParticleSystem' && typeof entity.update === 'function') {
                  entity.update(0.1);
                }
              });
            }
          }
        } catch (e) {
          console.warn('Particle pre-warm:', e);
        }

        // 2. ADVANCE INTRO TRANSITIONS: Complete all intro tweens (5s / 20s) immediately
        // so the star geometry is already fully formed and never has to slowly assemble
        try {
          const animControls = (app as any)._animationControls;
          if (animControls) {
            if (typeof animControls.update === 'function') {
              animControls.update(25);
            }
            if (animControls.mixer && typeof animControls.mixer.update === 'function') {
              animControls.mixer.update(25);
            }
          }
        } catch (e) {
          console.warn('Animation advance:', e);
        }

        // 3. ENSURE ALL SHAPES ARE VISIBLE
        try {
          const all = app.getAllObjects();
          all.forEach((obj: any) => {
            if (obj && typeof obj.visible === 'boolean') {
              obj.visible = true;
            }
          });
        } catch (e) {}

        // 4. CONFIGURE ORBIT CONTROLS:
        // - Disable Pan: completely prevents the star from moving away or disappearing on interaction
        // - Lock Target: strictly to (0, 0, 0)
        // - Disable Zoom: prevents star from becoming small or large on scroll
        // - Enable AutoRotate: smooth idle floating rotation when not interacting
        // - Scale: set to 0.70 (30% reduction for balanced proportions)
        try {
          const controls = (app as any)._controls?.orbitControls || (app as any).controls?.orbitControls;
          if (controls) {
            // Strictly disable pan so mouse drag never shifts the star off-screen
            controls.enablePan = false;
            controls.panSpeed = 0;
            if (controls.target?.set) {
              controls.target.set(0, 0, 0);
            }

            // Disable zoom so scroll doesn't change star scale
            controls.enableZoom = false;

            // Enable ultra-smooth, slow and heavy rotation with luxurious damping
            controls.enableRotate = true;
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.rotateSpeed = 0.22; // Slowed down significantly for majestic, deliberate control

            // Gentle ambient idle floating rotation
            controls.autoRotate = true;
            controls.autoRotateSpeed = 0.35; // Slow, soothing idle drift
            controls.autoRotateClockwise = true;

            // Make the star dramatically bigger to fill the page (zoom level 2.15)
            if (typeof controls.setZoom === 'function') {
              controls.setZoom(2.15);
            }
            if (typeof app.setZoom === 'function') {
              app.setZoom(2.15);
            }
          }
        } catch (e) {
          console.warn('OrbitControls setup:', e);
        }

        // Prevent Spline internal controls from overriding canvas cursor to grab/grabbing hand
        try {
          canvas.style.setProperty('cursor', 'none', 'important');
          Object.defineProperty(canvas.style, 'cursor', {
            configurable: true,
            get: () => 'none',
            set: () => {},
          });
        } catch (e) {}

        setIsLoaded(true);

        // Initial render pass
        try {
          if (app.requestRender) app.requestRender();
        } catch (e) {}

        // Continuous render loop:
        // OrbitControls handles user drag interaction with natural 3D rotation, damping, and idle rotation
        const renderLoop = () => {
          if (isDisposed) return;

          const controls = (appRef.current as any)?._controls?.orbitControls;
          if (controls) {
            // Ensure center target is locked to star center so it never drifts
            if (controls.target && (controls.target.x !== 0 || controls.target.y !== 0 || controls.target.z !== 0)) {
              controls.target.set(0, 0, 0);
            }

            // Update orbit controls (handles damping + autoRotate + user dragging)
            if (typeof controls.update === 'function') {
              controls.update();
            }
          }

          try {
            if (appRef.current?.requestRender) {
              appRef.current.requestRender();
            }
          } catch (e) {}

          animId = requestAnimationFrame(renderLoop);
        };

        animId = requestAnimationFrame(renderLoop);
      } catch (err) {
        console.error('Failed to start Spline star scene:', err);
      }
    };

    initSpline();

    // Scroll listener: rotates star smoothly in the right direction (clockwise) at calm, deliberate speed
    const handleScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY;
      lastScrollY = currentY;

      const controls = (appRef.current as any)?._controls?.orbitControls;
      if (controls && typeof controls.rotateLeft === 'function') {
        // Slowed down by >6x (0.00035 instead of 0.0022) for smooth, cinematic scroll rotation
        controls.rotateLeft(delta * 0.00035);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Prevent wheel events from changing camera zoom inside the canvas
    const handleWheelCapture = (e: WheelEvent) => {
      e.stopPropagation();
    };
    canvas.addEventListener('wheel', handleWheelCapture, { capture: true, passive: true });

    // Resize handler
    const handleResize = () => {
      if (!canvas || isDisposed) return;
      const rect = canvas.getBoundingClientRect();
      try {
        if (app.setSize) {
          app.setSize(rect.width, rect.height);
        }
      } catch (e) {}
    };

    window.addEventListener('resize', handleResize);

    return () => {
      isDisposed = true;
      cancelAnimationFrame(animId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('wheel', handleWheelCapture, { capture: true });
      if (appRef.current) {
        try {
          appRef.current.dispose();
        } catch (e) {}
        appRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-screen min-h-[95vh] lg:h-[105vh] flex items-center justify-center bg-black select-none pointer-events-auto cursor-none">
      {/* Loading Skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 bg-black cursor-none">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-white/10 border-t-white/70 animate-spin mb-4" />
          <span className="text-[10px] sm:text-[11px] uppercase font-mono tracking-[0.3em] text-neutral-400 animate-pulse">
            INITIALIZING 3D GLASS CORE...
          </span>
        </div>
      )}

      {/* 
        WebGL Canvas with:
        1. Pure Monochrome Grayscale & Contrast Tuning
        2. Soft vertical gradient masking widened to allow the enlarged star to fill the page
        3. Universal paper plane cursor (browser hand cursor strictly removed)
      */}
      <canvas
        ref={canvasRef}
        className={`w-full h-full block bg-black outline-none transition-opacity duration-700 ease-out cursor-none select-none ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          cursor: 'none',
          filter: 'grayscale(100%) contrast(1.18) brightness(1.05)',
          WebkitFilter: 'grayscale(100%) contrast(1.18) brightness(1.05)',
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 3%, black 97%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 3%, black 97%, transparent 100%)',
        }}
      />

      {/* Soft gradient feathers at top and bottom to seamlessly bleed into surrounding sections */}
      <div className="absolute top-0 inset-x-0 h-16 sm:h-24 bg-gradient-to-b from-black via-black/80 to-transparent pointer-events-none z-10" />
      <div className="absolute bottom-0 inset-x-0 h-20 sm:h-28 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none z-10" />
    </div>
  );
}
