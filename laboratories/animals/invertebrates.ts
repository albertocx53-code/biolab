/**
 * Invertebrate models of the Animals laboratory: sponge, hydra, planarian,
 * earthworm, grasshopper and sea star. Procedural geometry written by
 * BioLab 3D; every mesh is painted with vertex colours.
 */
import * as THREE from 'three';
import { dots, ellipsoid, merge, paint, place, rng, shell, tube, wobble } from '@/laboratories/shared/geometry';
import { presetFor, type BuiltModel, type MeshDef } from '@/laboratories/shared/types';
import { ac, lathe, latheCutFaces, limb, loft, organ, plate, slab, smooth, V, type Profile } from './kit';
import { colorize } from './materials';

type Get = (id: string) => THREE.Object3D | undefined;
const hide = (o: THREE.Object3D | undefined) => o && o.scale.setScalar(0.0001);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

/** Front wedge removed from the lathe solids (φ = 0 faces the viewer). */
const WEDGE = Math.PI * 0.62;
const PHI0 = WEDGE / 2;
const PHI_LEN = Math.PI * 2 - WEDGE;
const CUTS = [PHI0, PHI0 + PHI_LEN];
const onLathe = (r: number, y: number, phi: number) => V(r * Math.sin(phi), y, r * Math.cos(phi));
const inWedge = (phi: number) => {
  const p = ((phi % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  return p < PHI0 || p > PHI0 + PHI_LEN;
};

// ===================================================================== sponge

const SP_N = 40;
const SP_BOTTOM = -2.6;
const SP_TOP = 3.0;
const spOuterR = (t: number) => 1.35 + 0.85 * Math.sin(Math.PI * Math.min(1, t * 0.95)) - 0.15 * t;
const spY = (t: number) => SP_BOTTOM + t * (SP_TOP - SP_BOTTOM);
const SP_WALL = 0.62;
function spongeProfiles() {
  const outer: Profile = [[0, SP_BOTTOM]];
  const inner: Profile = [[0, SP_BOTTOM + 0.7]];
  for (let i = 1; i <= SP_N; i++) {
    const t = i / SP_N;
    const y = spY(t);
    outer.push([spOuterR(t), y]);
    const yi = Math.max(y, SP_BOTTOM + 0.7);
    inner.push([Math.max(0.001, (spOuterR(t) - SP_WALL) * smooth((y - SP_BOTTOM - 0.7) / 0.5)), yi]);
  }
  return { outer, inner };
}
/** Point on the wall surface at height parameter t (0 bottom, 1 rim). */
const spAt = (t: number, phi: number, inset: number) => onLathe(spOuterR(t) - inset, spY(t), phi);

/** Water paths: outside → pore → cavity → up through the osculum. */
const FLOW_N = 22;
const FOOD_N = 10;
function flowCurves() {
  const r = rng(77);
  const out: THREE.CatmullRomCurve3[] = [];
  for (let i = 0; i < FLOW_N + FOOD_N; i++) {
    let phi = r.range(0, Math.PI * 2);
    if (inWedge(phi)) phi += Math.PI;
    const t = r.range(0.2, 0.75);
    const pts = [
      spAt(t, phi, -1.3),
      spAt(t, phi, -0.05),
      spAt(t, phi, SP_WALL + 0.12),
      onLathe(r.range(0.3, 0.7), spY(Math.min(0.92, t + 0.2)), phi + r.range(-0.6, 0.6)),
      onLathe(0.35, SP_TOP + 0.2, phi + 0.6),
      onLathe(r.range(0.4, 1.1), SP_TOP + 2.2, phi + 1.0),
    ];
    out.push(new THREE.CatmullRomCurve3(pts, false, 'centripetal'));
  }
  return out;
}
const FLOW = flowCurves();

function sponge(): BuiltModel {
  const r = rng(5);
  const meshes: MeshDef[] = [];
  const { outer, inner } = spongeProfiles();
  meshes.push({ id: 'sp-pinacoderme', structure: 'pinacoderme', geometry: lathe(outer, 72, PHI0, PHI_LEN) });
  meshes.push({ id: 'sp-espongiocele', structure: 'espongiocele', geometry: lathe(inner, 72, PHI0, PHI_LEN) });
  meshes.push({ id: 'sp-coanocitos', structure: 'coanocitos', geometry: paint(collars(innerDots(r, 300)), ac('coanocitos')) });
  meshes.push({ id: 'sp-mesohilo', structure: 'mesohilo', geometry: latheCutFaces(outer, inner, CUTS) });
  const rim = lathe([inner[SP_N], outer[SP_N]], 72, PHI0, PHI_LEN);
  meshes.push({ id: 'sp-osculo', structure: 'osculo', geometry: merge([rim, place(new THREE.TorusGeometry(spOuterR(1) - SP_WALL / 2, 0.16, 10, 72, PHI_LEN).rotateX(Math.PI / 2).rotateY(PHI0 + PHI_LEN - Math.PI / 2 + Math.PI), [0, SP_TOP, 0])]) });

  // pores on the outer surface and porocyte canals crossing the cut wall
  const pores: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 170; i++) {
    const phi = r.range(0, Math.PI * 2);
    if (inWedge(phi)) continue;
    const t = r.range(0.1, 0.93);
    const p = spAt(t, phi, -0.01);
    const n = V(Math.sin(phi), 0, Math.cos(phi));
    const g = new THREE.CylinderGeometry(0.075, 0.075, 0.06, 10);
    pores.push(place(g, p, new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), n)));
  }
  for (const phi of CUTS)
    for (let k = 0; k < 9; k++) {
      const t = 0.18 + k * 0.085;
      pores.push(tube([spAt(t, phi, -0.02), spAt(t + 0.01, phi, SP_WALL * 0.5), spAt(t + 0.02, phi, SP_WALL + 0.02)], 0.05, false, 10, 6));
    }
  meshes.push({ id: 'sp-poros', structure: 'poros', geometry: merge(pores) });

  // spicules and amoebocytes inside the mesohyl (on the cut faces) and a crown at the rim
  const sp: THREE.BufferGeometry[] = [];
  const am: THREE.Vector3[] = [];
  for (const phi of CUTS) {
    const off = V(Math.cos(phi), 0, -Math.sin(phi)).multiplyScalar(phi === CUTS[0] ? 0.03 : -0.03);
    for (let k = 0; k < 30; k++) {
      const t = r.range(0.12, 0.95);
      const p = spAt(t, phi, r.range(0.15, SP_WALL - 0.15)).add(off);
      if (k % 3 === 0) am.push(p.clone().addScaledVector(V(0, 1, 0), 0.07));
      const dir = V(Math.sin(phi), r.range(-1, 1), Math.cos(phi)).normalize();
      for (let arm = 0; arm < 3; arm++) {
        const d = dir.clone().applyAxisAngle(V(Math.cos(phi), 0, -Math.sin(phi)), (arm * Math.PI * 2) / 3);
        sp.push(place(new THREE.CylinderGeometry(0.012, 0.022, 0.32, 5), p.clone().addScaledVector(d, 0.15), new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), d)));
      }
    }
  }
  for (let k = 0; k < 46; k++) {
    const phi = PHI0 + (k / 45) * PHI_LEN;
    const p = onLathe(spOuterR(1) - SP_WALL / 2, SP_TOP + 0.25, phi);
    sp.push(place(new THREE.CylinderGeometry(0.01, 0.025, 0.7, 5), p, new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), V(Math.sin(phi) * 0.25, 1, Math.cos(phi) * 0.25).normalize())));
  }
  meshes.push({ id: 'sp-espiculas', structure: 'espiculas', geometry: merge(sp) });
  meshes.push({ id: 'sp-amebocitos', structure: 'amebocitos', geometry: dots(am, 0.09, 1) });

  meshes.push({ id: 'sp-rocha', structure: 'rocha', geometry: place(shell(wobble(ellipsoid(4.2, 1.0, 3.2), 0.12, 9), { center: 0, width: 0 }, [56, 28]), [0, SP_BOTTOM - 0.55, 0]) });

  // water and food particles (posed by the filtration process)
  for (let i = 0; i < FLOW_N; i++) meshes.push({ id: `agua-${i}`, structure: 'corrente-de-agua', geometry: paint(new THREE.SphereGeometry(0.1, 10, 8), ac('corrente-de-agua')) });
  for (let i = 0; i < FOOD_N; i++) meshes.push({ id: `alim-${i}`, structure: 'particulas-alimento', geometry: paint(new THREE.IcosahedronGeometry(0.13, 0), ac('particulas-alimento')) });
  return { meshes: colorize(meshes), anchors: {}, preset: presetFor(15.5, [-0.9, 0.5, 0], 0.32, 0.25) };
}

/** Choanocytes: a cell body with a collar (small open cone) and a flagellum, facing the cavity. */
function collars(points: THREE.Vector3[]) {
  const parts: THREE.BufferGeometry[] = [];
  for (const p of points) {
    const n = V(-p.x, 0, -p.z).normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), n);
    parts.push(place(new THREE.SphereGeometry(0.06, 8, 6), p, q));
    parts.push(place(new THREE.CylinderGeometry(0.055, 0.035, 0.08, 8, 1, true), p.clone().addScaledVector(n, 0.07), q));
    parts.push(place(new THREE.CylinderGeometry(0.006, 0.006, 0.18, 3), p.clone().addScaledVector(n, 0.16), q));
  }
  return merge(parts);
}

function innerDots(r: ReturnType<typeof rng>, n: number) {
  const out: THREE.Vector3[] = [];
  for (let i = 0; i < n; i++) {
    const phi = PHI0 + r.next() * PHI_LEN;
    const t = r.range(0.2, 0.97);
    out.push(spAt(t, phi, SP_WALL + 0.04));
  }
  return out;
}

/** Filtration (3 steps): water enters through the pores, food is caught, water leaves by the osculum. */
export function poseFiltration(P: number, get: Get) {
  const step = Math.min(2, Math.floor(P));
  for (let i = 0; i < FLOW_N + FOOD_N; i++) {
    const food = i >= FLOW_N;
    const o = get(food ? `alim-${i - FLOW_N}` : `agua-${i}`);
    if (!o) continue;
    const delay = (i % 7) * 0.07;
    // water: 0..1 over the three steps; food stops at the collar cells
    const u = clamp01((P - delay) / 2.8);
    const uf = Math.min(u, 0.42);
    const k = food ? uf : u;
    if (P === 0 || k <= 0.001 || (!food && k >= 0.999)) {
      hide(o);
      continue;
    }
    o.position.copy(FLOW[i].getPoint(k));
    // food is digested by the choanocytes during step 2
    const s = food ? (step === 0 ? 1 : step === 1 ? 1 - clamp01((P - 1) * 1.2) : 0) : 1;
    o.scale.setScalar(Math.max(0.0001, s));
  }
}

// ===================================================================== hydra

const HY_BOTTOM = -3.2;
const HY_TOP = 2.3;
const HY_N = 36;
const hyR = (t: number) => 0.62 + 0.1 * Math.sin(Math.PI * t * 1.6) - 0.08 * t;
const hyY = (t: number) => HY_BOTTOM + t * (HY_TOP - HY_BOTTOM);
const BUD_AT = V(0.55, -0.9, -0.12);

function hydraProfiles() {
  const outer: Profile = [];
  const mid1: Profile = [];
  const mid2: Profile = [];
  const inner: Profile = [];
  for (let i = 0; i <= HY_N; i++) {
    const t = i / HY_N;
    const y = hyY(t);
    const R = hyR(t) * (i === 0 ? 0.92 : 1);
    outer.push([R, y]);
    mid1.push([R - 0.11, y]);
    mid2.push([R - 0.15, y]);
    inner.push([R - 0.3, y]);
  }
  // the hypostome dome closing the top, with the mouth
  for (let k = 1; k <= 10; k++) {
    const a = (k / 10) * (Math.PI / 2) * 0.86;
    const R = hyR(1);
    const y = HY_TOP + Math.sin(a) * 0.75;
    const f = Math.cos(a);
    outer.push([R * f + 0.12 * (1 - f), y]);
    mid1.push([(R - 0.11) * f + 0.12 * (1 - f), y - 0.06]);
    mid2.push([(R - 0.15) * f + 0.12 * (1 - f), y - 0.1]);
    inner.push([(R - 0.3) * f + 0.1 * (1 - f), y - 0.22]);
  }
  return { outer, mid1, mid2, inner };
}

function tentacle(base: THREE.Vector3, dir: THREE.Vector3, len: number, droop: number, seed: number) {
  const r = rng(seed);
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 10; i++) {
    const s = i / 10;
    pts.push(
      base
        .clone()
        .addScaledVector(dir, s * len)
        .add(V(0, Math.sin(s * Math.PI * 0.7) * len * 0.35 - s * s * droop, 0))
        .add(V(r.range(-0.05, 0.05), 0, r.range(-0.05, 0.05))),
    );
  }
  return pts;
}

function hydraTentacles(origin: THREE.Vector3, scale: number, count: number, seed: number) {
  const body: THREE.BufferGeometry[] = [];
  const cn: THREE.Vector3[] = [];
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + 0.3;
    const dir = V(Math.sin(a), 0.35, Math.cos(a)).normalize();
    const base = origin.clone().addScaledVector(V(Math.sin(a), 0, Math.cos(a)), 0.42 * scale);
    const pts = tentacle(base, dir, 3.4 * scale, 1.8 * scale, seed + i);
    body.push(limb(pts, 0.11 * scale, 0.05 * scale, ac('tentaculos')));
    const curve = new THREE.CatmullRomCurve3(pts);
    for (let k = 1; k < 26; k++) cn.push(curve.getPoint(k / 26).add(V(0, 0.08 * scale, 0)));
  }
  return { body: merge(body), cn };
}

function hydra(): BuiltModel {
  const meshes: MeshDef[] = [];
  const { outer, mid1, mid2, inner } = hydraProfiles();
  meshes.push({ id: 'hy-epiderme', structure: 'epiderme', geometry: merge([paint(lathe(outer, 64, PHI0, PHI_LEN), ac('epiderme')), paint(latheCutFaces(outer, mid1, CUTS), ac('epiderme'))]) });
  meshes.push({ id: 'hy-mesogleia', structure: 'mesogleia', geometry: latheCutFaces(mid1, mid2, CUTS) });
  meshes.push({ id: 'hy-gastroderme', structure: 'gastroderme', geometry: merge([paint(lathe(inner, 64, PHI0, PHI_LEN), ac('gastroderme')), paint(latheCutFaces(mid2, inner, CUTS), ac('gastroderme'))]) });
  const top = V(0, HY_TOP + 0.62, 0);
  meshes.push({ id: 'hy-hipostomio', structure: 'hipostomio', geometry: merge([place(new THREE.TorusGeometry(0.17, 0.07, 8, 28).rotateX(Math.PI / 2), top.clone().add(V(0, 0.08, 0)))]) });
  const t = hydraTentacles(V(0, HY_TOP + 0.45, 0), 1, 7, 30);
  meshes.push({ id: 'hy-tentaculos', structure: 'tentaculos', geometry: t.body });
  meshes.push({ id: 'hy-cnidocitos', structure: 'cnidocitos', geometry: dots(t.cn, 0.065, 1) });
  meshes.push({ id: 'hy-disco', structure: 'disco-basal', geometry: organ(0.82, 0.22, 0.82, [0, HY_BOTTOM - 0.05, 0], ac('disco-basal')) });
  // a cnidocyte in detail, beside the tentacle: capsule, coiled thread and cnidocil
  const cnido: THREE.BufferGeometry[] = [];
  const at = V(3.6, 0.2, 0.6);
  cnido.push(organ(0.32, 0.5, 0.32, [at.x, at.y, at.z], ac('cnidocitos')));
  const coil: THREE.Vector3[] = [];
  for (let i = 0; i <= 60; i++) coil.push(at.clone().add(V(Math.cos(i * 0.7) * 0.16, -0.32 + i * 0.011, Math.sin(i * 0.7) * 0.16)));
  cnido.push(paint(tube(coil, 0.025, false, 160, 5), '#F57F17'));
  cnido.push(paint(place(new THREE.ConeGeometry(0.03, 0.3, 6), at.clone().add(V(0, 0.62, 0))), '#F57F17'));
  meshes.push({ id: 'hy-cnidocito-detalhe', structure: 'cnidocitos', geometry: merge(cnido) });
  // the bud (posed by the budding process; built at the origin, pointing +X)
  meshes.push({ id: 'hy-broto', structure: 'broto-hidra', geometry: budBody() });
  meshes.push({ id: 'hy-broto-tent', structure: 'broto-hidra', geometry: budTentacles() });
  return { meshes: colorize(meshes), anchors: {}, preset: presetFor(21, [-1.6, 0.6, 0], 0.16, 0.35) };
}

function budBody() {
  const g = loft(0, 1.7, (t) => ({ y: 0, ry: 0.34 * Math.sqrt(Math.sin(Math.PI * Math.min(1, 0.15 + t * 0.85))) + 0.02, rz: 0.34 * Math.sqrt(Math.sin(Math.PI * Math.min(1, 0.15 + t * 0.85))) + 0.02 }), 30, 20);
  return paint(g, ac('broto-hidra'));
}
function budTentacles() {
  const parts: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    const base = V(1.55, Math.sin(a) * 0.15, Math.cos(a) * 0.15);
    const dir = V(0.7, Math.sin(a), Math.cos(a)).normalize();
    parts.push(limb([base, base.clone().addScaledVector(dir, 0.35), base.clone().addScaledVector(dir, 0.75).add(V(0.15, -0.1, 0))], 0.05, 0.03, ac('tentaculos')));
  }
  return merge(parts);
}

/** Budding of the hydra (4 steps): bulge, growth, tentacles and mouth, detachment. */
export function poseHydraBud(P: number, get: Get) {
  const step = Math.min(3, Math.floor(P));
  const t = P - step;
  const body = get('hy-broto');
  const tent = get('hy-broto-tent');
  const grow = step === 0 ? 0.25 + 0.2 * smooth(t) : step === 1 ? 0.45 + 0.4 * smooth(t) : 1;
  const tentK = step < 2 ? 0 : step === 2 ? 0.25 + 0.75 * smooth(t) : 1;
  const away = step === 3 ? smooth(t) : 0;
  const pos = BUD_AT.clone().add(V(away * 1.6, -away * 1.9, away * 0.4));
  const rotZ = 0.35 - away * 1.25;
  for (const o of [body, tent]) {
    if (!o) continue;
    o.position.copy(pos);
    o.rotation.set(0, 0, rotZ);
    o.scale.setScalar(Math.max(0.0001, grow));
  }
  if (tent) tent.scale.setScalar(Math.max(0.0001, grow * tentK));
}

// ===================================================================== planarian

const PL_OUTLINE: [number, number][] = (() => {
  const pts: [number, number][] = [];
  // right side from the tail tip to the head (x along the body), mirrored for the left
  const half: [number, number][] = [
    [-4.6, 0.0],
    [-4.3, 0.45],
    [-3.2, 0.9],
    [-1.0, 1.08],
    [1.2, 1.05],
    [2.6, 0.82],
    [3.0, 0.62],
    [3.25, 1.12],
    [3.55, 0.95],
    [4.15, 0.45],
    [4.4, 0.0],
  ];
  for (const p of half) pts.push(p);
  for (let i = half.length - 2; i > 0; i--) pts.push([half[i][0], -half[i][1]]);
  return pts;
})();

function planarian(): BuiltModel {
  const meshes: MeshDef[] = [];
  const sh = new THREE.Shape();
  const v = PL_OUTLINE.map(([x, y]) => new THREE.Vector2(x, y));
  sh.moveTo(v[0].x, v[0].y);
  sh.splineThru(v.slice(1).concat([v[0]]));
  const bodyG = new THREE.ExtrudeGeometry(sh, { depth: 0.18, bevelEnabled: true, bevelThickness: 0.16, bevelSize: 0.16, bevelSegments: 5, curveSegments: 14 });
  bodyG.translate(0, 0, -0.09).rotateX(-Math.PI / 2).deleteAttribute('uv');
  meshes.push({ id: 'pl-corpo', structure: 'corpo-planaria', geometry: bodyG });
  meshes.push({ id: 'pl-auriculas', structure: 'auriculas', geometry: merge([organ(0.32, 0.12, 0.2, [3.3, 0, 1.0], ac('auriculas'), new THREE.Euler(0, -0.5, 0)), organ(0.32, 0.12, 0.2, [3.3, 0, -1.0], ac('auriculas'), new THREE.Euler(0, 0.5, 0))]) });
  // ocelli: pigment cup with a white rim
  const eyes: THREE.BufferGeometry[] = [];
  for (const z of [0.32, -0.32]) {
    eyes.push(paint(organ(0.17, 0.08, 0.13, [3.55, 0.31, z], '#ffffff'), '#F5F5F5'));
    eyes.push(paint(organ(0.1, 0.07, 0.08, [3.53, 0.37, z * 0.92], ac('ocelos')), ac('ocelos')));
  }
  meshes.push({ id: 'pl-ocelos', structure: 'ocelos', geometry: merge(eyes) });
  // branched gut: one anterior trunk, two posterior trunks, lateral diverticula
  const gut: THREE.BufferGeometry[] = [];
  const trunk = (pts: THREE.Vector3[]) => gut.push(tube(pts, 0.11, false, 40, 8));
  trunk([V(0.3, 0, 0), V(1.6, 0, 0), V(2.9, 0, 0)]);
  trunk([V(0.3, 0, 0), V(-0.6, 0, 0.42), V(-2.5, 0, 0.45), V(-4.0, 0, 0.2)]);
  trunk([V(0.3, 0, 0), V(-0.6, 0, -0.42), V(-2.5, 0, -0.45), V(-4.0, 0, -0.2)]);
  for (let x = 2.6; x > 0.6; x -= 0.42) for (const s of [1, -1]) gut.push(tube([V(x, 0, 0), V(x - 0.05, 0, s * 0.35), V(x - 0.2, 0, s * 0.62)], 0.065, false, 10, 6));
  for (let x = -0.6; x > -3.9; x -= 0.42)
    for (const s of [1, -1]) {
      const zc = s * 0.45;
      gut.push(tube([V(x, 0, zc), V(x - 0.08, 0, zc + s * 0.25), V(x - 0.22, 0, zc + s * 0.42)], 0.06, false, 10, 6));
      gut.push(tube([V(x - 0.1, 0, zc), V(x - 0.14, 0, zc * 0.4)], 0.05, false, 8, 6));
    }
  meshes.push({ id: 'pl-intestino', structure: 'intestino-ramificado', geometry: paint(merge(gut), ac('intestino-ramificado')) });
  // muscular pharynx in its pouch, pointing backwards, mouth on the ventral side
  meshes.push({ id: 'pl-faringe', structure: 'faringe', geometry: merge([paint(new THREE.CylinderGeometry(0.2, 0.15, 1.5, 18).rotateZ(Math.PI / 2).translate(-0.45, -0.1, 0), ac('faringe')), organ(0.12, 0.08, 0.12, [-1.2, -0.12, 0], '#C2185B')]) });
  // nervous system: brain ganglia, two ventral cords and commissures (ladder)
  meshes.push({ id: 'pl-ganglios', structure: 'ganglios-cerebrais', geometry: merge([organ(0.28, 0.1, 0.2, [3.1, -0.06, 0.22], ac('ganglios-cerebrais')), organ(0.28, 0.1, 0.2, [3.1, -0.06, -0.22], ac('ganglios-cerebrais'))]) });
  const ner: THREE.BufferGeometry[] = [];
  for (const s of [1, -1]) ner.push(tube([V(3.0, -0.06, s * 0.3), V(2.2, -0.08, s * 0.62), V(0, -0.08, s * 0.7), V(-3.0, -0.08, s * 0.62), V(-4.2, -0.08, s * 0.15)], 0.045, false, 60, 6));
  for (let x = 2.0; x > -3.8; x -= 0.55) ner.push(tube([V(x, -0.08, 0.66), V(x, -0.08, -0.66)], 0.025, false, 6, 5));
  meshes.push({ id: 'pl-cordoes', structure: 'cordoes-nervosos', geometry: paint(merge(ner), ac('cordoes-nervosos')) });
  // protonephridia: a canal on each side with flame cells
  const pn: THREE.BufferGeometry[] = [];
  const flames: THREE.Vector3[] = [];
  for (const s of [1, -1]) {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 24; i++) {
      const x = 2.8 - i * 0.29;
      pts.push(V(x, 0.06, s * (0.86 + Math.sin(i * 1.3) * 0.06)));
      if (i % 2 === 0) flames.push(V(x - 0.1, 0.06, s * (0.96 + Math.sin(i) * 0.04)));
    }
    pn.push(tube(pts, 0.03, false, 120, 5));
  }
  pn.push(dots(flames, 0.06, 0));
  meshes.push({ id: 'pl-protonefridios', structure: 'protonefridios', geometry: paint(merge(pn), ac('protonefridios')) });
  return { meshes: colorize(meshes), anchors: {}, preset: presetFor(12.5, [-0.6, -0.2, 0], 0.95, 0.1) };
}

// ===================================================================== earthworm

const EW_X0 = -5.6;
const EW_X1 = 5.6;
const SEG = 0.34;
const ewR = (t: number) => 0.6 * Math.pow(Math.sin(Math.PI * Math.min(1, 0.03 + t * 0.95)), 0.35);
const ewSeg = (x: number) => 1 - 0.07 * Math.pow(Math.abs(Math.cos((Math.PI * (x - EW_X0)) / SEG)), 6);
const CLIT = [1.5, 2.55];

function earthworm(): BuiltModel {
  const meshes: MeshDef[] = [];
  const L = EW_X1 - EW_X0;
  meshes.push({
    id: 'ew-parede',
    structure: 'parede-minhoca',
    geometry: paintGradient(
      loft(EW_X0, EW_X1, (t) => {
        const x = EW_X0 + t * L;
        const R = ewR(t) * ewSeg(x);
        return { y: 0, ry: R, rz: R };
      }, 520, 32),
    ),
  });
  const tc0 = (CLIT[0] - EW_X0) / L;
  const tc1 = (CLIT[1] - EW_X0) / L;
  meshes.push({ id: 'ew-clitelo', structure: 'clitelo', geometry: loft(CLIT[0], CLIT[1], (t) => ({ y: 0, ry: ewR(tc0 + t * (tc1 - tc0)) * 1.16 * Math.pow(Math.sin(Math.PI * t), 0.15), rz: ewR(tc0 + t * (tc1 - tc0)) * 1.16 * Math.pow(Math.sin(Math.PI * t), 0.15) }), 40, 32) });
  meshes.push({ id: 'ew-prostomio', structure: 'prostomio', geometry: organ(0.24, 0.2, 0.22, [EW_X1 - 0.02, 0.05, 0], ac('prostomio')) });
  // digestive tube
  meshes.push({ id: 'ew-faringe', structure: 'faringe-minhoca', geometry: organ(0.42, 0.25, 0.25, [4.9, -0.02, 0], ac('faringe-minhoca')) });
  meshes.push({ id: 'ew-esofago', structure: 'esofago', geometry: paint(tube([V(4.5, -0.02, 0), V(3.6, 0, 0)], 0.11, false, 10, 10), ac('esofago')) });
  meshes.push({ id: 'ew-papo', structure: 'papo', geometry: organ(0.38, 0.26, 0.26, [3.25, 0, 0], ac('papo')) });
  meshes.push({ id: 'ew-moela', structure: 'moela', geometry: organ(0.36, 0.3, 0.3, [2.55, 0, 0], ac('moela')) });
  const gutPts: THREE.Vector3[] = [];
  for (let x = 2.2; x >= EW_X0 + 0.25; x -= 0.17) gutPts.push(V(x, 0, 0));
  const gutG = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(gutPts), 300, 0.22, 14, false);
  // pinch the intestine at every septum
  {
    const p = gutG.getAttribute('position');
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const k = 1 - 0.18 * Math.pow(Math.abs(Math.cos((Math.PI * (x - EW_X0)) / SEG)), 8);
      p.setY(i, p.getY(i) * k);
      p.setZ(i, p.getZ(i) * k);
    }
    gutG.computeVertexNormals();
  }
  meshes.push({ id: 'ew-intestino', structure: 'intestino', geometry: gutG });
  // blood vessels and the five pairs of "hearts" (aortic arches)
  meshes.push({ id: 'ew-vaso-dorsal', structure: 'vaso-dorsal', geometry: paint(tube([V(EW_X0 + 0.3, 0.33, 0), V(0, 0.36, 0), V(4.6, 0.3, 0), V(5.3, 0.1, 0)], 0.06, false, 120, 8), ac('vaso-dorsal')) });
  meshes.push({ id: 'ew-vaso-ventral', structure: 'vaso-ventral', geometry: paint(tube([V(EW_X0 + 0.3, -0.33, 0), V(0, -0.34, 0), V(4.6, -0.3, 0), V(5.3, -0.12, 0)], 0.05, false, 120, 8), ac('vaso-ventral')) });
  const hearts: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 5; i++) {
    const x = 3.0 + i * SEG;
    for (const s of [1, -1]) {
      const arc: THREE.Vector3[] = [];
      for (let k = 0; k <= 12; k++) {
        const a = Math.PI / 2 - (k / 12) * Math.PI;
        arc.push(V(x, Math.sin(a) * 0.33, s * Math.cos(a) * 0.36));
      }
      hearts.push(tube(arc, 0.055, false, 24, 8));
    }
  }
  meshes.push({ id: 'ew-coracoes', structure: 'coracoes', geometry: paint(merge(hearts), ac('coracoes')) });
  // nervous system: cerebral ganglion, connectives and ventral cord with ganglia
  meshes.push({ id: 'ew-ganglio', structure: 'ganglio-cerebral', geometry: merge([organ(0.12, 0.1, 0.15, [5.05, 0.3, 0.1], ac('ganglio-cerebral')), organ(0.12, 0.1, 0.15, [5.05, 0.3, -0.1], ac('ganglio-cerebral')), paint(tube([V(5.05, 0.3, 0.18), V(5.0, 0, 0.3), V(4.85, -0.36, 0.06)], 0.025, false, 12, 5), ac('ganglio-cerebral')), paint(tube([V(5.05, 0.3, -0.18), V(5.0, 0, -0.3), V(4.85, -0.36, -0.06)], 0.025, false, 12, 5), ac('ganglio-cerebral'))]) });
  const cord: THREE.BufferGeometry[] = [tube([V(4.85, -0.4, 0), V(0, -0.45, 0), V(EW_X0 + 0.3, -0.38, 0)], 0.035, false, 80, 6)];
  const gang: THREE.Vector3[] = [];
  for (let x = 4.6; x > EW_X0 + 0.4; x -= SEG) gang.push(V(x, -0.45, 0));
  cord.push(dots(gang, 0.06, 1));
  meshes.push({ id: 'ew-cordao', structure: 'cordao-nervoso-ventral', geometry: paint(merge(cord), ac('cordao-nervoso-ventral')) });
  // septa, nephridia and setae, segment by segment
  const sept: THREE.BufferGeometry[] = [];
  const neph: THREE.BufferGeometry[] = [];
  const set: THREE.BufferGeometry[] = [];
  for (let x = EW_X0 + SEG * 1.5; x < 4.4; x += SEG) {
    const t = (x - EW_X0) / L;
    const R = ewR(t) * 0.93;
    if (x < 2.1) sept.push(new THREE.RingGeometry(0.24, R, 28, 1).rotateY(Math.PI / 2).translate(x, 0, 0));
    if (x < 2.0)
      for (const s of [1, -1]) {
        const c: THREE.Vector3[] = [];
        for (let k = 0; k <= 16; k++) c.push(V(x + 0.05 + k * 0.012, -0.22 + Math.sin(k * 0.9) * 0.06, s * (0.32 + Math.cos(k * 0.9) * 0.06)));
        neph.push(tube(c, 0.02, false, 40, 4));
      }
    for (const a of [0.6, 1.0])
      for (const s of [1, -1]) {
        const dir = V(0, -Math.cos(a), s * Math.sin(a));
        set.push(place(new THREE.CylinderGeometry(0.008, 0.018, 0.16, 4), V(x + SEG / 2, 0, 0).addScaledVector(dir, ewR(t) + 0.02), new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), dir.clone().add(V(-0.4, 0, 0)).normalize())));
      }
  }
  meshes.push({ id: 'ew-septos', structure: 'septos', geometry: merge(sept) });
  meshes.push({ id: 'ew-nefridios', structure: 'nefridios', geometry: paint(merge(neph), ac('nefridios')) });
  meshes.push({ id: 'ew-cerdas', structure: 'cerdas', geometry: paint(merge(set), ac('cerdas')) });
  return { meshes: colorize(meshes), anchors: {}, preset: presetFor(16.5, [-1.5, -0.3, 0], 0.42, 0.1) };
}

/** Darker on the back (dorsal vessel shows through), lighter below. */
function paintGradient(g: THREE.BufferGeometry) {
  const p = g.getAttribute('position');
  const a = new THREE.Color('#D9969E');
  const b = new THREE.Color('#A85A66');
  const c = new THREE.Color();
  const col = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) {
    c.copy(a).lerp(b, smooth(p.getY(i) / 0.6 + 0.5));
    col.set([c.r, c.g, c.b], i * 3);
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return g;
}

// ===================================================================== grasshopper

function grasshopper(): BuiltModel {
  const meshes: MeshDef[] = [];
  // head: tall, slightly tilted down at the front
  meshes.push({ id: 'gh-cabeca', structure: 'cabeca', geometry: merge([organ(0.78, 0.95, 0.72, [3.35, 0.55, 0], ac('cabeca'), new THREE.Euler(0, 0, -0.35)), organ(0.45, 0.4, 0.5, [3.75, -0.15, 0], ac('cabeca'))]) });
  meshes.push({ id: 'gh-olhos', structure: 'olhos-compostos', geometry: merge([organ(0.3, 0.42, 0.18, [3.45, 0.85, 0.62], ac('olhos-compostos'), new THREE.Euler(0, 0, -0.3)), organ(0.3, 0.42, 0.18, [3.45, 0.85, -0.62], ac('olhos-compostos'), new THREE.Euler(0, 0, -0.3)), organ(0.05, 0.05, 0.05, [3.95, 1.15, 0], '#3E2723')]) });
  const ant: THREE.BufferGeometry[] = [];
  for (const s of [1, -1]) ant.push(tube([V(3.75, 1.2, s * 0.32), V(4.1, 2.0, s * 0.55), V(3.7, 2.9, s * 0.9), V(2.8, 3.4, s * 1.2)], 0.035, false, 60, 6));
  meshes.push({ id: 'gh-antenas', structure: 'antenas', geometry: paint(merge(ant), ac('antenas')) });
  const mouth: THREE.BufferGeometry[] = [organ(0.18, 0.14, 0.3, [3.85, -0.6, 0], ac('aparelho-bucal'))];
  for (const s of [1, -1]) {
    mouth.push(organ(0.14, 0.2, 0.12, [3.85, -0.5, s * 0.22], '#5D4037', new THREE.Euler(0, 0, 0.3)));
    mouth.push(limb([V(3.8, -0.55, s * 0.32), V(3.95, -0.85, s * 0.38), V(3.75, -1.05, s * 0.4)], 0.04, 0.03, ac('aparelho-bucal')));
  }
  meshes.push({ id: 'gh-boca', structure: 'aparelho-bucal', geometry: merge(mouth) });
  // thorax: saddle-shaped pronotum and the two wing-bearing segments
  meshes.push({ id: 'gh-torax', structure: 'torax', geometry: merge([organ(0.85, 0.82, 0.78, [2.05, 0.45, 0], ac('torax')), organ(0.7, 0.72, 0.7, [1.15, 0.38, 0], '#7CB342')]) });
  // abdomen: 10 tapering segments
  const abd: THREE.BufferGeometry[] = [];
  const sp: THREE.Vector3[] = [V(2.0, 0.2, 0.74), V(2.0, 0.2, -0.74), V(1.2, 0.2, 0.68), V(1.2, 0.2, -0.68)];
  for (let i = 0; i < 10; i++) {
    const x = 0.45 - i * 0.48;
    const r = 0.62 * (1 - i * 0.055);
    abd.push(organ(0.32, r, r * 0.9, [x, 0.3 - i * 0.04, 0], i % 2 ? '#7CB342' : ac('abdome')));
    if (i < 8) sp.push(V(x, 0.18 - i * 0.04, r * 0.88), V(x, 0.18 - i * 0.04, -r * 0.88));
  }
  abd.push(organ(0.25, 0.12, 0.12, [-4.4, 0.0, 0], '#558B2F'));
  meshes.push({ id: 'gh-abdome', structure: 'abdome', geometry: merge(abd) });
  meshes.push({ id: 'gh-espiraculos', structure: 'espiraculos', geometry: paint(dots(sp, 0.055, 1), ac('espiraculos')) });
  // legs: two short pairs and the long jumping hind pair
  const legs: THREE.BufferGeometry[] = [];
  for (const s of [1, -1]) {
    legs.push(limb([V(2.2, -0.15, s * 0.45), V(2.5, -0.7, s * 0.9), V(2.75, -1.5, s * 1.0), V(3.1, -1.85, s * 1.05)], 0.09, 0.05, ac('patas')));
    legs.push(limb([V(1.3, -0.15, s * 0.45), V(1.2, -0.75, s * 1.0), V(0.95, -1.55, s * 1.15), V(0.75, -1.85, s * 1.2)], 0.09, 0.05, ac('patas')));
    // hind leg: thick femur up and back, long tibia down to the ground, tarsus
    legs.push(organ(1.25, 0.3, 0.2, [0.1, 0.35, s * 0.85], ac('patas'), new THREE.Euler(0, 0, -0.42)));
    legs.push(limb([V(-1.05, 0.88, s * 0.9), V(-0.2, -0.5, s * 1.0), V(0.4, -1.75, s * 1.05)], 0.08, 0.05, '#8BC34A'));
    legs.push(limb([V(0.4, -1.75, s * 1.05), V(-0.1, -1.85, s * 1.08), V(-0.45, -1.88, s * 1.1)], 0.05, 0.04, '#689F38'));
  }
  meshes.push({ id: 'gh-patas', structure: 'patas', geometry: merge(legs) });
  // wings: leathery forewings folded over the back; one membranous hindwing spread (far side)
  const wings: THREE.BufferGeometry[] = [];
  for (const s of [1, -1]) {
    const fw = plate([[0, 0], [-1.6, 0.18], [-3.9, 0.1], [-4.6, -0.12], [-3.8, -0.35], [-1.4, -0.28]], 0.03);
    fw.rotateX(Math.PI / 2 + s * 0.42).translate(1.45, 0.95, s * 0.28);
    wings.push(paint(fw, '#9CB86B'));
  }
  const hw = new THREE.CircleGeometry(2.9, 28, Math.PI * 0.55, Math.PI * 0.55);
  hw.rotateX(-Math.PI / 2).rotateZ(-0.35).rotateY(-0.25).translate(1.2, 1.05, -0.4);
  const veins: THREE.BufferGeometry[] = [];
  for (let k = 0; k <= 10; k++) {
    const a = Math.PI * 0.55 + (k / 10) * Math.PI * 0.55;
    const tip = V(Math.cos(a) * 2.85, 0, -Math.sin(a) * 2.85);
    const g = tube([V(0, 0.01, 0), tip], 0.015, false, 4, 4);
    g.rotateZ(-0.35).rotateY(-0.25).translate(1.2, 1.05, -0.4);
    veins.push(paint(g, '#7E9A5B'));
  }
  wings.push(paint(hw, ac('asas')), ...veins);
  meshes.push({ id: 'gh-asas', structure: 'asas', geometry: merge(wings) });
  return { meshes: colorize(meshes), anchors: {}, preset: presetFor(13.5, [-0.2, 0.4, 0], 0.32, 0.55) };
}

// ===================================================================== sea star

const ARMS = 5;
function starOutline(R: number, r: number) {
  const pts: [number, number][] = [];
  const n = 240;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + Math.PI / 2;
    // smooth arms: wide at the disc, tapering to rounded tips
    const k = Math.pow(0.5 + 0.5 * Math.cos(ARMS * (a - Math.PI / 2)), 2.2);
    const rr = r + (R - r) * k;
    pts.push([Math.cos(a) * rr, Math.sin(a) * rr]);
  }
  return pts;
}

function seaStar(): BuiltModel {
  const r = rng(21);
  const meshes: MeshDef[] = [];
  const top = slab(starOutline(3.7, 1.25), 0.2, 0.26, 14);
  top.translate(0, 0.32, 0);
  meshes.push({ id: 'st-aboral', structure: 'face-aboral', geometry: top });
  const bot = slab(starOutline(3.6, 1.2), 0.12, 0.16, 14);
  bot.translate(0, -0.05, 0);
  meshes.push({ id: 'st-oral', structure: 'face-oral', geometry: bot });
  const armDir = (k: number) => {
    const a = (k / ARMS) * Math.PI * 2 + Math.PI / 2;
    // the slab is in XZ with shape y → −z
    return V(Math.cos(a), 0, -Math.sin(a));
  };
  // spines on the aboral face
  const spines: THREE.Vector3[] = [];
  for (let k = 0; k < ARMS; k++) {
    const d = armDir(k);
    const side = V(-d.z, 0, d.x);
    for (let i = 0; i < 22; i++) {
      const s = r.range(0.5, 3.4);
      const w = (1 - s / 3.9) * 0.6;
      spines.push(d.clone().multiplyScalar(s).addScaledVector(side, r.range(-w, w)).add(V(0, 0.62, 0)));
    }
  }
  meshes.push({ id: 'st-espinhos', structure: 'espinhos', geometry: dots(spines, 0.055, 1) });
  // madreporite between two arms; stone canal down to the ring canal
  const mad = armDir(0).add(armDir(1)).normalize().multiplyScalar(0.75);
  meshes.push({ id: 'st-madreporito', structure: 'madreporito', geometry: place(new THREE.CylinderGeometry(0.24, 0.26, 0.08, 20), mad.clone().add(V(0, 0.66, 0))) });
  // water vascular system: stone canal, ring canal, radial canals, ampullae
  const wv: THREE.BufferGeometry[] = [tube([mad.clone().add(V(0, 0.6, 0)), mad.clone().multiplyScalar(0.9).add(V(0, 0.3, 0)), mad.clone().normalize().multiplyScalar(0.62).add(V(0, 0.05, 0))], 0.05, false, 20, 6)];
  wv.push(new THREE.TorusGeometry(0.62, 0.1, 10, 48).rotateX(Math.PI / 2).translate(0, 0.05, 0));
  const feet: THREE.BufferGeometry[] = [];
  for (let k = 0; k < ARMS; k++) {
    const d = armDir(k);
    const side = V(-d.z, 0, d.x);
    wv.push(tube([d.clone().multiplyScalar(0.62).add(V(0, 0.05, 0)), d.clone().multiplyScalar(3.3).add(V(0, 0.05, 0))], 0.085, false, 20, 8));
    for (let i = 0; i < 9; i++) {
      const s = 0.95 + i * 0.27;
      for (const sd of [1, -1]) {
        const w = 0.16 + 0.06 * (i % 2);
        const base = d.clone().multiplyScalar(s).addScaledVector(side, sd * w);
        wv.push(place(new THREE.SphereGeometry(0.075, 8, 6), base.clone().add(V(0, 0.2, 0)), undefined, V(1, 1.4, 1)));
        // tube foot under the arm, with a suction disc
        feet.push(place(new THREE.CylinderGeometry(0.045, 0.05, 0.45, 8), base.clone().add(V(0, -0.36, 0))));
        feet.push(place(new THREE.CylinderGeometry(0.075, 0.075, 0.04, 12), base.clone().add(V(0, -0.6, 0))));
      }
    }
  }
  meshes.push({ id: 'st-ambulacral', structure: 'sistema-ambulacral', geometry: paint(merge(wv), ac('sistema-ambulacral')) });
  meshes.push({ id: 'st-pes', structure: 'pes-ambulacrais', geometry: paint(merge(feet), ac('pes-ambulacrais')) });
  meshes.push({ id: 'st-boca', structure: 'boca', geometry: place(new THREE.CylinderGeometry(0.32, 0.32, 0.04, 24), [0, -0.24, 0]) });
  for (const m of meshes) place(m.geometry, [0, 0.4, 0], new THREE.Quaternion().setFromEuler(new THREE.Euler(0.12, 0.3, 0)));
  return { meshes: colorize(meshes), anchors: {}, preset: presetFor(12.5, [-0.4, 0.1, 0], 0.62, 0.1) };
}

export type InvertebrateModel = 'esponja' | 'hidra' | 'planaria' | 'minhoca' | 'gafanhoto' | 'estrela-do-mar';

export function buildInvertebrate(id: InvertebrateModel): BuiltModel {
  switch (id) {
    case 'esponja':
      return sponge();
    case 'hidra':
      return hydra();
    case 'planaria':
      return planarian();
    case 'minhoca':
      return earthworm();
    case 'gafanhoto':
      return grasshopper();
    case 'estrela-do-mar':
      return seaStar();
  }
}

