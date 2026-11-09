'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type * as THREE from 'three';
import { LabCanvas } from '@/components/3d/LabCanvas';
import { GltfModel } from '@/components/3d/GltfModel';
import { ModelSlot } from '@/components/3d/ModelSlot';
import { SceneSync } from '@/components/3d/SceneSync';
import { SelectionLabel } from '@/components/3d/SelectionLabel';
import type { CameraPreset } from '@/components/3d/CameraRig';
import { LayersPanel } from '@/components/laboratory/LayersPanel';
import { ScientificPanel } from '@/components/laboratory/ScientificPanel';
import { RegionPanel, type RegionLayer } from '@/components/laboratory/RegionPanel';
import { SearchBox, type SearchBoxHandle } from '@/components/laboratory/SearchBox';
import { QualityMenu } from '@/components/laboratory/QualityMenu';
import { ViewerToolbar } from '@/components/laboratory/ViewerToolbar';
import { ShortcutsHelp } from '@/components/presentation/ShortcutsHelp';
import { useFullscreen } from '@/components/presentation/useFullscreen';
import { Icon } from '@/components/ui/Icon';
import { Logo } from '@/components/ui/Logo';
import { useViewer } from '@/engine/store';
import { meshRegistry } from '@/engine/selection/registry';
import { MaterialLibrary } from '@/engine/visibility/materials';
import { isWebGLAvailable, loadSavedQuality, pickDefaultQuality, readDeviceSignals } from '@/engine/performance/quality';
import { HUMAN_CONTENT } from '@/data/biology/human/content';
import { baseId, buildHumanIndex, SYSTEM_NOTE, type HumanIndex, type RawHumanCatalog, type Region } from './catalog';
import { HUMAN_FALLBACK, HUMAN_MATERIALS } from './materials';

const CATALOG_URL = '/models/human/v1/catalog.json';

const PRESET: CameraPreset = { position: [0, 0.95, 3.7], target: [0, 0.9, 0], distance: 3.7, minDistance: 0.08, maxDistance: 9 };

const LAYER_LABEL: Record<string, string> = {
  muscular: 'Músculos',
  fascias: 'Fáscias',
  esqueletico: 'Ossos',
  vasos: 'Vasos',
  nervoso: 'Nervos',
  coracao: 'Coração',
  respiratorio: 'Respiratório',
  digestorio: 'Digestório',
  urinario: 'Urinário',
  reprodutor: 'Reprodutor',
  endocrino: 'Endócrino',
  linfatico: 'Linfático',
};
const LAYER_ORDER = ['muscular', 'fascias', 'esqueletico', 'vasos', 'nervoso', 'coracao', 'respiratorio', 'digestorio', 'urinario', 'reprodutor', 'endocrino', 'linfatico'];

const REPRESENTATION = 'Modelo realista (dados anatômicos reais)';

export function HumanLab({ canUseStudio, tierLabel }: { canUseStudio: boolean; tierLabel: string }) {
  const [index, setIndex] = useState<HumanIndex | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [webgl, setWebgl] = useState(true);
  const [requested, setRequested] = useState<string[]>([]);
  const [region, setRegion] = useState<{ region: Region; layer: string | null } | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [layersOpen, setLayersOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<SearchBoxHandle>(null);
  const fs = useFullscreen(rootRef);

  const s = useViewer();
  const library = useMemo(() => new MaterialLibrary(HUMAN_MATERIALS, HUMAN_FALLBACK), []);
  useEffect(() => () => library.dispose(), [library]);

  // ---- bootstrap: WebGL check, quality profile, catalog
  useEffect(() => {
    // Read-only hooks for automated tests and performance measurement (no sensitive data).
    const w = window as unknown as { __biolab?: Record<string, unknown> };
    w.__biolab = { ...(w.__biolab ?? {}), registry: meshRegistry, viewer: useViewer };
    setWebgl(isWebGLAvailable());
    const saved = loadSavedQuality();
    useViewer.getState().setQuality(saved ?? pickDefaultQuality(readDeviceSignals()));
    let cancelled = false;
    const t0 = performance.now();
    fetch(CATALOG_URL)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<RawHumanCatalog>;
      })
      .then((raw) => {
        if (cancelled) return;
        const idx = buildHumanIndex(raw);
        useViewer.getState().init(raw.groups.map((g) => ({ id: g.id, visible: g.defaultVisible, opacity: g.defaultOpacity })));
        setIndex(idx);
        performance.mark?.('biolab:catalog-ready');
        console.info(`[BioLab] catálogo anatômico pronto em ${Math.round(performance.now() - t0)} ms (${raw.meshes.length} malhas)`);
      })
      .catch((e) => !cancelled && setLoadError(String(e)));
    return () => {
      cancelled = true;
      useViewer.getState().setPresentation(false);
    };
  }, []);

  // ---- lazy model loading: a model is requested the first time one of its groups becomes visible
  useEffect(() => {
    if (!index) return;
    const needed = [...new Set(index.raw.groups.filter((g) => s.groupVisible[g.id]).map((g) => g.modelId))];
    setRequested((prev) => {
      const add = needed.filter((m) => !prev.includes(m));
      return add.length ? [...prev, ...add] : prev;
    });
  }, [index, s.groupVisible]);

  const selected = index && s.selectedId ? index.structures.get(s.selectedId) : undefined;
  const meshesOf = useCallback((id: string) => index?.meshesOf(id) ?? [], [index]);
  const getStructure = useCallback((id: string) => index?.structures.get(id), [index]);

  const ensureVisible = useCallback(
    (meshIds: string[]) => {
      if (!index) return;
      const st = useViewer.getState();
      const groups = new Set(meshIds.map((m) => index.meshInfo.get(m)?.group).filter(Boolean) as string[]);
      groups.forEach((g) => !st.groupVisible[g] && st.setGroupVisible(g, true));
      const hidden = meshIds.filter((m) => st.hiddenMeshIds[m]);
      if (hidden.length) useViewer.setState({ hiddenMeshIds: Object.fromEntries(Object.entries(st.hiddenMeshIds).filter(([k]) => !hidden.includes(k))) });
      if (st.isolatedMeshIds && !meshIds.every((m) => st.isolatedMeshIds!.includes(m))) st.isolate(null);
    },
    [index],
  );

  const selectStructure = useCallback(
    (id: string, focus = true) => {
      if (!index) return;
      const meshes = index.meshesOf(id);
      ensureVisible(meshes);
      useViewer.getState().select(id);
      if (focus) {
        // wait one tick so newly-requested models can register before framing
        setTimeout(() => useViewer.getState().command({ type: 'focus', meshIds: meshes }), 60);
      }
    },
    [index, ensureVisible],
  );

  const openRegion = useCallback(
    (r: Region) => {
      if (!index) return;
      setRegion({ region: r, layer: null });
      useViewer.getState().select(null);
      useViewer.getState().isolate(null);
      const meshes = index.meshesInRegion(r.id);
      useViewer.getState().command({ type: 'focus', meshIds: meshes.filter((m) => index.meshInfo.get(m)?.group === 'esqueletico') });
    },
    [index],
  );

  const onPick = useCallback(
    (meshId: string, point: THREE.Vector3) => {
      if (!index) return;
      const info = index.meshInfo.get(meshId);
      if (info?.group === 'tegumentar') {
        const r = index.regionAt([point.x, point.y, point.z]);
        if (r) openRegion(r);
        else {
          setRegion(null);
          useViewer.getState().select('pele');
        }
        return;
      }
      setRegion(null);
      selectStructure(meshId, false);
    },
    [index, openRegion, selectStructure],
  );

  const regionLayers: RegionLayer[] = useMemo(() => {
    if (!index || !region) return [];
    const byGroup = new Map<string, string[]>();
    for (const m of index.meshesInRegion(region.region.id)) {
      const g = index.meshInfo.get(m)!.group;
      byGroup.set(g, [...(byGroup.get(g) ?? []), m]);
    }
    return LAYER_ORDER.filter((g) => byGroup.has(g)).map((g) => ({
      group: g,
      label: LAYER_LABEL[g] ?? g,
      structures: byGroup
        .get(g)!
        .map((id) => index.structures.get(id)!)
        .sort((a, b) => a.namePtBR.localeCompare(b.namePtBR, 'pt-BR')),
    }));
  }, [index, region]);

  const chooseLayer = useCallback(
    (group: string) => {
      if (!index || !region) return;
      const st = useViewer.getState();
      if (!st.groupVisible[group]) st.setGroupVisible(group, true);
      if ((st.groupOpacity.tegumentar ?? 1) > 0.1) st.setGroupOpacity('tegumentar', 0.08);
      const meshes = index.meshesInRegion(region.region.id).filter((m) => index.meshInfo.get(m)?.group === group);
      st.select(null);
      st.isolate(meshes);
      setRegion({ ...region, layer: group });
      setTimeout(() => useViewer.getState().command({ type: 'focus', meshIds: meshes }), 80);
    },
    [index, region],
  );

  const togglePresentation = useCallback(() => {
    const on = !useViewer.getState().presentation;
    useViewer.getState().setPresentation(on);
    if (on) void fs.enter();
    else void fs.exit();
  }, [fs]);

  // leaving browser fullscreen (Esc) also leaves presentation mode
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
          st.command({ type: 'view', view: 'frente' });
          break;
        case '2':
          st.command({ type: 'view', view: 'costas' });
          break;
        case '3':
          st.command({ type: 'view', view: 'esquerda' });
          break;
        case '4':
          st.command({ type: 'view', view: 'direita' });
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
          else if (st.selectedId || region) {
            st.select(null);
            setRegion(null);
          }
          break;
        default:
          return;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [meshesOf, togglePresentation, region]);

  const hovered = index && s.hoveredMeshId ? index.structures.get(s.hoveredMeshId) : undefined;
  const pres = s.presentation;
  const hideUi = s.uiHidden;
  const showRight = !hideUi && s.panelOpen && (!!selected || !!region);

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

  return (
    <div ref={rootRef} data-presentation={pres} className="relative flex h-dvh flex-col overflow-hidden bg-ink-900">
      {/* ---------- top bar */}
      {!hideUi && (
        <header className={`z-20 flex items-center gap-3 border-b border-line bg-ink-900/95 px-3 sm:px-4 ${pres ? 'h-16' : 'h-14'}`}>
          {!pres && (
            <Link href="/explorar" className="flex items-center gap-2 text-fg-muted hover:text-fg" aria-label="Voltar aos laboratórios">
              <Icon name="chevronLeft" size={18} />
              <span className="hidden sm:inline">
                <Logo size={24} withText={false} />
              </span>
            </Link>
          )}
          <div className="min-w-0">
            <p className="eyebrow leading-none">Laboratório 01 · Anatomia e Fisiologia</p>
            <h1 className={`truncate font-[family-name:var(--font-display)] font-bold ${pres ? 'text-xl' : 'text-[15px]'}`}>Corpo Humano</h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {index && !pres && (
              <div className="hidden md:block">
                <SearchBox ref={searchRef} search={index.search} onPick={(st) => { setRegion(null); selectStructure(st.id); }} compact />
              </div>
            )}
            {!pres && (
              <button type="button" className="btn btn-ghost h-10 lg:hidden" onClick={() => setLayersOpen((v) => !v)} aria-expanded={layersOpen}>
                <Icon name="layers" size={16} /> Camadas
              </button>
            )}
            <QualityMenu />
            <button type="button" className="icon-btn hidden sm:inline-grid" onClick={() => setShowHelp(true)} aria-label="Atalhos de teclado" title="Atalhos (?)">
              <Icon name="keyboard" />
            </button>
            {pres && (
              <button type="button" className="btn btn-ghost h-10" onClick={() => useViewer.getState().toggleUi()} title="Ocultar interface (H)">
                <Icon name="eyeOff" size={16} /> Ocultar interface
              </button>
            )}
            <button type="button" className={`btn h-10 ${pres ? 'btn-ghost' : 'btn-primary'}`} onClick={togglePresentation} data-testid="presentation-toggle">
              <Icon name={pres ? 'minimize' : 'present'} size={16} />
              {pres ? 'Sair da apresentação' : 'Modo Apresentação'}
            </button>
          </div>
        </header>
      )}

      <div className="relative flex min-h-0 flex-1">
        {/* ---------- layers (left) */}
        {!hideUi && !pres && index && (
          <aside
            className={`z-20 w-[272px] shrink-0 border-r border-line bg-ink-850 ${layersOpen ? 'absolute inset-y-0 left-0 shadow-2xl' : 'hidden'} lg:relative lg:block lg:shadow-none`}
            aria-label="Camadas"
            data-testid="layers-panel"
          >
            <LayersPanel groups={index.raw.groups} models={index.raw.models} />
          </aside>
        )}

        {/* ---------- 3D viewport */}
        <main className="relative min-w-0 flex-1" aria-label="Visualização 3D do corpo humano">
          {index && (
            <LabCanvas cameraPreset={PRESET} onPointerMissed={() => { useViewer.getState().select(null); setRegion(null); }}>
              {requested.map((modelId) => {
                const model = index.raw.models.find((m) => m.id === modelId)!;
                return (
                  <ModelSlot key={modelId} modelId={modelId}>
                    <GltfModel model={model} meshInfo={index.meshInfo} library={library} hover={!pres && s.quality !== 'economico'} onPick={onPick} />
                  </ModelSlot>
                );
              })}
              <SceneSync library={library} meshesOf={meshesOf} />
              {s.labels && selected && <SelectionLabel text={selected.namePtBR} meshIds={selected.modelMeshIds} />}
            </LabCanvas>
          )}

          {!index && !loadError && (
            <div className="absolute inset-0 grid place-items-center">
              <div className="flex items-center gap-3 text-fg-muted">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-cyan border-t-transparent" /> Preparando o laboratório…
              </div>
            </div>
          )}
          {loadError && (
            <div className="absolute inset-0 grid place-items-center p-6">
              <div className="panel max-w-sm p-6 text-center">
                <p className="font-semibold">Não foi possível carregar o catálogo anatômico.</p>
                <p className="mt-2 text-sm text-fg-muted">Verifique a conexão com a internet e tente novamente.</p>
                <button className="btn btn-primary mt-4" onClick={() => location.reload()}>
                  Tentar novamente
                </button>
              </div>
            </div>
          )}

          {!hideUi && index && (
            <>
              <div className="pointer-events-none absolute top-3 left-3 flex flex-col items-start gap-2 sm:top-4 sm:left-4">
                <span className="chip pointer-events-auto bg-ink-900/80 backdrop-blur" title="Derivado do BodyParts3D e do Z-Anatomy">
                  {REPRESENTATION}
                </span>
                {Object.entries(s.modelState).some(([, v]) => v === 'loading') && (
                  <span className="chip bg-ink-900/80 text-cyan" role="status">
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-cyan border-t-transparent" /> Carregando estruturas…
                  </span>
                )}
                {hovered && !pres && <span className="chip bg-ink-900/80 text-fg">{hovered.namePtBR}</span>}
              </div>
              {!selected && !region && (
                <p className={`pointer-events-none absolute inset-x-0 bottom-20 mx-auto w-fit max-w-[90%] rounded-full border border-line bg-ink-900/70 px-4 py-1.5 text-center text-fg-muted backdrop-blur ${pres ? 'text-base' : 'text-xs'}`}>
                  Gire com o mouse, aproxime com a roda e clique em uma estrutura ou região do corpo.
                </p>
              )}
              <ViewerToolbar />
            </>
          )}
          {hideUi && (
            <button type="button" className="btn btn-ghost absolute top-4 right-4 z-30 bg-ink-900/70 opacity-40 hover:opacity-100" onClick={() => useViewer.getState().toggleUi()}>
              <Icon name="eye" size={16} /> Mostrar interface (H)
            </button>
          )}
          {hideUi && s.labels && selected && (
            <div className="pointer-events-none absolute bottom-6 left-6 rounded-xl border border-line bg-ink-900/80 px-5 py-3 backdrop-blur">
              <p className="eyebrow">{selected.biologicalSystem}</p>
              <p className="text-3xl font-bold">{selected.namePtBR}</p>
            </div>
          )}
        </main>

        {/* ---------- scientific / region panel (right) */}
        {showRight && index && (
          <aside
            className={`z-20 shrink-0 border-l border-line bg-ink-850 max-lg:absolute max-lg:inset-x-0 max-lg:bottom-0 max-lg:h-[55%] max-lg:border-t max-lg:border-l-0 ${pres ? 'w-[440px]' : 'w-[380px]'} max-lg:w-full`}
          >
            {selected ? (
              <ScientificPanel
                structure={selected}
                getStructure={getStructure}
                systemNote={SYSTEM_NOTE(index.meshInfo.get(selected.modelMeshIds[0])?.group ?? '')}
                canUseStudio={canUseStudio}
                onSelect={(id) => selectStructure(id)}
                onClose={() => useViewer.getState().select(null)}
                representation={REPRESENTATION}
                educational={(HUMAN_CONTENT[selected.id] ?? HUMAN_CONTENT[baseId(selected.id)])?.educational ?? null}
              />
            ) : region ? (
              <RegionPanel
                name={region.region.name}
                layers={regionLayers}
                activeLayer={region.layer}
                onLayer={chooseLayer}
                onSelect={(id) => selectStructure(id)}
                onClose={() => {
                  setRegion(null);
                  useViewer.getState().isolate(null);
                }}
              />
            ) : null}
          </aside>
        )}
      </div>

      {!hideUi && !pres && index && (
        <footer className="hidden border-t border-line bg-ink-900 px-4 py-1.5 text-[11px] text-fg-subtle lg:flex lg:justify-between">
          <span>
            Modelo 3D: {index.raw.attribution.join(' · ')} — modificado para o BioLab 3D.{' '}
            <Link href="/creditos" className="underline hover:text-fg">
              Créditos e licenças
            </Link>
          </span>
          <span>{tierLabel}</span>
        </footer>
      )}
      {showHelp && <ShortcutsHelp onClose={() => setShowHelp(false)} />}
    </div>
  );
}
