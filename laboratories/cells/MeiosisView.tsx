'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { meshRegistry } from '@/engine/selection/registry';
import type { MaterialLibrary } from '@/engine/visibility/materials';
import { ProceduralModelView } from '@/laboratories/shared/ProceduralModelView';
import { deformMeiosisMembrane, MEIOSIS_MEMBRANES, meiosisMembraneShapes, poseMeiosis, type MeiosisModel } from './meiosis';
import { CELL_PROCESSES, processClock, useProcess } from './processes';

const DYNAMIC = new Set<string>(MEIOSIS_MEMBRANES);
const INNER: Record<string, number> = { 'membrana-plasmatica': 0.975, 'membrana-a': 0.97, 'membrana-b': 0.97 };

/** Meiosis scene: the shared mesh view plus a per-frame pose driven by the process clock. */
export function MeiosisView({ model, library, hover, onPick }: { model: MeiosisModel; library: MaterialLibrary; hover: boolean; onPick: (meshId: string) => void }) {
  const lastP = useRef(-1);
  const lastShapeP = useRef(-1);

  useFrame(() => {
    const st = useProcess.getState();
    const steps = CELL_PROCESSES.meiose.steps;
    const active = st.id === 'meiose';
    const step = active ? st.step : 0;
    const P = step + (active ? Math.min(1, processClock.t / steps[step].seconds) : 0);
    if (Math.abs(P - lastP.current) < 1e-4 && meshRegistry.has('cromatide-1a')) return;
    lastP.current = P;
    poseMeiosis(model, P, (id) => meshRegistry.get(id));
    // membranes only change shape during the two cytokineses
    const shapeP = P < 3 ? 3 : P > 4.85 && P < 7 ? 7 : Math.min(8.92, P);
    if (Math.abs(shapeP - lastShapeP.current) > 1e-3) {
      const shapes = meiosisMembraneShapes(P);
      for (const [id, shape] of Object.entries(shapes)) {
        const m = meshRegistry.get(id);
        if (m) deformMeiosisMembrane(m.geometry, shape, INNER[id]);
      }
      lastShapeP.current = shapeP;
    }
  });

  return <ProceduralModelView modelId="meiose" meshes={model.meshes} library={library} hover={hover} onPick={onPick} dynamic={DYNAMIC} />;
}
