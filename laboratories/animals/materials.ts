import type { MaterialSpec } from '@/engine/visibility/materials';
import { paint } from '@/laboratories/shared/geometry';
import type { MeshDef } from '@/laboratories/shared/types';
import { ANIMAL_COLOR } from './kit';

/**
 * Materials of the Animals laboratory. Colours are baked into the vertices,
 * so the materials are white and only set the finish: moist skin and organs,
 * hard exoskeleton and bone, matte rock and leaves.
 */
const FINISH = { color: '#ffffff', vertexColors: true, roughness: 0.5, clearcoat: 0.25, clearcoatRoughness: 0.4, doubleSide: true };
const WET = { ...FINISH, roughness: 0.3, clearcoat: 0.65, clearcoatRoughness: 0.2, sheen: 0.3, sheenColor: '#ffffff' };
const HARD = { ...FINISH, roughness: 0.38, clearcoat: 0.8, clearcoatRoughness: 0.15 };
const MATTE = { ...FINISH, roughness: 0.88, clearcoat: 0 };

const WET_IDS = new Set([
  'epiderme', 'gastroderme', 'tentaculos', 'corpo-planaria', 'parede-minhoca', 'clitelo', 'pele-sapo', 'pele-peixe', 'girino', 'cauda',
  'coracao', 'pulmoes', 'figado', 'estomago', 'intestino-vertebrado', 'rins', 'encefalo', 'sacos-aereos', 'papo', 'moela-ave',
  'zigoto', 'blastomeros', 'morula', 'ectoderme', 'endoderme', 'mesoderme', 'massa-gelatinosa', 'lagarta', 'olhos', 'olhos-compostos',
  'atrio', 'ventriculo', 'atrio-direito', 'atrio-esquerdo', 'ventriculo-misto', 'ventriculo-direito', 'ventriculo-esquerdo', 'seio-venoso', 'bulbo-arterioso',
]);
const HARD_IDS = new Set(['cabeca', 'torax', 'abdome', 'patas', 'antenas', 'aparelho-bucal', 'espiculas', 'coluna-vertebral', 'quilha', 'bico', 'pupa', 'espinhos', 'face-aboral']);
const MATTE_IDS = new Set(['rocha', 'pinacoderme', 'mesohilo', 'penas', 'folha-planta', 'galho', 'face-oral']);

export const ANIMAL_MATERIALS: Record<string, MaterialSpec> = Object.fromEntries(
  Object.keys(ANIMAL_COLOR).map((id) => [id, WET_IDS.has(id) ? WET : HARD_IDS.has(id) ? HARD : MATTE_IDS.has(id) ? MATTE : FINISH]),
);

export const ANIMAL_FALLBACK: MaterialSpec = FINISH;
export const LEGEND_COLOR: Record<string, string> = ANIMAL_COLOR;
/** Skins and walls translucent by default so the organs inside show. */
export const DEFAULT_OPACITY: Record<string, number> = {
  'corpo-planaria': 0.42,
  'parede-minhoca': 0.3,
  septos: 0.35,
  'pele-peixe': 0.32,
  'pele-sapo': 0.3,
  penas: 0.3,
  'sacos-aereos': 0.5,
  'face-aboral': 0.32,
  'massa-gelatinosa': 0.35,
  blastocele: 0.3,
  arquentero: 0.45,
  agua: 0.35,
};

/** Bakes the structure colour into meshes that have no vertex colours yet. */
export function colorize(meshes: MeshDef[]): MeshDef[] {
  for (const m of meshes) if (!m.geometry.getAttribute('color')) paint(m.geometry, ANIMAL_COLOR[m.cls ?? m.structure] ?? '#94A3B8');
  return meshes;
}
