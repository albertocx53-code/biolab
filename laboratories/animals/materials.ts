import type { MaterialSpec } from '@/engine/visibility/materials';
import { paint } from '@/laboratories/shared/geometry';
import type { MeshDef } from '@/laboratories/shared/types';
import * as THREE from 'three';
import { ANIMAL_COLOR } from './kit';
import { fbm } from './sculpt';

/**
 * Materials of the Animals laboratory. Colours are baked into the vertices,
 * so the materials are white and only set the finish: moist skin and organs,
 * hard exoskeleton and bone, matte rock and leaves.
 */
const FINISH = { color: '#ffffff', vertexColors: true, roughness: 0.5, clearcoat: 0.25, clearcoatRoughness: 0.4, doubleSide: true };
const WET = { ...FINISH, roughness: 0.3, clearcoat: 0.65, clearcoatRoughness: 0.2, sheen: 0.3, sheenColor: '#ffffff' };
const HARD = { ...FINISH, roughness: 0.42, clearcoat: 0.45, clearcoatRoughness: 0.3 };
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
  septos: 0.35,
  nadadeiras: 0.88,
  'sacos-aereos': 0.5,
  'massa-gelatinosa': 0.35,
  blastocele: 0.3,
  arquentero: 0.45,
  agua: 0.35,
};

/** Bakes the structure colour into meshes that have no vertex colours yet. */
export function colorize(meshes: MeshDef[]): MeshDef[] {
  for (const m of meshes) {
    if (!m.geometry.getAttribute('color')) paint(m.geometry, ANIMAL_COLOR[m.cls ?? m.structure] ?? '#94A3B8');
    if (!PARTICLE.test(m.id)) mottle(m.geometry);
  }
  return meshes;
}

/** Animated particles (blood cells, water, food) keep flat colours. */
const PARTICLE = /^(sv|sa|agua|alim)-\d+$/;

/** Fine natural variation over every surface, so nothing looks like smooth plastic. */
function mottle(g: THREE.BufferGeometry) {
  const p = g.getAttribute('position');
  const c = g.getAttribute('color');
  if (!p || !c) return;
  const q = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    q.fromBufferAttribute(p, i);
    const k = 0.94 + 0.1 * fbm(q, 7, 2) + 0.04 * (fbm(q, 23, 1) - 0.5);
    c.setXYZ(i, Math.min(1, c.getX(i) * k), Math.min(1, c.getY(i) * k), Math.min(1, c.getZ(i) * k));
  }
  c.needsUpdate = true;
}
