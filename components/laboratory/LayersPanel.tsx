'use client';

import { useViewer } from '@/engine/store';
import type { CatalogGroup, CatalogModel } from '@/engine/types';
import { Icon } from '@/components/ui/Icon';

export function LayersPanel({ groups, models }: { groups: CatalogGroup[]; models: CatalogModel[] }) {
  const visible = useViewer((s) => s.groupVisible);
  const opacity = useViewer((s) => s.groupOpacity);
  const modelState = useViewer((s) => s.modelState);
  const setVisible = useViewer((s) => s.setGroupVisible);
  const setOpacity = useViewer((s) => s.setGroupOpacity);
  const modelById = new Map(models.map((m) => [m.id, m]));

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <p className="eyebrow">Sistemas e camadas</p>
        <Icon name="layers" size={16} className="text-fg-subtle" />
      </div>
      <ul className="scroll-thin flex-1 space-y-1 overflow-y-auto px-2 pb-3" aria-label="Sistemas anatômicos">
        {groups.map((g) => {
          const on = !!visible[g.id];
          const st = modelState[g.modelId] ?? 'idle';
          const m = modelById.get(g.modelId);
          const op = opacity[g.id] ?? 1;
          return (
            <li key={g.id} className={`rounded-lg px-2 py-2 transition-colors ${on ? 'bg-white/[0.04]' : ''}`}>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  role="switch"
                  aria-checked={on}
                  aria-label={`${on ? 'Ocultar' : 'Mostrar'} ${g.name}`}
                  onClick={() => setVisible(g.id, !on)}
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-md border transition-colors ${on ? 'border-cyan/50 bg-cyan-soft text-cyan' : 'border-line text-fg-subtle hover:text-fg'}`}
                >
                  <Icon name={on ? 'eye' : 'eyeOff'} size={15} />
                </button>
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: g.color }} aria-hidden="true" />
                <span className={`flex-1 text-[13px] leading-tight ${on ? 'text-fg' : 'text-fg-muted'}`}>{g.name}</span>
                {on && st === 'loading' && <span className="text-[11px] text-cyan">carregando…</span>}
                {st === 'error' && <span className="text-[11px] text-danger">erro</span>}
                {!on && st === 'idle' && m && <span className="text-[11px] text-fg-subtle">{(m.bytes / 1e6).toFixed(1)} MB</span>}
              </div>
              {on && (
                <label className="mt-2 flex items-center gap-2 pl-[38px] text-[11px] text-fg-subtle">
                  <span className="w-16">Opacidade</span>
                  <input
                    type="range"
                    min={0.05}
                    max={1}
                    step={0.05}
                    value={op}
                    onChange={(e) => setOpacity(g.id, Number(e.target.value))}
                    className="h-1 min-w-0 flex-1 accent-cyan"
                    aria-label={`Opacidade de ${g.name}`}
                  />
                  <span className="w-9 shrink-0 text-right tabular-nums">{Math.round(op * 100)}%</span>
                </label>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
