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
  /** Adaptive resolution allowed to drop under load. */
  adaptive: boolean;
  environment: boolean;
  /** Hover highlighting needs a raycast per pointer move. */
  hover: boolean;
}

export const QUALITY: Record<QualityProfile, QualitySettings> = {
  economico: {
    label: 'Econômico',
    description: 'Para computadores mais simples: resolução reduzida e efeitos desligados.',
    dpr: [0.75, 1],
    antialias: false,
    adaptive: true,
    environment: false,
    hover: false,
  },
  equilibrado: {
    label: 'Equilibrado',
    description: 'Boa nitidez com consumo moderado. Recomendado para a maioria das escolas.',
    dpr: [1, 1.5],
    antialias: true,
    adaptive: true,
    environment: true,
    hover: true,
  },
  alta: {
    label: 'Alta Qualidade',
    description: 'Máxima nitidez para computadores com placa de vídeo dedicada.',
    dpr: [1, 2],
    antialias: true,
    adaptive: false,
    environment: true,
    hover: true,
  },
};

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
