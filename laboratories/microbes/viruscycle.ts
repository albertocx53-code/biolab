/**
 * Animated scene of the bacteriophage cycles. One bacterium (cut open) and a
 * phage that lands on it. Lytic cycle: adsorption, injection, synthesis,
 * assembly and lysis. Lysogenic cycle: injection, integration of the prophage,
 * division (both daughters carry it) and induction. Poses only move, scale and
 * hide meshes, driven by the phase P = step + progress.
 */
import * as THREE from 'three';
import { merge, paint, patch, place, rng, scaled, type Cut } from '@/laboratories/shared/geometry';
import type { CameraPreset } from '@/components/3d/CameraRig';
import type { MeshDef } from '@/laboratories/shared/types';
import { bacillus, c, dnaBall, LAY_X, phage } from './kit';
import { colorize } from './materials';

type Get = (id: string) => THREE.Object3D | undefined;

export const VIRUS_CYCLE_PRESET: CameraPreset = { position: [0.6, 3.2, 21], target: [0.6, 0.8, 0], distance: 21, minDistance: 2, maxDistance: 42 };

const CUT: Cut = { center: 0, width: Math.PI * 0.9 };
const H = 2.6;
const RAD = 1.5;
/** Point on top of the bacterium where the phage lands. */
const LAND = new THREE.Vector3(0.8, RAD * 1.0, 0);
const NEW_PHAGES = 6;
const FRAGMENTS = 8;

function bacteriumMeshes(prefix: string, seed: number, scale = 1): MeshDef[] {
  const b = bacillus(rng(seed), H, RAD, CUT, { ribosomes: 220, dnaSteps: 220 });
  const list: MeshDef[] = [
    { id: `${prefix}-parede`, structure: 'parede-bacteriana', geometry: b.wallG },
    { id: `${prefix}-membrana`, structure: 'membrana-plasmatica', geometry: b.membraneG },
    { id: `${prefix}-dna`, structure: 'nucleoide', geometry: b.dnaG },
    { id: `${prefix}-ribos`, structure: 'ribossomos', geometry: b.ribosomesG },
  ];
  for (const m of list) {
    m.geometry.applyQuaternion(LAY_X);
    if (scale !== 1) m.geometry.scale(scale, scale, scale);
  }
  return list;
}

/** Phage meshes (each part a separate structure) built around its tail tip. */
function phageMeshes(prefix: string, s: number, withDna: boolean): MeshDef[] {
  const p = phage(s);
  const list: MeshDef[] = [
    { id: `${prefix}-cabeca`, structure: 'capsideo', geometry: merge([p.head, p.collar]) },
    { id: `${prefix}-bainha`, structure: 'bainha', geometry: p.sheath },
    { id: `${prefix}-cauda`, structure: 'placa-basal', geometry: merge([p.plate, p.fibers, p.tubeG]) },
  ];
  if (withDna) list.push({ id: `${prefix}-dna`, structure: 'dna-viral', geometry: p.dna });
  return list;
}

export function buildVirusCycle() {
  const r = rng(91);
  const meshes: MeshDef[] = [...bacteriumMeshes('bac', 5)];
  // pieces of the wall that fly apart at lysis
  for (let i = 0; i < FRAGMENTS; i++) {
    const t0 = (i % 2) * (Math.PI / 2);
    const p0 = CUT.width / 2 + (Math.floor(i / 2) / 4) * (Math.PI * 2 - CUT.width);
    const g = patch(scaled((d) => 1 / Math.sqrt((d.x / RAD) ** 2 + (d.y / (H + RAD)) ** 2 + (d.z / RAD) ** 2), 1), [t0 + 0.05, t0 + Math.PI / 2 - 0.05], [p0, p0 + (Math.PI * 2 - CUT.width) / 4 - 0.05], [10, 10]);
    g.applyQuaternion(LAY_X);
    meshes.push({ id: `frag-${i}`, structure: 'parede-bacteriana', geometry: paint(g, c('parede-bacteriana')) });
  }
  // the infecting phage and its DNA once injected
  meshes.push(...phageMeshes('fago', 0.55, true));
  const inj: THREE.Vector3[] = [];
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    inj.push(new THREE.Vector3(LAND.x - t * 1.6 + Math.sin(t * 9) * 0.15, LAND.y - 0.2 - t * 0.7 + Math.cos(t * 7) * 0.12, Math.sin(t * 5) * 0.3 - 0.2));
  }
  meshes.push({ id: 'dna-injetado', structure: 'dna-viral', geometry: paint(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(inj), 160, 0.05, 5), c('dna-viral')) });
  // copies of the viral DNA, loose heads and tails, assembled phages (inside the cell)
  const spots = Array.from({ length: NEW_PHAGES }, (_, i) => new THREE.Vector3(-2.6 + i * 1.05, (i % 2 ? 0.35 : -0.45), -0.3 + (i % 3) * 0.15));
  spots.forEach((p, i) => {
    meshes.push({ id: `copia-${i}`, structure: 'dna-viral', geometry: dnaBall(r, p, 0.32, 0.035, c('dna-viral')) });
    const ph = phageMeshes(`novo-${i}`, 0.24, false);
    for (const m of ph) m.geometry.translate(p.x, p.y - 0.4, p.z);
    meshes.push(...ph);
  });
  // lysogenic: the prophage (viral DNA inserted in the bacterial chromosome)
  meshes.push({ id: 'profago', structure: 'profago', geometry: paint(new THREE.TorusGeometry(0.45, 0.12, 10, 36, Math.PI * 1.5), c('profago')) });
  // daughters after division (each with a prophage)
  for (const k of ['a', 'b']) {
    meshes.push(...bacteriumMeshes(`filha-${k}`, k === 'a' ? 7 : 8, 0.72));
    meshes.push({ id: `filha-${k}-profago`, structure: 'profago', geometry: paint(new THREE.TorusGeometry(0.36, 0.1, 10, 32, Math.PI * 1.5), c('profago')) });
  }
  // induction: new capsids starting inside daughter a
  const ind: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 4; i++) ind.push(place(new THREE.IcosahedronGeometry(0.16, 0), [-1.2 + i * 0.7, 0.2 * (i % 2), 0], undefined, new THREE.Vector3(1, 1.4, 1)));
  meshes.push({ id: 'inducao', structure: 'capsideo', geometry: paint(merge(ind), c('capsideo')) });
  // a few free phages around (the first scene shows them approaching)
  for (let i = 0; i < 2; i++) meshes.push(...phageMeshes(`livre-${i}`, 0.42, false));
  return { meshes: colorize(meshes) };
}

// ------------------------------------------------------------------ helpers

const hide = (o: THREE.Object3D | undefined) => o && o.scale.setScalar(0.0001);
const ease = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

function setPhage(get: Get, prefix: string, at: THREE.Vector3 | null, rotZ = 0, k = 1, sheath = 1, dnaK = 1) {
  for (const part of ['cabeca', 'bainha', 'cauda', 'dna']) {
    const o = get(`${prefix}-${part}`);
    if (!o) continue;
    if (!at) {
      hide(o);
      continue;
    }
    o.position.copy(at);
    o.rotation.set(0, 0, rotZ);
    o.scale.setScalar(k);
    if (part === 'bainha') o.scale.set(k, k * sheath, k);
    if (part === 'cabeca' || part === 'dna') {
      // the head sits on the sheath: lowers when the sheath contracts
      const drop = (1 - sheath) * 1.38 * 0.55 * k;
      o.position.add(new THREE.Vector3(Math.sin(-rotZ) * -drop, -drop * Math.cos(rotZ), 0));
      if (part === 'dna') o.scale.setScalar(k * dnaK);
    }
  }
}

function bacterium(get: Get, prefix: string, pos: THREE.Vector3 | null, sx = 1, opts: { dna?: number } = {}) {
  for (const part of ['parede', 'membrana', 'dna', 'ribos', 'profago']) {
    const o = get(`${prefix}-${part}`);
    if (!o) continue;
    if (!pos) {
      hide(o);
      continue;
    }
    o.position.copy(pos);
    o.scale.set(sx, 1, 1);
    if (part === 'dna' && opts.dna !== undefined) o.scale.setScalar(Math.max(0.0001, opts.dna));
  }
}

function common(get: Get) {
  for (let i = 0; i < FRAGMENTS; i++) hide(get(`frag-${i}`));
  for (let i = 0; i < NEW_PHAGES; i++) {
    hide(get(`copia-${i}`));
    setPhage(get, `novo-${i}`, null);
  }
  hide(get('profago'));
  hide(get('dna-injetado'));
  hide(get('inducao'));
  bacterium(get, 'filha-a', null);
  bacterium(get, 'filha-b', null);
}

/** Phage approaching and landing (0 ≤ t ≤ 1), then injection (sheath contracts) with t2. */
function attack(get: Get, t: number, t2: number) {
  const from = new THREE.Vector3(4.5, 6.5, 0.5);
  const at = from.clone().lerp(LAND, ease(clamp01(t)));
  const sheath = 1 - 0.45 * ease(clamp01(t2));
  setPhage(get, 'fago', at, 0.25 * (1 - clamp01(t)), 1, sheath, 1 - clamp01(t2) * 0.999);
  const inj = get('dna-injetado');
  if (inj) inj.scale.setScalar(t2 > 0 ? Math.max(0.0001, ease(clamp01(t2))) : 0.0001);
  if (inj && t2 > 0) inj.position.set(LAND.x * (1 - ease(clamp01(t2))), LAND.y * (1 - ease(clamp01(t2))), 0);
  setPhage(get, 'livre-0', new THREE.Vector3(-5.5 + t * 0.8, 4.6 - t * 0.4, -1.2), -0.5, 1);
  setPhage(get, 'livre-1', new THREE.Vector3(6.6, -3.2 + t * 0.5, -1.5), 2.6, 1);
}

/** Lytic cycle (5 steps). */
export function poseLytic(P: number, get: Get) {
  common(get);
  const step = Math.min(4, Math.floor(P));
  const t = P - step;
  bacterium(get, 'bac', new THREE.Vector3(0, 0, 0));
  if (step === 0) attack(get, t, 0);
  else if (step === 1) attack(get, 1, t);
  else {
    attack(get, 1, 1);
    // empty phage coat stays outside
  }
  // 2: synthesis: the bacterial DNA is broken down, viral DNA copied, capsids made
  if (step >= 2) {
    const dna = get('bac-dna');
    if (dna) dna.scale.setScalar(Math.max(0.15, 1 - (step === 2 ? ease(t) : 1) * 0.85));
    hide(get('dna-injetado'));
  }
  for (let i = 0; i < NEW_PHAGES; i++) {
    const copy = get(`copia-${i}`);
    const appear = step === 2 ? clamp01(t * 1.6 - i * 0.1) : step > 2 ? 1 : 0;
    if (copy) copy.scale.setScalar(step < 3 || (step === 3 && t < 0.4) ? Math.max(0.0001, appear) : 0.0001);
    // 3: assembly; 4: lysis, phages released
    if (step === 2 && t > 0.5) setPhage(get, `novo-${i}`, new THREE.Vector3(0, 0, 0), 0, clamp01((t - 0.5) * 2) * 0.6);
    if (step === 3) setPhage(get, `novo-${i}`, new THREE.Vector3(0, 0, 0), 0, 0.6 + 0.4 * ease(t));
    if (step === 4) {
      const dir = new THREE.Vector3(-2.6 + i * 1.05, i % 2 ? 1 : -1, (i % 3) - 1).normalize();
      setPhage(get, `novo-${i}`, dir.multiplyScalar(ease(t) * 4.5), (i - 2.5) * 0.4 * t, 1);
    }
  }
  if (step === 4) {
    bacterium(get, 'bac', null);
    hide(get('bac-parede'));
    for (let i = 0; i < FRAGMENTS; i++) {
      const f = get(`frag-${i}`);
      if (!f) continue;
      const dir = new THREE.Vector3(i % 4 < 2 ? -1 : 1, i % 2 ? 1 : -1, (i % 3) - 1).normalize();
      f.scale.setScalar(1);
      f.position.copy(dir.multiplyScalar(ease(t) * 2.2));
      f.rotation.set(t * (i - 3) * 0.3, t * 0.5, t * (i % 3) * 0.3);
    }
    const coat = get('fago-cabeca');
    if (coat) coat.position.y += ease(t) * 2;
    for (const part of ['bainha', 'cauda']) {
      const o = get(`fago-${part}`);
      if (o) o.position.y += ease(t) * 2;
    }
  }
}

/** Lysogenic cycle (4 steps). */
export function poseLysogenic(P: number, get: Get) {
  common(get);
  const step = Math.min(3, Math.floor(P));
  const t = P - step;
  if (step === 0) {
    bacterium(get, 'bac', new THREE.Vector3(0, 0, 0));
    attack(get, clamp01(t * 1.6), clamp01(t * 1.6 - 0.6) * 2.5);
    return;
  }
  attack(get, 1, 1);
  hide(get('dna-injetado'));
  if (step === 1) {
    // integration: the viral DNA closes into a ring and joins the chromosome
    bacterium(get, 'bac', new THREE.Vector3(0, 0, 0));
    const pf = get('profago');
    if (pf) {
      pf.scale.setScalar(0.6 + 0.4 * ease(t));
      pf.position.set(0.8 - 0.8 * ease(t), 0.3 - 0.3 * ease(t), 0.4);
      pf.rotation.set(Math.PI / 2, 0, t * 2);
    }
    const inj = get('dna-injetado');
    if (inj) inj.scale.setScalar(Math.max(0.0001, 1 - ease(t)));
    return;
  }
  for (const part of ['cabeca', 'bainha', 'cauda']) hide(get(`fago-${part}`));
  setPhage(get, 'livre-0', null);
  setPhage(get, 'livre-1', null);
  if (step === 2) {
    // division: the cell grows, splits; both daughters carry the prophage
    if (t < 0.45) {
      bacterium(get, 'bac', new THREE.Vector3(0, 0, 0), 1 + ease(t / 0.45) * 0.35);
      const pf = get('profago');
      if (pf) {
        pf.scale.setScalar(1);
        pf.position.set(0, 0, 0.4);
        pf.rotation.set(Math.PI / 2, 0, 2);
      }
    } else {
      bacterium(get, 'bac', null);
      const k = ease((t - 0.45) / 0.55);
      bacterium(get, 'filha-a', new THREE.Vector3(-2.4 - k * 1.4, 0, 0));
      bacterium(get, 'filha-b', new THREE.Vector3(2.4 + k * 1.4, 0, 0));
      for (const id of ['filha-a-profago', 'filha-b-profago']) {
        const o = get(id);
        if (o) o.rotation.set(Math.PI / 2, 0, 2);
      }
    }
    return;
  }
  // induction: in one daughter the prophage leaves the chromosome and new capsids form
  bacterium(get, 'bac', null);
  bacterium(get, 'filha-a', new THREE.Vector3(-3.8, 0, 0));
  bacterium(get, 'filha-b', new THREE.Vector3(3.8, 0, 0));
  const pa = get('filha-a-profago');
  if (pa) {
    pa.position.set(-3.8, 0.45 * ease(t), 0.4);
    pa.rotation.set(Math.PI / 2, 0, 2 + t * 3);
  }
  const ind = get('inducao');
  if (ind) {
    ind.position.set(-3.8, 0, 0.2);
    ind.scale.setScalar(Math.max(0.0001, clamp01(t * 1.5 - 0.3)));
  }
  for (const id of ['filha-b-profago']) {
    const o = get(id);
    if (o) o.rotation.set(Math.PI / 2, 0, 2);
  }
}

