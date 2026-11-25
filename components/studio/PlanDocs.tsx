'use client';

import type { EmergencyLesson, LessonPlan } from '@/lib/studio/plan';

function H({ children }: { children: React.ReactNode }) {
  return <h3 className="mt-6 mb-2 border-b border-slate-300 pb-1 font-[family-name:var(--font-display)] text-[16px] font-bold">{children}</h3>;
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-1 pl-5">
      {items.map((t, i) => (
        <li key={i}>{t}</li>
      ))}
    </ul>
  );
}

export function LessonPlanDoc({ plan, accent }: { plan: LessonPlan; accent: string }) {
  let t = 0;
  return (
    <div className="paper text-[13.5px] leading-relaxed" data-testid="studio-plan">
      <p className="text-[11px] font-bold tracking-[0.12em] uppercase" style={{ color: accent }}>
        Plano de aula
      </p>
      <h2 className="mt-1 font-[family-name:var(--font-display)] text-[24px] leading-tight font-bold">{plan.title}</h2>
      <table className="mt-4 w-full border-collapse text-[13px]">
        <tbody>
          {plan.info.map(([k, v]) => (
            <tr key={k} className="border-b border-slate-200">
              <th className="w-40 py-1.5 pr-3 text-left font-semibold text-slate-600">{k}</th>
              <td className="py-1.5">{v}</td>
            </tr>
          ))}
          <tr className="border-b border-slate-200">
            <th className="py-1.5 pr-3 text-left font-semibold text-slate-600">Professor(a)</th>
            <td className="py-1.5">
              <span className="inline-block w-64 border-b border-slate-400" />
            </td>
          </tr>
        </tbody>
      </table>
      <H>Objetivos</H>
      <List items={plan.objectives} />
      <H>Conteúdos e conceitos</H>
      <p>{plan.contents.join(' · ')}</p>
      <H>Recursos</H>
      <List items={plan.resources} />
      <H>Desenvolvimento</H>
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr className="bg-slate-100 text-left">
            <th className="w-24 p-2">Tempo</th>
            <th className="p-2">Etapa</th>
          </tr>
        </thead>
        <tbody>
          {plan.steps.map((s, i) => {
            const from = t;
            t += s.minutes;
            return (
              <tr key={i} className="avoid-break border-b border-slate-200 align-top">
                <td className="p-2 font-semibold whitespace-nowrap text-slate-600">
                  {from}–{t} min
                </td>
                <td className="p-2">
                  <p className="font-semibold">{s.title}</p>
                  <p className="text-slate-700">{s.text}</p>
                  {!!s.actions?.length && (
                    <p className="mt-1 text-[12px] text-slate-600">
                      <b>No BioLab 3D:</b> {s.actions.join(' · ')}
                    </p>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <H>Avaliação</H>
      <List items={plan.assessment} />
      {!!plan.misconceptions.length && (
        <>
          <H>Ideias erradas que vale a pena discutir</H>
          <List items={plan.misconceptions} />
        </>
      )}
      <H>Inclusão e adaptações</H>
      <List items={plan.inclusion} />
      <H>Referências</H>
      <List items={plan.refs} />
    </div>
  );
}

export function EmergencyDoc({ lesson, accent }: { lesson: EmergencyLesson; accent: string }) {
  let t = 0;
  return (
    <div className="paper text-[13.5px] leading-relaxed" data-testid="studio-emergency">
      <p className="text-[11px] font-bold tracking-[0.12em] uppercase" style={{ color: accent }}>
        Aula emergencial · pronta para aplicar
      </p>
      <h2 className="mt-1 font-[family-name:var(--font-display)] text-[24px] leading-tight font-bold">{lesson.title}</h2>
      <p className="mt-1 text-slate-600">
        {lesson.grade} · {lesson.minutes} minutos · Material: {lesson.materials.join(', ')}.
      </p>
      <H>Roteiro rápido</H>
      <ol className="space-y-2">
        {lesson.steps.map((s, i) => {
          const from = t;
          t += s.minutes;
          return (
            <li key={i} className="flex gap-3">
              <span className="w-20 shrink-0 font-semibold text-slate-600">
                {from}–{t} min
              </span>
              <span>
                <b>{s.title}.</b> {s.text}
              </span>
            </li>
          );
        })}
      </ol>
      <H>Texto de apoio (ler com a turma)</H>
      {lesson.reading.map((r, i) => (
        <div key={i} className="avoid-break mb-3">
          <p className="font-semibold">{r.heading}</p>
          <p>{r.text}</p>
        </div>
      ))}
      <H>Esquema para o quadro</H>
      <div className="avoid-break grid grid-cols-2 gap-3 rounded-lg border border-slate-300 p-3">
        {lesson.board.map((b, i) => (
          <div key={i}>
            <p className="font-semibold">{b.heading}</p>
            <List items={b.items} />
          </div>
        ))}
      </div>
      <H>Questões para os alunos</H>
      <ol className="list-decimal space-y-1 pl-5">
        {lesson.questions.map((q, i) => (
          <li key={i}>{q.q}</li>
        ))}
      </ol>
      <div className="avoid-break mt-5 rounded-lg bg-slate-100 p-3">
        <p className="font-semibold">Respostas esperadas (só para o professor)</p>
        <ol className="mt-1 list-decimal space-y-1 pl-5 text-[13px]">
          {lesson.questions.map((q, i) => (
            <li key={i}>{q.a}</li>
          ))}
        </ol>
      </div>
      <H>Se houver projetor ou TV</H>
      <List items={lesson.withProjector} />
    </div>
  );
}
