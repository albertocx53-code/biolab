/**
 * Lesson plan and emergency lesson (text documents, no pictures needed).
 */
import type { StudioPack } from '@/data/studio/pack';
import { brief, clip } from './util';

export interface PlanStep {
  minutes: number;
  title: string;
  text: string;
  actions?: string[];
}

export interface LessonPlan {
  title: string;
  info: [string, string][];
  objectives: string[];
  contents: string[];
  resources: string[];
  steps: PlanStep[];
  assessment: string[];
  misconceptions: string[];
  inclusion: string[];
  refs: string[];
}

/** Splits `total` minutes by weights, in whole minutes, keeping the sum. */
export function splitMinutes(total: number, weights: number[]): number[] {
  const sum = weights.reduce((a, b) => a + b, 0) || 1;
  const raw = weights.map((w) => (w / sum) * total);
  const out = raw.map((r) => Math.max(1, Math.floor(r)));
  let rest = total - out.reduce((a, b) => a + b, 0);
  const order = raw.map((r, i) => [r - Math.floor(r), i] as const).sort((a, b) => b[0] - a[0]);
  for (let k = 0; rest > 0; k = (k + 1) % order.length, rest--) out[order[k][1]]++;
  return out;
}

export function buildPlan(pack: StudioPack): LessonPlan {
  const { lesson, lab, sections } = pack;
  const opening = Math.max(5, Math.round(lesson.minutes * 0.1));
  const activity = Math.max(10, Math.round(lesson.minutes * 0.2));
  const closing = Math.max(5, Math.round(lesson.minutes * 0.1));
  const middle = splitMinutes(
    Math.max(sections.length * 3, lesson.minutes - opening - activity - closing),
    sections.map((s) => 1 + s.text.length / 300 + s.figures.length * 0.3),
  );
  const firstQ = lesson.questions[0]?.q;
  const steps: PlanStep[] = [
    {
      minutes: opening,
      title: 'Abertura e problematização',
      text: `Apresente o tema “${lesson.title}”.${firstQ ? ` Lance a pergunta: “${firstQ}” e anote no quadro as hipóteses da turma, sem corrigir ainda.` : ' Pergunte o que a turma já sabe e anote as ideias no quadro.'}`,
    },
    ...sections.map((s, i) => ({
      minutes: middle[i],
      title: s.heading,
      text: brief(s.text, 260),
      actions: [...new Set(s.figures.map((f) => f.label))],
    })),
    {
      minutes: activity,
      title: 'Atividade dos alunos',
      text: 'Aplique a atividade gerada no Studio (identificação das estruturas no modelo 3D, questões objetivas e discursivas). Circule pela sala e tire dúvidas.',
    },
    {
      minutes: closing,
      title: 'Fechamento',
      text: `Retome as hipóteses da abertura e confira com a turma o que mudou. Revise os conceitos-chave: ${lesson.keyTerms.slice(0, 6).join(', ')}.`,
    },
  ];
  return {
    title: lesson.title,
    info: [
      ['Componente', 'Biologia'],
      ['Unidade', lesson.unit],
      ['Série', lesson.grade],
      ['Duração', `${lesson.minutes} minutos`],
      ['Laboratório 3D', `BioLab 3D · ${lab.title}`],
    ],
    objectives: lesson.objectives,
    contents: lesson.keyTerms,
    resources: [
      `Computador com projetor ou TV e o laboratório ${lab.title} do BioLab 3D (Modo Apresentação)`,
      'Quadro e pincel/giz',
      'Atividade impressa (gerada no Studio)',
    ],
    steps,
    assessment: [
      'Participação nas discussões e nas hipóteses da abertura.',
      'Identificação correta das estruturas no modelo 3D.',
      'Respostas da atividade, com atenção às explicações escritas.',
      ...lesson.questions.slice(0, 2).map((q) => `Pergunta de verificação: ${q.q}`),
    ],
    misconceptions: lesson.misconceptions.map((m) => (m.right ? `“${m.wrong}” — ${m.right}` : m.wrong)),
    inclusion: [
      'Use o Modo Apresentação com letras grandes e descreva em voz alta o que aparece no modelo 3D.',
      'Ofereça a versão em desenho da atividade para quem precisar de material com alto contraste.',
      'Forme duplas para que alunos com mais facilidade ajudem os colegas na manipulação do modelo.',
    ],
    refs: lesson.refs.map((r) => `${r.title}. ${r.publisher}. Licença ${r.license}. Disponível em: ${r.url}`),
  };
}

export interface EmergencyLesson {
  title: string;
  grade: string;
  minutes: number;
  materials: string[];
  steps: PlanStep[];
  board: { heading: string; items: string[] }[];
  reading: { heading: string; text: string }[];
  questions: { q: string; a: string }[];
  withProjector: string[];
}

/**
 * Ready to apply without preparation (e.g. a substitute teacher): needs only
 * the board and this sheet; the 3D laboratory is optional.
 */
export function buildEmergency(pack: StudioPack): EmergencyLesson {
  const { lesson, lab, sections } = pack;
  const m = splitMinutes(lesson.minutes, [1, 2.2, 2, 3, 1.6]);
  const firstQ = lesson.questions[0]?.q;
  return {
    title: lesson.title,
    grade: lesson.grade,
    minutes: lesson.minutes,
    materials: ['Quadro e pincel/giz', 'Esta folha (texto de apoio e questões)', 'Caderno dos alunos'],
    steps: [
      { minutes: m[0], title: 'Começo', text: `Escreva no quadro o tema “${lesson.title}”${firstQ ? ` e a pergunta: “${firstQ}”. Ouça duas ou três respostas.` : '.'}` },
      { minutes: m[1], title: 'Leitura', text: 'Leia o texto de apoio com a turma, em voz alta, parando ao fim de cada parte para tirar dúvidas.' },
      { minutes: m[2], title: 'Esquema no quadro', text: 'Copie no quadro o esquema abaixo. Os alunos copiam no caderno.' },
      { minutes: m[3], title: 'Questões', text: 'Os alunos respondem as questões no caderno, em dupla ou individualmente.' },
      { minutes: m[4], title: 'Correção', text: 'Corrija oralmente usando as respostas esperadas (só para o professor).' },
    ],
    board: sections.map((s) => ({ heading: s.heading, items: (s.bullets.length ? s.bullets : [brief(s.text, 120)]).slice(0, 3).map((b) => clip(b, 110)) })),
    reading: sections.map((s) => ({ heading: s.heading, text: brief(s.text, 420) })),
    questions: lesson.questions.slice(0, 5),
    withProjector: [
      `Abra o BioLab 3D, laboratório ${lab.title}, e use o botão “Aulas” para seguir o roteiro “${lesson.title}”.`,
      ...[...new Set(sections.flatMap((s) => s.figures.map((f) => f.label)))].slice(0, 6).map((l) => `Mostre: ${l}`),
    ],
  };
}
