'use client';

import { useMemo, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { AMINO_ACIDS, CODON_TABLE } from '../kit';

const ORDER = ['U', 'C', 'A', 'G'] as const;

export type StrandInput = 'codificadora' | 'molde' | 'mrna';

/** DNA or mRNA typed by the class → mRNA, codons and amino acids. */
export function readSequence(raw: string, kind: StrandInput, fromStart: boolean) {
  const clean = raw.toUpperCase().replace(/[^ACGTU]/g, '');
  let mrna = '';
  if (kind === 'mrna') mrna = clean.replace(/T/g, 'U');
  else if (kind === 'codificadora') mrna = clean.replace(/U/g, 'T').replace(/T/g, 'U');
  else {
    // template strand typed 3'→5' (as it pairs with the mRNA, base by base)
    const comp: Record<string, string> = { A: 'U', T: 'A', U: 'A', G: 'C', C: 'G' };
    mrna = clean
      .split('')
      .map((b) => comp[b])
      .join('');
  }
  let start = 0;
  if (fromStart) {
    const i = mrna.indexOf('AUG');
    start = i < 0 ? mrna.length : i;
  }
  const codons: { codon: string; aa: string }[] = [];
  for (let i = start; i + 3 <= mrna.length; i += 3) {
    const codon = mrna.slice(i, i + 3);
    const aa = CODON_TABLE[codon];
    codons.push({ codon, aa });
    if (aa === '*') break;
  }
  return { mrna, start, codons, noStart: fromStart && start >= mrna.length };
}

/** Classroom tool: the genetic code table and a sequence translator (DNA → mRNA → protein). */
export function CodeTool({ onClose, large }: { onClose: () => void; large?: boolean }) {
  const [seqText, setSeqText] = useState('TACCAAGCCTTTACCATT');
  const [kind, setKind] = useState<StrandInput>('molde');
  const [fromStart, setFromStart] = useState(true);
  const [hl, setHl] = useState<string | null>(null);
  const read = useMemo(() => readSequence(seqText, kind, fromStart), [seqText, kind, fromStart]);
  const used = new Set(read.codons.map((c) => c.codon));
  const text = large ? 'text-[16px]' : 'text-[13.5px]';

  return (
    <section className="flex h-full flex-col" aria-labelledby="code-title" data-testid="code-tool">
      <header className="border-b border-line px-5 pt-5 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow mb-1.5">Do gene à proteína</p>
            <h2 id="code-title" className={`font-[family-name:var(--font-display)] font-bold ${large ? 'text-2xl' : 'text-xl'}`}>
              Código genético
            </h2>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Fechar código genético">
            <Icon name="close" size={16} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <label className="text-xs font-semibold text-fg-muted" htmlFor="code-seq">
          Sequência
        </label>
        <textarea
          id="code-seq"
          className="mt-1 h-16 w-full resize-none rounded-lg border border-line bg-ink-800 px-2.5 py-2 font-mono text-[14px] tracking-wider uppercase"
          value={seqText}
          onChange={(e) => setSeqText(e.target.value)}
          spellCheck={false}
          data-testid="code-input"
        />
        <div className="mt-2 flex flex-wrap gap-1" role="radiogroup" aria-label="O que foi digitado">
          {(
            [
              ['molde', 'Fita-molde do DNA (3′→5′)'],
              ['codificadora', 'Fita codificadora (5′→3′)'],
              ['mrna', 'mRNA (5′→3′)'],
            ] as const
          ).map(([k, label]) => (
            <button key={k} type="button" role="radio" aria-checked={kind === k} onClick={() => setKind(k)} className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${kind === k ? 'bg-fg text-ink-900' : 'bg-ink-800 text-fg-muted hover:text-fg'}`}>
              {label}
            </button>
          ))}
        </div>
        <label className="mt-2 flex items-center gap-2 text-[13px] text-fg-muted">
          <input type="checkbox" checked={fromStart} onChange={(e) => setFromStart(e.target.checked)} /> Começar a ler no primeiro AUG (códon de início)
        </label>

        <div className={`mt-3 rounded-lg border border-line p-3 ${text}`} data-testid="code-result">
          <p className="text-[11px] font-semibold tracking-wide text-fg-subtle uppercase">mRNA</p>
          <p className="font-mono break-all">
            {read.mrna.slice(0, read.start)}
            {read.codons.map((c, i) => (
              <span key={i} className={i % 2 ? 'text-fg' : 'text-cyan'}>
                {c.codon}
              </span>
            ))}
            {read.mrna.slice(read.start + read.codons.length * 3)}
          </p>
          <p className="mt-2 text-[11px] font-semibold tracking-wide text-fg-subtle uppercase">Proteína</p>
          {read.noStart ? (
            <p className="text-fg-muted">Sem códon AUG: a tradução não começa.</p>
          ) : (
            <div className="mt-1 flex flex-wrap gap-1" data-testid="code-protein">
              {read.codons.map((c, i) => {
                const info = AMINO_ACIDS[c.aa];
                return (
                  <button
                    key={i}
                    type="button"
                    onMouseEnter={() => setHl(c.codon)}
                    onMouseLeave={() => setHl(null)}
                    onFocus={() => setHl(c.codon)}
                    onBlur={() => setHl(null)}
                    className="rounded-full px-2 py-0.5 text-[12.5px] font-semibold"
                    style={{ background: `${info?.color ?? '#94A3B8'}2e`, boxShadow: `inset 0 0 0 1.5px ${info?.color ?? '#94A3B8'}` }}
                    title={`${c.codon} → ${info?.name ?? '?'}`}
                  >
                    {info?.abbr ?? '?'}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <p className="eyebrow mt-5 mb-2">Tabela do código genético (códons do mRNA)</p>
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0.5 text-center text-[11.5px]" data-testid="code-table">
            <thead>
              <tr>
                <th className="text-[10px] text-fg-subtle">1ª \ 2ª</th>
                {ORDER.map((b) => (
                  <th key={b} className="rounded bg-ink-800 py-1 font-bold">
                    {b}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ORDER.map((a) => (
                <tr key={a}>
                  <th className="rounded bg-ink-800 px-1.5 font-bold">{a}</th>
                  {ORDER.map((b) => (
                    <td key={b} className="rounded border border-line p-0.5 align-top">
                      {ORDER.map((c) => {
                        const codon = a + b + c;
                        const aa = CODON_TABLE[codon];
                        const info = AMINO_ACIDS[aa];
                        const on = hl === codon || used.has(codon);
                        return (
                          <div key={c} className={`flex justify-between gap-1 rounded px-1 font-mono ${on ? 'bg-cyan/25 font-bold' : ''} ${hl === codon ? 'ring-1 ring-cyan' : ''}`}>
                            <span>{codon}</span>
                            <span className={aa === '*' ? 'text-danger font-bold' : aa === 'M' ? 'font-bold text-ok' : 'text-fg-muted'}>{info.abbr}</span>
                          </div>
                        );
                      })}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[12px] text-fg-subtle">AUG (Met) é o códon de início; UAA, UAG e UGA são códons de parada (Stop). Destacados: os códons da sequência acima.</p>
      </div>
    </section>
  );
}
