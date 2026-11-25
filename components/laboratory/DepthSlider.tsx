'use client';

import { useViewer } from '@/engine/store';

/**
 * One slider to peel the body like an atlas: skin → muscles → skeleton → organs.
 * Each stage fades one layer out; organs (always on) stay at the core.
 */
const STOPS = [
  { v: 0, label: 'Pele' },
  { v: 1, label: 'Músculos' },
  { v: 2, label: 'Esqueleto' },
  { v: 3, label: 'Órgãos' },
];
const LAYERS: { group: string; until: number }[] = [
  { group: 'tegumentar', until: 1 },
  { group: 'muscular', until: 2 },
  { group: 'esqueletico', until: 3 },
];

export function applyDepth(v: number) {
  const st = useViewer.getState();
  for (const [i, { group, until }] of LAYERS.entries()) {
    const op = Math.min(1, Math.max(0, until - v));
    // Under fully opaque skin nothing inside is drawn: muscles and bones would only cost draw calls, and
    // the atlas skeleton sits so close to the skin (clavicle, sternum, acromion) that it pokes through.
    // Once the skin starts fading, bones stay on under the muscles (tibia, patella and skull are exposed).
    const coveredByOuter = (i === 1 || i === 2) && v < 0.03;
    const visible = op > 0.03 && !coveredByOuter;
    if (!!st.groupVisible[group] !== visible) st.setGroupVisible(group, visible);
    if (visible) st.setGroupOpacity(group, op > 0.97 ? 1 : op);
  }
  // Blood vessels belong to the picture once the skin is peeled (an atlas plate), not under opaque skin,
  // where they would only cost download and draw calls.
  const vessels = v >= 0.97;
  if (!!st.groupVisible.vasos !== vessels) st.setGroupVisible('vasos', vessels);
}

export function DepthSlider({ value, onChange, large = false }: { value: number; onChange: (v: number) => void; large?: boolean }) {
  return (
    <div className="flex items-stretch gap-3" data-testid="depth-slider">
      <input
        type="range"
        min={0}
        max={3}
        step={0.02}
        value={value}
        onChange={(e) => {
          const v = Number(e.target.value);
          onChange(v);
          applyDepth(v);
        }}
        className={`depth-range ${large ? 'h-64' : 'h-48'}`}
        aria-label="Profundidade das camadas: pele, músculos, esqueleto e órgãos"
        aria-valuetext={STOPS[Math.round(value)].label}
      />
      <ol className="flex flex-col justify-between py-0.5">
        {STOPS.map((s) => {
          const active = Math.round(value) === s.v;
          return (
            <li key={s.v}>
              <button
                type="button"
                onClick={() => {
                  onChange(s.v);
                  applyDepth(s.v);
                }}
                className={`text-left font-semibold transition-colors ${large ? 'text-base' : 'text-[13px]'} ${active ? 'text-fg' : 'text-fg-subtle hover:text-fg-muted'}`}
              >
                {s.label}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
