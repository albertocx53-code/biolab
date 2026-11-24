/**
 * Animated development scenes of the Animals laboratory: early embryonic
 * development (zygote → cleavage → morula → blastula → gastrula with the three
 * germ layers), the metamorphosis of a frog and the complete metamorphosis of
 * a butterfly. Procedural geometry written by BioLab 3D.
 */
import * as THREE from 'three';
import { dots, merge, paint, place, rng, tube } from '@/laboratories/shared/geometry';
import { presetFor, type BuiltModel, type MeshDef } from '@/laboratories/shared/types';
import { ac, fibSphere, lathe, latheCutFaces, limb, loft, organ, paintDorsal, plate, smooth, V, type Profile } from './kit';
import { colorize } from './materials';
import { frogExterior } from './vertebrates';

type Get = (id: string) => THREE.Object3D | undefined;
const show = (o: THREE.Object3D | undefined, s: number) => o && o.scale.setScalar(Math.max(0.0001, s));

const WEDGE = Math.PI * 0.7;
const PHI0 = WEDGE / 2;
const PHI_LEN = Math.PI * 2 - WEDGE;
const CUTS = [PHI0, PHI0 + PHI_LEN];

// ===================================================================== embryo

const R = 2.2;
const H = 0.34;
const ANIMAL = '#C08552';
const VEGETAL = '#F6E7C1';

function cell(r: number, at: THREE.Vector3) {
  const g = new THREE.SphereGeometry(r, 26, 18);
  place(g, at);
  return g;
}
const shadeEgg = (g: THREE.BufferGeometry) => paintDorsal(g, ANIMAL, VEGETAL, -1.2, 1.6);

/** Gastrula wall for invagination depth d (0..1): ectoderm arc and endoderm (archenteron) band. */
function gastrulaLine(d: number) {
  const lip = Math.PI - 0.3;
  const ecto: [number, number][] = [];
  for (let i = 0; i <= 30; i++) {
    const a = (i / 30) * lip;
    ecto.push([R * Math.sin(a), R * Math.cos(a)]);
  }
  const [lx, ly] = ecto[ecto.length - 1];
  const ra = 0.5;
  const yTop = ly + 0.45 + d * 2.75;
  const endo: [number, number][] = [[lx, ly]];
  for (let i = 1; i <= 6; i++) {
    const a = (i / 6) * (Math.PI / 2);
    endo.push([ra + (lx - ra) * Math.cos(a), ly + 0.45 * Math.sin(a)]);
  }
  for (let i = 1; i <= 10; i++) endo.push([ra, ly + 0.45 + (i / 10) * (yTop - ly - 0.45)]);
  for (let i = 1; i <= 8; i++) {
    const a = (i / 8) * (Math.PI / 2);
    endo.push([ra * Math.cos(a), yTop + ra * Math.sin(a)]);
  }
  return { ecto, endo, lip: [lx, ly] as [number, number], yTop, ra };
}

/** Offsets a centre line on both sides by ±w/2 (2D normals). */
function band(line: [number, number][], w: number) {
  const a: Profile = [];
  const b: Profile = [];
  for (let i = 0; i < line.length; i++) {
    const p = line[Math.max(0, i - 1)];
    const q = line[Math.min(line.length - 1, i + 1)];
    let tx = q[0] - p[0];
    let ty = q[1] - p[1];
    const l = Math.hypot(tx, ty) || 1;
    tx /= l;
    ty /= l;
    const nx = ty;
    const ny = -tx;
    a.push([Math.max(0.001, line[i][0] + (nx * w) / 2), line[i][1] + (ny * w) / 2]);
    b.push([Math.max(0.001, line[i][0] - (nx * w) / 2), line[i][1] - (ny * w) / 2]);
  }
  return { a, b };
}

function bandMesh(line: [number, number][], w: number, color: string) {
  const { a, b } = band(line, w);
  return paint(merge([lathe(a, 64, PHI0, PHI_LEN), lathe(b, 64, PHI0, PHI_LEN), latheCutFaces(a, b, CUTS)]), color);
}

export const GASTRULA_DEPTHS = [0.15, 0.4, 0.7, 1];

function embryo(): BuiltModel {
  const meshes: MeshDef[] = [];
  meshes.push({ id: 'em-zigoto', structure: 'zigoto', geometry: merge([shadeEgg(cell(R, V(0, 0, 0))), paint(cell(0.3, V(0.4, 1.0, 1.95)), '#7F5539')]) });
  // cleavage: 2, 4 and 8 cells (amphibian: smaller cells at the animal pole)
  meshes.push({ id: 'em-c2', structure: 'blastomeros', geometry: shadeEgg(merge([cell(1.6, V(-1.0, 0, 0)), cell(1.6, V(1.0, 0, 0))])) });
  meshes.push({ id: 'em-c4', structure: 'blastomeros', geometry: shadeEgg(merge([-1, 1].flatMap((x) => [-1, 1].map((z) => cell(1.25, V(x * 0.85, 0, z * 0.85)))))) });
  meshes.push({
    id: 'em-c8',
    structure: 'blastomeros',
    geometry: shadeEgg(merge([-1, 1].flatMap((x) => [-1, 1].flatMap((z) => [cell(0.92, V(x * 0.78, 0.95, z * 0.78)), cell(1.12, V(x * 0.85, -0.75, z * 0.85))])))),
  });
  const mor = [...fibSphere(28, 1.6), ...fibSphere(6, 0.6)];
  meshes.push({ id: 'em-morula', structure: 'morula', geometry: shadeEgg(merge(mor.map((p, i) => cell(0.62 + (i % 3) * 0.04, p)))) });
  // blastula: one layer of cells around a cavity, cut open
  const bl: THREE.BufferGeometry[] = [];
  for (const p of fibSphere(240, R - 0.15)) {
    const phi = Math.atan2(p.x, p.z);
    if (Math.abs(phi) < PHI0 * 0.9) continue;
    const s = new THREE.SphereGeometry(0.27, 10, 8);
    s.scale(1, 1, 1);
    const q = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), p.clone().normalize());
    s.scale(1.05, 0.7, 1.05);
    bl.push(place(s, p, q));
  }
  meshes.push({ id: 'em-blastula', structure: 'blastula', geometry: shadeEgg(merge(bl)) });
  const bc: Profile = [];
  for (let i = 0; i <= 24; i++) {
    const a = (i / 24) * Math.PI;
    bc.push([(R - 0.5) * Math.sin(a), -(R - 0.5) * Math.cos(a)]);
  }
  meshes.push({ id: 'em-blastocele', structure: 'blastocele', geometry: lathe(bc, 48, PHI0, PHI_LEN) });
  // gastrula at four invagination depths
  GASTRULA_DEPTHS.forEach((d, k) => {
    const g = gastrulaLine(d);
    meshes.push({ id: `em-ecto-${k}`, structure: 'ectoderme', geometry: bandMesh(g.ecto, H, ac('ectoderme')) });
    meshes.push({ id: `em-endo-${k}`, structure: 'endoderme', geometry: bandMesh(g.endo, H, ac('endoderme')) });
    const lum: Profile = [[0.001, g.lip[1] + 0.1]];
    for (let i = 0; i <= 10; i++) lum.push([g.ra - H / 2 - 0.02, g.lip[1] + 0.25 + (i / 10) * (g.yTop - g.lip[1] - 0.25)]);
    lum.push([0.001, g.yTop + g.ra - H / 2]);
    meshes.push({ id: `em-arq-${k}`, structure: 'arquentero', geometry: lathe(lum, 40, PHI0, PHI_LEN) });
    meshes.push({ id: `em-bp-${k}`, structure: 'blastoporo', geometry: place(new THREE.TorusGeometry(g.lip[0] - 0.05, 0.12, 10, 48).rotateX(Math.PI / 2), [0, g.lip[1] + 0.05, 0]) });
  });
  // mesoderm: forms between ectoderm and endoderm around the archenteron
  {
    const g = gastrulaLine(1);
    const line: [number, number][] = [];
    for (let i = 0; i <= 14; i++) line.push([g.ra + H / 2 + 0.2, g.lip[1] + 0.6 + (i / 14) * (g.yTop - g.lip[1] - 0.6)]);
    for (let i = 1; i <= 8; i++) {
      const a = (i / 8) * (Math.PI / 2) * 0.85;
      line.push([(g.ra + H / 2 + 0.2) * Math.cos(a), g.yTop + (g.ra + H / 2 + 0.2) * Math.sin(a)]);
    }
    meshes.push({ id: 'em-mesoderme', structure: 'mesoderme', geometry: bandMesh(line, 0.24, ac('mesoderme')) });
  }
  return { meshes: colorize(meshes), anchors: {}, preset: presetFor(17.5, [0.7, 0, 0], 0.22, 0.35) };
}

const EMBRYO_STAGES = ['em-zigoto', 'em-c2', 'em-c4', 'em-c8', 'em-morula', 'em-blastula', 'em-blastocele'];

/** Embryonic development (6 steps): zygote, cleavage, morula, blastula, gastrulation, germ layers. */
export function poseEmbryo(P: number, get: Get) {
  const step = Math.min(5, Math.floor(P));
  const t = P - step;
  let on: string[];
  if (step === 0) on = ['em-zigoto'];
  else if (step === 1) on = [t < 0.33 ? 'em-c2' : t < 0.66 ? 'em-c4' : 'em-c8'];
  else if (step === 2) on = ['em-morula'];
  else if (step === 3) on = ['em-blastula', 'em-blastocele'];
  else {
    const k = step === 4 ? Math.min(3, Math.floor(t * 4)) : 3;
    on = [`em-ecto-${k}`, `em-endo-${k}`, `em-arq-${k}`, `em-bp-${k}`];
  }
  const all = [...EMBRYO_STAGES, ...GASTRULA_DEPTHS.flatMap((_, k) => [`em-ecto-${k}`, `em-endo-${k}`, `em-arq-${k}`, `em-bp-${k}`])];
  // each new stage "pops" in (cells divide quickly)
  const sub = step === 1 ? (t * 3) % 1 : step === 4 ? (t * 4) % 1 : t;
  const pop = P === 0 ? 1 : 0.9 + 0.1 * smooth(sub * 5);
  for (const id of all) show(get(id), on.includes(id) ? pop : 0);
  show(get('em-mesoderme'), step === 5 ? 0.4 + 0.6 * smooth(t * 1.4) : 0);
}

// ===================================================================== frog metamorphosis

const EGGS_AT = V(0, -0.6, 0);

function tadpoleTail() {
  // pivot at x = 0 (joins the body), tail along −X
  const g = loft(-3.4, 0, (t) => ({ y: 0, ry: 0.06 + 0.42 * Math.pow(t, 0.7), rz: 0.04 + 0.2 * Math.pow(t, 0.9) }), 40, 20);
  const fin = plate([[0, 0.35], [-1.2, 0.75], [-3.3, 0.15], [-3.45, 0], [-3.3, -0.15], [-1.2, -0.7], [0, -0.3]], 0.03);
  return paintDorsal(merge([g, fin]), '#3D405B', '#9A8C98', -0.7, 0.7);
}

function frogMeta(): BuiltModel {
  const r = rng(31);
  const meshes: MeshDef[] = [];
  meshes.push({ id: 'mf-agua', structure: 'agua', geometry: place(new THREE.CylinderGeometry(2.7, 2.7, 0.06, 72), [0, -1.9, 0]) });
  // egg mass: dark eggs inside jelly capsules
  const jelly: THREE.Vector3[] = [];
  for (let i = 0; i < 400 && jelly.length < 46; i++) {
    const p = V(r.range(-1.8, 1.8), r.range(-0.7, 0.7), r.range(-1.3, 1.3));
    if (p.x * p.x / 3.2 + p.y * p.y / 0.5 + p.z * p.z / 1.7 > 1) continue;
    if (jelly.every((q) => q.distanceTo(p) > 0.52)) jelly.push(p);
  }
  meshes.push({ id: 'mf-gel', structure: 'massa-gelatinosa', geometry: dots(jelly, 0.31, 2) });
  meshes.push({ id: 'mf-ovos', structure: 'ovos', geometry: paintDorsal(merge(jelly.map((p) => place(new THREE.SphereGeometry(0.13, 12, 8), p))), '#1B1B1E', '#D9C6A5', -0.1, 0.1) });
  // tadpole (built at the origin, head towards +X)
  const body = paintDorsal(loft(-0.3, 1.9, (t) => ({ y: 0, ry: 0.72 * Math.pow(Math.sin(Math.PI * Math.min(1, 0.08 + t * 0.92)), 0.6), rz: 0.8 * Math.pow(Math.sin(Math.PI * Math.min(1, 0.08 + t * 0.92)), 0.6) }), 40, 28), '#3D405B', '#C9ADA7', -0.6, 0.6);
  const eyes = merge([organ(0.13, 0.13, 0.1, [1.45, 0.25, 0.55], '#111111'), organ(0.13, 0.13, 0.1, [1.45, 0.25, -0.55], '#111111')]);
  meshes.push({ id: 'mf-girino', structure: 'girino', geometry: merge([body, eyes]) });
  meshes.push({ id: 'mf-cauda', structure: 'cauda', geometry: tadpoleTail() });
  const gills: THREE.BufferGeometry[] = [];
  for (const s of [1, -1])
    for (let k = 0; k < 3; k++) {
      const base = V(0.85 - k * 0.12, 0.15 - k * 0.12, s * 0.72);
      const tip = base.clone().add(V(-0.45, 0.25 - k * 0.12, s * 0.45));
      gills.push(tube([base, base.clone().lerp(tip, 0.5).add(V(0, 0.08, 0)), tip], 0.045, false, 10, 5));
      for (let j = 1; j < 5; j++) {
        const p = base.clone().lerp(tip, j / 5);
        gills.push(tube([p, p.clone().add(V(-0.12, 0.15, s * 0.05))], 0.025, false, 3, 4), tube([p, p.clone().add(V(-0.12, -0.12, s * 0.05))], 0.025, false, 3, 4));
      }
    }
  meshes.push({ id: 'mf-branquias', structure: 'branquias-externas', geometry: paint(merge(gills), ac('branquias-externas')) });
  const hind: THREE.BufferGeometry[] = [];
  const front: THREE.BufferGeometry[] = [];
  for (const s of [1, -1]) {
    hind.push(limb([V(-0.15, -0.35, s * 0.4), V(-0.55, -0.6, s * 0.85), V(-0.15, -0.8, s * 1.05), V(-0.75, -0.9, s * 1.25)], 0.12, 0.06, '#4A4E69'));
    front.push(limb([V(1.2, -0.45, s * 0.55), V(1.45, -0.75, s * 0.8), V(1.75, -0.85, s * 0.85)], 0.08, 0.05, '#4A4E69'));
  }
  meshes.push({ id: 'mf-patas-tras', structure: 'patas-traseiras', geometry: merge(hind) });
  meshes.push({ id: 'mf-patas-diant', structure: 'patas-dianteiras', geometry: merge(front) });
  const ext = frogExterior(0.82);
  meshes.push({ id: 'mf-sapo', structure: 'sapo', geometry: merge([ext.skin, ext.legs, ext.eyes]) });
  return { meshes: colorize(meshes), anchors: {}, preset: presetFor(14, [0.6, 0, 0], 0.32, 0.45) };
}

const TADPOLE = ['mf-girino', 'mf-cauda', 'mf-branquias', 'mf-patas-tras', 'mf-patas-diant'];

/** Frog metamorphosis (5 steps): eggs, tadpole with external gills, hind legs, front legs and tail resorption, young frog. */
export function poseFrogMeta(P: number, get: Get) {
  const step = Math.min(4, Math.floor(P));
  const t = P - step;
  show(get('mf-ovos'), step === 0 ? 1 : step === 1 ? 1 - smooth(t * 3) : 0);
  show(get('mf-gel'), step === 0 ? 1 : step === 1 ? 1 - smooth(t * 3) : 0);
  for (const id of ['mf-ovos', 'mf-gel']) get(id)?.position.copy(EGGS_AT);
  const size = step === 0 ? 0 : step === 1 ? 0.45 + 0.4 * smooth(t) : step === 2 ? 0.85 + 0.15 * smooth(t) : step === 3 ? 1 : 1 - smooth(t * 1.6);
  const swim = Math.sin(P * 9) * 0.28 * (step < 4 ? 1 : 0);
  const bob = Math.sin(P * 4) * 0.08;
  for (const id of TADPOLE) {
    const o = get(id);
    if (!o) continue;
    o.position.set(0.3, 0.1 + bob, 0);
    o.rotation.set(0, 0, 0);
    show(o, size);
  }
  const tail = get('mf-cauda');
  if (tail) {
    tail.rotation.set(0, swim, 0);
    const keep = step < 3 ? 1 : step === 3 ? 1 - 0.8 * smooth(t) : 0.2;
    tail.scale.set(Math.max(0.0001, size * keep), Math.max(0.0001, size * (0.6 + 0.4 * keep)), Math.max(0.0001, size));
  }
  show(get('mf-branquias'), step === 1 ? size : step === 2 ? size * (1 - smooth(t * 1.5)) : 0);
  show(get('mf-patas-tras'), step < 2 ? 0 : step === 2 ? size * (0.3 + 0.7 * smooth(t)) : size);
  show(get('mf-patas-diant'), step < 3 ? 0 : step === 3 ? size * (0.3 + 0.7 * smooth(t * 1.2)) : size);
  const frog = get('mf-sapo');
  if (frog) {
    // the young frog climbs out beside the last tadpole stage, then grows
    frog.position.set(3.0 - 2.8 * smooth(t * 1.4), 0.05, 0);
    show(frog, step === 4 ? 0.55 + 0.45 * smooth(t * 1.6) : 0);
  }
}

// ===================================================================== butterfly metamorphosis

const TWIG_Y = 3.1;

function wing(side: 1 | -1) {
  // forewing and hindwing in the XZ plane, hinged on the X axis, extending to side·Z
  const fw = plate([[0.15, 0], [1.3, 1.1], [1.5, 2.35], [0.2, 2.6], [-0.55, 1.5], [-0.2, 0.2]], 0.03, 16);
  const hw = plate([[-0.05, 0], [0.1, 1.1], [-0.6, 1.9], [-1.5, 1.6], [-1.35, 0.6], [-0.45, 0.05]], 0.03, 16);
  const g = merge([fw, hw]);
  g.rotateX(Math.PI / 2);
  // shape y → +z after the rotation; mirror for the right wing
  if (side === -1) g.scale(1, 1, -1);
  const p = g.getAttribute('position');
  const col = new Float32Array(p.count * 3);
  const orange = new THREE.Color(ac('borboleta'));
  const black = new THREE.Color('#1D1D1D');
  const white = new THREE.Color('#FFFFFF');
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const z = Math.abs(p.getZ(i));
    const edge = (x > 0 ? Math.hypot((x - 0.3) / 1.3, (z - 1.2) / 1.45) : Math.hypot((x + 0.65) / 0.95, (z - 0.9) / 1.05)) > 0.82;
    const vein = Math.abs(Math.sin(Math.atan2(z, x - 0.1) * 9)) < 0.12 && z > 0.3;
    const c = edge ? (Math.sin(x * 14) * Math.sin(z * 14) > 0.55 ? white : black) : vein ? black : orange;
    col.set([c.r, c.g, c.b], i * 3);
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return g;
}

function butterflyMeta(): BuiltModel {
  const meshes: MeshDef[] = [];
  const leafOutline: [number, number][] = [];
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * Math.PI * 2;
    leafOutline.push([Math.cos(a) * 4.2, Math.sin(a) * 1.9 * (1 - 0.25 * Math.cos(a))]);
  }
  const leafShape = new THREE.Shape(leafOutline.map(([x, y]) => new THREE.Vector2(x, y)));
  const leaf = new THREE.ExtrudeGeometry(leafShape, { depth: 0.06, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 2, curveSegments: 4 });
  leaf.rotateX(-Math.PI / 2).deleteAttribute('uv');
  leaf.translate(0, -1.6, 0.2);
  const veins: THREE.BufferGeometry[] = [tube([V(-4.3, -1.5, 0.2), V(4.1, -1.5, 0.2)], 0.04, false, 8, 5)];
  for (let x = -3; x <= 3; x += 1) for (const s of [1, -1]) veins.push(tube([V(x, -1.5, 0.2), V(x + 0.8, -1.5, 0.2 - s * 1.4)], 0.025, false, 4, 4));
  meshes.push({ id: 'mb-folha', structure: 'folha-planta', geometry: merge([paint(leaf, ac('folha-planta')), paint(merge(veins), '#95D5B2')]) });
  meshes.push({ id: 'mb-galho', structure: 'galho', geometry: tube([V(-5, TWIG_Y + 0.2, -0.6), V(0, TWIG_Y, -0.5), V(5, TWIG_Y + 0.35, -0.4)], 0.13, false, 30, 10) });
  const eggs: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 6; i++) {
    const e = new THREE.SphereGeometry(0.09, 14, 10);
    e.scale(1, 1.35, 1);
    eggs.push(place(e, [-2.4 + (i % 3) * 0.32, -1.38, 0.1 + Math.floor(i / 3) * 0.32]));
  }
  meshes.push({ id: 'mb-ovos', structure: 'ovo-inseto', geometry: merge(eggs) });
  // caterpillar along X at the origin, head at +X, striped
  const cat: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 12; i++) {
    const x = -1.65 + i * 0.3;
    const r = 0.27 + 0.04 * Math.sin((i / 11) * Math.PI);
    const seg = new THREE.SphereGeometry(r, 16, 12);
    place(seg, [x, 0, 0]);
    paint(seg, i === 11 ? '#1D3557' : i % 2 ? ac('lagarta') : '#F1FAEE');
    cat.push(seg);
    if (i > 1 && i < 10) for (const s of [1, -1]) cat.push(paint(place(new THREE.CylinderGeometry(0.05, 0.06, 0.18, 6), [x, -0.27, s * 0.15]), '#2B2D42'));
  }
  cat.push(paint(tube([V(1.75, 0.2, 0.08), V(1.95, 0.5, 0.15)], 0.02, false, 4, 4), '#1D1D1D'), paint(tube([V(1.75, 0.2, -0.08), V(1.95, 0.5, -0.15)], 0.02, false, 4, 4), '#1D1D1D'));
  meshes.push({ id: 'mb-lagarta', structure: 'lagarta', geometry: merge(cat) });
  // chrysalis hanging from the twig (pivot at the top)
  const pupa: Profile = [];
  for (let i = 0; i <= 24; i++) {
    const s = i / 24;
    pupa.push([0.48 * Math.pow(Math.sin(Math.PI * s), 0.8) * (1 - 0.3 * s), -s * 2.0]);
  }
  const pupaG = new THREE.LatheGeometry(pupa.map(([x, y]) => new THREE.Vector2(Math.max(0.001, x), y)), 32);
  paintDorsal(pupaG, '#B5C99A', '#718355', -2.0, 0);
  const gold: THREE.Vector3[] = [];
  for (let k = 0; k < 8; k++) gold.push(V(Math.sin(k * 0.8) * 0.42, -0.75, Math.cos(k * 0.8) * 0.42));
  meshes.push({ id: 'mb-pupa', structure: 'pupa', geometry: merge([pupaG, paint(dots(gold, 0.04, 1), '#E9C46A'), paint(place(new THREE.CylinderGeometry(0.04, 0.04, 0.25, 6), [0, 0.1, 0]), '#2B2D42')]) });
  // butterfly: body at the origin, wings hinged on the body axis
  const body = merge([
    organ(0.75, 0.13, 0.13, [-0.55, 0, 0], '#2B2D42'),
    organ(0.35, 0.18, 0.18, [0.3, 0, 0], '#2B2D42'),
    organ(0.15, 0.15, 0.15, [0.75, 0.02, 0], '#2B2D42'),
    paint(tube([V(0.85, 0.08, 0.06), V(1.4, 0.4, 0.35), V(1.75, 0.55, 0.5)], 0.02, false, 8, 4), '#2B2D42'),
    paint(tube([V(0.85, 0.08, -0.06), V(1.4, 0.4, -0.35), V(1.75, 0.55, -0.5)], 0.02, false, 8, 4), '#2B2D42'),
    organ(0.06, 0.06, 0.06, [1.75, 0.55, 0.5], '#2B2D42'),
    organ(0.06, 0.06, 0.06, [1.75, 0.55, -0.5], '#2B2D42'),
  ]);
  meshes.push({ id: 'mb-corpo', structure: 'borboleta', geometry: body });
  meshes.push({ id: 'mb-asa-e', structure: 'borboleta', geometry: wing(1) });
  meshes.push({ id: 'mb-asa-d', structure: 'borboleta', geometry: wing(-1) });
  return { meshes: colorize(meshes), anchors: {}, preset: presetFor(15, [0.5, 0.6, 0], 0.25, 0.4) };
}

/** Complete metamorphosis (5 steps): egg, larva, pupa, metamorphosis inside the pupa, adult. */
export function poseButterfly(P: number, get: Get) {
  const step = Math.min(4, Math.floor(P));
  const t = P - step;
  show(get('mb-ovos'), step === 0 ? 1 : step === 1 ? 1 - smooth(t * 4) : 0);
  const cat = get('mb-lagarta');
  if (cat) {
    const grow = step === 1 ? 0.35 + 0.65 * smooth(t) : step === 2 ? 1 - smooth(t * 1.4) : 0;
    const x = step === 1 ? -2.2 + 3.0 * smooth(t) : 0.8;
    cat.position.set(x, -1.1 + 0.22 * grow + Math.abs(Math.sin(P * 10)) * 0.05 * (step === 1 ? 1 : 0), 0.3);
    cat.rotation.set(0, 0, 0);
    show(cat, step === 0 ? 0 : grow);
  }
  const pupa = get('mb-pupa');
  if (pupa) {
    pupa.position.set(0.4, TWIG_Y - 0.1, -0.5);
    pupa.rotation.set(0, 0, step === 3 ? Math.sin(t * Math.PI * 6) * 0.08 : 0);
    show(pupa, step < 2 ? 0 : step === 2 ? smooth((t - 0.3) * 1.6) : step === 3 ? 1 : 1 - 0.7 * smooth(t * 2.5));
  }
  const adult = step === 4 ? 0.35 + 0.65 * smooth(t * 1.8) : 0;
  const open = step === 4 ? smooth((t - 0.45) * 2.2) : 0;
  const flap = step === 4 && t > 0.8 ? Math.sin((t - 0.8) * 30) * 0.25 : 0;
  const a = 1.45 - 1.25 * open + flap;
  const at = V(0.4, TWIG_Y - 2.0 + 0.8 * open, -0.5);
  for (const [id, rx] of [['mb-corpo', 0], ['mb-asa-e', -a], ['mb-asa-d', a]] as const) {
    const o = get(id);
    if (!o) continue;
    o.position.copy(at);
    o.rotation.set(rx, 0, 0.15);
    show(o, adult);
  }
}

export function buildDevelopment(id: 'embriao' | 'metamorfose-sapo' | 'metamorfose-borboleta'): BuiltModel {
  if (id === 'embriao') return embryo();
  if (id === 'metamorfose-sapo') return frogMeta();
  return butterflyMeta();
}

