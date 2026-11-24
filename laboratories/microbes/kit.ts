/**
 * Building blocks of the Microorganisms laboratory: colours and procedural
 * shapes reused by the static models and by the animated scenes (a cut-away
 * bacillus, the T4 bacteriophage, a coronavirus particle…). All geometry is
 * generated in code by BioLab 3D.
 */
import * as THREE from 'three';
import {
  alignY,
  capsuleY,
  cutFaces,
  dots,
  inside,
  inWedge,
  loop,
  merge,
  paint,
  place,
  randomQuat,
  scaled,
  shell,
  tangle,
  tube,
  wall,
  wobble,
  type Cut,
  type DistFn,
  type Rng,
} from '@/laboratories/shared/geometry';

/** Colour of each structure (baked as vertex colours; materials only set the finish). */
export const MICROBE_COLOR: Record<string, string> = {
  // bacteria
  capsula: '#BFE3A6',
  'parede-bacteriana': '#7DA645',
  'membrana-plasmatica': '#E8B86B',
  citoplasma: '#EDE6CF',
  nucleoide: '#3A6EA5',
  plasmideo: '#E76F51',
  ribossomos: '#7B5E8C',
  flagelo: '#8D6E4F',
  fimbrias: '#A1887F',
  'pilus-sexual': '#D9480F',
  coco: '#86B84A',
  diplococo: '#6FA83C',
  estreptococo: '#9BC25B',
  estafilococo: '#A7C957',
  bacilo: '#5E9C3A',
  espirilo: '#4E8F6A',
  vibriao: '#7FB069',
  // viruses
  capsideo: '#9AACB8',
  'dna-viral': '#E63946',
  colar: '#5F7A8A',
  bainha: '#7E97A6',
  'placa-basal': '#46606E',
  'fibras-cauda': '#566F7D',
  envelope: '#F0A35E',
  espicula: '#D62839',
  'proteina-m': '#2A9D8F',
  'proteina-e': '#1D3557',
  nucleocapsideo: '#9B5DE5',
  'rna-viral': '#F15BB5',
  profago: '#FFB703',
  // fungi
  'parede-celular-fungica': '#D9B26F',
  nucleo: '#6A4C93',
  vacuolo: '#8ECAE6',
  mitocondria: '#E76F51',
  broto: '#E9C987',
  'cicatriz-de-brotamento': '#A47148',
  hifas: '#EDE3D2',
  rizoides: '#B08968',
  esporangioforo: '#E6D3B3',
  esporangio: '#33363F',
  columela: '#A68A64',
  esporos: '#5C5F66',
  substrato: '#E3B964',
  pileo: '#B5651D',
  lamelas: '#F2E3C6',
  estipe: '#F3E9DC',
  anel: '#E6D7C3',
  volva: '#D6C7B2',
  micelio: '#F4F1EA',
  solo: '#6B4F3A',
  basidiosporos: '#7F5539',
  // protozoa and algae
  'membrana-ameba': '#9AD1D4',
  pseudopode: '#7CC6C9',
  'vacuolo-contratil': '#48CAE4',
  'vacuolo-digestivo': '#F4A261',
  alimento: '#80B918',
  endoplasma: '#CDB4DB',
  pelicula: '#A8DADC',
  cilios: '#457B9D',
  'sulco-oral': '#1D3557',
  citostoma: '#264653',
  macronucleo: '#6D597A',
  micronucleo: '#B56576',
  tricocistos: '#E5989B',
  citoprocto: '#6C757D',
  'pelicula-euglena': '#B7E4C7',
  'flagelo-eucarioto': '#52796F',
  estigma: '#E63946',
  cloroplasto: '#2D6A4F',
  paramilo: '#F1FAEE',
  reservatorio: '#95D5B2',
  // petri dish
  'placa-de-petri': '#DDE7EE',
  antibiotico: '#F2CC8F',
  'bacteria-sensivel': '#6FA83C',
  'bacteria-resistente': '#D62839',
};

export const c = (id: string) => MICROBE_COLOR[id] ?? '#94A3B8';

// ===================================================================== bacillus

export interface BacillusParts {
  shape: DistFn;
  wallG: THREE.BufferGeometry;
  membraneG: THREE.BufferGeometry;
  cytoplasmG: THREE.BufferGeometry;
  dnaG: THREE.BufferGeometry;
  dnaPoints: THREE.Vector3[];
  ribosomesG: THREE.BufferGeometry;
  plasmidsG: THREE.BufferGeometry | null;
  capsuleG: THREE.BufferGeometry | null;
  fimbriaeG: THREE.BufferGeometry | null;
  flagellumG: THREE.BufferGeometry | null;
}

/**
 * Rod-shaped bacterium lying along local X (half-length h of the straight
 * part, radius rad) with a wedge removed so the inside shows.
 */
export function bacillus(
  r: Rng,
  h: number,
  rad: number,
  cut: Cut,
  opts: { plasmids?: number; capsule?: boolean; fimbriae?: number; flagellum?: boolean; ribosomes?: number; dnaSteps?: number; seg?: [number, number] } = {},
): BacillusParts {
  const seg = opts.seg ?? [64, 48];
  const shape = wobble(capsuleY(h, rad), 0.012, 3);
  const wallG = merge([paint(wall(scaled(shape, 1.0), 0.94, cut, seg), c('parede-bacteriana'))]);
  const memb = scaled(shape, 0.925);
  const membraneG = merge([paint(shell(memb, cut, seg), c('membrana-plasmatica')), paint(cutFaces(memb, scaled(memb, 0.96), cut, seg[1]), '#D99A4E')]);
  const cytoplasmG = paint(cutFaces(scaled(shape, 0.885), null, cut, seg[1]), c('citoplasma'));
  const nucl = ellipsoid3(rad * 0.45, h * 0.6 + rad * 0.3, rad * 0.45);
  const dnaPoints = tangle(r, new THREE.Vector3(0, 0, -rad * 0.1), opts.dnaSteps ?? 260, rad * 0.09, (p) => inside(nucl, p));
  const dnaG = paint(tube(dnaPoints, rad * 0.022, false, dnaPoints.length * 5, 5), c('nucleoide'));
  const cyt = scaled(shape, 0.86);
  const ribos: THREE.Vector3[] = [];
  const nR = opts.ribosomes ?? 260;
  for (let i = 0; i < nR * 6 && ribos.length < nR; i++) {
    const p = new THREE.Vector3(r.range(-rad, rad), r.range(-h - rad, h + rad), r.range(-rad, rad));
    if (inside(cyt, p, 0.95) && !inside(nucl, p, 0.9) && !inWedge(p, cut)) ribos.push(p);
  }
  const ribosomesG = paint(dots(ribos, rad * 0.035), c('ribossomos'));
  let plasmidsG: THREE.BufferGeometry | null = null;
  if (opts.plasmids) {
    const list: THREE.BufferGeometry[] = [];
    for (let i = 0; i < opts.plasmids; i++) {
      const y = (i % 2 ? 1 : -1) * (h * 0.55 + rad * 0.2) + r.range(-0.1, 0.1) * h;
      const p = new THREE.Vector3(r.range(-0.2, 0.2) * rad, y, -rad * 0.35);
      list.push(place(tube(loop(rad * 0.2, r), rad * 0.025, true, 60, 5), p, randomQuat(r)));
    }
    plasmidsG = paint(merge(list), c('plasmideo'));
  }
  const capsuleG = opts.capsule ? paint(shell(scaled(shape, 1.12), cut, seg), c('capsula')) : null;
  let fimbriaeG: THREE.BufferGeometry | null = null;
  if (opts.fimbriae) {
    const parts: THREE.BufferGeometry[] = [];
    for (let i = 0; i < opts.fimbriae * 3 && parts.length < opts.fimbriae; i++) {
      const d = r.dir();
      const p = d.clone().multiplyScalar(shape(d));
      if (inWedge(p, cut) || Math.abs(p.y) > h + rad * 0.5) continue;
      const len = r.range(0.18, 0.34) * rad;
      parts.push(place(new THREE.CylinderGeometry(rad * 0.012, rad * 0.01, len, 4), p.clone().addScaledVector(d, len / 2), alignY(d)));
    }
    fimbriaeG = paint(merge(parts), c('fimbrias'));
  }
  let flagellumG: THREE.BufferGeometry | null = null;
  if (opts.flagellum) {
    const base = new THREE.Vector3(0, -(h + rad), 0);
    const pts: THREE.Vector3[] = [];
    const len = (h + rad) * 2.2;
    for (let i = 0; i <= 120; i++) {
      const t = i / 120;
      const amp = rad * 0.32 * Math.min(1, t * 5);
      const a = t * Math.PI * 2 * 3.2;
      pts.push(new THREE.Vector3(Math.cos(a) * amp, -t * len, Math.sin(a) * amp).add(base));
    }
    flagellumG = paint(merge([tube(pts, rad * 0.035, false, 600, 6), place(new THREE.TorusGeometry(rad * 0.12, rad * 0.03, 8, 20), base.clone().add(new THREE.Vector3(0, rad * 0.12, 0)), alignY(new THREE.Vector3(0, 0, 1)))]), c('flagelo'));
  }
  return { shape, wallG, membraneG, cytoplasmG, dnaG, dnaPoints, ribosomesG, plasmidsG, capsuleG, fimbriaeG, flagellumG };
}

const ellipsoid3 =
  (a: number, b: number, cc: number): DistFn =>
  (d) =>
    1 / Math.sqrt((d.x / a) ** 2 + (d.y / b) ** 2 + (d.z / cc) ** 2);

/** Rotation that lays a Y-axis model along X. */
export const LAY_X = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -Math.PI / 2);

// ===================================================================== bacteriophage T4

export interface PhageParts {
  head: THREE.BufferGeometry;
  dna: THREE.BufferGeometry;
  collar: THREE.BufferGeometry;
  sheath: THREE.BufferGeometry;
  tubeG: THREE.BufferGeometry;
  plate: THREE.BufferGeometry;
  fibers: THREE.BufferGeometry;
}

/**
 * T4-like bacteriophage standing on its base plate: the tail tip is at the
 * origin and the head points up (+Y). Total height ≈ 3.2 × s. `cutHead`
 * removes the front faces of the capsid to show the DNA packed inside.
 */
export function phage(s: number, opts: { cutHead?: boolean; withDna?: boolean; seed?: number; sheathY?: number } = {}): PhageParts {
  const r = { v: opts.seed ?? 3 };
  const rand = () => {
    r.v = (r.v * 16807) % 2147483647;
    return r.v / 2147483647;
  };
  // prolate icosahedral head (flat faces, like electron micrographs)
  const ico = new THREE.IcosahedronGeometry(0.62 * s, 0).toNonIndexed();
  ico.scale(1, 1.45, 1);
  const headY = 2.45 * s;
  let headG: THREE.BufferGeometry = ico;
  if (opts.cutHead) {
    const pos = ico.getAttribute('position');
    const keep: number[] = [];
    for (let i = 0; i < pos.count; i += 3) {
      const cz = (pos.getZ(i) + pos.getZ(i + 1) + pos.getZ(i + 2)) / 3;
      const cx = (pos.getX(i) + pos.getX(i + 1) + pos.getX(i + 2)) / 3;
      if (cz > 0.12 * s && cx > -0.25 * s) continue;
      for (let k = 0; k < 3; k++) keep.push(pos.getX(i + k), pos.getY(i + k), pos.getZ(i + k));
    }
    headG = new THREE.BufferGeometry();
    headG.setAttribute('position', new THREE.Float32BufferAttribute(keep, 3));
  }
  headG.computeVertexNormals();
  // edges of the capsid (thin struts) to read the icosahedral symmetry
  const edges = new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.62 * s, 0).scale(1, 1.45, 1));
  const ep = edges.getAttribute('position');
  const struts: THREE.BufferGeometry[] = [];
  for (let i = 0; i < ep.count; i += 2) {
    const a = new THREE.Vector3(ep.getX(i), ep.getY(i), ep.getZ(i));
    const b = new THREE.Vector3(ep.getX(i + 1), ep.getY(i + 1), ep.getZ(i + 1));
    if (opts.cutHead && (a.z + b.z) / 2 > 0.2 * s && (a.x + b.x) / 2 > -0.25 * s) continue;
    const l = a.distanceTo(b);
    struts.push(place(new THREE.CylinderGeometry(0.025 * s, 0.025 * s, l, 5), a.clone().add(b).multiplyScalar(0.5), alignY(b.clone().sub(a))));
  }
  const head = place(merge([paint(headG, c('capsideo')), paint(merge(struts), '#6C7F8C')]), [0, headY, 0]);
  // DNA packed in the head
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 260; i++) {
    const t = i / 260;
    const a = t * Math.PI * 2 * 11;
    const rr = 0.38 * s * Math.sqrt(1 - (2 * t - 1) ** 2) + 0.05 * s;
    pts.push(new THREE.Vector3(Math.cos(a) * rr + (rand() - 0.5) * 0.06 * s, headY + (2 * t - 1) * 0.7 * s, Math.sin(a) * rr * 0.9));
  }
  const dna = paint(tube(pts, 0.035 * s, false, 1200, 5), c('dna-viral'));
  const collar = paint(place(new THREE.CylinderGeometry(0.28 * s, 0.22 * s, 0.12 * s, 18), [0, 1.66 * s, 0]), c('colar'));
  // contractile sheath: stacked rings
  const rings: THREE.BufferGeometry[] = [];
  const n = 18;
  for (let i = 0; i < n; i++) rings.push(place(new THREE.CylinderGeometry(0.17 * s, 0.17 * s, (1.38 * s) / n - 0.012 * s, 14), [0, 0.22 * s + (i + 0.5) * ((1.38 * s) / n), 0]));
  const sheath = paint(merge(rings), c('bainha'));
  const tubeG = paint(place(new THREE.CylinderGeometry(0.06 * s, 0.06 * s, 1.5 * s, 8), [0, 0.85 * s, 0]), '#3E5563');
  const plate = paint(place(new THREE.CylinderGeometry(0.32 * s, 0.26 * s, 0.14 * s, 6), [0, 0.13 * s, 0]), c('placa-basal'));
  const legs: THREE.BufferGeometry[] = [];
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2 + 0.3;
    const dir = new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
    const p0 = dir.clone().multiplyScalar(0.28 * s).setY(0.14 * s);
    const knee = dir.clone().multiplyScalar(0.95 * s).setY(0.62 * s);
    const foot = dir.clone().multiplyScalar(1.35 * s).setY(-0.02 * s);
    legs.push(tube([p0, p0.clone().lerp(knee, 0.5).setY(0.45 * s), knee], 0.03 * s, false, 16, 5));
    legs.push(tube([knee, knee.clone().lerp(foot, 0.5).add(new THREE.Vector3(0, 0.08 * s, 0)), foot], 0.026 * s, false, 16, 5));
  }
  const fibers = paint(merge(legs), c('fibras-cauda'));
  return { head, dna, collar, sheath, tubeG, plate, fibers };
}

/** Small DNA tangle (viral genome copy) around a point. */
export function dnaBall(r: Rng, at: THREE.Vector3, radius: number, thick: number, color: string, steps = 40) {
  const pts = tangle(r, new THREE.Vector3(), steps, radius * 0.35, (p) => p.length() < radius);
  return paint(place(tube(pts, thick, false, steps * 5, 4), at), color);
}
