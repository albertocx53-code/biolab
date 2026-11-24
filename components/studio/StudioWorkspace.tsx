'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { StudioPack } from '@/data/studio/pack';
import type { StudioGeneratorId } from '@/data/studio/contract';
import { buildActivity } from '@/lib/studio/activity';
import { buildMindMap } from '@/lib/studio/mindmap';
import { buildEmergency, buildPlan } from '@/lib/studio/plan';
import { buildSlides, SLIDE_H, SLIDE_W } from '@/lib/studio/slides';
import { Icon } from '@/components/ui/Icon';
import { ActivitySheet } from './ActivitySheet';
import { MindMapView } from './MindMapView';
import { EmergencyDoc, LessonPlanDoc } from './PlanDocs';
import { ScaledSlide, SlideCanvas } from './SlideView';

const STUDIO_TOOLS = [
  { id: 'slides', name: 'Slides', hint: 'Imagens 3D · apresentar ou baixar PowerPoint' },
  { id: 'atividades', name: 'Atividade', hint: 'Desenhos numerados, questões e gabarito' },
  { id: 'mapas-mentais', name: 'Mapa mental', hint: 'Imagens 3D ou desenhos para colorir' },
  { id: 'planos-de-aula', name: 'Plano de aula', hint: 'Tempo, etapas, avaliação' },
  { id: 'aulas-emergenciais', name: 'Aula emergencial', hint: 'Pronta para aplicar, só com o quadro' },
] as const satisfies readonly { id: StudioGeneratorId; name: string; hint: string }[];
type StudioTool = StudioGeneratorId;

const PAGE_STYLE: Record<StudioTool, string> = {
  slides: `@page { size: ${SLIDE_W}px ${SLIDE_H}px; margin: 0 }`,
  atividades: '@page { size: A4; margin: 12mm }',
  'mapas-mentais': '@page { size: A4 landscape; margin: 8mm }',
  'planos-de-aula': '@page { size: A4; margin: 14mm }',
  'aulas-emergenciais': '@page { size: A4; margin: 14mm }',
};

function slug(s: string) {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Word opens HTML saved as .doc: an editable copy of the text documents. */
function downloadWord(el: HTMLElement | null, name: string) {
  if (!el) return;
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${name}</title><style>body{font-family:Calibri,Arial,sans-serif;font-size:11pt}h2{font-size:18pt}h3{font-size:13pt;border-bottom:1px solid #999}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ccc;padding:4px;vertical-align:top;text-align:left}</style></head><body>${el.innerHTML}</body></html>`;
  const blob = new Blob(['﻿', html], { type: 'application/msword' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${name}.doc`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

export function StudioWorkspace({ pack, initialTool }: { pack: StudioPack; initialTool: StudioTool }) {
  const [tool, setTool] = useState<StudioTool>(initialTool);
  const [drawings, setDrawings] = useState(true);
  const [mapDrawings, setMapDrawings] = useState(false);
  const [answerKey, setAnswerKey] = useState(true);
  const [seed, setSeed] = useState(0);
  const [presenting, setPresenting] = useState<number | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const docRef = useRef<HTMLDivElement>(null);
  const accent = pack.lab.accent;
  const base = slug(pack.lesson.title);

  const slides = useMemo(() => buildSlides(pack), [pack]);
  const activity = useMemo(() => buildActivity(pack, { seed, drawings }), [pack, seed, drawings]);
  const mind = useMemo(() => buildMindMap(pack), [pack]);
  const plan = useMemo(() => buildPlan(pack), [pack]);
  const emergency = useMemo(() => buildEmergency(pack), [pack]);

  const choose = (t: StudioTool) => {
    setTool(t);
    const url = new URL(location.href);
    url.searchParams.set('gerador', t);
    history.replaceState(null, '', url);
  };

  const pptx = async () => {
    setBusy('Gerando PowerPoint…');
    try {
      const { exportPptx } = await import('@/lib/studio/pptx');
      await exportPptx(slides, { title: pack.lesson.title, accent, fileName: `${base}-slides.pptx` });
    } catch (e) {
      console.error(e);
      alert('Não foi possível gerar o PowerPoint agora. Tente novamente.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-6">
      <style>{PAGE_STYLE[tool]}</style>
      <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:block lg:space-y-2 lg:overflow-visible lg:px-0 lg:pb-0 print:hidden" aria-label="Geradores">
        {STUDIO_TOOLS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => choose(t.id)}
            className={`panel block shrink-0 px-4 py-2.5 text-left whitespace-nowrap transition-colors lg:w-full lg:p-3.5 lg:whitespace-normal ${tool === t.id ? 'ring-2' : 'opacity-90 hover:opacity-100'}`}
            style={tool === t.id ? ({ '--tw-ring-color': accent } as React.CSSProperties) : undefined}
            aria-pressed={tool === t.id}
            data-testid={`studio-tool-${t.id}`}
          >
            <span className="block font-semibold">{t.name}</span>
            <span className="mt-0.5 hidden text-xs text-fg-muted lg:block">{t.hint}</span>
          </button>
        ))}
      </nav>

      <section className="min-w-0">
        <div className="panel mb-4 flex flex-wrap items-center gap-2 p-3 print:hidden" role="toolbar" aria-label="Ações">
          {tool === 'slides' && (
            <>
              <button type="button" className="btn btn-primary h-10" onClick={() => setPresenting(0)} data-testid="studio-present">
                <Icon name="play" size={16} /> Apresentar
              </button>
              <button type="button" className="btn btn-ghost h-10" onClick={pptx} disabled={!!busy} data-testid="studio-pptx">
                <Icon name="download" size={16} /> Baixar PowerPoint
              </button>
              <span className="ml-auto text-sm text-fg-muted">{slides.length} slides com imagens 3D</span>
            </>
          )}
          {tool === 'atividades' && (
            <>
              <Toggle on={drawings} set={setDrawings} label="Desenhos para colorir" />
              <Toggle on={answerKey} set={setAnswerKey} label="Gabarito no final" />
              <button type="button" className="btn btn-ghost h-10" onClick={() => setSeed((s) => s + 1)} data-testid="studio-new-version">
                <Icon name="reset" size={16} /> Gerar outra versão
              </button>
            </>
          )}
          {tool === 'mapas-mentais' && (
            <>
              <Toggle on={!mapDrawings} set={(v) => setMapDrawings(!v)} label="Imagens 3D coloridas" />
              <Toggle on={mapDrawings} set={setMapDrawings} label="Desenhos para colorir" />
            </>
          )}
          {(tool === 'planos-de-aula' || tool === 'aulas-emergenciais') && (
            <button type="button" className="btn btn-ghost h-10" onClick={() => downloadWord(docRef.current, `${base}-${tool}`)} data-testid="studio-word">
              <Icon name="download" size={16} /> Baixar para Word
            </button>
          )}
          <button type="button" className={`btn h-10 ${tool === 'slides' ? 'btn-ghost' : 'btn-primary ml-auto'}`} onClick={() => window.print()} data-testid="studio-print">
            <Icon name="printer" size={16} /> Imprimir / PDF
          </button>
          {busy && (
            <span role="status" className="text-sm text-fg-muted">
              {busy}
            </span>
          )}
        </div>

        <div className="studio-preview -mx-4 rounded-none bg-slate-200/60 p-2 sm:mx-0 sm:rounded-2xl sm:p-6 print:bg-transparent print:p-0" data-testid="studio-preview">
          {tool === 'slides' && (
            <>
              <ol className="space-y-5 print:hidden">
                {slides.map((s, i) => (
                  <li key={s.id}>
                    <button type="button" className="block w-full overflow-hidden rounded-xl shadow-lg ring-1 ring-slate-300" onClick={() => setPresenting(i)} aria-label={`Apresentar a partir do slide ${i + 1}: ${s.name}`}>
                      <ScaledSlide slide={s} accent={accent} />
                    </button>
                  </li>
                ))}
              </ol>
              <div className="hidden print:block">
                {slides.map((s) => (
                  <div key={s.id} style={{ breakAfter: 'page' }}>
                    <SlideCanvas slide={s} accent={accent} />
                  </div>
                ))}
              </div>
            </>
          )}
          {tool === 'atividades' && <ActivitySheet pack={pack} activity={activity} drawings={drawings} answerKey={answerKey} />}
          {tool === 'mapas-mentais' && (
            <div className="paper paper-wide overflow-x-auto">
              <div className="min-w-[860px] print:min-w-0">
                <MindMapView map={mind} drawings={mapDrawings} />
              </div>
              <p className="mt-2 text-center text-xs text-slate-500 sm:hidden print:hidden">Arraste para o lado para ver o mapa inteiro.</p>
            </div>
          )}
          {tool === 'planos-de-aula' && (
            <div ref={docRef}>
              <LessonPlanDoc plan={plan} accent={accent} />
            </div>
          )}
          {tool === 'aulas-emergenciais' && (
            <div ref={docRef}>
              <EmergencyDoc lesson={emergency} accent={accent} />
            </div>
          )}
        </div>
      </section>

      {presenting !== null && <Presenter slides={slides} accent={accent} start={presenting} onClose={() => setPresenting(null)} />}
    </div>
  );
}

function Toggle({ on, set, label }: { on: boolean; set: (v: boolean) => void; label: string }) {
  return (
    <label className="flex h-10 cursor-pointer items-center gap-2 rounded-lg px-3 text-sm hover:bg-ink-800">
      <input type="checkbox" checked={on} onChange={(e) => set(e.target.checked)} className="h-4 w-4" />
      {label}
    </label>
  );
}

function Presenter({ slides, accent, start, onClose }: { slides: ReturnType<typeof buildSlides>; accent: string; start: number; onClose: () => void }) {
  const [i, setI] = useState(start);
  const ref = useRef<HTMLDivElement>(null);
  const go = useCallback((d: number) => setI((v) => Math.min(slides.length - 1, Math.max(0, v + d))), [slides.length]);
  useEffect(() => {
    ref.current?.requestFullscreen?.().catch(() => {});
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') go(1);
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') go(-1);
      else if (e.key === 'Escape') onClose();
    };
    const onFs = () => {
      if (!document.fullscreenElement) onClose();
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('fullscreenchange', onFs);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('fullscreenchange', onFs);
      if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    };
  }, [go, onClose]);
  return (
    <div ref={ref} className="fixed inset-0 z-50 grid place-items-center bg-black" role="dialog" aria-label="Apresentação" data-testid="studio-presenter">
      <div style={{ width: `min(100vw, calc(100vh * ${SLIDE_W / SLIDE_H}))` }} onClick={() => go(1)}>
        <ScaledSlide slide={slides[i]} accent={accent} />
      </div>
      <div className="absolute right-4 bottom-4 flex items-center gap-2 text-sm text-white/80">
        <button type="button" className="rounded-full bg-white/10 px-3 py-1.5 hover:bg-white/20" onClick={() => go(-1)} aria-label="Slide anterior">
          ‹
        </button>
        <span>
          {i + 1} / {slides.length}
        </span>
        <button type="button" className="rounded-full bg-white/10 px-3 py-1.5 hover:bg-white/20" onClick={() => go(1)} aria-label="Próximo slide">
          ›
        </button>
        <button type="button" className="rounded-full bg-white/10 px-3 py-1.5 hover:bg-white/20" onClick={onClose}>
          Sair (Esc)
        </button>
      </div>
    </div>
  );
}
