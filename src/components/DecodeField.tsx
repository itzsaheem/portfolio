import React, { useEffect, useRef } from 'react';

export function DecodeField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const NOISE = '/\\[]{}<>+=.:_-|~^*#$%?;,'.split('');
    const SIGNAL = 'AIOK01><_#'.split('');
    const CELL = 17;
    let W: number, H: number, cols: number, rows: number;
    let cells: any[] = [];
    const pointers: Record<string, { x: number, y: number, heat: number, releasing?: boolean }> = {};
    let idlePulses: { x: number, y: number, born: number }[] = [];
    let lastIdleSpawn = 0;
    let frame = 0;
    let animationFrameId: number;

    function resize() {
      W = canvas.width = window.innerWidth * window.devicePixelRatio;
      H = canvas.height = window.innerHeight * window.devicePixelRatio;
      const cell = CELL * window.devicePixelRatio;
      cols = Math.ceil(W / cell);
      rows = Math.ceil(H / cell);
      cells = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          cells.push({
            x: c * cell + cell / 2,
            y: r * cell + cell / 2,
            noiseCh: NOISE[Math.floor(Math.random() * NOISE.length)],
            signalCh: SIGNAL[Math.floor(Math.random() * SIGNAL.length)],
            swapAt: Math.random() * 200,
            baseFlicker: Math.random() * Math.PI * 2
          });
        }
      }
      ctx.font = `${13 * window.devicePixelRatio}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
    }

    function addPointer(id: string, x: number, y: number) {
      pointers[id] = { x: x * window.devicePixelRatio, y: y * window.devicePixelRatio, heat: 1 };
    }
    
    function movePointer(id: string, x: number, y: number) {
      if (pointers[id]) {
        pointers[id].x = x * window.devicePixelRatio;
        pointers[id].y = y * window.devicePixelRatio;
        pointers[id].heat = 1;
        pointers[id].releasing = false;
      }
    }
    
    function releasePointer(id: string) {
      if (pointers[id]) pointers[id].releasing = true;
    }

    const handlePointerDown = (e: PointerEvent) => addPointer(e.pointerId.toString(), e.clientX, e.clientY);
    const handlePointerMove = (e: PointerEvent) => {
      if (pointers[e.pointerId.toString()]) {
        movePointer(e.pointerId.toString(), e.clientX, e.clientY);
      } else if (e.pointerType === 'mouse') {
        addPointer('hover', e.clientX, e.clientY);
        pointers['hover'].heat = 0.55;
        pointers['hover'].releasing = true;
      }
    };
    const handlePointerUp = (e: PointerEvent) => releasePointer(e.pointerId.toString());

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    window.addEventListener('pointerleave', handlePointerUp);
    window.addEventListener('resize', resize);

    function draw() {
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, W, H);
      frame++;

      for (const id in pointers) {
        const p = pointers[id];
        if (p.releasing) p.heat *= 0.94;
        if (p.heat < 0.02) delete pointers[id];
      }

      const activeCount = Object.keys(pointers).length;
      if (activeCount === 0 && frame - lastIdleSpawn > 70) {
        lastIdleSpawn = frame;
        idlePulses.push({ x: Math.random() * W, y: Math.random() * H, born: frame });
      }
      idlePulses = idlePulses.filter(ip => frame - ip.born < 90);

      for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];
        let heat = 0;

        for (const id in pointers) {
          const p = pointers[id];
          const dx = cell.x - p.x;
          const dy = cell.y - p.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          const radius = 170 * window.devicePixelRatio;
          const h = Math.max(0, 1 - d / radius) * p.heat;
          heat = Math.max(heat, h);
        }

        for (let k = 0; k < idlePulses.length; k++) {
          const ip = idlePulses[k];
          const age = (frame - ip.born) / 90;
          const ringR = age * 130 * window.devicePixelRatio;
          const dx2 = cell.x - ip.x;
          const dy2 = cell.y - ip.y;
          const d2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
          const ringDist = Math.abs(d2 - ringR);
          const h2 = Math.max(0, 1 - ringDist / (40 * window.devicePixelRatio)) * (1 - age) * 0.7;
          heat = Math.max(heat, h2);
        }

        const ambient = 0.05 + Math.sin(frame * 0.02 + cell.baseFlicker) * 0.02;
        const alpha = Math.min(0.95, ambient + heat * 0.85);

        const showSignal = heat > 0.18;
        const ch = showSignal ? cell.signalCh : cell.noiseCh;

        if (frame % 37 === Math.floor(cell.swapAt) % 37) {
          cell.noiseCh = NOISE[Math.floor(Math.random() * NOISE.length)];
          cell.signalCh = SIGNAL[Math.floor(Math.random() * SIGNAL.length)];
        }

        if (alpha > 0.02) {
          ctx.fillStyle = `rgba(232,232,226,${alpha.toFixed(3)})`;
          ctx.fillText(ch, cell.x, cell.y);
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    }

    resize();
    if (!reduceMotion) draw();
    else {
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, W, H);
    }

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      window.removeEventListener('pointerleave', handlePointerUp);
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 w-full h-full z-0 touch-none pointer-events-none"
      aria-hidden="true"
    />
  );
}
