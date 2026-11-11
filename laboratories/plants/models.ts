/**
 * Procedural 3D models of the Plants laboratory (original geometry, built in
 * code). Schematic and out of scale: shapes follow textbook diagrams of a
 * generic eudicot, not a particular species.
 */
import * as THREE from 'three';
import { presetFor, type BuiltModel, type MeshDef } from '@/laboratories/shared/types';
import { cutFaces, dots, ellipsoid, merge, paint, place, rng, scaled, shell, wobble, type Cut, type Rng } from '@/laboratories/shared/geometry';
import { blade, clipArc, keptRange, roundBox, sector, surface, taper } from './shapes';
import type { PlantModelId } from './catalog';

/** Camera azimuth used by every preset; cut-aways face this direction. */
export const VIEW_PHI = 0.55;
const CUT: Cut = { center: VIEW_PHI, width: Math.PI / 2 };
const KEPT = keptRange(CUT.center, CUT.width);

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const dirAt = (phi: number, y = 0) => V(Math.sin(phi), y, Math.cos(phi));
const qY = (a: number) => new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), a);
const qX = (a: number) => new THREE.Quaternion().setFromAxisAngle(V(1, 0, 0), a);
/** Orientation for a blade built along +Z: turn to azimuth phi, then raise the tip by `tilt`. */
const bladeQuat = (phi: number, tilt: number, roll = 0) => qY(phi).multiply(qX(-tilt)).multiply(new THREE.Quaternion().setFromAxisAngle(V(0, 0, 1), roll));

function wiggle(r: Rng, from: THREE.Vector3, dir: THREE.Vector3, length: number, n: number, amp: number, gravity = 0) {
  const pts = [from.clone()];
  const d = dir.clone().normalize();
  let p = from.clone();
  for (let i = 1; i <= n; i++) {
    d.add(V(r.range(-amp, amp), r.range(-amp, amp) - gravity, r.range(-amp, amp))).normalize();
    p = p.clone().addScaledVector(d, length / n);
    pts.push(p);
  }
  return pts;
}

/** Leaf (blade + veins) placed at `base`; returns meshes' geometries. */
function leaf(base: THREE.Vector3, q: THREE.Quaternion, length: number, width: number, droop: number) {
  const b = blade({ length, width, droop, cup: 0.12, shape: 'leaf' });
  const lift = V(0, 0.006, 0);
  const veins: THREE.BufferGeometry[] = [];
  const mid = Array.from({ length: 9 }, (_, i) => b.at(i / 8, 0).add(lift));
  veins.push(taper(mid, length * 0.016, length * 0.004, 40, 6, false));
  for (const u0 of [0.12, 0.27, 0.42, 0.57, 0.72])
    for (const s of [-1, 1]) {
      const pts = Array.from({ length: 5 }, (_, i) => {
        const t = i / 4;
        return b.at(Math.min(0.98, u0 + t * 0.2), s * t * 0.82).add(lift);
      });
      veins.push(taper(pts, length * 0.007, length * 0.003, 16, 5, false));
    }
  const v = merge(veins);
  for (const g of [b.geo, v]) place(g, base, q);
  return { blade: b.geo, veins: v, tipAt: (u: number) => b.at(u, 0).applyQuaternion(q).add(base) };
}

// ====================================================================== whole plant

function wholePlant(): BuiltModel {
  const r = rng(11);
  const meshes: MeshDef[] = [];
  const anchors: BuiltModel['anchors'] = {};

  // soil block (translucent), roots inside
  meshes.push({ id: 'solo', structure: 'solo', geometry: place(roundBox(1.25, 1.0, 1.25, 6, [40, 24]), [0, -1.0, 0]) });

  // stem
  const stemPts = [V(0, -0.1, 0), V(0.02, 0.8, 0.01), V(-0.03, 1.7, 0.02), V(0.03, 2.6, -0.01), V(0, 3.45, 0)];
  const stemCurve = new THREE.CatmullRomCurve3(stemPts);
  meshes.push({ id: 'caule', structure: 'caule', geometry: taper(stemPts, 0.075, 0.035, 60, 10, false) });
  anchors.stem = Array.from({ length: 8 }, (_, i) => stemCurve.getPointAt(0.05 + (i / 7) * 0.9));

  // apical bud
  const top = stemCurve.getPointAt(1);
  const bud = [place(shell(ellipsoid(0.05, 0.1, 0.05), undefined, [16, 10]), top.clone().add(V(0, 0.07, 0)))];
  for (let k = 0; k < 2; k++) {
    const b = blade({ length: 0.16, width: 0.05, cup: 0.6, shape: 'sepal' });
    bud.push(place(b.geo, top.clone().add(V(0, 0.02, 0)), bladeQuat(k * Math.PI + 0.4, 1.15)));
  }
  meshes.push({ id: 'gema-apical', structure: 'gema-apical', geometry: merge(bud) });

  // nodes with alternate leaves
  const nodeT = [0.2, 0.38, 0.55, 0.7, 0.84];
  const rings: THREE.BufferGeometry[] = [];
  const axillary: THREE.BufferGeometry[] = [];
  const petioles: THREE.BufferGeometry[] = [];
  const blades: THREE.BufferGeometry[] = [];
  const veins: THREE.BufferGeometry[] = [];
  anchors.leaves = [];
  const nodePos: THREE.Vector3[] = [];
  nodeT.forEach((t, i) => {
    const p = stemCurve.getPointAt(t);
    nodePos.push(p);
    const rad = THREE.MathUtils.lerp(0.075, 0.035, t);
    const tor = new THREE.TorusGeometry(rad * 1.08, rad * 0.28, 6, 20);
    tor.rotateX(Math.PI / 2);
    rings.push(place(tor, p));
    if (i === 1) return; // this node carries the fruit stalk instead of a leaf
    const phi = VIEW_PHI + 1.3 + i * 2.4;
    const out = dirAt(phi);
    const pe = [p.clone(), p.clone().addScaledVector(out, 0.22).add(V(0, 0.16, 0)), p.clone().addScaledVector(out, 0.42).add(V(0, 0.2, 0))];
    petioles.push(taper(pe, 0.022, 0.014, 16, 6, false));
    const size = i === 4 ? 0.7 : 1.0;
    const L = leaf(pe[2], bladeQuat(phi, 0.25, 0.25), 1.05 * size, 0.46 * size, 0.22);
    blades.push(L.blade);
    veins.push(L.veins);
    anchors.leaves.push(L.tipAt(0.45));
    // axillary bud in the angle between petiole and stem
    axillary.push(place(shell(ellipsoid(0.03, 0.05, 0.03), undefined, [12, 8]), p.clone().addScaledVector(out, 0.07).add(V(0, 0.09, 0))));
  });
  meshes.push({ id: 'nos', structure: 'nos', geometry: merge(rings) });
  meshes.push({ id: 'gemas-axilares', structure: 'gemas-axilares', geometry: merge(axillary) });
  meshes.push({ id: 'peciolo', structure: 'peciolo', geometry: merge(petioles) });
  meshes.push({ id: 'limbo', structure: 'limbo', geometry: merge(blades) });
  meshes.push({ id: 'nervuras', structure: 'nervuras', geometry: merge(veins) });

  // flower on a stalk near the top
  {
    const p = stemCurve.getPointAt(0.93);
    const phi = VIEW_PHI - 0.6;
    const out = dirAt(phi);
    const stalk = [p.clone(), p.clone().addScaledVector(out, 0.2).add(V(0, 0.18, 0)), p.clone().addScaledVector(out, 0.36).add(V(0, 0.22, 0))];
    const c = stalk[2];
    const parts = [paint(taper(stalk, 0.018, 0.016, 12, 6, false), '#5E9B48')];
    parts.push(paint(place(shell(ellipsoid(0.06, 0.05, 0.06), undefined, [14, 10]), c), '#6FAE52'));
    const facing = qY(phi).multiply(qX(-0.55)); // flower turned towards the viewer and up
    for (let k = 0; k < 5; k++) {
      const pb = blade({ length: 0.26, width: 0.11, cup: 0.25, droop: -0.1, shape: 'petal' });
      const q = facing.clone().multiply(qX(-Math.PI / 2)).multiply(qY((k / 5) * Math.PI * 2)).multiply(qX(-0.35));
      parts.push(paint(place(pb.geo, c, q), '#F3A7C4'));
    }
    const centre = place(shell(ellipsoid(0.045, 0.03, 0.045), undefined, [12, 8]), c.clone().add(V(0, 0.03, 0)).addScaledVector(out, 0.02));
    parts.push(paint(centre, '#F6C945'));
    meshes.push({ id: 'flor', structure: 'flor', geometry: merge(parts) });
    anchors.flower = [c];
  }

  // fruit hanging from the second node, cut open towards the viewer
  {
    const p = nodePos[1];
    const phi = VIEW_PHI - 1.35;
    const out = dirAt(phi);
    const stalkEnd = p.clone().addScaledVector(out, 0.36).add(V(0, -0.05, 0));
    const F = stalkEnd.clone().add(V(0, -0.26, 0));
    const stalk = [p.clone(), p.clone().addScaledVector(out, 0.22).add(V(0, 0.05, 0)), stalkEnd, F.clone().add(V(0, 0.2, 0))];
    const fruitDist = wobble(ellipsoid(0.27, 0.24, 0.27), 0.03, 4);
    const cut: Cut = { center: VIEW_PHI, width: Math.PI * 0.6 };
    const skin = paint(shell(fruitDist, cut, [44, 28]), '#E1533C');
    const flesh = paint(cutFaces(fruitDist, null, cut, 28), '#F7A07F');
    const calyx: THREE.BufferGeometry[] = [paint(taper(stalk, 0.02, 0.018, 16, 6, false), '#5E9B48')];
    for (let k = 0; k < 5; k++) {
      const s = blade({ length: 0.12, width: 0.03, shape: 'sepal', droop: 0.2 });
      calyx.push(paint(place(s.geo, F.clone().add(V(0, 0.22, 0)), bladeQuat((k / 5) * Math.PI * 2, -0.5)), '#5E9B48'));
    }
    meshes.push({ id: 'pericarpo', structure: 'pericarpo', geometry: merge([place(merge([skin, flesh]), F), ...calyx]) });
    // seeds lying on the two cut faces
    const seeds: THREE.BufferGeometry[] = [];
    for (const a of [cut.center - cut.width / 2, cut.center + cut.width / 2]) {
      const n = dirAt(a + Math.PI / 2); // plane normal
      for (let k = 0; k < 7; k++) {
        const rr = r.range(0.07, 0.17);
        const y = r.range(-0.12, 0.12);
        const pos = dirAt(a).multiplyScalar(rr).add(V(0, y, 0)).add(F);
        const g = shell(ellipsoid(0.028, 0.018, 0.012), undefined, [10, 6]);
        g.lookAt(n);
        seeds.push(place(g, pos));
      }
    }
    meshes.push({ id: 'semente', structure: 'semente', geometry: merge(seeds) });
    anchors.fruit = [F];
  }

  // roots: taproot + laterals
  const taproot = wiggle(r, V(0, -0.05, 0), V(0, -1, 0), 1.75, 8, 0.12);
  meshes.push({ id: 'raiz-principal', structure: 'raiz-principal', geometry: taper(taproot, 0.07, 0.012, 60, 8) });
  const tapCurve = new THREE.CatmullRomCurve3(taproot);
  const laterals: THREE.BufferGeometry[] = [];
  anchors.roots = [];
  for (let k = 0; k < 12; k++) {
    const t = 0.1 + (k / 12) * 0.7;
    const p = tapCurve.getPointAt(t);
    const phi = k * 2.4 + 0.3;
    const len = THREE.MathUtils.lerp(0.95, 0.35, t) * r.range(0.8, 1.15);
    const pts = wiggle(r, p, dirAt(phi, -0.55), len, 5, 0.22, 0.05);
    laterals.push(taper(pts, 0.03 * (1 - t * 0.5), 0.006, 28, 6));
    anchors.roots.push(pts[pts.length - 1]);
    // fine second-order roots
    for (let j = 0; j < 2; j++) {
      const q = new THREE.CatmullRomCurve3(pts).getPointAt(0.35 + j * 0.3);
      const sub = wiggle(r, q, dirAt(phi + (j ? 0.9 : -0.9), -0.6), len * 0.35, 3, 0.3);
      laterals.push(taper(sub, 0.009, 0.003, 10, 5));
    }
  }
  meshes.push({ id: 'raizes-laterais', structure: 'raizes-laterais', geometry: merge(laterals) });
  anchors.rootBase = [V(0, -0.15, 0)];
  anchors.sky = anchors.leaves.map((p) => p.clone().add(V(0.6, 2.2, 0.8)));

  return { meshes, anchors, preset: presetFor(13.5, [0, 0.85, 0], 0.22, VIEW_PHI) };
}

// ====================================================================== flower

function flower(): BuiltModel {
  const r = rng(5);
  const meshes: MeshDef[] = [];
  const anchors: BuiltModel['anchors'] = {};
  const TAU = Math.PI * 2;
  const facing = (phi: number) => Math.abs(Math.atan2(Math.sin(phi - VIEW_PHI), Math.cos(phi - VIEW_PHI)));

  meshes.push({ id: 'pedunculo', structure: 'pedunculo', geometry: taper([V(0, -2.3, 0), V(0.04, -1.4, 0.02), V(0, -0.3, 0)], 0.08, 0.07, 30, 10, false) });
  meshes.push({ id: 'receptaculo', structure: 'receptaculo', geometry: place(shell(ellipsoid(0.3, 0.2, 0.3), undefined, [28, 16]), [0, -0.2, 0]) });

  const sepals: THREE.BufferGeometry[] = [];
  for (let k = 0; k < 5; k++) {
    const phi = VIEW_PHI + Math.PI / 5 + (k / 5) * TAU;
    const b = blade({ length: 0.75, width: 0.2, droop: 0.15, cup: 0.35, shape: 'sepal' });
    sepals.push(place(b.geo, dirAt(phi).multiplyScalar(0.2).add(V(0, -0.2, 0)), bladeQuat(phi, -0.35)));
  }
  meshes.push({ id: 'sepalas', structure: 'sepalas', geometry: merge(sepals) });

  const petals: THREE.BufferGeometry[] = [];
  for (let k = 0; k < 5; k++) {
    const phi = VIEW_PHI + (k / 5) * TAU;
    if (facing(phi) < 0.3) continue; // removed to show the inside
    const b = blade({ length: 1.55, width: 0.5, droop: 0.1, cup: 0.22, shape: 'petal', twist: 0.15 });
    petals.push(place(b.geo, dirAt(phi).multiplyScalar(0.16).add(V(0, -0.06, 0)), bladeQuat(phi, 0.75)));
  }
  meshes.push({ id: 'petalas', structure: 'petalas', geometry: merge(petals) });

  const filaments: THREE.BufferGeometry[] = [];
  const anthers: THREE.BufferGeometry[] = [];
  const pollen: THREE.Vector3[] = [];
  anchors.anthers = [];
  for (let k = 0; k < 9; k++) {
    const phi = VIEW_PHI + 0.35 + (k / 9) * TAU;
    if (facing(phi) < 0.35) continue;
    const pts = [dirAt(phi).multiplyScalar(0.13).add(V(0, -0.06, 0)), dirAt(phi).multiplyScalar(0.26).add(V(0, 0.45, 0)), dirAt(phi).multiplyScalar(0.36).add(V(0, 0.98, 0))];
    filaments.push(taper(pts, 0.02, 0.014, 20, 6, false));
    const tip = pts[2];
    const dir = tip.clone().sub(pts[1]).normalize();
    const A = tip.clone().addScaledVector(dir, 0.1);
    const g = shell(ellipsoid(0.055, 0.12, 0.05), undefined, [14, 10]);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), dir));
    anthers.push(place(g, A));
    anchors.anthers.push(A);
    for (let j = 0; j < 9; j++) {
      const d = r.dir();
      pollen.push(A.clone().add(new THREE.Vector3(d.x * 0.06, d.y * 0.11, d.z * 0.06)));
    }
  }
  meshes.push({ id: 'filete', structure: 'filete', geometry: merge(filaments) });
  meshes.push({ id: 'antera', structure: 'antera', geometry: merge(anthers) });
  meshes.push({ id: 'graos-de-polen', structure: 'graos-de-polen', geometry: dots(pollen, 0.022, 1) });

  // pistil: ovary cut open, style and lobed stigma
  const O = V(0, 0.12, 0);
  const ovDist = ellipsoid(0.22, 0.28, 0.22);
  const ovInner = scaled(ovDist, 0.72);
  meshes.push({
    id: 'ovario',
    structure: 'ovario',
    geometry: place(merge([paint(shell(ovDist, CUT, [40, 24]), '#8CC063'), paint(shell(ovInner, CUT, [40, 24]), '#E4F2C9'), paint(cutFaces(ovDist, ovInner, CUT, 24), '#B9DC8E')]), O),
  });
  const ovules: THREE.Vector3[] = [];
  for (let k = 0; k < 10; k++) {
    const a = KEPT[0] + 0.15 + (k % 5) * 0.3 - (k > 4 ? 0 : 0);
    const side = k > 4 ? KEPT[1] - 0.15 - (k - 5) * 0.3 : a;
    ovules.push(dirAt(side).multiplyScalar(0.07).add(V(0, O.y - 0.13 + (k % 5) * 0.065, 0)));
  }
  meshes.push({ id: 'ovulos', structure: 'ovulos', geometry: dots(ovules, 0.04, 1) });
  anchors.ovules = ovules;
  const stylePts = [V(0, O.y + 0.26, 0), V(0.01, 0.75, 0), V(0, 1.18, 0)];
  meshes.push({ id: 'estilete', structure: 'estilete', geometry: taper(stylePts, 0.04, 0.032, 24, 8, false) });
  const stig: THREE.BufferGeometry[] = [place(shell(ellipsoid(0.07, 0.05, 0.07), undefined, [14, 10]), [0, 1.23, 0])];
  for (let k = 0; k < 3; k++) stig.push(place(shell(ellipsoid(0.055, 0.04, 0.055), undefined, [12, 8]), dirAt((k / 3) * TAU + 0.3).multiplyScalar(0.07).add(V(0, 1.25, 0))));
  meshes.push({ id: 'estigma', structure: 'estigma', geometry: merge(stig) });
  anchors.stigma = [V(0, 1.28, 0)];
  anchors.style = stylePts.slice().reverse();
  anchors.ovary = [O];
  anchors.sky = [V(-1.4, 2.4, 1.6), V(1.6, 2.2, 1.2), V(0.6, 2.6, -1.2)];

  return { meshes, anchors, preset: presetFor(7.4, [0, 0.1, 0], 0.32, VIEW_PHI) };
}

// ====================================================================== leaf cross-section block

const LEAF = { x: 1.6, z: 0.8, cuticle: 0.8, upper: 0.71, palTop: 0.62, palBot: 0.0, spTop: -0.06, spBot: -0.76, lower: -0.84 };
export const STOMATA = [V(-1.0, LEAF.lower, -0.25), V(0.95, LEAF.lower, 0.3)];
const VEIN = V(0, -0.4, 0);

function leafBlock(): BuiltModel {
  const r = rng(21);
  const meshes: MeshDef[] = [];
  const anchors: BuiltModel['anchors'] = {};
  meshes.push({ id: 'cuticula', structure: 'cuticula', geometry: place(roundBox(LEAF.x + 0.02, 0.025, LEAF.z + 0.02, 10, [30, 10]), [0, LEAF.cuticle, 0]) });

  const epid = (y: number, avoid: THREE.Vector3[]) => {
    const g: THREE.BufferGeometry[] = [];
    const nx = 11;
    const nz = 5;
    for (let i = 0; i < nx; i++)
      for (let j = 0; j < nz; j++) {
        const x = -LEAF.x + ((i + 0.5) / nx) * LEAF.x * 2 + (j % 2 ? 0.06 : -0.06);
        const z = -LEAF.z + ((j + 0.5) / nz) * LEAF.z * 2;
        if (avoid.some((s) => Math.hypot(s.x - x, s.z - z) < 0.2)) continue;
        if (Math.abs(x) > LEAF.x - 0.1) continue;
        g.push(place(roundBox(LEAF.x / nx - 0.008, 0.06, LEAF.z / nz - 0.008, 4), [x, y, z]));
      }
    return merge(g);
  };
  meshes.push({ id: 'epiderme-superior', structure: 'epiderme-superior', geometry: epid(LEAF.upper, []) });
  meshes.push({ id: 'epiderme-inferior', structure: 'epiderme-inferior', geometry: epid(LEAF.lower, STOMATA) });

  // palisade columns
  const pal: THREE.BufferGeometry[] = [];
  const chl: THREE.Vector3[] = [];
  const palH = (LEAF.palTop - LEAF.palBot) / 2;
  const palY = (LEAF.palTop + LEAF.palBot) / 2;
  const nx = 19;
  const nz = 9;
  anchors.palisade = [];
  for (let i = 0; i < nx; i++)
    for (let j = 0; j < nz; j++) {
      const x = -LEAF.x + ((i + 0.5) / nx) * LEAF.x * 2;
      const z = -LEAF.z + ((j + 0.5) / nz) * LEAF.z * 2;
      const hx = LEAF.x / nx - 0.012;
      const hz = LEAF.z / nz - 0.012;
      pal.push(place(roundBox(hx, palH - 0.01, hz, 3, [10, 8]), [x, palY, z]));
      for (let k = 0; k < 7; k++) {
        const a = r.range(0, Math.PI * 2);
        chl.push(V(x + Math.cos(a) * hx * 0.8, palY + r.range(-palH * 0.85, palH * 0.85), z + Math.sin(a) * hz * 0.8));
      }
      if ((i + j) % 9 === 0) anchors.palisade.push(V(x, palY + 0.1, z));
    }
  meshes.push({ id: 'parenquima-palicadico', structure: 'parenquima-palicadico', geometry: merge(pal) });

  // spongy cells with air spaces, avoiding the vein and the chambers above stomata
  const sp: THREE.BufferGeometry[] = [];
  anchors.spongy = [];
  for (let x = -LEAF.x + 0.16; x < LEAF.x - 0.1; x += 0.27)
    for (let z = -LEAF.z + 0.14; z < LEAF.z - 0.05; z += 0.27)
      for (const y of [-0.62, -0.4, -0.19]) {
        const p = V(x + r.range(-0.05, 0.05), y + r.range(-0.03, 0.03), z + r.range(-0.05, 0.05));
        if (Math.hypot(p.x - VEIN.x, p.y - VEIN.y) < 0.36) continue;
        if (STOMATA.some((s) => Math.hypot(s.x - p.x, s.z - p.z) < 0.2 && p.y < -0.5)) continue;
        if (r.next() < 0.12) continue;
        const g = surface(
          (u, v, out) => {
            const phi = u * Math.PI * 2;
            const th = v * Math.PI;
            const d = V(Math.sin(th) * Math.sin(phi), Math.cos(th), Math.sin(th) * Math.cos(phi));
            out.copy(d).multiplyScalar(wobble(ellipsoid(0.12, 0.09, 0.11), 0.12, x * 7 + z * 3 + y)(d));
          },
          12,
          8,
        );
        sp.push(place(g, p));
        for (let k = 0; k < 3; k++) chl.push(p.clone().add(r.dir().multiplyScalar(0.085)));
        if (r.next() < 0.3) anchors.spongy.push(p);
      }
  meshes.push({ id: 'parenquima-lacunoso', structure: 'parenquima-lacunoso', geometry: merge(sp) });
  meshes.push({ id: 'cloroplastos', structure: 'cloroplastos', geometry: dots(chl, 0.022, 0) });

  // vein running along Z: xylem vessels above, phloem below
  const along = (g: THREE.BufferGeometry, x: number, y: number) => {
    g.rotateX(Math.PI / 2);
    return place(g, [x, y, 0]);
  };
  const xy: THREE.BufferGeometry[] = [];
  anchors.xylem = [];
  for (const [dx, dy, rr] of [
    [-0.14, 0.08, 0.05],
    [0, 0.1, 0.06],
    [0.14, 0.08, 0.05],
    [-0.07, -0.02, 0.045],
    [0.07, -0.02, 0.045],
    [-0.2, -0.02, 0.035],
    [0.2, -0.02, 0.035],
  ]) {
    xy.push(along(sector(rr * 0.65, rr, 0, Math.PI * 2, -LEAF.z, LEAF.z, 18), VEIN.x + dx, VEIN.y + dy));
    anchors.xylem.push(V(VEIN.x + dx, VEIN.y + dy, LEAF.z * 0.6));
  }
  meshes.push({ id: 'xilema', structure: 'xilema', geometry: merge(xy) });
  const ph: THREE.BufferGeometry[] = [];
  anchors.phloem = [];
  for (let k = 0; k < 9; k++) {
    const dx = (k % 5) * 0.075 - 0.15 + (k > 4 ? 0.035 : 0);
    const dy = k > 4 ? -0.2 : -0.13;
    ph.push(along(sector(0.012, 0.03, 0, Math.PI * 2, -LEAF.z, LEAF.z, 12), VEIN.x + dx, VEIN.y + dy));
    anchors.phloem.push(V(VEIN.x + dx, VEIN.y + dy, LEAF.z * 0.6));
  }
  meshes.push({ id: 'floema', structure: 'floema', geometry: merge(ph) });

  // stomata: two bean-shaped guard cells around each pore
  for (const side of [-1, 1]) {
    const g = STOMATA.map((s) => {
      const cell = roundBox(0.055, 0.055, 0.15, 2.4, [14, 10]);
      // bend into a bean (concave towards the pore)
      const pos = cell.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < pos.count; i++) pos.setX(i, pos.getX(i) + side * 0.25 * pos.getZ(i) ** 2);
      cell.computeVertexNormals();
      return place(cell, [s.x + side * 0.075, s.y, s.z]);
    });
    meshes.push({ id: side < 0 ? 'guarda-esq' : 'guarda-dir', structure: 'celulas-guarda', geometry: merge(g) });
  }
  anchors.stomata = STOMATA.map((s) => s.clone());
  anchors.below = STOMATA.map((s) => s.clone().add(V(0, -0.9, 0.2)));
  anchors.chambers = STOMATA.map((s) => s.clone().add(V(0, 0.3, 0)));
  anchors.sky = [V(-0.8, 2.6, 0.6), V(0.4, 2.8, 0.2), V(1.0, 2.5, -0.4)];

  return { meshes, anchors, preset: presetFor(7.6, [0, -0.05, 0], 0.42, VIEW_PHI - 0.15) };
}

// ====================================================================== stem cross-section

function stemBlock(): BuiltModel {
  const meshes: MeshDef[] = [];
  const anchors: BuiltModel['anchors'] = {};
  const H = 1.25;
  const ring = (r0: number, r1: number) => sector(r0, r1, KEPT[0], KEPT[1], -H, H);
  meshes.push({ id: 'epiderme', structure: 'epiderme', geometry: ring(0.95, 1.0) });
  meshes.push({ id: 'cortex', structure: 'cortex', geometry: ring(0.72, 0.95) });
  meshes.push({ id: 'cambio-vascular', structure: 'cambio-vascular', geometry: ring(0.555, 0.59) });

  const N = 8;
  const w = 0.44;
  const xy: THREE.BufferGeometry[] = [];
  const ph: THREE.BufferGeometry[] = [];
  const rays: THREE.BufferGeometry[] = [ring(0, 0.36)];
  const openings: THREE.Vector3[] = [];
  anchors.xylem = [];
  anchors.phloem = [];
  for (let k = 0; k < N; k++) {
    const c = VIEW_PHI + Math.PI + (k / N) * Math.PI * 2;
    const arc = clipArc(c - w / 2, c + w / 2, KEPT);
    if (arc) {
      xy.push(sector(0.36, 0.555, arc[0], arc[1], -H, H));
      ph.push(sector(0.59, 0.72, arc[0], arc[1], -H, H));
      const mid = (arc[0] + arc[1]) / 2;
      for (let j = 0; j < 5; j++) {
        const rr = 0.4 + j * 0.033;
        const a = mid + ((j % 3) - 1) * 0.07;
        openings.push(dirAt(a).multiplyScalar(rr).setY(H + 0.004));
      }
      anchors.xylem.push(dirAt(mid).multiplyScalar(0.46));
      anchors.phloem.push(dirAt(mid).multiplyScalar(0.65));
    }
    // parenchyma rays between bundles
    const rayArc = clipArc(c + w / 2, c + (Math.PI * 2) / N - w / 2, KEPT);
    if (rayArc) {
      rays.push(sector(0.36, 0.555, rayArc[0], rayArc[1], -H, H));
      rays.push(sector(0.59, 0.72, rayArc[0], rayArc[1], -H, H));
    }
  }
  // vessel openings drawn on the top face of the xylem
  const disc = new THREE.CircleGeometry(0.014, 10);
  disc.rotateX(-Math.PI / 2);
  xy.push(paint(merge(openings.map((p) => place(disc.clone(), p))), '#5B3B2A'));
  meshes.push({ id: 'xilema', structure: 'xilema', cls: 'xilema-tons', geometry: merge(xy.map((g, i) => (i < xy.length - 1 ? paint(g, '#B2563F') : g))) });
  meshes.push({ id: 'floema', structure: 'floema', geometry: merge(ph) });
  meshes.push({ id: 'medula', structure: 'medula', geometry: merge(rays) });
  anchors.top = [V(0, H + 0.6, 0)];
  anchors.bottom = [V(0, -H - 0.6, 0)];
  anchors.height = [V(0, H, 0)];
  return { meshes, anchors, preset: presetFor(8.4, [0, -0.1, 0], 0.6, VIEW_PHI) };
}

// ====================================================================== root tip

function rootTip(): BuiltModel {
  const r = rng(31);
  const meshes: MeshDef[] = [];
  const anchors: BuiltModel['anchors'] = {};
  const R = 0.43;
  const Y0 = -0.35;
  const Y1 = 1.9;

  const capDist = ellipsoid(0.44, 0.6, 0.44);
  const cap = surface((u, v, out) => {
    const phi = u * Math.PI * 2;
    const th = Math.PI / 2 + v * (Math.PI / 2);
    const d = V(Math.sin(th) * Math.sin(phi), Math.cos(th), Math.sin(th) * Math.cos(phi));
    out.copy(d).multiplyScalar(capDist(d));
  }, 32, 12);
  meshes.push({ id: 'coifa', structure: 'coifa', geometry: place(cap, [0, -2.05, 0]) });
  meshes.push({ id: 'zona-meristematica', structure: 'zona-meristematica', geometry: sector(0, 0.41, 0, Math.PI * 2, -2.06, -1.45, 40) });
  meshes.push({ id: 'zona-de-alongamento', structure: 'zona-de-alongamento', geometry: sector(0, 0.42, 0, Math.PI * 2, -1.45, Y0, 40) });

  const ring = (r0: number, r1: number) => sector(r0, r1, KEPT[0], KEPT[1], Y0, Y1);
  meshes.push({ id: 'epiderme', structure: 'epiderme', geometry: ring(0.4, R) });
  meshes.push({ id: 'cortex', structure: 'cortex', geometry: ring(0.19, 0.4) });
  meshes.push({ id: 'endoderme', structure: 'endoderme', geometry: ring(0.165, 0.19) });
  meshes.push({ id: 'periciclo', structure: 'periciclo', geometry: ring(0.145, 0.165) });
  const xy: THREE.BufferGeometry[] = [ring(0, 0.05)];
  const ph: THREE.BufferGeometry[] = [];
  for (let k = 0; k < 4; k++) {
    const ca = Math.PI / 4 + (k * Math.PI) / 2;
    const arm = clipArc(ca - 0.24, ca + 0.24, KEPT);
    if (arm) xy.push(sector(0.04, 0.145, arm[0], arm[1], Y0, Y1));
    const cp = (k * Math.PI) / 2;
    const p = clipArc(cp - 0.5, cp + 0.5, KEPT);
    if (p) ph.push(sector(0.055, 0.14, p[0], p[1], Y0, Y1));
  }
  meshes.push({ id: 'xilema', structure: 'xilema', geometry: merge(xy) });
  meshes.push({ id: 'floema', structure: 'floema', geometry: merge(ph) });

  // root hairs on the maturation zone (not in the cut-away wedge)
  const hairs: THREE.BufferGeometry[] = [];
  anchors.hairTips = [];
  anchors.hairBases = [];
  for (let k = 0; k < 120; k++) {
    const a = r.range(KEPT[0] + 0.05, KEPT[1] - 0.05);
    const y = r.range(Y0 + 0.05, 1.35);
    const base = dirAt(a).multiplyScalar(R - 0.005).setY(y);
    const len = r.range(0.18, 0.42);
    const pts = wiggle(r, base, dirAt(a + r.range(-0.3, 0.3), r.range(-0.4, 0.15)), len, 3, 0.15);
    hairs.push(taper(pts, 0.011, 0.007, 10, 5));
    if (k % 6 === 0) {
      anchors.hairTips.push(pts[pts.length - 1]);
      anchors.hairBases.push(base);
    }
  }
  meshes.push({ id: 'pelos-absorventes', structure: 'pelos-absorventes', geometry: merge(hairs) });
  anchors.cortex = anchors.hairBases.map((b) => b.clone().multiplyScalar(0.6).setY(b.y));
  anchors.centre = anchors.hairBases.map((b) => V(0, b.y + 0.15, 0));
  anchors.up = [V(0, Y1 + 0.5, 0)];

  return { meshes, anchors, preset: presetFor(10.5, [0, -0.3, 0], 0.3, VIEW_PHI) };
}

// ====================================================================== seed (geometry posed by germination.ts)

export function buildPlantModel(id: Exclude<PlantModelId, 'semente'>): BuiltModel {
  switch (id) {
    case 'planta':
      return wholePlant();
    case 'flor':
      return flower();
    case 'folha':
      return leafBlock();
    case 'caule':
      return stemBlock();
    case 'raiz':
      return rootTip();
  }
}
