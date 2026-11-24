/**
 * Building blocks of the Animals laboratory: structure colours and small
 * procedural shapes (lathe solids cut open, extruded outlines, organs,
 * segmented legs). All geometry is generated in code by BioLab 3D.
 */
import * as THREE from 'three';
import { merge, paint, place, tube } from '@/laboratories/shared/geometry';

export const ANIMAL_COLOR: Record<string, string> = {
  // sponge
  pinacoderme: '#E9A23B',
  poros: '#5A3A12',
  osculo: '#C77D1E',
  espongiocele: '#F7D9A8',
  coanocitos: '#F4C26B',
  mesohilo: '#F2E2BD',
  amebocitos: '#B5651D',
  espiculas: '#FFFFFF',
  rocha: '#7B8A8B',
  // hydra
  epiderme: '#7CB342',
  gastroderme: '#C0CA33',
  mesogleia: '#F1F8E9',
  tentaculos: '#9CCC65',
  cnidocitos: '#FFF59D',
  hipostomio: '#7CB342',
  'disco-basal': '#689F38',
  'broto-hidra': '#AED581',
  // planarian
  'corpo-planaria': '#8D6E63',
  ocelos: '#212121',
  auriculas: '#A1887F',
  faringe: '#F48FB1',
  'intestino-ramificado': '#FFB74D',
  'ganglios-cerebrais': '#4FC3F7',
  'cordoes-nervosos': '#29B6F6',
  protonefridios: '#AB47BC',
  // earthworm
  'parede-minhoca': '#C97B84',
  clitelo: '#E7A2A9',
  prostomio: '#B5656E',
  septos: '#EBC7CB',
  'faringe-minhoca': '#D4A15A',
  esofago: '#E0B872',
  papo: '#E8C27F',
  moela: '#B98A3E',
  intestino: '#E6B566',
  'vaso-dorsal': '#C62828',
  'vaso-ventral': '#E53935',
  coracoes: '#B71C1C',
  'cordao-nervoso-ventral': '#4FC3F7',
  'ganglio-cerebral': '#0288D1',
  nefridios: '#8E24AA',
  cerdas: '#5D4037',
  // grasshopper
  cabeca: '#7CB342',
  antenas: '#558B2F',
  'olhos-compostos': '#3E2723',
  'aparelho-bucal': '#8D6E63',
  torax: '#689F38',
  patas: '#9CCC65',
  asas: '#C5E1A5',
  abdome: '#8BC34A',
  espiraculos: '#33691E',
  // sea star
  'face-aboral': '#E76F51',
  'face-oral': '#F4A261',
  espinhos: '#FFD6A5',
  madreporito: '#E9C46A',
  'pes-ambulacrais': '#FFCDB2',
  'sistema-ambulacral': '#4CC9F0',
  boca: '#6D2E46',
  // vertebrates: skin and fins
  'pele-peixe': '#7FA7C9',
  nadadeiras: '#A9C6DE',
  'linha-lateral': '#2E4A62',
  branquias: '#E63946',
  'bexiga-natatoria': '#E5E5E5',
  'pele-sapo': '#6A994E',
  'pele-ave': '#E9D8A6',
  penas: '#BB9457',
  bico: '#F4A261',
  quilha: '#F1FAEE',
  'musculos-peitorais': '#C1666B',
  'sacos-aereos': '#BDE0FE',
  // organs shared by vertebrates
  coracao: '#B23A48',
  pulmoes: '#F28482',
  figado: '#7F4F24',
  estomago: '#E9B872',
  'intestino-vertebrado': '#E6B566',
  rins: '#8C2F39',
  encefalo: '#F2A7A7',
  'coluna-vertebral': '#F5F1E3',
  cloaca: '#9D4E5B',
  'moela-ave': '#B98A3E',
  olhos: '#1B1B1B',
  'patas-vertebrado': '#7A9E3F',
  // hearts
  'atrio-direito': '#3A6EA5',
  'atrio-esquerdo': '#C1121F',
  atrio: '#3A6EA5',
  ventriculo: '#3A6EA5',
  'ventriculo-misto': '#8E44AD',
  'ventriculo-direito': '#3A6EA5',
  'ventriculo-esquerdo': '#C1121F',
  'septo-interventricular': '#F1FAEE',
  'seio-venoso': '#5A7FA8',
  'bulbo-arterioso': '#7DA3C8',
  // embryo
  zigoto: '#F6BD60',
  blastomeros: '#F7D08A',
  blastocele: '#FFF1D6',
  ectoderme: '#4EA8DE',
  mesoderme: '#E63946',
  endoderme: '#F4D35E',
  blastoporo: '#6D597A',
  arquentero: '#F9E79F',
  // metamorphosis
  ovos: '#2B2D42',
  'massa-gelatinosa': '#D8F3DC',
  girino: '#4A4E69',
  cauda: '#6C757D',
  'branquias-externas': '#E5989B',
  'patas-traseiras': '#5C677D',
  'patas-dianteiras': '#5C677D',
  sapo: '#6A994E',
  'ovo-inseto': '#F1FAEE',
  lagarta: '#80B918',
  pupa: '#A98467',
  borboleta: '#F77F00',
  'folha-planta': '#2D6A4F',
  // extra ids used by the processes
  'corrente-de-agua': '#4CC9F0',
  'particulas-alimento': '#8D6E63',
  'septo-incompleto': '#F1FAEE',
  'sangue-venoso': '#2B59C3',
  'sangue-arterial': '#D62828',
  morula: '#F7C873',
  blastula: '#F7D08A',
  agua: '#5FA8D3',
  galho: '#6F4E37',
  'saco-vitelino': '#F9C74F',
};

export const ac = (id: string) => ANIMAL_COLOR[id] ?? '#94A3B8';

export type Profile = [number, number][];

/** Lathe solid around Y with a wedge (phi range) left out so the inside shows. */
export function lathe(profile: Profile, seg = 64, phiStart = 0, phiLen = Math.PI * 2) {
  return new THREE.LatheGeometry(
    profile.map(([x, y]) => new THREE.Vector2(Math.max(0.0005, x), y)),
    seg,
    phiStart,
    phiLen,
  );
}

/**
 * The flat face exposed on the two cut planes of a lathe wall, between an
 * outer and an inner profile (same number of points, ordered bottom → top).
 */
export function latheCutFaces(outer: Profile, inner: Profile, phis: number[]) {
  const out: THREE.BufferGeometry[] = [];
  for (const phi of phis) {
    const pos: number[] = [];
    const idx: number[] = [];
    for (let i = 0; i < outer.length; i++) {
      pos.push(outer[i][0], outer[i][1], 0, inner[i][0], inner[i][1], 0);
      if (i) {
        const a = (i - 1) * 2;
        idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    // lathe point at angle φ: (r sin φ, y, r cos φ)
    g.rotateY(phi - Math.PI / 2);
    out.push(g);
  }
  return merge(out);
}

/** Flat outline (x, y points) extruded with a rounded bevel, then laid in the XZ plane. */
export function slab(points: [number, number][], depth: number, bevel: number, curveSegs = 8) {
  const sh = new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y)));
  const g = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 4, curveSegments: curveSegs });
  g.translate(0, 0, -depth / 2);
  g.rotateX(-Math.PI / 2);
  g.deleteAttribute('uv');
  return g;
}

/** Smooth organ: an ellipsoid with radii (a, b, c) at a position, optionally rotated. */
export function organ(a: number, b: number, c: number, at: [number, number, number], color: string, rot?: THREE.Euler, seg = 24) {
  const g = new THREE.SphereGeometry(1, seg, Math.round(seg * 0.7));
  g.scale(a, b, c);
  if (rot) g.applyQuaternion(new THREE.Quaternion().setFromEuler(rot));
  return paint(place(g, at), color);
}

/** Jointed limb through a list of points (thicker at the base). */
export function limb(points: THREE.Vector3[], r0: number, r1: number, color: string) {
  const parts: THREE.BufferGeometry[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const r = r0 + ((r1 - r0) * i) / Math.max(1, points.length - 2);
    parts.push(tube([points[i], points[i + 1]], r, false, 4, 8));
    parts.push(place(new THREE.SphereGeometry(r * 1.05, 10, 8), points[i + 1]));
  }
  parts.push(place(new THREE.SphereGeometry(r0 * 1.05, 10, 8), points[0]));
  return paint(merge(parts), color);
}

export const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

/** Paints a geometry with a vertical gradient (dorsal colour on top, ventral below). */
export function paintDorsal(g: THREE.BufferGeometry, top: string, bottom: string, y0: number, y1: number) {
  const p = g.getAttribute('position');
  const a = new THREE.Color(bottom);
  const b = new THREE.Color(top);
  const col = new Float32Array(p.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    const t = Math.min(1, Math.max(0, (p.getY(i) - y0) / (y1 - y0)));
    c.copy(a).lerp(b, t * t * (3 - 2 * t));
    col.set([c.r, c.g, c.b], i * 3);
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return g;
}

export interface Section {
  /** centre height */
  y: number;
  /** half height */
  ry: number;
  /** half width */
  rz: number;
}

/**
 * Body built along X from x0 (t = 0) to x1 (t = 1) with elliptical cross
 * sections given by `at(t)`. Both ends are closed. Used for fish, frogs,
 * birds, worms and insects.
 */
export function loft(x0: number, x1: number, at: (t: number) => Section, n = 72, radial = 36, squareness = 2) {
  const pos: number[] = [];
  const idx: number[] = [];
  const rows = n + 3; // tip cap + n+1 rings + tip cap
  for (let i = 0; i < rows; i++) {
    const k = Math.min(n, Math.max(0, i - 1));
    const t = k / n;
    const x = x0 + (x1 - x0) * t;
    const s = at(t);
    const cap = i === 0 || i === rows - 1;
    for (let j = 0; j <= radial; j++) {
      const a = (j / radial) * Math.PI * 2;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      // superellipse: squareness > 2 gives flatter sides
      const e = 2 / squareness;
      const cy = Math.sign(ca) * Math.abs(ca) ** e;
      const sz = Math.sign(sa) * Math.abs(sa) ** e;
      pos.push(x, s.y + (cap ? 0 : cy * s.ry), cap ? 0 : sz * s.rz);
    }
  }
  for (let i = 0; i < rows - 1; i++)
    for (let j = 0; j < radial; j++) {
      const a = i * (radial + 1) + j;
      const b = a + radial + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** Flat plate in the XY plane (fins, wings, tails), `thick` along Z, rounded edges. */
export function plate(points: [number, number][], thick: number, curveSegs = 10) {
  const sh = new THREE.Shape();
  sh.moveTo(points[0][0], points[0][1]);
  const pts = points.map(([x, y]) => new THREE.Vector2(x, y));
  sh.splineThru(pts.slice(1).concat([pts[0]]));
  const g = new THREE.ExtrudeGeometry(sh, { depth: thick, bevelEnabled: true, bevelThickness: thick * 0.4, bevelSize: thick * 0.4, bevelSegments: 2, curveSegments: curveSegs });
  g.translate(0, 0, -thick / 2);
  g.deleteAttribute('uv');
  return g;
}

/** Fibonacci points on a sphere. */
export function fibSphere(n: number, r: number) {
  const out: THREE.Vector3[] = [];
  const ga = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (2 * (i + 0.5)) / n;
    const s = Math.sqrt(1 - y * y);
    out.push(new THREE.Vector3(Math.cos(ga * i) * s * r, y * r, Math.sin(ga * i) * s * r));
  }
  return out;
}

export const smooth = (t: number) => {
  const k = Math.min(1, Math.max(0, t));
  return k * k * (3 - 2 * k);
};
