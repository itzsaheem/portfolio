import React, { useState, useEffect } from 'react';

interface TypewriterProps {
  text: string;
  speed?: number;       // Milliseconds per character
  delay?: number;       // Initial delay in ms before typing begins
  isTriggered: boolean; // Starts typing when true
  className?: string;
  onComplete?: () => void;
}

export function Typewriter({
  text,
  speed = 14,
  delay = 120,
  isTriggered,
  className = '',
  onComplete,
}: TypewriterProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let index = 0;

    if (isTriggered) {
      setDisplayedText('');
      setIsTyping(true);

      const delayTimer = setTimeout(() => {
        timer = setInterval(() => {
          if (index < text.length) {
            setDisplayedText(text.slice(0, index + 1));
            index++;
          } else {
            clearInterval(timer);
            setIsTyping(false);
            if (onComplete) onComplete();
          }
        }, speed);
      }, delay);

      return () => {
        clearTimeout(delayTimer);
        clearInterval(timer);
      };
    } else {
      setDisplayedText('');
      setIsTyping(false);
    }
  }, [isTriggered, text, speed, delay, onComplete]);

  return (
    <span className={className}>
      {displayedText}
      {isTriggered && isTyping && (
        <span className="inline-block w-[6px] h-[14px] ml-1 bg-[#D7E2EA] animate-pulse align-middle" />
      )}
    </span>
  );
}
