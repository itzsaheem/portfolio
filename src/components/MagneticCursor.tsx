import React, { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

export type CursorVariant = 'default' | 'pointer' | 'magnetic' | 'card' | 'text';

export interface CursorState {
  variant: CursorVariant;
  text?: string;
  isMouseDown: boolean;
}

export function MagneticCursor() {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [cursorState, setCursorState] = useState<CursorState>({
    variant: 'default',
    text: '',
    isMouseDown: false,
  });

  // Raw mouse coordinates
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  
  // Continuous unwrapped angle (starts at -45° to point up-left naturally)
  const continuousAngleRef = useRef(-45);
  const planeAngle = useMotionValue(-45);

  // Smooth responsive spring for cursor position
  const springConfig = { stiffness: 500, damping: 32, mass: 0.2 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Smooth aerodynamic banking spring for plane heading
  const angleSpringConfig = { stiffness: 280, damping: 24 };
  const smoothAngle = useSpring(planeAngle, angleSpringConfig);

  const lastPos = useRef({ x: -100, y: -100 });
  const lastHitTestTime = useRef(0);

  useEffect(() => {
    const touchQuery = window.matchMedia('(pointer: coarse)');
    const isTouch = touchQuery.matches || 'ontouchstart' in window;
    if (isTouch) {
      setIsTouchDevice(true);
      return;
    }

    document.documentElement.classList.add('custom-cursor-active');

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      mouseX.set(clientX);
      mouseY.set(clientY);

      if (!isVisible) setIsVisible(true);

      const dx = clientX - lastPos.current.x;
      const dy = clientY - lastPos.current.y;
      const speed = Math.hypot(dx, dy);

      // Dynamically bank the paper airplane smoothly in the direction of flight
      // Fixes circular movement right-to-left: angle unwrapping prevents 360-degree flip
      if (speed > 1.2 && lastPos.current.x !== -100) {
        const moveAngleRad = Math.atan2(dy, dx);
        // Plane SVG nose is oriented at -45° (top-right at 29,3 in 32x32)
        // Add 45° to align nose with vector (dx, dy)
        const targetDeg = (moveAngleRad * 180) / Math.PI + 45;

        // Calculate shortest angular path around circle to prevent flips/shakes
        let diff = (targetDeg - continuousAngleRef.current) % 360;
        if (diff > 180) diff -= 360;
        if (diff < -180) diff += 360;

        continuousAngleRef.current += diff;
        planeAngle.set(continuousAngleRef.current);
        // NOTE: No timeout to reset angle — when movement stops, plane remains in the exact heading it was left!
      }

      lastPos.current = { x: clientX, y: clientY };

      // Identify interactive element under cursor (throttled to ~40ms to eliminate layout thrashing)
      const now = performance.now();
      if (now - lastHitTestTime.current > 40) {
        lastHitTestTime.current = now;
        const element = document.elementFromPoint(clientX, clientY) as HTMLElement | null;
        if (element) {
          const interactive = element.closest(
            'a, button, [role="button"], [data-cursor], [data-magnetic], input, textarea'
          ) as HTMLElement | null;

          if (interactive) {
            const cursorAttr = interactive.getAttribute('data-cursor');
            if (cursorAttr) {
              setCursorState(prev => ({ ...prev, variant: 'card', text: cursorAttr }));
            } else {
              setCursorState(prev => ({ ...prev, variant: 'pointer', text: '' }));
            }
          } else {
            setCursorState(prev => ({ ...prev, variant: 'default', text: '' }));
          }
        }
      }
    };

    const handleMouseDown = () => setCursorState(prev => ({ ...prev, isMouseDown: true }));
    const handleMouseUp = () => setCursorState(prev => ({ ...prev, isMouseDown: false }));
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      document.documentElement.classList.remove('custom-cursor-active');
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isVisible, mouseX, mouseY, planeAngle]);

  if (isTouchDevice) return null;

  const isMouseDown = cursorState.isMouseDown;
  const isPointer = cursorState.variant === 'pointer' || cursorState.variant === 'card';

  return (
    <div className="pointer-events-none fixed inset-0 z-[999999] overflow-hidden select-none">
      <motion.div
        className="absolute top-0 left-0 pointer-events-none flex items-center justify-center"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: '-50%',
          translateY: '-50%',
          rotate: smoothAngle,
          opacity: isVisible ? 1 : 0,
        }}
        animate={{
          scale: isMouseDown ? 0.8 : isPointer ? 1.25 : 1.0,
        }}
        transition={{ type: 'spring', stiffness: 450, damping: 25 }}
      >
        {/* Sleek Aerodynamic Origami Paper Plane (White on Black) */}
        <div className="relative flex items-center justify-center">
          <svg 
            viewBox="0 0 32 32" 
            className="w-6 h-6 sm:w-7 sm:h-7 drop-shadow-[0_2px_12px_rgba(255,255,255,0.22)]"
            fill="none"
          >
            {/* Main Upper Wing */}
            <path 
              d="M29 3L3 14.5L13.5 18.5L29 3Z" 
              fill="#ffffff" 
            />
            {/* Lower Wing Fold */}
            <path 
              d="M29 3L13.5 18.5L17.5 29L29 3Z" 
              fill="#e2e8f0" 
            />
            {/* Center Crease / Underbody */}
            <path 
              d="M13.5 18.5L16 23L17.5 29L13.5 18.5Z" 
              fill="#94a3b8" 
            />
            {/* Subtle crease fold */}
            <path 
              d="M29 3L13.5 18.5" 
              stroke="#0f172a" 
              strokeWidth="0.6" 
              strokeOpacity="0.35" 
            />
          </svg>

          {/* Interactive badge chip floating beside plane */}
          {cursorState.variant === 'card' && cursorState.text && (
            <div className="absolute left-8 top-0 whitespace-nowrap bg-white text-black text-[9px] font-sans font-bold tracking-widest px-2.5 py-1 rounded shadow-lg uppercase">
              {cursorState.text}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
