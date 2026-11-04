import React, { useEffect, useRef } from 'react';

const ASCII_CHARS = '0123456789ABCDEFｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ[]{}<>+=-*~:;|_/\\#&%$@!?';

interface RainColumn {
  x: number;
  y: number;
  baseSpeed: number;
  length: number;
  chars: string[];
  resetTimer: number;
}

export function AsciiBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animId = 0;
    let isVisible = true;
    let width = window.innerWidth;
    let height = Math.floor(window.innerHeight * 1.35);

    // Wider column spacing & capped frame interval for ultra-low CPU usage
    const charSize = 12;
    const colWidth = 24;
    const rowHeight = 20;
    let numCols = Math.floor(width / colWidth);
    let numRows = Math.floor(height / rowHeight);

    let columns: RainColumn[] = [];

    const randomChar = () => ASCII_CHARS[Math.floor(Math.random() * ASCII_CHARS.length)];

    const initColumns = () => {
      numCols = Math.floor(width / colWidth);
      numRows = Math.floor(height / rowHeight);
      columns = [];

      for (let i = 0; i < numCols; i++) {
        const length = Math.floor(Math.random() * 12) + 10;
        const chars: string[] = [];
        for (let j = 0; j < length; j++) {
          chars.push(randomChar());
        }

        columns.push({
          x: i * colWidth + colWidth / 2,
          y: Math.floor(Math.random() * numRows * 1.2) - numRows * 0.3,
          baseSpeed: 0.14 + Math.random() * 0.16,
          length,
          chars,
          resetTimer: 0,
        });
      }
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = Math.floor(window.innerHeight * 1.35);
      // Use DPR 1 for background matrix rain to cut pixel fill cost by up to 4x
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      initColumns();
    };

    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });

    let lastFrameTime = 0;
    const frameInterval = 1000 / 30; // 30fps is silky for slow ambient ASCII rain and uses minimal CPU

    const render = (now: number) => {
      if (!isVisible) {
        animId = 0;
        return;
      }

      if (now - lastFrameTime >= frameInterval) {
        lastFrameTime = now;

        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);

        ctx.font = `500 ${charSize}px "JetBrains Mono", "Courier New", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const visibleMaxY = Math.min(height, window.innerHeight + 80);

        for (let i = 0; i < columns.length; i++) {
          const col = columns[i];

          if (col.resetTimer > 0) {
            col.resetTimer--;
            continue;
          }

          col.y += col.baseSpeed;
          const headRow = Math.floor(col.y);

          for (let t = 0; t < col.length; t++) {
            const charRow = headRow - t;
            const charY = charRow * rowHeight;

            if (charY < -rowHeight || charY > visibleMaxY) continue;

            let bottomFade = 1.0;
            if (charY > height * 0.42) {
              const bottomProgress = Math.min(1, (charY - height * 0.42) / (height * 0.58));
              bottomFade = (1 - bottomProgress) * (1 - bottomProgress);
            }

            if (bottomFade <= 0.02) continue;

            const char = col.chars[t % col.chars.length];
            const trailRatio = 1 - t / col.length;
            const alpha = (t === 0 ? 0.58 : 0.04 + trailRatio * 0.14) * bottomFade;

            ctx.fillStyle = `rgba(215, 226, 234, ${alpha.toFixed(2)})`;
            ctx.fillText(char, col.x, charY);
          }

          if (headRow - col.length > numRows) {
            col.y = -Math.floor(Math.random() * 8);
            col.baseSpeed = 0.14 + Math.random() * 0.16;
            col.resetTimer = Math.floor(Math.random() * 5);
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    // Pause completely when scrolled past the Hero section
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        isVisible = entry.isIntersecting;
        if (isVisible && !animId) {
          lastFrameTime = performance.now();
          animId = requestAnimationFrame(render);
        } else if (!isVisible && animId) {
          cancelAnimationFrame(animId);
          animId = 0;
        }
      },
      { threshold: 0.01 }
    );

    observer.observe(container);
    animId = requestAnimationFrame(render);

    return () => {
      observer.disconnect();
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute top-0 left-0 w-full h-[135vh] pointer-events-none z-0 overflow-hidden select-none bg-black"
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
      <div
        className="absolute bottom-0 left-0 w-full h-[45vh] pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.25) 30%, rgba(0,0,0,0.7) 65%, rgba(0,0,0,0.94) 85%, #000000 100%)',
        }}
      />
    </div>
  );
}
