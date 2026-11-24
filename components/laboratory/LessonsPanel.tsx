'use client';

import { useMemo, useState } from 'react';
import { LESSON_REFS, type Lesson, type LessonAction } from '@/data/biology/lessons';
import { Icon } from '@/components/ui/Icon';

interface Props {
  lessons: Lesson[];
  lessonId: string | null;
  onLesson: (id: string | null) => void;
  /** Runs a lesson action in the 3D scene (select, start process, switch model...). */
  onAction: (action: LessonAction) => void;
  onClose: () => void;
  /** Name of the structure currently selected in the scene, with a way to open its scientific panel. */
  selectedName?: string | null;
  onOpenSelected?: () => void;
  /** Bigger type for the presentation mode. */
  large?: boolean;
  /** Which process is running, to mark its buttons. */
  activeProcess?: string | null;
}

function actionIcon(a: LessonAction) {
  if (a.process) return 'play' as const;
  if (a.model) return 'layers' as const;
  if (a.group) return 'eye' as const;
  if (a.tool) return 'grid' as const;
  return 'focus' as const;
}

/** Classroom scripts: a list of lessons, then one lesson with sections whose buttons drive the 3D scene. */
export function LessonsPanel({ lessons, lessonId, onLesson, onAction, onClose, selectedName, onOpenSelected, large, activeProcess }: Props) {
  const lesson = lessons.find((l) => l.id === lessonId) ?? null;
  const units = useMemo(() => {
    const map = new Map<string, Lesson[]>();
    for (const l of lessons) map.set(l.unit, [...(map.get(l.unit) ?? []), l]);
    return [...map.entries()];
  }, [lessons]);
  const [openAnswers, setOpenAnswers] = useState<Record<number, boolean>>({});
  const body = large ? 'text-[17px] leading-relaxed' : 'text-[14px] leading-relaxed';

  return (
    <section className="flex h-full flex-col" aria-labelledby="lessons-title" data-testid="lessons-panel">
      <header className="border-b border-line px-5 pt-5 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="eyebrow mb-1.5">{lesson ? lesson.unit : 'Roteiros de aula'}</p>
            <h2 id="lessons-title" className={`font-[family-name:var(--font-display)] leading-tight font-bold ${large ? 'text-2xl' : 'text-xl'}`}>
              {lesson ? lesson.title : 'Aulas prontas'}
            </h2>
            {lesson && (
              <p className="mt-1 text-xs text-fg-muted">
                {lesson.grade} · {lesson.minutes} min · {lesson.sections.length} partes
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {lesson && (
              <button type="button" className="icon-btn" onClick={() => onLesson(null)} aria-label="Voltar à lista de aulas" title="Todas as aulas">
                <Icon name="chevronLeft" size={16} />
              </button>
            )}
            <button type="button" className="icon-btn" onClick={onClose} aria-label="Fechar aulas">
              <Icon name="close" size={16} />
            </button>
          </div>
        </div>
        {!lesson && <p className="mt-2 text-sm text-fg-muted">Roteiros dos principais conteúdos do ensino médio. Cada botão de um roteiro mostra a estrutura ou a animação no 3D.</p>}
        {selectedName && onOpenSelected && (
          <button type="button" className="mt-3 flex w-full items-center justify-between gap-2 rounded-lg border border-line px-3 py-2 text-left text-sm hover:bg-white/[0.05]" onClick={onOpenSelected}>
            <span className="truncate">
              <span className="text-fg-subtle">Selecionado: </span>
              {selectedName}
            </span>
            <span className="shrink-0 text-xs text-cyan">Abrir ficha</span>
          </button>
        )}
      </header>

      <div className="scroll-thin flex-1 overflow-y-auto px-5 py-4">
        {!lesson && (
          <div className="space-y-5">
            {units.map(([unit, list]) => (
              <div key={unit}>
                <p className="eyebrow mb-2">{unit}</p>
                <ul className="space-y-1.5">
                  {list.map((l) => (
                    <li key={l.id}>
                      <button type="button" className="w-full rounded-xl border border-line px-3.5 py-3 text-left hover:border-cyan/50 hover:bg-white/[0.04]" onClick={() => onLesson(l.id)} data-testid={`lesson-${l.id}`}>
                        <p className="font-semibold">{l.title}</p>
                        <p className="mt-0.5 text-xs text-fg-muted">
                          {l.grade} · {l.minutes} min
                        </p>
                        <p className="mt-1 line-clamp-2 text-[13px] text-fg-muted">{l.summary}</p>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {lesson && (
          <div className={body}>
            <p className="text-fg-muted">{lesson.summary}</p>

            <h3 className="eyebrow mt-5 mb-2">Objetivos</h3>
            <ul className="list-disc space-y-1 pl-5">
              {lesson.objectives.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>

            {lesson.sections.map((sec, i) => (
              <section key={sec.heading} className="mt-6 border-t border-line pt-4">
                <h3 className={`font-semibold ${large ? 'text-lg' : 'text-[15px]'}`}>
                  <span className="mr-2 text-cyan">{i + 1}.</span>
                  {sec.heading}
                </h3>
                <p className="mt-2 whitespace-pre-line">{sec.text}</p>
                {sec.bullets && (
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-fg-muted">
                    {sec.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                )}
                {sec.actions && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {sec.actions.map((a) => {
                      const running = !!a.process && a.process === activeProcess;
                      return (
                        <button
                          key={a.label}
                          type="button"
                          className={`btn h-8 px-2.5 text-[12.5px] ${running ? 'btn-primary' : 'btn-ghost'}`}
                          onClick={() => onAction(a)}
                          data-testid="lesson-action"
                          data-structure={a.structure}
                          data-process={a.process}
                          data-tool={a.tool}
                          data-model={a.model}
                        >
                          <Icon name={running ? 'pause' : actionIcon(a)} size={13} /> {a.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>
            ))}

            <section className="mt-6 border-t border-line pt-4">
              <h3 className="eyebrow mb-2">Termos-chave</h3>
              <div className="flex flex-wrap gap-1.5">
                {lesson.keyTerms.map((t) => (
                  <span key={t} className="chip">
                    {t}
                  </span>
                ))}
              </div>
            </section>

            <section className="mt-6 border-t border-line pt-4">
              <h3 className="eyebrow mb-2">Perguntas para a turma</h3>
              <ol className="space-y-2">
                {lesson.questions.map((q, i) => (
                  <li key={q.q} className="rounded-lg border border-line px-3 py-2">
                    <button type="button" className="flex w-full items-start justify-between gap-2 text-left" onClick={() => setOpenAnswers((o) => ({ ...o, [i]: !o[i] }))} aria-expanded={!!openAnswers[i]}>
                      <span>
                        <span className="mr-1.5 text-cyan">{i + 1}.</span>
                        {q.q}
                      </span>
                      <Icon name={openAnswers[i] ? 'chevronUp' : 'chevronDown'} size={14} className="mt-1 shrink-0 text-fg-subtle" />
                    </button>
                    {openAnswers[i] && <p className="mt-2 text-fg-muted">{q.a}</p>}
                  </li>
                ))}
              </ol>
            </section>

            {lesson.misconceptions && (
              <section className="mt-6 border-t border-line pt-4">
                <h3 className="eyebrow mb-2">Erros comuns</h3>
                <ul className="list-disc space-y-1 pl-5 text-fg-muted">
                  {lesson.misconceptions.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </section>
            )}

            <section className="mt-6 border-t border-line pt-4 pb-2">
              <h3 className="eyebrow mb-2">Referências</h3>
              <ul className="space-y-1 text-xs text-fg-muted">
                {lesson.refs.map((r) => {
                  const ref = LESSON_REFS[r];
                  if (!ref) return null;
                  return (
                    <li key={r}>
                      <a href={ref.url} target="_blank" rel="noreferrer" className="underline hover:text-fg">
                        {ref.title}
                      </a>{' '}
                      — {ref.publisher}, {ref.license}
                    </li>
                  );
                })}
              </ul>
              <p className="mt-2 text-[11px] text-fg-subtle">Texto original do BioLab 3D, conferido com livros abertos da OpenStax. Revise antes de usar em avaliações.</p>
            </section>
          </div>
        )}
      </div>
    </section>
  );
}
