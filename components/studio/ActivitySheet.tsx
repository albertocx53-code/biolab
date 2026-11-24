'use client';

import type { Activity } from '@/lib/studio/activity';
import { LETTERS } from '@/lib/studio/util';
import type { StudioPack } from '@/data/studio/pack';
import { DiagramView } from './DiagramView';

const line = 'border-b border-slate-400';

export function ActivitySheet({ pack, activity, drawings, answerKey }: { pack: StudioPack; activity: Activity; drawings: boolean; answerKey: boolean }) {
  const ink = drawings ? '#0f172a' : pack.lab.accent;
  return (
    <div className="paper" data-testid="studio-activity">
      <header className="mb-5 border-b-2 pb-4" style={{ borderColor: ink }}>
        <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-3 text-[13px] sm:gap-x-6">
          <p className="flex gap-2">
            Escola: <span className={`flex-1 ${line}`} />
          </p>
          <p className="flex w-28 gap-2 sm:w-40">
            Data: <span className={`flex-1 ${line}`} />
          </p>
          <p className="flex gap-2">
            Nome: <span className={`flex-1 ${line}`} />
          </p>
          <p className="flex w-28 gap-2 sm:w-40">
            Turma: <span className={`flex-1 ${line}`} />
          </p>
        </div>
        <p className="mt-5 text-[11px] font-bold tracking-[0.12em] uppercase" style={{ color: ink }}>
          Atividade · {pack.lab.title} · {pack.lesson.grade}
        </p>
        <h2 className="mt-1 font-[family-name:var(--font-display)] text-[24px] leading-tight font-bold">{activity.title}</h2>
      </header>

      <ol className="space-y-7">
        {activity.items.map((it, i) => (
          <li key={i} className="avoid-break">
            <p className="mb-3 font-semibold">
              <span className="mr-2 inline-grid h-6 w-6 place-items-center rounded-full text-[13px] text-white" style={{ background: ink }}>
                {i + 1}
              </span>
              {it.title}
            </p>
            {it.kind === 'diagram' && (
              <div>
                <div className="rounded-lg border border-slate-200">
                  <DiagramView src={(drawings && it.diagram.image.line) || it.diagram.image.src} callouts={it.callouts} accent={ink} className="block h-auto w-full" />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-[14px] sm:gap-x-8">
                  {it.callouts.map((c) => (
                    <p key={c.n} className="flex gap-2">
                      <b>{c.n}.</b> <span className={`flex-1 ${line}`} />
                    </p>
                  ))}
                </div>
                <WordBank words={it.bank} />
              </div>
            )}
            {it.kind === 'picture-quiz' && (
              <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 print:grid-cols-2">
                {it.questions.map((q, k) => (
                  <div key={k} className="rounded-lg border border-slate-200 p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={q.image} alt="" className="aspect-[16/10] w-full rounded object-contain" />
                    <p className="mt-2 text-[13px] font-semibold">{String.fromCharCode(97 + k)}) Esta estrutura é:</p>
                    <ul className="mt-1 space-y-1 text-[13px]">
                      {q.options.map((o, j) => (
                        <li key={j}>
                          ( ) {LETTERS[j].toLowerCase()}) {o}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
            {it.kind === 'matching' && (
              <div className="grid gap-4 text-[13.5px] sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.6fr)] sm:gap-6 print:grid-cols-[minmax(0,0.8fr)_minmax(0,1.6fr)]">
                <ol className="space-y-3">
                  {it.left.map((l, k) => (
                    <li key={k} className="font-semibold">
                      {k + 1}. {l}
                    </li>
                  ))}
                </ol>
                <ul className="space-y-3">
                  {it.right.map((r, k) => (
                    <li key={k} className="flex gap-2">
                      <span className="shrink-0">( &nbsp; )</span> {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {it.kind === 'true-false' && (
              <ul className="space-y-3 text-[14px]">
                {it.items.map((t, k) => (
                  <li key={k} className="flex gap-2">
                    <span className="shrink-0">( &nbsp; )</span> {t.text}
                  </li>
                ))}
              </ul>
            )}
            {it.kind === 'fill' && (
              <div>
                <WordBank words={it.bank} />
                <ol className="mt-3 space-y-3 text-[14px]">
                  {it.items.map((f, k) => (
                    <li key={k}>
                      {String.fromCharCode(97 + k)}) {f.before}
                      <span className="inline-block w-36 border-b border-slate-500 align-baseline" />
                      {f.after}
                    </li>
                  ))}
                </ol>
              </div>
            )}
            {it.kind === 'order' && (
              <div className={`grid grid-cols-2 gap-3 ${it.steps.length > 4 ? 'sm:grid-cols-3 print:grid-cols-3' : ''}`}>
                {it.steps.map((s) => (
                  <div key={s.letter} className="relative rounded-lg border border-slate-200 p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.image} alt="" className="aspect-[16/10] w-full rounded object-contain" />
                    <span className="absolute top-2 left-2 grid h-7 w-7 place-items-center rounded-full text-[13px] font-bold text-white" style={{ background: ink }}>
                      {s.letter}
                    </span>
                    <span className="absolute top-2 right-2 grid h-8 w-8 place-items-center rounded-md border-2 border-slate-400 bg-white" />
                  </div>
                ))}
              </div>
            )}
            {it.kind === 'open' && (
              <ol className="space-y-4 text-[14px]">
                {it.items.map((q, k) => (
                  <li key={k}>
                    <p>
                      {String.fromCharCode(97 + k)}) {q.q}
                    </p>
                    <div className="mt-3 space-y-5">
                      <div className={line} />
                      <div className={line} />
                      <div className={line} />
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </li>
        ))}
      </ol>

      {answerKey && (
        <section className="page-break mt-10 border-t-2 border-dashed border-slate-300 pt-6" data-testid="studio-answer-key">
          <h3 className="font-[family-name:var(--font-display)] text-[18px] font-bold">Gabarito (para o professor)</h3>
          <ol className="mt-3 space-y-3 text-[13px]">
            {activity.items.map((it, i) => (
              <li key={i}>
                <b>{i + 1}.</b> <Answer it={it} />
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}

function WordBank({ words }: { words: string[] }) {
  return (
    <div className="mt-3 rounded-lg border border-dashed border-slate-400 px-3 py-2 text-[13px]">
      <b>Banco de palavras:</b> {words.join(' · ')}
    </div>
  );
}

function Answer({ it }: { it: Activity['items'][number] }) {
  switch (it.kind) {
    case 'diagram':
      return <>{it.answers.map((a, k) => `${k + 1}. ${a}`).join('; ')}.</>;
    case 'picture-quiz':
      return <>{it.questions.map((q, k) => `${String.fromCharCode(97 + k)}) ${LETTERS[q.answer].toLowerCase()} (${q.options[q.answer]})`).join('; ')}.</>;
    case 'matching':
      return <>Na ordem da coluna da direita: {it.right.map((_, k) => it.answer.indexOf(k) + 1).join(', ')}.</>;
    case 'true-false':
      return (
        <>
          {it.items.map((t, k) => (
            <span key={k} className="block">
              {k + 1}) {t.value ? 'V' : `F — ${t.fix}`}
            </span>
          ))}
        </>
      );
    case 'fill':
      return <>{it.items.map((f, k) => `${String.fromCharCode(97 + k)}) ${f.answer}`).join('; ')}.</>;
    case 'order':
      return (
        <>
          {it.answer.join(' → ')} ({it.stepTitles.join(' → ')}).
        </>
      );
    case 'open':
      return (
        <>
          {it.items.map((q, k) => (
            <span key={k} className="block">
              {String.fromCharCode(97 + k)}) {q.a}
            </span>
          ))}
        </>
      );
  }
}
