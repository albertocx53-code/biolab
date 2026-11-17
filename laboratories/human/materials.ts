import type { MaterialSpec } from '@/engine/visibility/materials';

/**
 * Atlas-style palette tuned for a light studio background: natural tissue
 * colours, velvet sheen on muscle and skin, a thin wet coat on organs.
 */
const ORGAN = { roughness: 0.42, clearcoat: 0.35, clearcoatRoughness: 0.4 };
export const HUMAN_MATERIALS: Record<string, MaterialSpec> = {
  pele: { color: '#D9A88A', roughness: 0.58, sheen: 0.6, sheenColor: '#F6D2BE', polygonOffset: true },
  osso: { color: '#EAE0CC', roughness: 0.55, clearcoat: 0.08 },
  dente: { color: '#F6F2E8', roughness: 0.25, clearcoat: 0.6 },
  cartilagem: { color: '#C7DCE4', roughness: 0.35, clearcoat: 0.45 },
  musculo: { color: '#A3302A', roughness: 0.5, sheen: 0.75, sheenColor: '#E8857A', clearcoat: 0.15 },
  tendao: { color: '#E8DFCF', roughness: 0.4, sheen: 0.5, sheenColor: '#FFFFFF' },
  ligamento: { color: '#DED3BF', roughness: 0.45, sheen: 0.3 },
  fascia: { color: '#E0D0BC', roughness: 0.5, sheen: 0.3 },
  bursa: { color: '#CFDDE8', ...ORGAN },
  miocardio: { color: '#B83A31', roughness: 0.42, sheen: 0.6, sheenColor: '#F0948A', clearcoat: 0.35, organic: { noise: 0.16, scale: 90, rim: 0.25, rimColor: '#FFD9D2', rimPower: 3 } },
  valva: { color: '#EBD4BB', ...ORGAN },
  arteria: { color: '#CC3129', ...ORGAN, organic: { noise: 0.1, scale: 120, rim: 0.3, rimColor: '#FFD0CB', rimPower: 3 } },
  veia: { color: '#2F5AA8', ...ORGAN, organic: { noise: 0.1, scale: 120, rim: 0.3, rimColor: '#CFE0FF', rimPower: 3 } },
  nervo: { color: '#E6C34A', roughness: 0.4, clearcoat: 0.25 },
  olho: { color: '#EEF3F6', roughness: 0.15, clearcoat: 1, clearcoatRoughness: 0.05 },
  medula: { color: '#EFE6D6', ...ORGAN },
  glandula: { color: '#CF9D58', ...ORGAN },
  mucosa: { color: '#D98680', ...ORGAN },
  'tecido-conjuntivo': { color: '#DCD1BD', roughness: 0.5 },
  pulmao: { color: '#E2A3A1', roughness: 0.55, sheen: 0.4, sheenColor: '#FFD6D3', clearcoat: 0.2 },
  membrana: { color: '#E9BCB7', ...ORGAN },
  'via-aerea': { color: '#CFE0E7', ...ORGAN },
  figado: { color: '#7E2F25', ...ORGAN },
  ducto: { color: '#79A862', ...ORGAN },
  intestino: { color: '#DE9F8B', ...ORGAN },
  'orgao-digestorio': { color: '#D4847A', ...ORGAN },
  urinario: { color: '#D8B266', ...ORGAN },
  reprodutor: { color: '#D68A96', ...ORGAN },
  'glandula-endocrina': { color: '#A981D6', ...ORGAN },
  'orgao-linfoide': { color: '#7A3646', ...ORGAN },
  linfonodo: { color: '#5DB988', ...ORGAN },
};
export const HUMAN_FALLBACK: MaterialSpec = { color: '#C8CED6', roughness: 0.55 };
