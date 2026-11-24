'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type * as THREE from 'three';
import { meshRegistry } from '@/engine/selection/registry';
import type { MaterialLibrary } from '@/engine/visibility/materials';
import { ProceduralModelView } from '@/laboratories/shared/ProceduralModelView';
import type { MeshDef } from '@/laboratories/shared/types';
import { GENETICS_PROCESSES, processClock, useProcess } from './processes';

/**
 * Scene of an animated process: the shared mesh view plus a per-frame pose
 * driven by the process clock (phase P = step + progress of the step).
 * Without the process running, the scene shows step `idle`.
 */
export function PoseView({
  modelId,
  processId,
  meshes,
  pose,
  probe,
  library,
  hover,
  onPick,
}: {
  modelId: string;
  processId: string;
  meshes: MeshDef[];
  pose: (P: number, get: (id: string) => THREE.Object3D | undefined) => void;
  /** A mesh id that exists once the scene is registered. */
  probe: string;
  library: MaterialLibrary;
  hover: boolean;
  onPick: (meshId: string) => void;
}) {
  const lastP = useRef(-1);
  useFrame(({ invalidate }) => {
    const st = useProcess.getState();
    const steps = GENETICS_PROCESSES[processId].steps;
    const active = st.id === processId;
    const step = active ? st.step : 0;
    const P = step + (active ? Math.min(1, processClock.t / steps[step].seconds) : 0);
    if (Math.abs(P - lastP.current) < 1e-4 && meshRegistry.has(probe)) return;
    lastP.current = P;
    pose(P, (id) => meshRegistry.get(id));
    invalidate();
  });
  return <ProceduralModelView modelId={modelId} meshes={meshes} library={library} hover={hover} onPick={onPick} />;
}
