'use client';

import dynamic from 'next/dynamic';

/** Scene-level code splitting: the microorganisms lab is only downloaded when it opens. */
const MicrobeLab = dynamic(() => import('./MicrobeLab').then((m) => m.MicrobeLab), {
  ssr: false,
  loading: () => (
    <div className="grid h-dvh place-items-center text-fg-muted">
      <span className="flex items-center gap-3">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-cyan border-t-transparent" /> Abrindo o laboratório…
      </span>
    </div>
  ),
});

export default function MicrobeLabLoader(props: { canUseStudio: boolean; tierLabel: string }) {
  return <MicrobeLab {...props} />;
}
