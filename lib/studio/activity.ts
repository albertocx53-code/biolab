/**
 * Student worksheet of a lesson: numbered 3D drawing, picture quiz,
 * matching columns, true/false, fill-in, process order and open questions,
 * with an answer key. Deterministic for a given seed ("gerar outra versão").
 */
import type { PackDiagram, PackFigure, PackStructure, StudioPack } from '@/data/studio/pack';
import { callouts, type Callout } from './diagram';
import { brief, capitalize, clip, hashSeed, LETTERS, rng, sentences, shuffle } from './util';

export type ActivityItem =
  | { kind: 'diagram'; title: string; diagram: PackDiagram; callouts: Callout[]; bank: string[]; answers: string[] }
  | { kind: 'picture-quiz'; title: string; questions: { image: string; options: string[]; answer: number }[] }
  | { kind: 'matching'; title: string; left: string[]; right: string[]; answer: number[] }
  | { kind: 'true-false'; title: string; items: { text: string; value: boolean; fix?: string }[] }
  | { kind: 'fill'; title: string; bank: string[]; items: { before: string; after: string; answer: string }[] }
  | { kind: 'order'; title: string; process: string; steps: { image: string; letter: string }[]; answer: string[]; stepTitles: string[] }
  | { kind: 'open'; title: string; items: { q: string; a: string }[] };

export interface Activity {
  title: string;
  items: ActivityItem[];
}

export interface ActivityOptions {
  seed: number;
  /** Line drawings (print and colour) instead of colour 3D pictures. */
  drawings: boolean;
}

const fnText = (s: PackStructure) => clip((s.function ?? s.description ?? '').replace(/\s+/g, ' '), 140);

export function buildActivity(pack: StudioPack, opts: ActivityOptions): Activity {
  const rand = rng(hashSeed(pack.lesson.id, opts.seed));
  const items: ActivityItem[] = [];
  const all = [...pack.structures, ...pack.distractors];

  // 1. identify the structures in the numbered drawing
  const d = pack.diagrams[opts.seed % Math.max(1, pack.diagrams.length)] ?? pack.diagrams[0];
  if (d) {
    const cs = callouts(d);
    items.push({
      kind: 'diagram',
      title: opts.drawings ? 'Observe o desenho do modelo 3D. Escreva o nome de cada estrutura numerada e pinte cada uma com uma cor diferente.' : 'Observe o modelo 3D e escreva o nome de cada estrutura numerada.',
      diagram: d,
      callouts: cs,
      bank: shuffle(cs.map((c) => c.name), rand),
      answers: cs.map((c) => c.name),
    });
  }

  // 2. which structure is this? (isolated 3D pictures)
  const figs = shuffle(
    pack.sections.flatMap((s) => s.figures).filter((f): f is PackFigure & { structure: PackStructure } => !!f.structure && f.image.kind === 'structure'),
    rand,
  ).filter((f, i, a) => a.findIndex((g) => g.structure.name === f.structure.name) === i);
  const quiz = figs.slice(0, 2).map((f) => {
    const wrong = shuffle(
      all.filter((s) => s.name !== f.structure.name),
      rand,
    ).slice(0, 3);
    const options = shuffle([f.structure.name, ...wrong.map((w) => w.name)], rand);
    return { image: (opts.drawings && f.image.line) || f.image.src, options, answer: options.indexOf(f.structure.name) };
  });
  if (quiz.length) items.push({ kind: 'picture-quiz', title: 'Que estrutura está representada em cada imagem? Marque a alternativa correta.', questions: quiz });

  // 3. matching: structure ↔ function
  const withFn = shuffle(
    pack.structures.filter((s) => s.function || s.description),
    rand,
  ).slice(0, 5);
  if (withFn.length >= 3) {
    const order = shuffle(
      withFn.map((_, i) => i),
      rand,
    );
    items.push({
      kind: 'matching',
      title: 'Relacione cada estrutura (coluna da esquerda) à sua função (coluna da direita).',
      left: withFn.map((s) => s.name),
      right: order.map((i) => fnText(withFn[i])),
      answer: withFn.map((_, i) => order.indexOf(i)),
    });
  }

  // 4. true or false: facts from the lesson and common misconceptions
  const facts = shuffle(
    pack.sections.flatMap((s) => s.bullets).filter((b) => b.length > 25 && b.length < 170),
    rand,
  ).slice(0, 3);
  const myths = shuffle(pack.lesson.misconceptions, rand).slice(0, 2);
  const tf = shuffle(
    [
      ...facts.map((t) => ({ text: t.replace(/\.?$/, '.'), value: true })),
      ...myths.map((m) => ({ text: m.wrong.replace(/\.?$/, '.'), value: false, fix: capitalize(m.right) })),
    ],
    rand,
  );
  if (tf.length >= 3) items.push({ kind: 'true-false', title: 'Escreva V (verdadeiro) ou F (falso). Corrija as frases falsas.', items: tf });

  // 5. fill in the blanks with the key terms
  const fill: { before: string; after: string; answer: string }[] = [];
  const terms = [...pack.lesson.keyTerms].sort((a, b) => b.length - a.length);
  const pool = shuffle(
    pack.sections.flatMap((s) => sentences(s.text)),
    rand,
  );
  for (const sent of pool) {
    if (fill.length >= 4 || sent.length > 220) continue;
    const term = terms.find((t) => new RegExp(`(^|[^\\p{L}])${escapeRe(t)}([^\\p{L}]|$)`, 'iu').test(sent) && !fill.some((f) => f.answer.toLowerCase() === t.toLowerCase()));
    if (!term) continue;
    const m = new RegExp(`(^|[^\\p{L}])(${escapeRe(term)})([^\\p{L}]|$)`, 'iu').exec(sent)!;
    const at = m.index + m[1].length;
    fill.push({ before: sent.slice(0, at), after: sent.slice(at + m[2].length), answer: m[2] });
  }
  if (fill.length >= 2) items.push({ kind: 'fill', title: 'Complete as frases com as palavras do quadro.', bank: shuffle(fill.map((f) => f.answer), rand), items: fill });

  // 6. put the steps of an animation in order (3D pictures)
  const procFigs = pack.sections.flatMap((s) => s.figures).filter((f) => f.process);
  const firstProc = procFigs[0]?.process;
  if (firstProc) {
    const steps = procFigs.filter((f) => f.process!.id === firstProc.id).slice(0, 5);
    if (steps.length >= 3) {
      const shuffled = shuffle(steps, rand);
      const letters = shuffled.map((_, i) => LETTERS[i]);
      items.push({
        kind: 'order',
        title: `As imagens mostram etapas de “${firstProc.title}” fora de ordem. Numere-as na sequência correta.`,
        process: firstProc.title,
        steps: shuffled.map((f, i) => ({ image: f.image.src, letter: letters[i] })),
        answer: steps.map((f) => letters[shuffled.indexOf(f)]),
        stepTitles: steps.map((f) => firstProc.steps[f.image.step ?? 0]?.title ?? ''),
      });
    }
  }

  // 7. open questions
  const open = shuffle(pack.lesson.questions, rand).slice(0, 3);
  if (open.length) items.push({ kind: 'open', title: 'Responda com suas palavras.', items: open.map((q) => ({ q: q.q, a: brief(q.a, 260) })) });

  return { title: pack.lesson.title, items };
}

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
