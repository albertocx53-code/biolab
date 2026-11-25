/**
 * Schematic binary fission of a rod-shaped bacterium: mesh definitions plus a
 * pure pose function for a continuous phase value P
 * (0 start · 1 DNA replicated · 2 cell elongated, nucleoids apart ·
 * 3 septum formed · 4 two daughter cells).
 */
import * as THREE from 'three';
import type { CameraPreset } from '@/components/3d/CameraRig';
import { dots, ellipsoid, inside, loop, merge, paint, place, randomQuat, rng, tangle, tube, wall, type Cut, type DistFn } from '@/laboratories/shared/geometry';
import type { MeshDef } from '@/laboratories/shared/types';
import { meiosisShape } from './meiosis';
import { paintMembrane } from './mitosis';

export const FISSION_CUT: Cut = { center: 0.35, width: Math.PI / 2 };
const R = 0.62;
const SEG: [number, number] = [64, 40];
const HIDE = 1e-4;
/** Centre of each daughter once the cells are apart. */
const DAUGHTER_Y = 0.94;

export const FISSION_PRESET: CameraPreset = { position: [0.4, 1.2, 7.2], target: [0, 0, 0], distance: 7.4, minDistance: 0.3, maxDistance: 16 };

export interface FissionModel {
  meshes: MeshDef[];
}

export const FISSION_ENVELOPES = ['parede-celular-bacteriana', 'membrana-plasmatica'] as const;

const ss = (e0: number, e1: number, x: number) => THREE.MathUtils.smoothstep(x, e0, e1);

/** Shape of the mother envelope at phase P (a rod that elongates and then pinches at the waist). */
export function fissionShape(P: number): DistFn {
  const elong = 1.0 + 1.8 * ss(0.6, 2.6, P);
  const pinch = ss(2.2, 3.7, P);
  return meiosisShape(R, 'y', elong, pinch);
}

/** Shape of one daughter cell (a short rod). */
export const daughterShape: DistFn = meiosisShape(R, 'y', 0.9, 0);

/** Distance between the centre of each daughter's content and the origin. */
export function fissionOffset(P: number) {
  return 0.78 * ss(1.0, 2.6, P) + (DAUGHTER_Y - 0.78) * ss(3.5, 4, P);
}

function envelope(id: string, shape: DistFn, kInner: number, structure: string, scaleK: number) {
  const dist: DistFn = (d) => shape(d) * scaleK;
  const g = wall(dist, kInner, FISSION_CUT, SEG);
  return { id, structure, geometry: structure === 'membrana-plasmatica' ? paintMembrane(g, SEG[1]) : g };
}

export function buildFission(): FissionModel {
  const r = rng(77);
  const meshes: MeshDef[] = [];
  const nd = ellipsoid(0.2, 0.34, 0.2);

  // envelopes of the mother cell and of the two daughters (daughters hidden until the end)
  meshes.push(envelope('parede-celular-bacteriana', fissionShape(0), 0.965, 'parede-celular-bacteriana', 1));
  meshes.push(envelope('membrana-plasmatica', fissionShape(0), 0.97, 'membrana-plasmatica', 0.94));
  for (const side of ['a', 'b'] as const) {
    meshes.push(envelope(`parede-${side}`, daughterShape, 0.965, 'parede-celular-bacteriana', 1));
    meshes.push(envelope(`membrana-${side}`, daughterShape, 0.97, 'membrana-plasmatica', 0.94));
  }
  // the septum: a disc that grows inward at the waist
  meshes.push({ id: 'septo', structure: 'parede-celular-bacteriana', geometry: new THREE.CylinderGeometry(R * 0.93, R * 0.93, 0.025, 48) });

  // two copies of the circular chromosome (the second appears during replication)
  for (const side of ['a', 'b'] as const) {
    const pts = tangle(r, new THREE.Vector3(0, -0.2, 0), 220, 0.035, (p) => inside(nd, p, 0.9));
    meshes.push({ id: `nucleoide-${side}`, structure: 'nucleoide', geometry: tube(pts, 0.0105, false, 1400, 5) });
    const plasmids: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 2; i++) {
      const p = new THREE.Vector3(r.range(-0.3, 0.3), r.range(-0.3, 0.3), r.range(-0.3, 0.3));
      if (inside(nd, p, 1.3)) p.multiplyScalar(1.8);
      plasmids.push(place(tube(loop(r.range(0.05, 0.07), r), 0.011, true, 60, 5), p, randomQuat(r)));
    }
    meshes.push({ id: `plasmideos-${side}`, structure: 'plasmideos', geometry: merge(plasmids) });
    const ribo: THREE.Vector3[] = [];
    for (let i = 0; i < 1200 && ribo.length < 150; i++) {
      const p = new THREE.Vector3(r.range(-0.5, 0.5), r.range(-0.5, 0.5), r.range(-0.5, 0.5));
      if (inside(daughterShape, p, 0.68) && !inside(nd, p, 1.1)) ribo.push(p);
    }
    meshes.push({ id: `ribossomos-${side}`, structure: 'ribossomos-70s', geometry: paint(dots(ribo, 0.016), '#2A3461') });
  }
  return { meshes };
}

/** Moves the contents for phase P ∈ [0, 4]. */
export function poseFission(P: number, get: (id: string) => THREE.Mesh | undefined) {
  const off = fissionOffset(P);
  const apart = P >= 3.92;
  const show = (id: string, visible: boolean, pos?: THREE.Vector3, scale = 1) => {
    const m = get(id);
    if (!m) return;
    m.scale.setScalar(visible ? scale : HIDE);
    if (pos) m.position.copy(pos);
    m.updateMatrixWorld();
  };
  // DNA replication: the second nucleoid grows beside the first, then both move to the poles
  const grow = ss(0.15, 0.95, P);
  // the copies sit side by side while the second one forms, then slide to the poles
  const side = 0.2 * grow * (1 - ss(1, 2, P));
  show('nucleoide-a', true, new THREE.Vector3(side, off, 0));
  show('nucleoide-b', grow > 0.02, new THREE.Vector3(-side, -off, 0), Math.max(HIDE, grow));
  show('plasmideos-a', true, new THREE.Vector3(0, off, 0));
  show('plasmideos-b', grow > 0.02, new THREE.Vector3(0, -off, 0), Math.max(HIDE, grow));
  // ribosomes: start as one cloud at the centre, then travel with each half
  show('ribossomos-a', true, new THREE.Vector3(0, 0.12 + off * 0.8, 0));
  show('ribossomos-b', true, new THREE.Vector3(0, -(0.12 + off * 0.8), 0));
  // septum
  const sept = ss(2.4, 3.7, P);
  const m = get('septo');
  if (m) {
    m.position.set(0, 0, 0);
    m.scale.set(sept > 0.01 && !apart ? sept : HIDE, 1, sept > 0.01 && !apart ? sept : HIDE);
    m.updateMatrixWorld();
  }
  // envelopes: mother until separation, then the two daughters
  for (const id of FISSION_ENVELOPES) show(id, !apart);
  for (const side of ['a', 'b'] as const) {
    const y = (side === 'a' ? 1 : -1) * DAUGHTER_Y * (1 + 0.08 * ss(3.92, 4, P));
    show(`parede-${side}`, apart, new THREE.Vector3(0, y, 0));
    show(`membrana-${side}`, apart, new THREE.Vector3(0, y, 0));
  }
}

/** Rewrites the vertices of an envelope mesh for the mother shape at phase P. */
export function deformFissionEnvelope(geo: THREE.BufferGeometry, P: number, kInner: number, scaleK: number) {
  const shape = fissionShape(P);
  const fresh = wall((d) => shape(d) * scaleK, kInner, FISSION_CUT, SEG);
  const src = fresh.getAttribute('position');
  const dst = geo.getAttribute('position') as THREE.BufferAttribute;
  (dst.array as Float32Array).set(src.array as Float32Array);
  dst.needsUpdate = true;
  geo.computeVertexNormals();
  geo.computeBoundingBox();
  geo.computeBoundingSphere();
  fresh.dispose();
}
