'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';
import { COMPARE_ROWS, formatBig, formatSize, growth, GROUPS, SIZE_ITEMS, SIZE_LIMITS, timesLarger } from './data';

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

const Big = ({ n }: { n: number }) => {
  const f = formatBig(n);
  return (
    <>
      {f.mantissa}
      {f.exponent !== null && (
        <>
          {' '}× 10<sup>{f.exponent}</sup>
        </>
      )}
    </>
  );
};

// ===================================================================== size scale

const LOG_MIN = -3; // 1 nm
const LOG_MAX = 3; // 1 mm
const pct = (um: number) => ((Math.log10(um) - LOG_MIN) / (LOG_MAX - LOG_MIN)) * 100;

/** Classroom tool: sizes of microorganisms on a logarithmic ruler, and how many times one is larger than another. */
export function ScaleTool({ onClose, large }: { onClose: () => void; large?: boolean }) {
  const items = useMemo(() => [...SIZE_ITEMS].sort((a, b) => a.um - b.um), []);
  const [a, setA] = useState('ameba');
  const [b, setB] = useState('bacteria');
  const ia = SIZE_ITEMS.find((i) => i.id === a)!;
  const ib = SIZE_ITEMS.find((i) => i.id === b)!;
  const big = ia.um >= ib.um ? ia : ib;
  const small = big === ia ? ib : ia;
  const text = large ? 'text-[15.5px]' : 'text-[13px]';
  return (
    <Panel id="scale-title" eyebrow="Do nanômetro ao milímetro" title="Escala de tamanhos" onClose={onClose} closeLabel="Fechar escala de tamanhos" testId="scale-tool" large={large}>
      <p className={`text-fg-muted ${text}`}>
        Cada marca da régua é <strong className="text-fg">10 vezes</strong> maior que a anterior (escala logarítmica). 1 mm = 1000 µm; 1 µm = 1000 nm.
      </p>
      <div className="relative mt-4 mb-2 h-6 border-b border-line text-[10.5px] text-fg-subtle" aria-hidden="true">
        {['1 nm', '10 nm', '100 nm', '1 µm', '10 µm', '100 µm', '1 mm'].map((l, i) => (
          <span key={l} className="absolute -translate-x-1/2" style={{ left: `${(i / 6) * 100}%` }}>
            {l}
          </span>
        ))}
      </div>
      <ul className="space-y-1.5" data-testid="scale-list">
        {items.map((it) => (
          <li key={it.id}>
            <button type="button" className={`group w-full text-left ${text}`} onClick={() => {
                if (a === it.id) return;
                setB(a);
                setA(it.id);
              }} title={it.note}>
              <div className="flex items-baseline justify-between gap-2">
                <span className={`font-medium ${it.id === a || it.id === b ? 'text-fg' : 'text-fg-muted group-hover:text-fg'}`}>{it.label}</span>
                <span className="font-mono text-[12px] text-fg-subtle">{formatSize(it.um)}</span>
              </div>
              <div className="relative mt-0.5 h-2 rounded-full bg-ink-800">
                <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${Math.max(1.5, pct(it.um))}%`, background: it.color, boxShadow: it.id === a || it.id === b ? `0 0 0 2px ${it.color}55` : undefined }} />
                {SIZE_LIMITS.map((lim) => (
                  <span key={lim.label} className="absolute inset-y-[-3px] w-px bg-fg-subtle/60" style={{ left: `${pct(Math.max(lim.um, 0.001))}%` }} />
                ))}
              </div>
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[11.5px] text-fg-subtle">Traços verticais: limite do microscópio óptico (0,2 µm) e do olho humano (cerca de 0,1 mm).</p>
      <div className={`mt-4 rounded-lg border border-line p-3 ${text}`} data-testid="scale-compare">
        <div className="grid grid-cols-2 gap-2">
          {([
            [a, setA, 'Primeiro'],
            [b, setB, 'Segundo'],
          ] as const).map(([v, set, label]) => (
            <label key={label} className="text-[12px] text-fg-muted">
              {label}
              <select className="mt-1 h-9 w-full rounded-lg border border-line bg-ink-800 px-2 text-[13px] text-fg" value={v} onChange={(e) => set(e.target.value)} aria-label={`${label} item para comparar`}>
                {items.map((it) => (
                  <option key={it.id} value={it.id}>
                    {it.label}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
        <p className="mt-3" data-testid="scale-ratio">
          {ia.id === ib.id ? (
            'Escolha dois itens diferentes.'
          ) : (
            <>
              {big.label} ({formatSize(big.um)}) é cerca de <strong className="text-fg">{timesLarger(big.um, small.um).toLocaleString('pt-BR')} vezes</strong> maior que {small.label.toLowerCase()} ({formatSize(small.um)}).
            </>
          )}
        </p>
        <p className="mt-1 text-[12px] text-fg-subtle">{ia.note}</p>
      </div>
    </Panel>
  );
}

// ===================================================================== comparison

/** Classroom tool: compares two groups of microorganisms feature by feature. */
export function CompareTool({ onClose, large }: { onClose: () => void; large?: boolean }) {
  const [sel, setSel] = useState<[string, string]>(['virus', 'bacteria']);
  const text = large ? 'text-[15px]' : 'text-[12.5px]';
  const pick = (id: string) => setSel(([x, y]) => (id === x || id === y ? [x, y] : [y, id]));
  const ga = GROUPS.find((g) => g.id === sel[0])!;
  const gb = GROUPS.find((g) => g.id === sel[1])!;
  return (
    <Panel id="compare-title" eyebrow="Vírus, bactérias, fungos e protistas" title="Comparar microrganismos" onClose={onClose} closeLabel="Fechar comparação" testId="compare-tool" large={large}>
      <p className="text-[12.5px] text-fg-muted">Toque em dois grupos para comparar.</p>
      <div className="mt-2 flex flex-wrap gap-1" role="group" aria-label="Grupos comparados">
        {GROUPS.map((g) => {
          const on = sel.includes(g.id);
          return (
            <button key={g.id} type="button" aria-pressed={on} onClick={() => pick(g.id)} className={`rounded-full px-2.5 py-1 text-[12.5px] font-semibold ${on ? 'text-ink-900' : 'bg-ink-800 text-fg-muted hover:text-fg'}`} style={on ? { background: g.color } : undefined}>
              {g.label}
            </button>
          );
        })}
      </div>
      <table className={`mt-3 w-full border-separate border-spacing-y-1 ${text}`} data-testid="compare-table">
        <thead>
          <tr>
            <th className="w-[30%]" />
            {[ga, gb].map((g) => (
              <th key={g.id} className="rounded-md px-2 py-1.5 text-left font-semibold" style={{ background: `${g.color}2e`, boxShadow: `inset 0 -2px 0 ${g.color}` }}>
                {g.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {COMPARE_ROWS.map((r) => (
            <tr key={r.id}>
              <th className="pr-2 text-left align-top font-semibold text-fg-muted">{r.label}</th>
              <td className="rounded-md bg-ink-800/60 px-2 py-1.5 align-top">{ga.facts[r.id]}</td>
              <td className="rounded-md bg-ink-800/60 px-2 py-1.5 align-top">{gb.facts[r.id]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}

// ===================================================================== growth

/** Classroom tool: exponential growth of bacteria (N = N0 · 2^n) with a chart. */
export function GrowthTool({ onClose, large }: { onClose: () => void; large?: boolean }) {
  const [n0, setN0] = useState(1);
  const [g, setG] = useState(20);
  const [hours, setHours] = useState(8);
  const [log, setLog] = useState(false);
  const res = growth(n0, g, hours * 60);
  const text = large ? 'text-[15.5px]' : 'text-[13px]';
  const W = 320;
  const H = 170;
  const pts = useMemo(() => {
    const out: [number, number][] = [];
    const total = hours * 60;
    const maxN = growth(n0, g, total).n;
    for (let i = 0; i <= 80; i++) {
      const t = (i / 80) * total;
      const n = growth(n0, g, t).n;
      const y = log ? (Math.log10(n) - Math.log10(n0)) / Math.max(1e-9, Math.log10(maxN) - Math.log10(n0)) : n / maxN;
      out.push([(i / 80) * W, H - y * (H - 8)]);
    }
    return out;
  }, [n0, g, hours, log]);
  const num = (v: string, lo: number, hi: number) => Math.min(hi, Math.max(lo, Math.round(Number(v) || lo)));
  return (
    <Panel id="growth-title" eyebrow="Fissão binária" title="Crescimento bacteriano" onClose={onClose} closeLabel="Fechar crescimento bacteriano" testId="growth-tool" large={large}>
      <p className={`text-fg-muted ${text}`}>
        A cada geração, cada bactéria vira duas. Depois de <em>n</em> gerações: <strong className="text-fg">N = N₀ × 2ⁿ</strong>.
      </p>
      <div className={`mt-3 grid grid-cols-3 gap-2 ${text}`}>
        <label className="text-[12px] text-fg-muted">
          Bactérias no início
          <input type="number" min={1} max={1000} value={n0} onChange={(e) => setN0(num(e.target.value, 1, 1000))} className="mt-1 h-9 w-full rounded-lg border border-line bg-ink-800 px-2 text-fg" data-testid="growth-n0" />
        </label>
        <label className="text-[12px] text-fg-muted">
          Geração (min)
          <input type="number" min={10} max={600} value={g} onChange={(e) => setG(num(e.target.value, 10, 600))} className="mt-1 h-9 w-full rounded-lg border border-line bg-ink-800 px-2 text-fg" data-testid="growth-g" />
        </label>
        <label className="text-[12px] text-fg-muted">
          Tempo (horas)
          <input type="number" min={1} max={24} value={hours} onChange={(e) => setHours(num(e.target.value, 1, 24))} className="mt-1 h-9 w-full rounded-lg border border-line bg-ink-800 px-2 text-fg" data-testid="growth-hours" />
        </label>
      </div>
      <div className={`mt-3 rounded-lg border border-line p-3 ${text}`} data-testid="growth-result">
        <p>
          {res.generations.toLocaleString('pt-BR')} gerações em {hours} h →{' '}
          <strong className="text-fg">
            <Big n={res.n} /> bactérias
          </strong>
        </p>
        <svg viewBox={`-4 -4 ${W + 8} ${H + 8}`} className="mt-2 w-full" role="img" aria-label={`Curva de crescimento ${log ? 'em escala logarítmica' : 'exponencial'}`}>
          <line x1={0} y1={H} x2={W} y2={H} stroke="currentColor" opacity={0.25} />
          <line x1={0} y1={0} x2={0} y2={H} stroke="currentColor" opacity={0.25} />
          <polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke="#5E9C3A" strokeWidth={2.5} />
          <text x={W} y={H - 4} textAnchor="end" fontSize={10} fill="currentColor" opacity={0.6}>
            tempo →
          </text>
          <text x={4} y={10} fontSize={10} fill="currentColor" opacity={0.6}>
            {log ? 'log do número' : 'número de bactérias'}
          </text>
        </svg>
        <label className="mt-1 flex items-center gap-2 text-[12.5px] text-fg-muted">
          <input type="checkbox" checked={log} onChange={(e) => setLog(e.target.checked)} /> Escala logarítmica (a curva vira uma reta)
        </label>
      </div>
      <p className="mt-3 text-[12px] text-fg-subtle">
        Na prática o crescimento não continua para sempre: numa cultura há fase lag (adaptação), fase log (exponencial), fase estacionária (falta alimento, acumulam-se resíduos) e fase de declínio. E. coli em condições ideais se divide a cada 20 minutos; Mycobacterium tuberculosis, a cada 15–20 horas.
      </p>
    </Panel>
  );
}
