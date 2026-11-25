'use client';

import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';
import type { Structure } from '@/data/biology/schema';
import { Icon } from '@/components/ui/Icon';

export interface SearchBoxHandle {
  focus(): void;
}

export const SearchBox = forwardRef<SearchBoxHandle, { search: (q: string) => Structure[]; onPick: (s: Structure) => void; compact?: boolean; placeholder?: string; label?: string }>(
  function SearchBox({ search, onPick, compact, placeholder = 'Buscar estrutura (ex.: úmero, coração)', label = 'Buscar estrutura anatômica' }, ref) {
    const [q, setQ] = useState('');
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(0);
    const input = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => ({ focus: () => input.current?.focus() }));
    const results = useMemo(() => (q.trim().length >= 2 ? search(q) : []), [q, search]);

    const pick = (s: Structure) => {
      onPick(s);
      setQ('');
      setOpen(false);
      input.current?.blur();
    };

    return (
      <div className={`relative ${compact ? 'w-72 max-w-[42vw]' : 'w-full max-w-md'}`}>
        <div className="glass flex h-11 items-center gap-2 rounded-full px-4 transition-colors focus-within:border-cyan/60">
          <Icon name="search" size={16} className="text-fg-subtle" />
          <input
            ref={input}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(true);
              setActive(0);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActive((a) => Math.min(a + 1, results.length - 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActive((a) => Math.max(a - 1, 0));
              } else if (e.key === 'Enter' && results[active]) {
                pick(results[active]);
              } else if (e.key === 'Escape') {
                setOpen(false);
                input.current?.blur();
              }
              e.stopPropagation();
            }}
            placeholder={placeholder}
            className="h-full w-full bg-transparent text-sm text-fg placeholder:text-fg-subtle focus:outline-none"
            aria-label={label}
            role="combobox"
            aria-expanded={open && results.length > 0}
            aria-controls="search-results"
          />
          <kbd className="hidden rounded border border-line px-1.5 text-[10px] text-fg-subtle sm:block">/</kbd>
        </div>
        {open && q.trim().length >= 2 && (
          <ul id="search-results" role="listbox" className="panel scroll-thin absolute top-12 z-50 max-h-96 w-[min(28rem,90vw)] overflow-y-auto p-1">
            {results.length === 0 && <li className="px-3 py-2.5 text-sm text-fg-muted">Nenhuma estrutura encontrada.</li>}
            {results.map((s, i) => (
              <li key={s.id} role="option" aria-selected={i === active}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(s)}
                  onMouseEnter={() => setActive(i)}
                  className={`flex w-full flex-col items-start rounded-md px-3 py-2 text-left ${i === active ? 'bg-white/[0.06]' : ''}`}
                >
                  <span className="text-sm text-fg">{s.namePtBR}</span>
                  <span className="text-xs text-fg-subtle">
                    {s.biologicalSystem}
                    {s.scientificName ? ` · ${s.scientificName}` : ''}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  },
);
