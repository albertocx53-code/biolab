'use client';

import { Icon } from '@/components/ui/Icon';
import { useProcess, type LabProcess } from './process';

/** Caption + controls for the running process animation (above the camera toolbar). */
export function ProcessPlayer({
  processes,
  large,
  docked,
}: {
  processes: Record<string, LabProcess>;
  large?: boolean;
  /** Dock to the right on wide screens (no panel open). */
  docked?: boolean;
}) {
  const { id, step, playing, setStep, setPlaying, stop, start } = useProcess();
  if (!id) return null;
  const proc = processes[id];
  if (!proc) return null;
  const cur = proc.steps[step];
  const last = step === proc.steps.length - 1;
  return (
    <section
      className={`float-card pointer-events-auto absolute bottom-[4.5rem] left-1/2 z-20 w-[min(560px,calc(100%-1.5rem))] -translate-x-1/2 p-4 max-lg:bottom-[4.25rem] ${docked ? 'lg:top-20 lg:right-4 lg:bottom-auto lg:left-auto lg:w-[380px] lg:translate-x-0' : large ? 'lg:w-[680px]' : ''}`}
      aria-label={`Animação: ${proc.title}`}
      data-testid="process-player"
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="eyebrow text-cyan">{proc.title}</p>
          <h2 className={`mt-1 font-bold ${large ? 'text-2xl' : 'text-[16px]'}`} data-testid="process-step-title">
            {cur.title}
          </h2>
        </div>
        <button type="button" className="icon-btn h-8 w-8 shrink-0" onClick={stop} aria-label="Fechar animação">
          <Icon name="close" size={14} />
        </button>
      </div>
      <p className={`mt-1.5 leading-relaxed text-fg/90 ${large ? 'text-lg' : 'text-[13.5px]'}`}>{cur.text}</p>
      {cur.legend && cur.legend.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-fg-muted" aria-label="Legenda">
          {cur.legend.map((l) => (
            <li key={l.label} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: l.color }} /> {l.label}
            </li>
          ))}
        </ul>
      )}
      {proc.equation && last && <p className="mt-2 rounded-md bg-ink-800 px-2.5 py-1.5 text-center font-mono text-[12.5px]">{proc.equation}</p>}
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          className="btn btn-primary h-9 px-3 text-[13px]"
          onClick={() => (last && !playing && !proc.loop ? start(proc.id) : setPlaying(!playing))}
          data-testid="process-play"
        >
          <Icon name={playing ? 'pause' : 'play'} size={14} /> {playing ? 'Pausar' : last && !proc.loop ? 'Repetir' : 'Reproduzir'}
        </button>
        {proc.steps.length > 1 && (
          <ol className="flex flex-1 flex-wrap gap-1" aria-label="Etapas">
            {proc.steps.map((st, i) => (
              <li key={st.title}>
                <button
                  type="button"
                  onClick={() => setStep(i)}
                  aria-current={i === step ? 'step' : undefined}
                  title={st.title}
                  className={`rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${i === step ? 'bg-fg text-ink-900' : 'bg-ink-800 text-fg-muted hover:text-fg'}`}
                >
                  {proc.namedSteps ? st.title : i + 1}
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>
      <p className="mt-2 text-[11px] text-fg-subtle">{proc.note}</p>
    </section>
  );
}
