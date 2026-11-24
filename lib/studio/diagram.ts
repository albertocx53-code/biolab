/**
 * Numbered labels of a model picture: leader lines from each structure to a
 * badge in the left or right margin (textbook style). Positions are fractions
 * of the picture, so slides, worksheets and PowerPoint share the same layout.
 */
import type { PackDiagram } from '@/data/studio/pack';

export interface Callout {
  n: number;
  id: string;
  name: string;
  /** Anchor on the structure. */
  ax: number;
  ay: number;
  /** Badge centre. */
  bx: number;
  by: number;
  side: 'left' | 'right';
}

function column(list: { y: number }[], top = 0.07, bottom = 0.93): number[] {
  const g = Math.min(0.1, (bottom - top) / Math.max(1, list.length - 1));
  const ys = list.map((l) => Math.min(bottom, Math.max(top, l.y)));
  for (let i = 1; i < ys.length; i++) ys[i] = Math.max(ys[i], ys[i - 1] + g);
  if (ys.length && ys[ys.length - 1] > bottom) {
    ys[ys.length - 1] = bottom;
    for (let i = ys.length - 2; i >= 0; i--) ys[i] = Math.min(ys[i], ys[i + 1] - g);
  }
  return ys;
}

export function callouts(d: PackDiagram, margin = 0.04): Callout[] {
  let left = d.labels.filter((l) => l.x < 0.5);
  let right = d.labels.filter((l) => l.x >= 0.5);
  // keep the two columns balanced: move the labels nearest the middle
  while (left.length > right.length + 2) {
    left.sort((a, b) => b.x - a.x);
    right = [...right, left[0]];
    left = left.slice(1);
  }
  while (right.length > left.length + 2) {
    right.sort((a, b) => a.x - b.x);
    left = [...left, right[0]];
    right = right.slice(1);
  }
  left.sort((a, b) => a.y - b.y);
  right.sort((a, b) => a.y - b.y);
  const ly = column(left);
  const ry = column(right);
  let n = 0;
  return [
    ...left.map((l, i) => ({ n: ++n, id: l.id, name: l.name, ax: l.x, ay: l.y, bx: margin, by: ly[i], side: 'left' as const })),
    ...right.map((l, i) => ({ n: ++n, id: l.id, name: l.name, ax: l.x, ay: l.y, bx: 1 - margin, by: ry[i], side: 'right' as const })),
  ];
}
