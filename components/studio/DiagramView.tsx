'use client';

import type { Callout } from '@/lib/studio/diagram';

/**
 * A model picture (3D render or line drawing) with numbered leader lines.
 * Drawn in SVG over a 1280×800 viewBox so it scales with its container.
 */
export function DiagramView({
  src,
  callouts,
  showNames = false,
  accent = '#0f172a',
  className,
}: {
  src: string;
  callouts: Callout[];
  showNames?: boolean;
  accent?: string;
  className?: string;
}) {
  const W = 1280;
  const H = 800;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} role="img" aria-label="Modelo 3D com estruturas numeradas">
      <image href={src} x={0} y={0} width={W} height={H} preserveAspectRatio="xMidYMid meet" />
      {callouts.map((c) => {
        const ax = c.ax * W;
        const ay = c.ay * H;
        const bx = c.bx * W;
        const by = c.by * H;
        const elbow = c.side === 'left' ? bx + 46 : bx - 46;
        return (
          <g key={c.n}>
            <polyline points={`${bx},${by} ${elbow},${by} ${ax},${ay}`} fill="none" stroke="#ffffff" strokeWidth={6} strokeLinejoin="round" opacity={0.85} />
            <polyline points={`${bx},${by} ${elbow},${by} ${ax},${ay}`} fill="none" stroke={accent} strokeWidth={2.5} strokeLinejoin="round" />
            <circle cx={ax} cy={ay} r={7} fill={accent} stroke="#fff" strokeWidth={2.5} />
            <circle cx={bx} cy={by} r={24} fill="#fff" stroke={accent} strokeWidth={3} />
            <text x={bx} y={by + 1} textAnchor="middle" dominantBaseline="middle" fontSize={24} fontWeight={800} fill={accent} fontFamily="Inter, sans-serif">
              {c.n}
            </text>
            {showNames && (
              <text x={c.side === 'left' ? bx + 32 : bx - 32} y={by - 30} textAnchor={c.side === 'left' ? 'start' : 'end'} fontSize={20} fontWeight={700} fill="#0f172a" stroke="#fff" strokeWidth={5} paintOrder="stroke" fontFamily="Inter, sans-serif">
                {c.name}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
