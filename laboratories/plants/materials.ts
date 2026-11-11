import type { MaterialSpec } from '@/engine/visibility/materials';

/**
 * Textbook-style palette for plants on the light atlas backdrop. Tissue
 * colours in the cross-sections follow the usual stained-slide conventions
 * (xylem red-brown, phloem blue-violet), not the real colour of the tissue.
 */
const SOFT = { roughness: 0.6, clearcoat: 0.2, clearcoatRoughness: 0.6, doubleSide: true };
const TONED = { color: '#ffffff', vertexColors: true, ...SOFT };

export const PLANT_MATERIALS: Record<string, MaterialSpec> = {
  solo: { color: '#A57A55', roughness: 1, doubleSide: true },
  'raiz-principal': { color: '#E9D7B0', ...SOFT },
  'raizes-laterais': { color: '#EADFC2', ...SOFT },
  caule: { color: '#5E9B48', ...SOFT },
  nos: { color: '#3F7A35', ...SOFT },
  'gema-apical': { color: '#9BCB62', ...SOFT },
  'gemas-axilares': { color: '#A6D16C', ...SOFT },
  peciolo: { color: '#6AA84F', ...SOFT },
  limbo: { color: '#4C9A3C', ...SOFT, sheen: 0.3, sheenColor: '#CFF0B8' },
  nervuras: { color: '#B9DE8C', ...SOFT },
  flor: { ...TONED },
  pericarpo: { ...TONED },
  semente: { color: '#F2E6C4', ...SOFT },

  pedunculo: { color: '#5E9B48', ...SOFT },
  receptaculo: { color: '#86BC5A', ...SOFT },
  sepalas: { color: '#5FA548', ...SOFT },
  petalas: { color: '#EE8FB4', ...SOFT, sheen: 0.5, sheenColor: '#FFE1EE' },
  filete: { color: '#F4EFC8', ...SOFT },
  antera: { color: '#E9B32E', ...SOFT },
  'graos-de-polen': { color: '#F59E0B', roughness: 0.5 },
  estigma: { color: '#C7D94A', ...SOFT },
  estilete: { color: '#B5D46A', ...SOFT },
  ovario: { ...TONED },
  ovulos: { color: '#F5EBD0', ...SOFT },

  cuticula: { color: '#F6E9A8', roughness: 0.3, clearcoat: 0.8, doubleSide: true },
  'epiderme-superior': { color: '#DDEFC9', ...SOFT },
  'parenquima-palicadico': { color: '#9ED37C', ...SOFT },
  'parenquima-lacunoso': { color: '#BFE29C', ...SOFT },
  cloroplastos: { color: '#2F7A34', roughness: 0.5 },
  'epiderme-inferior': { color: '#DDEFC9', ...SOFT },
  'celulas-guarda': { color: '#6FB255', ...SOFT },
  xilema: { color: '#B2563F', ...SOFT },
  'xilema-tons': { ...TONED },
  floema: { color: '#7D7BD6', ...SOFT },

  epiderme: { color: '#EAD8B6', ...SOFT },
  cortex: { color: '#F2E8C9', ...SOFT },
  'cambio-vascular': { color: '#5BB6A6', ...SOFT },
  medula: { color: '#FBF4DF', ...SOFT },

  coifa: { color: '#C79A6E', ...SOFT },
  'zona-meristematica': { color: '#E7987A', ...SOFT },
  'zona-de-alongamento': { color: '#EFC9A0', ...SOFT },
  'pelos-absorventes': { color: '#F2E3C4', ...SOFT },
  endoderme: { color: '#C8763F', ...SOFT },
  periciclo: { color: '#E8B85E', ...SOFT },

  tegumento: { ...TONED },
  cotiledones: { ...TONED },
  radicula: { color: '#EFE2BE', ...SOFT },
  hipocotilo: { color: '#B9D88A', ...SOFT },
  plumula: { ...TONED },
};

export const PLANT_FALLBACK: MaterialSpec = { color: '#C8CED6', roughness: 0.55, doubleSide: true };

/** Legend colour per structure (layers panel), defaults to the material colour. */
export const PLANT_LEGEND: Record<string, string> = {
  flor: '#EE8FB4',
  pericarpo: '#E1533C',
  ovario: '#8CC063',
  tegumento: '#8E3B2C',
  cotiledones: '#F1DFAE',
  plumula: '#7DB65A',
};

/** Translucent layers: default opacity (clicks pass through them to what is inside). */
export const PLANT_OPACITY: Record<string, number> = {
  solo: 0.22,
  cuticula: 0.45,
};
