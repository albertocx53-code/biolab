'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Structure } from '@/data/biology/schema';
import { studioUrl } from '@/data/studio/contract';
import { useViewer } from '@/engine/store';
import { Icon } from '@/components/ui/Icon';

interface Props {
  structure: Structure;
  getStructure: (id: string) => Structure | undefined;
  systemNote: string | null;
  canUseStudio: boolean;
  onSelect: (id: string) => void;
  onClose: () => void;
  representation: string;
  educational: string | null;
  /** Short facts shown as a key/value list (e.g. real size of an out-of-scale model). */
  facts?: { label: string; value: string }[];
  /** Extra lab-specific actions shown under the description. */
  extra?: ReactNode;
}

export function ScientificPanel({ structure: s, getStructure, systemNote, canUseStudio, onSelect, onClose, representation, educational, facts, extra }: Props) {
  const command = useViewer((st) => st.command);
  const isolate = useViewer((st) => st.isolate);
  const isolated = useViewer((st) => st.isolatedMeshIds);
  const isolationMode = useViewer((st) => st.isolationMode);
  const hide = useViewer((st) => st.hideMeshes);
  const presentation = useViewer((st) => st.presentation);
  const parent = s.parentStructureId ? getStructure(s.parentStructureId) : undefined;
  const coversSelection = !!isolated && isolated.length === s.modelMeshIds.length && s.modelMeshIds.every((m) => isolated.includes(m));
  const isIsolated = coversSelection && isolationMode === 'ghost';
  const isSolo = coversSelection && isolationMode === 'solo';

  return (
    <article className="flex h-full flex-col" aria-labelledby="sci-title" data-testid="scientific-panel">
      <header className="border-b border-line px-5 pt-5 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow mb-1.5">{s.biologicalSystem}</p>
            <h2 id="sci-title" className={`font-[family-name:var(--font-display)] leading-tight font-bold ${presentation ? 'text-3xl' : 'text-2xl'}`}>
              {s.namePtBR}
            </h2>
            {s.scientificName && <p className="mt-1 text-sm text-fg-muted italic">{s.scientificName}</p>}
          </div>
          <button type="button" className="icon-btn shrink-0" onClick={onClose} aria-label="Fechar painel">
            <Icon name="close" size={16} />
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="chip">{s.category}</span>
          <span className="chip" title="Tipo de representação">{representation}</span>
          {s.modelMeshIds.length > 1 && <span className="chip">{s.modelMeshIds.length} partes</span>}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className="btn btn-ghost h-9 px-3 text-[13px]" onClick={() => command({ type: 'focus', meshIds: s.modelMeshIds })}>
            <Icon name="focus" size={15} /> Focar
          </button>
          <button
            type="button"
            className="btn btn-ghost h-9 px-3 text-[13px]"
            aria-pressed={isIsolated}
            onClick={() => {
              isolate(isIsolated ? null : s.modelMeshIds);
              if (!isIsolated) command({ type: 'focus', meshIds: s.modelMeshIds });
            }}
          >
            <Icon name="isolate" size={15} /> {isIsolated ? 'Sair do isolamento' : 'Isolar'}
          </button>
          <button
            type="button"
            className="btn btn-ghost h-9 px-3 text-[13px]"
            aria-pressed={isSolo}
            title="Mostra só esta estrutura, sem nada em volta"
            data-testid="solo-structure"
            onClick={() => {
              isolate(isSolo ? null : s.modelMeshIds, 'solo');
              if (!isSolo) command({ type: 'focus', meshIds: s.modelMeshIds });
            }}
          >
            <Icon name="eye" size={15} /> {isSolo ? 'Mostrar o resto' : 'Ver só esta'}
          </button>
          <button
            type="button"
            className="btn btn-ghost h-9 px-3 text-[13px]"
            onClick={() => {
              hide(s.modelMeshIds);
              onClose();
            }}
          >
            <Icon name="eyeOff" size={15} /> Ocultar
          </button>
        </div>
      </header>

      <div className={`scroll-thin flex-1 space-y-5 overflow-y-auto px-5 py-5 ${presentation ? 'text-[17px]' : 'text-[14px]'} leading-relaxed`}>
        {parent && (
          <p className="text-sm text-fg-muted">
            Faz parte de:{' '}
            <button type="button" className="font-semibold text-cyan hover:underline" onClick={() => onSelect(parent.id)}>
              {parent.namePtBR}
            </button>
          </p>
        )}
        {s.description ? (
          <>
            <section>
              <h3 className="eyebrow mb-1.5">Descrição</h3>
              <p className="text-fg/90">{s.description}</p>
            </section>
            {s.function && (
              <section>
                <h3 className="eyebrow mb-1.5">Função principal</h3>
                <p className="text-fg/90">{s.function}</p>
              </section>
            )}
          </>
        ) : (
          <section className="rounded-lg border border-dashed border-line-strong p-3.5">
            <p className="text-fg/90">{systemNote}</p>
            <p className="mt-2 flex items-start gap-1.5 text-xs text-fg-subtle">
              <Icon name="info" size={14} className="mt-0.5 shrink-0" />
              Descrição detalhada desta estrutura em elaboração. O nome em português e em latim segue a Terminologia Anatômica.
            </p>
          </section>
        )}
        {facts && facts.length > 0 && (
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 rounded-lg border border-line p-3 text-sm" data-testid="structure-facts">
            {facts.map((f) => (
              <div key={f.label} className="contents">
                <dt className="text-fg-subtle">{f.label}</dt>
                <dd className="text-fg">{f.value}</dd>
              </div>
            ))}
          </dl>
        )}
        {extra}
        {educational && (
          <section className="rounded-lg border border-cyan/20 bg-cyan-soft p-3.5">
            <h3 className="eyebrow mb-1.5 text-cyan">Para a aula</h3>
            <p className="text-fg/90">{educational}</p>
          </section>
        )}
        {s.relatedStructures.length > 0 && (
          <section>
            <h3 className="eyebrow mb-2">Estruturas relacionadas</h3>
            <div className="flex flex-wrap gap-1.5">
              {s.relatedStructures.map((id) => {
                const r = getStructure(id);
                return r ? (
                  <button key={id} type="button" className="chip hover:border-cyan/50 hover:text-fg" onClick={() => onSelect(id)}>
                    {r.namePtBR}
                  </button>
                ) : null;
              })}
            </div>
          </section>
        )}
        <section>
          <h3 className="eyebrow mb-2">Temas para a aula</h3>
          <div className="flex flex-wrap gap-1.5">
            {s.educationalTopics.map((t) => (
              <span key={t} className="chip">
                {t}
              </span>
            ))}
          </div>
        </section>
        {s.scientificReferences.length > 0 && (
          <section>
            <h3 className="eyebrow mb-1.5">Referências</h3>
            <ul className="space-y-1 text-xs text-fg-muted">
              {s.scientificReferences.map((r) => (
                <li key={r.url}>
                  <a href={r.url} target="_blank" rel="noreferrer" className="hover:text-cyan hover:underline">
                    {r.title}
                  </a>
                  {r.license ? ` (${r.license})` : ''}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <footer className="border-t border-line p-4">
        {canUseStudio ? (
          <Link href={studioUrl({ laboratoryId: s.laboratoryId, structureId: s.id })} className="btn btn-primary w-full" data-testid="studio-link">
            <Icon name="sparkles" size={16} /> Criar materiais sobre este tema
          </Link>
        ) : (
          <div className="text-center">
            <button type="button" className="btn btn-ghost w-full" disabled title="Disponível no Plano Completo">
              <Icon name="lock" size={16} /> Criar materiais sobre este tema
            </button>
            <p className="mt-2 text-xs text-fg-subtle">Disponível no Plano Completo, com o BioLab 3D Studio.</p>
          </div>
        )}
      </footer>
    </article>
  );
}

