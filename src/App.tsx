/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WebGLTextHero } from './components/WebGLTextHero';
import { EngineeringPortfolio } from './components/EngineeringPortfolio';
import { MagneticCursor } from './components/MagneticCursor';
import { AsciiBackground } from './components/AsciiBackground';
import { FluidMotesCursor } from './components/FluidMotesCursor';

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function App() {
  const [transitionState, setTransitionState] = useState<{
    active: boolean;
    label: string;
  }>({ active: false, label: '' });

  const navigateWithTransition = useCallback((sectionId: string, label = 'ENGINEERING PORTFOLIO') => {
    setTransitionState({ active: true, label });

    window.setTimeout(() => {
      if (sectionId === 'top') {
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      } else {
        const el = document.getElementById(sectionId) || document.getElementById('thesis');
        if (el) {
          el.scrollIntoView({ behavior: 'instant' as ScrollBehavior });
        }
      }
    }, 300);

    window.setTimeout(() => {
      setTransitionState({ active: false, label: '' });
    }, 680);
  }, []);

  const scrollToProjects = useCallback(() => {
    navigateWithTransition('thesis', 'THE THESIS · ENGINEERING PORTFOLIO');
  }, [navigateWithTransition]);

  return (
    <div className="bg-[#000000] text-white font-sans selection:bg-white selection:text-black relative min-h-screen overflow-x-hidden">
      {/* Futuristic ASCII Rainfall Background (Pauses automatically when off-screen) */}
      <AsciiBackground />

      {/* Fluid Motes Cursor Swarm (Batched GPU paths) */}
      <FluidMotesCursor />

      {/* Custom Spring-based Magnetic Cursor with Aerodynamic Paper Plane */}
      <MagneticCursor />

      {/* Full-Viewport Framer Motion Page Transition Overlay Curtain */}
      <AnimatePresence>
        {transitionState.active && (
          <motion.div
            key="page-transition-overlay"
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: '0%' }}
            exit={{ opacity: 0, y: '-100%' }}
            transition={{ duration: 0.44, ease: EASE_OUT_EXPO }}
            className="fixed inset-0 z-[90] pointer-events-none bg-[#030303] flex flex-col items-center justify-center"
          >
            <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-transparent to-[#030303]" />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, delay: 0.06, ease: EASE_OUT_EXPO }}
              className="flex flex-col items-center gap-3 px-6 text-center"
            >
              <div className="flex items-center gap-2.5 text-[10px] font-mono uppercase tracking-[0.28em] text-neutral-400">
                <span className="w-1.5 h-1.5 bg-white inline-block animate-pulse" />
                <span>{transitionState.label}</span>
              </div>
              <div className="w-40 h-[1px] bg-white/15 overflow-hidden relative">
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                  className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white to-transparent"
                />
              </div>
            </motion.div>
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-transparent to-[#030303]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Preserved Interactive Charles Rosie Hero Section */}
      <WebGLTextHero
        onScrollToProjects={scrollToProjects}
        onNavigateToSection={navigateWithTransition}
      />

      {/* 2. Full-Stack Engineering Portfolio Below the Fold */}
      <EngineeringPortfolio onNavigateWithTransition={navigateWithTransition} />
    </div>
  );
}
