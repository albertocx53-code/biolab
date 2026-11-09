'use client';

import type { Structure } from '@/data/biology/schema';
import { Icon } from '@/components/ui/Icon';

export interface RegionLayer {
  group: string;
  label: string;
  structures: Structure[];
}

interface Props {
  name: string;
  layers: RegionLayer[];
  activeLayer: string | null;
  onLayer: (group: string) => void;
  onSelect: (id: string) => void;
  onClose: () => void;
}

/** "Clicked the arm" panel: lists layers available in a body region and their structures. */
export function RegionPanel({ name, layers, activeLayer, onLayer, onSelect, onClose }: Props) {
  const current = layers.find((l) => l.group === activeLayer);
  return (
    <section className="flex h-full flex-col" data-testid="region-panel" aria-labelledby="region-title">
      <header className="border-b border-line px-5 pt-5 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow mb-1.5">Região do corpo</p>
            <h2 id="region-title" className="font-[family-name:var(--font-display)] text-2xl leading-tight font-bold">
              {name}
            </h2>
          </div>
          <button type="button" className="icon-btn shrink-0" onClick={onClose} aria-label="Fechar painel">
            <Icon name="close" size={16} />
          </button>
        </div>
        <p className="mt-2 text-sm text-fg-muted">Escolha uma camada para revelar as estruturas desta região.</p>
        <div className="mt-3 flex flex-wrap gap-1.5" role="tablist" aria-label="Camadas">
          {layers.map((l) => (
            <button
              key={l.group}
              role="tab"
              aria-selected={l.group === activeLayer}
              type="button"
              onClick={() => onLayer(l.group)}
              className={`chip ${l.group === activeLayer ? 'border-cyan/60 bg-cyan-soft text-cyan' : 'hover:text-fg'}`}
            >
              {l.label} <span className="text-fg-subtle">{l.structures.length}</span>
            </button>
          ))}
        </div>
      </header>
      <div className="scroll-thin flex-1 overflow-y-auto px-3 py-3">
        {!current && <p className="px-2 text-sm text-fg-subtle">Nenhuma camada selecionada.</p>}
        {current && (
          <ul className="space-y-0.5">
            {current.structures.map((s) => (
              <li key={s.id}>
                <button type="button" className="flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left text-sm hover:bg-white/[0.05]" onClick={() => onSelect(s.id)}>
                  <span>{s.namePtBR}</span>
                  <Icon name="chevronRight" size={14} className="text-fg-subtle" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
