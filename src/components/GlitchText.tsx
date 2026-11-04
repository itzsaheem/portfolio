import React, { useRef, useEffect, useId } from 'react';
import { motion, useSpring, useTransform, useMotionValue, useMotionValueEvent } from 'motion/react';

function GlitchChar({ char }: { char: string; key?: React.Key }) {
  const ref = useRef<HTMLSpanElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const filterRef = useRef<SVGFEDisplacementMapElement>(null);
  
  const id = useId().replace(/:/g, "");
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const distort = useMotionValue(0);
  
  // Smooth springs for the dissipating movement
  const springConfig = { stiffness: 80, damping: 12, mass: 1 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);
  // Slower spring for the distortion so the smoke lingers slightly
  const springDistort = useSpring(distort, { stiffness: 40, damping: 15 });

  // Update SVG filter directly for performance
  useMotionValueEvent(springDistort, "change", (latest) => {
    if (filterRef.current) {
      filterRef.current.setAttribute("scale", latest.toString());
    }
  });

  const handleMouseMove = (e: React.MouseEvent) => {
    // Cap movement limits to prevent letters flying too far
    const factor = 3;
    const mx = Math.max(-60, Math.min(60, e.movementX * factor));
    const my = Math.max(-60, Math.min(60, e.movementY * factor));
    
    // Push the letter in the cursor's direction
    x.set(mx);
    y.set(my);
    
    // Spike the water/smoke distortion
    distort.set(80);
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      // Return to normal
      x.set(0);
      y.set(0);
      distort.set(0);
    }, 250);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    x.set(0);
    y.set(0);
    distort.set(0);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Split glitch layers apart along the movement path
  const redX = useTransform(springX, v => v * 0.8);
  const redY = useTransform(springY, v => v * 0.8);
  const cyanX = useTransform(springX, v => v * -0.4);
  const cyanY = useTransform(springY, v => v * -0.4);

  // Combine SVG filter with CSS blur for realistic smoke dissipation
  const compositeFilter = useTransform(springDistort, (v) => `url(#smoke-${id}) blur(${v * 0.05}px)`);
  const opacityStyle = useTransform(springDistort, [0, 80], [1, 0.3]);

  return (
    <span 
      ref={ref} 
      className="relative inline-block whitespace-pre"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <svg className="absolute w-0 h-0 pointer-events-none">
        <defs>
          <filter id={`smoke-${id}`} x="-100%" y="-100%" width="300%" height="300%">
            <feTurbulence 
              type="fractalNoise" 
              baseFrequency="0.03 0.06" 
              numOctaves="3" 
              result="noise" 
            >
              <animate 
                attributeName="baseFrequency" 
                values="0.03 0.06; 0.04 0.08; 0.03 0.06" 
                dur="4s" 
                repeatCount="indefinite" 
              />
            </feTurbulence>
            <feDisplacementMap 
              ref={filterRef}
              in="SourceGraphic" 
              in2="noise" 
              scale="0" 
              xChannelSelector="R" 
              yChannelSelector="G" 
            />
          </filter>
        </defs>
      </svg>
      
      <motion.span 
        className="relative z-10 block"
        style={{ 
          x: springX, 
          y: springY, 
          filter: compositeFilter,
          opacity: opacityStyle
        }}
      >
        {/* Cyan layer */}
        <motion.span 
          className="absolute top-0 left-0 text-cyan mix-blend-lighten pointer-events-none opacity-30"
          style={{ x: cyanX, y: cyanY }}
        >
          {char}
        </motion.span>
        
        {/* Red layer */}
        <motion.span 
          className="absolute top-0 left-0 text-accent mix-blend-lighten pointer-events-none opacity-30"
          style={{ x: redX, y: redY }}
        >
          {char}
        </motion.span>
        
        {/* Main layer */}
        <span className="relative z-10 pointer-events-none block">
          {char}
        </span>
      </motion.span>
    </span>
  );
}

export function GlitchText({ text, className = "" }: { text: string; className?: string }) {
  return (
    <div className={`relative inline-block select-none cursor-default ${className}`}>
      {text.split("").map((char, i) => (
        <GlitchChar key={i} char={char} />
      ))}
    </div>
  );
}

