import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { FlagshipProject, WaterfallRoute } from '../data/portfolioData';

interface ThreeArchitecturePipelineProps {
  project: FlagshipProject;
  activeRoute: WaterfallRoute;
  selectedRouteIndex: number;
  onSelectRoute: (index: number) => void;
  className?: string;
}

interface NodeData {
  id: string;
  name: string;
  sub: string;
  type: 'client' | 'auth' | 'api' | 'cache' | 'database';
  targetIndex: number;
  basePosition: THREE.Vector3;
  mesh?: THREE.Group;
  statusText: string;
}

export function ThreeArchitecturePipeline({
  project,
  activeRoute,
  selectedRouteIndex,
  onSelectRoute,
  className = '',
}: ThreeArchitecturePipelineProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<NodeData | null>(null);
  const [exploded, setExploded] = useState<boolean>(false);
  const [cameraView, setCameraView] = useState<'isometric' | 'front' | 'top'>('isometric');

  // Storing refs for animation loop
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const nodesRef = useRef<NodeData[]>([]);
  const packetsRef = useRef<{ mesh: THREE.Mesh; progress: number; speed: number; curve: THREE.CatmullRomCurve3 }[]>([]);
  const targetCamPosRef = useRef<THREE.Vector3>(new THREE.Vector3(12, 9, 14));
  const targetCamLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const isExplodedRef = useRef<boolean>(exploded);
  isExplodedRef.current = exploded;

  const currentRouteIdxRef = useRef<number>(selectedRouteIndex);
  currentRouteIdxRef.current = selectedRouteIndex;

  // Initialize Three.js scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 800;
    let height = container.clientHeight || 460;

    // Detect software WebGL to protect low-power devices
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.024);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(12, 9, 14);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(10, 16, 12);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xcfd8dc, 0.9);
    rimLight.position.set(-10, -5, -10);
    scene.add(rimLight);

    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x111111, 0.6);
    scene.add(hemisphereLight);

    // Grid Floor
    const gridHelper = new THREE.GridHelper(30, 30, 0x333333, 0x181818);
    gridHelper.position.y = -3.2;
    scene.add(gridHelper);

    // Dynamic 3D Nodes Setup depending on Project Architecture
    const nodes: NodeData[] = [
      {
        id: 'node-client',
        name: 'CLIENT APPLICATION',
        sub: project.techStack[1] || 'React 19 + TypeScript',
        type: 'client',
        targetIndex: 0,
        basePosition: new THREE.Vector3(-6.5, 0.8, 0),
        statusText: 'Interactive Frontend Interface',
      },
      {
        id: 'node-auth',
        name: 'SECURITY GUARD',
        sub: project.waterfallRoutes[0]?.authLayer || 'JWT & RBAC Gate',
        type: 'auth',
        targetIndex: Math.min(1, project.waterfallRoutes.length - 1),
        basePosition: new THREE.Vector3(-3.0, 1.6, 0),
        statusText: 'Cryptographic Token Verification',
      },
      {
        id: 'node-api',
        name: 'BACKEND SERVICE',
        sub: project.waterfallRoutes[1]?.engine || 'Node.js / Fastify / Java OOP',
        type: 'api',
        targetIndex: Math.min(2, project.waterfallRoutes.length - 1),
        basePosition: new THREE.Vector3(0.5, 0.5, 0),
        statusText: 'Business Logic & Execution Pipeline',
      },
      {
        id: 'node-cache',
        name: 'STATE & CACHE',
        sub: project.id === 'bot-or-not' ? 'Redis Matchmaking & WS Queue' : 'In-Memory Query Cache',
        type: 'cache',
        targetIndex: Math.min(2, project.waterfallRoutes.length - 1),
        basePosition: new THREE.Vector3(3.8, 2.2, -2.5),
        statusText: 'Sub-millisecond In-Memory Store',
      },
      {
        id: 'node-db',
        name: 'DATABASE ENGINE',
        sub: project.id === 'cms' ? 'PostgreSQL RLS (3 Branches)' : 'Relational PostgreSQL / MySQL',
        type: 'database',
        targetIndex: Math.max(0, project.waterfallRoutes.length - 1),
        basePosition: new THREE.Vector3(6.5, -0.6, 0),
        statusText: 'ACID Relational Persistence',
      },
    ];

    // Shared Materials
    const darkMetalMat = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.25,
      metalness: 0.85,
    });

    const activeWireMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });

    const greenEmissiveMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      emissive: 0x22c55e,
      emissiveIntensity: 0.75,
      roughness: 0.2,
      metalness: 0.6,
    });

    const whiteEmissiveMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 0.85,
      roughness: 0.1,
      metalness: 0.9,
    });

    const pipelineGroup = new THREE.Group();
    scene.add(pipelineGroup);

    // Build Composite 3D Geometric Nodes for each tier
    nodes.forEach((n) => {
      const nodeGroup = new THREE.Group();
      nodeGroup.position.copy(n.basePosition);
      nodeGroup.userData = { nodeData: n };

      if (n.type === 'client') {
        // Flat Monolith Display Terminal with Bezel
        const screenGeo = new THREE.BoxGeometry(2.2, 1.4, 0.25);
        const screenMesh = new THREE.Mesh(screenGeo, darkMetalMat);
        const wire = new THREE.Mesh(new THREE.BoxGeometry(2.28, 1.48, 0.28), activeWireMat);
        nodeGroup.add(screenMesh, wire);

        // Stand
        const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.2, 0.7, 16), darkMetalMat);
        stand.position.y = -0.85;
        nodeGroup.add(stand);
      } else if (n.type === 'auth') {
        // Hexagonal Security Gate / Crystal Ring
        const ringGeo = new THREE.TorusGeometry(0.9, 0.16, 16, 32);
        const ringMesh = new THREE.Mesh(ringGeo, darkMetalMat);
        ringMesh.rotation.y = Math.PI * 0.25;

        const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.48), whiteEmissiveMat);
        const wire = new THREE.Mesh(new THREE.TorusGeometry(0.96, 0.05, 8, 24), activeWireMat);
        wire.rotation.y = Math.PI * 0.25;

        nodeGroup.add(ringMesh, core, wire);
      } else if (n.type === 'api') {
        // Multi-core Compute Module (Stacked Processing Blades)
        for (let b = 0; b < 3; b++) {
          const blade = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.28, 1.6), darkMetalMat);
          blade.position.y = (b - 1) * 0.45;
          nodeGroup.add(blade);

          const bladeGlow = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.06, 1.65), greenEmissiveMat);
          bladeGlow.position.y = (b - 1) * 0.45;
          nodeGroup.add(bladeGlow);
        }
        const wireCage = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.6, 1.8), activeWireMat);
        nodeGroup.add(wireCage);
      } else if (n.type === 'cache') {
        // Redis In-Memory Memory Core / Floating Polyhedron
        const memoryGeo = new THREE.IcosahedronGeometry(0.75, 0);
        const memoryMesh = new THREE.Mesh(memoryGeo, whiteEmissiveMat);
        const orbitRing = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.04, 8, 24), activeWireMat);
        orbitRing.rotation.x = Math.PI * 0.4;
        nodeGroup.add(memoryMesh, orbitRing);
      } else if (n.type === 'database') {
        // Relational DB Tier (Cylindrical Storage Discs with RLS rings)
        for (let c = 0; c < 3; c++) {
          const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.38, 24), darkMetalMat);
          cyl.position.y = (c - 1) * 0.55;
          nodeGroup.add(cyl);

          const rlsRing = new THREE.Mesh(new THREE.TorusGeometry(1.02, 0.04, 8, 24), greenEmissiveMat);
          rlsRing.position.y = (c - 1) * 0.55;
          rlsRing.rotation.x = Math.PI * 0.5;
          nodeGroup.add(rlsRing);
        }
        const dbCage = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 1.8, 16), activeWireMat);
        nodeGroup.add(dbCage);
      }

      pipelineGroup.add(nodeGroup);
      n.mesh = nodeGroup;
    });

    nodesRef.current = nodes;

    // Spline Data Rails connecting Client -> Auth -> API -> Cache / DB
    const railMat = new THREE.LineBasicMaterial({
      color: 0x444444,
      transparent: true,
      opacity: 0.6,
    });

    const routeSplines: THREE.CatmullRomCurve3[] = [
      new THREE.CatmullRomCurve3([
        nodes[0].basePosition.clone().add(new THREE.Vector3(1.1, 0, 0)),
        new THREE.Vector3(-4.8, 1.2, 0),
        nodes[1].basePosition.clone().add(new THREE.Vector3(-0.9, 0, 0)),
      ]),
      new THREE.CatmullRomCurve3([
        nodes[1].basePosition.clone().add(new THREE.Vector3(0.9, 0, 0)),
        new THREE.Vector3(-1.2, 1.1, 0),
        nodes[2].basePosition.clone().add(new THREE.Vector3(-0.9, 0, 0)),
      ]),
      new THREE.CatmullRomCurve3([
        nodes[2].basePosition.clone().add(new THREE.Vector3(0.8, 0.5, -0.8)),
        new THREE.Vector3(2.2, 1.8, -1.8),
        nodes[3].basePosition.clone().add(new THREE.Vector3(-0.8, 0, 0)),
      ]),
      new THREE.CatmullRomCurve3([
        nodes[2].basePosition.clone().add(new THREE.Vector3(0.9, -0.2, 0)),
        new THREE.Vector3(3.6, -0.1, 0),
        nodes[4].basePosition.clone().add(new THREE.Vector3(-1.0, 0, 0)),
      ]),
    ];

    routeSplines.forEach((curve) => {
      const points = curve.getPoints(32);
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geom, railMat);
      scene.add(line);
    });

    // Luminous Data Packets (Pulsing Energy Photons)
    const packetGeo = new THREE.SphereGeometry(0.16, 12, 12);
    const packetMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const packetPool: { mesh: THREE.Mesh; progress: number; speed: number; curve: THREE.CatmullRomCurve3 }[] = [];

    for (let p = 0; p < 8; p++) {
      const curve = routeSplines[p % routeSplines.length];
      const pMesh = new THREE.Mesh(packetGeo, packetMat);
      scene.add(pMesh);
      packetPool.push({
        mesh: pMesh,
        progress: (p * 0.125) % 1,
        speed: 0.006 + Math.random() * 0.004,
        curve,
      });
    }

    packetsRef.current = packetPool;

    // Raycasting for interactive hover and click selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-10, -10);

    const onPointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(pipelineGroup.children, true);

      if (intersects.length > 0) {
        let parent: THREE.Object3D | null = intersects[0].object;
        while (parent && !parent.userData?.nodeData && parent !== scene) {
          parent = parent.parent;
        }
        if (parent && parent.userData?.nodeData) {
          setHoveredNode(parent.userData.nodeData);
          renderer.domElement.style.cursor = 'pointer';
          return;
        }
      }
      setHoveredNode(null);
      renderer.domElement.style.cursor = 'grab';
    };

    const onPointerDown = () => {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(pipelineGroup.children, true);

      if (intersects.length > 0) {
        let parent: THREE.Object3D | null = intersects[0].object;
        while (parent && !parent.userData?.nodeData && parent !== scene) {
          parent = parent.parent;
        }
        if (parent && parent.userData?.nodeData) {
          const targetIdx = (parent.userData.nodeData as NodeData).targetIndex;
          onSelectRoute(targetIdx);
        }
      }
    };

    renderer.domElement.addEventListener('mousemove', onPointerMove);
    renderer.domElement.addEventListener('click', onPointerDown);

    // Mouse / Touch Orbit Drag State
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let orbitAzimuth = Math.PI * 0.25;
    let orbitPolar = Math.PI * 0.32;
    const orbitDistance = 18;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      renderer.domElement.style.cursor = 'grabbing';
    };

    const onMouseUp = () => {
      isDragging = false;
      renderer.domElement.style.cursor = 'grab';
    };

    const onMouseDrag = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      orbitAzimuth -= deltaX * 0.007;
      orbitPolar = Math.max(0.12, Math.min(Math.PI * 0.48, orbitPolar - deltaY * 0.007));
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - prevMouseX;
      const deltaY = e.touches[0].clientY - prevMouseY;
      prevMouseX = e.touches[0].clientX;
      prevMouseY = e.touches[0].clientY;

      orbitAzimuth -= deltaX * 0.009;
      orbitPolar = Math.max(0.12, Math.min(Math.PI * 0.48, orbitPolar - deltaY * 0.009));
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseDrag);
    renderer.domElement.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onMouseUp);
    window.addEventListener('touchmove', onTouchMove, { passive: true });

    // Handle Window Resize
    const onResize = () => {
      if (!container) return;
      width = container.clientWidth || 800;
      height = container.clientHeight || 460;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', onResize);

    // Continuous 60-120fps Render Loop
    let animId = 0;
    let clock = new THREE.Clock();

    const tick = () => {
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Smooth Orbit Camera Calculation
      targetCamPosRef.current.x = orbitDistance * Math.sin(orbitPolar) * Math.sin(orbitAzimuth);
      targetCamPosRef.current.y = orbitDistance * Math.cos(orbitPolar);
      targetCamPosRef.current.z = orbitDistance * Math.sin(orbitPolar) * Math.cos(orbitAzimuth);

      camera.position.lerp(targetCamPosRef.current, 0.08);
      camera.lookAt(targetCamLookAtRef.current);

      // Animate Nodes: Gentle breathing float & Exploded layer separation
      const explodeFactor = isExplodedRef.current ? 1.6 : 1.0;
      nodes.forEach((n, idx) => {
        if (!n.mesh) return;

        // Subtle harmonic floating
        const floatY = Math.sin(time * 1.5 + idx * 0.8) * 0.08;
        const targetPos = n.basePosition.clone().multiplyScalar(explodeFactor);
        targetPos.y += floatY;

        n.mesh.position.lerp(targetPos, 0.08);

        // Highlight currently selected or active route node
        const isActiveNode = n.targetIndex === currentRouteIdxRef.current;
        const scaleTarget = isActiveNode ? 1.12 : 1.0;
        n.mesh.scale.lerp(new THREE.Vector3(scaleTarget, scaleTarget, scaleTarget), 0.1);

        // Slow rotation for specific nodes
        if (n.type === 'auth' || n.type === 'cache') {
          n.mesh.rotation.y += delta * 0.45;
        }
      });

      // Animate Traveling Data Packets
      packetPool.forEach((p) => {
        p.progress = (p.progress + p.speed) % 1;
        const pt = p.curve.getPointAt(p.progress);
        p.mesh.position.copy(pt);

        // Pulsing scale as it travels
        const pulse = 1 + Math.sin(time * 8 + p.progress * 10) * 0.35;
        p.mesh.scale.set(pulse, pulse, pulse);
      });

      renderer.render(scene, camera);
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('mousemove', onPointerMove);
      renderer.domElement.removeEventListener('click', onPointerDown);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseDrag);
      renderer.domElement.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      renderer.dispose();
    };
  }, [project, onSelectRoute]);

  // Adjust camera view presets
  const handleSetView = useCallback((mode: 'isometric' | 'front' | 'top') => {
    setCameraView(mode);
    if (mode === 'isometric') {
      targetCamPosRef.current.set(12, 9, 14);
      targetCamLookAtRef.current.set(0, 0, 0);
    } else if (mode === 'front') {
      targetCamPosRef.current.set(0, 1.5, 18);
      targetCamLookAtRef.current.set(0, 0.5, 0);
    } else if (mode === 'top') {
      targetCamPosRef.current.set(0, 18, 0.01);
      targetCamLookAtRef.current.set(0, 0, 0);
    }
  }, []);

  return (
    <div className={`relative w-full h-[360px] sm:h-[440px] lg:h-[480px] bg-[#030303] border border-white/10 overflow-hidden select-none ${className}`}>
      {/* 3D WebGL Canvas Mount */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab" />

      {/* Top Left: Active System Telemetry HUD */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 pointer-events-none">
        <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.18em] text-neutral-300 bg-black/85 border border-white/12 px-3 py-1.5 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-[#22c55e] inline-block shadow-[0_0_8px_#22c55e]" />
          <span>LIVE 3D SYSTEM ARCHITECTURE</span>
          <span className="text-neutral-500">·</span>
          <span className="text-white font-bold">{project.titleWhite}</span>
        </div>
      </div>

      {/* Top Right: Explode View Toggle & Camera Presets */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={() => setExploded((prev) => !prev)}
          className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.14em] border transition-colors ${
            exploded
              ? 'border-white bg-white text-black font-bold'
              : 'border-white/20 bg-black/80 text-neutral-300 hover:text-white hover:border-white/40'
          }`}
        >
          {exploded ? 'COLLAPSE LAYERS' : 'EXPLODE TIERS'}
        </button>

        <div className="hidden sm:flex items-center border border-white/15 bg-black/80 p-0.5">
          <button
            type="button"
            onClick={() => handleSetView('isometric')}
            className={`px-2 py-0.5 text-[9.5px] font-mono uppercase ${
              cameraView === 'isometric' ? 'bg-white text-black font-bold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            ISO
          </button>
          <button
            type="button"
            onClick={() => handleSetView('front')}
            className={`px-2 py-0.5 text-[9.5px] font-mono uppercase ${
              cameraView === 'front' ? 'bg-white text-black font-bold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            FRONT
          </button>
          <button
            type="button"
            onClick={() => handleSetView('top')}
            className={`px-2 py-0.5 text-[9.5px] font-mono uppercase ${
              cameraView === 'top' ? 'bg-white text-black font-bold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            TOP
          </button>
        </div>
      </div>

      {/* Bottom Center: Hovered / Inspected Node Live Feedback Card */}
      <div className="absolute bottom-3 inset-x-3 sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-md z-20 pointer-events-none">
        <div className="border border-white/15 bg-black/90 p-3 sm:p-3.5 backdrop-blur-md shadow-2xl">
          <div className="flex items-center justify-between gap-2 text-[9px] font-mono uppercase tracking-[0.18em] text-neutral-400 mb-1">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-white inline-block" />
              <span>{hoveredNode ? hoveredNode.name : 'INSPECTING ACTIVE PIPELINE TIER'}</span>
            </div>
            <span className="text-[#22c55e]">200 OK · IN TRANSIT</span>
          </div>

          <div className="text-xs sm:text-sm font-bold text-white tracking-tight">
            {hoveredNode ? hoveredNode.sub : activeRoute.path}
          </div>

          <p className="text-[10px] sm:text-[11px] font-sans text-neutral-300 mt-1 line-clamp-2">
            {hoveredNode ? hoveredNode.statusText : activeRoute.description}
          </p>

          <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[9px] font-mono text-neutral-400">
            <span>DRAG TO ORBIT 360° · TAP ANY 3D NODE TO INSPECT</span>
            <span className="text-white font-semibold">{activeRoute.latencyMs}ms</span>
          </div>
        </div>
      </div>
    </div>
  );
}
