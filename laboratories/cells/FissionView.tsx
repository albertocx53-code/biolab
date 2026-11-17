'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { meshRegistry } from '@/engine/selection/registry';
import type { MaterialLibrary } from '@/engine/visibility/materials';
import { ProceduralModelView } from '@/laboratories/shared/ProceduralModelView';
import { deformFissionEnvelope, FISSION_ENVELOPES, poseFission, type FissionModel } from './fission';
import { CELL_PROCESSES, processClock, useProcess } from './processes';

const DYNAMIC = new Set<string>(FISSION_ENVELOPES);
const ENVELOPE: Record<string, { kInner: number; scaleK: number }> = { 'parede-celular-bacteriana': { kInner: 0.965, scaleK: 1 }, 'membrana-plasmatica': { kInner: 0.97, scaleK: 0.94 } };

/** Binary fission scene: the shared mesh view plus a per-frame pose driven by the process clock. */
export function FissionView({ model, library, hover, onPick }: { model: FissionModel; library: MaterialLibrary; hover: boolean; onPick: (meshId: string) => void }) {
  const lastP = useRef(-1);
  useFrame(() => {
    const st = useProcess.getState();
    const steps = CELL_PROCESSES.fissao.steps;
    const active = st.id === 'fissao';
    const step = active ? st.step : 0;
    const P = step + (active ? Math.min(1, processClock.t / steps[step].seconds) : 0);
    if (Math.abs(P - lastP.current) < 1e-4 && meshRegistry.has('nucleoide-a')) return;
    lastP.current = P;
    poseFission(P, (id) => meshRegistry.get(id));
    for (const id of FISSION_ENVELOPES) {
      const m = meshRegistry.get(id);
      if (m) deformFissionEnvelope(m.geometry, P, ENVELOPE[id].kInner, ENVELOPE[id].scaleK);
    }
  });
  return <ProceduralModelView modelId="fissao" meshes={model.meshes} library={library} hover={hover} onPick={onPick} dynamic={DYNAMIC} />;
}
