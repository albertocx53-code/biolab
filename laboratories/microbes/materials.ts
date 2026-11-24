import type { MaterialSpec } from '@/engine/visibility/materials';
import { paint } from '@/laboratories/shared/geometry';
import type { MeshDef } from '@/laboratories/shared/types';
import { MICROBE_COLOR } from './kit';

/**
 * Materials of the Microorganisms laboratory. Colours are baked into the
 * vertices (one merged mesh can carry several tones), so the materials are
 * white and only set the finish: glossy membranes, matte walls and soil.
 */
const FINISH = { color: '#ffffff', vertexColors: true, roughness: 0.5, clearcoat: 0.25, clearcoatRoughness: 0.4, doubleSide: true };
const WET = { ...FINISH, roughness: 0.32, clearcoat: 0.6, clearcoatRoughness: 0.25, sheen: 0.3, sheenColor: '#ffffff' };
const MATTE = { ...FINISH, roughness: 0.85, clearcoat: 0 };

const WET_IDS = new Set(['membrana-ameba', 'pseudopode', 'pelicula', 'pelicula-euglena', 'vacuolo', 'vacuolo-contratil', 'vacuolo-digestivo', 'capsula', 'envelope', 'broto', 'membrana-plasmatica']);
const MATTE_IDS = new Set(['solo', 'substrato', 'micelio', 'hifas', 'rizoides', 'esporangio', 'esporos', 'parede-celular-fungica', 'pileo', 'estipe', 'lamelas', 'volva', 'anel']);

export const MICROBE_MATERIALS: Record<string, MaterialSpec> = Object.fromEntries(
  Object.keys(MICROBE_COLOR).map((id) => [id, WET_IDS.has(id) ? WET : MATTE_IDS.has(id) ? MATTE : FINISH]),
);

export const MICROBE_FALLBACK: MaterialSpec = FINISH;
export const LEGEND_COLOR: Record<string, string> = MICROBE_COLOR;
/** Translucent by default so the inside of the cells shows. */
export const DEFAULT_OPACITY: Record<string, number> = { citoplasma: 0.35, capsula: 0.4, 'placa-de-petri': 0.35, antibiotico: 0.55 };

/** Bakes the structure colour into meshes that have no vertex colours yet. */
export function colorize(meshes: MeshDef[]): MeshDef[] {
  for (const m of meshes) if (!m.geometry.getAttribute('color')) paint(m.geometry, MICROBE_COLOR[m.cls ?? m.structure] ?? '#94A3B8');
  return meshes;
}
