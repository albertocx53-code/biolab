/**
 * Sculpted stages of the butterfly's complete metamorphosis (a milkweed
 * butterfly): host leaf and twig, ribbed eggs, striped caterpillar, jade
 * chrysalis with gold dots and the adult with veined, spotted wings.
 * Procedural geometry written by BioLab 3D, painted with vertex colours.
 */
import * as THREE from 'three';
import { merge, paint, place, tube } from '@/laboratories/shared/geometry';
import { V } from './kit';
import { fbm, mix, pw, surface, sweep, vcolor } from './sculpt';

const smooth = (t: number) => {
  const k = Math.min(1, Math.max(0, t));
  return k * k * (3 - 2 * k);
};

// ------------------------------------------------------------------ leaf and twig

const LEAF_X0 = -4.4;
const LEAF_X1 = 4.3;
const LEAF_Y = -1.5;
const LEAF_Z = 0.2;
const leafW = (s: number) => 2.0 * Math.pow(Math.sin(Math.PI * Math.min(1, s * 0.98 + 0.02)), 0.75) * (1 - 0.32 * s);

/** Height of the leaf surface at (x, z): arched across the midrib, drooping to the tip. */
export function leafY(x: number, z: number) {
  const s = (x - LEAF_X0) / (LEAF_X1 - LEAF_X0);
  const w = Math.max(0.05, leafW(s));
  const v = (z - LEAF_Z) / w;
  return LEAF_Y - 0.32 * v * v - 0.35 * Math.pow(Math.max(0, s - 0.55) / 0.45, 2) + 0.05;
}

export function leaf() {
  const g = surface((u, v) => {
    const x = LEAF_X0 + u * (LEAF_X1 - LEAF_X0);
    const w = leafW(u);
    // slightly wavy margin
    const z = LEAF_Z + (v * 2 - 1) * w * (1 + 0.025 * Math.sin(u * 60));
    return V(x, leafY(x, z), z);
  }, 160, 40);
  vcolor(g, (p, _n, u, v) => {
    const across = Math.abs(v * 2 - 1);
    const c = mix('#2F6B3A', '#4E8F45', fbm(p, 1.5, 3));
    c.lerp(new THREE.Color('#9BC27A'), Math.exp(-(across * across) / 0.0012) * 0.9);
    // lateral veins curving towards the tip
    const lat = Math.abs(Math.sin((u * 9 - across * 0.9) * Math.PI));
    c.lerp(new THREE.Color('#78A862'), Math.pow(Math.max(0, 1 - lat / 0.08), 2) * 0.55 * smooth(across / 0.05) * (1 - smooth((across - 0.85) / 0.15)));
    // darker, yellowing margin
    c.lerp(new THREE.Color('#6B7A2E'), smooth((across - 0.9) / 0.1) * 0.5);
    return c;
  });
  const stalk = paint(tube([V(LEAF_X0 - 0.9, LEAF_Y + 0.35, LEAF_Z - 0.1), V(LEAF_X0 - 0.3, LEAF_Y + 0.08, LEAF_Z), V(LEAF_X0 + 0.15, leafY(LEAF_X0 + 0.15, LEAF_Z) + 0.02, LEAF_Z)], 0.07, false, 16, 8), '#6E9A4C');
  g.deleteAttribute('uv');
  return merge([g, stalk]);
}

export function twig(y: number) {
  const g = sweep([V(-5.2, y + 0.25, -0.6), V(-2, y + 0.05, -0.55), V(1, y, -0.5), V(5.2, y + 0.38, -0.4)], (t) => {
    const r = 0.17 - 0.06 * t;
    return { a: r, b: r * 1.05 };
  }, { rings: 120, radial: 18 });
  vcolor(g, (p) => {
    const c = mix('#4A3524', '#7A5A3E', fbm(p, 2.5, 3));
    // bark furrows along the twig and a few nodes
    c.multiplyScalar(0.85 + 0.2 * Math.abs(Math.sin(Math.atan2(p.y, p.z) * 7 + fbm(p, 1.2, 2) * 6)));
    c.lerp(new THREE.Color('#3A2A1C'), Math.exp(-((p.x - 2.6) ** 2) / 0.01) + Math.exp(-((p.x + 2.2) ** 2) / 0.01));
    return c;
  });
  g.deleteAttribute('uv');
  return g;
}

// ------------------------------------------------------------------ eggs

export function eggs() {
  const parts: THREE.BufferGeometry[] = [];
  const prof: THREE.Vector2[] = [];
  for (let i = 0; i <= 20; i++) {
    const s = i / 20;
    prof.push(new THREE.Vector2(Math.max(0.002, 0.13 * Math.pow(Math.sin(Math.PI * (0.5 + s * 0.5)) + 0.0, 0.55) * (1 - 0.15 * s)), s * 0.34));
  }
  const base = new THREE.LatheGeometry(prof, 28);
  vcolor(base, (p) => {
    const ribs = Math.pow(Math.abs(Math.cos(Math.atan2(p.x, p.z) * 11)), 8);
    return mix('#EFE6C8', '#FFFBEA', ribs).multiplyScalar(0.95 + 0.05 * (p.y / 0.26));
  });
  base.deleteAttribute('uv');
  for (let i = 0; i < 6; i++) {
    const x = -2.4 + (i % 3) * 0.34;
    const z = 0.1 + Math.floor(i / 3) * 0.34;
    parts.push(place(base.clone(), [x, leafY(x, z) - 0.01, z]));
  }
  return merge(parts);
}

// ------------------------------------------------------------------ caterpillar

const CAT_X0 = -1.75;
const CAT_X1 = 1.75;
const CAT_SEGS = 12;

/** Caterpillar along X at the origin, head at +X, legs reaching y ≈ −0.42. */
export function caterpillar() {
  const L = CAT_X1 - CAT_X0;
  const segOf = (x: number) => ((x - CAT_X0) / L) * CAT_SEGS;
  const body = sweep([V(CAT_X0, -0.02, 0), V(0, 0.02, 0), V(CAT_X1, 0, 0)], (t) => {
    const ph = (t * CAT_SEGS) % 1;
    const groove = 1 - 0.07 * Math.pow(Math.abs(Math.cos(Math.PI * ph)), 10);
    const r = 0.3 * pw(t, [[0, 0.55], [0.08, 0.92], [0.5, 1], [0.92, 0.98], [1, 0.8]]) * groove;
    return { a: r, b: r * 1.04, off: 0 };
  }, { rings: 300, radial: 36 });
  vcolor(body, (p, n) => {
    const ph = segOf(p.x) % 1;
    let c: THREE.Color;
    if (ph < 0.2) c = new THREE.Color('#141414');
    else if (ph < 0.32) c = new THREE.Color('#F4F1E6');
    else if (ph < 0.56) c = new THREE.Color('#F2C230');
    else if (ph < 0.68) c = new THREE.Color('#F4F1E6');
    else if (ph < 0.8) c = new THREE.Color('#141414');
    else c = new THREE.Color('#F4F1E6');
    // the belly is pale, with yellow spots above the prolegs
    const belly = smooth((-n.y - 0.35) / 0.3);
    c.lerp(new THREE.Color('#DCD8C2'), belly);
    return c.multiplyScalar(0.93 + 0.08 * fbm(p, 14, 1));
  });
  body.deleteAttribute('uv');
  const parts: THREE.BufferGeometry[] = [body];
  // head capsule with black and yellow stripes
  const head = new THREE.SphereGeometry(0.26, 28, 20).scale(0.9, 1, 1.05);
  vcolor(head, (p) => (Math.abs(Math.sin(p.y * 26 + p.x * 4)) > 0.55 ? new THREE.Color('#141414') : new THREE.Color('#F2C230')));
  head.deleteAttribute('uv');
  parts.push(place(head, [CAT_X1 + 0.1, -0.03, 0]));
  // filaments: long pair behind the head, short pair near the tail
  const fil = (x: number, len: number, lean: number) => {
    for (const s of [1, -1]) {
      const b = V(x, 0.26, s * 0.12);
      parts.push(paint(sweep([b, b.clone().add(V(lean * 0.3, len * 0.55, s * 0.12)), b.clone().add(V(lean * 0.75, len * 0.85, s * 0.2)), b.clone().add(V(lean, len, s * 0.24))], (t) => ({ a: 0.035 * (1 - 0.6 * t), b: 0.035 * (1 - 0.6 * t) }), { rings: 24, radial: 8 }), '#111111'));
    }
  };
  fil(CAT_X1 - (2 / CAT_SEGS) * L, 0.9, 0.55);
  fil(CAT_X0 + 0.25, 0.55, -0.35);
  // three pairs of pointed true legs under the thorax, five pairs of prolegs with dark crochets
  for (let k = 0; k < 3; k++) {
    const x = CAT_X1 - 0.3 - k * 0.27;
    for (const s of [1, -1]) parts.push(paint(sweep([V(x, -0.2, s * 0.12), V(x + 0.03, -0.32, s * 0.15), V(x + 0.07, -0.4, s * 0.15)], (t) => ({ a: 0.045 * (1 - 0.75 * t), b: 0.045 * (1 - 0.75 * t) }), { rings: 10, radial: 8 }), '#111111'));
  }
  for (const k of [4.5, 5.5, 6.5, 7.5]) {
    const x = CAT_X1 - (k / CAT_SEGS) * L;
    for (const s of [1, -1]) {
      parts.push(paint(sweep([V(x, -0.18, s * 0.15), V(x, -0.32, s * 0.17), V(x, -0.4, s * 0.17)], (t) => ({ a: 0.075 - 0.015 * t, b: 0.07 - 0.01 * t }), { rings: 10, radial: 12 }), '#E2DDC6'));
      parts.push(paint(place(new THREE.CylinderGeometry(0.06, 0.06, 0.03, 12), [x, -0.42, s * 0.17]), '#2A2A2A'));
    }
  }
  for (const s of [1, -1]) parts.push(paint(sweep([V(CAT_X0 + 0.15, -0.12, s * 0.13), V(CAT_X0 + 0.05, -0.3, s * 0.15), V(CAT_X0 + 0.0, -0.4, s * 0.15)], (t) => ({ a: 0.07, b: 0.06 }), { rings: 10, radial: 12 }), '#E2DDC6'));
  for (const g of parts) if (g.getAttribute('uv')) g.deleteAttribute('uv');
  return merge(parts);
}

// ------------------------------------------------------------------ chrysalis

/** Jade chrysalis hanging from its silk pad (pivot at the top, body along −Y). */
export function chrysalis() {
  const prof: THREE.Vector2[] = [];
  for (let i = 0; i <= 60; i++) {
    const s = i / 60;
    const r = 0.52 * pw(s, [[0, 0.12], [0.08, 0.55], [0.2, 0.72], [0.3, 0.8], [0.55, 1], [0.8, 0.85], [0.94, 0.5], [1, 0.02]]);
    prof.push(new THREE.Vector2(Math.max(0.002, r), -0.15 - s * 1.95));
  }
  const g = new THREE.LatheGeometry(prof.reverse(), 64);
  const spots: THREE.Vector3[] = [];
  for (let k = 0; k < 9; k++) spots.push(V(Math.sin(k * 0.7 - 1.2) * 0.5, -0.82 + 0.06 * Math.cos(k), Math.cos(k * 0.7 - 1.2) * 0.5));
  for (const a of [-0.5, 0.5]) spots.push(V(Math.sin(a) * 0.3, -1.95, Math.cos(a) * 0.3), V(Math.sin(a) * 0.44, -0.42, Math.cos(a) * 0.44));
  vcolor(g, (p) => {
    const c = mix('#5E9F6A', '#9FD3A3', smooth((p.z + 0.2) / 0.8) * 0.6 + 0.2 * fbm(p, 3, 2));
    // the dark-and-gold band of the abdomen and the wing-case outline
    const band = Math.exp(-((p.y + 0.78) ** 2) / 0.0012);
    c.lerp(new THREE.Color('#1E1E1E'), band * (p.z > 0 ? 0.9 : 0.6));
    c.lerp(new THREE.Color('#E2B53E'), Math.exp(-((p.y + 0.72) ** 2) / 0.0006) * 0.9);
    const wingCase = Math.exp(-((Math.abs(p.x) - 0.22 - 0.25 * smooth((-p.y - 0.85) / 0.8)) ** 2) / 0.0015) * (p.y < -0.85 ? 1 : 0) * (p.z > 0 ? 1 : 0);
    c.lerp(new THREE.Color('#4E8A5A'), wingCase * 0.6);
    for (const s of spots) c.lerp(new THREE.Color('#F0C24B'), Math.exp(-p.distanceToSquared(s) / 0.0018));
    return c;
  });
  g.deleteAttribute('uv');
  // black cremaster stalk with the silk pad
  const stalk = paint(sweep([V(0, 0.15, 0), V(0, 0.02, 0), V(0, -0.18, 0)], (t) => ({ a: 0.035 + 0.04 * t, b: 0.035 + 0.04 * t }), { rings: 10, radial: 10 }), '#151515');
  const pad = paint(place(new THREE.SphereGeometry(0.12, 14, 8).scale(1.4, 0.4, 1.2), [0, 0.15, 0]), '#F2F0EA');
  stalk.deleteAttribute('uv');
  return merge([g, stalk, pad]);
}

// ------------------------------------------------------------------ adult

/** Body at the origin along X (head at +X): striped abdomen, spotted thorax, clubbed antennae, legs. */
export function butterflyBody() {
  const parts: THREE.BufferGeometry[] = [];
  const abd = sweep([V(-1.35, 0.02, 0), V(-0.7, 0, 0), V(-0.1, 0, 0)], (t) => {
    const r = 0.13 * pw(t, [[0, 0.35], [0.25, 0.85], [0.8, 1], [1, 0.8]]) * (1 - 0.06 * Math.pow(Math.abs(Math.cos(t * 7 * Math.PI)), 6));
    return { a: r, b: r };
  }, { rings: 80, radial: 20 });
  vcolor(abd, (p, n) => (n.y < -0.4 && Math.abs(Math.sin(p.x * 22)) > 0.6 ? new THREE.Color('#E8E2D2') : mix('#151515', '#2A2422', fbm(p, 20, 1))));
  parts.push(abd);
  const thorax = new THREE.SphereGeometry(0.21, 24, 18).scale(1.55, 1, 1);
  vcolor(thorax, (p) => {
    const dots = Math.abs(Math.sin(p.x * 30) * Math.sin(p.z * 30)) > 0.85 && p.y > 0.05;
    return dots ? new THREE.Color('#F4F1E8') : mix('#141414', '#2E2925', fbm(p, 25, 1));
  });
  parts.push(place(thorax, [0.2, 0.02, 0]));
  const head = new THREE.SphereGeometry(0.15, 20, 14);
  vcolor(head, (p) => (Math.abs(Math.sin(p.y * 40)) > 0.85 ? new THREE.Color('#EFEAE0') : new THREE.Color('#151515')));
  parts.push(place(head, [0.62, 0.04, 0]));
  for (const s of [1, -1]) {
    // compound eyes, clubbed antennae, legs folded under the thorax
    parts.push(paint(place(new THREE.SphereGeometry(0.075, 14, 10), [0.68, 0.07, s * 0.09]), '#2B2B2B'));
    const ant = [V(0.7, 0.14, s * 0.05), V(1.1, 0.4, s * 0.25), V(1.5, 0.58, s * 0.45), V(1.72, 0.66, s * 0.55)];
    parts.push(paint(sweep(ant, (t) => {
      const club = smooth((t - 0.85) / 0.12);
      return { a: 0.018 + 0.03 * club, b: 0.018 + 0.03 * club };
    }, { rings: 40, radial: 8 }), '#151515'));
    for (let k = 0; k < 3; k++) {
      const x = 0.38 - k * 0.2;
      parts.push(paint(sweep([V(x, -0.12, s * 0.08), V(x + 0.05, -0.3, s * 0.22), V(x - 0.1 + k * 0.05, -0.55, s * 0.3)], () => ({ a: 0.018, b: 0.018 }), { rings: 16, radial: 6 }), '#1A1A1A'));
    }
  }
  // coiled proboscis
  const coil: THREE.Vector3[] = [];
  for (let i = 0; i <= 30; i++) {
    const a = i * 0.45;
    const r = 0.09 * (1 - i / 36);
    coil.push(V(0.72 + Math.sin(a) * r, -0.12 - (1 - Math.cos(a)) * r * 0.9, 0));
  }
  parts.push(paint(tube(coil, 0.012, false, 60, 5), '#1A1A1A'));
  for (const g of parts) if (g.getAttribute('uv')) g.deleteAttribute('uv');
  return merge(parts);
}

/**
 * One pair of wings in the XZ plane, hinged on the X axis and spreading to
 * side·Z: orange cells, black veins and margins with two rows of white spots,
 * and a black apex with orange and white spots on the forewing.
 */
export function butterflyWing(side: 1 | -1) {
  const wingPart = (base: THREE.Vector3, th0: number, th1: number, keys: [number, number][], fore: boolean) => {
    const g = surface((u, v) => {
      const th = th0 + u * (th1 - th0);
      const r = pw(u, keys) * v;
      return V(base.x + Math.cos(th) * r, base.y + 0.06 * v * v - (fore ? 0 : 0.02), base.z + Math.sin(th) * r);
    }, 90, 46);
    vcolor(g, (_p, _n, u, v) => {
      const th = th0 + u * (th1 - th0);
      const R = pw(u, keys);
      const arc = (k: number) => Math.abs(th - k) * R * v;
      // veins: radiating, with a closed discal cell near the base
      let vein = 0;
      const nV = fore ? 11 : 9;
      for (let k = 1; k < nV; k++) {
        const thk = th0 + (k / nV) * (th1 - th0) + 0.04 * Math.sin(k * 2.3) * v;
        if (v > (fore ? 0.42 : 0.38) || k % 3 === 0) vein = Math.max(vein, 1 - smooth((arc(thk) - 0.018) / 0.02));
      }
      vein = Math.max(vein, 1 - smooth((Math.abs(v - (fore ? 0.42 : 0.38)) * R - 0.015) / 0.02) * 1);
      const edge = Math.min(u, 1 - u) * (th1 - th0) * R * v;
      vein = Math.max(vein, 1 - smooth((edge - 0.035) / 0.03));
      // black margin band with two rows of white spots
      const marginV = 1 - 0.32 / R;
      const inMargin = smooth((v - marginV) / 0.02);
      const spot = (vRow: number, per: number) => {
        const ph = ((u * per) % 1) - 0.5;
        const d = Math.hypot(ph * (th1 - th0) * R / per, (v - vRow) * R);
        return 1 - smooth((d - 0.035) / 0.015);
      };
      const white = Math.max(spot(1 - 0.12 / R, fore ? 14 : 11), spot(1 - 0.24 / R, fore ? 12 : 9)) * inMargin;
      // forewing apex: black with a row of pale orange and white spots
      const apex = fore ? smooth((0.3 - u) / 0.05) * smooth((v - 0.6) / 0.04) : 0;
      const apexSpot = fore ? (1 - smooth((Math.hypot((u - 0.16) * 2.6, (v - 0.8) * 1.2) - 0.07) / 0.02)) * (Math.abs(Math.sin(u * 60)) > 0.3 ? 1 : 0) : 0;
      const c = mix('#E8761C', '#F29A2E', smooth((v - 0.2) / 0.6));
      c.lerp(new THREE.Color('#C9581A'), (1 - v) * 0.25);
      c.lerp(new THREE.Color('#121212'), Math.max(vein, inMargin, apex));
      c.lerp(new THREE.Color('#F7F3E8'), white);
      c.lerp(new THREE.Color('#F6C58A'), apexSpot * apex);
      return c;
    });
    g.deleteAttribute('uv');
    return g;
  };
  const fore = wingPart(V(0.22, 0.01, 0.05), 0.72, 2.05, [[0, 3.0], [0.12, 2.95], [0.35, 2.7], [0.6, 2.15], [0.85, 1.55], [1, 1.2]], true);
  const hind = wingPart(V(-0.05, -0.01, 0.05), 1.65, 2.95, [[0, 1.75], [0.3, 2.15], [0.6, 2.05], [0.85, 1.55], [1, 0.9]], false);
  const g = merge([fore, hind]);
  if (side === -1) g.scale(1, 1, -1);
  return g;
}
