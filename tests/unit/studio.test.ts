import { describe, expect, it } from 'vitest';
import type { StudioImage } from '@/data/studio/images';
import type { StudioPack } from '@/data/studio/pack';
import { buildActivity } from '@/lib/studio/activity';
import { callouts } from '@/lib/studio/diagram';
import { buildMindMap } from '@/lib/studio/mindmap';
import { buildEmergency, buildPlan, splitMinutes } from '@/lib/studio/plan';
import { buildSlides, fitSize, SLIDE_H, SLIDE_W } from '@/lib/studio/slides';

const img = (src: string, kind: StudioImage['kind'] = 'structure', extra: Partial<StudioImage> = {}): StudioImage => ({ src, w: 1280, h: 800, caption: src, kind, ...extra });
const S = (id: string, name: string) => ({ id, name, function: `Função de ${name}.`, description: `${name} é uma estrutura.` });

const PACK: StudioPack = {
  lab: { id: 'celulas', slug: 'celulas', title: 'Células', accent: '#22d3ee' },
  lesson: {
    id: 'teste',
    title: 'Aula de teste',
    unit: 'Citologia',
    grade: '1º ano',
    minutes: 50,
    summary: 'Resumo da aula de teste.',
    objectives: ['Objetivo um.', 'Objetivo dois.'],
    keyTerms: ['núcleo', 'mitocôndria', 'membrana plasmática'],
    questions: [
      { q: 'Pergunta um?', a: 'Resposta um.' },
      { q: 'Pergunta dois?', a: 'Resposta dois.' },
    ],
    misconceptions: [{ wrong: 'Célula vegetal não tem mitocôndria', right: 'tem, ela respira o dia inteiro.' }],
    refs: [{ title: 'Biology 2e', publisher: 'OpenStax', url: 'https://openstax.org', license: 'CC BY 4.0' }],
  },
  cover: img('/capa.webp', 'model', { line: '/capa-linhas.png' }),
  sections: [
    {
      heading: 'Organelas',
      text: 'O núcleo guarda o DNA da célula. A mitocôndria faz a respiração celular. A membrana plasmática controla o que entra e sai.',
      bullets: ['O núcleo tem envoltório duplo com poros.', 'A mitocôndria tem cristas na membrana interna.'],
      figures: [
        { label: 'Núcleo', image: img('/n.webp', 'structure', { line: '/n-linhas.png', context: '/n-ctx.webp' }), structure: S('nucleo', 'Núcleo') },
        { label: 'Mitocôndria', image: img('/m.webp'), structure: S('mitocondria', 'Mitocôndria') },
        { label: 'Membrana', image: img('/mp.webp'), structure: S('membrana', 'Membrana plasmática') },
      ],
    },
    {
      heading: 'Divisão',
      text: 'A célula se divide em etapas.',
      bullets: [],
      figures: [0, 1, 2, 3].map((k) => ({
        label: 'Mitose',
        image: img(`/p${k}.webp`, 'process', { step: k }),
        process: { id: 'mitose', title: 'Mitose', note: 'Esquemático.', steps: ['Prófase', 'Metáfase', 'Anáfase', 'Telófase'].map((t) => ({ title: t, text: t })) },
      })),
    },
  ],
  diagrams: [
    {
      image: img('/capa.webp', 'model', { line: '/capa-linhas.png' }),
      title: 'Célula animal',
      labels: [
        { ...S('nucleo', 'Núcleo'), n: 1, x: 0.45, y: 0.4 },
        { ...S('mitocondria', 'Mitocôndria'), n: 2, x: 0.3, y: 0.42 },
        { ...S('membrana', 'Membrana plasmática'), n: 3, x: 0.7, y: 0.6 },
        { ...S('golgi', 'Complexo golgiense'), n: 4, x: 0.35, y: 0.45 },
        { ...S('ret', 'Retículo'), n: 5, x: 0.32, y: 0.47 },
      ],
    },
  ],
  structures: [S('nucleo', 'Núcleo'), S('mitocondria', 'Mitocôndria'), S('membrana', 'Membrana plasmática')],
  distractors: [S('golgi', 'Complexo golgiense'), S('ret', 'Retículo'), S('lis', 'Lisossomo'), S('cen', 'Centríolo')],
};

describe('Studio', () => {
  it('numera as estruturas em colunas sem sobrepor os números', () => {
    const cs = callouts(PACK.diagrams[0]);
    expect(cs.map((c) => c.n)).toEqual([1, 2, 3, 4, 5]);
    for (const side of ['left', 'right'] as const) {
      const ys = cs.filter((c) => c.side === side).map((c) => c.by);
      for (let i = 1; i < ys.length; i++) expect(ys[i] - ys[i - 1]).toBeGreaterThanOrEqual(0.06);
    }
    expect(Math.abs(cs.filter((c) => c.side === 'left').length - cs.filter((c) => c.side === 'right').length)).toBeLessThanOrEqual(2);
  });

  it('todo slide cabe na tela e os slides de conteúdo têm imagem 3D', () => {
    const slides = buildSlides(PACK);
    expect(slides[0].id).toBe('capa');
    for (const s of slides)
      for (const el of s.els) {
        expect(el.x + el.w).toBeLessThanOrEqual(SLIDE_W + 1);
        expect(el.y + el.h).toBeLessThanOrEqual(SLIDE_H + 1);
      }
    const content = slides.filter((s) => s.id.startsWith('secao-'));
    expect(content.length).toBeGreaterThanOrEqual(3);
    for (const s of content) expect(s.els.some((e) => e.type === 'image' || e.type === 'diagram')).toBe(true);
    expect(slides.some((s) => s.id.includes('processo'))).toBe(true);
    expect(slides.some((s) => s.els.some((e) => e.type === 'diagram'))).toBe(true);
  });

  it('reduz a fonte quando o texto não cabe', () => {
    expect(fitSize('curto', 600, 100, 30)).toBe(30);
    expect(fitSize('texto longo '.repeat(80), 600, 100, 30)).toBeLessThan(30);
  });

  it('atividade tem desenho numerado, questões com imagem e gabarito coerente', () => {
    const a = buildActivity(PACK, { seed: 0, drawings: true });
    const kinds = a.items.map((i) => i.kind);
    expect(kinds).toContain('diagram');
    expect(kinds).toContain('picture-quiz');
    expect(kinds).toContain('matching');
    expect(kinds).toContain('order');
    const quiz = a.items.find((i) => i.kind === 'picture-quiz')!;
    if (quiz.kind !== 'picture-quiz') throw new Error();
    for (const q of quiz.questions) {
      expect(q.options).toHaveLength(4);
      expect(new Set(q.options).size).toBe(4);
      expect(q.answer).toBeGreaterThanOrEqual(0);
    }
    const tf = a.items.find((i) => i.kind === 'true-false');
    if (tf?.kind === 'true-false') expect(tf.items.find((t) => !t.value)?.fix).toMatch(/^Tem/);
    const order = a.items.find((i) => i.kind === 'order')!;
    if (order.kind !== 'order') throw new Error();
    expect(order.stepTitles).toEqual(['Prófase', 'Metáfase', 'Anáfase', 'Telófase']);
    expect([...order.answer].sort()).toEqual(order.steps.map((s) => s.letter).sort());
  });

  it('a mesma versão é sempre igual; outra versão muda a ordem', () => {
    const a = JSON.stringify(buildActivity(PACK, { seed: 3, drawings: false }));
    expect(JSON.stringify(buildActivity(PACK, { seed: 3, drawings: false }))).toBe(a);
    const versions = new Set([0, 1, 2, 3, 4].map((s) => JSON.stringify(buildActivity(PACK, { seed: s, drawings: false }))));
    expect(versions.size).toBeGreaterThan(1);
  });

  it('plano de aula e aula emergencial somam o tempo da aula', () => {
    expect(splitMinutes(50, [1, 2, 3]).reduce((a, b) => a + b, 0)).toBe(50);
    const plan = buildPlan(PACK);
    expect(plan.steps.reduce((a, s) => a + s.minutes, 0)).toBe(50);
    expect(plan.steps.some((s) => s.actions?.includes('Núcleo'))).toBe(true);
    const em = buildEmergency(PACK);
    expect(em.steps.reduce((a, s) => a + s.minutes, 0)).toBe(50);
    expect(em.questions[0].a).toBe('Resposta um.');
  });

  it('mapa mental tem um ramo com imagem para cada parte da aula', () => {
    const m = buildMindMap(PACK);
    expect(m.branches).toHaveLength(2);
    for (const b of m.branches) expect(b.image?.src).toBeTruthy();
    expect(m.center?.line).toBe('/capa-linhas.png');
  });
});
