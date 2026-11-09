'use client';

import { Html } from '@react-three/drei';
import { useMemo } from 'react';
import { meshRegistry } from '@/engine/selection/registry';
import { useViewer } from '@/engine/store';

/** Large, readable label pinned above the selected structure. */
export function SelectionLabel({ text, meshIds }: { text: string; meshIds: string[] }) {
  const presentation = useViewer((s) => s.presentation);
  const ready = useViewer((s) => s.modelState);
  const pos = useMemo(() => {
    const box = meshRegistry.boundsOf(meshIds);
    if (!box) return null;
    return [(box.min.x + box.max.x) / 2, box.max.y, (box.min.z + box.max.z) / 2] as [number, number, number];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meshIds, ready]);
  if (!pos) return null;
  return (
    <Html position={pos} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
      <div className="-translate-y-6 flex flex-col items-center">
        <span
          className={`rounded-lg border border-cyan/50 bg-ink-900/90 font-semibold whitespace-nowrap text-fg shadow-lg backdrop-blur ${presentation ? 'px-4 py-2 text-2xl' : 'px-2.5 py-1 text-sm'}`}
        >
          {text}
        </span>
        <span className="h-4 w-px bg-cyan/70" />
        <span className="h-2 w-2 rounded-full bg-cyan" />
      </div>
    </Html>
  );
}
