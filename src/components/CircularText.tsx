import React, { useState } from 'react';
import { motion } from 'motion/react';

export function CircularText({ className = "" }: { className?: string }) {
  const text = "FULL-STACK WEB DEVELOPER • CREATIVE TECHNOLOGIST • ";
  const characters = text.split("");
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div 
      className={`relative w-40 h-40 flex items-center justify-center cursor-pointer select-none group ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Outer subtle orbital ring */}
      <div className="absolute inset-1 rounded-full border border-fg/10 group-hover:border-fg/30 transition-colors duration-500"></div>

      {/* Center Diamond/Star Emblem */}
      <motion.div 
        className="w-8 h-8 rounded-[4px] bg-fg flex items-center justify-center shadow-sm relative z-10"
        animate={{ 
          rotate: isHovered ? [45, 225] : 45,
          scale: isHovered ? 1.15 : 1
        }}
        transition={{ duration: isHovered ? 0.8 : 0.4, ease: "easeInOut" }}
      >
        <div className="w-2.5 h-2.5 bg-bg rounded-[1px] rotate-45"></div>
      </motion.div>
      
      {/* Rotating Circular Typography */}
      <motion.div 
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: isHovered ? 8 : 18, repeat: Infinity, ease: "linear" }}
      >
        {characters.map((char, i) => (
          <span
            key={i}
            className="absolute left-1/2 -ml-[0.5ch] top-0 origin-[50%_80px] text-[9px] font-mono font-medium tracking-[0.22em] uppercase text-fg/80 group-hover:text-fg transition-colors"
            style={{ transform: `rotate(${i * (360 / characters.length)}deg)` }}
          >
            {char}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
