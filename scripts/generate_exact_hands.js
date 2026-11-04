import fs from 'fs';

// Accurate character ramp based on monospace glyph visual density
const CHARS = " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";

const W = 190;
const H = 68;

function createGrid(w, h) {
  const g = [];
  for (let y = 0; y < h; y++) {
    g.push(new Float32Array(w));
  }
  return g;
}

// Distance from point (px, py) to line segment (x1, y1)-(x2, y2)
function distToSegment(px, py, x1, y1, x2, y2) {
  const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
  if (l2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
}

// Signed distance from point to polygon
function pointInPoly(px, py, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1];
    const xj = poly[j][0], yj = poly[j][1];
    const intersect = ((yi > py) !== (yj > py)) &&
        (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

const grid = createGrid(W, H);

// -------------------------------------------------------------------------
// 1. LEFT HAND (God's Hand - Reference Image)
// Starts at x = 0 (flush left edge) from y = 9 to y = 32
// Forearm extends across cols 0..30
// Palm at cols 25..55
// Index finger extends to tip at col 84, row 34
// Middle finger curls down to col 75, row 44
// Ring finger curls down to col 64, row 43
// Pinky finger curls down to col 55, row 42
// Thumb extends down-forward to col 42, row 37
// -------------------------------------------------------------------------

const leftHandMainPoly = [
  [-1, 9],       // Left edge top
  [12, 9],       // Upper forearm
  [24, 10],      // Distal forearm
  [36, 12],      // Wrist joint
  [48, 14],      // Dorsal metacarpal
  [58, 17],      // Metacarpophalangeal ridge
  [67, 21],      // Index proximal
  [76, 27],      // Index medial
  [83, 33],      // Index distal
  [86, 35],      // Index fingertip (reaching toward right hand)
  [84, 37],      // Index fingertip pad
  [77, 34],      // Index underside
  [68, 27],      // First interdigital cleft
  // Middle finger
  [71, 32],      // Middle proximal
  [76, 39],      // Middle medial
  [76, 43],      // Middle fingertip
  [72, 44],      // Middle tip pad
  [66, 35],      // Second interdigital cleft
  // Ring finger
  [68, 39],      // Ring medial
  [67, 43],      // Ring fingertip
  [63, 43],      // Ring tip pad
  [59, 36],      // Third interdigital cleft
  // Pinky finger
  [61, 40],      // Pinky medial
  [59, 43],      // Pinky fingertip
  [55, 43],      // Pinky tip pad
  [51, 36],      // Hypothenar crease
  // Thumb
  [46, 33],      // Thenar base
  [43, 37],      // Thumb proximal
  [41, 41],      // Thumb tip
  [37, 40],      // Thumb pad
  [35, 33],      // Thenar eminence
  [28, 31],      // Ventral carpus
  [16, 31],      // Lower forearm
  [-1, 31]       // Left edge bottom (flush left edge)
];

// -------------------------------------------------------------------------
// 2. RIGHT HAND (Adam's Hand - Reference Image)
// Forearm extends all the way to x = W (flush right edge) from y = 24 to y = 47
// Index finger reaches horizontally to the left, tip at col 106, row 32
// Thumb points slightly up/left at cols 132..140, row 30
// Middle finger curls straight down to col 133, row 57
// Ring finger curls straight down to col 142, row 57
// Pinky finger curls down to col 151, row 55
// Wrist/palm at cols 135..165, row 26..46
// Forearm at cols 165..190, row 24..47
// -------------------------------------------------------------------------

const rightHandMainPoly = [
  [W + 1, 24],   // Right edge top (flush right edge)
  [176, 24],     // Forearm dorsal
  [162, 26],     // Pre-wrist dorsal
  [150, 27],     // Carpal ridge
  [140, 29],     // Metacarpal II
  [129, 30],     // Knuckle II
  [118, 31],     // Index proximal
  [110, 31.5],   // Index medial
  [105, 32],     // Index fingertip (reaching toward left hand!)
  [105, 34],     // Index tip pad
  [114, 34.5],   // Index underside
  [126, 35],     // Index/middle cleft
  // Middle finger (curling down)
  [128, 41],     // Middle knuckle
  [128, 48],     // Middle medial
  [129, 57],     // Middle fingertip
  [134, 57],     // Middle tip pad
  [135, 47],     // Middle/ring crease
  // Ring finger (curling down)
  [137, 57],     // Ring fingertip
  [142, 57],     // Ring tip pad
  [143, 46],     // Ring/pinky crease
  // Pinky finger (curling down)
  [146, 55],     // Pinky fingertip
  [151, 55],     // Pinky tip pad
  [153, 41],     // Hypothenar margin
  [160, 44],     // Carpus ventral
  [172, 45],     // Forearm ventral
  [W + 1, 46]    // Right edge bottom (flush right edge)
];

// Thumb polygon for Adam's hand
const rightThumbPoly = [
  [138, 32],
  [132, 29],
  [127, 28],     // Thumb tip
  [127, 30.5],
  [132, 33],
  [140, 35]
];

// Cross-contour lines for anatomical muscle rendering
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    let lum = 0;

    // --- LEFT HAND ---
    if (pointInPoly(x, y, leftHandMainPoly)) {
      // Base luminosity
      lum = 0.58;

      // Top dorsal highlight (arm and hand top edge)
      const topDist = Math.abs(y - (9 + x * 0.18));
      if (topDist < 2.0 && x < 55) {
        lum += 0.35; // Bright highlight along top of left forearm
      }

      // Index finger dorsal highlight
      const indexDorsal = distToSegment(x, y, 58, 17, 85, 35);
      if (indexDorsal < 1.4) {
        lum += 0.38; // Bright highlight on index finger
      }

      // Middle finger highlight
      const middleDorsal = distToSegment(x, y, 66, 26, 76, 42);
      if (middleDorsal < 1.2) {
        lum += 0.32;
      }

      // Knuckle highlights
      if (Math.hypot(x - 58, y - 17) < 2.5 || Math.hypot(x - 67, y - 21) < 2.2) {
        lum += 0.30;
      }

      // Underside shading
      if (y > 27 && x < 40) {
        lum -= 0.18; // Forearm underside shadow
      }
      if (y > 33 && x > 48 && x < 72) {
        // Deep shadow between curled fingers
        const cleftDist = Math.min(
          distToSegment(x, y, 68, 27, 66, 35),
          distToSegment(x, y, 64, 34, 61, 40)
        );
        if (cleftDist < 1.0) {
          lum -= 0.32;
        }
      }

      // High-frequency muscle and tendon striations
      const striation = Math.sin((x * 0.85 + y * 0.45) * 4.2) * 0.10;
      lum += striation;

      // Noise texture matching authentic ASCII art
      const hash = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
      lum += (hash - Math.floor(hash)) * 0.16;
    }

    // --- RIGHT HAND ---
    if (pointInPoly(x, y, rightHandMainPoly) || pointInPoly(x, y, rightThumbPoly)) {
      lum = 0.58;

      // Index finger dorsal highlight (horizontal line y = 31..32, x = 106..130)
      const indexDorsal = distToSegment(x, y, 105, 32, 130, 30);
      if (indexDorsal < 1.3) {
        lum += 0.40; // Signature bright highlight on Adam's index finger!
      }

      // Top of forearm highlight (x = 145..W, y = 24..27)
      const forearmTop = distToSegment(x, y, 140, 29, W, 24);
      if (forearmTop < 1.8) {
        lum += 0.34;
      }

      // Thumb highlight
      const thumbDist = distToSegment(x, y, 138, 32, 127, 28);
      if (thumbDist < 1.3) {
        lum += 0.35;
      }

      // Knuckle highlights on back of hand
      if (Math.hypot(x - 129, y - 30) < 2.5 || Math.hypot(x - 140, y - 29) < 2.5) {
        lum += 0.28;
      }

      // Curled vertical fingers: alternating highlight and shadow ribs
      if (y >= 40 && y <= 57 && x >= 126 && x <= 152) {
        // Finger columns: Middle (128-134), Ring (136-142), Pinky (145-151)
        const isMiddleCol = Math.abs(x - 131) < 2.2;
        const isRingCol = Math.abs(x - 139) < 2.2;
        const isPinkyCol = Math.abs(x - 148) < 2.2;

        if (isMiddleCol || isRingCol || isPinkyCol) {
          // Horizontal knuckle crease shadows
          const crease = Math.sin((y - 40) * 0.7);
          lum += crease * 0.16;
        } else {
          // Dark space between fingers
          lum -= 0.35;
        }
      }

      // Underside of forearm shadow
      if (y > 40 && x > 155) {
        lum -= 0.20;
      }

      // Palm shadow under index finger
      if (y > 33 && y < 40 && x > 115 && x < 128) {
        lum -= 0.22;
      }

      const striation = Math.sin((x * 0.75 - y * 0.55) * 4.2) * 0.10;
      lum += striation;

      const hash = Math.sin(x * 17.3821 + y * 91.192) * 43758.5453;
      lum += (hash - Math.floor(hash)) * 0.16;
    }

    grid[y][x] = Math.max(0, Math.min(1.0, lum));
  }
}

// Convert luminance grid to ASCII strings
const lines = [];
for (let y = 0; y < H; y++) {
  let line = "";
  for (let x = 0; x < W; x++) {
    const val = grid[y][x];
    if (val <= 0.08) {
      line += " ";
    } else {
      const idx = Math.min(CHARS.length - 1, Math.floor(val * (CHARS.length - 1)));
      line += CHARS[idx];
    }
  }
  lines.push(line);
}

const fileContent = `// Exact High-Fidelity Creation of Adam Hands ASCII Art
// Left hand enters flush from col 0, Right hand enters flush to col ${W - 1}
export const HANDS_ASCII: string[] = ${JSON.stringify(lines, null, 2)};
`;

fs.writeFileSync('src/components/asciiData.ts', fileContent);
console.log('Successfully written exact hands ASCII. Rows:', lines.length, 'Cols:', lines[0].length);
