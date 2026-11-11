'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LabCanvas } from '@/components/3d/LabCanvas';
import { SceneSync } from '@/components/3d/SceneSync';
import { SelectionLabel } from '@/components/3d/SelectionLabel';
import { LayersPanel } from '@/components/laboratory/LayersPanel';
import { ScientificPanel } from '@/components/laboratory/ScientificPanel';
import { SearchBox, type SearchBoxHandle } from '@/components/laboratory/SearchBox';
import { QualityMenu } from '@/components/laboratory/QualityMenu';
import { ViewerToolbar, type ViewButton } from '@/components/laboratory/ViewerToolbar';
import { ShortcutsHelp } from '@/components/presentation/ShortcutsHelp';
import { useFullscreen } from '@/components/presentation/useFullscreen';
import { Icon } from '@/components/ui/Icon';
import { Logo } from '@/components/ui/Logo';
import { useViewer } from '@/engine/store';
import { meshRegistry } from '@/engine/selection/registry';
import { MaterialLibrary } from '@/engine/visibility/materials';
import { isWebGLAvailable, loadSavedQuality, pickDefaultQuality, readDeviceSignals } from '@/engine/performance/quality';
import type { CatalogGroup } from '@/engine/types';
import type { Structure } from '@/data/biology/schema';
import { CELL_CONTENT } from '@/data/biology/cells/content';
import { CELL_MODELS, CELL_REPRESENTATION, cellModel, cellStructure, modelsShowing, searchCells, type CellModelId } from './catalog';
import { CELL_FALLBACK, CELL_MATERIALS, DEFAULT_OPACITY, LEGEND_COLOR } from './materials';
import { buildCellModel, type BuiltModel, type MeshDef } from './models';
import { buildMitosis, MITOSIS_PRESET, type MitosisModel } from './mitosis';
import { CellModelView } from './CellModelView';
import { MitosisView } from './MitosisView';
import { ProcessDriver, ProcessLayer } from './ProcessLayer';
import { ProcessPlayer } from './ProcessPlayer';
import { CELL_PROCESSES, useProcess } from './processes';

const THEME_KEY = 'biolab.labTheme';

const VIEWS: ViewButton[] = [
  { id: 'frente', label: 'Frente', key: '1' },
  { id: 'costas', label: 'Trás', key: '2' },
  { id: 'direita', label: 'Lado', key: '3' },
  { id: 'cima', label: 'Cima', key: '4' },
];

const SHORTCUTS: [string, string][] = [
  ['P', 'Entrar / sair do Modo Apresentação'],
  ['H', 'Ocultar / mostrar a interface'],
  ['R', 'Reiniciar a câmera'],
  ['1 – 4', 'Vistas: frente, trás, lado, cima'],
  ['F', 'Focar a estrutura selecionada'],
  ['I', 'Isolar a estrutura selecionada'],
  ['X', 'Ocultar a estrutura selecionada'],
  ['A', 'Mostrar tudo novamente'],
  ['L', 'Mostrar / ocultar rótulos'],
  ['Espaço', 'Reproduzir / pausar a animação'],
  ['+ / −', 'Aproximar / afastar'],
  ['/', 'Buscar estrutura'],
  ['Esc', 'Desmarcar seleção / sair'],
];

type Scene = { kind: 'static'; built: BuiltModel; meshes: MeshDef[] } | { kind: 'mitose'; mitosis: MitosisModel; meshes: MeshDef[] };

function buildScene(id: CellModelId): Scene {
  if (id === 'mitose') {
    const mitosis = buildMitosis();
    return { kind: 'mitose', mitosis, meshes: mitosis.meshes };
  }
  const built = buildCellModel(id);
  return { kind: 'static', built, meshes: built.meshes };
}

const groupName = (id: string) => (id === 'nucleo' ? 'Núcleo (nucleoplasma)' : CELL_CONTENT[id]?.name ?? id);

export function CellLab({ canUseStudio, tierLabel }: { canUseStudio: boolean; tierLabel: string }) {
  const [modelId, setModelId] = useState<CellModelId>('animal');
  const [webgl, setWebgl] = useState(true);
  const [dark, setDark] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [sideOpen, setSideOpen] = useState(false);
  const [focusMesh, setFocusMesh] = useState<string | null>(null);
  const pending = useRef<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<SearchBoxHandle>(null);
  const fs = useFullscreen(rootRef);
  const s = useViewer();
  const processId = useProcess((p) => p.id);

  const library = useMemo(() => new MaterialLibrary(CELL_MATERIALS, CELL_FALLBACK), []);
  useEffect(() => () => library.dispose(), [library]);

  const info = cellModel(modelId)!;
  const scene = useMemo(() => buildScene(modelId), [modelId]);
  const preset = scene.kind === 'mitose' ? MITOSIS_PRESET : scene.built.preset;

  const groups: CatalogGroup[] = useMemo(
    () =>
      info.structures.map((id, order) => ({
        id,
        name: groupName(id),
        modelId,
        color: LEGEND_COLOR[id] ?? CELL_MATERIALS[id]?.color ?? '#94A3B8',
        defaultVisible: true,
        defaultOpacity: DEFAULT_OPACITY[id] ?? 1,
        order,
      })),
    [info, modelId],
  );

  // mesh ids per structure (own meshes + those of child structures)
  const meshIndex = useMemo(() => {
    const own = new Map<string, string[]>();
    for (const m of scene.meshes) own.set(m.structure, [...(own.get(m.structure) ?? []), m.id]);
    return own;
  }, [scene]);
  const meshesOf = useCallback(
    (id: string): string[] => {
      const out = [...(meshIndex.get(id) ?? [])];
      for (const [sid, ids] of meshIndex) if (sid !== id && CELL_CONTENT[sid]?.parent === id) out.push(...ids);
      return out;
    },
    [meshIndex],
  );
  const structureOfMesh = useMemo(() => new Map(scene.meshes.map((m) => [m.id, m.structure])), [scene]);

  // ---- bootstrap
  useEffect(() => {
    const w = window as unknown as { __biolab?: Record<string, unknown> };
    w.__biolab = { ...(w.__biolab ?? {}), registry: meshRegistry, viewer: useViewer, process: useProcess };
    setWebgl(isWebGLAvailable());
    try {
      setDark(localStorage.getItem(THEME_KEY) === 'dark');
    } catch {}
    useViewer.getState().setQuality(loadSavedQuality() ?? pickDefaultQuality(readDeviceSignals()));
    const q = new URLSearchParams(location.search).get('modelo');
    if (q && cellModel(q)) setModelId(q as CellModelId);
    return () => {
      useViewer.getState().setPresentation(false);
      useProcess.getState().stop();
    };
  }, []);

  // ---- model switch: reset layers, keep or stop the running process
  useEffect(() => {
    useViewer.getState().init(groups.map((g) => ({ id: g.id, visible: g.defaultVisible, opacity: g.defaultOpacity })));
    useViewer.setState({ modelState: {} });
    setFocusMesh(null);
    const proc = useProcess.getState();
    if (modelId === 'mitose') proc.start('mitose', false);
    else if (proc.id && !info.processes.includes(proc.id)) proc.stop();
    if (pending.current) {
      const id = pending.current;
      pending.current = null;
      setTimeout(() => selectStructureRef.current(id), 120);
    }
  }, [groups, modelId, info]);

  const switchModel = useCallback((id: CellModelId) => {
    useViewer.getState().select(null);
    useViewer.getState().isolate(null);
    setModelId(id);
  }, []);

  const selectStructure = useCallback(
    (id: string, focusOn?: string) => {
      const meshes = meshesOf(id);
      if (!meshes.length) {
        const target = modelsShowing(id)[0];
        if (target && target.id !== modelId) {
          pending.current = id;
          switchModel(target.id);
        }
        return;
      }
      const st = useViewer.getState();
      const groupsOf = new Set(meshes.map((m) => structureOfMesh.get(m)!));
      groupsOf.forEach((g) => !st.groupVisible[g] && st.setGroupVisible(g, true));
      if (st.isolatedMeshIds && !meshes.every((m) => st.isolatedMeshIds!.includes(m))) st.isolate(null);
      st.select(id);
      setPanelOpen(true);
      const focus = focusOn ? [focusOn] : meshes.length > 3 ? [meshes[0]] : meshes;
      setFocusMesh(focusOn ?? (meshes.length > 3 ? meshes[0] : null));
      setTimeout(() => useViewer.getState().command({ type: 'focus', meshIds: focus }), 40);
    },
    [meshesOf, modelId, structureOfMesh, switchModel],
  );
  const selectStructureRef = useRef(selectStructure);
  selectStructureRef.current = selectStructure;

  const onPick = useCallback(
    (meshId: string) => {
      const sid = structureOfMesh.get(meshId);
      if (!sid) return;
      const st = useViewer.getState();
      st.select(sid);
      setPanelOpen(true);
      setFocusMesh(meshId);
      st.command({ type: 'focus', meshIds: [meshId] });
    },
    [structureOfMesh],
  );

  const togglePresentation = useCallback(() => {
    const on = !useViewer.getState().presentation;
    useViewer.getState().setPresentation(on);
    if (on) void fs.enter();
    else void fs.exit();
  }, [fs]);
  const wasFs = useRef(false);
  useEffect(() => {
    if (wasFs.current && !fs.active && useViewer.getState().presentation) useViewer.getState().setPresentation(false);
    wasFs.current = fs.active;
  }, [fs.active]);

  // ---- keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable || e.metaKey || e.ctrlKey || e.altKey) return;
      const st = useViewer.getState();
      const sel = st.selectedId ? meshesOf(st.selectedId) : [];
      const views = ['frente', 'costas', 'direita', 'cima'] as const;
      switch (e.key) {
        case 'p':
        case 'P':
          togglePresentation();
          break;
        case 'h':
        case 'H':
          st.toggleUi();
          break;
        case 'r':
        case 'R':
          st.command({ type: 'reset' });
          break;
        case '1':
        case '2':
        case '3':
        case '4':
          st.command({ type: 'view', view: views[Number(e.key) - 1] });
          break;
        case 'f':
        case 'F':
          if (sel.length) st.command({ type: 'focus', meshIds: sel });
          break;
        case 'i':
        case 'I':
          if (sel.length) st.isolate(st.isolatedMeshIds ? null : sel);
          break;
        case 'x':
        case 'X':
        case 'Delete':
          if (sel.length) {
            st.hideMeshes(sel);
            st.select(null);
          }
          break;
        case 'a':
        case 'A':
          st.showAll();
          break;
        case 'l':
        case 'L':
          st.setLabels(!st.labels);
          break;
        case ' ': {
          const p = useProcess.getState();
          if (!p.id) return;
          e.preventDefault();
          p.setPlaying(!p.playing);
          break;
        }
        case '+':
        case '=':
          st.command({ type: 'zoom', factor: 1.25 });
          break;
        case '-':
          st.command({ type: 'zoom', factor: 0.8 });
          break;
        case '/':
          e.preventDefault();
          searchRef.current?.focus();
          break;
        case '?':
          setShowHelp((v) => !v);
          break;
        case 'Escape':
          if (st.uiHidden) st.toggleUi();
          else st.select(null);
          break;
        default:
          return;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [meshesOf, togglePresentation]);

  const search = useCallback((q: string) => searchCells(q, modelId), [modelId]);
  const getStructure = useCallback((id: string) => cellStructure(id, modelId), [modelId]);

  const selected: Structure | undefined = useMemo(() => {
    if (!s.selectedId) return undefined;
    const base = cellStructure(s.selectedId, modelId);
    return base ? { ...base, modelMeshIds: meshesOf(s.selectedId) } : undefined;
  }, [s.selectedId, modelId, meshesOf]);
  const hoveredName = s.hoveredMeshId ? groupName(structureOfMesh.get(s.hoveredMeshId) ?? '') : null;

  if (!webgl) {
    return (
      <div className="grid min-h-dvh place-items-center p-6 text-center">
        <div className="panel max-w-md p-8">
          <h1 className="text-xl font-bold">Este navegador não conseguiu iniciar o 3D</h1>
          <p className="mt-3 text-fg-muted">O BioLab 3D precisa de WebGL. Atualize o navegador (Chrome, Edge ou Firefox recentes) ou ative a aceleração por hardware nas configurações.</p>
          <Link href="/explorar" className="btn btn-ghost mt-6">
            Voltar aos laboratórios
          </Link>
        </div>
      </div>
    );
  }

  const pres = s.presentation;
  const hideUi = s.uiHidden;
  const showRight = !hideUi && panelOpen && !!selected;
  const toggleTheme = () =>
    setDark((d) => {
      try {
        localStorage.setItem(THEME_KEY, d ? 'light' : 'dark');
      } catch {}
      return !d;
    });

  const detailModel = selected ? CELL_MODELS.find((m) => m.detailOf === selected.id && m.id !== modelId) : undefined;
  const relatedProcesses = selected ? info.processes.filter((p) => CELL_PROCESSES[p].structures.includes(selected.id) || CELL_PROCESSES[p].structures.includes(selected.parentStructureId ?? '')) : [];
  const parentCell = info.detailOf ? CELL_MODELS.find((m) => m.kind === 'celula' && m.structures.includes(info.detailOf!)) : undefined;
  const labelMeshes = selected ? (focusMesh && selected.modelMeshIds.includes(focusMesh) ? [focusMesh] : selected.modelMeshIds) : [];
  const fact = selected ? CELL_CONTENT[selected.id]?.size : undefined;

  return (
    <div ref={rootRef} data-presentation={pres} className={`${dark ? 'theme-dark-lab' : 'theme-light'} relative h-dvh overflow-hidden text-fg`}>
      <div className="lab-backdrop absolute inset-0" aria-hidden="true" />

      <main className="absolute inset-0" aria-label="Visualização 3D da célula">
        <LabCanvas dark={dark} cameraPreset={preset} onPointerMissed={() => useViewer.getState().select(null)}>
          {scene.kind === 'mitose' ? (
            <MitosisView key="mitose" model={scene.mitosis} library={library} hover={!pres && s.quality !== 'economico'} onPick={onPick} />
          ) : (
            <CellModelView key={modelId} modelId={modelId} meshes={scene.meshes} library={library} hover={!pres && s.quality !== 'economico'} onPick={onPick} />
          )}
          <SceneSync library={library} meshesOf={meshesOf} />
          <ProcessDriver />
          {scene.kind === 'static' && <ProcessLayer key={`proc-${modelId}`} anchors={scene.built.anchors} />}
          {s.labels && selected && labelMeshes.length > 0 && <SelectionLabel text={selected.namePtBR} meshIds={labelMeshes} />}
        </LabCanvas>
      </main>

      {/* ---------- top bar */}
      {!hideUi && (
        <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start gap-3 p-3 sm:p-4">
          <div className="float-card pointer-events-auto flex items-center gap-3 py-2 pr-4 pl-2">
            {!pres && (
              <Link href="/explorar" className="grid h-9 w-9 place-items-center rounded-full text-fg-muted hover:bg-ink-800 hover:text-fg" aria-label="Voltar aos laboratórios">
                <Icon name="chevronLeft" size={18} />
              </Link>
            )}
            <Logo size={26} withText={false} />
            <div className="min-w-0 leading-tight">
              <h1 className={`truncate font-[family-name:var(--font-display)] font-bold ${pres ? 'text-xl' : 'text-[15px]'}`}>Células</h1>
              <p className="text-[11px] text-fg-subtle">Citologia</p>
            </div>
          </div>

          {!pres && (
            <div className="pointer-events-auto mx-auto hidden md:block">
              <SearchBox
                ref={searchRef}
                search={search}
                onPick={(st) => selectStructure(st.id)}
                compact
                placeholder="Buscar estrutura (ex.: mitocôndria)"
                label="Buscar estrutura celular"
              />
            </div>
          )}

          <div className="pointer-events-auto ml-auto flex items-center gap-2">
            {!pres && (
              <button type="button" className="btn btn-ghost h-10 rounded-full lg:hidden" onClick={() => setSideOpen((v) => !v)} aria-expanded={sideOpen}>
                <Icon name="layers" size={16} /> Modelos
              </button>
            )}
            <button type="button" className="icon-btn rounded-full" onClick={toggleTheme} aria-label={dark ? 'Fundo claro' : 'Fundo escuro'} title={dark ? 'Fundo claro' : 'Fundo escuro'}>
              <Icon name={dark ? 'sun' : 'moon'} size={17} />
            </button>
            <QualityMenu />
            <button type="button" className="icon-btn hidden rounded-full sm:inline-grid" onClick={() => setShowHelp(true)} aria-label="Atalhos de teclado" title="Atalhos (?)">
              <Icon name="keyboard" />
            </button>
            {pres && (
              <button type="button" className="btn btn-ghost h-10 rounded-full" onClick={() => useViewer.getState().toggleUi()} title="Ocultar interface (H)">
                <Icon name="eyeOff" size={16} /> Ocultar interface
              </button>
            )}
            <button type="button" className={`btn h-10 rounded-full ${pres ? 'btn-ghost' : 'btn-primary'}`} onClick={togglePresentation} data-testid="presentation-toggle">
              <Icon name={pres ? 'minimize' : 'present'} size={16} />
              <span className="hidden sm:inline">{pres ? 'Sair da apresentação' : 'Modo Apresentação'}</span>
            </button>
          </div>
        </header>
      )}

      {/* ---------- left: models, structures, processes */}
      {!hideUi && (
        <aside className={`float-card absolute top-20 left-3 z-20 flex max-h-[calc(100%-11rem)] w-[264px] flex-col sm:left-4 ${sideOpen || pres ? '' : 'max-lg:hidden'}`} aria-label="Modelos e estruturas" data-testid="cell-sidebar">
          <div className="border-b border-line p-3">
            <p className="eyebrow mb-2 px-1">Modelo</p>
            <div className="grid grid-cols-3 gap-1" role="radiogroup" aria-label="Tipo de célula">
              {CELL_MODELS.filter((m) => m.kind === 'celula').map((m) => (
                <button
                  key={m.id}
                  type="button"
                  role="radio"
                  aria-checked={modelId === m.id}
                  onClick={() => switchModel(m.id)}
                  className={`rounded-lg px-1.5 py-2 text-[12px] font-semibold ${modelId === m.id ? 'bg-fg text-ink-900' : 'text-fg-muted hover:bg-ink-800 hover:text-fg'}`}
                >
                  {m.short}
                </button>
              ))}
            </div>
            <div className="mt-1 grid grid-cols-3 gap-1" role="radiogroup" aria-label="Modelos detalhados e processos">
              {CELL_MODELS.filter((m) => m.kind !== 'celula').map((m) => (
                <button
                  key={m.id}
                  type="button"
                  role="radio"
                  aria-checked={modelId === m.id}
                  onClick={() => switchModel(m.id)}
                  className={`rounded-lg px-1.5 py-1.5 text-[11px] font-medium ${modelId === m.id ? 'bg-fg text-ink-900' : 'text-fg-subtle hover:bg-ink-800 hover:text-fg'}`}
                >
                  {m.short}
                </button>
              ))}
            </div>
            <div className="mt-3 px-1">
              <p className={`font-semibold ${pres ? 'text-lg' : 'text-[14px]'}`} data-testid="cell-model-title">
                {info.label}
              </p>
              <p className="mt-0.5 text-[12px] leading-snug text-fg-muted">{info.summary}</p>
              <p className="mt-2 flex items-start gap-1.5 rounded-md bg-ink-800 px-2 py-1.5 text-[11px] leading-snug text-fg-muted" data-testid="scale-note">
                <Icon name="info" size={13} className="mt-px shrink-0" />
                <span>
                  {CELL_REPRESENTATION}. Tamanho real: {info.realSize}.
                </span>
              </p>
              {parentCell && (
                <button type="button" className="mt-2 flex items-center gap-1 text-[12px] font-semibold text-cyan hover:underline" onClick={() => switchModel(parentCell.id)}>
                  <Icon name="chevronLeft" size={14} /> Voltar à {parentCell.label.toLowerCase()}
                </button>
              )}
            </div>
          </div>
          {!pres && (
            <div className="scroll-thin min-h-0 flex-1 overflow-y-auto p-2" data-testid="layers-panel">
              <p className="eyebrow px-1.5 pt-1 pb-2">Estruturas</p>
              <LayersPanel groups={groups} models={[]} ariaLabel="Estruturas da célula" />
            </div>
          )}
          {info.processes.length > 0 && (
            <div className="border-t border-line p-3">
              <p className="eyebrow mb-2 px-1">Processos animados</p>
              <ul className="space-y-1">
                {info.processes.map((pid) => {
                  const active = processId === pid;
                  return (
                    <li key={pid}>
                      <button
                        type="button"
                        className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] ${active ? 'bg-cyan-soft font-semibold text-cyan' : 'hover:bg-ink-800'}`}
                        onClick={() => (active ? useProcess.getState().stop() : useProcess.getState().start(pid))}
                        aria-pressed={active}
                      >
                        <Icon name={active ? 'pause' : 'play'} size={14} /> {CELL_PROCESSES[pid].title}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </aside>
      )}

      {!hideUi && (
        <div className="pointer-events-none absolute top-24 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2">
          {hoveredName && !pres && <span className="chip text-fg">{hoveredName}</span>}
        </div>
      )}
      {!hideUi && !selected && !processId && (
        <p className={`pointer-events-none absolute inset-x-0 top-[68px] z-10 mx-auto hidden w-fit max-w-[90%] text-center text-fg-subtle md:block ${pres ? 'text-base' : 'text-xs'}`}>
          Arraste para girar · role para aproximar · clique em uma organela
        </p>
      )}

      {!hideUi && processId && <ProcessPlayer large={pres} docked={!showRight} />}
      {!hideUi && <ViewerToolbar views={VIEWS} />}

      {/* ---------- scientific panel */}
      {showRight && selected && (
        <aside className={`float-card absolute z-20 overflow-hidden max-lg:inset-x-2 max-lg:bottom-2 max-lg:h-[55%] lg:top-20 lg:right-4 lg:bottom-20 ${pres ? 'lg:w-[440px]' : 'lg:w-[380px]'}`}>
          <ScientificPanel
            structure={selected}
            getStructure={getStructure}
            systemNote={null}
            canUseStudio={canUseStudio}
            onSelect={(id) => selectStructure(id)}
            onClose={() => {
              setPanelOpen(false);
              useViewer.getState().select(null);
            }}
            representation={CELL_REPRESENTATION}
            educational={CELL_CONTENT[selected.id]?.educational ?? null}
            facts={fact ? [{ label: 'Tamanho real', value: fact }] : undefined}
            extra={
              detailModel || relatedProcesses.length ? (
                <div className="flex flex-wrap gap-2">
                  {detailModel && (
                    <button type="button" className="btn btn-ghost h-9 px-3 text-[13px]" onClick={() => switchModel(detailModel.id)} data-testid="open-detail">
                      <Icon name="zoomIn" size={15} /> Abrir modelo detalhado
                    </button>
                  )}
                  {relatedProcesses.map((pid) => (
                    <button key={pid} type="button" className="btn btn-ghost h-9 px-3 text-[13px]" onClick={() => useProcess.getState().start(pid)}>
                      <Icon name="play" size={14} /> {CELL_PROCESSES[pid].title}
                    </button>
                  ))}
                </div>
              ) : null
            }
          />
        </aside>
      )}

      {hideUi && (
        <button type="button" className="btn btn-ghost absolute top-4 right-4 z-30 rounded-full opacity-40 hover:opacity-100" onClick={() => useViewer.getState().toggleUi()}>
          <Icon name="eye" size={16} /> Mostrar interface (H)
        </button>
      )}
      {hideUi && s.labels && selected && (
        <div className="float-card pointer-events-none absolute bottom-6 left-6 px-5 py-3">
          <p className="eyebrow">{selected.category}</p>
          <p className="text-3xl font-bold">{selected.namePtBR}</p>
        </div>
      )}
      {!hideUi && !pres && (
        <footer className="pointer-events-auto absolute right-4 bottom-1.5 z-10 hidden max-w-[60%] truncate text-right text-[10px] text-fg-subtle lg:block">
          Modelos 3D esquemáticos criados pelo BioLab 3D · textos baseados em OpenStax Biology 2e (CC BY 4.0) ·{' '}
          <Link href="/creditos" className="underline hover:text-fg">
            Créditos
          </Link>{' '}
          · {tierLabel}
        </footer>
      )}
      {showHelp && <ShortcutsHelp onClose={() => setShowHelp(false)} items={SHORTCUTS} />}
    </div>
  );
}
