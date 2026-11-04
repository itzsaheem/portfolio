import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Grayscale 3D Astroid / Concave Star Diamond with internal refraction,
 * chromatic iridescence (in silver/monochrome metallic shades),
 * interactive cursor drag/tilt, and continuous elegant floating.
 */
export function GrayscaleDiamond3D() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animId: number;
    let width = container.clientWidth || 450;
    let height = container.clientHeight || 450;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.8);

    // 2. WebGL Renderer with High-DPI and Alpha Transparency
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // 3. Create Custom 4-Pointed Concave Star (Astroid) Diamond Geometry
    // Parametric astroid/pinched octahedral cushion:
    // Radius in XY plane has 4 sharp concave cusps, and pinches inward toward center,
    // with smooth front/back thickness.
    const createAstroidDiamondGeometry = () => {
      const uSegments = 84;
      const vSegments = 84;
      const positions: number[] = [];
      const normals: number[] = [];
      const uvs: number[] = [];
      const indices: number[] = [];

      // Grid of vertices
      for (let i = 0; i <= uSegments; i++) {
        // u goes from -1 to 1 (X axis)
        const u = (i / uSegments) * 2 - 1;
        for (let j = 0; j <= vSegments; j++) {
          // v goes from -1 to 1 (Y axis)
          const v = (j / vSegments) * 2 - 1;

          // Map unit square to astroid / pinched star shape
          // Astroid formula in 2D: |x|^(2/3) + |y|^(2/3) <= 1
          // We construct front (+) and back (-) surface
          const uAbs = Math.abs(u);
          const vAbs = Math.abs(v);

          // Concave 4-pointed curvature parameter:
          const pinch = 0.42;
          const starBoundary = 1.0 - (uAbs * vAbs * pinch * 4.0);

          const posX = u * 1.55 * Math.max(0.2, starBoundary);
          const posY = v * 1.55 * Math.max(0.2, starBoundary);

          // Thickness z curves outward toward the center and pinches to razor-sharp bevel at the edges
          const distToEdge = Math.max(0, 1.0 - Math.hypot(u, v) * 0.72);
          const posZ = Math.pow(distToEdge, 1.4) * 0.52;

          // Push upper hemisphere (front)
          positions.push(posX, posY, posZ);
          uvs.push(i / uSegments, j / vSegments);
        }
      }

      // Add back hemisphere (mirrored Z)
      const offset = (uSegments + 1) * (vSegments + 1);
      for (let i = 0; i <= uSegments; i++) {
        const u = (i / uSegments) * 2 - 1;
        for (let j = 0; j <= vSegments; j++) {
          const v = (j / vSegments) * 2 - 1;
          const uAbs = Math.abs(u);
          const vAbs = Math.abs(v);
          const pinch = 0.42;
          const starBoundary = 1.0 - (uAbs * vAbs * pinch * 4.0);
          const posX = u * 1.55 * Math.max(0.2, starBoundary);
          const posY = v * 1.55 * Math.max(0.2, starBoundary);
          const distToEdge = Math.max(0, 1.0 - Math.hypot(u, v) * 0.72);
          const posZ = -Math.pow(distToEdge, 1.4) * 0.52;

          positions.push(posX, posY, posZ);
          uvs.push(i / uSegments, j / vSegments);
        }
      }

      // Indices for front
      for (let i = 0; i < uSegments; i++) {
        for (let j = 0; j < vSegments; j++) {
          const a = i * (vSegments + 1) + j;
          const b = (i + 1) * (vSegments + 1) + j;
          const c = (i + 1) * (vSegments + 1) + (j + 1);
          const d = i * (vSegments + 1) + (j + 1);
          indices.push(a, b, d);
          indices.push(b, c, d);
        }
      }

      // Indices for back (reversed winding)
      for (let i = 0; i < uSegments; i++) {
        for (let j = 0; j < vSegments; j++) {
          const a = offset + i * (vSegments + 1) + j;
          const b = offset + (i + 1) * (vSegments + 1) + j;
          const c = offset + (i + 1) * (vSegments + 1) + (j + 1);
          const d = offset + i * (vSegments + 1) + (j + 1);
          indices.push(a, d, b);
          indices.push(b, d, c);
        }
      }

      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
      geom.setIndex(indices);
      geom.computeVertexNormals();
      return geom;
    };

    // Alternative mathematically pristine 3D Astroid Star geometry with facet edges
    // An astroid octahedron has 8 symmetrical triangular facet faces pinched along curves.
    const createFacetedAstroidGeometry = () => {
      // Create a subdivision grid for each of the 8 octants
      const res = 36;
      const positions: number[] = [];
      const normals: number[] = [];
      const uvs: number[] = [];
      const indices: number[] = [];

      // Astroid equation: x^(2/3) + y^(2/3) + z^(2/3) = 1 in spherical astroid coordinates:
      // x = R * cos^3(u) * cos^3(v)
      // y = R * sin^3(u) * cos^3(v)
      // z = R * sin^3(v)
      // To create the exact cushion shape from the video (pinched 4-point star in XY with pillowed front & back Z):
      const uSteps = 72;
      const vSteps = 48;

      for (let j = 0; j <= vSteps; j++) {
        // theta from -PI/2 to PI/2
        const theta = (j / vSteps - 0.5) * Math.PI;
        const cosTheta = Math.cos(theta);
        const sinTheta = Math.sin(theta);

        // Flatten z slightly for elegant crystal facet proportion
        const z = Math.sign(sinTheta) * Math.pow(Math.abs(sinTheta), 1.8) * 0.75;

        for (let i = 0; i <= uSteps; i++) {
          // phi from 0 to 2*PI
          const phi = (i / uSteps) * Math.PI * 2;
          const cosPhi = Math.cos(phi);
          const sinPhi = Math.sin(phi);

          // 4-star astroid modulation in XY
          // x = cos^3(phi), y = sin^3(phi)
          const starX = Math.sign(cosPhi) * Math.pow(Math.abs(cosPhi), 2.2);
          const starY = Math.sign(sinPhi) * Math.pow(Math.abs(sinPhi), 2.2);

          const r = Math.pow(Math.abs(cosTheta), 0.75) * 1.62;
          const x = starX * r;
          const y = starY * r;

          positions.push(x, y, z);
          uvs.push(i / uSteps, j / vSteps);
        }
      }

      for (let j = 0; j < vSteps; j++) {
        for (let i = 0; i < uSteps; i++) {
          const a = j * (uSteps + 1) + i;
          const b = (j + 1) * (uSteps + 1) + i;
          const c = (j + 1) * (uSteps + 1) + (i + 1);
          const d = j * (uSteps + 1) + (i + 1);

          indices.push(a, b, d);
          indices.push(b, c, d);
        }
      }

      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
      geom.setIndex(indices);
      geom.computeVertexNormals();
      return geom;
    };

    const geometry = createFacetedAstroidGeometry();

    // 4. Custom Grayscale Crystal Diamond Shader Material
    // Features:
    // - Internal caustic prism refraction (in pure grayscale chrome & liquid glass values)
    // - Faceted Fresnel edge reflection (subtle platinum/silver sheen)
    // - Volumetric internal texturing (subtle digital micro-blocks and caustic waves like the video)
    // - Grayscale specular highlights with high dynamic range
    const diamondMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uResolution: { value: new THREE.Vector2(width, height) },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec3 vWorldPosition;
        varying vec3 vWorldNormal;
        varying vec2 vUv;
        varying vec3 vEyeVector;

        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
          vEyeVector = normalize(worldPos.xyz - cameraPosition);
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec2 uMouse;
        uniform vec2 uResolution;

        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec3 vWorldPosition;
        varying vec3 vWorldNormal;
        varying vec2 vUv;
        varying vec3 vEyeVector;

        // Simplex / hash noise for internal crystal caustics
        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
        }

        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          float a = hash(i);
          float b = hash(i + vec2(1.0, 0.0));
          float c = hash(i + vec2(0.0, 1.0));
          float d = hash(i + vec2(1.0, 1.0));
          return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }

        // Voronoi / cellular facet caustics
        float voronoi(vec2 p) {
          vec2 n = floor(p);
          vec2 f = fract(p);
          float md = 5.0;
          for (int j = -1; j <= 1; j++) {
            for (int i = -1; i <= 1; i++) {
              vec2 g = vec2(float(i), float(j));
              vec2 o = vec2(hash(n + g), hash(n + g + vec2(13.5, 91.2)));
              vec2 r = g + o - f;
              float d = dot(r, r);
              if (d < md) md = d;
            }
          }
          return sqrt(md);
        }

        void main() {
          vec3 N = normalize(vNormal);
          vec3 V = normalize(-vEyeVector);

          // 1. Multi-layer Fresnel reflection (crystal glass effect)
          float NdotV = max(0.0, dot(N, V));
          float fresnel = pow(1.0 - NdotV, 3.2);
          float rim = pow(1.0 - NdotV, 5.0);

          // 2. Refracted rays inside diamond
          vec3 refractRay = refract(-V, N, 0.68); // Diamond IOR ~2.4 -> 1/2.4 ≈ 0.42..0.68
          
          // Internal caustics and dynamic volumetric digital refraction
          vec2 causticsUv = vPosition.xy * 2.4 + refractRay.xy * 1.5;
          causticsUv += vec2(sin(uTime * 0.4 + vPosition.z * 3.0), cos(uTime * 0.35 + vPosition.y * 3.0)) * 0.25;

          // Multi-frequency facet lattice (like the iridescent facets in the video, but purely in silver grayscale)
          float c1 = voronoi(causticsUv * 3.2);
          float c2 = voronoi(causticsUv * 6.5 + vec2(uTime * 0.15, -uTime * 0.1));
          float caustics = pow(c1 * 0.65 + c2 * 0.35, 1.8);

          // Digital mosaic facets (similar to the glitch typography refraction in the video)
          vec2 blockUv = floor(causticsUv * 12.0) / 12.0;
          float blockNoise = noise(blockUv + uTime * 0.08);

          // 3. Specular highlights & light sources
          vec3 lightDir1 = normalize(vec3(1.2, 1.5, 1.8));
          vec3 lightDir2 = normalize(vec3(-1.4, -0.8, 1.2));
          vec3 lightDir3 = normalize(vec3(0.0, 2.0, -1.0));

          // Blinn-Phong speculars
          vec3 H1 = normalize(lightDir1 + V);
          vec3 H2 = normalize(lightDir2 + V);
          float spec1 = pow(max(0.0, dot(N, H1)), 48.0);
          float spec2 = pow(max(0.0, dot(N, H2)), 32.0);
          float sharpSpec = pow(max(0.0, dot(N, H1)), 180.0) * 1.8;

          // 4. Monochrome / Grayscale Shading Composite:
          // Deep charcoal core, pure silver reflections, icy white facet edges
          float coreShade = (1.0 - caustics) * 0.55 + blockNoise * 0.25;
          
          // Grayscale chromatic dispersion: calculate slightly offset refraction intensities
          float dispR = voronoi(causticsUv * 3.2 + vec2(0.02, 0.0));
          float dispG = voronoi(causticsUv * 3.2);
          float dispB = voronoi(causticsUv * 3.2 - vec2(0.02, 0.0));
          float dispMono = (dispR + dispG + dispB) / 3.0;

          // Combine tones in monochrome spectrum:
          // Base diamond color: deep glassy black/charcoal
          vec3 baseColor = vec3(0.05, 0.055, 0.065);

          // Refracted caustics tone (platinum silver):
          vec3 causticsColor = vec3(dispMono * 0.85 + coreShade * 0.5);

          // Fresnel and rim tones (bright silver/ice):
          vec3 rimColor = vec3(fresnel * 0.75 + rim * 0.65);

          // Specular glints (pure white diamond sparkle):
          vec3 specColor = vec3(spec1 * 0.9 + spec2 * 0.5 + sharpSpec * 1.2);

          // Final Composite
          vec3 finalColor = baseColor + causticsColor * 0.72 + rimColor * 0.85 + specColor;

          // High-contrast monochromatic grading:
          finalColor = pow(finalColor, vec3(1.15)) * 1.25;

          // Glass edge alpha
          float alpha = clamp(0.55 + fresnel * 0.45 + sharpSpec * 0.5 + caustics * 0.35, 0.0, 0.98);

          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: true,
    });

    // Mesh instance
    const diamondMesh = new THREE.Mesh(geometry, diamondMaterial);
    scene.add(diamondMesh);

    // 5. Outer Edge Wireframe Accent / Glass Rim (subtle razor outline like luxury 3D graphics)
    const wireframeGeom = geometry.clone();
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.045,
    });
    const wireframeMesh = new THREE.Mesh(wireframeGeom, wireframeMat);
    wireframeMesh.scale.set(1.001, 1.001, 1.001);
    scene.add(wireframeMesh);

    // 6. Interactive Cursor Dragging, Inertia & Mouse Tracking
    const mouse = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      isDragging: false,
      lastMouseX: 0,
      lastMouseY: 0,
      dragRotX: 0,
      dragRotY: 0,
      dragVelX: 0,
      dragVelY: 0,
    };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / height) * 2 - 1);
      mouse.targetX = nx;
      mouse.targetY = ny;

      if (mouse.isDragging) {
        const dx = e.clientX - mouse.lastMouseX;
        const dy = e.clientY - mouse.lastMouseY;
        mouse.dragVelX = dy * 0.007;
        mouse.dragVelY = dx * 0.007;
        mouse.dragRotX += mouse.dragVelX;
        mouse.dragRotY += mouse.dragVelY;
        mouse.lastMouseX = e.clientX;
        mouse.lastMouseY = e.clientY;
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      mouse.isDragging = true;
      mouse.lastMouseX = e.clientX;
      mouse.lastMouseY = e.clientY;
      container.style.cursor = 'grabbing';
    };

    const handlePointerUp = () => {
      mouse.isDragging = false;
      container.style.cursor = 'grab';
    };

    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);

    // Window Resize Handler
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || 450;
      height = container.clientHeight || 450;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      diamondMaterial.uniforms.uResolution.value.set(width, height);
    };

    window.addEventListener('resize', handleResize);

    // 7. Animation Loop with Organic Wobble & Gyroscopic Float
    const clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      diamondMaterial.uniforms.uTime.value = elapsedTime;

      // Inertia decay on release
      if (!mouse.isDragging) {
        mouse.dragVelX *= 0.94;
        mouse.dragVelY *= 0.94;
        mouse.dragRotX += mouse.dragVelX;
        mouse.dragRotY += mouse.dragVelY;
      }

      // Smooth mouse follow
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;
      diamondMaterial.uniforms.uMouse.value.set(mouse.x, mouse.y);

      // Continuous, elegant 3D tumbling like the reference video
      // Tumbling on X, Y, and Z axes with slight sinusoidal levitation
      const autoRotX = Math.sin(elapsedTime * 0.55) * 0.28 + elapsedTime * 0.35;
      const autoRotY = Math.cos(elapsedTime * 0.45) * 0.32 + elapsedTime * 0.42;
      const autoRotZ = Math.sin(elapsedTime * 0.35) * 0.18;

      const targetRotX = autoRotX + mouse.dragRotX - mouse.y * 0.45;
      const targetRotY = autoRotY + mouse.dragRotY + mouse.x * 0.45;
      const targetRotZ = autoRotZ + mouse.x * 0.15;

      diamondMesh.rotation.x = targetRotX;
      diamondMesh.rotation.y = targetRotY;
      diamondMesh.rotation.z = targetRotZ;

      wireframeMesh.rotation.x = targetRotX;
      wireframeMesh.rotation.y = targetRotY;
      wireframeMesh.rotation.z = targetRotZ;

      // Gentle floating bob in Z / Y
      const bobY = Math.sin(elapsedTime * 1.2) * 0.08;
      diamondMesh.position.y = bobY;
      wireframeMesh.position.y = bobY;

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geometry.dispose();
      wireframeGeom.dispose();
      diamondMaterial.dispose();
      wireframeMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ cursor: 'grab' }}
      className="relative w-[340px] h-[340px] sm:w-[460px] sm:h-[460px] lg:w-[540px] lg:h-[540px] flex items-center justify-center select-none touch-none"
      title="Click and drag to rotate the 3D Grayscale Diamond"
    />
  );
}
