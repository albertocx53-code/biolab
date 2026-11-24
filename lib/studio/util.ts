/** Small deterministic helpers shared by the Studio generators. */

/** Seeded random generator (mulberry32): the same seed always gives the same material. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashSeed(s: string, n = 0): number {
  let h = 2166136261 ^ n;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

export function shuffle<T>(list: readonly T[], rand: () => number): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function sentences(text: string): string[] {
  return (text.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) ?? []).map((s) => s.trim()).filter(Boolean);
}

/** First sentences of a text, up to about `max` characters. */
export function brief(text: string, max = 220): string {
  const out: string[] = [];
  for (const s of sentences(text)) {
    if (out.length && out.join(' ').length + s.length > max) break;
    out.push(s);
  }
  const r = out.join(' ') || text;
  return r.length > max + 60 ? `${r.slice(0, max).replace(/\s+\S*$/, '')}…` : r;
}

/** Cuts a text at a word boundary. */
export function clip(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max).replace(/[\s,;:]+\S*$/, '')}…`;
}

export const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

/** "o/a" article guess is unsafe in Portuguese, so labels are used without articles. */
export function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
