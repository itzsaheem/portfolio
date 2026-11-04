import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

interface MagneticProps {
  children: React.ReactNode;
  className?: string;
  strength?: number; // 0 to 1, default 0.35
  radius?: number; // maximum displacement distance in px, default 30
}

export function Magnetic({ 
  children, 
  className = '', 
  strength = 0.35, 
  radius = 30 
}: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Natural physics-based spring with responsive pull and buttery smooth settling
  const springConfig = { stiffness: 320, damping: 22, mass: 0.5 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (clientX - centerX) * strength;
    const deltaY = (clientY - centerY) * strength;

    const dist = Math.hypot(deltaX, deltaY);
    if (dist > radius) {
      const angle = Math.atan2(deltaY, deltaX);
      x.set(Math.cos(angle) * radius);
      y.set(Math.sin(angle) * radius);
    } else {
      x.set(deltaX);
      y.set(deltaY);
    }
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.div>
  );
}
