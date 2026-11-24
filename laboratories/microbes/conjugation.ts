/**
 * Animated scenes about bacteria and their genes: conjugation (a plasmid copy
 * passes from a donor to a recipient through the sex pilus) and selection of
 * antibiotic-resistant bacteria in a Petri dish.
 */
import * as THREE from 'three';
import type { CameraPreset } from '@/components/3d/CameraRig';
import { bentCapsule, paint, place, rng, tube, type Cut } from '@/laboratories/shared/geometry';
import type { MeshDef } from '@/laboratories/shared/types';
import { bacillus, c, LAY_X } from './kit';
import { colorize } from './materials';

type Get = (id: string) => THREE.Object3D | undefined;
const hide = (o: THREE.Object3D | undefined) => o && o.scale.setScalar(0.0001);
const ease = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

// ===================================================================== conjugation

export const CONJUGATION_PRESET: CameraPreset = { position: [0.3, 3.4, 17.5], target: [0.3, 0.2, 0], distance: 17.5, minDistance: 2, maxDistance: 36 };
const CUT: Cut = { center: 0, width: Math.PI * 0.9 };
const H = 1.7;
const RAD = 1.15;
const DONOR_X = -3.3;
const END = H + RAD; // half length of a cell
const BEADS = 8;

function cell(prefix: string, seed: number, plasmid: boolean): MeshDef[] {
  const b = bacillus(rng(seed), H, RAD, CUT, { ribosomes: 180, dnaSteps: 200, plasmids: 0 });
  const list: MeshDef[] = [
    { id: `${prefix}-parede`, structure: 'parede-bacteriana', geometry: b.wallG },
    { id: `${prefix}-membrana`, structure: 'membrana-plasmatica', geometry: b.membraneG },
    { id: `${prefix}-dna`, structure: 'nucleoide', geometry: b.dnaG },
    { id: `${prefix}-ribos`, structure: 'ribossomos', geometry: b.ribosomesG },
  ];
  for (const m of list) m.geometry.applyQuaternion(LAY_X);
  if (plasmid) list.push({ id: `${prefix}-plasmideo`, structure: 'plasmideo', geometry: paint(new THREE.TorusGeometry(0.42, 0.065, 8, 36), c('plasmideo')) });
  return list;
}

export function buildConjugation() {
  const meshes: MeshDef[] = [...cell('doadora', 3, true), ...cell('receptora', 4, true)];
  // sex pilus: a unit-length tube along +X, stretched by the pose
  meshes.push({ id: 'pilus', structure: 'pilus-sexual', geometry: paint(new THREE.CylinderGeometry(0.09, 0.09, 1, 10).rotateZ(Math.PI / 2).translate(0.5, 0, 0), c('pilus-sexual')) });
  meshes.push({ id: 'pilus-2', structure: 'pilus-sexual', geometry: paint(new THREE.CylinderGeometry(0.08, 0.08, 1, 10).rotateZ(Math.PI / 2).translate(0.5, 0, 0), c('pilus-sexual')) });
  // the single DNA strand that travels to the recipient
  for (let i = 0; i < BEADS; i++) meshes.push({ id: `fita-${i}`, structure: 'plasmideo', geometry: paint(new THREE.SphereGeometry(0.11, 10, 8), c('plasmideo')) });
  const arc: THREE.Vector3[] = [];
  for (let i = 0; i <= 30; i++) {
    const a = (i / 30) * Math.PI * 2;
    arc.push(new THREE.Vector3(Math.cos(a) * 0.42, Math.sin(a) * 0.42, 0));
  }
  meshes.push({ id: 'fita-recebida', structure: 'plasmideo', geometry: paint(tube(arc, 0.04, true, 90, 5), '#F4A28C') });
  return { meshes: colorize(meshes) };
}

function placeCell(get: Get, prefix: string, x: number) {
  for (const part of ['parede', 'membrana', 'dna', 'ribos']) {
    const o = get(`${prefix}-${part}`);
    if (o) {
      o.position.set(x, 0, 0);
      o.scale.setScalar(1);
    }
  }
}

/** Conjugation (5 steps): pilus, contact, transfer of one strand, synthesis, two donors. */
export function poseConjugation(P: number, get: Get) {
  const step = Math.min(4, Math.floor(P));
  const t = P - step;
  const recX = step === 0 ? 4.6 : step === 1 ? 4.6 - 1.0 * ease(t) : step < 4 ? 3.6 : 3.6 + 1.0 * ease(t);
  const donX = step < 4 ? DONOR_X : DONOR_X - 0.6 * ease(t);
  placeCell(get, 'doadora', donX);
  placeCell(get, 'receptora', recX);
  const dp = get('doadora-plasmideo');
  if (dp) {
    dp.position.set(donX + 0.9, 0.2, 0.3);
    dp.rotation.set(0.3, 0.2, step === 2 ? t * 6 : 0);
    dp.scale.setScalar(1);
  }
  const pilus = get('pilus');
  const from = donX + END - 0.05;
  const to = recX - END + 0.05;
  if (pilus) {
    pilus.position.set(from, 0.15, 0);
    pilus.rotation.set(0, 0, 0);
    const reach = step === 0 ? ease(t) * (to - from) : to - from;
    if (step === 4) pilus.scale.setScalar(0.0001);
    else pilus.scale.set(Math.max(0.0001, reach), step >= 1 ? 1 + 1.8 * ease(step === 1 ? t : 1) : 1, step >= 1 ? 1 + 1.8 * ease(step === 1 ? t : 1) : 1);
  }
  // one strand of the plasmid travels through the bridge
  for (let i = 0; i < BEADS; i++) {
    const b = get(`fita-${i}`);
    if (!b) continue;
    const k = step === 2 ? clamp01(t * 1.6 - i * 0.08) : 0;
    if (step !== 2 || k <= 0 || k >= 1) {
      hide(b);
      continue;
    }
    b.scale.setScalar(1);
    b.position.set(THREE.MathUtils.lerp(from - 0.6, to + 0.6, k), 0.15 + Math.sin(k * Math.PI) * 0.1, 0);
  }
  const rec = get('fita-recebida');
  const rp = get('receptora-plasmideo');
  const at = new THREE.Vector3(recX - 0.9, 0.2, 0.3);
  if (rec) {
    rec.position.copy(at);
    rec.rotation.set(0.3, 0.2, 0);
    rec.scale.setScalar(step === 2 ? Math.max(0.0001, clamp01(t * 1.3 - 0.2)) : step === 3 ? 1 - ease(t) * 0.999 : 0.0001);
  }
  if (rp) {
    rp.position.copy(at);
    rp.rotation.set(0.3, 0.2, 0);
    rp.scale.setScalar(step === 3 ? Math.max(0.0001, ease(t)) : step === 4 ? 1 : 0.0001);
  }
  // the recipient is now a donor too: it can make its own pilus
  const p2 = get('pilus-2');
  if (p2) {
    p2.position.set(recX + END - 0.05, 0.2, 0);
    p2.scale.set(step === 4 ? Math.max(0.0001, ease(t) * 1.6) : 0.0001, 1, 1);
  }
}

// ===================================================================== antibiotic resistance

export const RESISTANCE_PRESET: CameraPreset = { position: [0.8, 12, 15.5], target: [0.8, -0.6, 0], distance: 19.6, minDistance: 2, maxDistance: 38 };
const DISH_R = 5.2;
export const POPULATION = 44;
export const RESISTANT = [3, 11, 19, 30, 37];
export const OFFSPRING = 34;

function rodGeo() {
  return bentCapsule(0.22, 0.13, 0.2, 6, 10).rotateZ(Math.PI / 2);
}

export function buildResistance() {
  const r = rng(101);
  const meshes: MeshDef[] = [];
  const dish = new THREE.CylinderGeometry(DISH_R + 0.25, DISH_R + 0.25, 0.12, 64).translate(0, -0.5, 0);
  meshes.push({ id: 'placa', structure: 'placa-de-petri', geometry: paint(new THREE.CylinderGeometry(DISH_R + 0.3, DISH_R + 0.3, 0.7, 72, 1, true).translate(0, -0.2, 0), c('placa-de-petri')) });
  meshes.push({ id: 'agar', structure: 'placa-de-petri', geometry: paint(new THREE.CylinderGeometry(DISH_R, DISH_R, 0.35, 64).translate(0, -0.3, 0), '#F1E3B6') });
  meshes.push({ id: 'fundo', structure: 'placa-de-petri', geometry: paint(dish, c('placa-de-petri')) });
  meshes.push({ id: 'antibiotico', structure: 'antibiotico', geometry: paint(new THREE.CylinderGeometry(DISH_R - 0.05, DISH_R - 0.05, 0.08, 64).translate(0, -0.08, 0), c('antibiotico')) });
  const spots: THREE.Vector3[] = [];
  for (let i = 0; i < 3000 && spots.length < POPULATION + OFFSPRING; i++) {
    const a = r.range(0, Math.PI * 2);
    const rr = Math.sqrt(r.next()) * (DISH_R - 0.6);
    const p = new THREE.Vector3(Math.cos(a) * rr, -0.02, Math.sin(a) * rr);
    if (spots.every((q) => q.distanceTo(p) > 0.62)) spots.push(p);
  }
  for (let i = 0; i < POPULATION; i++) {
    const res = RESISTANT.includes(i);
    meshes.push({ id: `bac-${i}`, structure: res ? 'bacteria-resistente' : 'bacteria-sensivel', geometry: paint(place(rodGeo(), spots[i], new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), r.range(0, Math.PI))), c(res ? 'bacteria-resistente' : 'bacteria-sensivel')) });
  }
  for (let i = 0; i < OFFSPRING; i++) {
    const p = spots[POPULATION + i] ?? new THREE.Vector3(r.range(-3, 3), -0.02, r.range(-3, 3));
    meshes.push({ id: `filha-${i}`, structure: 'bacteria-resistente', geometry: paint(place(rodGeo(), p, new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), r.range(0, Math.PI))), c('bacteria-resistente')) });
  }
  return { meshes: colorize(meshes), spots };
}

/** Resistance (5 steps): varied population, antibiotic, survivors, multiplication, resistant population. */
export function poseResistance(P: number, get: Get) {
  const step = Math.min(4, Math.floor(P));
  const t = P - step;
  const ab = get('antibiotico');
  if (ab) {
    const k = step === 0 ? 0 : step === 1 ? ease(t) : step === 4 ? 1 : 0.6;
    ab.scale.set(1, Math.max(0.0001, k), 1);
  }
  for (let i = 0; i < POPULATION; i++) {
    const b = get(`bac-${i}`);
    if (!b) continue;
    const res = RESISTANT.includes(i);
    // sensitive bacteria die at slightly different times during step 2
    const die = res ? 1 : step === 0 ? 1 : step === 1 ? 1 - clamp01(t * 1.8 - (i % 7) * 0.1) : 0;
    b.scale.setScalar(Math.max(0.0001, die));
  }
  for (let i = 0; i < OFFSPRING; i++) {
    const f = get(`filha-${i}`);
    if (!f) continue;
    const k = step === 3 ? clamp01(t * 1.5 - (i / OFFSPRING) * 0.6) : step === 4 ? 1 : 0;
    f.scale.setScalar(Math.max(0.0001, k));
  }
}


