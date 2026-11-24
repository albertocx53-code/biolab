/**
 * Sculpted sea star (Asteroidea): five tapering arms with a domed back covered
 * in white-tipped spines and soft papulae, an off-centre madreporite, red eye
 * spots at the arm tips and, underneath, ambulacral grooves with rows of tube
 * feet. Two arms and part of the disc are opened from above (a dissection
 * window) to show the water vascular system. Procedural geometry written by
 * BioLab 3D, painted with vertex colours.
 */
import * as THREE from 'three';
import { merge, paint, place, rng } from '@/laboratories/shared/geometry';
import type { MeshDef } from '@/laboratories/shared/types';
import { V } from './kit';
import { cutWindow, fbm, mix, surface, sweep, vcolor } from './sculpt';

const ARMS = 5;
const R = 3.7;
const Rd = 1.2;
const OPEN = [2, 3];
const smooth = (t: number) => {
  const k = Math.min(1, Math.max(0, t));
  return k * k * (3 - 2 * k);
};

/** Arm k points along (cos a, 0, −sin a), a = 2πk/5 + π/2 (arm 0 at the back). */
const armAngle = (k: number) => (k / ARMS) * Math.PI * 2 + Math.PI / 2;
export const armDir = (k: number) => V(Math.cos(armAngle(k)), 0, -Math.sin(armAngle(k)));
/** Outline radius at polar angle θ (measured like the arms). */
const rho = (th: number) => Rd + (R - Rd) * Math.pow(0.5 + 0.5 * Math.cos(ARMS * (th - Math.PI / 2)), 1.9);
const polar = (p: THREE.Vector3) => {
  const th = Math.atan2(-p.z, p.x);
  const d = Math.hypot(p.x, p.z);
  return { th, d, v: d / rho(th) };
};
/** Distance to the midline of the nearest arm, and which arm. */
function armFrame(p: THREE.Vector3) {
  let best = 0;
  let bestDot = -Infinity;
  for (let k = 0; k < ARMS; k++) {
    const dt = armDir(k).dot(V(p.x, 0, p.z));
    if (dt > bestDot) {
      bestDot = dt;
      best = k;
    }
  }
  const d = armDir(best);
  const along = d.x * p.x + d.z * p.z;
  const lateral = -d.z * p.x + d.x * p.z;
  return { k: best, along, lateral };
}

const H_TOP = 0.85;
const H_BOT = 0.28;
const edge = (v: number) => Math.pow(Math.max(0, 1 - v * v), 0.42);
export const topY = (d: number, v: number) => 0.06 + H_TOP * (1 - 0.6 * Math.min(1, d / R)) * edge(v);
const grooveW = (along: number) => 0.24 * (1 - 0.55 * Math.min(1, along / R));
export function botY(p: THREE.Vector3, v: number, d: number) {
  const { along, lateral } = armFrame(p);
  let y = 0.06 - H_BOT * (1 - 0.5 * Math.min(1, d / R)) * edge(v);
  // ambulacral groove along the underside of each arm
  const w = grooveW(along);
  if (along > Rd * 0.45) y += 0.2 * Math.max(0, 1 - (lateral / w) ** 2) * smooth((along - Rd * 0.45) / 0.3) * edge(v);
  return y;
}

const at = (u: number, v: number) => {
  const th = u * Math.PI * 2;
  const r = v * rho(th);
  return { th, r, x: Math.cos(th) * r, z: -Math.sin(th) * r };
};

export function seaStarMeshes(): MeshDef[] {
  const rnd = rng(21);
  const meshes: MeshDef[] = [];

  // ---------------------------------------------------------------- aboral (top) surface
  const top = surface((u, v) => {
    const { x, z, r } = at(u, v);
    return V(x, topY(r, v), z);
  }, 400, 90);
  {
    // knobbly ossicles under the skin
    const pos = top.getAttribute('position');
    const q = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      q.fromBufferAttribute(pos, i);
      const { v } = polar(q);
      const bump = Math.pow(Math.max(0, fbm(q.clone().multiplyScalar(1), 4.5, 2) - 0.48), 1.4) * 0.22 * smooth((0.97 - v) / 0.1);
      pos.setY(i, q.y + bump);
    }
    top.computeVertexNormals();
  }
  const mad = armDir(0).add(armDir(1)).normalize().multiplyScalar(0.72);
  vcolor(top, (p) => {
    const { v, d } = polar(p);
    const { along } = armFrame(p);
    // orange body with a darker reticulated network and paler papulae fields
    const net = Math.abs(fbm(p, 3.2, 3) - 0.5) < 0.05 ? 1 : 0;
    const c = mix('#C2471E', '#E8792C', fbm(p, 1.4, 3));
    c.lerp(new THREE.Color('#8E2E16'), net * 0.55);
    c.lerp(new THREE.Color('#F0A15E'), smooth((fbm(p.clone().addScalar(9), 9, 2) - 0.6) / 0.08) * 0.45);
    // lighter rim and red eye spots at the arm tips
    c.lerp(new THREE.Color('#F2B37A'), smooth((v - 0.86) / 0.12) * 0.5);
    c.lerp(new THREE.Color('#C8102E'), smooth((along - R + 0.1) / 0.06) * 0.85);
    // the madreporite area is paler
    c.lerp(new THREE.Color('#E9B66B'), Math.exp(-((p.x - mad.x) ** 2 + (p.z - mad.z) ** 2) / 0.09) * 0.6);
    void d;
    return c;
  });
  // dissection window over two arms and the disc between them
  // (bounded by lines of the surface grid, so the cut edge is clean)
  const angGap = (a: number, b: number) => Math.abs(((((a - b) % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
  const th2 = armAngle(OPEN[0]);
  const th3 = armAngle(OPEN[1]);
  const mid = (th2 + th3) / 2;
  const opened = (c: THREE.Vector3) => {
    const { th, v } = polar(c);
    const onArm = Math.min(angGap(th, th2), angGap(th, th3)) < 0.16;
    if (onArm) return v > 0.2 && v < 0.8;
    return angGap(th, mid) < angGap(th2, mid) && v > 0.2 && v < 0.62;
  };
  const topRim = cutWindow(top, opened, 0.05, '#E0A070');
  top.deleteAttribute('uv');
  meshes.push({ id: 'st-aboral', structure: 'face-aboral', geometry: merge([top, topRim]) });

  // ---------------------------------------------------------------- spines and madreporite
  const spines: THREE.BufferGeometry[] = [];
  const tip = new THREE.Color('#FFF5E4');
  const base = new THREE.Color('#E79A55');
  let n = 0;
  for (let i = 0; i < 4000 && n < 1100; i++) {
    const u = rnd.next();
    const v = Math.sqrt(rnd.next()) * 0.92;
    const { x, z, r } = at(u, v);
    const p = V(x, topY(r, v), z);
    if (opened(p)) continue;
    // the spines line up in rows along each arm
    const { lateral } = armFrame(p);
    if (r > Rd * 0.8 && Math.abs(Math.sin(lateral * 9)) > 0.55 && rnd.next() < 0.7) continue;
    const e = 0.01;
    const pu = V(at(u + e / 6, v).x, topY(at(u + e / 6, v).r, v), at(u + e / 6, v).z);
    const pv = V(at(u, v + e).x, topY(at(u, v + e).r, v + e), at(u, v + e).z);
    const nrm = new THREE.Vector3().crossVectors(pu.sub(p), pv.sub(p)).normalize();
    if (nrm.y < 0) nrm.negate();
    const h = 0.07 + 0.06 * rnd.next();
    const cone = new THREE.ConeGeometry(0.032, h, 6);
    const pos = cone.getAttribute('position');
    const col = new Float32Array(pos.count * 3);
    for (let j = 0; j < pos.count; j++) {
      const c = base.clone().lerp(tip, smooth((pos.getY(j) + h / 2) / h));
      col.set([c.r, c.g, c.b], j * 3);
    }
    cone.setAttribute('color', new THREE.BufferAttribute(col, 3));
    cone.deleteAttribute('uv');
    spines.push(place(cone, p.clone().addScaledVector(nrm, h * 0.35 + 0.01), new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), nrm)));
    n++;
  }
  meshes.push({ id: 'st-espinhos', structure: 'espinhos', geometry: merge(spines) });

  const madG = new THREE.SphereGeometry(0.2, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.35, 1);
  vcolor(madG, (p) => {
    // sieve plate: fine winding furrows
    const a = Math.atan2(p.z, p.x);
    const r = Math.hypot(p.x, p.z);
    const furrow = Math.abs(Math.sin(a * 9 + r * 40)) > 0.75 ? 1 : 0;
    return mix('#F1D9A0', '#B78A4A', furrow * 0.8);
  });
  madG.deleteAttribute('uv');
  const madP = V(mad.x, topY(mad.length(), mad.length() / rho(Math.atan2(-mad.z, mad.x))) + 0.02, mad.z);
  meshes.push({ id: 'st-madreporito', structure: 'madreporito', geometry: place(madG, madP) });

  // ---------------------------------------------------------------- oral (bottom) surface
  const bot = surface((u, v) => {
    const { x, z, r } = at(u, v);
    const p = V(x, 0, z);
    return V(x, botY(p, v, r), z);
  }, 400, 90);
  vcolor(bot, (p) => {
    const { along, lateral } = armFrame(p);
    const c = mix('#E9B27A', '#F4CFA0', fbm(p, 2, 2));
    const w = grooveW(along);
    c.lerp(new THREE.Color('#D98A4E'), Math.abs(lateral) < w * 1.25 && along > Rd * 0.45 ? 0.6 : 0);
    // the inside floor seen through the window is the body cavity lining
    return c;
  });
  bot.deleteAttribute('uv');
  meshes.push({ id: 'st-oral', structure: 'face-oral', geometry: bot });
  meshes.push({ id: 'st-boca', structure: 'boca', geometry: paint(place(new THREE.SphereGeometry(0.3, 28, 10, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.25, 1).rotateX(Math.PI), [0, 0.06 - H_BOT + 0.02, 0]), '#7A3A2A') });

  // ---------------------------------------------------------------- water vascular system and tube feet
  const wv: THREE.BufferGeometry[] = [];
  const feet: THREE.BufferGeometry[] = [];
  const canalY = 0.12;
  // stone canal from the madreporite down to the ring canal
  wv.push(sweep([madP.clone().add(V(0, -0.05, 0)), mad.clone().multiplyScalar(0.85).add(V(0, 0.32, 0)), mad.clone().normalize().multiplyScalar(0.6).add(V(0, canalY + 0.03, 0))], () => ({ a: 0.045, b: 0.045 }), { rings: 20, radial: 10 }));
  wv.push(new THREE.TorusGeometry(0.6, 0.075, 12, 64).rotateX(Math.PI / 2).translate(0, canalY, 0));
  for (let k = 0; k < ARMS; k++) {
    const d = armDir(k);
    const side = V(-d.z, 0, d.x);
    const L = R - 0.45;
    wv.push(sweep([d.clone().multiplyScalar(0.6).setY(canalY), d.clone().multiplyScalar(L).setY(canalY - 0.02)], (t) => ({ a: 0.06 * (1 - 0.5 * t), b: 0.06 * (1 - 0.5 * t) }), { rings: 30, radial: 10 }));
    for (let i = 0; i < 16; i++) {
      const s = 0.85 + i * 0.165;
      if (s > L - 0.1) break;
      const taper = 1 - 0.5 * (s / R);
      for (const sd of [1, -1])
        for (const row of [0, 1]) {
          const w = (0.09 + row * 0.08) * taper;
          const b = d.clone().multiplyScalar(s + row * 0.07).addScaledVector(side, sd * w);
          const yTop = topY(s, s / R);
          // ampulla: a bulb above the canal, inside the arm
          wv.push(place(new THREE.SphereGeometry(0.06 * taper + 0.015, 10, 8), b.clone().setY(Math.min(yTop - 0.12, canalY + 0.12)), undefined, V(1, 1.5, 1)));
          // tube foot: out of the groove, bending outwards, with a suction disc
          const roof = canalY - 0.07;
          const footEnd = b.clone().addScaledVector(side, sd * 0.1).setY(roof - 0.42 * taper);
          feet.push(sweep([b.clone().setY(roof), b.clone().addScaledVector(side, sd * 0.03).setY(roof - 0.2 * taper), footEnd], (t) => ({ a: 0.035 * taper + 0.008 - 0.006 * t, b: 0.035 * taper + 0.008 - 0.006 * t }), { rings: 10, radial: 8, caps: false }));
          feet.push(place(new THREE.CylinderGeometry(0.05 * taper + 0.012, 0.045 * taper + 0.01, 0.03, 12), footEnd));
        }
    }
  }
  for (const g of [...wv, ...feet]) if (g.getAttribute('uv')) g.deleteAttribute('uv');
  meshes.push({ id: 'st-ambulacral', structure: 'sistema-ambulacral', geometry: vcolor(merge(wv), (p) => mix('#E9D7B8', '#F7EEDC', fbm(p, 8, 1))) });
  meshes.push({ id: 'st-pes', structure: 'pes-ambulacrais', geometry: vcolor(merge(feet), (p) => mix('#E8B98A', '#F6DDBE', fbm(p, 10, 1))) });
  return meshes;
}
