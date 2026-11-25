'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';
import { allInnovations, GROUPS, layoutTree, SYSTEMS, TREE, walkKey, type SystemId } from './data';

function Panel({ id, eyebrow, title, onClose, closeLabel, children, testId, large }: { id: string; eyebrow: string; title: string; onClose: () => void; closeLabel: string; children: ReactNode; testId: string; large?: boolean }) {
  return (
    <section className="flex h-full flex-col" aria-labelledby={id} data-testid={testId}>
      <header className="border-b border-line px-5 pt-5 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow mb-1.5">{eyebrow}</p>
            <h2 id={id} className={`font-[family-name:var(--font-display)] font-bold ${large ? 'text-2xl' : 'text-xl'}`}>
              {title}
            </h2>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label={closeLabel}>
            <Icon name="close" size={16} />
          </button>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
    </section>
  );
}

// ===================================================================== dichotomous key

/** Classroom tool: a dichotomous key that leads, by yes/no questions, to the animal group. */
export function KeyTool({ onClose, large }: { onClose: () => void; large?: boolean }) {
  const [answers, setAnswers] = useState<boolean[]>([]);
  const { path, question, result } = walkKey(answers);
  const text = large ? 'text-[15.5px]' : 'text-[13px]';
  return (
    <Panel id="key-title" eyebrow="Pense num animal e responda" title="Chave de identificação" onClose={onClose} closeLabel="Fechar chave de identificação" testId="key-tool" large={large}>
      <p className={`text-fg-muted ${text}`}>Uma chave dicotômica tem sempre duas opções. Cada resposta elimina grupos até sobrar um.</p>
      {path.length > 0 && (
        <ol className={`mt-3 space-y-1 ${text}`} data-testid="key-path">
          {path.map(({ q, a }, i) => (
            <li key={q.id} className="flex gap-2">
              <span className="font-mono text-fg-subtle">{i + 1}.</span>
              <button type="button" className="text-left text-fg-muted hover:text-fg" onClick={() => setAnswers(answers.slice(0, i))} title="Voltar para esta pergunta">
                {q.text} <strong className={a ? 'text-emerald-400' : 'text-rose-400'}>{a ? 'Sim' : 'Não'}</strong>
              </button>
            </li>
          ))}
        </ol>
      )}
      {question && (
        <div className="mt-4 rounded-xl border border-line bg-ink-800/60 p-4" data-testid="key-question">
          <p className={`font-semibold ${large ? 'text-lg' : 'text-[15px]'}`}>{question.text}</p>
          {question.hint && <p className={`mt-1 text-fg-subtle ${text}`}>{question.hint}</p>}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button type="button" className="btn btn-primary justify-center" data-testid="key-yes" onClick={() => setAnswers([...answers, true])}>
              Sim
            </button>
            <button type="button" className="btn btn-ghost justify-center" data-testid="key-no" onClick={() => setAnswers([...answers, false])}>
              Não
            </button>
          </div>
        </div>
      )}
      {result && (
        <div className="mt-4 rounded-xl p-4" style={{ background: `${result.color}26`, boxShadow: `inset 0 0 0 1px ${result.color}` }} data-testid="key-result">
          <p className="eyebrow">Resultado</p>
          <p className={`mt-1 font-[family-name:var(--font-display)] font-bold ${large ? 'text-2xl' : 'text-xl'}`}>{result.label}</p>
          <p className={`mt-1 text-fg-muted ${text}`}>Exemplos: {result.examples}.</p>
          {result.model && <p className={`mt-1 text-fg-muted ${text}`}>Veja o modelo 3D “{result.model}” na lista de modelos.</p>}
        </div>
      )}
      {answers.length > 0 && (
        <button type="button" className="btn btn-ghost mt-4" data-testid="key-restart" onClick={() => setAnswers([])}>
          <Icon name="reset" size={14} /> Começar de novo
        </button>
      )}
    </Panel>
  );
}

// ===================================================================== comparison

/** Classroom tool: compare two animal groups, or one body system across all groups. */
export function CompareTool({ onClose, large }: { onClose: () => void; large?: boolean }) {
  const [mode, setMode] = useState<'grupos' | 'sistema'>('grupos');
  const [sel, setSel] = useState<[string, string]>(['anelideos', 'artropodes']);
  const [system, setSystem] = useState<SystemId>('respiratorio');
  const text = large ? 'text-[15px]' : 'text-[12.5px]';
  const pick = (id: string) => setSel(([x, y]) => (id === x || id === y ? [x, y] : [y, id]));
  const ga = GROUPS.find((g) => g.id === sel[0])!;
  const gb = GROUPS.find((g) => g.id === sel[1])!;
  const chip = (on: boolean, color?: string) => `rounded-full px-2.5 py-1 text-[12.5px] font-semibold ${on ? 'text-ink-900' : 'bg-ink-800 text-fg-muted hover:text-fg'} ${on && !color ? 'bg-cyan' : ''}`;
  return (
    <Panel id="compare-title" eyebrow="Sistemas comparados" title="Comparar grupos animais" onClose={onClose} closeLabel="Fechar comparação" testId="compare-tool" large={large}>
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-ink-800 p-1" role="tablist" aria-label="Modo de comparação">
        <button type="button" role="tab" aria-selected={mode === 'grupos'} data-testid="compare-mode-grupos" className={`rounded-md py-1.5 text-[13px] font-semibold ${mode === 'grupos' ? 'bg-ink-700 text-fg' : 'text-fg-muted'}`} onClick={() => setMode('grupos')}>
          Dois grupos
        </button>
        <button type="button" role="tab" aria-selected={mode === 'sistema'} data-testid="compare-mode-sistema" className={`rounded-md py-1.5 text-[13px] font-semibold ${mode === 'sistema' ? 'bg-ink-700 text-fg' : 'text-fg-muted'}`} onClick={() => setMode('sistema')}>
          Um sistema em todos
        </button>
      </div>
      {mode === 'grupos' ? (
        <>
          <p className="mt-3 text-[12.5px] text-fg-muted">Toque em dois grupos para comparar.</p>
          <div className="mt-2 flex flex-wrap gap-1" role="group" aria-label="Grupos comparados">
            {GROUPS.map((g) => {
              const on = sel.includes(g.id);
              return (
                <button key={g.id} type="button" aria-pressed={on} onClick={() => pick(g.id)} className={chip(on, g.color)} style={on ? { background: g.color } : undefined}>
                  {g.label}
                </button>
              );
            })}
          </div>
          <table className={`mt-3 w-full border-separate border-spacing-y-1 ${text}`} data-testid="compare-table">
            <thead>
              <tr>
                <th className="w-[28%]" />
                {[ga, gb].map((g) => (
                  <th key={g.id} className="rounded-md px-2 py-1.5 text-left font-semibold" style={{ background: `${g.color}2e`, boxShadow: `inset 0 -2px 0 ${g.color}` }}>
                    {g.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SYSTEMS.map((r) => (
                <tr key={r.id}>
                  <th className="pr-2 text-left align-top font-semibold text-fg-muted">{r.label}</th>
                  <td className="rounded-md bg-ink-800/60 px-2 py-1.5 align-top">{ga.facts[r.id]}</td>
                  <td className="rounded-md bg-ink-800/60 px-2 py-1.5 align-top">{gb.facts[r.id]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <>
          <div className="mt-3 flex flex-wrap gap-1" role="group" aria-label="Sistema">
            {SYSTEMS.map((s) => (
              <button key={s.id} type="button" aria-pressed={system === s.id} data-testid={`compare-system-${s.id}`} onClick={() => setSystem(s.id)} className={chip(system === s.id)}>
                {s.label}
              </button>
            ))}
          </div>
          <table className={`mt-3 w-full border-separate border-spacing-y-1 ${text}`} data-testid="compare-system-table">
            <tbody>
              {GROUPS.map((g) => (
                <tr key={g.id}>
                  <th className="w-[32%] rounded-l-md px-2 py-1.5 text-left align-top font-semibold" style={{ boxShadow: `inset 3px 0 0 ${g.color}` }}>
                    {g.label}
                  </th>
                  <td className="rounded-r-md bg-ink-800/60 px-2 py-1.5 align-top">{g.facts[system]}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-[12px] text-fg-subtle">Os grupos estão na ordem em que aparecem na árvore evolutiva, do mais simples aos vertebrados.</p>
        </>
      )}
    </Panel>
  );
}

// ===================================================================== phylogenetic tree

const DX = 22;
const DY = 27;
const LEAF_X = 200;

/** Classroom tool: a simplified phylogenetic tree with the key innovations on its branches. */
export function TreeTool({ onClose, large }: { onClose: () => void; large?: boolean }) {
  const { nodes, rows } = useMemo(() => layoutTree(TREE, DX, DY, LEAF_X), []);
  const innovations = useMemo(() => allInnovations(), []);
  const [sel, setSel] = useState('bilateral');
  const current = innovations.find((i) => i.id === sel) ?? innovations[0];
  const text = large ? 'text-[15px]' : 'text-[13px]';
  const H = rows * DY;
  return (
    <Panel id="tree-title" eyebrow="Parentesco entre os grupos" title="Árvore evolutiva" onClose={onClose} closeLabel="Fechar árvore evolutiva" testId="tree-tool" large={large}>
      <p className={`text-fg-muted ${text}`}>Cada ponto num ramo marca uma novidade que surgiu ali e foi herdada por todos os grupos à direita. Toque num ponto.</p>
      <svg viewBox={`-8 -14 ${LEAF_X + 120} ${H + 14}`} className="mt-3 w-full" role="img" aria-label="Árvore evolutiva dos animais" data-testid="tree-svg">
        {nodes.map(({ node, x, y, parent }) =>
          parent ? <path key={`e-${node.id}`} d={`M${parent.x},${parent.y} V${y} H${x}`} fill="none" stroke="currentColor" className="text-line" strokeWidth={1.6} /> : <path key="root" d={`M${x - 8},${y} H${x}`} stroke="currentColor" className="text-line" strokeWidth={1.6} />,
        )}
        {nodes
          .filter((n) => !n.node.children)
          .map(({ node, x, y }) => (
            <g key={`l-${node.id}`}>
              <circle cx={x} cy={y} r={4} fill={node.color} />
              <text x={x + 9} y={y + 4} className="fill-current text-fg" fontSize={12.5} fontWeight={600}>
                {node.label}
              </text>
            </g>
          ))}
        {nodes
          .filter((n) => n.node.innovation)
          .map(({ node, x, y, parent }) => {
            const i = node.innovation!;
            const cx = parent ? (parent.x + Math.min(x, parent.x + DX * 1.4)) / 2 + 4 : x - 4;
            const on = i.id === current.id;
            return (
              <g key={`i-${i.id}`} role="button" tabIndex={0} aria-label={i.label} aria-pressed={on} data-testid={`tree-innovation-${i.id}`} onClick={() => setSel(i.id)} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSel(i.id)} className="cursor-pointer">
                <circle cx={cx} cy={y} r={on ? 7 : 5.5} fill={on ? '#22D3EE' : '#0F172A'} stroke="#22D3EE" strokeWidth={2} />
              </g>
            );
          })}
      </svg>
      <div className="mt-3 rounded-xl border border-line bg-ink-800/60 p-4" data-testid="tree-detail" aria-live="polite">
        <p className={`font-semibold ${large ? 'text-lg' : 'text-[15px]'}`}>{current.label}</p>
        <p className={`mt-1 text-fg-muted ${text}`}>{current.text}</p>
      </div>
      <div className="mt-3 flex flex-wrap gap-1">
        {innovations.map((i) => (
          <button key={i.id} type="button" aria-pressed={i.id === current.id} onClick={() => setSel(i.id)} className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${i.id === current.id ? 'bg-cyan text-ink-900' : 'bg-ink-800 text-fg-muted hover:text-fg'}`}>
            {i.label}
          </button>
        ))}
      </div>
      <p className="mt-3 text-[12px] text-fg-subtle">Árvore simplificada (OpenStax Biology 2e, cap. 27). As aves são, na verdade, um ramo dos répteis.</p>
    </Panel>
  );
}
