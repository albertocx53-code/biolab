'use client';

import { Canvas } from '@react-three/fiber';
import { AdaptiveDpr, Environment, Lightformer, PerformanceMonitor } from '@react-three/drei';
import { Suspense, useEffect, useState, type ReactNode } from 'react';
import * as THREE from 'three';
import { QUALITY } from '@/engine/performance/quality';
import { useViewer } from '@/engine/store';
import { CameraRig, type CameraPreset } from './CameraRig';
import { TestHook } from './TestHook';

interface Props {
  children: ReactNode;
  cameraPreset: CameraPreset;
  onPointerMissed?: () => void;
  onContextLost?: () => void;
}

/**
 * Shared WebGL canvas for every laboratory: quality profile, lighting,
 * adaptive resolution, BVH-accelerated raycasting and context-loss recovery.
 */
export function LabCanvas({ children, cameraPreset, onPointerMissed, onContextLost }: Props) {
  const quality = useViewer((s) => s.quality);
  const q = QUALITY[quality];
  const [dprCap, setDprCap] = useState(q.dpr[1]);
  const [lost, setLost] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);

  useEffect(() => setDprCap(q.dpr[1]), [q.dpr]);

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
      key={`${canvasKey}-${q.antialias}`}
      dpr={[q.dpr[0], dprCap]}
      gl={{ antialias: q.antialias, powerPreference: 'high-performance', alpha: false, preserveDrawingBuffer: false }}
      camera={{ fov: 32, near: 0.01, far: 50, position: cameraPreset.position }}
      frameloop="demand"
      onPointerMissed={(e) => {
        if ((e as MouseEvent).button === 0) onPointerMissed?.();
      }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        gl.setClearColor('#07111F');
        const canvas = gl.domElement;
        canvas.addEventListener('webglcontextlost', (ev) => {
          ev.preventDefault();
          setLost(true);
          onContextLost?.();
        });
      }}
      data-testid="lab-canvas"
    >
      <color attach="background" args={['#07111F']} />
      <hemisphereLight args={['#dbeafe', '#0b1626', 0.9]} />
      <directionalLight position={[2.5, 4, 3]} intensity={1.6} />
      <directionalLight position={[-3, 2, -2]} intensity={0.55} color="#93c5fd" />
      <directionalLight position={[0, -2, 3]} intensity={0.25} />
      {q.environment && (
        // Procedural studio lighting: no HDR download, no external requests.
        <Suspense fallback={null}>
          <Environment resolution={64} environmentIntensity={0.45}>
            <Lightformer form="rect" intensity={2.2} position={[0, 3, 3]} scale={[4, 2, 1]} />
            <Lightformer form="rect" intensity={1.2} color="#bae6fd" position={[-4, 1, -1]} rotation-y={Math.PI / 2} scale={[3, 3, 1]} />
            <Lightformer form="rect" intensity={0.8} position={[4, 1, 1]} rotation-y={-Math.PI / 2} scale={[3, 3, 1]} />
          </Environment>
        </Suspense>
      )}
      {q.adaptive && (
        <PerformanceMonitor
          onDecline={() => setDprCap((d) => Math.max(q.dpr[0], +(d - 0.25).toFixed(2)))}
          onIncline={() => setDprCap((d) => Math.min(q.dpr[1], +(d + 0.25).toFixed(2)))}
        >
          <AdaptiveDpr pixelated={false} />
        </PerformanceMonitor>
      )}
      {children}
      <CameraRig preset={cameraPreset} />
      <TestHook />
    </Canvas>
  );
}
