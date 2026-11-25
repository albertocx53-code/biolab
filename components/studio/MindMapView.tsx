'use client';

import { BRANCH_COLORS, type MindMap } from '@/lib/studio/mindmap';

const W = 1600;
const H = 1000;

/** Wraps a text into lines of about `chars` characters. */
function wrap(text: string, chars: number, max: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > chars && cur) {
      lines.push(cur);
      cur = w;
    } else cur = (cur + ' ' + w).trim();
  }
  if (cur) lines.push(cur);
  if (lines.length > max) {
    const cut = lines.slice(0, max);
    cut[max - 1] = cut[max - 1].replace(/\s*\S*$/, '') + '…';
    return cut;
  }
  return lines;
}

export function MindMapView({ map, drawings }: { map: MindMap; drawings: boolean }) {
  const n = map.branches.length;
  const leftN = Math.ceil(n / 2);
  const sides = [map.branches.slice(0, leftN), map.branches.slice(leftN)];
  const cx = W / 2;
  const cy = 430;
  const R = 150;
  const cardW = 470;
  const top = 30;
  const avail = H - 2 * top;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Mapa mental: ${map.title}`} data-testid="studio-mindmap" style={{ fontFamily: 'Inter, sans-serif' }}>
      <rect width={W} height={H} fill="#ffffff" />
      <defs>
        <clipPath id="mm-center">
          <circle cx={cx} cy={cy} r={R - 8} />
        </clipPath>
      </defs>
      {sides.map((list, side) => {
        const gap = 18;
        const cardH = Math.min(300, (avail - gap * (list.length - 1)) / Math.max(1, list.length));
        const total = list.length * cardH + (list.length - 1) * gap;
        const y0 = (H - total) / 2;
        return list.map((b, k) => {
          const idx = side === 0 ? k : leftN + k;
          const color = drawings ? '#0f172a' : BRANCH_COLORS[idx % BRANCH_COLORS.length];
          const x = side === 0 ? 30 : W - 30 - cardW;
          const y = y0 + k * (cardH + gap);
          const inner = side === 0 ? x + cardW : x;
          const my = y + cardH / 2;
          const sx = cx + (side === 0 ? -R : R);
          const c1 = sx + (side === 0 ? -90 : 90);
          const c2 = inner + (side === 0 ? 90 : -90);
          const img = b.image ? (drawings && b.image.line) || b.image.src : null;
          const pad = 16;
          const imgH = img ? Math.min(160, cardH * 0.5) : 0;
          const imgW = cardW - 2 * pad;
          const textX = x + pad + 2;
          const head = wrap(b.heading, Math.floor((cardW - 2 * pad) / 11.2), 2);
          const headY = y + pad + imgH + (img ? 26 : 30);
          const room = Math.floor((y + cardH - 12 - (headY + (head.length - 1) * 25)) / 22);
          const leaves = b.leaves.flatMap((l) => wrap(l, Math.floor((cardW - 2 * pad - 16) / 8.4), 2).map((t, i) => ({ t, first: i === 0 }))).slice(0, Math.max(0, room));
          // renders have wide margins: show the middle of the picture, a little enlarged
          const zoom = 1.35;
          const vw = 1280 / zoom;
          const vh = vw * (imgH / imgW);
          return (
            <g key={idx}>
              <path d={`M ${sx} ${cy} C ${c1} ${cy}, ${c2} ${my}, ${inner} ${my}`} fill="none" stroke={color} strokeWidth={drawings ? 3 : 7} strokeLinecap="round" opacity={drawings ? 1 : 0.85} />
              <rect x={x} y={y} width={cardW} height={cardH} rx={18} fill={drawings ? '#fff' : `${color}10`} stroke={color} strokeWidth={drawings ? 2 : 2.5} />
              {img && (
                <svg x={x + pad} y={y + pad} width={imgW} height={imgH} viewBox={`${(1280 - vw) / 2} ${(800 - vh) / 2} ${vw} ${vh}`} preserveAspectRatio="xMidYMid slice">
                  <image href={img} width={1280} height={800} />
                </svg>
              )}
              {img && <rect x={x + pad} y={y + pad} width={imgW} height={imgH} rx={10} fill="none" stroke={color} strokeOpacity={0.25} />}
              {head.map((t, i) => (
                <text key={i} x={textX} y={headY + i * 25} fontSize={21} fontWeight={800} fill={color}>
                  {t}
                </text>
              ))}
              {leaves.map((l, i) => (
                <text key={i} y={headY + (head.length - 1) * 25 + 26 + i * 22} fontSize={16} fill="#334155">
                  {l.first && (
                    <tspan x={textX} fill={color} fontWeight={800}>
                      •
                    </tspan>
                  )}
                  <tspan x={textX + 16}>{l.t}</tspan>
                </text>
              ))}
            </g>
          );
        });
      })}
      <circle cx={cx} cy={cy} r={R} fill="#fff" stroke={drawings ? '#0f172a' : '#0f172a'} strokeWidth={drawings ? 3 : 6} />
      {map.center && <image href={(drawings && map.center.line) || map.center.src} x={cx - R * 1.6} y={cy - R} width={R * 3.2} height={R * 2} clipPath="url(#mm-center)" preserveAspectRatio="xMidYMid meet" />}
      {wrap(map.title, 26, 3).map((t, i, a) => (
        <text key={i} x={cx} y={cy + R + 46 + i * 34 - (a.length > 2 ? 10 : 0)} textAnchor="middle" fontSize={30} fontWeight={800} fill="#0f172a" fontFamily="Manrope, Inter, sans-serif">
          {t}
        </text>
      ))}
      {chips(map.terms, cx, cy + R + 46 + Math.min(3, wrap(map.title, 26, 3).length) * 34 + 10, drawings)}
    </svg>
  );
}

function chips(terms: string[], cx: number, y: number, drawings: boolean) {
  const rows: string[][] = [[]];
  let w = 0;
  for (const t of terms) {
    const tw = t.length * 8.6 + 26;
    if (w + tw > 440 && rows[rows.length - 1].length) {
      rows.push([]);
      w = 0;
    }
    rows[rows.length - 1].push(t);
    w += tw + 8;
  }
  return rows.slice(0, 3).map((row, r) => {
    const widths = row.map((t) => t.length * 8.6 + 26);
    const total = widths.reduce((a, b) => a + b, 0) + (row.length - 1) * 8;
    let x = cx - total / 2;
    return row.map((t, i) => {
      const el = (
        <g key={`${r}-${i}`}>
          <rect x={x} y={y + r * 38} width={widths[i]} height={30} rx={15} fill={drawings ? '#fff' : '#f1f5f9'} stroke="#94a3b8" />
          <text x={x + widths[i] / 2} y={y + r * 38 + 20} textAnchor="middle" fontSize={15} fontWeight={600} fill="#334155">
            {t}
          </text>
        </g>
      );
      x += widths[i] + 8;
      return el;
    });
  });
}
