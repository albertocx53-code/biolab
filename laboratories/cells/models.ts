/**
 * Builders for the procedural cell models. Each returns plain mesh
 * definitions (one stable id per mesh, linked to a structure id from the
 * catalog) plus named anchor points used by the process animations.
 * Everything is schematic and out of scale; sizes are in scene units.
 */
import * as THREE from 'three';
import type { CameraPreset } from '@/components/3d/CameraRig';
import type { CellModelId } from './catalog';
import {
  basisQuat,
  capsuleY,
  cisterna,
  cutFaces,
  dots,
  ellipsoid,
  inside,
  inWedge,
  loop,
  merge,
  paint,
  patch,
  place,
  rng,
  scaled,
  shell,
  slicedCapsule,
  superellipsoid,
  tangle,
  tube,
  wall,
  wobble,
  type Cut,
  type DistFn,
  type Rng,
} from './geometry';

export interface MeshDef {
  id: string;
  structure: string;
  /** Material class (defaults to the structure id). */
  cls?: string;
  geometry: THREE.BufferGeometry;
}

export interface BuiltModel {
  meshes: MeshDef[];
  anchors: Record<string, THREE.Vector3[]>;
  preset: CameraPreset;
}

const VIEW_PHI = 0.55; // the cut-away faces the default camera
const CUT: Cut = { center: VIEW_PHI, width: Math.PI / 2 };

function presetFor(dist: number, target: [number, number, number] = [0, 0, 0], elev = 0.42, phi = VIEW_PHI): CameraPreset {
  const p: [number, number, number] = [
    target[0] + Math.sin(phi) * Math.cos(elev) * dist,
    target[1] + Math.sin(elev) * dist,
    target[2] + Math.cos(phi) * Math.cos(elev) * dist,
  ];
  return { position: p, target, distance: dist, minDistance: 0.25, maxDistance: dist * 2.4 };
}

/** Simple occupancy test so organelles do not overlap. */
class Space {
  items: { c: THREE.Vector3; r: number }[] = [];
  free(c: THREE.Vector3, r: number) {
    return this.items.every((i) => i.c.distanceTo(c) > i.r + r);
  }
  take(c: THREE.Vector3, r: number) {
    this.items.push({ c: c.clone(), r });
  }
}

/** Finds a random free spot that satisfies `ok`. */
function spot(r: Rng, box: number, ok: (p: THREE.Vector3) => boolean, space: Space, radius: number, tries = 400) {
  for (let i = 0; i < tries; i++) {
    const p = new THREE.Vector3(r.range(-box, box), r.range(-box, box), r.range(-box, box));
    if (ok(p) && space.free(p, radius)) {
      space.take(p, radius);
      return p;
    }
  }
  return null;
}

const toCamera = (phi = VIEW_PHI) => new THREE.Vector3(Math.sin(phi), 0.45, Math.cos(phi)).normalize();

/** Nucleus with cut-away envelope, nuclear pores, nucleoplasm face, nucleolus and chromatin. */
function nucleus(r: Rng, centre: THREE.Vector3, radius: number, meshes: MeshDef[], anchors: BuiltModel['anchors']) {
  const nd = wobble(ellipsoid(radius, radius * 0.9, radius), 0.03, 7);
  const env = paint(wall(nd, 0.93, CUT, [64, 36]), '#8C6BC4');
  const pores: THREE.Vector3[] = [];
  for (let i = 0; i < 60; i++) {
    const d = r.dir();
    const p = d.multiplyScalar(nd(d) * 1.004);
    if (!inWedge(p, CUT)) pores.push(p);
  }
  const poreGeo = paint(dots(pores, radius * 0.045, 1), '#4B3B78');
  meshes.push({ id: 'envoltorio-nuclear', structure: 'envoltorio-nuclear', geometry: place(merge([env, poreGeo]), centre) });
  meshes.push({ id: 'nucleoplasma', structure: 'nucleo', geometry: place(cutFaces(scaled(nd, 0.93), null, CUT, 36), centre) });
  const nucleolusC = new THREE.Vector3(radius * 0.08, radius * 0.12, radius * 0.1);
  const nl = new THREE.IcosahedronGeometry(radius * 0.3, 3);
  meshes.push({ id: 'nucleolo', structure: 'nucleolo', geometry: place(nl, nucleolusC.clone().add(centre)) });
  const strands: THREE.BufferGeometry[] = [];
  for (let s = 0; s < 4; s++) {
    const start = r.dir().multiplyScalar(radius * 0.5);
    const pts = tangle(r, start, 46, radius * 0.11, (p) => inside(nd, p, 0.84) && p.distanceTo(nucleolusC) > radius * 0.36);
    strands.push(tube(pts, radius * 0.022, false, pts.length * 5, 5));
  }
  meshes.push({ id: 'cromatina', structure: 'cromatina', geometry: place(merge(strands), centre) });
  anchors.nucleus = [centre.clone()];
  anchors.chromatin = [centre.clone().add(new THREE.Vector3(-radius * 0.3, -radius * 0.2, radius * 0.2))];
  return nd;
}

/** Rough ER sheets around a nucleus, with bound ribosomes. */
function roughER(r: Rng, nd: DistFn, centre: THREE.Vector3, phiFrom: number, phiTo: number, layers: number, ribos: THREE.Vector3[], keep: (p: THREE.Vector3) => boolean) {
  const sheets: THREE.BufferGeometry[] = [];
  for (let k = 0; k < layers; k++) {
    const kk = 1.22 + k * 0.13;
    const t0 = 0.55 + r.range(-0.1, 0.15);
    const t1 = 2.45 + r.range(-0.15, 0.1);
    const g = patch(scaled(nd, kk), [t0, t1], [phiFrom + k * 0.08, phiTo - k * 0.05], [30, 18], 0.035, k * 1.3);
    sheets.push(g);
    const pos = g.getAttribute('position');
    for (let i = 0; i < pos.count; i += 3) {
      if (r.next() > 0.55) continue;
      const p = new THREE.Vector3().fromBufferAttribute(pos, i);
      const out = p.clone().normalize().multiplyScalar(0.022 * (r.next() > 0.5 ? 1 : -1));
      const wp = p.add(out).add(centre);
      if (keep(wp)) ribos.push(wp);
    }
  }
  const mid = patch(scaled(nd, 1.22 + layers * 0.065), [1.5, 1.5], [(phiFrom + phiTo) / 2, (phiFrom + phiTo) / 2], [1, 1]);
  const anchor = new THREE.Vector3().fromBufferAttribute(mid.getAttribute('position'), 0).add(centre);
  mid.dispose();
  return { geometry: place(merge(sheets), centre), anchor };
}

/** Golgi stack facing `towards` (cis face) with transport/secretory vesicles. */
function golgi(r: Rng, at: THREE.Vector3, towards: THREE.Vector3, size: number) {
  const axis = at.clone().sub(towards).normalize(); // cis → trans
  const q = basisQuat(axis, toCamera());
  const parts: THREE.BufferGeometry[] = [];
  const n = 5;
  for (let i = 0; i < n; i++) {
    const y = (i - (n - 1) / 2) * size * 0.2;
    const w = size * (0.82 + 0.18 * Math.sin((i / (n - 1)) * Math.PI));
    parts.push(place(cisterna(w, w * 0.62, size * 0.055, size * 0.22, 26), [0, y, 0]));
  }
  const g = place(merge(parts), at, q);
  const ves: THREE.Vector3[] = [];
  for (let i = 0; i < 14; i++) {
    const a = r.range(0, Math.PI * 2);
    const side = i < 5 ? -1 : 1;
    const local = new THREE.Vector3(Math.cos(a) * size * r.range(0.6, 1.1), side * size * r.range(0.55, 0.95), Math.sin(a) * size * r.range(0.4, 0.75));
    ves.push(local.applyQuaternion(q).add(at));
  }
  return {
    geometry: g,
    vesicles: ves,
    cis: at.clone().addScaledVector(axis, -size * 0.6),
    trans: at.clone().addScaledVector(axis, size * 0.62),
    axis,
  };
}

function centriolePair(at: THREE.Vector3, size: number) {
  const one = (q: THREE.Quaternion, offset: THREE.Vector3) => {
    const rods: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      for (let k = 0; k < 3; k++) {
        const rr = size * (0.3 + k * 0.07);
        const rod = new THREE.CylinderGeometry(size * 0.045, size * 0.045, size, 6);
        rods.push(place(rod, [Math.cos(a + k * 0.12) * rr, 0, Math.sin(a + k * 0.12) * rr]));
      }
    }
    return place(merge(rods), offset, q);
  };
  return place(
    merge([one(new THREE.Quaternion(), new THREE.Vector3()), one(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2), new THREE.Vector3(0, -size * 0.55, size * 0.45))]),
    at,
  );
}

function blob(radius: number, seed: number) {
  const g = new THREE.IcosahedronGeometry(1, 2);
  const p = g.getAttribute('position');
  const d = new THREE.Vector3();
  const f = wobble(() => 1, 0.12, seed);
  for (let i = 0; i < p.count; i++) {
    d.fromBufferAttribute(p, i).normalize();
    p.setXYZ(i, d.x * radius * f(d), d.y * radius * f(d), d.z * radius * f(d));
  }
  g.computeVertexNormals();
  return g;
}

/** Places sliced, cut-towards-camera organelles (mitochondria / chloroplasts). */
function slicedOrganelles(
  r: Rng,
  count: number,
  prefix: string,
  structure: string,
  dims: [number, number],
  colors: [string, string, string],
  folds: 'cristae' | 'grana',
  ok: (p: THREE.Vector3) => boolean,
  space: Space,
  box: number,
  meshes: MeshDef[],
) {
  const centres: THREE.Vector3[] = [];
  for (let i = 0; i < count; i++) {
    const h = dims[0] * r.range(0.75, 1.25);
    const rad = dims[1] * r.range(0.9, 1.1);
    const axis = r.dir();
    const reach = h + rad;
    let placed: THREE.Vector3 | null = null;
    for (let t = 0; t < 300 && !placed; t++) {
      const p = new THREE.Vector3(r.range(-box, box), r.range(-box, box), r.range(-box, box));
      const a = p.clone().addScaledVector(axis, reach);
      const b = p.clone().addScaledVector(axis, -reach);
      if (ok(p) && ok(a) && ok(b) && space.free(p, reach * 0.8)) placed = p;
    }
    if (!placed) continue;
    space.take(placed, reach * 0.8);
    const g = slicedCapsule(h, rad, colors[0], colors[1], colors[2], folds, r);
    meshes.push({ id: `${prefix}-${i + 1}`, structure, geometry: place(g, placed, basisQuat(axis, toCamera())) });
    centres.push(placed);
  }
  return centres;
}

// ===================================================================== animal

function animalCell(): BuiltModel {
  const r = rng(11);
  const meshes: MeshDef[] = [];
  const anchors: BuiltModel['anchors'] = {};
  const cell = wobble(ellipsoid(1.5, 1.12, 1.32), 0.045, 3);
  const memIn = scaled(cell, 0.975);
  meshes.push({ id: 'membrana-plasmatica', structure: 'membrana-plasmatica', geometry: wall(cell, 0.975, CUT, [96, 56]) });

  const NR = 0.44;
  const nd = nucleus(r, new THREE.Vector3(), NR, meshes, anchors);
  meshes.push({ id: 'citoplasma', structure: 'citoplasma', geometry: cutFaces(memIn, nd, CUT, 56) });

  const space = new Space();
  space.take(new THREE.Vector3(), NR * 1.9);
  const ribos: THREE.Vector3[] = [];
  const inCyto = (p: THREE.Vector3, margin = 0.9) => inside(cell, p, margin) && !inside(nd, p, 1.1);
  const rer = roughER(r, nd, new THREE.Vector3(), VIEW_PHI - 2.3, VIEW_PHI + 0.15, 4, ribos, (p) => inCyto(p, 0.94));
  meshes.push({ id: 'reticulo-endoplasmatico-rugoso', structure: 'reticulo-endoplasmatico-rugoso', geometry: rer.geometry });
  anchors.rer = [rer.anchor];

  // smooth ER: tangled tubules on the other side of the nucleus
  const ser: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 7; i++) {
    const a = VIEW_PHI + r.range(0.9, 2.1);
    const start = new THREE.Vector3(Math.sin(a) * 0.9, r.range(-0.35, 0.35), Math.cos(a) * 0.9);
    const pts = tangle(r, start, 16, 0.07, (p) => inCyto(p, 0.86) && p.length() > NR * 1.55 && !inWedge(p, CUT));
    ser.push(tube(pts, 0.017, false, 90, 6));
  }
  meshes.push({ id: 'reticulo-endoplasmatico-liso', structure: 'reticulo-endoplasmatico-liso', geometry: merge(ser) });
  space.take(new THREE.Vector3(Math.sin(VIEW_PHI + 1.5) * 0.9, 0, Math.cos(VIEW_PHI + 1.5) * 0.9), 0.32);

  // Golgi between nucleus and membrane, slightly inside the cut-away
  const gAt = new THREE.Vector3(Math.sin(VIEW_PHI + 0.15) * 0.82, 0.38, Math.cos(VIEW_PHI + 0.15) * 0.82);
  const go = golgi(r, gAt, new THREE.Vector3(0, 0.1, 0), 0.27);
  space.take(gAt, 0.36);
  meshes.push({ id: 'complexo-golgiense', structure: 'complexo-golgiense', geometry: go.geometry });
  const exitDir = go.axis.clone();
  const exit = exitDir.clone().multiplyScalar(cell(exitDir) * 0.97);
  const between = go.trans.clone().lerp(exit, 0.5);
  meshes.push({ id: 'vesiculas', structure: 'vesiculas', geometry: dots([...go.vesicles, between], (i) => (i < 5 ? 0.026 : 0.034), 2) });
  Object.assign(anchors, { golgiCis: [go.cis], golgiTrans: [go.trans], exit: [exit] });

  // centrioles near the nucleus (centrosome)
  const cAt = new THREE.Vector3(Math.sin(VIEW_PHI - 0.5) * 0.66, 0.42, Math.cos(VIEW_PHI - 0.5) * 0.66);
  space.take(cAt, 0.14);
  meshes.push({ id: 'centriolos', structure: 'centriolos', geometry: centriolePair(cAt, 0.13) });

  const mito = slicedOrganelles(r, 11, 'mitocondria', 'mitocondria', [0.13, 0.08], ['#DE6538', '#F08D5E', '#F8C8A0'], 'cristae', (p) => inCyto(p, 0.86), space, 1.4, meshes);
  anchors.mitochondria = mito;

  for (let i = 0; i < 6; i++) {
    const rad = r.range(0.05, 0.075);
    const p = spot(r, 1.4, (q) => inCyto(q, 0.85), space, rad + 0.03);
    if (p) meshes.push({ id: `lisossomo-${i + 1}`, structure: 'lisossomos', geometry: place(blob(rad, i + 2), p) });
  }
  for (let i = 0; i < 4; i++) {
    const rad = r.range(0.04, 0.055);
    const p = spot(r, 1.4, (q) => inCyto(q, 0.85), space, rad + 0.03);
    if (p) meshes.push({ id: `peroxissomo-${i + 1}`, structure: 'peroxissomos', geometry: place(blob(rad, i + 9), p) });
  }
  for (let i = 0; i < 240; i++) {
    const p = new THREE.Vector3(r.range(-1.5, 1.5), r.range(-1.1, 1.1), r.range(-1.3, 1.3));
    if (inCyto(p, 0.93) && space.free(p, 0.01)) ribos.push(p);
  }
  meshes.push({ id: 'ribossomos', structure: 'ribossomos', geometry: dots(ribos, 0.013) });
  anchors.membrane = membranePoints(r, cell, 0.97, 24);
  return { meshes, anchors, preset: presetFor(6.2) };
}

function membranePoints(r: Rng, dist: DistFn, k: number, n: number, avoid?: Cut) {
  const pts: THREE.Vector3[] = [];
  while (pts.length < n) {
    const d = r.dir();
    const p = d.multiplyScalar(dist(d) * k);
    if (!avoid || !inWedge(p, avoid)) pts.push(p);
  }
  return pts;
}

// ===================================================================== plant

function plantCell(): BuiltModel {
  const r = rng(23);
  const meshes: MeshDef[] = [];
  const anchors: BuiltModel['anchors'] = {};
  const wallD = superellipsoid(1.6, 1.18, 1.18, 5);
  const mem = scaled(wallD, 0.935);
  const memIn = scaled(mem, 0.982);
  const vac = wobble(superellipsoid(1.08, 0.62, 0.66, 3), 0.04, 5);
  meshes.push({ id: 'parede-celular', structure: 'parede-celular', geometry: wall(wallD, 0.94, CUT, [96, 56]) });
  meshes.push({ id: 'membrana-plasmatica', structure: 'membrana-plasmatica', geometry: wall(mem, 0.982, CUT, [96, 56]) });
  meshes.push({ id: 'citoplasma', structure: 'citoplasma', geometry: cutFaces(memIn, vac, CUT, 56) });
  meshes.push({ id: 'vacuolo', structure: 'vacuolo', geometry: merge([shell(vac, CUT, [80, 44]), cutFaces(vac, null, CUT, 44)]) });
  anchors.vacuole = [new THREE.Vector3()];

  // nucleus pushed to the side by the vacuole (inside the cut-away, top)
  const nC = new THREE.Vector3(Math.sin(VIEW_PHI) * 0.62, 0.8, Math.cos(VIEW_PHI) * 0.62);
  const NR = 0.22;
  const nd = nucleus(r, nC, NR, meshes, anchors);
  const space = new Space();
  space.take(nC, NR * 1.7);
  const inCyto = (p: THREE.Vector3, margin = 0.92) => inside(mem, p, margin) && !inside(vac, p, 1.07) && !inside(nd, p.clone().sub(nC), 1.1);
  const ribos: THREE.Vector3[] = [];
  const rer = roughER(r, nd, nC, VIEW_PHI - 2.0, VIEW_PHI + 0.4, 3, ribos, (p) => inCyto(p, 0.95));
  meshes.push({ id: 'reticulo-endoplasmatico-rugoso', structure: 'reticulo-endoplasmatico-rugoso', geometry: rer.geometry });
  anchors.rer = [rer.anchor];

  const gAt = new THREE.Vector3(Math.sin(VIEW_PHI + 0.55) * 1.2, 0.72, Math.cos(VIEW_PHI + 0.55) * 1.2);
  const go = golgi(r, gAt, nC, 0.17);
  space.take(gAt, 0.24);
  meshes.push({ id: 'complexo-golgiense', structure: 'complexo-golgiense', geometry: go.geometry });
  meshes.push({ id: 'vesiculas', structure: 'vesiculas', geometry: dots(go.vesicles.filter((v) => inside(mem, v, 0.97)), 0.02, 2) });

  const box = 1.55;
  const chloro = slicedOrganelles(r, 16, 'cloroplasto', 'cloroplastos', [0.1, 0.085], ['#4FA34A', '#7DC36B', '#2E6E2E'], 'grana', (p) => inCyto(p, 0.93), space, box, meshes);
  anchors.chloroplasts = chloro;
  anchors.mitochondria = slicedOrganelles(r, 6, 'mitocondria', 'mitocondria', [0.08, 0.06], ['#DE6538', '#F08D5E', '#F8C8A0'], 'cristae', (p) => inCyto(p, 0.93), space, box, meshes);
  for (let i = 0; i < 3; i++) {
    const rad = 0.04;
    const p = spot(r, box, (q) => inCyto(q, 0.92), space, rad + 0.02);
    if (p) meshes.push({ id: `peroxissomo-${i + 1}`, structure: 'peroxissomos', geometry: place(blob(rad, i + 4), p) });
  }
  for (let i = 0; i < 700 && ribos.length < 260; i++) {
    const p = new THREE.Vector3(r.range(-1.5, 1.5), r.range(-1.1, 1.1), r.range(-1.1, 1.1));
    if (inCyto(p, 0.95) && space.free(p, 0.01)) ribos.push(p);
  }
  meshes.push({ id: 'ribossomos', structure: 'ribossomos', geometry: dots(ribos, 0.012) });
  anchors.membrane = membranePoints(r, mem, 0.98, 24);
  anchors.wall = membranePoints(r, wallD, 1.0, 24);
  return { meshes, anchors, preset: presetFor(6.4) };
}

// ===================================================================== prokaryote

/** Built with the long axis on local Y, then laid horizontally (Y → −X). */
const LAY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2);
const PRO_CUT: Cut = { center: Math.PI / 4, width: Math.PI / 2 };

function prokaryote(): BuiltModel {
  const r = rng(37);
  const meshes: MeshDef[] = [];
  const anchors: BuiltModel['anchors'] = {};
  const cap = capsuleY(0.95, 0.44);
  meshes.push({ id: 'capsula-bacteriana', structure: 'capsula-bacteriana', geometry: shell(scaled(cap, 1.17), PRO_CUT, [80, 64]) });
  meshes.push({ id: 'parede-celular-bacteriana', structure: 'parede-celular-bacteriana', geometry: wall(scaled(cap, 1.075), 0.955, PRO_CUT, [80, 64]) });
  meshes.push({ id: 'membrana-plasmatica', structure: 'membrana-plasmatica', geometry: wall(scaled(cap, 1.022), 0.975, PRO_CUT, [80, 64]) });
  const cyt = scaled(cap, 0.996);
  meshes.push({ id: 'citoplasma', structure: 'citoplasma', geometry: cutFaces(cyt, null, PRO_CUT, 64) });

  const nucl = ellipsoid(0.24, 0.62, 0.24);
  const strand = tangle(r, new THREE.Vector3(0, -0.4, 0), 220, 0.045, (p) => inside(nucl, p));
  meshes.push({ id: 'nucleoide', structure: 'nucleoide', geometry: tube(strand, 0.011, false, 1400, 5) });
  anchors.nucleoid = [new THREE.Vector3()];

  const space = new Space();
  space.take(new THREE.Vector3(0, 0, 0), 0.3);
  const plasmids: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 3; i++) {
    const p = spot(r, 1.2, (q) => inside(cyt, q, 0.78) && !inside(nucl, q, 1.15), space, 0.1);
    if (p) plasmids.push(place(tube(loop(r.range(0.06, 0.085), r), 0.011, true, 60, 5), p, new THREE.Quaternion().setFromEuler(new THREE.Euler(r.range(0, 3), r.range(0, 3), 0))));
  }
  meshes.push({ id: 'plasmideos', structure: 'plasmideos', geometry: merge(plasmids) });

  const ribos: THREE.Vector3[] = [];
  for (let i = 0; i < 1200 && ribos.length < 300; i++) {
    const p = new THREE.Vector3(r.range(-0.5, 0.5), r.range(-1.4, 1.4), r.range(-0.5, 0.5));
    if (inside(cyt, p, 0.93) && space.free(p, 0.015) && !inside(nucl, p, 0.8)) ribos.push(p);
  }
  meshes.push({ id: 'ribossomos-70s', structure: 'ribossomos-70s', geometry: dots(ribos, 0.016) });

  // flagellum: helical filament from the lower pole, with a hook
  const base = new THREE.Vector3(0, -(0.95 + 0.44 * 1.07), 0);
  const pts: THREE.Vector3[] = [base.clone().add(new THREE.Vector3(0, 0.05, 0))];
  for (let i = 0; i <= 120; i++) {
    const t = i / 120;
    const amp = 0.13 * Math.min(1, t * 6);
    const a = t * Math.PI * 2 * 4.2;
    pts.push(new THREE.Vector3(Math.cos(a) * amp, base.y - 0.06 - t * 2.4, Math.sin(a) * amp));
  }
  meshes.push({ id: 'flagelo-bacteriano', structure: 'flagelo-bacteriano', geometry: tube(pts, 0.02, false, 600, 6) });
  anchors.flagellumAxis = [base.clone(), base.clone().add(new THREE.Vector3(0, -1, 0))];

  const fim: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 110; i++) {
    const d = r.dir();
    const p = d.clone().multiplyScalar(cap(d) * 1.07);
    if (inWedge(p, PRO_CUT) || Math.abs(p.y) > 1.3) continue;
    const len = r.range(0.14, 0.24);
    const c = new THREE.CylinderGeometry(0.0055, 0.0055, len, 4);
    fim.push(place(c, p.clone().addScaledVector(d, len / 2), new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d)));
  }
  meshes.push({ id: 'fimbrias', structure: 'fimbrias', geometry: merge(fim) });

  for (const m of meshes) m.geometry.applyQuaternion(LAY);
  for (const k of Object.keys(anchors)) anchors[k] = anchors[k].map((p) => p.clone().applyQuaternion(LAY));
  return { meshes, anchors, preset: presetFor(6.6, [-0.35, 0, 0], 0.5, 0.25) };
}

// ===================================================================== mitochondrion (detail)

const HALF_CUT: Cut = { center: Math.PI / 4, width: Math.PI };

/** Half-disc plate in the remaining half of a HALF_CUT capsule. */
function halfPlate(radius: number, y: number, xShift: number, scaleX = 0.8) {
  const g = new THREE.CircleGeometry(radius, 28, Math.PI, Math.PI);
  g.rotateX(Math.PI / 2);
  g.scale(scaleX, 1, 1);
  g.translate(xShift, y, 0);
  g.rotateY(HALF_CUT.center);
  return g;
}

function mitochondrionDetail(): BuiltModel {
  const r = rng(51);
  const meshes: MeshDef[] = [];
  const anchors: BuiltModel['anchors'] = {};
  const H = 1.15;
  const R = 0.66;
  const cap = capsuleY(H, R);
  const inner = scaled(cap, 0.89);
  meshes.push({ id: 'membrana-mitocondrial-externa', structure: 'membrana-mitocondrial-externa', geometry: wall(cap, 0.97, HALF_CUT, [64, 72]) });
  meshes.push({ id: 'espaco-intermembranas', structure: 'espaco-intermembranas', geometry: cutFaces(scaled(cap, 0.97), scaled(inner, 1.0), HALF_CUT, 72) });
  meshes.push({ id: 'membrana-mitocondrial-interna', structure: 'membrana-mitocondrial-interna', geometry: wall(inner, 0.965, HALF_CUT, [64, 72]) });
  meshes.push({ id: 'matriz-mitocondrial', structure: 'matriz-mitocondrial', geometry: cutFaces(scaled(inner, 0.96), null, HALF_CUT, 72) });

  const cristae: THREE.BufferGeometry[] = [];
  const atp: THREE.Vector3[] = [];
  const n = 9;
  const normal = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i < n; i++) {
    const y = -H + ((i + 0.5) / n) * 2 * H + r.range(-0.04, 0.04);
    const side = i % 2 ? 1 : -1;
    const rad = R * 0.86;
    const plate = halfPlate(rad, y, side * R * 0.2, 0.74);
    cristae.push(plate);
    // ATP synthase knobs on both faces of each crista
    const pos = plate.getAttribute('position');
    for (let k = 0; k < pos.count; k++) {
      if (r.next() > 0.5) continue;
      const p = new THREE.Vector3().fromBufferAttribute(pos, k);
      if (p.length() < 0.05) continue;
      atp.push(p.clone().addScaledVector(normal, 0.03), p.clone().addScaledVector(normal, -0.03));
    }
  }
  meshes.push({ id: 'cristas-mitocondriais', structure: 'cristas-mitocondriais', geometry: merge(cristae) });
  meshes.push({ id: 'atp-sintase', structure: 'atp-sintase', geometry: dots(atp, 0.02, 1) });

  const dna: THREE.BufferGeometry[] = [];
  const back = new THREE.Vector3(-Math.sin(HALF_CUT.center), 0, -Math.cos(HALF_CUT.center));
  for (let i = 0; i < 3; i++) {
    const y = -H * 0.7 + i * H * 0.7;
    const at = back.clone().multiplyScalar(R * 0.35).setY(y + 0.08);
    dna.push(place(tube(loop(0.09, r), 0.012, true, 60, 5), at, basisQuat(new THREE.Vector3(0, 1, 0).add(r.dir().multiplyScalar(0.3)), toCamera())));
  }
  meshes.push({ id: 'dna-mitocondrial', structure: 'dna-mitocondrial', geometry: merge(dna) });

  anchors.matrix = Array.from({ length: 8 }, (_, i) => back.clone().multiplyScalar(R * 0.25).setY(-H + (i / 7) * 2 * H));
  anchors.outside = Array.from({ length: 10 }, () => {
    const d = r.dir();
    return d.multiplyScalar(cap(d) * 1.35);
  });
  for (const m of meshes) m.geometry.applyQuaternion(LAY);
  for (const k of Object.keys(anchors)) anchors[k] = anchors[k].map((p) => p.clone().applyQuaternion(LAY));
  return { meshes, anchors, preset: presetFor(6.4, [0, 0, 0], 0.62, 0.15) };
}

// ===================================================================== chloroplast (detail)

function chloroplastDetail(): BuiltModel {
  const r = rng(63);
  const meshes: MeshDef[] = [];
  const anchors: BuiltModel['anchors'] = {};
  const lens = superellipsoid(0.82, 1.65, 0.6, 2.3);
  const inner = scaled(lens, 0.94);
  const env = merge([paint(wall(lens, 0.975, HALF_CUT, [64, 72]), '#4FA34A'), paint(wall(inner, 0.975, HALF_CUT, [64, 72]), '#86C873')]);
  meshes.push({ id: 'envoltorio-cloroplasto', structure: 'envoltorio-cloroplasto', geometry: env });
  meshes.push({ id: 'estroma', structure: 'estroma', geometry: cutFaces(scaled(inner, 0.97), null, HALF_CUT, 72) });

  // grana: stacks of thylakoid discs (stack axis = local X, which becomes vertical)
  const grana: THREE.BufferGeometry[] = [];
  const lamellae: THREE.BufferGeometry[] = [];
  const backDir = new THREE.Vector3(-Math.sin(HALF_CUT.center), 0, -Math.cos(HALF_CUT.center));
  const centres: THREE.Vector3[] = [];
  const cols = 6;
  for (let i = 0; i < cols; i++) {
    const y = -1.25 + (i / (cols - 1)) * 2.5;
    for (const depth of [0.12, 0.36]) {
      const c = backDir.clone().multiplyScalar(depth).setY(y + r.range(-0.08, 0.08));
      c.x += r.range(-0.12, 0.12);
      if (!inside(inner, c, 0.75)) continue;
      const discs = 6 + Math.floor(r.next() * 4);
      for (let k = 0; k < discs; k++) {
        const disc = new THREE.CylinderGeometry(0.15, 0.15, 0.034, 22);
        disc.rotateZ(Math.PI / 2);
        grana.push(place(disc, c.clone().add(new THREE.Vector3((k - (discs - 1) / 2) * 0.048, 0, 0))));
      }
      centres.push(c);
    }
  }
  for (let i = 0; i < centres.length; i++)
    for (let j = i + 1; j < centres.length; j++) {
      const a = centres[i];
      const b = centres[j];
      if (Math.abs(a.y - b.y) > 0.6 || a.distanceTo(b) > 0.65) continue;
      const len = a.distanceTo(b);
      const plate = new THREE.BoxGeometry(0.016, len, 0.12);
      const xOff = r.range(-0.1, 0.1);
      lamellae.push(place(plate, a.clone().lerp(b, 0.5).add(new THREE.Vector3(xOff, 0, 0)), new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize())));
    }
  meshes.push({ id: 'tilacoides', structure: 'tilacoides', geometry: merge(grana) });
  meshes.push({ id: 'lamelas-estromais', structure: 'lamelas-estromais', geometry: merge(lamellae) });

  const starch: THREE.BufferGeometry[] = [];
  for (const y of [-0.85, 0.15, 0.95]) {
    const g = new THREE.IcosahedronGeometry(1, 3);
    starch.push(place(g, backDir.clone().multiplyScalar(0.28).setY(y).add(new THREE.Vector3(-0.32, 0, 0)), undefined, new THREE.Vector3(0.09, 0.14, 0.08)));
  }
  meshes.push({ id: 'graos-de-amido', structure: 'graos-de-amido', geometry: merge(starch) });
  const dna: THREE.BufferGeometry[] = [];
  for (const y of [-0.45, 0.6]) dna.push(place(tube(loop(0.08, r), 0.011, true, 60, 5), backDir.clone().multiplyScalar(0.18).setY(y).add(new THREE.Vector3(0.38, 0, 0))));
  meshes.push({ id: 'dna-cloroplasto', structure: 'dna-cloroplasto', geometry: merge(dna) });

  anchors.grana = centres;
  anchors.stroma = Array.from({ length: 8 }, (_, i) => backDir.clone().multiplyScalar(0.25).setY(-1.2 + (i / 7) * 2.4).add(new THREE.Vector3(r.range(-0.4, 0.4), 0, 0)));
  anchors.outside = Array.from({ length: 10 }, () => {
    const d = r.dir();
    return d.multiplyScalar(lens(d) * 1.35);
  });
  anchors.sun = [new THREE.Vector3(-2.2, 0.2, 1.2)];
  for (const m of meshes) m.geometry.applyQuaternion(LAY);
  for (const k of Object.keys(anchors)) if (k !== 'sun') anchors[k] = anchors[k].map((p) => p.clone().applyQuaternion(LAY));
  return { meshes, anchors, preset: presetFor(6.4, [0, 0, 0], 0.62, 0.15) };
}

const BUILDERS: Record<Exclude<CellModelId, 'mitose'>, () => BuiltModel> = {
  animal: animalCell,
  vegetal: plantCell,
  procariotica: prokaryote,
  mitocondria: mitochondrionDetail,
  cloroplasto: chloroplastDetail,
};

export function buildCellModel(id: Exclude<CellModelId, 'mitose'>): BuiltModel {
  return BUILDERS[id]();
}
