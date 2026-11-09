'use client';

import { useState } from 'react';
import { QUALITY, saveQuality, type QualityProfile } from '@/engine/performance/quality';
import { useViewer } from '@/engine/store';
import { Icon } from '@/components/ui/Icon';

export function QualityMenu() {
  const quality = useViewer((s) => s.quality);
  const setQuality = useViewer((s) => s.setQuality);
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button type="button" className="btn btn-ghost h-10 rounded-full" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="menu">
        <Icon name="settings" size={16} />
        <span className="hidden md:inline">{QUALITY[quality].label}</span>
      </button>
      {open && (
        <div role="menu" className="float-card absolute right-0 z-50 mt-2 w-72 p-1.5" onMouseLeave={() => setOpen(false)}>
          <p className="eyebrow px-2.5 pt-1.5 pb-2">Qualidade gráfica</p>
          {(Object.keys(QUALITY) as QualityProfile[]).map((q) => (
            <button
              key={q}
              role="menuitemradio"
              aria-checked={q === quality}
              className={`flex w-full items-start gap-2.5 rounded-md px-2.5 py-2 text-left hover:bg-white/[0.05] ${q === quality ? 'text-cyan' : ''}`}
              onClick={() => {
                setQuality(q);
                saveQuality(q);
                setOpen(false);
              }}
            >
              <span className="mt-0.5 w-4">{q === quality && <Icon name="check" size={16} />}</span>
              <span>
                <span className="block text-sm font-semibold">{QUALITY[q].label}</span>
                <span className="block text-xs text-fg-muted">{QUALITY[q].description}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
