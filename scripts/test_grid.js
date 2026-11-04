// Test complete glyph generation for 1920x1080 and 1440x900 screens

const CHAR_RAMP = "   .:-=+*#%@MW&80Q";

function sampleHands(nx, ny) {
  let val = 0;

  // nx is 0..1 (0 = left screen edge, 1 = right screen edge)
  // ny is 0..1 (top to bottom of hands area)

  // ==========================================
  // LEFT HAND (God's hand emerging from LEFT EDGE nx <= 0.0)
  // ==========================================
  if (nx < 0.53) {
    // 1. Forearm (nx: 0.0 to 0.22)
    // Left edge (nx = 0.0) has full arm thickness!
    if (nx <= 0.22) {
      const topArm = 0.12 + nx * 0.45;
      const botArm = 0.40 + nx * 0.42;
      if (ny >= topArm && ny <= botArm) {
        const thickness = botArm - topArm;
        const normY = (ny - topArm) / thickness;
        const muscle = Math.sin(normY * Math.PI);
        const striation = 0.88 + 0.12 * Math.sin(ny * 80.0);
        val = Math.max(val, (0.55 + 0.42 * muscle) * striation);
      }
    }

    // 2. Wrist and Palm (nx: 0.16 to 0.36)
    const palmDist = Math.hypot((nx - 0.25) * 1.3, (ny - 0.36) * 1.6);
    if (palmDist < 0.18) {
      const palmShade = 0.58 + 0.38 * (1.0 - palmDist / 0.18);
      val = Math.max(val, palmShade);
    }

    // Knuckle ridge on back of left hand
    const dKnuckleL = Math.hypot((nx - 0.29) * 1.4, (ny - 0.30) * 1.9);
    if (dKnuckleL < 0.13) {
      val = Math.max(val, 0.72 + 0.26 * (1.0 - dKnuckleL / 0.13));
    }

    // 3. Left Index Finger (reaching toward Adam: (0.28, 0.29) to (0.46, 0.52))
    const lx0 = 0.28, ly0 = 0.29, lx1 = 0.46, ly1 = 0.52;
    const ldx = lx1 - lx0, ldy = ly1 - ly0;
    const lLenSq = ldx * ldx + ldy * ldy;
    const lt = Math.max(0, Math.min(1, ((nx - lx0) * ldx + (ny - ly0) * ldy) / lLenSq));
    const lprojX = lx0 + lt * ldx;
    const lprojY = ly0 + lt * ldy;
    const ldist = Math.hypot(nx - lprojX, (ny - lprojY) * 1.15);
    const lradius = 0.026 * (1.0 - lt * 0.42);
    if (ldist < lradius) {
      const fingerShade = 0.68 + 0.32 * (1.0 - ldist / lradius);
      val = Math.max(val, fingerShade);
    }

    // 4. Thumb (from (0.20, 0.42) to (0.30, 0.56))
    const tx0 = 0.20, ty0 = 0.42, tx1 = 0.30, ty1 = 0.56;
    const tdx = tx1 - tx0, tdy = ty1 - ty0;
    const tLenSq = tdx * tdx + tdy * tdy;
    const tt = Math.max(0, Math.min(1, ((nx - tx0) * tdx + (ny - ty0) * tdy) / tLenSq));
    const tdist = Math.hypot(nx - (tx0 + tt * tdx), ny - (ty0 + tt * tdy));
    const tradius = 0.024 * (1.0 - tt * 0.35);
    if (tdist < tradius) {
      val = Math.max(val, 0.62 + 0.35 * (1.0 - tdist / tradius));
    }

    // 5. Middle Finger (curves down: from (0.30, 0.35) to (0.41, 0.64))
    const mx0 = 0.30, my0 = 0.35, mx1 = 0.41, my1 = 0.64;
    const mdx = mx1 - mx0, mdy = my1 - my0;
    const mLenSq = mdx * mdx + mdy * mdy;
    const mt = Math.max(0, Math.min(1, ((nx - mx0) * mdx + (ny - my0) * mdy) / mLenSq));
    const mdist = Math.hypot(nx - (mx0 + mt * mdx), ny - (my0 + mt * mdy));
    const mradius = 0.025 * (1.0 - mt * 0.38);
    if (mdist < mradius) {
      val = Math.max(val, 0.64 + 0.34 * (1.0 - mdist / mradius));
    }

    // 6. Ring finger (from (0.28, 0.40) to (0.36, 0.67))
    const rx0 = 0.28, ry0 = 0.40, rx1 = 0.36, ry1 = 0.67;
    const rdx = rx1 - rx0, rdy = ry1 - ry0;
    const rLenSq = rdx * rdx + rdy * rdy;
    const rt = Math.max(0, Math.min(1, ((nx - rx0) * rdx + (ny - ry0) * rdy) / rLenSq));
    const rdist = Math.hypot(nx - (rx0 + rt * rdx), ny - (ry0 + rt * rdy));
    const rradius = 0.022 * (1.0 - rt * 0.36);
    if (rdist < rradius) {
      val = Math.max(val, 0.60 + 0.36 * (1.0 - rdist / rradius));
    }

    // 7. Pinky finger (from (0.25, 0.43) to (0.31, 0.68))
    const px0 = 0.25, py0 = 0.43, px1 = 0.31, py1 = 0.68;
    const pdx = px1 - px0, pdy = py1 - py0;
    const pLenSq = pdx * pdx + pdy * pdy;
    const pt = Math.max(0, Math.min(1, ((nx - px0) * pdx + (ny - py0) * pdy) / pLenSq));
    const pdist = Math.hypot(nx - (px0 + pt * pdx), ny - (py0 + pt * pdy));
    const pradius = 0.019 * (1.0 - pt * 0.36);
    if (pdist < pradius) {
      val = Math.max(val, 0.57 + 0.36 * (1.0 - pdist / pradius));
    }
  }

  // ==========================================
  // RIGHT HAND (Adam's hand emerging from RIGHT EDGE nx >= 1.0)
  // ==========================================
  if (nx > 0.47) {
    // 1. Forearm (nx: 0.78 to 1.0)
    // Right edge (nx = 1.0) has full arm thickness!
    if (nx >= 0.78) {
      const topArmR = 0.34 + (1.0 - nx) * 0.30;
      const botArmR = 0.64 + (1.0 - nx) * 0.30;
      if (ny >= topArmR && ny <= botArmR) {
        const thickness = botArmR - topArmR;
        const normY = (ny - topArmR) / thickness;
        const muscle = Math.sin(normY * Math.PI);
        const striation = 0.88 + 0.12 * Math.sin(ny * 80.0);
        val = Math.max(val, (0.55 + 0.42 * muscle) * striation);
      }
    }

    // 2. Wrist and Palm (nx: 0.68 to 0.84)
    const palmDistR = Math.hypot((nx - 0.76) * 1.3, (ny - 0.52) * 1.6);
    if (palmDistR < 0.18) {
      val = Math.max(val, 0.58 + 0.38 * (1.0 - palmDistR / 0.18));
    }

    // 3. Adam's Index Finger: HORIZONTAL POINT (nx: 0.74 down to 0.57)
    const ax0 = 0.74, ay0 = 0.46, ax1 = 0.57, ay1 = 0.46;
    const adx = ax1 - ax0, ady = ay1 - ay0;
    const aLenSq = adx * adx + ady * ady;
    const at = Math.max(0, Math.min(1, ((nx - ax0) * adx + (ny - ay0) * ady) / aLenSq));
    const adist = Math.hypot(nx - (ax0 + at * adx), (ny - (ay0 + at * ady)) * 1.25);
    const aradius = 0.025 * (1.0 - at * 0.38);
    if (adist < aradius) {
      val = Math.max(val, 0.72 + 0.28 * (1.0 - adist / aradius));
    }

    // 4. Thumb (above index finger: from (0.76, 0.44) to (0.68, 0.39))
    const atx0 = 0.76, aty0 = 0.44, atx1 = 0.68, aty1 = 0.39;
    const atdx = atx1 - atx0, atdy = aty1 - aty0;
    const atLenSq = atdx * atdx + atdy * atdy;
    const att = Math.max(0, Math.min(1, ((nx - atx0) * atdx + (ny - aty0) * atdy) / atLenSq));
    const atdist = Math.hypot(nx - (atx0 + att * atdx), ny - (aty0 + att * atdy));
    const atradius = 0.023 * (1.0 - att * 0.35);
    if (atdist < atradius) {
      val = Math.max(val, 0.64 + 0.35 * (1.0 - atdist / atradius));
    }

    // 5. Curled Middle Finger (hanging down under palm: (0.74, 0.52) to (0.71, 0.74))
    const amx0 = 0.74, amy0 = 0.52, amx1 = 0.71, amy1 = 0.74;
    const amdx = amx1 - amx0, amdy = amy1 - amy0;
    const amLenSq = amdx * amdx + amdy * amdy;
    const amt = Math.max(0, Math.min(1, ((nx - amx0) * amdx + (ny - amy0) * amdy) / amLenSq));
    const amdist = Math.hypot(nx - (amx0 + amt * amdx), ny - (amy0 + amt * amdy));
    const amradius = 0.023 * (1.0 - amt * 0.28);
    if (amdist < amradius) {
      val = Math.max(val, 0.62 + 0.35 * (1.0 - amdist / amradius));
    }

    // 6. Curled Ring Finger (from (0.77, 0.54) to (0.74, 0.77))
    const arx0 = 0.77, ary0 = 0.54, arx1 = 0.74, ary1 = 0.77;
    const ardx = arx1 - arx0, ardy = ary1 - ary0;
    const arLenSq = ardx * ardx + ardy * ardy;
    const art = Math.max(0, Math.min(1, ((nx - arx0) * ardx + (ny - ary0) * ardy) / arLenSq));
    const ardist = Math.hypot(nx - (arx0 + art * ardx), ny - (ary0 + art * ardy));
    const arradius = 0.021 * (1.0 - art * 0.28);
    if (ardist < arradius) {
      val = Math.max(val, 0.58 + 0.35 * (1.0 - ardist / arradius));
    }

    // 7. Curled Pinky Finger (from (0.80, 0.56) to (0.77, 0.75))
    const apx0 = 0.80, apy0 = 0.56, apx1 = 0.77, apy1 = 0.75;
    const apdx = apx1 - apx0, apdy = apy1 - apy0;
    const apLenSq = apdx * apdx + apdy * apdy;
    const apt = Math.max(0, Math.min(1, ((nx - apx0) * apdx + (ny - apy0) * apdy) / apLenSq));
    const apdist = Math.hypot(nx - (apx0 + apt * apdx), ny - (apy0 + apt * apdy));
    const apradius = 0.019 * (1.0 - apt * 0.28);
    if (apdist < apradius) {
      val = Math.max(val, 0.55 + 0.35 * (1.0 - apdist / apradius));
    }
  }

  return Math.min(1.0, val);
}

// Benchmark generation
const width = 1440, height = 900;
const charW = 7.6, charH = 11.8;
const cols = Math.ceil(width / charW);
const rows = 60;

const t0 = Date.now();
const glyphs = [];
for (let r = 0; r < rows; r++) {
  const ny = r / (rows - 1);
  for (let c = 0; c < cols; c++) {
    const nx = c / (cols - 1);
    const v = sampleHands(nx, ny);
    if (v > 0.05) {
      const idx = Math.floor(v * (CHAR_RAMP.length - 1));
      glyphs.push({
        char: CHAR_RAMP[idx],
        x: c * charW,
        y: r * charH,
        val: v
      });
    }
  }
}
const elapsed = Date.now() - t0;
console.log(`Generated ${glyphs.length} glyphs in ${elapsed}ms. Col 0 nx=0, Col max nx=1.`);
console.log(`First glyph x=${glyphs[0].x}, Last glyph x=${glyphs[glyphs.length - 1].x}`);
