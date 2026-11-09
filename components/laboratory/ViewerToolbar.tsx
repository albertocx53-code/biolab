'use client';

import { useViewer, type CameraView } from '@/engine/store';
import { Icon } from '@/components/ui/Icon';

const VIEWS: { id: CameraView; label: string; key: string }[] = [
  { id: 'frente', label: 'Frente', key: '1' },
  { id: 'costas', label: 'Costas', key: '2' },
  { id: 'esquerda', label: 'Lado esq.', key: '3' },
  { id: 'direita', label: 'Lado dir.', key: '4' },
];

export function ViewerToolbar() {
  const command = useViewer((s) => s.command);
  const zoom = useViewer((s) => s.zoomPercent);
  const showAll = useViewer((s) => s.showAll);
  const labels = useViewer((s) => s.labels);
  const setLabels = useViewer((s) => s.setLabels);
  const anyHidden = useViewer((s) => Object.keys(s.hiddenMeshIds).length > 0 || !!s.isolatedMeshIds);
  const presentation = useViewer((s) => s.presentation);
  const size = presentation ? 'h-12 w-12' : '';

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-2 p-3 sm:p-4">
      <div className="pointer-events-auto flex flex-wrap items-center gap-1.5">
        <div className="flex rounded-[11px] border border-line bg-ink-900/80 p-0.5 backdrop-blur" role="group" aria-label="Vistas da câmera">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              type="button"
              className={`rounded-[9px] px-2.5 font-medium text-fg-muted hover:bg-white/[0.06] hover:text-fg ${presentation ? 'py-3 text-base' : 'py-2 text-xs'}`}
              onClick={() => command({ type: 'view', view: v.id })}
              title={`${v.label} (${v.key})`}
            >
              {v.label}
            </button>
          ))}
        </div>
        <button type="button" className={`icon-btn ${size}`} onClick={() => command({ type: 'reset' })} title="Reiniciar câmera (R)" aria-label="Reiniciar câmera">
          <Icon name="reset" />
        </button>
        <button type="button" className={`icon-btn ${size}`} aria-pressed={labels} onClick={() => setLabels(!labels)} title="Rótulos (L)" aria-label="Mostrar rótulos">
          <span className="text-[13px] font-bold">Aa</span>
        </button>
        {anyHidden && (
          <button type="button" className="btn btn-ghost h-10 bg-ink-900/80 text-xs" onClick={showAll} title="Mostrar tudo (A)">
            <Icon name="eye" size={15} /> Mostrar tudo
          </button>
        )}
      </div>
      <div className="pointer-events-auto flex items-center gap-1.5">
        <button type="button" className={`icon-btn ${size}`} onClick={() => command({ type: 'zoom', factor: 1 / 1.25 })} aria-label="Afastar" title="Afastar (−)">
          <Icon name="zoomOut" />
        </button>
        <span className="grid h-10 min-w-16 place-items-center rounded-[10px] border border-line bg-ink-900/80 px-2 text-sm tabular-nums" aria-live="polite" aria-label="Nível de zoom">
          {zoom}%
        </span>
        <button type="button" className={`icon-btn ${size}`} onClick={() => command({ type: 'zoom', factor: 1.25 })} aria-label="Aproximar" title="Aproximar (+)">
          <Icon name="zoomIn" />
        </button>
      </div>
    </div>
  );
}
