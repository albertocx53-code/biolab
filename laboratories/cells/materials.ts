import type { MaterialSpec } from '@/engine/visibility/materials';

/**
 * Textbook-style palette for cells on the light atlas backdrop. Colours are
 * conventional teaching colours (not the real colour of organelles, which are
 * mostly transparent under the microscope). One material class per structure.
 */
const SOFT = { roughness: 0.55, clearcoat: 0.25, clearcoatRoughness: 0.5, doubleSide: true };
const TONED = { color: '#ffffff', vertexColors: true, ...SOFT };

export const CELL_MATERIALS: Record<string, MaterialSpec> = {
  'membrana-plasmatica': { color: '#E9A58A', ...SOFT, sheen: 0.4, sheenColor: '#FFE1D2' },
  citoplasma: { color: '#F6D6C2', roughness: 0.9, doubleSide: true },
  'parede-celular': { color: '#9DC46C', ...SOFT },
  vacuolo: { color: '#8EC5EC', roughness: 0.3, clearcoat: 0.6, doubleSide: true },
  nucleo: { color: '#CDB9EE', roughness: 0.85, doubleSide: true },
  'envoltorio-nuclear': { ...TONED },
  nucleolo: { color: '#4C2C86', ...SOFT },
  cromatina: { color: '#7A55C2', ...SOFT },
  'reticulo-endoplasmatico-rugoso': { color: '#5B8DDB', ...SOFT },
  'reticulo-endoplasmatico-liso': { color: '#86BDEB', ...SOFT },
  ribossomos: { color: '#2C3561', roughness: 0.5 },
  'complexo-golgiense': { color: '#F2B53C', ...SOFT },
  vesiculas: { color: '#F6CF72', ...SOFT },
  mitocondria: { ...TONED },
  cloroplastos: { ...TONED },
  lisossomos: { color: '#5BAA6E', ...SOFT },
  peroxissomos: { color: '#BCC54A', ...SOFT },
  centriolos: { color: '#22A39B', ...SOFT },

  'capsula-bacteriana': { color: '#BFE3D0', roughness: 0.4, clearcoat: 0.5, doubleSide: true },
  'parede-celular-bacteriana': { color: '#7FB77E', ...SOFT },
  nucleoide: { color: '#7B4FB8', ...SOFT },
  plasmideos: { color: '#D9534F', ...SOFT },
  'ribossomos-70s': { color: '#2C3561', roughness: 0.5 },
  'flagelo-bacteriano': { color: '#8C7A57', ...SOFT },
  fimbrias: { color: '#A99B78', ...SOFT },

  'membrana-mitocondrial-externa': { color: '#DE6538', ...SOFT },
  'espaco-intermembranas': { color: '#FBD6C2', roughness: 0.9, doubleSide: true },
  'membrana-mitocondrial-interna': { color: '#F08D5E', ...SOFT },
  'cristas-mitocondriais': { color: '#E8834F', ...SOFT },
  'atp-sintase': { color: '#9B3D1E', roughness: 0.5 },
  'matriz-mitocondrial': { color: '#FBE3D2', roughness: 0.9, doubleSide: true },
  'dna-mitocondrial': { color: '#7B4FB8', ...SOFT },

  'envoltorio-cloroplasto': { ...TONED },
  estroma: { color: '#CFE8B6', roughness: 0.9, doubleSide: true },
  tilacoides: { color: '#2F7A34', ...SOFT },
  'lamelas-estromais': { color: '#5FA455', ...SOFT },
  'graos-de-amido': { color: '#F1EAD4', ...SOFT },
  'dna-cloroplasto': { color: '#7B4FB8', ...SOFT },

  'cromatide-irma': { color: '#D2455B', ...SOFT },
  'cromatide-irma-b': { color: '#3F7FD0', ...SOFT },
  centromero: { color: '#3B2B57', ...SOFT },
  'fuso-mitotico': { color: '#3AA7A0', roughness: 0.6 },
  centrossomo: { color: '#22A39B', ...SOFT },
};

export const CELL_FALLBACK: MaterialSpec = { color: '#C8CED6', roughness: 0.55, doubleSide: true };

/** Legend colour per structure (layers panel), defaults to the material colour. */
export const LEGEND_COLOR: Record<string, string> = {
  'envoltorio-nuclear': '#8C6BC4',
  mitocondria: '#E0663A',
  cloroplastos: '#4FA34A',
  'envoltorio-cloroplasto': '#4FA34A',
  'cromatide-irma': '#D2455B',
};

/** Translucent layers: default opacity (clicks pass through them to what is inside). */
export const DEFAULT_OPACITY: Record<string, number> = {
  citoplasma: 0.32,
  nucleo: 0.45,
  vacuolo: 0.4,
  'capsula-bacteriana': 0.28,
  'matriz-mitocondrial': 0.3,
  estroma: 0.3,
};
