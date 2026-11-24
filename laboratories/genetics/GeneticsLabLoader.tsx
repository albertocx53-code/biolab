'use client';

import dynamic from 'next/dynamic';

/** Scene-level code splitting: the genetics lab is only downloaded when it opens. */
const GeneticsLab = dynamic(() => import('./GeneticsLab').then((m) => m.GeneticsLab), {
  ssr: false,
  loading: () => (
    <div className="grid h-dvh place-items-center text-fg-muted">
      <span className="flex items-center gap-3">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-cyan border-t-transparent" /> Abrindo o laboratório…
      </span>
    </div>
  ),
});

export default function GeneticsLabLoader(props: { canUseStudio: boolean; tierLabel: string }) {
  return <GeneticsLab {...props} />;
}
