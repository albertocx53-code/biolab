'use client';

import { useMemo, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { DIHYBRID, GENE_PRESETS, cross, ratio, type GenePreset } from '../heredity';

const PALETTE = ['#EAB308', '#84CC16', '#22C55E', '#65A30D'];

const fmt = (g: string[]) => g.join('');
const pct = (n: number, total: number) => `${Math.round((n / total) * 1000) / 10}%`.replace('.', ',');

/** Classroom tool: Punnett square for monohybrid, dihybrid, incomplete dominance, ABO and X-linked crosses. */
export function PunnettTool({ onClose, large }: { onClose: () => void; large?: boolean }) {
  const [presetId, setPresetId] = useState<string>('ervilha-cor');
  const dihybrid = presetId === 'diibridismo';
  const preset = GENE_PRESETS.find((p) => p.id === presetId) ?? GENE_PRESETS[0];
  const presets: GenePreset[] = dihybrid ? [...DIHYBRID.genes] : [preset];
  const [mom, setMom] = useState<number[]>([1, 1]);
  const [dad, setDad] = useState<number[]>([1, 1]);

  const pick = (id: string) => {
    setPresetId(id);
    // start from the classic heterozygous cross
    if (id === 'abo') {
      setMom([1, 1]);
      setDad([3, 3]);
    } else if (id === 'daltonismo') {
      setMom([1, 1]);
      setDad([0, 0]);
    } else {
      setMom([1, 1]);
      setDad([1, 1]);
    }
  };

  const result = useMemo(
    () => cross(presets, presets.map((p, k) => p.mother[mom[k]] ?? p.mother[0]), presets.map((p, k) => p.father[dad[k]] ?? p.father[0])),
    [presetId, mom, dad], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const phenColor = (label: string, color: string) => (dihybrid ? PALETTE[result.phenotypes.findIndex((p) => p.label === label) % PALETTE.length] : color);
  const text = large ? 'text-[16px]' : 'text-[13.5px]';
  const parentLabels = dihybrid ? (['Planta 1', 'Planta 2'] as const) : preset.parents;

  const select = (who: 'mae' | 'pai', k: number, p: GenePreset) => {
    const list = who === 'mae' ? p.mother : p.father;
    const value = who === 'mae' ? mom[k] : dad[k];
    const set = who === 'mae' ? setMom : setDad;
    return (
      <select
        key={`${who}-${k}`}
        className="h-9 rounded-lg border border-line bg-ink-800 px-2 text-[13px] font-semibold"
        value={value}
        onChange={(e) => set((v) => v.map((x, i) => (i === k ? Number(e.target.value) : x)))}
        aria-label={`Genótipo — ${who === 'mae' ? parentLabels[0] : parentLabels[1]}${dihybrid ? ` (${p.label})` : ''}`}
        data-testid={`punnett-${who}-${k}`}
      >
        {list.map((g, i) => (
          <option key={fmt(g)} value={i}>
            {fmt(g)}
          </option>
        ))}
      </select>
    );
  };

  return (
    <section className="flex h-full flex-col" aria-labelledby="punnett-title" data-testid="punnett-tool">
      <header className="border-b border-line px-5 pt-5 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow mb-1.5">Herança mendeliana</p>
            <h2 id="punnett-title" className={`font-[family-name:var(--font-display)] font-bold ${large ? 'text-2xl' : 'text-xl'}`}>
              Quadro de Punnett
            </h2>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Fechar quadro de Punnett">
            <Icon name="close" size={16} />
          </button>
        </div>
        <label className="mt-3 block text-xs text-fg-muted" htmlFor="punnett-preset">
          Característica
        </label>
        <select id="punnett-preset" className="mt-1 h-10 w-full rounded-lg border border-line bg-ink-800 px-2 text-[14px]" value={presetId} onChange={(e) => pick(e.target.value)} data-testid="punnett-preset">
          {GENE_PRESETS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
          <option value="diibridismo">Ervilha: cor e textura (diibridismo)</option>
        </select>
        <p className={`mt-2 text-fg-muted ${text}`}>
          <strong className="text-fg">{dihybrid ? 'Segregação independente (2ª lei de Mendel)' : preset.pattern}.</strong> {dihybrid ? DIHYBRID.note : preset.note}
        </p>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="grid grid-cols-2 gap-3">
          {(['mae', 'pai'] as const).map((who, w) => (
            <div key={who}>
              <p className="mb-1 text-xs font-semibold text-fg-muted">{parentLabels[w]}</p>
              <div className="flex gap-1.5">{presets.map((p, k) => select(who, k, p))}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className={`mx-auto border-separate border-spacing-1 text-center ${large ? 'text-[16px]' : 'text-[13px]'}`} data-testid="punnett-grid">
            <thead>
              <tr>
                <th className="text-[11px] font-medium text-fg-subtle">
                  gametas
                  <br />
                  {parentLabels[0].toLowerCase()} ↓ · {parentLabels[1].toLowerCase()} →
                </th>
                {result.cols.map((c) => (
                  <th key={fmt(c)} className="rounded-md bg-ink-800 px-2 py-1.5 font-mono font-bold">
                    {fmt(c)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.rows.map((r, ri) => (
                <tr key={fmt(r)}>
                  <th className="rounded-md bg-ink-800 px-2 py-1.5 font-mono font-bold">{fmt(r)}</th>
                  {result.cells[ri].map((cell, ci) => {
                    const ph = cell.map((g, k) => presets[k].phenotype(g));
                    const label = ph.map((p) => p.label).join(' e ');
                    const color = phenColor(label, ph[0].color);
                    return (
                      <td key={ci} className="min-w-[64px] rounded-md px-2 py-2 font-mono font-bold" style={{ background: `${color}33`, boxShadow: `inset 0 0 0 1.5px ${color}` }} title={label}>
                        {cell.map((g) => g.join('')).join(' ')}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={`mt-4 grid gap-3 ${text}`}>
          <div>
            <p className="eyebrow mb-1">Genótipos · {ratio(result.genotypes.map((g) => g.count))}</p>
            <ul className="space-y-0.5" data-testid="punnett-genotypes">
              {result.genotypes.map((g) => (
                <li key={g.key} className="flex justify-between gap-3">
                  <span className="font-mono font-semibold">{g.key}</span>
                  <span className="text-fg-muted">
                    {g.count}/{result.total} ({pct(g.count, result.total)})
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow mb-1">Fenótipos · {ratio(result.phenotypes.map((g) => g.count))}</p>
            <ul className="space-y-0.5" data-testid="punnett-phenotypes">
              {result.phenotypes.map((p) => (
                <li key={p.label} className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 shrink-0 rounded-full border border-line" style={{ background: phenColor(p.label, p.color) }} />
                    {p.label}
                  </span>
                  <span className="shrink-0 text-fg-muted">
                    {p.count}/{result.total} ({pct(p.count, result.total)})
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-[12px] text-fg-subtle">Cada casa do quadro tem a mesma probabilidade. As proporções são esperadas para muitos descendentes; numa família pequena os números reais podem variar.</p>
        </div>
      </div>
    </section>
  );
}
