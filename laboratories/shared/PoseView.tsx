'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type * as THREE from 'three';
import { meshRegistry } from '@/engine/selection/registry';
import type { MaterialLibrary } from '@/engine/visibility/materials';
import { processClock, useProcess, type LabProcess } from './process';
import { ProceduralModelView } from './ProceduralModelView';
import type { MeshDef } from './types';

export type PoseFn = (P: number, get: (id: string) => THREE.Object3D | undefined) => void;

/**
 * Scene of an animated process: the shared mesh view plus a per-frame pose
 * driven by the process clock (phase P = step + progress of the step).
 * A scene can serve several processes (`poses` by process id); without a
 * running process it shows the first pose at P = 0.
 */
export function PoseView({
  modelId,
  processes,
  poses,
  meshes,
  probe,
  library,
  hover,
  onPick,
}: {
  modelId: string;
  processes: Record<string, LabProcess>;
  poses: Record<string, PoseFn>;
  meshes: MeshDef[];
  /** A mesh id that exists once the scene is registered. */
  probe: string;
  library: MaterialLibrary;
  hover: boolean;
  onPick: (meshId: string) => void;
}) {
  const last = useRef('');
  useFrame(({ invalidate }) => {
    const st = useProcess.getState();
    const active = st.id && poses[st.id] ? st.id : null;
    const id = active ?? Object.keys(poses)[0];
    const steps = processes[id].steps;
    const step = active ? Math.min(st.step, steps.length - 1) : 0;
    const P = step + (active ? Math.min(1, processClock.t / steps[step].seconds) : 0);
    const key = `${id}:${P.toFixed(4)}`;
    if (key === last.current && meshRegistry.has(probe)) return;
    last.current = key;
    poses[id](P, (mid) => meshRegistry.get(mid));
    invalidate();
  });
  return <ProceduralModelView modelId={modelId} meshes={meshes} library={library} hover={hover} onPick={onPick} />;
}
