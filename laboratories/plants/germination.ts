/**
 * Bean seed opened in half and its germination (epigeal), posed every frame
 * from the process progress P (0 = opened seed, 5 = seedling). Schematic and
 * strongly time-compressed: real germination takes days.
 */
import * as THREE from 'three';
import { presetFor, type BuiltModel, type MeshDef } from '@/laboratories/shared/types';
import { ellipsoid, merge, paint, place, shell, type DistFn } from '@/laboratories/shared/geometry';
import { blade, roundBox, surface, taper } from './shapes';
import { VIEW_PHI } from './models';

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const X = V(1, 0, 0);
const ss = (e0: number, e1: number, x: number) => THREE.MathUtils.smoothstep(x, e0, e1);

/** Seed shape relative to its centre (slightly kidney-shaped). */
const base = ellipsoid(0.62, 0.38, 0.42);
const seedDist: DistFn = (d) => base(d) * (1 - 0.1 * Math.max(0, -d.y) ** 2 * Math.max(0, 1 - Math.abs(d.x) * 1.6));

/** The embryo axis (hinge of everything posed) sits near the bottom of the seed. */
const CENTRE = V(0, 0.3, 0); // seed centre relative to the hinge
const LID_HINGE = V(0.6, 0.3, 0); // right end, where the front half opens like a book
const ROOT_LEN = 1.75;
const HYPO_LEN = 1.85;
const HYPO_SEED = 0.06; // hypocotyl scale inside the seed
const ROOT_SEED = 0.035;
const G_OPEN = V(-0.65, 0.12, 0.25); // opened seed lying on the soil
const G_SOWN = V(0, -0.72, 0); // sown seed (hinge position)

/** Half of the seed (z ≥ 0 when side = 1): dome + flat face, relative to the hinge. */
function half(dist: DistFn, side: 1 | -1, domeColor: string, faceColor: string | null) {
  const dome = surface((u, v, out) => {
    const phi = -Math.PI / 2 + u * Math.PI + (side < 0 ? Math.PI : 0);
    const th = v * Math.PI;
    const d = V(Math.sin(th) * Math.sin(phi), Math.cos(th), Math.sin(th) * Math.cos(phi));
    out.copy(d).multiplyScalar(dist(d));
  }, 28, 18);
  const face = surface((u, v, out) => {
    const a = u * Math.PI * 2;
    const d = V(Math.sin(a), Math.cos(a), 0);
    out.copy(d).multiplyScalar(dist(d) * v);
    out.z = side * 0.001;
  }, 40, 6);
  return place(faceColor ? merge([paint(dome, domeColor), paint(face, faceColor)]) : paint(dome, domeColor), CENTRE);
}

export interface SeedModel extends BuiltModel {
  pose(P: number, get: (id: string) => THREE.Mesh | undefined): void;
}

export function buildSeed(): SeedModel {
  const meshes: MeshDef[] = [];
  const coat = (d: THREE.Vector3) => seedDist(d);
  const cot = (d: THREE.Vector3) => seedDist(d) * 0.93;

  meshes.push({ id: 'solo', structure: 'solo', geometry: place(roundBox(1.25, 1.25, 1.0, 6, [40, 24]), [0, -1.25, 0]) });
  meshes.push({ id: 'tegumento-a', structure: 'tegumento', geometry: half(coat, 1, '#8E3B2C', null) });
  meshes.push({ id: 'tegumento-b', structure: 'tegumento', geometry: half(coat, -1, '#8E3B2C', null) });
  meshes.push({ id: 'cotiledone-a', structure: 'cotiledones', geometry: half(cot, 1, '#F1DFAE', '#F7EBC8') });
  meshes.push({ id: 'cotiledone-b', structure: 'cotiledones', geometry: half(cot, -1, '#F1DFAE', '#F7EBC8') });

  // primary root (from the radicle), built pointing down from the hinge; posed by scaling Y
  const root = taper(
    Array.from({ length: 9 }, (_, i) => V(Math.sin(i * 0.9) * 0.03, -(i / 8) * ROOT_LEN, Math.cos(i * 1.3) * 0.02)),
    0.055,
    0.014,
    50,
    8,
  );
  meshes.push({ id: 'radicula', structure: 'radicula', geometry: root });
  const lat: THREE.BufferGeometry[] = [];
  for (let k = 0; k < 9; k++) {
    const y = -0.35 - k * 0.13;
    const phi = k * 2.3;
    const d = V(Math.sin(phi), -0.5, Math.cos(phi)).normalize();
    const len = 0.55 - k * 0.035;
    lat.push(taper([V(0, y, 0), V(0, y, 0).addScaledVector(d, len * 0.5).add(V(0, -0.02, 0)), V(0, y, 0).addScaledVector(d, len).add(V(0, -0.08, 0))], 0.018, 0.005, 14, 5));
  }
  meshes.push({ id: 'raizes-da-plantula', structure: 'radicula', geometry: merge(lat) });

  // hypocotyl, built pointing up from its base
  meshes.push({ id: 'hipocotilo', structure: 'hipocotilo', geometry: taper([V(0, 0, 0), V(0.01, HYPO_LEN * 0.5, 0), V(0, HYPO_LEN, 0)], 0.05, 0.045, 30, 8, false) });

  // plumule: two folded first leaves at the hinge, inside the seed
  const leaves: THREE.BufferGeometry[] = [paint(taper([V(0, 0, 0), V(0, 0.06, 0)], 0.03, 0.025, 4, 6, false), '#7DB65A')];
  for (const s of [-1, 1]) {
    const b = blade({ length: 0.12, width: 0.05, cup: 0.3, droop: 0.05, shape: 'leaf' });
    const q = new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), s > 0 ? Math.PI / 2 : -Math.PI / 2).multiply(new THREE.Quaternion().setFromAxisAngle(X, -1.0));
    leaves.push(paint(place(b.geo, V(0, 0.05, 0), q), '#7DB65A'));
  }
  meshes.push({ id: 'plumula', structure: 'plumula', geometry: merge(leaves) });

  const anchors: BuiltModel['anchors'] = {
    soil: [V(-1.2, -0.5, 0.6), V(1.1, -0.8, -0.4), V(0.6, -1.6, 0.8), V(-0.8, -1.9, -0.5)],
    seed: [G_SOWN.clone().add(CENTRE)],
    sky: [V(-1, 3, 1), V(1.2, 3.2, 0.4)],
  };

  const _q = new THREE.Quaternion();
  const _p = new THREE.Vector3();

  function pose(P: number, get: (id: string) => THREE.Mesh | undefined) {
    const set = (id: string, pos: THREE.Vector3, quat: THREE.Quaternion, scale: number | THREE.Vector3) => {
      const m = get(id);
      if (!m) return;
      m.position.copy(pos);
      m.quaternion.copy(quat);
      if (typeof scale === 'number') m.scale.setScalar(Math.max(scale, 1e-4));
      else m.scale.set(Math.max(scale.x, 1e-4), Math.max(scale.y, 1e-4), Math.max(scale.z, 1e-4));
      m.updateMatrixWorld();
    };
    const close = ss(0, 1, P); // 1. imbibition: the seed is closed, sown and swells
    const rootGrow = ss(1, 2, P) * 0.45 + ss(2, 3, P) * 0.55; // 2–3. radicle → root
    const lateral = ss(2.2, 3, P);
    const hypo = ss(3, 4, P); // 4. hypocotyl lifts the seed
    const open = ss(4, 5, P); // 5. cotyledons open, coat falls, first leaves

    const swell = 1 + 0.1 * close;
    const sown = G_OPEN.clone().lerp(G_SOWN, close);
    const hypoScale = HYPO_SEED + (1 - HYPO_SEED) * hypo;
    const baseY = sown.y - HYPO_LEN * HYPO_SEED; // bottom of the hypocotyl
    const B = V(sown.x, baseY, sown.z);
    const G = V(sown.x, baseY + HYPO_LEN * hypoScale, sown.z); // hinge / top of the hypocotyl
    // hook while emerging, upright when done
    const hook = new THREE.Quaternion().setFromAxisAngle(X, 1.1 * Math.sin(Math.PI * hypo) * (1 - open));
    const groupQ = hook;

    // front half opens like a book before sowing
    const lid = new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), 2.75 * (1 - close));
    const placeIn = (id: string, local: THREE.Quaternion, hinge: THREE.Vector3, extra: THREE.Vector3 = V(0, 0, 0), s = swell) => {
      // world = G + groupQ * (hinge*s + local * (v - hinge) * s)
      const q = groupQ.clone().multiply(local);
      _p.copy(hinge).multiplyScalar(s).sub(hinge.clone().multiplyScalar(s).applyQuaternion(local)).applyQuaternion(groupQ);
      set(id, G.clone().add(_p).add(extra), q, s);
    };

    // seed coat: falls to the ground during step 5 and lies there, split in two halves
    const ground = (dx: number, dz: number) => V(dx * open, (-0.06 - G.y) * open, dz * open);
    const flat = new THREE.Quaternion().setFromAxisAngle(X, (-Math.PI / 2) * open);
    placeIn('tegumento-a', lid.clone().multiply(flat), close < 1 ? LID_HINGE : V(0, 0, 0), ground(0.85, 0.55), swell * (1 - 0.25 * open));
    placeIn('tegumento-b', flat.clone().multiply(new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), 0.9 * open)), V(0, 0, 0), ground(-0.9, 0.35), swell * (1 - 0.25 * open));
    // cotyledons: follow the seed, then spread like wings around the hinge
    const spread = 1.15 * open;
    // (before sowing it hinges with its coat half; after the hook it spreads around the axis)
    placeIn('cotiledone-a', lid.clone().multiply(new THREE.Quaternion().setFromAxisAngle(X, spread)), close < 1 ? LID_HINGE : V(0, 0, 0));
    placeIn('cotiledone-b', new THREE.Quaternion().setFromAxisAngle(X, -spread), V(0, 0, 0));
    _q.copy(groupQ);
    set('plumula', G, _q, 1 + 3.2 * open);
    set('hipocotilo', B, new THREE.Quaternion(), V(1, hypoScale, 1));
    set('radicula', B, new THREE.Quaternion(), V(1, ROOT_SEED + (1 - ROOT_SEED) * rootGrow, 1));
    set('raizes-da-plantula', B, new THREE.Quaternion(), V(lateral, ROOT_SEED + (1 - ROOT_SEED) * rootGrow, lateral));
  }

  return { meshes, anchors, preset: presetFor(9.5, [0, -0.1, 0], 0.3, VIEW_PHI), pose };
}
