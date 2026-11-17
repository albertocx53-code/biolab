/**
 * Builders for the procedural cell models. Each returns plain mesh
 * definitions (one stable id per mesh, linked to a structure id from the
 * catalog) plus named anchor points used by the process animations.
 * Everything is schematic and out of scale; sizes are in scene units.
 */
import * as THREE from 'three';
import type { CameraPreset } from '@/components/3d/CameraRig';
import type { CellModelId } from './catalog';
import { presetFor as sharedPreset, type BuiltModel, type MeshDef } from '@/laboratories/shared/types';

export type { BuiltModel, MeshDef };
import {
  alignY,
  basisQuat,
  bumps,
  capsuleY,
  corticalFilaments,
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
  randomQuat,
  rng,
  scaled,
  shell,
  slicedCapsule,
  superellipsoid,
  tangle,
  tube,
  wall,
  wobble,
  wobble2,
  type Cut,
  type DistFn,
  type Rng,
} from '@/laboratories/shared/geometry';



const VIEW_PHI = 0.55; // the cut-away faces the default camera
const CUT: Cut = { center: VIEW_PHI, width: Math.PI / 2 };

function presetFor(dist: number, target: [number, number, number] = [0, 0, 0], elev = 0.42, phi = VIEW_PHI): CameraPreset {
  return sharedPreset(dist, target, elev, phi);
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
  const nd = wobble2(ellipsoid(radius, radius * 0.9, radius), 0.035, 7, 0.2);
  const env = merge([paint(shell(nd, CUT, [72, 40]), '#8C6BC4'), paint(shell(scaled(nd, 0.93), CUT, [72, 40]), '#A98BD9'), paint(cutFaces(nd, scaled(nd, 0.93), CUT, 40), '#6E4FA8')]);
  // nuclear pores: ring-shaped protein complexes crossing both membranes
  const pores: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 400 && pores.length < 130; i++) {
    const d = r.dir();
    const p = d.clone().multiplyScalar(nd(d) * 0.985);
    if (inWedge(p, CUT)) continue;
    pores.push(place(new THREE.TorusGeometry(radius * 0.05, radius * 0.016, 6, 12), p, alignY(d)));
  }
  const poreGeo = paint(merge(pores), '#4B3B78');
  meshes.push({ id: 'envoltorio-nuclear', structure: 'envoltorio-nuclear', geometry: place(merge([env, poreGeo]), centre) });
  meshes.push({ id: 'nucleoplasma', structure: 'nucleo', geometry: place(cutFaces(scaled(nd, 0.93), null, CUT, 40), centre) });
  const nucleolusC = new THREE.Vector3(radius * 0.08, radius * 0.12, radius * 0.1);
  meshes.push({ id: 'nucleolo', structure: 'nucleolo', geometry: place(blob(radius * 0.3, 17), nucleolusC.clone().add(centre)) });
  // chromatin: loose euchromatin threads plus thicker heterochromatin clumps near the envelope
  const strands: THREE.BufferGeometry[] = [];
  for (let s = 0; s < 7; s++) {
    const start = r.dir().multiplyScalar(radius * r.range(0.3, 0.6));
    const pts = tangle(r, start, 44, radius * 0.11, (p) => inside(nd, p, 0.86) && p.distanceTo(nucleolusC) > radius * 0.36);
    strands.push(tube(pts, radius * (s < 4 ? 0.02 : 0.034), false, pts.length * 5, 5));
  }
  for (let s = 0; s < 5; s++) {
    const d = r.dir();
    const at = d.clone().multiplyScalar(nd(d) * 0.78);
    if (inWedge(at, CUT)) continue;
    strands.push(place(blob(radius * r.range(0.08, 0.13), 40 + s), at));
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

// ===================================================================== shared organelle builders (v2)

/** Pair of centrioles at right angles, with the pericentriolar material as a soft blob. */
function centrosome(at: THREE.Vector3, size: number) {
  const pair = centriolePair(at, size);
  const pcm = place(blob(size * 0.75, 31), at);
  return merge([paint(pair, '#1FA39A'), paint(pcm, '#B9E7E2')]);
}

/** Cytoskeleton: microtubules radiating from the centrosome plus a cortical web of actin under the membrane. */
function cytoskeleton(r: Rng, from: THREE.Vector3, cell: DistFn, nd: DistFn | null, nucleusAt: THREE.Vector3, count: number, cut: Cut) {
  const tubes: THREE.BufferGeometry[] = [];
  for (let i = 0; i < count * 3 && tubes.length < count; i++) {
    const d = r.dir();
    const end = d.clone().multiplyScalar(cell(d) * r.range(0.8, 0.93));
    if (inWedge(end, cut)) continue;
    // bend gently, avoid crossing the nucleus
    const mid = from.clone().lerp(end, 0.5).add(r.dir().multiplyScalar(0.12));
    if (nd && inside(nd, mid.clone().sub(nucleusAt), 1.15)) continue;
    tubes.push(tube([from.clone(), mid, end], 0.0055, false, 18, 5));
  }
  const micro = paint(merge(tubes), '#A7DED4');
  const actin = paint(corticalFilaments(r, cell, 0.95, 70, 0.55, 0.0045, cut), '#D9A3B4');
  return merge([micro, actin]);
}

/** Smooth ER: an interconnected web of tubules in a region of the cytoplasm. */
function smoothER(r: Rng, seeds: THREE.Vector3[], ok: (p: THREE.Vector3) => boolean, steps: number, stepLen: number, radius: number) {
  const parts: THREE.BufferGeometry[] = [];
  for (const s of seeds) {
    const pts = tangle(r, s, steps, stepLen, ok);
    parts.push(tube(pts, radius, false, pts.length * 5, 6));
    // a branch from the middle of each tubule gives the network its mesh-like look
    const b = pts[Math.floor(pts.length / 2)];
    const branch = tangle(r, b, Math.floor(steps / 2), stepLen, ok);
    parts.push(tube(branch, radius * 0.9, false, branch.length * 5, 6));
  }
  return merge(parts);
}

/** Many curved mitochondria, cut towards the camera, placed where `ok` allows. */
function mitochondria(r: Rng, count: number, dims: [number, number], ok: (p: THREE.Vector3) => boolean, space: Space, box: number, meshes: MeshDef[], prefix = 'mitocondria') {
  const centres: THREE.Vector3[] = [];
  for (let i = 0; i < count; i++) {
    const h = dims[0] * r.range(0.7, 1.45);
    const rad = dims[1] * r.range(0.85, 1.15);
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
    const g = slicedCapsule(h, rad, '#D65A33', '#F08A5B', '#F9C9A4', 'cristae', r);
    meshes.push({ id: `${prefix}-${i + 1}`, structure: 'mitocondria', geometry: place(g, placed, basisQuat(axis, toCamera())) });
    centres.push(placed);
  }
  return centres;
}

// ===================================================================== animal

function animalCell(): BuiltModel {
  const r = rng(11);
  const meshes: MeshDef[] = [];
  const anchors: BuiltModel['anchors'] = {};
  // living cells are lumpy, not perfect eggs: two octaves of irregularity
  const cell = wobble2(ellipsoid(1.55, 1.14, 1.36), 0.055, 3, 0.25);
  const memIn = scaled(cell, 0.972);
  const membrane = merge([paint(shell(cell, CUT, [120, 72]), '#DFA384'), paint(shell(memIn, CUT, [120, 72]), '#F4D6C2'), paint(cutFaces(cell, memIn, CUT, 72), '#C98566')]);
  meshes.push({ id: 'membrana-plasmatica', structure: 'membrana-plasmatica', geometry: membrane });
  // microvilli: fine finger-like projections over part of the surface (absorptive cells)
  const topSide = toCamera(VIEW_PHI + 2.2);
  meshes.push({
    id: 'microvilosidades',
    structure: 'microvilosidades',
    geometry: bumps(r, cell, 360, [0.045, 0.085], 0.0075, CUT, (d) => d.dot(topSide) > 0.3),
  });

  const NR = 0.46;
  const nucleusAt = new THREE.Vector3(0.05, 0.02, -0.05);
  const nd = nucleus(r, nucleusAt, NR, meshes, anchors);
  meshes.push({ id: 'citoplasma', structure: 'citoplasma', geometry: cutFaces(memIn, scaled(nd, 1.0), CUT, 72) });

  const space = new Space();
  space.take(nucleusAt, NR * 1.9);
  const ribos: THREE.Vector3[] = [];
  const inCyto = (p: THREE.Vector3, margin = 0.9) => inside(cell, p, margin) && !inside(nd, p.clone().sub(nucleusAt), 1.1);
  const rer = roughER(r, nd, nucleusAt, VIEW_PHI + 0.45, VIEW_PHI + 3.0, 5, ribos, (p) => inCyto(p, 0.94));
  meshes.push({ id: 'reticulo-endoplasmatico-rugoso', structure: 'reticulo-endoplasmatico-rugoso', geometry: rer.geometry });
  anchors.rer = [rer.anchor];

  // smooth ER: a web of tubules continuing from the rough ER on the far side of the nucleus
  const serSeeds: THREE.Vector3[] = [];
  for (let i = 0; i < 9; i++) {
    const a = VIEW_PHI - r.range(0.9, 2.3);
    serSeeds.push(new THREE.Vector3(Math.sin(a) * 0.95, r.range(-0.4, 0.4), Math.cos(a) * 0.9));
  }
  meshes.push({
    id: 'reticulo-endoplasmatico-liso',
    structure: 'reticulo-endoplasmatico-liso',
    geometry: smoothER(r, serSeeds, (p) => inCyto(p, 0.86) && p.distanceTo(nucleusAt) > NR * 1.5 && !inWedge(p, CUT), 14, 0.07, 0.016),
  });
  space.take(new THREE.Vector3(Math.sin(VIEW_PHI - 1.6) * 0.95, 0, Math.cos(VIEW_PHI - 1.6) * 0.95), 0.34);

  // Golgi between nucleus and membrane, slightly inside the cut-away
  const gAt = new THREE.Vector3(Math.sin(VIEW_PHI - 0.5) * 0.95, 0.32, Math.cos(VIEW_PHI - 0.5) * 0.95);
  const go = golgi(r, gAt, new THREE.Vector3(0, 0.1, 0), 0.24);
  space.take(gAt, 0.38);
  meshes.push({ id: 'complexo-golgiense', structure: 'complexo-golgiense', geometry: go.geometry });
  const exitDir = go.axis.clone();
  const exit = exitDir.clone().multiplyScalar(cell(exitDir) * 0.97);
  const between = go.trans.clone().lerp(exit, 0.5);
  // transport vesicles around the Golgi plus endocytic vesicles budding from the membrane
  const endo = membranePoints(r, cell, 0.93, 16, CUT);
  meshes.push({ id: 'vesiculas', structure: 'vesiculas', geometry: dots([...go.vesicles, between, ...endo], (i) => (i < 5 ? 0.026 : i < go.vesicles.length + 1 ? 0.034 : 0.022), 2) });
  Object.assign(anchors, { golgiCis: [go.cis], golgiTrans: [go.trans], exit: [exit] });

  // centrosome near the nucleus; microtubules radiate from it to the cell edge
  const cAt = new THREE.Vector3(Math.sin(VIEW_PHI + 0.35) * 0.74, 0.5, Math.cos(VIEW_PHI + 0.35) * 0.74);
  space.take(cAt, 0.16);
  meshes.push({ id: 'centriolos', structure: 'centriolos', geometry: centrosome(cAt, 0.13) });
  meshes.push({ id: 'citoesqueleto', structure: 'citoesqueleto', geometry: cytoskeleton(r, cAt, cell, nd, nucleusAt, 11, CUT) });

  const mito = mitochondria(r, 14, [0.13, 0.08], (p) => inCyto(p, 0.86), space, 1.42, meshes);
  anchors.mitochondria = mito;

  for (let i = 0; i < 8; i++) {
    const rad = r.range(0.05, 0.08);
    const p = spot(r, 1.4, (q) => inCyto(q, 0.85), space, rad + 0.03);
    if (p) meshes.push({ id: `lisossomo-${i + 1}`, structure: 'lisossomos', geometry: place(blob(rad, i + 2), p) });
  }
  for (let i = 0; i < 5; i++) {
    const rad = r.range(0.04, 0.055);
    const p = spot(r, 1.4, (q) => inCyto(q, 0.85), space, rad + 0.03);
    if (p) meshes.push({ id: `peroxissomo-${i + 1}`, structure: 'peroxissomos', geometry: place(blob(rad, i + 9), p) });
  }
  for (let i = 0; i < 420; i++) {
    const p = new THREE.Vector3(r.range(-1.55, 1.55), r.range(-1.14, 1.14), r.range(-1.36, 1.36));
    if (inCyto(p, 0.93) && space.free(p, 0.01)) ribos.push(p);
  }
  meshes.push({ id: 'ribossomos', structure: 'ribossomos', geometry: dots(ribos, 0.013) });
  anchors.membrane = membranePoints(r, cell, 0.97, 24);
  anchors.nucleus = [nucleusAt.clone()];
  return { meshes, anchors, preset: presetFor(6.3) };
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
  // plant cells are pressed against their neighbours: rounded-box outline, slightly irregular
  const wallD = wobble(superellipsoid(1.62, 1.2, 1.2, 4.6), 0.018, 9);
  const wallIn = scaled(wallD, 0.93);
  const mem = scaled(wallD, 0.925);
  const memIn = scaled(mem, 0.982);
  const vac = wobble(superellipsoid(1.1, 0.64, 0.68, 3), 0.045, 5);
  // wall: middle lamella (outer, darker) + primary wall (lighter, fibrous) + cut face showing the thickness
  const wallGeo = merge([paint(shell(wallD, CUT, [110, 64]), '#8DB85F'), paint(shell(wallIn, CUT, [110, 64]), '#C8E3A2'), paint(cutFaces(wallD, wallIn, CUT, 64), '#A9CF7A')]);
  meshes.push({ id: 'parede-celular', structure: 'parede-celular', geometry: wallGeo });
  // plasmodesmata: fine channels crossing the wall, connecting to the neighbouring cells
  const pd: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 160 && pd.length < 60; i++) {
    const d = r.dir();
    const p = d.clone().multiplyScalar(wallD(d) * 0.962);
    if (inWedge(p, CUT)) continue;
    const g = new THREE.CylinderGeometry(0.012, 0.012, wallD(d) * 0.085, 6);
    pd.push(place(g, p, alignY(d)));
  }
  meshes.push({ id: 'plasmodesmos', structure: 'plasmodesmos', geometry: merge(pd) });
  meshes.push({ id: 'membrana-plasmatica', structure: 'membrana-plasmatica', geometry: merge([paint(shell(mem, CUT, [110, 64]), '#E2A98E'), paint(shell(memIn, CUT, [110, 64]), '#F4D3C1'), paint(cutFaces(mem, memIn, CUT, 64), '#CF8C70')]) });
  meshes.push({ id: 'citoplasma', structure: 'citoplasma', geometry: cutFaces(memIn, vac, CUT, 64) });
  // central vacuole: tonoplast (its membrane) + translucent cell sap
  meshes.push({ id: 'tonoplasto', structure: 'tonoplasto', geometry: shell(vac, CUT, [90, 50]) });
  meshes.push({ id: 'vacuolo', structure: 'vacuolo', geometry: merge([shell(scaled(vac, 0.985), CUT, [80, 44]), cutFaces(scaled(vac, 0.985), null, CUT, 44)]) });
  anchors.vacuole = [new THREE.Vector3()];

  // nucleus pushed to the side by the vacuole (inside the cut-away, top)
  const nC = new THREE.Vector3(Math.sin(VIEW_PHI) * 0.62, 0.8, Math.cos(VIEW_PHI) * 0.62);
  const NR = 0.24;
  const nd = nucleus(r, nC, NR, meshes, anchors);
  const space = new Space();
  space.take(nC, NR * 1.7);
  const inCyto = (p: THREE.Vector3, margin = 0.92) => inside(mem, p, margin) && !inside(vac, p, 1.07) && !inside(nd, p.clone().sub(nC), 1.1);
  const ribos: THREE.Vector3[] = [];
  const rer = roughER(r, nd, nC, VIEW_PHI + 1.1, VIEW_PHI + 3.7, 3, ribos, (p) => inCyto(p, 0.95));
  meshes.push({ id: 'reticulo-endoplasmatico-rugoso', structure: 'reticulo-endoplasmatico-rugoso', geometry: rer.geometry });
  anchors.rer = [rer.anchor];
  const serSeeds: THREE.Vector3[] = [];
  for (let i = 0; i < 6; i++) {
    const a = VIEW_PHI + r.range(2.4, 4.2);
    serSeeds.push(new THREE.Vector3(Math.sin(a) * 1.25, r.range(-0.9, -0.2), Math.cos(a) * 0.95));
  }
  meshes.push({ id: 'reticulo-endoplasmatico-liso', structure: 'reticulo-endoplasmatico-liso', geometry: smoothER(r, serSeeds, (p) => inCyto(p, 0.9) && !inWedge(p, CUT), 10, 0.06, 0.014) });

  const gAt = new THREE.Vector3(Math.sin(VIEW_PHI + 0.55) * 1.2, 0.72, Math.cos(VIEW_PHI + 0.55) * 1.2);
  const go = golgi(r, gAt, nC, 0.17);
  space.take(gAt, 0.24);
  meshes.push({ id: 'complexo-golgiense', structure: 'complexo-golgiense', geometry: go.geometry });
  meshes.push({ id: 'vesiculas', structure: 'vesiculas', geometry: dots(go.vesicles.filter((v) => inside(mem, v, 0.97)), 0.02, 2) });

  const box = 1.58;
  const chloro = slicedOrganelles(r, 18, 'cloroplasto', 'cloroplastos', [0.1, 0.085], ['#3E9440', '#74C266', '#1F6B2A'], 'grana', (p) => inCyto(p, 0.93), space, box, meshes);
  anchors.chloroplasts = chloro;
  anchors.mitochondria = mitochondria(r, 7, [0.08, 0.06], (p) => inCyto(p, 0.93), space, box, meshes);
  for (let i = 0; i < 3; i++) {
    const rad = 0.04;
    const p = spot(r, box, (q) => inCyto(q, 0.92), space, rad + 0.02);
    if (p) meshes.push({ id: `peroxissomo-${i + 1}`, structure: 'peroxissomos', geometry: place(blob(rad, i + 4), p) });
  }
  // amyloplasts: starch-storing plastids (white, lens-shaped)
  for (let i = 0; i < 3; i++) {
    const p = spot(r, box, (q) => inCyto(q, 0.9), space, 0.09);
    if (p) meshes.push({ id: `amiloplasto-${i + 1}`, structure: 'amiloplastos', geometry: place(new THREE.IcosahedronGeometry(1, 3), p, randomQuat(r), new THREE.Vector3(0.08, 0.055, 0.065)) });
  }
  // cortical microtubules: parallel hoops just under the membrane that guide cellulose deposition
  meshes.push({ id: 'citoesqueleto', structure: 'citoesqueleto', geometry: paint(corticalFilaments(r, mem, 0.965, 90, 0.7, 0.005, CUT), '#A7DED4') });
  // transvacuolar strands: thin threads of cytoplasm crossing the vacuole
  const strands: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 3; i++) {
    const a = r.dir();
    const b = a.clone().negate().add(r.dir().multiplyScalar(0.5)).normalize();
    const pa = a.multiplyScalar(vac(a) * 0.99);
    const pb = b.multiplyScalar(vac(b) * 0.99);
    const mid = pa.clone().lerp(pb, 0.5).add(r.dir().multiplyScalar(0.15));
    strands.push(tube([pa, mid, pb], 0.014, false, 24, 6));
  }
  meshes.push({ id: 'filamentos-citoplasmaticos', structure: 'citoplasma', geometry: merge(strands) });
  for (let i = 0; i < 800 && ribos.length < 300; i++) {
    const p = new THREE.Vector3(r.range(-1.55, 1.55), r.range(-1.15, 1.15), r.range(-1.15, 1.15));
    if (inCyto(p, 0.95) && space.free(p, 0.01)) ribos.push(p);
  }
  meshes.push({ id: 'ribossomos', structure: 'ribossomos', geometry: dots(ribos, 0.012) });
  anchors.membrane = membranePoints(r, mem, 0.98, 24);
  anchors.wall = membranePoints(r, wallD, 1.0, 24);
  return { meshes, anchors, preset: presetFor(6.5) };
}

// ===================================================================== prokaryote

/** Built with the long axis on local Y, then laid horizontally (Y → −X). */
const LAY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2);
const PRO_CUT: Cut = { center: Math.PI / 4, width: Math.PI / 2 };

/** Gram-negative bacillus (like Escherichia coli): capsule, outer membrane, thin wall, periplasm, inner membrane. */
function prokaryote(): BuiltModel {
  const r = rng(37);
  const meshes: MeshDef[] = [];
  const anchors: BuiltModel['anchors'] = {};
  const cap = wobble(capsuleY(0.95, 0.44), 0.012, 4);
  meshes.push({ id: 'capsula-bacteriana', structure: 'capsula-bacteriana', geometry: shell(scaled(cap, 1.2), PRO_CUT, [90, 72]) });
  // outer membrane, studded with lipopolysaccharide (fuzzy outer face)
  const outer = scaled(cap, 1.085);
  meshes.push({
    id: 'membrana-externa',
    structure: 'membrana-externa',
    geometry: merge([paint(wall(outer, 0.975, PRO_CUT, [90, 72]), '#8CB7A1'), paint(bumps(r, outer, 700, [0.012, 0.022], 0.006, PRO_CUT), '#B9DCC8')]),
  });
  meshes.push({ id: 'periplasma', structure: 'periplasma', geometry: cutFaces(scaled(cap, 1.058), scaled(cap, 1.03), PRO_CUT, 72) });
  meshes.push({ id: 'parede-celular-bacteriana', structure: 'parede-celular-bacteriana', geometry: wall(scaled(cap, 1.045), 0.985, PRO_CUT, [90, 72]) });
  const pm = scaled(cap, 1.022);
  const pmIn = scaled(pm, 0.978);
  meshes.push({ id: 'membrana-plasmatica', structure: 'membrana-plasmatica', geometry: merge([paint(shell(pm, PRO_CUT, [90, 72]), '#E2A98E'), paint(shell(pmIn, PRO_CUT, [90, 72]), '#F4D3C1'), paint(cutFaces(pm, pmIn, PRO_CUT, 72), '#CF8C70')]) });
  const cyt = scaled(cap, 0.998);
  meshes.push({ id: 'citoplasma', structure: 'citoplasma', geometry: cutFaces(cyt, null, PRO_CUT, 72) });

  // nucleoid: one circular chromosome, supercoiled into a dense irregular mass
  const nucl = wobble(ellipsoid(0.25, 0.64, 0.25), 0.1, 2);
  const strand = tangle(r, new THREE.Vector3(0, -0.4, 0), 320, 0.04, (p) => inside(nucl, p));
  meshes.push({ id: 'nucleoide', structure: 'nucleoide', geometry: tube(strand, 0.0105, false, 2000, 5) });
  anchors.nucleoid = [new THREE.Vector3()];

  const space = new Space();
  space.take(new THREE.Vector3(0, 0, 0), 0.3);
  const plasmids: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 4; i++) {
    const p = spot(r, 1.2, (q) => inside(cyt, q, 0.78) && !inside(nucl, q, 1.15), space, 0.1);
    if (p) plasmids.push(place(tube(loop(r.range(0.06, 0.085), r), 0.011, true, 60, 5), p, randomQuat(r)));
  }
  meshes.push({ id: 'plasmideos', structure: 'plasmideos', geometry: merge(plasmids) });
  // storage granules (glycogen / polyphosphate inclusions)
  for (let i = 0; i < 5; i++) {
    const p = spot(r, 1.2, (q) => inside(cyt, q, 0.75) && !inside(nucl, q, 1.2), space, 0.07);
    if (p) meshes.push({ id: `inclusao-${i + 1}`, structure: 'inclusoes', geometry: place(blob(r.range(0.04, 0.06), i + 12), p) });
  }

  const ribos: THREE.Vector3[] = [];
  for (let i = 0; i < 2000 && ribos.length < 420; i++) {
    const p = new THREE.Vector3(r.range(-0.5, 0.5), r.range(-1.4, 1.4), r.range(-0.5, 0.5));
    if (inside(cyt, p, 0.93) && space.free(p, 0.015) && !inside(nucl, p, 0.75)) ribos.push(p);
  }
  meshes.push({ id: 'ribossomos-70s', structure: 'ribossomos-70s', geometry: dots(ribos, 0.016) });

  // flagella: several helical filaments (peritrichous), each with a hook and a basal body in the envelope
  const flagella: THREE.Vector3[] = [];
  const bases: { p: THREE.Vector3; d: THREE.Vector3 }[] = [
    { p: new THREE.Vector3(0, -(0.95 + 0.44 * 1.07), 0), d: new THREE.Vector3(0, -1, 0) },
    { p: new THREE.Vector3(0.3, -0.98, -0.32), d: new THREE.Vector3(0.55, -0.6, -0.58) },
    { p: new THREE.Vector3(-0.38, -0.55, -0.26), d: new THREE.Vector3(-0.7, -0.45, -0.55) },
    { p: new THREE.Vector3(0.34, 0.45, -0.3), d: new THREE.Vector3(0.6, 0.35, -0.72) },
  ];
  bases.forEach((b, k) => {
    const d = b.d.clone().normalize();
    const base = d.clone().multiplyScalar(cap(d) * 1.09);
    if (inWedge(base, PRO_CUT)) return;
    const q = alignY(d.clone().negate());
    const pts: THREE.Vector3[] = [];
    const len = r.range(1.6, 2.1);
    for (let i = 0; i <= 120; i++) {
      const t = i / 120;
      const amp = 0.1 * Math.min(1, t * 6);
      const a = t * Math.PI * 2 * 3.6 + k;
      pts.push(new THREE.Vector3(Math.cos(a) * amp, -0.06 - t * len, Math.sin(a) * amp).applyQuaternion(q).add(base));
    }
    const filament = tube(pts, 0.011, false, 600, 6);
    // basal body: two rings in the envelope + a short hook
    const rings = merge([place(new THREE.TorusGeometry(0.05, 0.012, 8, 20), base.clone().addScaledVector(d, -0.06), q), place(new THREE.TorusGeometry(0.04, 0.01, 8, 20), base.clone().addScaledVector(d, -0.11), q)]);
    meshes.push({ id: `flagelo-${k + 1}`, structure: 'flagelo-bacteriano', geometry: merge([paint(filament, '#8C7A57'), paint(rings, '#5C4D33')]) });
    flagella.push(base.clone(), base.clone().add(d));
  });
  anchors.flagellumAxis = [flagella[0], flagella[1]];
  anchors.flagella = flagella;

  const fim: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 220; i++) {
    const d = r.dir();
    const p = d.clone().multiplyScalar(cap(d) * 1.085);
    if (inWedge(p, PRO_CUT) || Math.abs(p.y) > 1.3) continue;
    const len = r.range(0.1, 0.22);
    const c = new THREE.CylinderGeometry(0.005, 0.004, len, 4);
    fim.push(place(c, p.clone().addScaledVector(d, len / 2), alignY(d)));
  }
  meshes.push({ id: 'fimbrias', structure: 'fimbrias', geometry: merge(fim) });

  for (const m of meshes) m.geometry.applyQuaternion(LAY);
  for (const k of Object.keys(anchors)) anchors[k] = anchors[k].map((p) => p.clone().applyQuaternion(LAY));
  return { meshes, anchors, preset: presetFor(7.4, [-0.2, -0.1, 0], 0.5, 0.25) };
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
  anchors.cristae = atp.filter((_, i) => i % 23 === 0).map((p) => p.clone());
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
  return { meshes, anchors, preset: presetFor(5.6, [0, 0, 0], 0.72, 0.85) };
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

const BUILDERS: Record<Exclude<CellModelId, 'mitose' | 'meiose'>, () => BuiltModel> = {
  animal: animalCell,
  vegetal: plantCell,
  procariotica: prokaryote,
  mitocondria: mitochondrionDetail,
  cloroplasto: chloroplastDetail,
};

export function buildCellModel(id: Exclude<CellModelId, 'mitose' | 'meiose'>): BuiltModel {
  return BUILDERS[id]();
}
