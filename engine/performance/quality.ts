/**
 * Quality profiles and conservative device-capability detection.
 * The default profile is chosen from measurable signals; the teacher can
 * always override it manually (persisted in localStorage).
 */
export type QualityProfile = 'economico' | 'equilibrado' | 'alta';

export interface QualitySettings {
  label: string;
  description: string;
  /** Device-pixel-ratio range for the canvas. */
  dpr: [number, number];
  antialias: boolean;
  /** Resolution may drop to dpr[0] while the camera moves (restored at rest). */
  adaptive: boolean;
  environment: boolean;
  /** Size of the procedural reflection map (px). Clearcoat/sheen look flat below 128. */
  envResolution: 64 | 128 | 256;
  /** Hover highlighting needs a raycast per pointer move. */
  hover: boolean;
  /** Screen-space ambient occlusion (soft contact shadows between structures). */
  ao: boolean;
  aoQuality: 'low' | 'medium' | 'high';
  aoHalfRes: boolean;
  /** MSAA samples of the post-processing composer (0 = off). */
  multisampling: 0 | 4 | 8;
  /** Multiplier for the segment counts of procedural geometry (1 = authored density). */
  detail: number;
}

export const QUALITY: Record<QualityProfile, QualitySettings> = {
  economico: {
    label: 'Econômico',
    description: 'Para computadores mais simples: resolução e malhas reduzidas, sem sombreamento de contato.',
    dpr: [0.75, 1],
    antialias: false,
    adaptive: true,
    environment: true,
    envResolution: 64,
    hover: false,
    ao: false,
    aoQuality: 'low',
    aoHalfRes: true,
    multisampling: 0,
    detail: 0.7,
  },
  equilibrado: {
    label: 'Equilibrado',
    description: 'Boa nitidez com consumo moderado. Recomendado para a maioria das escolas.',
    dpr: [1, 1.5],
    antialias: true,
    adaptive: true,
    environment: true,
    envResolution: 128,
    hover: true,
    ao: true,
    aoQuality: 'medium',
    aoHalfRes: true,
    multisampling: 4,
    detail: 1,
  },
  alta: {
    label: 'Alta Qualidade',
    description: 'Malhas mais densas, reflexos e oclusão em resolução plena. Para placas de vídeo dedicadas.',
    dpr: [1, 2],
    antialias: true,
    adaptive: false,
    environment: true,
    envResolution: 256,
    hover: true,
    ao: true,
    aoQuality: 'high',
    aoHalfRes: false,
    multisampling: 8,
    detail: 1.25,
  },
};

// ---------------------------------------------------------------- geometry detail

let currentDetail = 1;
/** Sets the density multiplier used by procedural geometry builders (see `segs`). */
export function setDetailScale(d: number) {
  currentDetail = Math.max(0.4, Math.min(2, d));
}
export function detailScale() {
  return currentDetail;
}
/** Scales an authored segment count by the current detail level (never below `min`). */
export function segs(n: number, min = 6) {
  return Math.max(min, Math.round(n * currentDetail));
}

export interface DeviceSignals {
  cores?: number;
  memoryGB?: number;
  gpuRenderer?: string;
  maxTextureSize?: number;
  mobile?: boolean;
}

const SOFTWARE_GPU = /swiftshader|llvmpipe|softpipe|software|basic render|microsoft basic/i;
const INTEGRATED_LOW = /intel\(r\) (hd|uhd) graphics (4|5|6)\d{2}|mali-[gt]?[1-6]\d|adreno \(tm\) [1-5]\d{2}|powervr/i;
const DISCRETE = /nvidia|geforce|rtx|gtx|radeon (rx|pro)|apple m[1-9]/i;

/** Pure function so it can be unit-tested. */
export function pickDefaultQuality(s: DeviceSignals): QualityProfile {
  const gpu = s.gpuRenderer ?? '';
  if (SOFTWARE_GPU.test(gpu)) return 'economico';
  if ((s.memoryGB !== undefined && s.memoryGB <= 4) || (s.cores !== undefined && s.cores <= 4)) return 'economico';
  if (INTEGRATED_LOW.test(gpu)) return 'economico';
  if (s.mobile) return 'economico';
  if (DISCRETE.test(gpu) && (s.cores ?? 0) >= 8 && (s.memoryGB ?? 8) >= 8) return 'alta';
  return 'equilibrado';
}

export function readDeviceSignals(): DeviceSignals {
  if (typeof window === 'undefined') return {};
  const nav = navigator as Navigator & { deviceMemory?: number; userAgentData?: { mobile?: boolean } };
  const signals: DeviceSignals = {
    cores: nav.hardwareConcurrency,
    memoryGB: nav.deviceMemory,
    mobile: nav.userAgentData?.mobile ?? /Android|iPhone|iPad|Mobile/i.test(nav.userAgent),
  };
  try {
    const c = document.createElement('canvas');
    const gl = (c.getContext('webgl2') || c.getContext('webgl')) as WebGLRenderingContext | null;
    if (gl) {
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      signals.gpuRenderer = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : String(gl.getParameter(gl.RENDERER));
      signals.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    }
  } catch {
    /* ignore */
  }
  return signals;
}

export function isWebGLAvailable(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch {
    return false;
  }
}

const STORAGE_KEY = 'biolab.quality';
export function loadSavedQuality(): QualityProfile | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === 'economico' || v === 'equilibrado' || v === 'alta' ? v : null;
  } catch {
    return null;
  }
}
export function saveQuality(q: QualityProfile) {
  try {
    localStorage.setItem(STORAGE_KEY, q);
  } catch {
    /* ignore */
  }
}
