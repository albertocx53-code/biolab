'use client';

import { useState } from 'react';
import { useViewer } from '@/engine/store';
import type { CatalogGroup, CatalogModel } from '@/engine/types';
import { Icon } from '@/components/ui/Icon';

/** Compact system list: one tap to show/hide, opacity on demand. */
export function LayersPanel({ groups, models, ariaLabel = 'Sistemas anatômicos' }: { groups: CatalogGroup[]; models: CatalogModel[]; ariaLabel?: string }) {
  const visible = useViewer((s) => s.groupVisible);
  const opacity = useViewer((s) => s.groupOpacity);
  const modelState = useViewer((s) => s.modelState);
  const setVisible = useViewer((s) => s.setGroupVisible);
  const setOpacity = useViewer((s) => s.setGroupOpacity);
  const [open, setOpen] = useState<string | null>(null);
  const modelById = new Map(models.map((m) => [m.id, m]));

  return (
    <ul className="space-y-0.5" aria-label={ariaLabel}>
      {groups.map((g) => {
        const on = !!visible[g.id];
        const st = modelState[g.modelId] ?? 'idle';
        const m = modelById.get(g.modelId);
        const op = opacity[g.id] ?? 1;
        const expanded = open === g.id && on;
        return (
          <li key={g.id} className={`rounded-lg ${expanded ? 'bg-ink-800' : ''}`}>
            <div className="flex items-center gap-2 px-1.5 py-1">
              <button
                type="button"
                role="switch"
                aria-checked={on}
                aria-label={`${on ? 'Ocultar' : 'Mostrar'} ${g.name}`}
                onClick={() => setVisible(g.id, !on)}
                className="flex min-w-0 flex-1 items-center gap-2.5 rounded-md py-1 text-left"
              >
                <span
                  className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border-2 transition-colors`}
                  style={{ borderColor: g.color, background: on ? g.color : 'transparent' }}
                  aria-hidden="true"
                />
                <span className={`truncate text-[13px] leading-tight ${on ? 'font-medium text-fg' : 'text-fg-subtle'}`}>{g.name}</span>
                {on && st === 'loading' && <span className="h-3 w-3 shrink-0 animate-spin rounded-full border-2 border-cyan border-t-transparent" aria-label="carregando" />}
                {st === 'error' && <span className="text-[11px] text-danger">erro</span>}
                {!on && st === 'idle' && m && m.bytes > 0 && <span className="ml-auto shrink-0 text-[10px] text-fg-subtle">{(m.bytes / 1e6).toFixed(1)} MB</span>}
              </button>
              {on && (
                <button
                  type="button"
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-md text-fg-subtle hover:text-fg ${expanded ? 'text-fg' : ''}`}
                  onClick={() => setOpen(expanded ? null : g.id)}
                  aria-expanded={expanded}
                  aria-label={`Transparência de ${g.name}`}
                  title="Transparência"
                >
                  <Icon name="sliders" size={14} />
                </button>
              )}
            </div>
            {expanded && (
              <label className="flex items-center gap-2 px-3 pb-2 text-[11px] text-fg-subtle">
                <input
                  type="range"
                  min={0.05}
                  max={1}
                  step={0.05}
                  value={op}
                  onChange={(e) => setOpacity(g.id, Number(e.target.value))}
                  className="h-1 min-w-0 flex-1 accent-[var(--color-fg)]"
                  aria-label={`Opacidade de ${g.name}`}
                />
                <span className="w-8 shrink-0 text-right tabular-nums">{Math.round(op * 100)}%</span>
              </label>
            )}
          </li>
        );
      })}
    </ul>
  );
}
