/**
 * Static models of the Microorganisms laboratory: bacteria (a cut-away bacillus
 * and the main cell shapes), the T4 bacteriophage, a coronavirus, yeast, bread
 * mould, a mushroom, an amoeba, a paramecium and Euglena. Procedural
 * geometry written by BioLab 3D; every mesh is painted with vertex colours.
 */
import * as THREE from 'three';
import {
  alignY,
  bentCapsule,
  bumps,
  capsuleY,
  cutFaces,
  dots,
  ellipsoid,
  inside,
  inWedge,
  merge,
  paint,
  patch,
  place,
  randomQuat,
  rng,
  scaled,
  shell,
  tangle,
  tube,
  wall,
  wobble,
  wobble2,
  type Cut,
  type DistFn,
  type Rng,
} from '@/laboratories/shared/geometry';
import { presetFor, type BuiltModel, type MeshDef } from '@/laboratories/shared/types';
import { bacillus, c, LAY_X, phage } from './kit';
import { colorize } from './materials';

export type MicrobeStaticModel = 'bacterias' | 'bacteriofago' | 'coronavirus' | 'levedura' | 'bolor' | 'cogumelo' | 'ameba' | 'paramecio' | 'euglena';

const FRONT_CUT: Cut = { center: 0.35, width: Math.PI * 0.6 };

/** Applies a transform to every geometry of a list of meshes. */
function moveAll(meshes: MeshDef[], pos: THREE.Vector3 | [number, number, number], quat?: THREE.Quaternion, scale?: number) {
  for (const m of meshes) place(m.geometry, pos, quat, scale);
  return meshes;
}

// ===================================================================== bacteria

function bacteria(): BuiltModel {
  const r = rng(11);
  const meshes: MeshDef[] = [];
  const b = bacillus(r, 2.6, 1.3, FRONT_CUT, { plasmids: 3, capsule: true, fimbriae: 260, flagellum: true, ribosomes: 380 });
  const parts: MeshDef[] = [
    { id: 'b-capsula', structure: 'capsula', geometry: b.capsuleG! },
    { id: 'b-parede', structure: 'parede-bacteriana', geometry: b.wallG },
    { id: 'b-membrana', structure: 'membrana-plasmatica', geometry: b.membraneG },
    { id: 'b-citoplasma', structure: 'citoplasma', geometry: b.cytoplasmG },
    { id: 'b-nucleoide', structure: 'nucleoide', geometry: b.dnaG },
    { id: 'b-ribossomos', structure: 'ribossomos', geometry: b.ribosomesG },
    { id: 'b-plasmideos', structure: 'plasmideo', geometry: b.plasmidsG! },
    { id: 'b-fimbrias', structure: 'fimbrias', geometry: b.fimbriaeG! },
    { id: 'b-flagelo', structure: 'flagelo', geometry: b.flagellumG! },
  ];
  moveAll(parts, [-1.0, 1.9, 0], LAY_X);
  meshes.push(...parts);

  // the classic shapes, in a row below
  const y = -2.6;
  const xs = [-6.3, -4.2, -2.1, 0, 2.1, 4.2, 6.3];
  const sphere = (rad: number, seed: number) => paint(shell(wobble(ellipsoid(rad, rad, rad), 0.03, seed), { center: 0, width: 0 }, [24, 16]), '#fff');
  const shapeMesh = (id: string, g: THREE.BufferGeometry, x: number) => meshes.push({ id: `forma-${id}`, structure: id, geometry: paint(place(g, [x, y, 0]), c(id)) });
  shapeMesh('coco', sphere(0.5, 1), xs[0]);
  shapeMesh('diplococo', merge([place(sphere(0.42, 2), [-0.38, 0, 0]), place(sphere(0.42, 3), [0.38, 0, 0])]), xs[1]);
  {
    const chain: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 6; i++) {
      const a = (i - 2.5) * 0.36;
      chain.push(place(sphere(0.25, i + 4), [Math.sin(a) * 1.3, Math.cos(a) * 1.3 - 1.15 + (i - 2.5) * 0, 0]));
    }
    shapeMesh('estreptococo', merge(chain), xs[2]);
  }
  {
    const grape: THREE.BufferGeometry[] = [];
    const rr = rng(5);
    for (let i = 0; i < 11; i++) {
      const p = rr.dir().multiplyScalar(rr.range(0.1, 0.55));
      grape.push(place(sphere(0.27, i + 10), p));
    }
    shapeMesh('estafilococo', merge(grape), xs[3]);
  }
  shapeMesh('bacilo', place(bentCapsule(0.55, 0.3, 0), [0, 0, 0], new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2)), xs[4]);
  {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 80; i++) {
      const t = i / 80;
      const a = t * Math.PI * 2 * 2.5;
      pts.push(new THREE.Vector3((t - 0.5) * 1.6, Math.sin(a) * 0.28, Math.cos(a) * 0.28));
    }
    shapeMesh('espirilo', merge([tube(pts, 0.11, false, 240, 10), place(new THREE.SphereGeometry(0.11, 10, 8), pts[0]), place(new THREE.SphereGeometry(0.11, 10, 8), pts[80])]), xs[5]);
  }
  shapeMesh('vibriao', merge([place(bentCapsule(0.4, 0.22, 1.2), [0, 0, 0], new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2)), place(tube([new THREE.Vector3(-0.55, -0.15, 0), new THREE.Vector3(-0.95, -0.3, 0.1), new THREE.Vector3(-1.3, -0.15, -0.05)], 0.03, false, 20, 5), [0, 0, 0])]), xs[6]);
  return { meshes: colorize(meshes), anchors: {}, preset: presetFor(16.5, [-0.7, 0.1, 0], 0.2, 0.1) };
}

// ===================================================================== bacteriophage

function bacteriophage(): BuiltModel {
  const p = phage(1.9, { cutHead: true });
  const meshes: MeshDef[] = [
    { id: 'f-capsideo', structure: 'capsideo', geometry: p.head },
    { id: 'f-dna', structure: 'dna-viral', geometry: p.dna },
    { id: 'f-colar', structure: 'colar', geometry: p.collar },
    { id: 'f-bainha', structure: 'bainha', geometry: p.sheath },
    { id: 'f-placa', structure: 'placa-basal', geometry: p.plate },
    { id: 'f-fibras', structure: 'fibras-cauda', geometry: p.fibers },
  ];
  moveAll(meshes, [0, -2.9, 0]);
  // a piece of the bacterial cell wall underneath
  const slab = new THREE.BoxGeometry(9, 0.5, 5, 30, 1, 16);
  const pos = slab.getAttribute('position');
  for (let i = 0; i < pos.count; i++) pos.setY(i, pos.getY(i) - 0.04 * (pos.getX(i) ** 2 + pos.getZ(i) ** 2) * 0.25);
  slab.computeVertexNormals();
  meshes.push({ id: 'f-parede', structure: 'parede-bacteriana', geometry: paint(place(slab, [0, -3.25, 0]), c('parede-bacteriana')) });
  return { meshes: colorize(meshes), anchors: {}, preset: presetFor(17, [-1.6, -0.6, 0], 0.2, 0.35) };
}

// ===================================================================== coronavirus

function coronavirus(): BuiltModel {
  const r = rng(21);
  const R = 2.6;
  const cut: Cut = { center: 0.4, width: Math.PI * 0.55 };
  const sphere = wobble(ellipsoid(R, R, R), 0.02, 5);
  const meshes: MeshDef[] = [];
  meshes.push({
    id: 'cv-envelope',
    structure: 'envelope',
    geometry: merge([paint(wall(sphere, 0.93, cut, [80, 56]), c('envelope')), paint(cutFaces(scaled(sphere, 0.985), scaled(sphere, 0.945), cut, 56), '#C9783A')]),
  });
  const spikes: THREE.BufferGeometry[] = [];
  const ms: THREE.Vector3[] = [];
  const es: THREE.BufferGeometry[] = [];
  const fib = (n: number, i: number) => {
    const y = 1 - (2 * (i + 0.5)) / n;
    const rr = Math.sqrt(1 - y * y);
    const a = i * 2.39996;
    return new THREE.Vector3(Math.cos(a) * rr, y, Math.sin(a) * rr);
  };
  for (let i = 0; i < 70; i++) {
    const d = fib(70, i);
    const p = d.clone().multiplyScalar(sphere(d));
    if (inWedge(p, { center: cut.center, width: cut.width * 0.8 })) continue;
    const q = alignY(d, r.range(0, 6));
    const stalk = place(new THREE.CylinderGeometry(0.06, 0.08, 0.55, 6), [0, 0.27, 0]);
    const lobes = [0, 1, 2].map((k) => place(new THREE.SphereGeometry(0.16, 10, 8), [Math.cos((k * Math.PI * 2) / 3) * 0.1, 0.68, Math.sin((k * Math.PI * 2) / 3) * 0.1], undefined, new THREE.Vector3(1, 1.5, 1)));
    spikes.push(place(merge([stalk, ...lobes]), p, q));
  }
  for (let i = 0; i < 520; i++) {
    const d = r.dir();
    const p = d.clone().multiplyScalar(sphere(d) * 1.005);
    if (!inWedge(p, cut)) ms.push(p);
  }
  for (let i = 0; i < 12; i++) {
    const d = r.dir();
    const p = d.clone().multiplyScalar(sphere(d) * 1.01);
    if (inWedge(p, cut)) continue;
    es.push(place(new THREE.TorusGeometry(0.08, 0.035, 6, 10), p, alignY(d).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2))));
  }
  meshes.push({ id: 'cv-espiculas', structure: 'espicula', geometry: paint(merge(spikes), c('espicula')) });
  meshes.push({ id: 'cv-proteina-m', structure: 'proteina-m', geometry: paint(dots(ms, 0.06), c('proteina-m')) });
  meshes.push({ id: 'cv-proteina-e', structure: 'proteina-e', geometry: paint(merge(es), c('proteina-e')) });
  // helical nucleocapsid: RNA wrapped by N protein beads
  const rnaPts = tangle(r, new THREE.Vector3(0.3, 0, -0.6), 130, 0.28, (p) => p.length() < R * 0.72);
  const curve = new THREE.CatmullRomCurve3(rnaPts);
  const beads: THREE.Vector3[] = [];
  const coil: THREE.Vector3[] = [];
  const N = 900;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const p = curve.getPointAt(t);
    const tan = curve.getTangentAt(t);
    const n1 = new THREE.Vector3(0, 1, 0).cross(tan).normalize();
    const n2 = tan.clone().cross(n1);
    const a = i * 0.9;
    coil.push(p.clone().addScaledVector(n1, Math.cos(a) * 0.06).addScaledVector(n2, Math.sin(a) * 0.06));
    if (i % 7 === 0) beads.push(p.clone().addScaledVector(n1, Math.cos(a) * 0.12).addScaledVector(n2, Math.sin(a) * 0.12));
  }
  meshes.push({ id: 'cv-rna', structure: 'rna-viral', geometry: paint(tube(coil, 0.03, false, 2400, 4), c('rna-viral')) });
  meshes.push({ id: 'cv-nucleocapsideo', structure: 'nucleocapsideo', geometry: paint(dots(beads, 0.085, 1), c('nucleocapsideo')) });
  return { meshes: colorize(meshes), anchors: {}, preset: presetFor(16, [-1.8, 0, 0], 0.22, 0.3) };
}

// ===================================================================== yeast

export const YEAST_CUT: Cut = { center: 0.3, width: Math.PI * 0.62 };
export const BUD_DIR = new THREE.Vector3(0.55, 0.83, 0).normalize();

function yeastCell(r: Rng, rad: number, cut: Cut | null, prefix: string, withInside: boolean): MeshDef[] {
  const shape = wobble(ellipsoid(rad, rad * 1.12, rad), 0.02, r.range(1, 9));
  const cc = cut ?? { center: 0, width: 0 };
  const meshes: MeshDef[] = [{ id: `${prefix}-parede`, structure: 'parede-celular-fungica', geometry: paint(wall(shape, 0.93, cc, [56, 40]), c('parede-celular-fungica')) }];
  if (!withInside) return meshes;
  const memb = scaled(shape, 0.92);
  meshes.push({ id: `${prefix}-membrana`, structure: 'membrana-plasmatica', geometry: paint(shell(memb, cc, [56, 40]), c('membrana-plasmatica')) });
  meshes.push({ id: `${prefix}-nucleo`, structure: 'nucleo', geometry: merge([paint(new THREE.SphereGeometry(rad * 0.3, 24, 18), c('nucleo')), paint(place(new THREE.SphereGeometry(rad * 0.12, 14, 10), [rad * 0.12, rad * 0.1, rad * 0.18]), '#45306B')]).translate(0, rad * 0.32, 0) });
  meshes.push({ id: `${prefix}-vacuolo`, structure: 'vacuolo', geometry: paint(place(shell(wobble(ellipsoid(rad * 0.38, rad * 0.34, rad * 0.36), 0.05, 3), cc, [32, 24]), [0, -rad * 0.3, -rad * 0.05]), c('vacuolo')) });
  const mito: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 6; i++) {
    const p = r.dir().multiplyScalar(rad * r.range(0.5, 0.7));
    if (inWedge(p, cc)) continue;
    mito.push(place(bentCapsule(rad * 0.1, rad * 0.06, r.range(0, 1)), p, randomQuat(r)));
  }
  meshes.push({ id: `${prefix}-mito`, structure: 'mitocondria', geometry: paint(merge(mito), c('mitocondria')) });
  return meshes;
}

function yeast(): BuiltModel {
  const r = rng(31);
  const rad = 2.2;
  const meshes: MeshDef[] = yeastCell(r, rad, YEAST_CUT, 'lv', true);
  // bud scars: rings on the mother cell surface
  const scars: THREE.BufferGeometry[] = [];
  for (const d of [new THREE.Vector3(-0.7, 0.6, -0.4), new THREE.Vector3(-0.3, -0.8, -0.5)]) {
    const n = d.normalize();
    scars.push(place(new THREE.TorusGeometry(rad * 0.16, rad * 0.035, 8, 22), n.clone().multiplyScalar(rad * 1.06), alignY(n).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2))));
  }
  meshes.push({ id: 'lv-cicatriz', structure: 'cicatriz-de-brotamento', geometry: paint(merge(scars), c('cicatriz-de-brotamento')) });
  // the bud (animated by the budding process): a smaller cut cell at BUD_DIR
  const budShape = wobble(ellipsoid(1, 1.08, 1), 0.02, 7);
  meshes.push({ id: 'broto', structure: 'broto', geometry: paint(wall(budShape, 0.9, YEAST_CUT, [40, 30]), c('broto')) });
  meshes.push({ id: 'broto-nucleo', structure: 'nucleo', geometry: paint(new THREE.SphereGeometry(0.28, 18, 14), c('nucleo')) });
  // a few whole yeast cells around
  const others: [number, number, number, number][] = [
    [-4.6, -1.6, -1.5, 1.3],
    [4.4, -2.2, -1.2, 1.15],
    [-3.9, 2.6, -2.2, 1.0],
  ];
  others.forEach(([x, y, z, s], i) => {
    const cell = yeastCell(r, s, null, `lv-o${i}`, false);
    moveAll(cell, [x, y, z]);
    meshes.push(...cell);
  });
  return { meshes: colorize(meshes), anchors: {}, preset: presetFor(15, [-0.6, 0.6, 0], 0.15, 0.3) };
}

/** Budding: the bud grows at the mother cell, gets a nucleus and separates leaving a scar. */
export function poseBudding(P: number, get: (id: string) => THREE.Object3D | undefined) {
  const bud = get('broto');
  const bn = get('broto-nucleo');
  const nuc = get('lv-nucleo');
  const rad = 2.2;
  const grow = P < 1 ? 0.3 + 0.05 * P : P < 2 ? 0.35 + 0.15 * (P - 1) : P < 3 ? 0.5 + 0.35 * (P - 2) : 0.85;
  const sep = P < 3 ? 0 : Math.min(1, P - 3);
  const k = grow * 1.25;
  const at = BUD_DIR.clone().multiplyScalar(rad * 1.06 + k * 0.85 + sep * 1.4);
  if (bud) {
    bud.scale.setScalar(k * 1.0);
    bud.position.copy(at);
  }
  // nucleus: elongates towards the neck in step 2 and a daughter nucleus moves into the bud
  const div = P < 1 ? 0 : P < 2 ? P - 1 : 1;
  if (nuc) {
    nuc.position.copy(BUD_DIR.clone().multiplyScalar(div < 1 ? div * 0.5 : 0.25));
    nuc.scale.set(1, 1 + 0.4 * Math.sin(Math.PI * Math.min(1, div)), 1);
  }
  if (bn) {
    const show = div >= 0.5;
    bn.scale.setScalar(show ? k * 1.4 : 0.0001);
    const base = BUD_DIR.clone().multiplyScalar(rad * 0.75);
    bn.position.copy(show ? base.lerp(at, Math.min(1, (div - 0.5) * 2 + (P >= 2 ? 1 : 0))) : base);
  }
}

// ===================================================================== bread mould (Rhizopus)

function mould(): BuiltModel {
  const r = rng(41);
  const meshes: MeshDef[] = [];
  const slab = new THREE.BoxGeometry(13, 1.6, 6, 40, 4, 20);
  const pos = slab.getAttribute('position');
  for (let i = 0; i < pos.count; i++) if (pos.getY(i) > 0.7) pos.setY(i, pos.getY(i) + 0.08 * Math.sin(pos.getX(i) * 1.3) * Math.cos(pos.getZ(i) * 1.7));
  slab.computeVertexNormals();
  meshes.push({ id: 'bo-substrato', structure: 'substrato', geometry: paint(place(slab, [0, -2.8, 0]), c('substrato')) });
  const top = -2.0;
  const nodes = [new THREE.Vector3(-4.2, top, 0.4), new THREE.Vector3(0, top, -0.6), new THREE.Vector3(4.1, top, 0.5)];
  // stolons (arched hyphae) between nodes and a mesh of fine hyphae on the bread
  const hy: THREE.BufferGeometry[] = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    const a = nodes[i];
    const b = nodes[i + 1];
    const mid = a.clone().lerp(b, 0.5).add(new THREE.Vector3(0, 1.3, 0.4));
    hy.push(tube([a, a.clone().lerp(mid, 0.5).add(new THREE.Vector3(0, 0.4, 0)), mid, b.clone().lerp(mid, 0.5).add(new THREE.Vector3(0, 0.4, 0)), b], 0.06, false, 60, 6));
  }
  for (let i = 0; i < 24; i++) {
    const start = new THREE.Vector3(r.range(-6, 6), top + 0.05, r.range(-2.6, 2.6));
    const pts = [start];
    let dir = new THREE.Vector3(r.range(-1, 1), 0, r.range(-1, 1)).normalize();
    for (let s = 0; s < 8; s++) {
      dir = dir.add(new THREE.Vector3(r.range(-0.6, 0.6), 0, r.range(-0.6, 0.6))).normalize();
      const n = pts[pts.length - 1].clone().addScaledVector(dir, 0.35);
      n.x = THREE.MathUtils.clamp(n.x, -6.3, 6.3);
      n.z = THREE.MathUtils.clamp(n.z, -2.9, 2.9);
      n.y = top + 0.05 + r.range(0, 0.06);
      pts.push(n);
    }
    hy.push(tube(pts, 0.025, false, 40, 4));
  }
  meshes.push({ id: 'bo-hifas', structure: 'hifas', geometry: paint(merge(hy), c('hifas')) });
  // rhizoids into the bread under each node
  const rz: THREE.BufferGeometry[] = [];
  for (const n of nodes)
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2 + r.range(0, 0.5);
      const pts = [n.clone(), n.clone().add(new THREE.Vector3(Math.cos(a) * 0.25, -0.3, Math.sin(a) * 0.25)), n.clone().add(new THREE.Vector3(Math.cos(a) * 0.5, -0.65, Math.sin(a) * 0.5))];
      rz.push(tube(pts, 0.035, false, 12, 5));
      rz.push(tube([pts[1], pts[1].clone().add(new THREE.Vector3(Math.cos(a + 1) * 0.2, -0.3, Math.sin(a + 1) * 0.2))], 0.02, false, 6, 4));
    }
  meshes.push({ id: 'bo-rizoides', structure: 'rizoides', geometry: paint(merge(rz), c('rizoides')) });
  // sporangiophores with sporangia; one sporangium is cut open (columella + spores)
  const stalks: THREE.BufferGeometry[] = [];
  const heads: THREE.BufferGeometry[] = [];
  const spores: THREE.Vector3[] = [];
  let cutDone = false;
  const cutS: Cut = { center: 0.2, width: Math.PI * 0.9 };
  let col: THREE.BufferGeometry | null = null;
  nodes.forEach((n, i) => {
    for (let k = 0; k < 3; k++) {
      const h = r.range(2.6, 4.0);
      const lean = new THREE.Vector3(Math.cos(k * 2.1 + i) * 1.1, 0, Math.sin(k * 2.1 + i) * 0.9);
      const tip = n.clone().add(new THREE.Vector3(0, h, 0)).add(lean);
      stalks.push(tube([n.clone(), n.clone().lerp(tip, 0.5).add(lean.clone().multiplyScalar(-0.2)), tip], 0.06, false, 20, 6));
      const R = r.range(0.42, 0.55);
      const isCut = !cutDone && i === 1 && k === 0;
      if (isCut) {
        cutDone = true;
        heads.push(place(shell(wobble(ellipsoid(R, R, R), 0.04, k + i), cutS, [32, 24]), tip.clone().add(new THREE.Vector3(0, R * 0.6, 0))));
        col = place(new THREE.SphereGeometry(R * 0.5, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2), tip.clone());
        for (let s = 0; s < 220; s++) {
          const d = r.dir();
          const p = d.clone().multiplyScalar(R * r.range(0.55, 0.92));
          if (inWedge(p, cutS) && p.length() > R * 0.6) continue;
          spores.push(p.add(tip).add(new THREE.Vector3(0, R * 0.6, 0)));
        }
      } else {
        const ball = wobble(ellipsoid(R, R, R), 0.06, k + i * 3);
        heads.push(place(merge([shell(ball, { center: 0, width: 0 }, [28, 20]), bumps(r, ball, 90, [0.04, 0.08], 0.04, null)]), tip.clone().add(new THREE.Vector3(0, R * 0.6, 0))));
      }
    }
  });
  // released spores drifting in the air
  for (let s = 0; s < 40; s++) spores.push(new THREE.Vector3(r.range(-5, 5), r.range(1.4, 3.4), r.range(-1.5, 1.5)));
  meshes.push({ id: 'bo-esporangioforos', structure: 'esporangioforo', geometry: paint(merge(stalks), c('esporangioforo')) });
  meshes.push({ id: 'bo-esporangios', structure: 'esporangio', geometry: paint(merge(heads), c('esporangio')) });
  if (col) meshes.push({ id: 'bo-columela', structure: 'columela', geometry: paint(col, c('columela')) });
  meshes.push({ id: 'bo-esporos', structure: 'esporos', geometry: paint(dots(spores, 0.06), c('esporos')) });
  return { meshes: colorize(meshes), anchors: {}, preset: presetFor(17, [-0.8, 0, 0], 0.32, 0.2) };
}

// ===================================================================== mushroom

function lathe(profile: [number, number][], seg = 64, phiStart = 0, phiLen = Math.PI * 2) {
  return new THREE.LatheGeometry(
    profile.map(([x, y]) => new THREE.Vector2(x, y)),
    seg,
    phiStart,
    phiLen,
  );
}

function mushroom(): BuiltModel {
  const r = rng(51);
  const meshes: MeshDef[] = [];
  // a quarter of the mushroom is cut away to show the gills and the inside
  const phiStart = Math.PI * 0.62;
  const phiLen = Math.PI * 1.5;
  const capProfile: [number, number][] = [
    [0, 3.55],
    [0.8, 3.5],
    [1.6, 3.3],
    [2.3, 2.95],
    [2.75, 2.5],
    [2.95, 2.1],
    [2.85, 1.95],
  ];
  const under: [number, number][] = [
    [2.85, 1.95],
    [2.2, 2.2],
    [1.2, 2.4],
    [0.4, 2.45],
  ];
  const capOuter = lathe(capProfile, 72, phiStart, phiLen);
  const capInner = lathe([...under].reverse() as [number, number][], 72, phiStart, phiLen);
  // flesh on the two cut planes
  const flesh: THREE.BufferGeometry[] = [];
  for (const phi of [phiStart, phiStart + phiLen]) {
    const shape = new THREE.Shape();
    shape.moveTo(0, 3.55);
    for (const [x, y] of capProfile) shape.lineTo(x, y);
    for (const [x, y] of under) shape.lineTo(x, y);
    shape.lineTo(0.42, 2.45);
    shape.lineTo(0.42, -0.4);
    shape.lineTo(0, -0.4);
    const g = new THREE.ShapeGeometry(shape, 6);
    g.rotateY(phi - Math.PI / 2);
    flesh.push(g);
  }
  meshes.push({ id: 'cg-pileo', structure: 'pileo', geometry: merge([paint(capOuter, c('pileo')), paint(capInner, '#E8D5B5'), paint(merge(flesh), '#F6ECDD')]) });
  // gills: thin radial plates under the cap
  const gills: THREE.BufferGeometry[] = [];
  const nG = 64;
  for (let i = 0; i < nG; i++) {
    const a = (i / nG) * Math.PI * 2;
    let rel = a - phiStart;
    rel = ((rel % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    if (rel > phiLen) continue;
    const inner = i % 2 ? 1.3 : 0.5;
    const sh = new THREE.Shape();
    sh.moveTo(inner, 2.4);
    sh.lineTo(2.8, 1.98);
    sh.lineTo(2.6, 1.9);
    sh.quadraticCurveTo(1.6, 1.85, inner, 2.15);
    const g = new THREE.ExtrudeGeometry(sh, { depth: 0.02, bevelEnabled: false });
    g.rotateY(a - Math.PI / 2);
    gills.push(g);
  }
  meshes.push({ id: 'cg-lamelas', structure: 'lamelas', geometry: paint(merge(gills), c('lamelas')) });
  meshes.push({ id: 'cg-estipe', structure: 'estipe', geometry: paint(lathe([[0.001, -0.4], [0.5, -0.35], [0.46, 0.6], [0.42, 1.6], [0.4, 2.45], [0.001, 2.45]], 48, phiStart, phiLen), c('estipe')) });
  meshes.push({ id: 'cg-anel', structure: 'anel', geometry: paint(lathe([[0.44, 1.85], [0.75, 1.7], [0.9, 1.45], [0.85, 1.4], [0.68, 1.6], [0.44, 1.72]], 48, phiStart, phiLen), c('anel')) });
  meshes.push({ id: 'cg-volva', structure: 'volva', geometry: paint(lathe([[0.5, -0.45], [0.85, -0.3], [0.95, 0.15], [0.8, 0.3], [0.7, 0.05], [0.55, -0.2]], 48, phiStart, phiLen), c('volva')) });
  // soil block with a cut front showing the mycelium
  const soil = new THREE.BoxGeometry(10, 2.4, 3.6, 30, 3, 12);
  const sp = soil.getAttribute('position');
  for (let i = 0; i < sp.count; i++) if (sp.getY(i) > 1) sp.setY(i, sp.getY(i) + 0.06 * Math.sin(sp.getX(i) * 2.1 + sp.getZ(i)));
  soil.computeVertexNormals();
  meshes.push({ id: 'cg-solo', structure: 'solo', geometry: paint(place(soil, [0, -1.75, -1.4]), c('solo')) });
  const my: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 46; i++) {
    const start = new THREE.Vector3(r.range(-0.4, 0.4), -0.6, 0.5);
    const pts = [start];
    let dir = new THREE.Vector3(r.range(-1, 1), r.range(-0.7, 0.1), 0).normalize();
    for (let s = 0; s < 10; s++) {
      dir = dir.add(new THREE.Vector3(r.range(-0.5, 0.5), r.range(-0.3, 0.2), 0)).normalize();
      const n = pts[pts.length - 1].clone().addScaledVector(dir, 0.45);
      n.x = THREE.MathUtils.clamp(n.x, -4.9, 4.9);
      n.y = THREE.MathUtils.clamp(n.y, -2.9, -0.65);
      n.z = THREE.MathUtils.clamp(n.z, 0.42, 0.62);
      pts.push(n);
    }
    my.push(tube(pts, 0.022, false, 50, 4));
  }
  meshes.push({ id: 'cg-micelio', structure: 'micelio', geometry: paint(merge(my), c('micelio')) });
  // spores falling from the gills
  const sp2: THREE.Vector3[] = [];
  for (let i = 0; i < 90; i++) {
    const a = r.range(0, Math.PI * 2);
    const rr = r.range(1.2, 2.8);
    sp2.push(new THREE.Vector3(Math.cos(a) * rr, r.range(0.6, 1.85), Math.sin(a) * rr));
  }
  meshes.push({ id: 'cg-esporos', structure: 'basidiosporos', geometry: paint(dots(sp2, 0.035), c('basidiosporos')) });
  return { meshes: colorize(meshes), anchors: {}, preset: presetFor(14.5, [-0.9, 0.6, 0], 0.32, 0.55) };
}

// ===================================================================== amoeba

/** Amoeba body: a flattened blob with lobes (pseudopods) in the XZ plane. */
const LOBES = [
  { a: 0.3, k: 0.7 },
  { a: 1.6, k: 0.5 },
  { a: 2.6, k: 0.85 },
  { a: 3.9, k: 0.45 },
  { a: 5.0, k: 0.6 },
];
export const AMOEBA_CUT: Cut = { center: 0.45, width: Math.PI * 0.5 };
export const amoebaShape: DistFn = (d) => {
  const base = ellipsoid(2.6, 1.0, 2.2)(d);
  const phi = Math.atan2(d.x, d.z);
  let bump = 0;
  for (const l of LOBES) {
    const dd = Math.atan2(Math.sin(phi - l.a), Math.cos(phi - l.a));
    bump += l.k * Math.exp(-(dd * dd) / 0.09) * (1 - Math.abs(d.y));
  }
  return wobble2(() => base * (1 + bump), 0.04, 6)(d);
};
/** Food particle position and the direction the feeding pseudopods reach to. */
export const FOOD_AT = new THREE.Vector3(5.2, 0, -2.6);

function amoebaArm(len: number) {
  // blobby arm from origin along +X
  const g = bentCapsule(len / 2, 0.55, 0.5, 12, 14);
  g.rotateZ(-Math.PI / 2);
  g.translate(len / 2, 0, 0);
  return g;
}

function amoeba(): BuiltModel {
  const r = rng(61);
  const meshes: MeshDef[] = [];
  meshes.push({
    id: 'am-membrana',
    structure: 'membrana-ameba',
    geometry: paint(shell(amoebaShape, AMOEBA_CUT, [110, 48]), c('membrana-ameba')),
  });
  // granular endoplasm
  const gr: THREE.Vector3[] = [];
  for (let i = 0; i < 3000 && gr.length < 520; i++) {
    const p = new THREE.Vector3(r.range(-4, 4), r.range(-0.8, 0.8), r.range(-4, 4));
    if (inside(amoebaShape, p, 0.85) && !inWedge(p, AMOEBA_CUT)) gr.push(p);
  }
  meshes.push({ id: 'am-endoplasma', structure: 'endoplasma', geometry: paint(dots(gr, 0.05), c('endoplasma')) });
  meshes.push({ id: 'am-nucleo', structure: 'nucleo', geometry: paint(place(new THREE.SphereGeometry(0.62, 26, 18), [-0.5, 0.05, -0.4], undefined, new THREE.Vector3(1, 0.65, 1)), c('nucleo')) });
  meshes.push({ id: 'am-vac-contratil', structure: 'vacuolo-contratil', geometry: paint(new THREE.SphereGeometry(0.42, 22, 16), c('vacuolo-contratil')) });
  const dv: THREE.BufferGeometry[] = [];
  for (const [x, z, s] of [
    [-1.6, 0.8, 0.38],
    [0.9, -1.4, 0.32],
  ] as const) {
    dv.push(place(new THREE.SphereGeometry(s, 18, 12), [x, 0, z]));
    dv.push(paint(dots([new THREE.Vector3(x, 0, z)], s * 0.45, 1), c('alimento')));
  }
  meshes.push({ id: 'am-vac-digestivos', structure: 'vacuolo-digestivo', geometry: merge(dv.map((g, i) => (i % 2 ? g : paint(g, c('vacuolo-digestivo'))))) });
  // the vacuole formed in phagocytosis (animated)
  meshes.push({ id: 'am-fagossomo', structure: 'vacuolo-digestivo', geometry: paint(new THREE.SphereGeometry(0.7, 20, 14), c('vacuolo-digestivo')) });
  // feeding pseudopods (animated) and the food: a small green alga
  meshes.push({ id: 'am-pseudo-a', structure: 'pseudopode', geometry: paint(amoebaArm(3.4), c('pseudopode')) });
  meshes.push({ id: 'am-pseudo-b', structure: 'pseudopode', geometry: paint(amoebaArm(3.4), c('pseudopode')) });
  const alga: THREE.BufferGeometry[] = [];
  const ar = rng(7);
  for (let i = 0; i < 7; i++) alga.push(place(new THREE.SphereGeometry(0.22, 12, 10), ar.dir().multiplyScalar(0.25)));
  meshes.push({ id: 'am-alimento', structure: 'alimento', geometry: paint(merge(alga), c('alimento')) });
  return { meshes: colorize(meshes), anchors: {}, preset: presetFor(15, [0.2, 0, -0.6], 0.62, 0.3) };
}

/** Phagocytosis: pseudopods surround the food, a food vacuole forms and is digested. */
export function posePhagocytosis(P: number, get: (id: string) => THREE.Object3D | undefined) {
  const a = get('am-pseudo-a');
  const b = get('am-pseudo-b');
  const food = get('am-alimento');
  const vac = get('am-fagossomo');
  const cv = get('am-vac-contratil');
  const base = new THREE.Vector3(2.6, 0, -1.1);
  const toFood = FOOD_AT.clone().sub(base);
  const ang = Math.atan2(-toFood.z, toFood.x);
  // step 0: arms reach out; 1: they close around the food; 2: pulled in; 3: digested; 4: residues out
  const reach = P < 1 ? 0.55 + 0.45 * P : 1;
  const close = P < 1 ? 0 : P < 2 ? P - 1 : 1;
  const pull = P < 2 ? 0 : P < 3 ? P - 2 : 1;
  const open = 0.55 * (1 - close);
  for (const [arm, side] of [
    [a, 1],
    [b, -1],
  ] as const) {
    if (!arm) continue;
    const shrink = 1 - pull * 0.85;
    arm.position.copy(base);
    arm.rotation.set(0, ang + side * open, side * 0.1);
    arm.scale.set(reach * shrink, 0.75, 0.75);
  }
  const foodAt = FOOD_AT.clone().lerp(new THREE.Vector3(1.4, 0, -0.6), pull);
  if (food) {
    food.position.copy(foodAt.clone());
    const digest = P < 3 ? 1 : P < 4 ? 1 - 0.7 * (P - 3) : 0.3;
    food.scale.setScalar(digest);
    if (P >= 4) food.position.copy(new THREE.Vector3(1.4, 0, -0.6).lerp(new THREE.Vector3(-3.6, 0, 3.2), Math.min(1, (P - 4) * 1.2)));
  }
  if (vac) {
    const show = P >= 2 && P < 4.2;
    vac.scale.setScalar(show ? (P < 3 ? 1 : 1 - 0.5 * Math.min(1, P - 3)) : 0.0001);
    vac.position.copy(foodAt);
  }
  // the contractile vacuole keeps filling and emptying
  if (cv) {
    const s = 0.55 + 0.45 * Math.abs(Math.cos(P * Math.PI * 1.5));
    cv.position.set(-1.9, 0.1, -1.4);
    cv.scale.setScalar(s);
  }
}

// ===================================================================== paramecium

function paramecium(): BuiltModel {
  const r = rng(71);
  const meshes: MeshDef[] = [];
  const cut: Cut = { center: 0.1, width: Math.PI * 0.62 };
  // slipper shape along Y (later laid along X), with an oral groove on one side
  const groove = new THREE.Vector3(0.8, 0.1, 0.6).normalize();
  const body: DistFn = (d) => {
    const yy = d.y;
    const base = ellipsoid(1.35, 3.6, 1.15)(d) * (1 + 0.12 * Math.sin(yy * 2.2));
    const g = d.dot(groove);
    return base * (1 - 0.16 * Math.exp(-((1 - g) * (1 - g)) / 0.05) * (yy < 0.3 ? 1 : 0.2));
  };
  const seg: [number, number] = [96, 64];
  meshes.push({ id: 'pa-pelicula', structure: 'pelicula', geometry: paint(shell(body, cut, seg), c('pelicula')) });
  meshes.push({ id: 'pa-sulco', structure: 'sulco-oral', geometry: paint(patch(scaled(body, 1.004), [1.45, 2.2], [0.75, 1.25], [20, 16]), c('sulco-oral')) });
  // cilia all over the surface
  meshes.push({ id: 'pa-cilios', structure: 'cilios', geometry: paint(bumps(r, body, 1500, [0.16, 0.24], 0.012, cut), c('cilios')) });
  // trichocysts just under the pellicle
  const tri: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 260 * 3 && tri.length < 260; i++) {
    const d = r.dir();
    const p = d.clone().multiplyScalar(body(d) * 0.92);
    if (inWedge(p, cut)) continue;
    tri.push(place(new THREE.CylinderGeometry(0.018, 0.018, 0.16, 4), p, alignY(d)));
  }
  meshes.push({ id: 'pa-tricocistos', structure: 'tricocistos', geometry: paint(merge(tri), c('tricocistos')) });
  meshes.push({ id: 'pa-citostoma', structure: 'citostoma', geometry: paint(tube([groove.clone().multiplyScalar(1.05).setY(-0.6), new THREE.Vector3(0.5, -0.7, 0.2), new THREE.Vector3(0.1, -0.5, -0.1)], 0.1, false, 20, 8), c('citostoma')) });
  meshes.push({ id: 'pa-macronucleo', structure: 'macronucleo', geometry: paint(place(bentCapsule(0.7, 0.42, 0.7, 12, 18), [-0.2, 0.3, -0.2]), c('macronucleo')) });
  meshes.push({ id: 'pa-micronucleo', structure: 'micronucleo', geometry: paint(place(new THREE.SphereGeometry(0.16, 14, 10), [0.35, 0.65, -0.1]), c('micronucleo')) });
  // two star-shaped contractile vacuoles near the ends
  const cvs: THREE.BufferGeometry[] = [];
  for (const y of [2.1, -2.0]) {
    const at = new THREE.Vector3(-0.3, y, -0.35);
    cvs.push(place(new THREE.SphereGeometry(0.2, 16, 12), at));
    for (let k = 0; k < 7; k++) {
      const a = (k / 7) * Math.PI * 2;
      const dir = new THREE.Vector3(Math.cos(a), Math.sin(a) * 0.35, Math.sin(a)).normalize();
      cvs.push(tube([at.clone(), at.clone().addScaledVector(dir, 0.35), at.clone().addScaledVector(dir, 0.65).add(new THREE.Vector3(0, 0.05, 0))], 0.04, false, 10, 5));
    }
  }
  meshes.push({ id: 'pa-vac-contrateis', structure: 'vacuolo-contratil', geometry: paint(merge(cvs), c('vacuolo-contratil')) });
  const dv: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 9; i++) {
    const p = new THREE.Vector3(r.range(-0.6, 0.5), r.range(-2.4, 1.6), r.range(-0.6, 0.3));
    if (!inside(body, p, 0.8) || inWedge(p, cut)) continue;
    dv.push(paint(place(new THREE.SphereGeometry(r.range(0.16, 0.24), 14, 10), p), c('vacuolo-digestivo')));
  }
  meshes.push({ id: 'pa-vac-digestivos', structure: 'vacuolo-digestivo', geometry: merge(dv) });
  meshes.push({ id: 'pa-citoprocto', structure: 'citoprocto', geometry: paint(place(new THREE.TorusGeometry(0.12, 0.04, 8, 16), groove.clone().multiplyScalar(1.12).setY(-2.4), alignY(new THREE.Vector3(1, 0, 0.6))), c('citoprocto')) });
  for (const m of meshes) m.geometry.applyQuaternion(LAY_X);
  return { meshes: colorize(meshes), anchors: {}, preset: presetFor(13, [-0.9, 0, 0], 0.45, 0.25) };
}

// ===================================================================== Euglena

function euglena(): BuiltModel {
  const r = rng(81);
  const meshes: MeshDef[] = [];
  const cut: Cut = { center: 0.25, width: Math.PI * 0.6 };
  // spindle: rounded front (+Y), tapering tail (−Y)
  const body: DistFn = (d) => {
    const taper = d.y < 0 ? 1 - 0.75 * d.y * d.y : 1 - 0.15 * d.y * d.y;
    return ellipsoid(1.05 * taper + 0.05, 3.3, 1.05 * taper + 0.05)(d);
  };
  const seg: [number, number] = [80, 64];
  const pel = shell(body, cut, seg);
  // helical stripes of the pellicle
  const pp = pel.getAttribute('position');
  const col = new Float32Array(pp.count * 3);
  const a = new THREE.Color(c('pelicula-euglena'));
  const b = new THREE.Color('#8CCBA5');
  for (let i = 0; i < pp.count; i++) {
    const phi = Math.atan2(pp.getX(i), pp.getZ(i));
    const k = Math.sin(phi * 9 + pp.getY(i) * 3.2) > 0.6 ? b : a;
    col.set([k.r, k.g, k.b], i * 3);
  }
  pel.setAttribute('color', new THREE.BufferAttribute(col, 3));
  meshes.push({ id: 'eu-pelicula', structure: 'pelicula-euglena', geometry: pel });
  // flagellum from the reservoir at the front
  const fl: THREE.Vector3[] = [];
  for (let i = 0; i <= 80; i++) {
    const t = i / 80;
    fl.push(new THREE.Vector3(Math.sin(t * Math.PI * 3) * 0.45 * t, 3.0 + t * 5.0, Math.cos(t * Math.PI * 2.2) * 0.25 * t));
  }
  meshes.push({ id: 'eu-flagelo', structure: 'flagelo-eucarioto', geometry: paint(tube([new THREE.Vector3(0, 2.6, 0), ...fl], 0.05, false, 300, 6), c('flagelo-eucarioto')) });
  meshes.push({ id: 'eu-reservatorio', structure: 'reservatorio', geometry: paint(place(new THREE.SphereGeometry(0.34, 18, 14), [0, 2.55, 0], undefined, new THREE.Vector3(1, 1.3, 1)), c('reservatorio')) });
  meshes.push({ id: 'eu-estigma', structure: 'estigma', geometry: paint(place(new THREE.SphereGeometry(0.17, 14, 10), [0.38, 2.45, 0.25], undefined, new THREE.Vector3(1, 1.4, 0.6)), c('estigma')) });
  meshes.push({ id: 'eu-vac-contratil', structure: 'vacuolo-contratil', geometry: paint(place(new THREE.SphereGeometry(0.22, 16, 12), [-0.35, 2.2, -0.15]), c('vacuolo-contratil')) });
  meshes.push({ id: 'eu-nucleo', structure: 'nucleo', geometry: merge([paint(place(new THREE.SphereGeometry(0.48, 22, 16), [0, -0.3, -0.1]), c('nucleo')), paint(place(new THREE.SphereGeometry(0.17, 12, 10), [0.15, -0.2, 0.2]), '#45306B')]) });
  const chl: THREE.BufferGeometry[] = [];
  const par: THREE.BufferGeometry[] = [];
  let made = 0;
  for (let i = 0; i < 400 && made < 16; i++) {
    const p = new THREE.Vector3(r.range(-0.8, 0.8), r.range(-2.4, 2.0), r.range(-0.8, 0.8));
    if (!inside(body, p, 0.82) || inWedge(p, cut) || p.distanceTo(new THREE.Vector3(0, -0.3, -0.1)) < 0.65) continue;
    chl.push(place(new THREE.SphereGeometry(0.26, 14, 10), p, randomQuat(r), new THREE.Vector3(1, 0.35, 0.7)));
    made++;
  }
  for (let i = 0; i < 18; i++) {
    const p = new THREE.Vector3(r.range(-0.6, 0.6), r.range(-2.2, 1.8), r.range(-0.6, 0.6));
    if (!inside(body, p, 0.8) || inWedge(p, cut)) continue;
    par.push(place(new THREE.SphereGeometry(0.1, 10, 8), p, randomQuat(r), new THREE.Vector3(1.6, 0.8, 0.8)));
  }
  meshes.push({ id: 'eu-cloroplastos', structure: 'cloroplasto', geometry: paint(merge(chl), c('cloroplasto')) });
  meshes.push({ id: 'eu-paramilo', structure: 'paramilo', geometry: paint(merge(par), c('paramilo')) });
  const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -Math.PI / 2.6);
  for (const m of meshes) m.geometry.applyQuaternion(q);
  return { meshes: colorize(meshes), anchors: {}, preset: presetFor(14, [0.4, -0.3, 0], 0.3, 0.3) };
}

export function buildMicrobeModel(id: MicrobeStaticModel): BuiltModel {
  switch (id) {
    case 'bacterias':
      return bacteria();
    case 'bacteriofago':
      return bacteriophage();
    case 'coronavirus':
      return coronavirus();
    case 'levedura':
      return yeast();
    case 'bolor':
      return mould();
    case 'cogumelo':
      return mushroom();
    case 'ameba':
      return amoeba();
    case 'paramecio':
      return paramecium();
    case 'euglena':
      return euglena();
  }
}

// re-exported for the scenes
export { capsuleY };
