import React from 'react';
import { SplineGlassyStar } from './SplineGlassyStar';

/**
 * HeroTransition
 * Seamless showcase for the 3D Spline Glassy Star between the hero and projects.
 * - Reduced scale by 30% for balanced aesthetic
 * - Continuous bleed into the cards section with negative bottom margin
 * - No abrupt top or bottom borders
 * - Fixed scale with no growth on scroll down
 */
export function HeroTransition(_props?: { onScrollToProjects?: () => void }) {
  return (
    <section className="relative w-full min-h-screen lg:min-h-[105vh] flex items-center justify-center pointer-events-auto z-10 select-none bg-black -mb-12 sm:-mb-16 cursor-none">
      {/* Subtle Ethereal Ambient Glow behind the Star */}
      <div className="absolute w-[650px] h-[650px] sm:w-[900px] sm:h-[900px] bg-white/[0.045] rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* 3D Glassy Star */}
      <SplineGlassyStar />
    </section>
  );
}
