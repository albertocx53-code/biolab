'use client';

import dynamic from 'next/dynamic';

/** Scene-level code splitting: the 3D engine is only downloaded when a lab opens. */
const HumanLab = dynamic(() => import('./HumanLab').then((m) => m.HumanLab), {
  ssr: false,
  loading: () => (
    <div className="grid h-dvh place-items-center text-fg-muted">
      <span className="flex items-center gap-3">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-cyan border-t-transparent" /> Abrindo o laboratório…
      </span>
    </div>
  ),
});

export default function HumanLabLoader(props: { canUseStudio: boolean; tierLabel: string }) {
  return <HumanLab {...props} />;
}
