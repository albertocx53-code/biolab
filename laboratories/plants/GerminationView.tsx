'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { meshRegistry } from '@/engine/selection/registry';
import type { MaterialLibrary } from '@/engine/visibility/materials';
import { processClock, useProcess } from '@/laboratories/shared/process';
import { ProceduralModelView } from '@/laboratories/shared/ProceduralModelView';
import type { SeedModel } from './germination';
import { PLANT_PROCESSES } from './processes';

/** Seed scene: the shared mesh view plus a per-frame pose driven by the germination process. */
export function GerminationView({ model, library, hover, onPick }: { model: SeedModel; library: MaterialLibrary; hover: boolean; onPick: (meshId: string) => void }) {
  const lastP = useRef(-1);
  useFrame(() => {
    const st = useProcess.getState();
    const running = st.id === 'germinacao';
    const steps = PLANT_PROCESSES.germinacao.steps;
    const step = running ? st.step : 0;
    const P = running ? step + Math.min(1, processClock.t / steps[step].seconds) : 0;
    if (Math.abs(P - lastP.current) < 1e-4 && meshRegistry.has('radicula')) return;
    lastP.current = P;
    model.pose(P, (id) => meshRegistry.get(id));
  });
  return <ProceduralModelView modelId="semente" meshes={model.meshes} library={library} hover={hover} onPick={onPick} />;
}
