/**
 * Static models of the Genetics laboratory, built in code: the DNA double
 * helix, the nucleotides, messenger and transfer RNA, and the levels of DNA
 * packing up to the metaphase chromosome. Schematic and out of scale.
 */
import * as THREE from 'three';
import { merge, paint, place, tube } from '@/laboratories/shared/geometry';
import type { BuiltModel, MeshDef } from '@/laboratories/shared/types';
import { presetFor } from '@/laboratories/shared/types';
import { GENETICS_COLOR, colorize } from './materials';
import { BASE_COLOR, BASE_STRUCT, DNA_PAIR, HALF_RUNG, SPACING, STRAND_COLOR, aminoAcidGeo, isPurine, ladderNucleotide, seq, textGeo, type Base } from './kit';

export type GeneticsStaticModel = 'dna' | 'nucleotideo' | 'rna' | 'cromossomo';

const X = new THREE.Vector3(1, 0, 0);
const Y = new THREE.Vector3(0, 1, 0);

/** Cylinder between two points. */
export function stick(a: THREE.Vector3, b: THREE.Vector3, r: number, radial = 8) {
  const d = b.clone().sub(a);
  const g = new THREE.CylinderGeometry(r, r, d.length(), radial);
  return place(g, a.clone().add(b).multiplyScalar(0.5), new THREE.Quaternion().setFromUnitVectors(Y, d.normalize()));
}

/** Flat regular polygon tile in the XY plane (facing +Z). `start` is the angle of the first vertex. */
function polygonTile(n: number, r: number, start: number, depth: number) {
  const s = new THREE.Shape();
  for (let i = 0; i < n; i++) {
    const a = start + (i * Math.PI * 2) / n;
    if (i === 0) s.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else s.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false });
  g.translate(0, 0, -depth / 2);
  return g;
}

const byStructure = (groups: Map<string, THREE.BufferGeometry[]>, id: string, g: THREE.BufferGeometry) => {
  groups.set(id, [...(groups.get(id) ?? []), g]);
};
/** One mesh per structure; parts without baked colours take the structure's colour. */
function flush(groups: Map<string, THREE.BufferGeometry[]>, meshes: MeshDef[]) {
  for (const [id, geos] of groups) {
    const color = GENETICS_COLOR[id] ?? '#94A3B8';
    meshes.push({ id, structure: id, geometry: merge(geos.map((g) => (g.getAttribute('color') ? g : paint(g, color)))) });
  }
}

// ------------------------------------------------------------------ DNA double helix

export const HELIX_SEQUENCE = 'ATGCGTACCTTAGGCATCGA';

/** B-DNA: right-handed, ~10.5 base pairs per turn, 0.34 nm between pairs, 2 nm wide (1 unit = 1 nm). */
function buildDna(): BuiltModel {
  const bases = seq(HELIX_SEQUENCE);
  const n = bases.length;
  const rise = 0.34;
  const twist = (Math.PI * 2) / 10.5;
  const R = 1;
  const offset = 2.35; // angle between the two strands at one pair: leaves a major and a minor groove
  const groups = new Map<string, THREE.BufferGeometry[]>();
  const at = (theta: number, y: number, r = R) => new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r);
  const backbones: THREE.Vector3[][] = [[], []];

  for (let i = 0; i < n; i++) {
    const y = (i - (n - 1) / 2) * rise;
    const t1 = i * twist;
    const t2 = t1 + offset;
    const b1 = bases[i];
    const b2 = DNA_PAIR[b1];
    const s1 = at(t1, y, 0.8);
    const s2 = at(t2, y, 0.8);
    // phosphates sit half a step from the sugars, on the outside
    const p1 = at(t1 - twist / 2, y - rise / 2, R);
    const p2 = at(t2 + twist / 2, y + rise / 2, R);
    backbones[0].push(p1);
    backbones[1].push(p2);
    for (const [s, p] of [
      [s1, p1],
      [s2, p2],
    ]) {
      const sugar = new THREE.CylinderGeometry(0.13, 0.13, 0.07, 5);
      byStructure(groups, 'desoxirribose', place(sugar, s));
      byStructure(groups, 'fosfato', place(new THREE.IcosahedronGeometry(0.11, 1), p));
      byStructure(groups, 'esqueleto-acucar-fosfato', stick(s, p, 0.035));
    }
    // bases along the chord between the two sugars, meeting in the middle
    const chord = s2.clone().sub(s1);
    const len = chord.length();
    const dir = chord.clone().normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(X, dir);
    const gap = 0.16;
    const usable = len - 0.2 - gap;
    const l1 = usable * (isPurine(b1) ? 0.56 : 0.44);
    const l2 = usable - l1;
    const c1 = s1.clone().addScaledVector(dir, 0.1 + l1 / 2);
    const c2 = s2.clone().addScaledVector(dir, -0.1 - l2 / 2);
    byStructure(groups, BASE_STRUCT[b1], place(new THREE.BoxGeometry(l1, 0.08, 0.3), c1, q));
    byStructure(groups, BASE_STRUCT[b2], place(new THREE.BoxGeometry(l2, 0.08, 0.3), c2, q));
    // hydrogen bonds: two between A and T, three between G and C
    const e1 = s1.clone().addScaledVector(dir, 0.1 + l1);
    const e2 = s2.clone().addScaledVector(dir, -0.1 - l2);
    const side = new THREE.Vector3(0, 1, 0).cross(dir).normalize();
    const nb = b1 === 'A' || b1 === 'T' ? 2 : 3;
    for (let k = 0; k < nb; k++) {
      const o = (k - (nb - 1) / 2) * 0.09;
      byStructure(groups, 'ligacoes-hidrogenio', stick(e1.clone().addScaledVector(side, o), e2.clone().addScaledVector(side, o), 0.016, 5));
    }
  }
  for (const pts of backbones) byStructure(groups, 'esqueleto-acucar-fosfato', tube(pts, 0.05, false, pts.length * 10, 8));
  // 5' and 3' ends: strand 1 runs 5'→3' upwards, strand 2 downwards (antiparallel)
  const label = (text: string, p: THREE.Vector3) => byStructure(groups, 'esqueleto-acucar-fosfato', place(textGeo(text, 0.22, 0.04), p.clone().add(new THREE.Vector3(0, 0, 0.35))));
  const top = (n - 1) / 2 * rise;
  label("5'", backbones[0][0].clone().setY(-top - 0.55));
  label("3'", backbones[0][n - 1].clone().setY(top + 0.45));
  label("3'", backbones[1][0].clone().setY(-top - 0.45));
  label("5'", backbones[1][n - 1].clone().setY(top + 0.55));

  const meshes: MeshDef[] = [];
  flush(groups, meshes);
  return { meshes, anchors: {}, preset: presetFor(15, [-0.9, 0, 0], 0.12, 0.25) };
}

// ------------------------------------------------------------------ nucleotides

const SUGAR_R = 0.45;
const sugarVertex = (k: number) => {
  // ring oxygen on top, then C1' (right), C2', C3', C4' (left)
  const a = Math.PI / 2 - (k * Math.PI * 2) / 5;
  return new THREE.Vector3(Math.cos(a) * SUGAR_R, Math.sin(a) * SUGAR_R, 0);
};

/** Schematic nucleotide in the XY plane: phosphate, pentose ring and nitrogenous base (one ring for pyrimidines, two for purines). */
function chemNucleotide(base: Base, ribose: boolean, at: THREE.Vector3, groups: Map<string, THREE.BufferGeometry[]>) {
  const sugarId = ribose ? 'ribose' : 'desoxirribose';
  const sugarColor = ribose ? '#C9A2E8' : '#9FB6D8';
  const sugar: THREE.BufferGeometry[] = [];
  const ring = [0, 1, 2, 3, 4, 0].map(sugarVertex);
  sugar.push(paint(tube(ring, 0.06, true, 60, 8), sugarColor));
  sugar.push(paint(polygonTile(5, SUGAR_R * 0.95, Math.PI / 2, 0.06), sugarColor));
  for (let k = 0; k < 5; k++) sugar.push(paint(place(new THREE.IcosahedronGeometry(k === 0 ? 0.1 : 0.085, 1), sugarVertex(k)), k === 0 ? '#E5484D' : '#5B6B7F'));
  // C5' outside the ring, linked to the phosphate
  const c4 = sugarVertex(4);
  const c5 = c4.clone().add(new THREE.Vector3(-0.22, 0.36, 0));
  sugar.push(paint(stick(c4, c5, 0.045), sugarColor), paint(place(new THREE.IcosahedronGeometry(0.085, 1), c5), '#5B6B7F'));
  // 2' carbon: -OH in ribose, only -H in deoxyribose
  const c2 = sugarVertex(2);
  const sub = c2.clone().add(new THREE.Vector3(0.12, -0.36, 0));
  sugar.push(paint(stick(c2, sub, 0.035), sugarColor), paint(place(new THREE.IcosahedronGeometry(ribose ? 0.1 : 0.06, 1), sub), ribose ? '#E5484D' : '#E2E8F0'));
  if (ribose) sugar.push(paint(place(textGeo('OH', 0.13, 0.02), sub.clone().add(new THREE.Vector3(0.24, -0.06, 0.02))), '#7F1D1D'));
  byStructure(groups, sugarId, place(merge(sugar), at));

  // phosphate group: P with four oxygens
  const P = c5.clone().add(new THREE.Vector3(-0.42, 0.34, 0));
  const phos: THREE.BufferGeometry[] = [paint(stick(c5, P, 0.04), '#F08C2E'), paint(place(new THREE.IcosahedronGeometry(0.19, 2), P), '#F08C2E')];
  for (const o of [new THREE.Vector3(-0.32, 0.1, 0), new THREE.Vector3(0.05, 0.33, 0), new THREE.Vector3(-0.12, -0.2, 0.26), new THREE.Vector3(-0.12, -0.2, -0.26)]) {
    phos.push(paint(stick(P, P.clone().add(o), 0.03), '#F08C2E'), paint(place(new THREE.IcosahedronGeometry(0.1, 1), P.clone().add(o)), '#E5484D'));
  }
  byStructure(groups, 'fosfato', place(merge(phos), at));

  // nitrogenous base, bonded to C1'
  const c1 = sugarVertex(1);
  const n = c1.clone().add(new THREE.Vector3(0.32, 0.04, 0));
  const parts: THREE.BufferGeometry[] = [paint(stick(c1, n, 0.04), '#64748B')];
  const color = BASE_COLOR[base];
  const r6 = 0.42;
  let letterAt: THREE.Vector3;
  if (isPurine(base)) {
    const r5 = r6 / (2 * Math.sin(Math.PI / 5));
    const c5c = n.clone().add(new THREE.Vector3(r5, 0, 0));
    const c6c = c5c.clone().add(new THREE.Vector3(r5 * Math.cos(Math.PI / 5) + r6 * Math.cos(Math.PI / 6), 0, 0));
    parts.push(paint(place(polygonTile(5, r5, Math.PI, 0.12), c5c), color));
    parts.push(paint(place(polygonTile(6, r6, Math.PI / 6, 0.12), c6c), color));
    letterAt = c6c;
  } else {
    const c6c = n.clone().add(new THREE.Vector3(r6, 0, 0));
    parts.push(paint(place(polygonTile(6, r6, Math.PI, 0.12), c6c), color));
    letterAt = c6c;
  }
  parts.push(paint(place(textGeo(base, 0.3, 0.03), letterAt.clone().add(new THREE.Vector3(0, 0, 0.075))), base === 'G' ? '#3B2A00' : '#FFFFFF'));
  byStructure(groups, BASE_STRUCT[base], place(merge(parts), at));
}

function buildNucleotides(): BuiltModel {
  const groups = new Map<string, THREE.BufferGeometry[]>();
  // DNA: purines (A, G) on top, pyrimidines (T, C) below; RNA (with ribose and uracil) at the bottom
  chemNucleotide('A', false, new THREE.Vector3(-3.1, 2.2, 0), groups);
  chemNucleotide('G', false, new THREE.Vector3(1.0, 2.2, 0), groups);
  chemNucleotide('T', false, new THREE.Vector3(-3.1, -0.3, 0), groups);
  chemNucleotide('C', false, new THREE.Vector3(1.0, -0.3, 0), groups);
  chemNucleotide('U', true, new THREE.Vector3(-1.05, -2.9, 0), groups);
  const meshes: MeshDef[] = [];
  flush(groups, meshes);
  return { meshes, anchors: {}, preset: presetFor(15.5, [-2.2, -0.2, 0], 0.05, 0.12) };
}

// ------------------------------------------------------------------ RNA: messenger and transfer

export const RNA_SEQUENCE = 'AUGUUCGGAAAAUGGUAA';
export const TRNA_COLOR = '#2A9D8F';

/** x of nucleotide i of a strand of n nucleotides centred on 0. */
export const ladderX = (i: number, n: number) => (i - (n - 1) / 2) * SPACING;

/** Transfer RNA (cloverleaf) whose anticodon sits over the codon centred at `cx`, backbone of the anticodon at height `cy`. */
export function trnaGeometry(anticodon3to5: Base[], cx: number, cy: number): { body: THREE.BufferGeometry; anticodon: THREE.BufferGeometry; tip: THREE.Vector3 } {
  const L = cx;
  const v = (x: number, y: number) => new THREE.Vector3(L + x, cy + y, 0);
  const s = SPACING;
  const path = [
    v(-0.5, 5.0), v(-0.5, 3.1), // acceptor stem, 5' strand
    v(-1.0, 2.9), v(-2.6, 2.9), v(-3.25, 2.75), v(-3.5, 2.4), v(-3.25, 2.05), v(-2.6, 1.9), v(-1.0, 1.9), // D arm
    v(-0.5, 1.45), v(-0.5, 0.75), v(-s - 0.15, 0.25), v(-s, 0), v(0, 0), v(s, 0), v(s + 0.15, 0.25), v(0.5, 0.75), v(0.5, 1.45), // anticodon arm and loop
    v(1.0, 1.9), v(2.6, 1.9), v(3.25, 2.05), v(3.5, 2.4), v(3.25, 2.75), v(2.6, 2.9), v(1.0, 2.9), // T arm
    v(0.5, 3.1), v(0.5, 5.0), v(0.55, 5.6), // acceptor stem, 3' strand with the CCA end
  ];
  const parts: THREE.BufferGeometry[] = [paint(tube(path, 0.06, false, 260, 8), TRNA_COLOR)];
  const rung = (a: THREE.Vector3, b: THREE.Vector3) => parts.push(paint(stick(a, b, 0.07, 6), '#9ADBD1'));
  for (let y = 3.35; y <= 4.85; y += 0.37) rung(v(-0.5, y), v(0.5, y));
  for (let y = 0.9; y <= 1.35; y += 0.4) rung(v(-0.5, y), v(0.5, y));
  for (let x = 1.25; x <= 2.45; x += 0.4) {
    rung(v(-x, 2.9), v(-x, 1.9));
    rung(v(x, 2.9), v(x, 1.9));
  }
  parts.push(paint(place(textGeo("5'", 0.24, 0.04), v(-0.95, 5.0).setZ(0.1)), '#0F3D37'));
  parts.push(paint(place(textGeo("3'", 0.24, 0.04), v(1.05, 5.55).setZ(0.1)), '#0F3D37'));
  const anti = anticodon3to5.map((b, k) => place(ladderNucleotide(b, 'trna', -1), [L + (k - 1) * s, cy, 0]));
  return { body: merge(parts), anticodon: merge(anti), tip: v(0.6, 6.0) };
}

function buildRna(): BuiltModel {
  const bases = seq(RNA_SEQUENCE);
  const n = bases.length;
  const groups = new Map<string, THREE.BufferGeometry[]>();
  bases.forEach((b, i) => {
    const g = ladderNucleotide(b, 'rna', 1);
    byStructure(groups, 'rna-mensageiro', place(g, [ladderX(i, n), 0, 0]));
  });
  // codons: brackets under each group of three bases
  for (let c = 0; c < n / 3; c++) {
    const x0 = ladderX(c * 3, n) - SPACING * 0.42;
    const x1 = ladderX(c * 3 + 2, n) + SPACING * 0.42;
    const bar = paint(place(new THREE.BoxGeometry(x1 - x0, 0.12, 0.2), [(x0 + x1) / 2, -0.42, 0]), c % 2 ? '#64748B' : '#94A3B8');
    const ends = [x0, x1].map((x) => paint(place(new THREE.BoxGeometry(0.08, 0.3, 0.2), [x, -0.3, 0]), c % 2 ? '#64748B' : '#94A3B8'));
    byStructure(groups, 'codon', merge([bar, ...ends]));
  }
  byStructure(groups, 'rna-mensageiro', paint(place(textGeo("5'", 0.26, 0.04), [ladderX(0, n) - 0.75, 0, 0.1]), '#6B1D66'));
  byStructure(groups, 'rna-mensageiro', paint(place(textGeo("3'", 0.26, 0.04), [ladderX(n - 1, n) + 0.75, 0, 0.1]), '#6B1D66'));
  // the first codon (AUG) paired with the anticodon of the initiator tRNA (Met)
  const t = trnaGeometry(['U', 'A', 'C'], ladderX(1, n), 2 * HALF_RUNG);
  byStructure(groups, 'rna-transportador', t.body);
  byStructure(groups, 'anticodon', t.anticodon);
  byStructure(groups, 'aminoacido', place(aminoAcidGeo('M', 0.42), t.tip));
  const meshes: MeshDef[] = [];
  flush(groups, meshes);
  return { meshes, anchors: {}, preset: presetFor(22, [-1.6, 3.9, 0], 0.08, 0.1) };
}

// ------------------------------------------------------------------ DNA packing and the chromosome

/** DNA wrapped ~1.65 turns around a histone octamer (disc axis along `axis`). */
function nucleosome(center: THREE.Vector3, axis: THREE.Vector3, histones: THREE.BufferGeometry[], dna: THREE.BufferGeometry[], r = 0.42, turns = 1.65) {
  const q = new THREE.Quaternion().setFromUnitVectors(Y, axis.clone().normalize());
  const core: THREE.BufferGeometry[] = [];
  for (let k = 0; k < 8; k++) {
    const a = (k % 4) * (Math.PI / 2) + (k < 4 ? 0 : Math.PI / 4);
    core.push(place(new THREE.IcosahedronGeometry(r * 0.48, 1), [Math.cos(a) * r * 0.42, k < 4 ? r * 0.22 : -r * 0.22, Math.sin(a) * r * 0.42]));
  }
  histones.push(place(merge(core), center, q));
  const pts: THREE.Vector3[] = [];
  const steps = 40;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = t * turns * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(a) * r * 1.08, (t - 0.5) * r * 1.1, Math.sin(a) * r * 1.08).applyQuaternion(q).add(center));
  }
  dna.push(tube(pts, 0.05, false, 80, 6));
  return { start: pts[0], end: pts[pts.length - 1] };
}

/** Sister chromatid: a rod pinched at the centromere and bent slightly outwards, with the coiled-fibre texture. */
function chromatid(xc: number, side: 1 | -1, yc: number, yTop: number, yBot: number) {
  const rows = 90;
  const cols = 28;
  const pos: number[] = [];
  const idx: number[] = [];
  for (let j = 0; j <= rows; j++) {
    const y = yBot + (j / rows) * (yTop - yBot);
    const tEnd = Math.min(y - yBot, yTop - y);
    const cap = Math.sqrt(Math.max(0, 1 - Math.pow(Math.max(0, 0.5 - tEnd) / 0.5, 2)));
    const pinch = 1 - 0.5 * Math.exp(-(((y - yc) / 0.45) ** 2));
    const bend = side * 0.32 * (1 - Math.exp(-(((y - yc) / 1.6) ** 2)));
    for (let i = 0; i <= cols; i++) {
      const a = (i / cols) * Math.PI * 2;
      const coil = 1 + 0.06 * Math.sin(a * 2 + y * 9);
      const r = 0.55 * pinch * cap * coil;
      pos.push(xc + bend + Math.cos(a) * r, y, Math.sin(a) * r);
    }
  }
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++) {
      const a = j * (cols + 1) + i;
      const b = a + cols + 1;
      idx.push(a, b, a + 1, a + 1, b, b + 1);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

function buildChromosome(): BuiltModel {
  const meshes: MeshDef[] = [];
  // 1. naked double helix
  const helix: THREE.BufferGeometry[] = [];
  for (const ph of [0, 2.35]) {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 60; i++) {
      const t = i / 60;
      pts.push(new THREE.Vector3(-8.6 + Math.cos(t * 14 + ph) * 0.2, -1.6 + t * 3.2, Math.sin(t * 14 + ph) * 0.2));
    }
    helix.push(tube(pts, 0.045, false, 160, 6));
  }
  for (let i = 0; i <= 26; i++) {
    const t = i / 26;
    const a = t * 14;
    const p1 = new THREE.Vector3(-8.6 + Math.cos(a) * 0.2, -1.6 + t * 3.2, Math.sin(a) * 0.2);
    const p2 = new THREE.Vector3(-8.6 + Math.cos(a + 2.35) * 0.2, -1.6 + t * 3.2, Math.sin(a + 2.35) * 0.2);
    helix.push(stick(p1, p2, 0.022, 5));
  }
  // 2. "beads on a string": nucleosomes joined by linker DNA
  const histones: THREE.BufferGeometry[] = [];
  const dnaWrap: THREE.BufferGeometry[] = [];
  let prev: THREE.Vector3 | null = new THREE.Vector3(-8.6, 1.75, 0);
  const beads = [new THREE.Vector3(-6.5, 1.0, 0), new THREE.Vector3(-5.6, -0.2, 0.2), new THREE.Vector3(-4.5, 0.6, -0.2), new THREE.Vector3(-3.5, -0.5, 0.1), new THREE.Vector3(-2.6, 0.4, 0)];
  beads.forEach((c, k) => {
    const ends = nucleosome(c, new THREE.Vector3(0.4, 1, k % 2 ? 0.5 : -0.4), histones, dnaWrap);
    if (prev) dnaWrap.push(tube([prev, prev.clone().lerp(ends.start, 0.5).add(new THREE.Vector3(0, 0.2, 0)), ends.start], 0.05, false, 20, 6));
    prev = ends.end;
  });
  // 3. chromatin fibre (~30 nm): nucleosomes stacked in a helix
  const fibre: THREE.BufferGeometry[] = [];
  const fibreDna: THREE.BufferGeometry[] = [];
  const fibreHist: THREE.BufferGeometry[] = [];
  for (let k = 0; k < 26; k++) {
    const a = k * 1.05;
    const c = new THREE.Vector3(0.0 + Math.cos(a) * 0.5, -2.4 + k * 0.19, Math.sin(a) * 0.5);
    nucleosome(c, new THREE.Vector3(Math.cos(a), 0.3, Math.sin(a)), fibreHist, fibreDna, 0.28, 1.6);
  }
  fibre.push(paint(merge(fibreHist), '#E9A0B8'), paint(merge(fibreDna), STRAND_COLOR.antiga));
  // 4. metaphase chromosome: two sister chromatids joined at the centromere
  const yc = 0.7;
  const xA = 4.3;
  const xB = 5.4;
  meshes.push({ id: 'dna-dupla-helice', structure: 'dna', geometry: merge([...helix, ...dnaWrap]) });
  meshes.push({ id: 'histonas', structure: 'histonas', geometry: merge(histones) });
  meshes.push({ id: 'fibra-cromatina', structure: 'fibra-cromatina', geometry: merge(fibre) });
  meshes.push({ id: 'cromatide-a', structure: 'cromatide-irma', geometry: chromatid(xA, -1, yc, 3.6, -3.4) });
  meshes.push({ id: 'cromatide-b', structure: 'cromatide-irma', cls: 'cromatide-irma-b', geometry: chromatid(xB, 1, yc, 3.6, -3.4) });
  const centro = new THREE.TorusGeometry(0.62, 0.11, 10, 40);
  meshes.push({ id: 'centromero', structure: 'centromero', geometry: place(centro, [(xA + xB) / 2, yc, 0], new THREE.Quaternion().setFromAxisAngle(X, Math.PI / 2), new THREE.Vector3(1.25, 1, 1)) });
  const kin = [xA - 0.32, xB + 0.32].map((x, k) => place(new THREE.CylinderGeometry(0.2, 0.2, 0.1, 20), [x + (k ? 0.02 : -0.02), yc, 0], new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2)));
  meshes.push({ id: 'cinetocoro', structure: 'cinetocoro', geometry: merge(kin) });
  const telo: THREE.BufferGeometry[] = [];
  for (const [x, side] of [
    [xA, -1],
    [xB, 1],
  ] as const) {
    const bend = side * 0.32 * (1 - Math.exp(-(((3.4 - yc) / 1.6) ** 2)));
    const bendB = side * 0.32 * (1 - Math.exp(-(((-3.2 - yc) / 1.6) ** 2)));
    telo.push(place(new THREE.SphereGeometry(0.42, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), [x + bend, 3.25, 0]));
    telo.push(place(new THREE.SphereGeometry(0.42, 20, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), [x + bendB, -3.05, 0]));
  }
  meshes.push({ id: 'telomeros', structure: 'telomero', geometry: merge(telo) });
  // a gene locus: the same band on both sister chromatids (same allele)
  const band = [xA, xB].map((x, k) => {
    const side = k ? 1 : -1;
    const bend = side * 0.32 * (1 - Math.exp(-(((2.1 - yc) / 1.6) ** 2)));
    return place(new THREE.CylinderGeometry(0.6, 0.6, 0.32, 28, 1, true), [x + bend, 2.1, 0]);
  });
  meshes.push({ id: 'gene-locus', structure: 'gene', geometry: merge(band) });
  return { meshes, anchors: {}, preset: presetFor(23, [-0.6, 0.1, 0], 0.1, 0.12) };
}

export function buildGeneticsModel(id: GeneticsStaticModel): BuiltModel {
  const built = id === 'dna' ? buildDna() : id === 'nucleotideo' ? buildNucleotides() : id === 'rna' ? buildRna() : buildChromosome();
  colorize(built.meshes);
  return built;
}

