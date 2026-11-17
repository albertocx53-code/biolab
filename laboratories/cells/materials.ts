import type { MaterialSpec, OrganicSpec } from '@/engine/visibility/materials';

/**
 * Palette for the cell models on the light atlas backdrop. Colours follow the
 * teaching convention (organelles are mostly colourless under the microscope),
 * but every surface uses the "organic" finish: fine grain, wet clear coat and a
 * translucent rim, so membranes and organelles read as living tissue instead
 * of plastic. One material class per structure.
 */
const GRAIN: OrganicSpec = { noise: 0.22, scale: 9, rim: 0.3, rimColor: '#FFF4EA', rimPower: 3 };
const FINE: OrganicSpec = { noise: 0.14, scale: 22, rim: 0.22, rimColor: '#FFFFFF', rimPower: 3.5 };
const MEMBRANE: OrganicSpec = { noise: 0.1, scale: 14, rim: 0.55, rimColor: '#FFE9DD', rimPower: 2.2 };
const SOFT = { roughness: 0.5, clearcoat: 0.3, clearcoatRoughness: 0.45, doubleSide: true, organic: GRAIN };
const TONED = { color: '#ffffff', vertexColors: true, ...SOFT };
const GEL = { roughness: 0.85, doubleSide: true, organic: { noise: 0.3, scale: 18, rim: 0.15, rimPower: 2 } };

export const CELL_MATERIALS: Record<string, MaterialSpec> = {
  'membrana-plasmatica': { color: '#ffffff', vertexColors: true, roughness: 0.42, clearcoat: 0.45, clearcoatRoughness: 0.35, sheen: 0.5, sheenColor: '#FFE1D2', doubleSide: true, organic: MEMBRANE },
  microvilosidades: { color: '#E4AC8F', ...SOFT, organic: { ...MEMBRANE, rim: 0.4 } },
  citoplasma: { color: '#F3D4BE', ...GEL },
  citoesqueleto: { color: '#ffffff', vertexColors: true, roughness: 0.4, clearcoat: 0.2, organic: FINE },
  'parede-celular': { color: '#ffffff', vertexColors: true, roughness: 0.75, clearcoat: 0.05, doubleSide: true, organic: { noise: 0.35, scale: 16, rim: 0.2, rimColor: '#F4FFE0', rimPower: 3 } },
  plasmodesmos: { color: '#5E8C3A', roughness: 0.5, organic: FINE },
  tonoplasto: { color: '#79B9E6', roughness: 0.3, clearcoat: 0.6, doubleSide: true, organic: { ...MEMBRANE, rimColor: '#E6F6FF' } },
  vacuolo: { color: '#9CCDF0', roughness: 0.25, clearcoat: 0.6, doubleSide: true, organic: { noise: 0.08, scale: 6, rim: 0.3, rimColor: '#FFFFFF', rimPower: 2.5 } },
  nucleo: { color: '#CDB4EE', ...GEL },
  'envoltorio-nuclear': { ...TONED, organic: { ...MEMBRANE, rimColor: '#F1E6FF', rim: 0.45 } },
  nucleolo: { color: '#4A2C86', ...SOFT, organic: { noise: 0.35, scale: 20, rim: 0.3, rimColor: '#D9C6FF', rimPower: 3 } },
  cromatina: { color: '#7452C4', ...SOFT, organic: { noise: 0.28, scale: 24, rim: 0.3, rimColor: '#E6D9FF', rimPower: 3 } },
  'reticulo-endoplasmatico-rugoso': { color: '#5285D8', ...SOFT, organic: { ...GRAIN, rimColor: '#DCEBFF' } },
  'reticulo-endoplasmatico-liso': { color: '#7FB5E8', ...SOFT, organic: { ...GRAIN, rimColor: '#E6F2FF' } },
  ribossomos: { color: '#2A3461', roughness: 0.5, organic: FINE },
  'complexo-golgiense': { color: '#F0B23A', ...SOFT, organic: { ...GRAIN, rimColor: '#FFF2C8' } },
  vesiculas: { color: '#F6CF72', ...SOFT, organic: { ...GRAIN, rimColor: '#FFF6DC', rim: 0.45 } },
  mitocondria: { ...TONED, organic: { ...GRAIN, rimColor: '#FFE1CC' } },
  cloroplastos: { ...TONED, organic: { ...GRAIN, rimColor: '#E4FFD6' } },
  amiloplastos: { color: '#F3ECD9', ...SOFT, organic: { noise: 0.2, scale: 14, rim: 0.3, rimColor: '#FFFFFF' } },
  lisossomos: { color: '#55A86C', ...SOFT, organic: { ...GRAIN, rimColor: '#DDFFE6' } },
  peroxissomos: { color: '#BAC44C', ...SOFT, organic: { ...GRAIN, rimColor: '#F6FFD4' } },
  centriolos: { color: '#ffffff', vertexColors: true, ...SOFT, organic: FINE },

  'capsula-bacteriana': { color: '#C4E6D4', roughness: 0.35, clearcoat: 0.6, doubleSide: true, organic: { noise: 0.12, scale: 8, rim: 0.5, rimColor: '#FFFFFF', rimPower: 2 } },
  'membrana-externa': { color: '#ffffff', vertexColors: true, ...SOFT, organic: { ...MEMBRANE, rimColor: '#EAFFF3' } },
  periplasma: { color: '#E6F2E8', roughness: 0.9, doubleSide: true },
  'parede-celular-bacteriana': { color: '#7FB77E', ...SOFT, organic: { noise: 0.35, scale: 30, rim: 0.2, rimColor: '#EEFFE8' } },
  nucleoide: { color: '#7B4FB8', ...SOFT, organic: { ...GRAIN, scale: 26, rimColor: '#E6D9FF' } },
  plasmideos: { color: '#D9534F', ...SOFT, organic: FINE },
  inclusoes: { color: '#E8DCC3', ...SOFT, organic: { noise: 0.3, scale: 18, rim: 0.3 } },
  'ribossomos-70s': { color: '#2A3461', roughness: 0.5, organic: FINE },
  'flagelo-bacteriano': { color: '#ffffff', vertexColors: true, ...SOFT, organic: FINE },
  fimbrias: { color: '#A99B78', ...SOFT, organic: FINE },

  'membrana-mitocondrial-externa': { color: '#DE6538', ...SOFT, organic: { ...MEMBRANE, rimColor: '#FFE1CC' } },
  'espaco-intermembranas': { color: '#FBD6C2', ...GEL },
  'membrana-mitocondrial-interna': { color: '#F08D5E', ...SOFT, organic: { ...MEMBRANE, rimColor: '#FFE9D9' } },
  'cristas-mitocondriais': { color: '#E8834F', ...SOFT, organic: { ...GRAIN, rimColor: '#FFE9D9' } },
  'atp-sintase': { color: '#9B3D1E', roughness: 0.5, organic: FINE },
  'matriz-mitocondrial': { color: '#FBE3D2', ...GEL },
  'dna-mitocondrial': { color: '#7B4FB8', ...SOFT, organic: FINE },

  'envoltorio-cloroplasto': { ...TONED, organic: { ...MEMBRANE, rimColor: '#EAFFDD' } },
  estroma: { color: '#CFE8B6', ...GEL },
  tilacoides: { color: '#2F7A34', ...SOFT, organic: { ...GRAIN, rimColor: '#D6FFCF' } },
  'lamelas-estromais': { color: '#5FA455', ...SOFT, organic: { ...GRAIN, rimColor: '#E0FFD9' } },
  'graos-de-amido': { color: '#F1EAD4', ...SOFT, organic: { noise: 0.2, scale: 14, rim: 0.3, rimColor: '#FFFFFF' } },
  'dna-cloroplasto': { color: '#7B4FB8', ...SOFT, organic: FINE },

  'cromatide-irma': { color: '#D2455B', ...SOFT, organic: { ...GRAIN, scale: 20, rimColor: '#FFD9DF' } },
  'cromatide-irma-b': { color: '#3F7FD0', ...SOFT, organic: { ...GRAIN, scale: 20, rimColor: '#D9E8FF' } },
  centromero: { color: '#3B2B57', ...SOFT, organic: FINE },
  'fuso-mitotico': { color: '#3AA7A0', roughness: 0.6 },
  centrossomo: { color: '#22A39B', ...SOFT, organic: FINE },
  quiasma: { color: '#F2B53C', ...SOFT, organic: FINE },
};

export const CELL_FALLBACK: MaterialSpec = { color: '#C8CED6', roughness: 0.55, doubleSide: true };

/** Legend colour per structure (layers panel), defaults to the material colour. */
export const LEGEND_COLOR: Record<string, string> = {
  'membrana-plasmatica': '#E2A98E',
  'envoltorio-nuclear': '#8C6BC4',
  mitocondria: '#E0663A',
  cloroplastos: '#4FA34A',
  'envoltorio-cloroplasto': '#4FA34A',
  'cromatide-irma': '#D2455B',
  'parede-celular': '#8DB85F',
  citoesqueleto: '#7FC9BB',
  centriolos: '#22A39B',
  'membrana-externa': '#8CB7A1',
  'flagelo-bacteriano': '#8C7A57',
};

/** Translucent layers: default opacity (clicks pass through them to what is inside). */
export const DEFAULT_OPACITY: Record<string, number> = {
  citoplasma: 0.3,
  nucleo: 0.42,
  vacuolo: 0.38,
  tonoplasto: 0.55,
  'capsula-bacteriana': 0.26,
  periplasma: 0.35,
  'matriz-mitocondrial': 0.3,
  estroma: 0.3,
};
