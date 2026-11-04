import fs from 'fs';

// Helper to map brightness 0..1 to ASCII chars
const DENSITY = "       .:-=+*#%@";

function createGrid(w, h) {
  const g = [];
  for (let y = 0; y < h; y++) {
    g.push(new Float32Array(w));
  }
  return g;
}

// Generate Creation of Adam hands
function generateHands(w, h) {
  const grid = createGrid(w, h);

  // Left hand: enters from left-top (x: 0..0.48, y: 0.15..0.65)
  // Right hand: enters from right-bottom (x: 0.52..1.0, y: 0.35..0.85)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const nx = x / w;
      const ny = y / h;

      let val = 0;

      // --- Left Arm & Hand (God's hand reaching down & right) ---
      // Wrist / Arm: from (0.0, 0.25) to (0.18, 0.32)
      const dArmL = Math.hypot(nx - 0.08, ny - 0.28);
      if (nx < 0.22 && Math.abs(ny - (0.22 + nx * 0.4)) < 0.12 - nx * 0.02) {
        val = Math.max(val, 0.75 - Math.abs(ny - (0.22 + nx * 0.4)) * 3.5);
      }
      // Palm: center around (0.26, 0.36)
      const dPalmL = Math.hypot(nx - 0.26, (ny - 0.36) * 1.3);
      if (dPalmL < 0.11) {
        val = Math.max(val, 0.85 - dPalmL * 4.0);
      }
      // Index finger pointing toward (0.47, 0.45)
      const tIdxL = (nx - 0.28) / (0.47 - 0.28);
      if (tIdxL >= 0 && tIdxL <= 1.0) {
        const fingerYL = 0.38 + tIdxL * 0.08 + Math.sin(tIdxL * Math.PI) * 0.02;
        const distFingerL = Math.abs(ny - fingerYL);
        const widthL = 0.028 * (1.0 - tIdxL * 0.45);
        if (distFingerL < widthL) {
          val = Math.max(val, 0.95 - (distFingerL / widthL) * 0.5);
        }
      }
      // Thumb
      const tThumbL = (nx - 0.22) / (0.33 - 0.22);
      if (tThumbL >= 0 && tThumbL <= 1.0) {
        const thumbYL = 0.31 + tThumbL * 0.04;
        const dThumb = Math.abs(ny - thumbYL);
        if (dThumb < 0.022) val = Math.max(val, 0.7 - dThumb * 15.0);
      }
      // Other fingers curled below index
      for (let f = 1; f <= 3; f++) {
        const tF = (nx - 0.25) / (0.38 - f * 0.025 - 0.25);
        if (tF >= 0 && tF <= 1.0) {
          const fY = 0.42 + f * 0.05 + Math.sin(tF * 2.2) * 0.08;
          const dF = Math.abs(ny - fY);
          if (dF < 0.022) val = Math.max(val, 0.65 - dF * 14.0);
        }
      }

      // --- Right Arm & Hand (Adam's hand reaching up & left) ---
      // Wrist / Arm: from (1.0, 0.65) to (0.80, 0.58)
      if (nx > 0.78 && Math.abs(ny - (0.58 + (1.0 - nx) * 0.35)) < 0.13 - (1.0 - nx) * 0.02) {
        val = Math.max(val, 0.75 - Math.abs(ny - (0.58 + (1.0 - nx) * 0.35)) * 3.5);
      }
      // Palm: around (0.74, 0.54)
      const dPalmR = Math.hypot(nx - 0.74, (ny - 0.54) * 1.3);
      if (dPalmR < 0.11) {
        val = Math.max(val, 0.85 - dPalmR * 4.0);
      }
      // Index finger pointing toward (0.53, 0.47)
      const tIdxR = (0.72 - nx) / (0.72 - 0.53);
      if (tIdxR >= 0 && tIdxR <= 1.0) {
        const fingerYR = 0.52 - tIdxR * 0.05 - Math.sin(tIdxR * Math.PI) * 0.015;
        const distFingerR = Math.abs(ny - fingerYR);
        const widthR = 0.026 * (1.0 - tIdxR * 0.45);
        if (distFingerR < widthR) {
          val = Math.max(val, 0.95 - (distFingerR / widthR) * 0.5);
        }
      }
      // Thumb
      const tThumbR = (0.76 - nx) / (0.76 - 0.66);
      if (tThumbR >= 0 && tThumbR <= 1.0) {
        const thumbYR = 0.46 - tThumbR * 0.02;
        const dThumbR = Math.abs(ny - thumbYR);
        if (dThumbR < 0.022) val = Math.max(val, 0.7 - dThumbR * 15.0);
      }
      // Other fingers curled below index
      for (let f = 1; f <= 3; f++) {
        const tF = (0.72 - nx) / (0.72 - (0.60 + f * 0.02));
        if (tF >= 0 && tF <= 1.0) {
          const fY = 0.56 + f * 0.05 + Math.sin(tF * 2.2) * 0.08;
          const dF = Math.abs(ny - fY);
          if (dF < 0.022) val = Math.max(val, 0.65 - dF * 14.0);
        }
      }

      // Add skin fold / anatomical texture
      if (val > 0.1) {
        const hash = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
        val += (hash - Math.floor(hash) - 0.5) * 0.15;
      }

      grid[y][x] = Math.max(0, Math.min(1, val));
    }
  }

  return grid;
}

// Generate Great Wave off Kanagawa
function generateWave(w, h) {
  const grid = createGrid(w, h);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const nx = x / w;
      const ny = y / h;

      let val = 0;

      // 1. Towering Wave Crest (left side rising up to crest at x~0.38, y~0.12)
      // Wave ridge path:
      const crestY = 0.85 - Math.sin(nx * Math.PI * 0.8) * 0.72;
      const waveBody = ny - crestY;

      if (waveBody > -0.05 && waveBody < 0.7) {
        // Deep water body
        val = 0.45 + (1.0 - Math.abs(waveBody - 0.25)) * 0.4;
      }

      // Claw-like curling foam tentacles (froth)
      if (nx > 0.25 && nx < 0.52 && ny < crestY + 0.15) {
        for (let claw = 0; claw < 7; claw++) {
          const clawX = 0.32 + claw * 0.028;
          const clawY = 0.12 + Math.sin(claw * 1.5) * 0.08;
          const dClaw = Math.hypot((nx - clawX) * 1.5, ny - clawY);
          if (dClaw < 0.045) {
            val = Math.max(val, 0.95 - dClaw * 12.0);
          }
        }
      }

      // Secondary wave on the right (x: 0.6..1.0)
      const crestRightY = 0.75 - Math.sin((nx - 0.5) * Math.PI) * 0.35;
      if (nx > 0.55 && ny > crestRightY) {
        val = Math.max(val, 0.5 + Math.sin((ny - crestRightY) * 20.0) * 0.2);
      }

      // Mount Fuji in the low center background (x: 0.58..0.66, y: 0.65..0.76)
      if (nx > 0.56 && nx < 0.66) {
        const peakX = 0.61;
        const peakY = 0.64;
        const slope = Math.abs(nx - peakX) * 1.6;
        if (ny > peakY + slope && ny < 0.76) {
          val = Math.max(val, 0.7 - (ny - (peakY + slope)) * 2.0);
        }
      }

      // Sea water ripples & lines
      if (ny > 0.65) {
        const ripple = Math.sin(nx * 40.0 + ny * 60.0) * 0.15;
        val += ripple;
      }

      // Vertical Japanese calligraphy "大きな波" on upper right (x: 0.74..0.82, y: 0.08..0.55)
      if (nx > 0.74 && nx < 0.82 && ny > 0.06 && ny < 0.52) {
        const charSlot = Math.floor((ny - 0.06) / 0.11);
        const charLocalY = (ny - 0.06) % 0.11;
        const charLocalX = (nx - 0.74) / 0.08;

        // Draw kanji stroke patterns
        if (charLocalX > 0.15 && charLocalX < 0.85 && charLocalY > 0.015 && charLocalY < 0.095) {
          // Cross & slash strokes of kanji/hiragana
          const stroke = Math.sin(charLocalX * 18.0) * Math.cos(charLocalY * 25.0);
          if (Math.abs(stroke) > 0.35) {
            val = Math.max(val, 0.85);
          }
        }
      }

      // Texture noise
      if (val > 0.1) {
        const hash = Math.sin(x * 37.1 + y * 91.7) * 43758.5453;
        val += (hash - Math.floor(hash) - 0.5) * 0.12;
      }

      grid[y][x] = Math.max(0, Math.min(1, val));
    }
  }

  return grid;
}

function gridToAscii(grid) {
  return grid.map(row => {
    let s = "";
    for (let i = 0; i < row.length; i++) {
      const v = row[i];
      const idx = Math.floor(v * (DENSITY.length - 1));
      s += DENSITY[idx];
    }
    return s;
  });
}

const handsGrid = generateHands(160, 60);
const waveGrid = generateWave(160, 75);

const handsAscii = gridToAscii(handsGrid);
const waveAscii = gridToAscii(waveGrid);

const out = `// Generated ASCII Art data for background
export const HANDS_ASCII: string[] = ${JSON.stringify(handsAscii)};

export const WAVE_ASCII: string[] = ${JSON.stringify(waveAscii)};
`;

fs.writeFileSync('./src/components/asciiData.ts', out);
console.log('ASCII data successfully written to src/components/asciiData.ts');
