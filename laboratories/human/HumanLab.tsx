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
import { DepthSlider, applyDepth } from '@/components/laboratory/DepthSlider';
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

const PRESET: CameraPreset = { position: [0, 0.88, 3.8], target: [0, 0.86, 0], distance: 3.8, minDistance: 0.08, maxDistance: 9 };
const DEFAULT_DEPTH = 1; // open on the muscular layer, like an anatomy atlas
const THEME_KEY = 'biolab.labTheme';

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
  const [depth, setDepth] = useState(DEFAULT_DEPTH);
  const [dark, setDark] = useState(false);
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
    try {
      setDark(localStorage.getItem(THEME_KEY) === 'dark');
    } catch {}
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
        applyDepth(DEFAULT_DEPTH);
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
      // peel the outer layers so the chosen structure is actually exposed (atlas behaviour)
      const groups = new Set(meshes.map((m) => index.meshInfo.get(m)?.group));
      const need = groups.has('tegumentar') ? 0 : groups.has('muscular') || groups.has('fascias') ? 1 : groups.has('esqueletico') ? 2 : 2.5;
      const st0 = useViewer.getState();
      const outerCovers = (st0.groupVisible.tegumentar && (st0.groupOpacity.tegumentar ?? 1) > 0.5 && need > 0) || (st0.groupVisible.muscular && (st0.groupOpacity.muscular ?? 1) > 0.5 && need > 1);
      if (outerCovers) {
        setDepth(need);
        applyDepth(need);
      }
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

  const toggleTheme = () => {
    setDark((d) => {
      try {
        localStorage.setItem(THEME_KEY, d ? 'light' : 'dark');
      } catch {}
      return !d;
    });
  };
  const loading = Object.values(s.modelState).some((v) => v === 'loading');

  return (
    <div ref={rootRef} data-presentation={pres} className={`${dark ? 'theme-dark-lab' : 'theme-light'} relative h-dvh overflow-hidden text-fg`}>
      <div className="lab-backdrop absolute inset-0" aria-hidden="true" />

      {/* ---------- 3D viewport (full bleed) */}
      <main className="absolute inset-0" aria-label="Visualização 3D do corpo humano">
        {index && (
          <LabCanvas dark={dark} cameraPreset={PRESET} onPointerMissed={() => { useViewer.getState().select(null); setRegion(null); }}>
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
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-fg-muted border-t-transparent" /> Preparando o laboratório…
            </div>
          </div>
        )}
        {loadError && (
          <div className="absolute inset-0 grid place-items-center p-6">
            <div className="float-card max-w-sm p-6 text-center">
              <p className="font-semibold">Não foi possível carregar o catálogo anatômico.</p>
              <p className="mt-2 text-sm text-fg-muted">Verifique a conexão com a internet e tente novamente.</p>
              <button className="btn btn-primary mt-4" onClick={() => location.reload()}>
                Tentar novamente
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ---------- top bar (floating) */}
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
              <h1 className={`truncate font-[family-name:var(--font-display)] font-bold ${pres ? 'text-xl' : 'text-[15px]'}`}>Corpo Humano</h1>
              <p className="text-[11px] text-fg-subtle">Anatomia e Fisiologia</p>
            </div>
          </div>

          {index && !pres && (
            <div className="pointer-events-auto mx-auto hidden md:block">
              <SearchBox ref={searchRef} search={index.search} onPick={(st) => { setRegion(null); selectStructure(st.id); }} compact />
            </div>
          )}

          <div className="pointer-events-auto ml-auto flex items-center gap-2">
            {!pres && (
              <button type="button" className="btn btn-ghost h-10 rounded-full lg:hidden" onClick={() => setLayersOpen((v) => !v)} aria-expanded={layersOpen}>
                <Icon name="layers" size={16} /> Camadas
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

      {/* ---------- layers (floating, left) */}
      {!hideUi && index && (
        <aside
          className={`float-card absolute top-20 left-3 z-20 flex max-h-[calc(100%-11rem)] w-[248px] flex-col sm:left-4 ${pres ? '' : layersOpen ? '' : 'max-lg:hidden'}`}
          aria-label="Camadas"
          data-testid={pres ? undefined : 'layers-panel'}
        >
          <div className="border-b border-line p-4">
            <p className="eyebrow mb-3">Profundidade</p>
            <DepthSlider value={depth} onChange={setDepth} large={pres} />
          </div>
          {!pres && (
            <div className="scroll-thin min-h-0 flex-1 overflow-y-auto p-2">
              <p className="eyebrow px-1.5 pt-1 pb-2">Sistemas</p>
              <LayersPanel groups={index.raw.groups} models={index.raw.models} />
            </div>
          )}
        </aside>
      )}

      {/* ---------- status chips */}
      {!hideUi && index && (
        <div className="pointer-events-none absolute top-24 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2">
          {loading && (
            <span className="chip text-fg" role="status">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-fg-muted border-t-transparent" /> Carregando estruturas…
            </span>
          )}
          {hovered && !pres && <span className="chip text-fg">{hovered.namePtBR}</span>}
        </div>
      )}

      {!hideUi && index && !selected && !region && (
        <p className={`pointer-events-none absolute inset-x-0 top-[68px] z-10 mx-auto hidden w-fit max-w-[90%] text-center text-fg-subtle md:block ${pres ? 'text-base' : 'text-xs'}`}>
          Arraste para girar · role para aproximar · clique em uma estrutura
        </p>
      )}
      {!hideUi && index && <ViewerToolbar />}

      {/* ---------- scientific / region panel (floating, right) */}
      {showRight && index && (
        <aside
          className={`float-card absolute z-20 overflow-hidden max-lg:inset-x-2 max-lg:bottom-2 max-lg:h-[55%] lg:top-20 lg:right-4 lg:bottom-20 ${pres ? 'lg:w-[440px]' : 'lg:w-[380px]'}`}
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

      {hideUi && (
        <button type="button" className="btn btn-ghost absolute top-4 right-4 z-30 rounded-full opacity-40 hover:opacity-100" onClick={() => useViewer.getState().toggleUi()}>
          <Icon name="eye" size={16} /> Mostrar interface (H)
        </button>
      )}
      {hideUi && s.labels && selected && (
        <div className="float-card pointer-events-none absolute bottom-6 left-6 px-5 py-3">
          <p className="eyebrow">{selected.biologicalSystem}</p>
          <p className="text-3xl font-bold">{selected.namePtBR}</p>
        </div>
      )}

      {!hideUi && !pres && index && (
        <footer className="pointer-events-auto absolute right-4 bottom-1.5 z-10 hidden max-w-[60%] truncate text-right text-[10px] text-fg-subtle lg:block">
          {index.raw.attribution.join(' · ')} — modificado.{' '}
          <Link href="/creditos" className="underline hover:text-fg">
            Créditos
          </Link>{' '}
          · {tierLabel}
        </footer>
      )}
      {showHelp && <ShortcutsHelp onClose={() => setShowHelp(false)} />}
    </div>
  );
}
