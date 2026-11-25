/**
 * Slide deck of a lesson. Each slide is a list of positioned elements on a
 * 1280×720 canvas (= 13.33×7.5 in at 96 px/in), drawn by the HTML preview and
 * exported to PowerPoint with the same coordinates.
 */
import type { PackDiagram, PackFigure, StudioPack } from '@/data/studio/pack';
import { brief, capitalize, clip } from './util';

export const SLIDE_W = 1280;
export const SLIDE_H = 720;

export type SlideEl =
  | {
      type: 'text';
      x: number;
      y: number;
      w: number;
      h: number;
      text: string | string[];
      size: number;
      bold?: boolean;
      color?: string;
      font?: 'display' | 'body';
      align?: 'left' | 'center' | 'right';
      valign?: 'top' | 'middle' | 'bottom';
      bullets?: boolean;
      caps?: boolean;
    }
  | { type: 'image'; x: number; y: number; w: number; h: number; src: string; fit: 'contain' | 'cover'; radius?: number }
  | { type: 'rect'; x: number; y: number; w: number; h: number; fill: string; radius?: number; line?: string }
  | { type: 'diagram'; x: number; y: number; w: number; h: number; diagram: PackDiagram; legend: boolean };

export interface Slide {
  id: string;
  /** Short name in the slide sorter. */
  name: string;
  bg: string;
  els: SlideEl[];
  notes: string;
}

const INK = '#0f172a';
const MUTED = '#475569';
const PAPER = '#ffffff';
const SOFT = '#f1f5f9';

/** Font size that keeps a text inside its box (rough, same rule for HTML and PowerPoint). */
export function fitSize(text: string | string[], w: number, h: number, max: number, min = 14, lineH = 1.3): number {
  const parts = Array.isArray(text) ? text : [text];
  for (let s = max; s > min; s -= 1) {
    const perLine = Math.max(1, Math.floor(w / (s * 0.52)));
    const lines = parts.reduce((n, p) => n + Math.max(1, Math.ceil(p.length / perLine)), 0);
    const gaps = Array.isArray(text) ? (parts.length - 1) * 0.35 : 0;
    if ((lines + gaps) * s * lineH <= h) return s;
  }
  return min;
}

function header(accent: string, eyebrow: string, title: string): SlideEl[] {
  return [
    { type: 'rect', x: 0, y: 0, w: 14, h: SLIDE_H, fill: accent },
    { type: 'text', x: 64, y: 40, w: 1150, h: 26, text: eyebrow, size: 15, bold: true, color: accent, caps: true },
    { type: 'text', x: 64, y: 70, w: 1150, h: 70, text: title, size: fitSize(title, 1150, 70, 40, 24, 1.15), bold: true, font: 'display', color: INK, valign: 'top' },
  ];
}

function footer(pack: StudioPack, n: number): SlideEl[] {
  return [
    { type: 'text', x: 64, y: 680, w: 900, h: 22, text: `BioLab 3D · ${pack.lab.title} · ${pack.lesson.title}`, size: 12, color: '#94a3b8' },
    { type: 'text', x: 1100, y: 680, w: 120, h: 22, text: String(n), size: 12, color: '#94a3b8', align: 'right' },
  ];
}

function figureCaption(f: PackFigure): string {
  if (f.structure) return f.structure.name;
  if (f.process) return f.image.caption.split(' — ').slice(1).join(' — ') || f.process.title;
  return capitalize(f.label.replace(/^Abrir (a |o )?/i, ''));
}

export function buildSlides(pack: StudioPack): Slide[] {
  const { lesson, lab } = pack;
  const accent = lab.accent;
  const slides: Slide[] = [];
  const add = (s: Slide) => slides.push(s);

  // 1. cover
  add({
    id: 'capa',
    name: 'Capa',
    bg: PAPER,
    els: [
      { type: 'rect', x: 0, y: 0, w: 520, h: SLIDE_H, fill: SOFT },
      { type: 'rect', x: 0, y: 0, w: 14, h: SLIDE_H, fill: accent },
      { type: 'text', x: 64, y: 150, w: 420, h: 28, text: `${lab.title} · ${lesson.unit}`, size: 16, bold: true, color: accent, caps: true },
      { type: 'text', x: 64, y: 190, w: 420, h: 220, text: lesson.title, size: fitSize(lesson.title, 420, 220, 52, 28, 1.12), bold: true, font: 'display', color: INK },
      { type: 'text', x: 64, y: 430, w: 420, h: 120, text: brief(lesson.summary, 170), size: 18, color: MUTED },
      { type: 'text', x: 64, y: 600, w: 420, h: 50, text: `${lesson.grade} · ${lesson.minutes} min`, size: 15, color: MUTED },
      ...(pack.cover ? [{ type: 'image' as const, x: 520, y: 0, w: 760, h: SLIDE_H, src: pack.cover.src, fit: 'cover' as const }] : []),
    ],
    notes: lesson.summary,
  });

  // 2. objectives
  add({
    id: 'objetivos',
    name: 'Objetivos',
    bg: PAPER,
    els: [
      ...header(accent, 'Nesta aula', 'Objetivos de aprendizagem'),
      { type: 'text', x: 64, y: 170, w: pack.cover ? 620 : 1150, h: 470, text: lesson.objectives, size: fitSize(lesson.objectives, pack.cover ? 600 : 1130, 470, 26, 16), bullets: true, color: INK },
      ...(pack.diagrams[1] ?? pack.diagrams[0] ? [{ type: 'image' as const, x: 720, y: 170, w: 500, h: 420, src: (pack.diagrams[1] ?? pack.diagrams[0]).image.src, fit: 'contain' as const, radius: 16 }] : []),
    ],
    notes: `Objetivos: ${lesson.objectives.join(' ')}`,
  });

  // 3. sections, with their 3D figures
  for (const [si, sec] of pack.sections.entries()) {
    // every slide gets a 3D picture: the section's own, else a view of the lesson's model
    const fallback = pack.diagrams[si % Math.max(1, pack.diagrams.length)];
    const main: PackFigure | undefined =
      sec.figures.find((f) => !f.process) ?? sec.figures[0] ?? (fallback ? { label: fallback.title, image: fallback.image } : pack.cover ? { label: lesson.title, image: pack.cover } : undefined);
    const bullets = sec.bullets.slice(0, 5);
    const body = brief(sec.text, bullets.length ? 230 : 420);
    const textW = main ? 560 : 1150;
    const bodyH = bullets.length ? 150 : 430;
    add({
      id: `secao-${si}`,
      name: sec.heading,
      bg: PAPER,
      els: [
        ...header(accent, `Parte ${si + 1}`, sec.heading),
        { type: 'text', x: 64, y: 165, w: textW, h: bodyH, text: body, size: fitSize(body, textW, bodyH, bullets.length ? 22 : 26, 15), color: INK },
        ...(bullets.length ? [{ type: 'text' as const, x: 64, y: 330, w: textW, h: 320, text: bullets, size: fitSize(bullets, textW - 30, 320, 20, 14), bullets: true, color: MUTED }] : []),
        ...(main
          ? [
              { type: 'rect' as const, x: 660, y: 160, w: 560, h: 450, fill: SOFT, radius: 18 },
              { type: 'image' as const, x: 670, y: 170, w: 540, h: 400, src: main.image.src, fit: 'contain' as const },
              { type: 'text' as const, x: 680, y: 572, w: 520, h: 30, text: figureCaption(main), size: 15, bold: true, color: MUTED, align: 'center' as const },
            ]
          : []),
      ],
      notes: [sec.text, ...sec.bullets].join('\n'),
    });

    // structures in detail (two per slide), isolated 3D pictures
    const structs = sec.figures.filter((f) => f.structure && f !== main && (f.structure.function || f.structure.description));
    for (let i = 0; i < structs.length; i += 2) {
      const pair = structs.slice(i, i + 2);
      const colW = pair.length === 1 ? 1150 : 560;
      add({
        id: `secao-${si}-estruturas-${i}`,
        name: pair.map((f) => f.structure!.name).join(' e '),
        bg: PAPER,
        els: [
          ...header(accent, `${sec.heading} · em detalhe`, pair.map((f) => f.structure!.name).join(' e ')),
          ...pair.flatMap((f, k): SlideEl[] => {
            const x = 64 + k * 590;
            const txt = brief(f.structure!.function ?? f.structure!.description ?? '', 200);
            const imgW = pair.length === 1 ? 600 : colW;
            return [
              { type: 'rect', x, y: 160, w: imgW, h: 330, fill: SOFT, radius: 18 },
              { type: 'image', x: x + 10, y: 168, w: imgW - 20, h: 314, src: f.image.src, fit: 'contain' },
              ...(pair.length === 1
                ? [
                    { type: 'text' as const, x: 700, y: 170, w: 520, h: 34, text: f.structure!.name, size: 26, bold: true, font: 'display' as const, color: INK },
                    ...(f.structure!.scientificName ? [{ type: 'text' as const, x: 700, y: 208, w: 520, h: 26, text: f.structure!.scientificName, size: 16, color: MUTED }] : []),
                    { type: 'text' as const, x: 700, y: 250, w: 520, h: f.image.context ? 200 : 380, text: brief(`${f.structure!.description ?? ''} ${f.structure!.function ?? ''}`, f.image.context ? 300 : 420), size: fitSize(brief(`${f.structure!.description ?? ''} ${f.structure!.function ?? ''}`, f.image.context ? 300 : 420), 520, f.image.context ? 200 : 380, 21, 13), color: INK },
                    ...(f.image.context
                      ? [
                          { type: 'rect' as const, x: 700, y: 462, w: 300, h: 188, fill: SOFT, radius: 12 },
                          { type: 'image' as const, x: 700, y: 462, w: 300, h: 188, src: f.image.context, fit: 'cover' as const, radius: 12 },
                          { type: 'text' as const, x: 1014, y: 540, w: 200, h: 40, text: 'Onde fica no modelo', size: 15, bold: true, color: MUTED },
                        ]
                      : []),
                  ]
                : [
                    { type: 'text' as const, x, y: 505, w: colW, h: 32, text: f.structure!.name, size: 22, bold: true, font: 'display' as const, color: INK },
                    { type: 'text' as const, x, y: 540, w: colW, h: 120, text: txt, size: fitSize(txt, colW, 120, 17, 13), color: MUTED },
                  ]),
            ];
          }),
        ],
        notes: pair.map((f) => `${f.structure!.name}: ${f.structure!.description ?? ''} ${f.structure!.function ?? ''}`).join('\n\n'),
      });
    }

    // animations step by step
    const procs = new Map<string, PackFigure[]>();
    for (const f of sec.figures) if (f.process) procs.set(f.process.id, [...(procs.get(f.process.id) ?? []), f]);
    for (const [pid, figs] of procs) {
      const steps = figs.slice(0, 6);
      const cols = steps.length <= 3 ? steps.length : steps.length === 4 ? 2 : 3;
      const rows = Math.ceil(steps.length / cols);
      const cellW = (1150 - (cols - 1) * 20) / cols;
      const cellH = (480 - (rows - 1) * 16) / rows;
      const proc = figs[0].process!;
      add({
        id: `secao-${si}-processo-${pid}`,
        name: proc.title,
        bg: PAPER,
        els: [
          ...header(accent, 'Passo a passo', proc.title),
          ...steps.flatMap((f, k): SlideEl[] => {
            const x = 64 + (k % cols) * (cellW + 20);
            const y = 160 + Math.floor(k / cols) * (cellH + 16);
            const stepTitle = proc.steps[f.image.step ?? k]?.title ?? figureCaption(f);
            return [
              { type: 'rect', x, y, w: cellW, h: cellH, fill: SOFT, radius: 14 },
              { type: 'image', x: x + 6, y: y + 6, w: cellW - 12, h: cellH - 46, src: f.image.src, fit: 'contain' },
              { type: 'text', x: x + 12, y: y + cellH - 38, w: cellW - 24, h: 32, text: stepTitle, size: fitSize(stepTitle, cellW - 24, 32, 16, 11, 1.1), bold: true, color: INK, align: 'center', valign: 'middle' },
            ];
          }),
          { type: 'text', x: 64, y: 650, w: 1150, h: 26, text: clip(proc.note, 150), size: 13, color: MUTED },
        ],
        notes: proc.steps.map((s, i) => `${i + 1}. ${s.title}: ${s.text}`).join('\n'),
      });
    }
  }

  // 4. numbered model
  for (const [di, d] of pack.diagrams.slice(0, 2).entries()) {
    add({
      id: `modelo-${di}`,
      name: `Estruturas: ${d.title}`,
      bg: PAPER,
      els: [...header(accent, 'Observe o modelo 3D', `Estruturas: ${d.title}`), { type: 'diagram', x: 64, y: 150, w: 1150, h: 520, diagram: d, legend: true }],
      notes: d.labels.map((l) => `${l.name}${l.function ? `: ${l.function}` : ''}`).join('\n'),
    });
  }

  // 5. key terms
  if (lesson.keyTerms.length) {
    add({
      id: 'conceitos',
      name: 'Conceitos-chave',
      bg: PAPER,
      els: [
        ...header(accent, 'Para revisar', 'Conceitos-chave'),
        ...lesson.keyTerms.slice(0, 16).flatMap((t, i): SlideEl[] => {
          const x = 64 + (i % 4) * 290;
          const y = 175 + Math.floor(i / 4) * 110;
          return [
            { type: 'rect', x, y, w: 270, h: 88, fill: SOFT, radius: 14 },
            { type: 'text', x: x + 14, y, w: 242, h: 88, text: t, size: fitSize(t, 242, 80, 22, 13, 1.15), bold: true, color: INK, align: 'center', valign: 'middle' },
          ];
        }),
      ],
      notes: lesson.keyTerms.join(', '),
    });
  }

  // 6. questions and misconceptions
  if (lesson.questions.length) {
    const qs = lesson.questions.slice(0, 5).map((q) => q.q);
    add({
      id: 'perguntas',
      name: 'Para pensar',
      bg: PAPER,
      els: [...header(accent, 'Discussão', 'Para pensar'), { type: 'text', x: 64, y: 170, w: 1150, h: 480, text: qs, size: fitSize(qs, 1120, 480, 26, 15), bullets: true, color: INK }],
      notes: lesson.questions.map((q) => `${q.q}\nResposta esperada: ${q.a}`).join('\n\n'),
    });
  }
  if (lesson.misconceptions.length) {
    const items = lesson.misconceptions.slice(0, 3);
    add({
      id: 'erros',
      name: 'Cuidado com estes erros',
      bg: PAPER,
      els: [
        ...header(accent, 'Ideias erradas comuns', 'Cuidado com estes erros'),
        ...items.flatMap((m, i): SlideEl[] => {
          const y = 165 + i * 165;
          return [
            { type: 'rect', x: 64, y, w: 1150, h: 148, fill: SOFT, radius: 16 },
            { type: 'text', x: 90, y: y + 14, w: 1100, h: 50, text: `✗ “${m.wrong}”`, size: fitSize(m.wrong, 1080, 50, 22, 14, 1.15), bold: true, color: '#b91c1c' },
            { type: 'text', x: 90, y: y + 66, w: 1100, h: 72, text: `✓ ${m.right}`, size: fitSize(m.right, 1080, 72, 19, 13), color: INK },
          ];
        }),
      ],
      notes: items.map((m) => `Errado: ${m.wrong}. Correto: ${m.right}`).join('\n'),
    });
  }

  // 7. references
  add({
    id: 'referencias',
    name: 'Referências',
    bg: PAPER,
    els: [
      ...header(accent, 'Fontes', 'Referências e créditos'),
      {
        type: 'text',
        x: 64,
        y: 170,
        w: 1150,
        h: 440,
        text: [
          ...lesson.refs.map((r) => `${r.title}. ${r.publisher}. ${r.license}. ${r.url}`),
          'Imagens 3D: BioLab 3D (modelos esquemáticos, fora de escala).',
        ],
        size: 17,
        bullets: true,
        color: MUTED,
      },
    ],
    notes: '',
  });

  return slides.map((s, i) => (i === 0 ? s : { ...s, els: [...s.els, ...footer(pack, i + 1)] }));
}
