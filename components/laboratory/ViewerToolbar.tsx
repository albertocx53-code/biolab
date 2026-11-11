'use client';

import { useViewer, type CameraView } from '@/engine/store';
import { Icon } from '@/components/ui/Icon';

export interface ViewButton {
  id: CameraView;
  label: string;
  key: string;
}

const VIEWS: ViewButton[] = [
  { id: 'frente', label: 'Frente', key: '1' },
  { id: 'costas', label: 'Costas', key: '2' },
  { id: 'esquerda', label: 'Lado esq.', key: '3' },
  { id: 'direita', label: 'Lado dir.', key: '4' },
];

export function ViewerToolbar({ views = VIEWS }: { views?: ViewButton[] } = {}) {
  const command = useViewer((s) => s.command);
  const zoom = useViewer((s) => s.zoomPercent);
  const showAll = useViewer((s) => s.showAll);
  const labels = useViewer((s) => s.labels);
  const setLabels = useViewer((s) => s.setLabels);
  const anyHidden = useViewer((s) => Object.keys(s.hiddenMeshIds).length > 0 || !!s.isolatedMeshIds);
  const presentation = useViewer((s) => s.presentation);

  const btn = presentation ? 'h-12 min-w-12 text-base' : 'h-9 min-w-9 text-[13px]';

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-3 z-20 flex justify-center px-3 sm:bottom-4">
      <div className="float-card pointer-events-auto flex max-w-full items-center gap-0.5 overflow-x-auto rounded-full p-1" role="toolbar" aria-label="Controles da câmera">
        <div className="flex" role="group" aria-label="Vistas da câmera">
          {views.map((v) => (
            <button
              key={v.id}
              type="button"
              className={`rounded-full px-3 font-medium text-fg-muted hover:bg-ink-800 hover:text-fg ${btn}`}
              onClick={() => command({ type: 'view', view: v.id })}
              title={`${v.label} (${v.key})`}
            >
              {v.label}
            </button>
          ))}
        </div>
        <span className="mx-1 h-5 w-px bg-line-strong" aria-hidden="true" />
        <button type="button" className={`grid place-items-center rounded-full text-fg-muted hover:bg-ink-800 hover:text-fg ${btn}`} onClick={() => command({ type: 'reset' })} title="Reiniciar câmera (R)" aria-label="Reiniciar câmera">
          <Icon name="reset" size={17} />
        </button>
        <button
          type="button"
          className={`grid place-items-center rounded-full font-bold ${btn} ${labels ? 'bg-fg text-ink-900' : 'text-fg-muted hover:bg-ink-800 hover:text-fg'}`}
          aria-pressed={labels}
          onClick={() => setLabels(!labels)}
          title="Rótulos (L)"
          aria-label="Mostrar rótulos"
        >
          Aa
        </button>
        <span className="mx-1 h-5 w-px bg-line-strong" aria-hidden="true" />
        <button type="button" className={`grid place-items-center rounded-full text-fg-muted hover:bg-ink-800 hover:text-fg ${btn}`} onClick={() => command({ type: 'zoom', factor: 1 / 1.25 })} aria-label="Afastar" title="Afastar (−)">
          <Icon name="zoomOut" size={17} />
        </button>
        <span className="min-w-12 text-center text-[13px] text-fg-muted tabular-nums" aria-live="polite" aria-label="Nível de zoom">
          {zoom}%
        </span>
        <button type="button" className={`grid place-items-center rounded-full text-fg-muted hover:bg-ink-800 hover:text-fg ${btn}`} onClick={() => command({ type: 'zoom', factor: 1.25 })} aria-label="Aproximar" title="Aproximar (+)">
          <Icon name="zoomIn" size={17} />
        </button>
        {anyHidden && (
          <>
            <span className="mx-1 h-5 w-px bg-line-strong" aria-hidden="true" />
            <button type="button" className={`flex items-center gap-1.5 rounded-full px-3 font-medium text-fg hover:bg-ink-800 ${btn}`} onClick={showAll} title="Mostrar tudo (A)">
              <Icon name="eye" size={15} /> Mostrar tudo
            </button>
          </>
        )}
      </div>
    </div>
  );
}
