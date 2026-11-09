/**
 * Shared viewer state for every laboratory (Zustand).
 * Laboratories supply their own catalog of structures/groups; the engine only
 * deals with ids, groups, visibility, selection and camera commands.
 */
import { create } from 'zustand';
import type { QualityProfile } from './performance/quality';

export type CameraView = 'frente' | 'costas' | 'esquerda' | 'direita' | 'cima';
export type CameraCommand =
  | { type: 'reset' }
  | { type: 'view'; view: CameraView }
  | { type: 'focus'; meshIds: string[] }
  | { type: 'zoom'; factor: number };

export type LoadState = 'idle' | 'loading' | 'ready' | 'error';

export interface ViewerState {
  selectedId: string | null;
  hoveredMeshId: string | null;
  groupVisible: Record<string, boolean>;
  groupOpacity: Record<string, number>;
  hiddenMeshIds: Record<string, true>;
  /** When set, everything except these meshes is ghosted. */
  isolatedMeshIds: string[] | null;
  quality: QualityProfile;
  presentation: boolean;
  uiHidden: boolean;
  panelOpen: boolean;
  labels: boolean;
  modelState: Record<string, LoadState>;
  camera: { cmd: CameraCommand; nonce: number } | null;
  zoomPercent: number;

  init(groups: { id: string; visible: boolean; opacity: number }[]): void;
  select(id: string | null): void;
  hover(meshId: string | null): void;
  setGroupVisible(group: string, visible: boolean): void;
  setGroupOpacity(group: string, opacity: number): void;
  hideMeshes(ids: string[]): void;
  showAll(): void;
  isolate(ids: string[] | null): void;
  setQuality(q: QualityProfile): void;
  setPresentation(on: boolean): void;
  toggleUi(): void;
  setPanelOpen(open: boolean): void;
  setLabels(on: boolean): void;
  setModelState(modelId: string, s: LoadState): void;
  command(cmd: CameraCommand): void;
  setZoomPercent(p: number): void;
}

export const useViewer = create<ViewerState>((set) => ({
  selectedId: null,
  hoveredMeshId: null,
  groupVisible: {},
  groupOpacity: {},
  hiddenMeshIds: {},
  isolatedMeshIds: null,
  quality: 'equilibrado',
  presentation: false,
  uiHidden: false,
  panelOpen: true,
  labels: true,
  modelState: {},
  camera: null,
  zoomPercent: 100,

  init: (groups) =>
    set({
      selectedId: null,
      hoveredMeshId: null,
      hiddenMeshIds: {},
      isolatedMeshIds: null,
      groupVisible: Object.fromEntries(groups.map((g) => [g.id, g.visible])),
      groupOpacity: Object.fromEntries(groups.map((g) => [g.id, g.opacity])),
      camera: null,
      uiHidden: false,
    }),
  select: (id) => set((s) => ({ selectedId: id, panelOpen: id ? true : s.panelOpen })),
  hover: (meshId) => set((s) => (s.hoveredMeshId === meshId ? s : { hoveredMeshId: meshId })),
  setGroupVisible: (group, visible) => set((s) => ({ groupVisible: { ...s.groupVisible, [group]: visible } })),
  setGroupOpacity: (group, opacity) => set((s) => ({ groupOpacity: { ...s.groupOpacity, [group]: Math.min(1, Math.max(0, opacity)) } })),
  hideMeshes: (ids) => set((s) => ({ hiddenMeshIds: { ...s.hiddenMeshIds, ...Object.fromEntries(ids.map((i) => [i, true as const])) } })),
  showAll: () => set({ hiddenMeshIds: {}, isolatedMeshIds: null }),
  isolate: (ids) => set({ isolatedMeshIds: ids && ids.length ? ids : null }),
  setQuality: (quality) => set({ quality }),
  setPresentation: (presentation) => set({ presentation, uiHidden: false }),
  toggleUi: () => set((s) => ({ uiHidden: !s.uiHidden })),
  setPanelOpen: (panelOpen) => set({ panelOpen }),
  setLabels: (labels) => set({ labels }),
  setModelState: (modelId, st) => set((s) => ({ modelState: { ...s.modelState, [modelId]: st } })),
  command: (cmd) => set((s) => ({ camera: { cmd, nonce: (s.camera?.nonce ?? 0) + 1 } })),
  setZoomPercent: (zoomPercent) => set({ zoomPercent }),
}));
