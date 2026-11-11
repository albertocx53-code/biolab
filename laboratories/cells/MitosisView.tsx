'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { meshRegistry } from '@/engine/selection/registry';
import type { MaterialLibrary } from '@/engine/visibility/materials';
import { CellModelView } from './CellModelView';
import { deformMembrane, membraneShape, poseMitosis, type MitosisModel } from './mitosis';
import { CELL_PROCESSES, processClock, useProcess } from './processes';

const DYNAMIC = new Set(['membrana-plasmatica']);

/** Mitosis scene: the shared mesh view plus a per-frame pose driven by the process clock. */
export function MitosisView({ model, library, hover, onPick }: { model: MitosisModel; library: MaterialLibrary; hover: boolean; onPick: (meshId: string) => void }) {
  const lastP = useRef(-1);
  const lastShapeP = useRef(-1);

  useFrame(() => {
    const st = useProcess.getState();
    const steps = CELL_PROCESSES.mitose.steps;
    const step = st.id === 'mitose' ? st.step : 0;
    const P = step + Math.min(1, processClock.t / steps[step].seconds) * (st.id === 'mitose' ? 1 : 0);
    if (Math.abs(P - lastP.current) < 1e-4 && meshRegistry.has('cromatide-1a')) return;
    lastP.current = P;
    poseMitosis(model, P, (id) => meshRegistry.get(id));
    const shapeP = Math.max(3, Math.min(6, P));
    if (Math.abs(shapeP - lastShapeP.current) > 1e-3) {
      const m = meshRegistry.get('membrana-plasmatica');
      if (m) {
        deformMembrane(m.geometry, membraneShape(P));
        lastShapeP.current = shapeP;
      }
    }
  });

  return <CellModelView modelId="mitose" meshes={model.meshes} library={library} hover={hover} onPick={onPick} dynamic={DYNAMIC} />;
}
