/**
 * Invertebrate models of the Animals laboratory: sponge, hydra, planarian,
 * earthworm, grasshopper and sea star. Procedural geometry written by
 * BioLab 3D; every mesh is painted with vertex colours.
 */
import * as THREE from 'three';
import { grasshopper } from './grasshopper';
import { dots, ellipsoid, merge, paint, place, rng, shell, tube, wobble } from '@/laboratories/shared/geometry';
import { presetFor, type BuiltModel, type MeshDef } from '@/laboratories/shared/types';
import { ac, lathe, latheCutFaces, limb, loft, organ, plate, slab, smooth, V, type Profile } from './kit';
import { colorize } from './materials';
import { cutWindow, fbm, mix, sweep, vcolor } from './sculpt';

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

const SP_N = 110;
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
  // ostia (pores) scattered over the outside; each one sinks a small pit into the bumpy wall
  const ostia: { phi: number; t: number }[] = [];
  for (let i = 0; i < 190; i++) {
    const phi = r.range(0, Math.PI * 2);
    if (inWedge(phi)) continue;
    ostia.push({ phi, t: r.range(0.1, 0.92) });
  }
  const angDist = (a: number, b: number) => Math.abs(((((a - b) % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
  const spBump = (phi: number, t: number) => {
    const fade = smooth(Math.min(angDist(phi, CUTS[0]), angDist(phi, CUTS[1])) / 0.3) * smooth((0.985 - t) / 0.08) * smooth(t / 0.06);
    const q = onLathe(1, t * 6, phi);
    const conule = Math.pow(Math.max(0, fbm(q, 2.6, 2) - 0.45), 1.5) * 0.9;
    return fade * (0.1 * (fbm(q, 1.1, 3) - 0.5) + conule * 0.5);
  };
  const spPit = (phi: number, t: number) => {
    let k = 0;
    for (const o of ostia) {
      const dy = (t - o.t) * (SP_TOP - SP_BOTTOM);
      if (Math.abs(dy) > 0.2) continue;
      const dx = angDist(phi, o.phi) * spOuterR(t);
      k = Math.max(k, Math.exp(-(dx * dx + dy * dy) / 0.006));
    }
    return k;
  };
  const pina = lathe(outer, 180, PHI0, PHI_LEN);
  {
    const pos = pina.getAttribute('position');
    const pits: number[] = [];
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const R = Math.hypot(x, z);
      if (R < 0.01) {
        pits.push(0);
        continue;
      }
      const phi = Math.atan2(x, z);
      const t = (pos.getY(i) - SP_BOTTOM) / (SP_TOP - SP_BOTTOM);
      const pit = spPit(phi, t);
      pits.push(pit);
      const k = (R + spBump(phi, t) - 0.06 * pit) / R;
      pos.setX(i, x * k);
      pos.setZ(i, z * k);
    }
    pina.computeVertexNormals();
    let vi = 0;
    vcolor(pina, (q) => {
      const pit = pits[vi++] ?? 0;
      const t = (q.y - SP_BOTTOM) / (SP_TOP - SP_BOTTOM);
      const c = mix('#C47A1E', '#EDB04A', fbm(q, 2.2, 3));
      c.lerp(new THREE.Color('#F3CF7A'), smooth((t - 0.85) / 0.15) * 0.6);
      c.multiplyScalar(0.9 + 0.2 * fbm(q, 9, 2));
      return c.lerp(new THREE.Color('#4A2C0E'), pit);
    });
  }
  meshes.push({ id: 'sp-pinacoderme', structure: 'pinacoderme', geometry: pina });
  meshes.push({ id: 'sp-espongiocele', structure: 'espongiocele', geometry: lathe(inner, 72, PHI0, PHI_LEN) });
  meshes.push({ id: 'sp-coanocitos', structure: 'coanocitos', geometry: paint(collars(innerDots(r, 300)), ac('coanocitos')) });
  meshes.push({ id: 'sp-mesohilo', structure: 'mesohilo', geometry: vcolor(latheCutFaces(outer, inner, CUTS), (q) => mix('#E9D3A0', '#F6EAC8', fbm(q, 4, 3)).multiplyScalar(0.94 + 0.1 * fbm(q, 16, 1))) });
  const rim = lathe([inner[SP_N], outer[SP_N]], 72, PHI0, PHI_LEN);
  meshes.push({ id: 'sp-osculo', structure: 'osculo', geometry: merge([rim, place(new THREE.TorusGeometry(spOuterR(1) - SP_WALL / 2, 0.16, 10, 72, PHI_LEN).rotateX(Math.PI / 2).rotateY(PHI0 + PHI_LEN - Math.PI / 2 + Math.PI), [0, SP_TOP, 0])]) });

  // pores: dark openings at the bottom of the pits, and porocyte canals crossing the cut wall
  const pores: THREE.BufferGeometry[] = [];
  for (const o of ostia) {
    const R = spOuterR(o.t) + spBump(o.phi, o.t) - 0.055;
    const n = V(Math.sin(o.phi), 0, Math.cos(o.phi));
    pores.push(place(new THREE.CircleGeometry(0.05, 12), onLathe(R, spY(o.t), o.phi), new THREE.Quaternion().setFromUnitVectors(V(0, 0, 1), n)));
  }
  for (const phi of CUTS)
    for (let k = 0; k < 9; k++) {
      const t = 0.18 + k * 0.085;
      pores.push(paint(tube([spAt(t, phi, -0.02), spAt(t + 0.01, phi, SP_WALL * 0.5), spAt(t + 0.02, phi, SP_WALL + 0.02)], 0.042, false, 10, 8), '#8A5A26'));
    }
  meshes.push({ id: 'sp-poros', structure: 'poros', geometry: paint(merge(pores), '#2E1A08') });

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

  const rock = shell(wobble(ellipsoid(4.2, 1.0, 3.2), 0.12, 9), { center: 0, width: 0 }, [96, 48]);
  {
    const pos = rock.getAttribute('position');
    const q = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      q.fromBufferAttribute(pos, i);
      const k = 1 + 0.22 * (fbm(q, 0.9, 4) - 0.5);
      pos.setXYZ(i, q.x * k, q.y * (q.y > 0 ? k : 1), q.z * k);
    }
    rock.computeVertexNormals();
    vcolor(rock, (q2, n) => {
      const c = mix('#5E625C', '#8E8C80', fbm(q2, 1.6, 3));
      c.lerp(new THREE.Color('#4F6B3A'), smooth((fbm(q2.clone().addScalar(7), 1.2, 3) - 0.55) / 0.1) * smooth(n.y) * 0.7);
      return c.multiplyScalar(0.9 + 0.2 * fbm(q2, 8, 2));
    });
  }
  meshes.push({ id: 'sp-rocha', structure: 'rocha', geometry: place(rock, [0, SP_BOTTOM - 0.55, 0]) });

  // water and food particles (posed by the filtration process)
  for (let i = 0; i < FLOW_N; i++) meshes.push({ id: `agua-${i}`, structure: 'corrente-de-agua', geometry: paint(new THREE.SphereGeometry(0.1, 10, 8), ac('corrente-de-agua')) });
  for (let i = 0; i < FOOD_N; i++) meshes.push({ id: `alim-${i}`, structure: 'particulas-alimento', geometry: paint(new THREE.IcosahedronGeometry(0.13, 0), ac('particulas-alimento')) });
  return { meshes: colorize(meshes), anchors: {}, preset: presetFor(15.5, [-0.9, 0.5, 0], 0.32, 0.62) };
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
// thin stalk (peduncle) widening into the body column, slightly narrower under the tentacles
const hyR = (t: number) => 0.4 + 0.46 * smooth((t - 0.12) / 0.45) + 0.05 * Math.sin(Math.PI * t) - 0.06 * smooth((t - 0.85) / 0.15);
const hyY = (t: number) => HY_BOTTOM + t * (HY_TOP - HY_BOTTOM);
const BUD_AT = V(0.74, -0.2, -0.12);

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
    mid1.push([R - 0.14, y]);
    mid2.push([R - 0.2, y]);
    inner.push([R - 0.4, y]);
  }
  // the hypostome dome closing the top, with the mouth
  for (let k = 1; k <= 10; k++) {
    const a = (k / 10) * (Math.PI / 2) * 0.86;
    const R = hyR(1);
    const y = HY_TOP + Math.sin(a) * 0.75;
    const f = Math.cos(a);
    outer.push([R * f + 0.12 * (1 - f), y]);
    mid1.push([(R - 0.14) * f + 0.12 * (1 - f), y - 0.08]);
    mid2.push([(R - 0.2) * f + 0.12 * (1 - f), y - 0.13]);
    inner.push([(R - 0.4) * f + 0.1 * (1 - f), y - 0.3]);
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
  const BEADS = 22;
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + 0.3;
    const dir = V(Math.sin(a), 0.42, Math.cos(a)).normalize();
    const base = origin.clone().addScaledVector(V(Math.sin(a), 0, Math.cos(a)), 0.42 * scale);
    const pts = tentacle(base, dir, 4.3 * scale, 2.4 * scale, seed + i);
    const r0 = 0.1 * scale;
    const g = sweep(pts, (t) => {
      const r = r0 * (1 - 0.68 * t);
      const bead = Math.pow(Math.max(0, Math.sin(t * BEADS * Math.PI)), 6) * (t > 0.08 ? 0.32 : 0);
      return { a: r * (1 + bead), b: r * (1 + bead) };
    }, { rings: 260, radial: 14 });
    vcolor(g, (q, _n, u) => mix('#9FB65A', '#D8DFAE', u * 0.7).multiplyScalar(0.92 + 0.12 * fbm(q, 10, 1)));
    body.push(g);
    const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
    for (let k = 1; k < BEADS; k++) if (k / BEADS > 0.1) {
      const t = (k - 0.5) / BEADS;
      const r = r0 * (1 - 0.68 * t);
      cn.push(curve.getPointAt(t).add(V(0, r * 0.9, 0)));
    }
  }
  return { body: merge(body), cn };
}

function hydra(): BuiltModel {
  const meshes: MeshDef[] = [];
  const { outer, mid1, mid2, inner } = hydraProfiles();
  const skin = lathe(outer, 96, PHI0, PHI_LEN);
  vcolor(skin, (q) => {
    const t = (q.y - HY_BOTTOM) / (HY_TOP - HY_BOTTOM);
    const c = mix('#C9C38E', '#7E9A3A', smooth((t - 0.1) / 0.5));
    // fine longitudinal muscle striations and mottling of the green algae (zoochlorellae)
    const phi = Math.atan2(q.x, q.z);
    c.multiplyScalar(0.9 + 0.08 * Math.sin(phi * 38 + fbm(q, 3, 1) * 3) + 0.14 * (fbm(q, 6, 3) - 0.5));
    return c;
  });
  meshes.push({ id: 'hy-epiderme', structure: 'epiderme', geometry: merge([skin, paint(latheCutFaces(outer, mid1, CUTS), '#9CB860')]) });
  meshes.push({ id: 'hy-mesogleia', structure: 'mesogleia', geometry: latheCutFaces(mid1, mid2, CUTS) });
  meshes.push({ id: 'hy-gastroderme', structure: 'gastroderme', geometry: merge([paint(lathe(inner, 64, PHI0, PHI_LEN), ac('gastroderme')), paint(latheCutFaces(mid2, inner, CUTS), ac('gastroderme'))]) });
  const top = V(0, HY_TOP + 0.62, 0);
  meshes.push({ id: 'hy-hipostomio', structure: 'hipostomio', geometry: merge([place(new THREE.TorusGeometry(0.17, 0.07, 8, 28).rotateX(Math.PI / 2), top.clone().add(V(0, 0.08, 0)))]) });
  const t = hydraTentacles(V(0, HY_TOP + 0.45, 0), 1, 7, 30);
  meshes.push({ id: 'hy-tentaculos', structure: 'tentaculos', geometry: t.body });
  meshes.push({ id: 'hy-cnidocitos', structure: 'cnidocitos', geometry: paint(dots(t.cn, 0.042, 1), '#F4F1D8') });
  meshes.push({ id: 'hy-disco', structure: 'disco-basal', geometry: organ(0.55, 0.16, 0.55, [0, HY_BOTTOM - 0.02, 0], '#D9D0A0') });
  // a cnidocyte in detail, beside the tentacle: capsule, coiled thread and cnidocil
  const cnido: THREE.BufferGeometry[] = [];
  const at = V(3.6, 0.2, 0.6);
  // capsule (nematocyst) cut open towards the viewer, so the coiled thread shows
  const capsule = new THREE.SphereGeometry(1, 28, 18, Math.PI * 0.85, Math.PI * 1.3);
  capsule.scale(0.32, 0.5, 0.32);
  cnido.push(paint(place(capsule, at), ac('cnidocitos')));
  cnido.push(paint(place(new THREE.SphereGeometry(0.33, 20, 10, 0, Math.PI * 2, 0, 0.5).scale(1, 0.5, 1), at.clone().add(V(0, 0.44, 0))), '#C5B358'));
  const coil: THREE.Vector3[] = [];
  for (let i = 0; i <= 60; i++) coil.push(at.clone().add(V(Math.cos(i * 0.7) * 0.16, -0.32 + i * 0.011, Math.sin(i * 0.7) * 0.16)));
  cnido.push(paint(tube(coil, 0.032, false, 160, 6), '#F57F17'));
  cnido.push(paint(place(new THREE.ConeGeometry(0.03, 0.3, 6), at.clone().add(V(0, 0.62, 0))), '#F57F17'));
  // magnifier: a ring around the enlarged cell and a thin leader line back to one cnidocyte on a tentacle
  const ring = new THREE.TorusGeometry(0.78, 0.035, 8, 48);
  cnido.push(paint(place(ring, at.clone().add(V(0, 0.12, 0))), '#90A4AE'));
  const target = t.cn[Math.round(t.cn.length * 0.08)];
  const from = at.clone().add(V(0, 0.12, 0)).addScaledVector(target.clone().sub(at).setZ(0).normalize(), 0.78);
  cnido.push(paint(tube([from, target], 0.015, false, 8, 5), '#90A4AE'));
  cnido.push(paint(place(new THREE.TorusGeometry(0.13, 0.02, 6, 20), target), '#90A4AE'));
  meshes.push({ id: 'hy-cnidocito-detalhe', structure: 'cnidocitos', geometry: merge(cnido) });
  // the bud (posed by the budding process; built at the origin, pointing +X)
  meshes.push({ id: 'hy-broto', structure: 'broto-hidra', geometry: budBody() });
  meshes.push({ id: 'hy-broto-tent', structure: 'broto-hidra', geometry: budTentacles() });
  return { meshes: colorize(meshes), anchors: {}, preset: presetFor(19, [-1.4, 0.5, 0], 0.16, 0.35) };
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
  const grow = step === 0 ? 0.35 + 0.15 * smooth(t) : step === 1 ? 0.45 + 0.4 * smooth(t) : 1;
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
  // flat body swept along the outline: domed back, flat belly, wavy margins, triangular head with auricles
  const half = PL_OUTLINE.slice(0, 11);
  const outline = new THREE.SplineCurve(half.map(([x, y]) => new THREE.Vector2(x, y))).getPoints(400);
  const width = (x: number) => {
    for (let i = 1; i < outline.length; i++)
      if (outline[i].x >= x) {
        const k = (x - outline[i - 1].x) / Math.max(1e-6, outline[i].x - outline[i - 1].x);
        return outline[i - 1].y + (outline[i].y - outline[i - 1].y) * k;
      }
    return 0;
  };
  const PX0 = -4.5;
  const PX1 = 4.32;
  const plW = (x: number) => Math.max(0.07, width(x) - 0.05);
  const plA = (x: number) => 0.035 + 0.2 * Math.pow(Math.min(1, plW(x)), 0.7);
  const bodyG = sweep([V(PX0, 0, 0), V(PX1, 0, 0)], (t) => {
    const x = PX0 + t * (PX1 - PX0);
    return { a: plA(x), b: plW(x), sq: 2.4, off: 0.02 };
  }, { up: V(0, 1, 0), rings: 360, radial: 64 });
  {
    const pos = bodyG.getAttribute('position');
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const e = Math.pow(Math.min(1, Math.abs(pos.getZ(i)) / plW(x)), 4);
      // flat belly, ruffled margin
      if (pos.getY(i) < 0) pos.setY(i, pos.getY(i) * 0.45);
      pos.setY(i, pos.getY(i) + e * 0.045 * Math.sin(x * 5.2 + Math.sign(pos.getZ(i)) * 1.3));
    }
    bodyG.computeVertexNormals();
  }
  const eyesAt = [V(3.55, 0, 0.3), V(3.55, 0, -0.3)];
  vcolor(bodyG, (q, n) => {
    const top = smooth((n.y + 0.1) / 0.5);
    const c = mix('#B8A592', '#4E3A2C', top);
    const speck = fbm(q, 7, 3);
    c.lerp(new THREE.Color('#241811'), top * smooth((speck - 0.52) / 0.18) * 0.8);
    c.lerp(new THREE.Color('#8A6A50'), top * smooth((0.4 - speck) / 0.15) * 0.5);
    // pale margin and a faint mid-dorsal line
    c.lerp(new THREE.Color('#9C8470'), top * Math.pow(Math.min(1, Math.abs(q.z) / plW(q.x)), 6) * 0.6);
    c.lerp(new THREE.Color('#6E5644'), top * Math.exp(-(q.z * q.z) / 0.004) * 0.4);
    // unpigmented patches around the eyes (the "cross-eyed" look)
    for (const e of eyesAt) c.lerp(new THREE.Color('#EFE7DA'), top * Math.exp(-((q.x - e.x) ** 2 + (q.z - e.z) ** 2) / 0.022));
    return c;
  });
  const plWin = (c: THREE.Vector3) => c.y > 0 && c.x > -3.85 && c.x < 2.75 && Math.abs(c.z) / plW(c.x) < 0.8;
  const plRim = cutWindow(bodyG, plWin, 0.06, '#7A6352');
  meshes.push({ id: 'pl-corpo', structure: 'corpo-planaria', geometry: merge([bodyG, plRim]) });
  // auricles: chemosensory lobes at the sides of the head
  meshes.push({ id: 'pl-auriculas', structure: 'auriculas', geometry: merge([organ(0.24, 0.06, 0.12, [3.26, 0.05, 1.0], '#A88B74', new THREE.Euler(0, -0.6, 0)), organ(0.24, 0.06, 0.12, [3.26, 0.05, -1.0], '#A88B74', new THREE.Euler(0, 0.6, 0))]) });
  // ocelli: dark pigment cups facing sideways inside the pale patches
  const eyes: THREE.BufferGeometry[] = [];
  for (const e of eyesAt) {
    const y = plA(e.x) + 0.005;
    eyes.push(paint(organ(0.075, 0.035, 0.06, [e.x - 0.01, y, e.z * 0.88], ac('ocelos')), '#121212'));
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
  const gutG = merge(gut);
  {
    // keep the branches inside the narrowing tail and head
    const gp = gutG.getAttribute('position');
    for (let i = 0; i < gp.count; i++) {
      const lim = Math.max(0.05, plW(gp.getX(i)) - 0.2);
      const z = gp.getZ(i);
      if (Math.abs(z) > lim) gp.setZ(i, Math.sign(z) * (lim + (Math.abs(z) - lim) * 0.15));
    }
    gutG.computeVertexNormals();
  }
  meshes.push({ id: 'pl-intestino', structure: 'intestino-ramificado', geometry: paint(gutG, ac('intestino-ramificado')) });
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
      pts.push(V(x, 0.02, s * (0.7 + Math.sin(i * 1.3) * 0.05) * Math.min(1, plW(x) / 1.0)));
      if (i % 2 === 0) flames.push(V(x - 0.1, 0.02, s * (0.78 + Math.sin(i) * 0.03) * Math.min(1, plW(x - 0.1) / 1.0)));
    }
    pn.push(tube(pts, 0.03, false, 120, 5));
  }
  pn.push(dots(flames, 0.06, 0));
  meshes.push({ id: 'pl-protonefridios', structure: 'protonefridios', geometry: paint(merge(pn), ac('protonefridios')) });
  return { meshes: colorize(meshes), anchors: {}, preset: presetFor(12.5, [-1.3, -0.2, 0], 0.85, 0.12) };
}

// ===================================================================== earthworm

const EW_X0 = -4.0;
const EW_X1 = 5.6;
const SEG = 0.34;
const ewR = (t: number) => 0.76 * Math.pow(Math.sin(Math.PI * Math.min(1, 0.03 + t * 0.95)), 0.35);
const ewSeg = (x: number) => 1 - 0.065 * Math.pow(Math.abs(Math.cos((Math.PI * (x - EW_X0)) / SEG)), 6);
const CLIT = [1.5, 2.55];

function earthworm(): BuiltModel {
  const meshes: MeshDef[] = [];
  const L = EW_X1 - EW_X0;
  // opaque skin with ring grooves, darker on the back, and a dissection window on the near flank
  const skin = sweep([V(EW_X0, 0, 0), V(EW_X1, 0, 0)], (t) => {
    const R = ewR(t) * ewSeg(EW_X0 + t * L);
    return { a: R, b: R * 1.03 };
  }, { up: V(0, 1, 0), rings: 620, radial: 40 });
  vcolor(skin, (q, n) => {
    const groove = Math.pow(Math.abs(Math.cos((Math.PI * (q.x - EW_X0)) / SEG)), 6);
    const back = smooth((n.y + 0.2) / 1.0);
    const head = smooth((q.x - 2.6) / 2.5);
    const c = mix('#D9A69A', '#8A3F3C', back);
    c.lerp(new THREE.Color('#7A3536'), head * back * 0.5);
    c.lerp(new THREE.Color('#5E2A2A'), Math.exp(-(q.z * q.z) / 0.006) * back * 0.55);
    c.multiplyScalar(0.92 + 0.14 * fbm(q, 9, 2) - 0.18 * groove);
    return c;
  });
  const ewWin = (c: THREE.Vector3) => c.x > -2.9 && c.x < 4.78 && Math.abs(Math.atan2(c.y, c.z)) < 0.72;
  const skinRim = cutWindow(skin, ewWin, 0.07, '#B5706C');
  meshes.push({ id: 'ew-parede', structure: 'parede-minhoca', geometry: merge([skin, skinRim]) });
  const tc0 = (CLIT[0] - EW_X0) / L;
  const tc1 = (CLIT[1] - EW_X0) / L;
  const clit = sweep([V(CLIT[0], 0, 0), V(CLIT[1], 0, 0)], (t) => {
    const R = ewR(tc0 + t * (tc1 - tc0)) * (0.99 + 0.13 * Math.pow(Math.sin(Math.PI * t), 0.6));
    return { a: R * 1.02, b: R * 1.05 };
  }, { up: V(0, 1, 0), rings: 80, radial: 40, caps: false });
  vcolor(clit, (q, n) => mix('#E6A58E', '#B9654F', smooth((n.y + 0.3) / 1.1)).multiplyScalar(0.94 + 0.1 * fbm(q, 14, 2) - 0.06 * Math.pow(Math.abs(Math.cos((Math.PI * (q.x - EW_X0)) / SEG)), 8)));
  const clitRim = cutWindow(clit, ewWin, 0.09, '#C77F6B');
  meshes.push({ id: 'ew-clitelo', structure: 'clitelo', geometry: merge([clit, clitRim]) });
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
        if (s === 1 && a === 1.0 && x + SEG / 2 > -2.9 && x + SEG / 2 < 4.78) continue;
        set.push(place(new THREE.CylinderGeometry(0.008, 0.018, 0.16, 4), V(x + SEG / 2, 0, 0).addScaledVector(dir, ewR(t) + 0.02), new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), dir.clone().add(V(-0.4, 0, 0)).normalize())));
      }
  }
  meshes.push({ id: 'ew-septos', structure: 'septos', geometry: merge(sept) });
  meshes.push({ id: 'ew-nefridios', structure: 'nefridios', geometry: paint(merge(neph), ac('nefridios')) });
  meshes.push({ id: 'ew-cerdas', structure: 'cerdas', geometry: paint(merge(set), ac('cerdas')) });
  return { meshes: colorize(meshes), anchors: {}, preset: presetFor(14.5, [-0.2, -0.3, 0], 0.3, 0.12) };
}

/** Darker on the back (dorsal vessel shows through), lighter below. */
function paintGradient(g: THREE.BufferGeometry) {
  const p = g.getAttribute('position');
  const a = new THREE.Color('#D9969E');
  const b = new THREE.Color('#A85A66');
  const c = new THREE.Color();
  const col = new Float32Array(p.count * 3);
  const groove = new THREE.Color('#7E3F4A');
  for (let i = 0; i < p.count; i++) {
    c.copy(a).lerp(b, smooth(p.getY(i) / 0.76 + 0.5));
    // darker ring in every groove between segments (annuli)
    c.lerp(groove, 0.55 * Math.pow(Math.abs(Math.cos((Math.PI * (p.getX(i) - EW_X0)) / SEG)), 10));
    col.set([c.r, c.g, c.b], i * 3);
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return g;
}

// ===================================================================== grasshopper

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

