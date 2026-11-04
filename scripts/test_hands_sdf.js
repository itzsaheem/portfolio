// Enhanced anatomical modeling matching reference image

function sampleHands(nx, ny) {
  let val = 0;

  // ==========================================
  // LEFT HAND (God's hand entering from LEFT EDGE nx <= 0.0)
  // ==========================================
  if (nx < 0.52) {
    // 1. Forearm (nx: -0.05 to 0.22)
    // Runs cleanly across the left edge (nx = 0.0)
    if (nx <= 0.22) {
      const topArm = 0.12 + nx * 0.42;
      const botArm = 0.38 + nx * 0.40;
      if (ny >= topArm && ny <= botArm) {
        const thickness = botArm - topArm;
        const normY = (ny - topArm) / thickness;
        const muscle = Math.sin(normY * Math.PI);
        // Striated muscle texture like ASCII reference
        const striation = 0.85 + 0.15 * Math.sin(ny * 90.0);
        val = Math.max(val, (0.50 + 0.45 * muscle) * striation);
      }
    }

    // 2. Wrist and Palm (nx: 0.16 to 0.36)
    const palmDist = Math.hypot((nx - 0.25) * 1.3, (ny - 0.36) * 1.6);
    if (palmDist < 0.18) {
      const palmShade = 0.55 + 0.40 * (1.0 - palmDist / 0.18);
      val = Math.max(val, palmShade);
    }

    // Back of hand / Knuckle ridge
    const dKnuckleL = Math.hypot((nx - 0.29) * 1.4, (ny - 0.30) * 1.9);
    if (dKnuckleL < 0.13) {
      val = Math.max(val, 0.70 + 0.28 * (1.0 - dKnuckleL / 0.13));
    }

    // 3. Left Index Finger (reaching toward Adam: (0.29, 0.30) to (0.46, 0.52))
    const lx0 = 0.28, ly0 = 0.29, lx1 = 0.46, ly1 = 0.52;
    const ldx = lx1 - lx0, ldy = ly1 - ly0;
    const lLenSq = ldx * ldx + ldy * ldy;
    const lt = Math.max(0, Math.min(1, ((nx - lx0) * ldx + (ny - ly0) * ldy) / lLenSq));
    const lprojX = lx0 + lt * ldx;
    const lprojY = ly0 + lt * ldy;
    const ldist = Math.hypot(nx - lprojX, (ny - lprojY) * 1.15);
    const lradius = 0.026 * (1.0 - lt * 0.45);
    if (ldist < lradius) {
      const fingerShade = 0.65 + 0.35 * (1.0 - ldist / lradius);
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
      val = Math.max(val, 0.60 + 0.38 * (1.0 - tdist / tradius));
    }

    // 5. Middle Finger (curves down: from (0.30, 0.35) to (0.41, 0.64))
    const mx0 = 0.30, my0 = 0.35, mx1 = 0.41, my1 = 0.64;
    const mdx = mx1 - mx0, mdy = my1 - my0;
    const mLenSq = mdx * mdx + mdy * mdy;
    const mt = Math.max(0, Math.min(1, ((nx - mx0) * mdx + (ny - my0) * mdy) / mLenSq));
    const mdist = Math.hypot(nx - (mx0 + mt * mdx), ny - (my0 + mt * mdy));
    const mradius = 0.025 * (1.0 - mt * 0.38);
    if (mdist < mradius) {
      val = Math.max(val, 0.62 + 0.36 * (1.0 - mdist / mradius));
    }

    // 6. Ring finger (from (0.28, 0.40) to (0.36, 0.67))
    const rx0 = 0.28, ry0 = 0.40, rx1 = 0.36, ry1 = 0.67;
    const rdx = rx1 - rx0, rdy = ry1 - ry0;
    const rLenSq = rdx * rdx + rdy * rdy;
    const rt = Math.max(0, Math.min(1, ((nx - rx0) * rdx + (ny - ry0) * rdy) / rLenSq));
    const rdist = Math.hypot(nx - (rx0 + rt * rdx), ny - (ry0 + rt * rdy));
    const rradius = 0.022 * (1.0 - rt * 0.36);
    if (rdist < rradius) {
      val = Math.max(val, 0.58 + 0.38 * (1.0 - rdist / rradius));
    }

    // 7. Pinky finger (from (0.25, 0.43) to (0.31, 0.68))
    const px0 = 0.25, py0 = 0.43, px1 = 0.31, py1 = 0.68;
    const pdx = px1 - px0, pdy = py1 - py0;
    const pLenSq = pdx * pdx + pdy * pdy;
    const pt = Math.max(0, Math.min(1, ((nx - px0) * pdx + (ny - py0) * pdy) / pLenSq));
    const pdist = Math.hypot(nx - (px0 + pt * pdx), ny - (py0 + pt * pdy));
    const pradius = 0.019 * (1.0 - pt * 0.36);
    if (pdist < pradius) {
      val = Math.max(val, 0.55 + 0.38 * (1.0 - pdist / pradius));
    }
  }

  // ==========================================
  // RIGHT HAND (Adam's hand entering from RIGHT EDGE nx >= 1.0)
  // ==========================================
  if (nx > 0.48) {
    // 1. Forearm (nx: 0.80 to 1.05)
    // Runs cleanly across the right edge (nx = 1.0)
    if (nx >= 0.78) {
      const topArmR = 0.35 + (1.0 - nx) * 0.28;
      const botArmR = 0.63 + (1.0 - nx) * 0.28;
      if (ny >= topArmR && ny <= botArmR) {
        const thickness = botArmR - topArmR;
        const normY = (ny - topArmR) / thickness;
        const muscle = Math.sin(normY * Math.PI);
        const striation = 0.85 + 0.15 * Math.sin(ny * 90.0);
        val = Math.max(val, (0.50 + 0.45 * muscle) * striation);
      }
    }

    // 2. Wrist and Palm (nx: 0.68 to 0.84)
    const palmDistR = Math.hypot((nx - 0.76) * 1.3, (ny - 0.52) * 1.6);
    if (palmDistR < 0.18) {
      val = Math.max(val, 0.55 + 0.42 * (1.0 - palmDistR / 0.18));
    }

    // 3. Adam's Index Finger: HORIZONTAL POINT (nx: 0.74 down to 0.57)
    // Straight horizontal line at ny ~ 0.46
    const ax0 = 0.74, ay0 = 0.46, ax1 = 0.57, ay1 = 0.46;
    const adx = ax1 - ax0, ady = ay1 - ay0;
    const aLenSq = adx * adx + ady * ady;
    const at = Math.max(0, Math.min(1, ((nx - ax0) * adx + (ny - ay0) * ady) / aLenSq));
    const adist = Math.hypot(nx - (ax0 + at * adx), (ny - (ay0 + at * ady)) * 1.25);
    const aradius = 0.025 * (1.0 - at * 0.38);
    if (adist < aradius) {
      val = Math.max(val, 0.70 + 0.30 * (1.0 - adist / aradius));
    }

    // 4. Thumb (above index finger: from (0.76, 0.44) to (0.68, 0.39))
    const atx0 = 0.76, aty0 = 0.44, atx1 = 0.68, aty1 = 0.39;
    const atdx = atx1 - atx0, atdy = aty1 - aty0;
    const atLenSq = atdx * atdx + atdy * atdy;
    const att = Math.max(0, Math.min(1, ((nx - atx0) * atdx + (ny - aty0) * atdy) / atLenSq));
    const atdist = Math.hypot(nx - (atx0 + att * atdx), ny - (aty0 + att * atdy));
    const atradius = 0.023 * (1.0 - att * 0.35);
    if (atdist < atradius) {
      val = Math.max(val, 0.62 + 0.38 * (1.0 - atdist / atradius));
    }

    // 5. Curled Middle Finger (hanging down under palm: (0.74, 0.52) to (0.71, 0.74))
    const amx0 = 0.74, amy0 = 0.52, amx1 = 0.71, amy1 = 0.74;
    const amdx = amx1 - amx0, amdy = amy1 - amy0;
    const amLenSq = amdx * amdx + amdy * amdy;
    const amt = Math.max(0, Math.min(1, ((nx - amx0) * amdx + (ny - amy0) * amdy) / amLenSq));
    const amdist = Math.hypot(nx - (amx0 + amt * amdx), ny - (amy0 + amt * amdy));
    const amradius = 0.023 * (1.0 - amt * 0.28);
    if (amdist < amradius) {
      val = Math.max(val, 0.60 + 0.38 * (1.0 - amdist / amradius));
    }

    // 6. Curled Ring Finger (from (0.77, 0.54) to (0.74, 0.77))
    const arx0 = 0.77, ary0 = 0.54, arx1 = 0.74, ary1 = 0.77;
    const ardx = arx1 - arx0, ardy = ary1 - ary0;
    const arLenSq = ardx * ardx + ardy * ardy;
    const art = Math.max(0, Math.min(1, ((nx - arx0) * ardx + (ny - ary0) * ardy) / arLenSq));
    const ardist = Math.hypot(nx - (arx0 + art * ardx), ny - (ary0 + art * ardy));
    const arradius = 0.021 * (1.0 - art * 0.28);
    if (ardist < arradius) {
      val = Math.max(val, 0.56 + 0.38 * (1.0 - ardist / arradius));
    }

    // 7. Curled Pinky Finger (from (0.80, 0.56) to (0.77, 0.75))
    const apx0 = 0.80, apy0 = 0.56, apx1 = 0.77, apy1 = 0.75;
    const apdx = apx1 - apx0, apdy = apy1 - apy0;
    const apLenSq = apdx * apdx + apdy * apdy;
    const apt = Math.max(0, Math.min(1, ((nx - apx0) * apdx + (ny - apy0) * apdy) / apLenSq));
    const apdist = Math.hypot(nx - (apx0 + apt * apdx), ny - (apy0 + apt * apdy));
    const apradius = 0.019 * (1.0 - apt * 0.28);
    if (apdist < apradius) {
      val = Math.max(val, 0.52 + 0.38 * (1.0 - apdist / apradius));
    }
  }

  return Math.min(1.0, val);
}

// Print 140 x 38
const W = 140, H = 38;
const DENSITY = "   ..::--==++**##%%@@";
for (let y = 0; y < H; y++) {
  let line = "";
  for (let x = 0; x < W; x++) {
    const nx = x / (W - 1);
    const ny = y / (H - 1);
    const v = sampleHands(nx, ny);
    const idx = Math.floor(v * (DENSITY.length - 1));
    line += DENSITY[idx];
  }
  console.log(line);
}
