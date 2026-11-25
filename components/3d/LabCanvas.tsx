'use client';

import { Canvas } from '@react-three/fiber';
import { AdaptiveDpr, Environment, Lightformer } from '@react-three/drei';
import { EffectComposer, N8AO, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import * as THREE from 'three';
import { QUALITY } from '@/engine/performance/quality';
import { useViewer } from '@/engine/store';
import { CameraRig, type CameraPreset } from './CameraRig';
import { StatsOverlay, statsRequested } from './StatsOverlay';
import { TestHook } from './TestHook';

interface Props {
  children: ReactNode;
  cameraPreset: CameraPreset;
  onPointerMissed?: () => void;
  onContextLost?: () => void;
  /** Dark studio instead of the default light atlas backdrop. */
  dark?: boolean;
}

/**
 * Shared WebGL canvas for every laboratory: quality profile, lighting,
 * adaptive resolution, BVH-accelerated raycasting and context-loss recovery.
 *
 * Rendering is on demand (`frameloop="demand"`): a still scene costs no frames.
 * Anything that moves must call `invalidate()`.
 */
export function LabCanvas({ children, cameraPreset, onPointerMissed, onContextLost, dark = false }: Props) {
  const quality = useViewer((s) => s.quality);
  const q = QUALITY[quality];
  const [lost, setLost] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);
  const [stats, setStats] = useState(false);
  useEffect(() => setStats(statsRequested()), []);

  // A quality change that toggles antialiasing replaces the canvas; React Three Fiber then
  // forces a context loss on the old one. Only the current canvas may report a real loss.
  const canvasId = `${canvasKey}-${q.antialias}-${q.ao}`;
  const liveCanvas = useRef(canvasId);
  liveCanvas.current = canvasId;
  useEffect(() => {
    liveCanvas.current = canvasId;
    return () => {
      liveCanvas.current = ''; // lab closed: nothing left to recover
    };
  });

  if (lost) {
    return (
      <div className="grid h-full w-full place-items-center p-6 text-center">
        <div className="panel max-w-sm p-6">
          <p className="font-semibold">A placa de vídeo reiniciou a visualização 3D.</p>
          <p className="mt-2 text-sm text-fg-muted">Isso pode acontecer quando o computador está com pouca memória de vídeo. Tente o perfil de qualidade Econômico.</p>
          <button
            className="btn btn-primary mt-4"
            onClick={() => {
              setLost(false);
              setCanvasKey((k) => k + 1);
            }}
          >
            Recarregar cena 3D
          </button>
        </div>
      </div>
    );
  }

  return (
    <Canvas
      key={canvasId}
      dpr={q.dpr}
      gl={{ antialias: q.antialias && !q.ao, powerPreference: 'high-performance', alpha: true, preserveDrawingBuffer: false }}
      camera={{ fov: 32, near: 0.01, far: 50, position: cameraPreset.position }}
      frameloop="demand"
      onPointerMissed={(e) => {
        if ((e as MouseEvent).button === 0) onPointerMissed?.();
      }}
      onCreated={({ gl, raycaster }) => {
        const createdAs = canvasId;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.localClippingEnabled = true; // per-material cut-aways (e.g. the heart)
        gl.toneMappingExposure = 1.0;
        gl.setClearColor(0x000000, 0); // transparent: the CSS studio backdrop shows through
        // three-mesh-bvh: stop at the first hit per mesh (the picker only needs the nearest point of each)
        (raycaster as THREE.Raycaster & { firstHitOnly?: boolean }).firstHitOnly = true;
        const canvas = gl.domElement;
        canvas.addEventListener('webglcontextlost', (ev) => {
          if (liveCanvas.current !== createdAs) return; // old canvas being disposed
          ev.preventDefault();
          setLost(true);
          onContextLost?.();
        });
      }}
      data-testid="lab-canvas"
    >
      {/* Studio lighting: soft key from the front-top, cool fill, warm rim. */}
      <hemisphereLight args={[dark ? '#dbeafe' : '#ffffff', dark ? '#0b1626' : '#b8c2cc', dark ? 0.7 : 0.85]} />
      <directionalLight position={[1.8, 3.5, 4]} intensity={dark ? 1.6 : 1.9} />
      <directionalLight position={[-3, 1.6, 1.5]} intensity={0.55} color="#dbe8ff" />
      <directionalLight position={[0, 2.5, -4]} intensity={dark ? 1.1 : 0.9} color="#fff1e6" />
      {q.environment && (
        // Procedural studio reflections: no HDR download, no external requests.
        <Suspense fallback={null}>
          <Environment resolution={q.envResolution} environmentIntensity={dark ? 0.5 : 0.65}>
            <Lightformer form="rect" intensity={2.4} position={[0, 3, 3.5]} scale={[5, 2.5, 1]} />
            <Lightformer form="rect" intensity={1.1} color="#dbeafe" position={[-4, 1.2, 0]} rotation-y={Math.PI / 2} scale={[3, 4, 1]} />
            <Lightformer form="rect" intensity={1.1} position={[4, 1.2, 0.5]} rotation-y={-Math.PI / 2} scale={[3, 4, 1]} />
            <Lightformer form="rect" intensity={0.9} color="#fff1e6" position={[0, 1.5, -4]} rotation-y={Math.PI} scale={[4, 3, 1]} />
          </Environment>
        </Suspense>
      )}
      {q.ao && (
        // The composer disables the renderer's own tone mapping, so ACES is re-applied as the last pass;
        // without it the "balanced" and "high" profiles looked washed out compared with "economy".
        <EffectComposer multisampling={q.multisampling} enableNormalPass={false}>
          <N8AO aoRadius={0.06} distanceFalloff={0.6} intensity={dark ? 2.2 : 2.6} quality={q.aoQuality} halfRes={q.aoHalfRes} />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        </EffectComposer>
      )}
      {/* Resolution drops to dpr[0] only while the camera is moving (CameraRig regresses), never at rest. */}
      {q.adaptive && <AdaptiveDpr pixelated={false} />}
      {children}
      <CameraRig preset={cameraPreset} />
      <TestHook />
      {stats && <StatsOverlay />}
    </Canvas>
  );
}
