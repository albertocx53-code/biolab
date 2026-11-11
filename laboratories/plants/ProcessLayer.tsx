'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { meshRegistry } from '@/engine/selection/registry';
import { Flow, randomInside, type FlowSpec } from '@/laboratories/shared/Flow';
import { stepProgress, useProcess } from '@/laboratories/shared/process';
import type { BuiltModel } from '@/laboratories/shared/types';
import { PLANT_PROCESSES } from './processes';

type Anchors = BuiltModel['anchors'];
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

const C = {
  agua: '#38BDF8',
  vapor: '#BAE6FD',
  acucar: '#F97316',
  luz: '#FDE047',
  co2: '#64748B',
  o2: '#2563EB',
  polen: '#F59E0B',
};

const around = (pts: THREE.Vector3[], off: THREE.Vector3, spread: number, n = pts.length) =>
  randomInside(
    pts.map((p) => p.clone().add(off)),
    n,
    spread,
  );

/** Xylem paths of the whole plant: root tip → stem → leaf. */
function plantPaths(a: Anchors) {
  const stem = a.stem ?? [];
  const leaves = a.leaves ?? [];
  const roots = a.roots ?? [];
  const base = a.rootBase?.[0] ?? V(0, 0, 0);
  const up = roots.map((tip, i) => {
    const leaf = leaves[i % leaves.length];
    const along = stem.filter((p) => p.y < leaf.y - 0.1);
    return [tip, base, ...along, leaf];
  });
  const fruit = a.fruit?.[0];
  const down = leaves.flatMap((leaf, i) => {
    const along = stem.filter((p) => p.y < leaf.y - 0.1).reverse();
    const toRoot = [leaf, ...along, base, roots[(i * 3) % roots.length]];
    const out = [toRoot];
    if (fruit && along.length) {
      const near = along.reduce((b, p) => (Math.abs(p.y - fruit.y) < Math.abs(b.y - fruit.y) ? p : b), along[0]);
      out.push([leaf, ...along.filter((p) => p.y >= near.y), fruit]);
    }
    return out;
  });
  const stemUp = leaves.map((leaf) => [...stem.filter((p) => p.y < leaf.y - 0.1).slice(-3), leaf]);
  return { up, down, stemUp };
}

function useFlows(processId: string, a: Anchors): FlowSpec[][] {
  return useMemo(() => {
    switch (processId) {
      case 'transporte': {
        const { up, down } = plantPaths(a);
        const soil = around(a.roots ?? [], V(0, 0, 0), 0.5, 24);
        const xylem: FlowSpec = { paths: up, color: C.agua, count: 60, size: 0.06, trip: 5, jitter: 0.03 };
        const phloem: FlowSpec = { paths: down, color: C.acucar, count: 50, size: 0.06, trip: 5, jitter: 0.03 };
        return [[{ from: soil, to: a.roots ?? [], color: C.agua, count: 30, size: 0.06, trip: 2.5, arc: 0 }], [xylem], [phloem], [xylem, phloem]];
      }
      case 'transpiracao': {
        const { stemUp } = plantPaths(a);
        const leaves = a.leaves ?? [];
        const water: FlowSpec = { paths: stemUp, color: C.agua, count: 30, size: 0.06, trip: 3, jitter: 0.03 };
        const vapor: FlowSpec = { from: around(leaves, V(0, 0, 0), 0.4, 20), to: around(leaves, V(0.2, 1.3, 0.2), 0.9, 20), color: C.vapor, count: 50, size: 0.076, trip: 3.2, arc: 0 };
        return [[water], [vapor], [water, vapor]];
      }
      case 'fotossintese': {
        const { down } = plantPaths(a);
        const leaves = a.leaves ?? [];
        const air = around(leaves, V(0.5, 0.4, 0.6), 0.6, 16);
        return [
          [{ from: a.sky ?? [], to: leaves, color: C.luz, count: 44, size: 0.06, trip: 1.4, arc: 0 }],
          [
            { from: air, to: leaves, color: C.co2, count: 30, size: 0.06, trip: 2.8 },
            { paths: plantPaths(a).stemUp, color: C.agua, count: 20, size: 0.051, trip: 3, jitter: 0.03 },
          ],
          [{ from: leaves, to: around(leaves, V(0.4, 0.8, 0.5), 0.7, 16), color: C.o2, count: 34, size: 0.06, trip: 2.8 }],
          [{ paths: down, color: C.acucar, count: 44, size: 0.06, trip: 5, jitter: 0.03 }],
        ];
      }
      case 'polinizacao': {
        const anthers = a.anthers ?? [];
        const stigma = a.stigma ?? [];
        const puff = around(anthers, V(0, 0.25, 0), 0.4, 20);
        return [
          [{ from: anthers, to: puff, color: C.polen, count: 40, size: 0.025, trip: 2, arc: 0.1 }],
          [
            { from: anthers, to: a.sky ?? [], color: C.polen, count: 24, size: 0.025, trip: 3, arc: 0.2 },
            { from: a.sky ?? [], to: randomInside(stigma, 6, 0.1), color: C.polen, count: 24, size: 0.025, trip: 3, arc: 0.1 },
          ],
          [
            { from: anthers, to: randomInside(stigma, 8, 0.1), color: C.polen, count: 24, size: 0.025, trip: 2.4, arc: 0.4 },
            { from: randomInside(stigma, 10, 0.12), to: randomInside(stigma, 10, 0.12), color: C.polen, count: 12, size: 0.025, trip: 4, arc: 0 },
          ],
        ];
      }
      case 'fotossintese-folha': {
        const pal = a.palisade ?? [];
        const sp = a.spongy ?? [];
        const st = a.stomata ?? [];
        const below = a.below ?? [];
        const ch = a.chambers ?? [];
        const inPaths = st.flatMap((s, i) => sp.filter((_, k) => k % st.length === i).map((p) => [below[i], s, ch[i], p]));
        const outPaths = inPaths.map((p) => p.slice().reverse());
        return [
          [{ from: a.sky ?? [], to: pal, color: C.luz, count: 50, size: 0.042, trip: 1.4, arc: 0 }],
          [{ paths: inPaths, color: C.co2, count: 36, size: 0.049, trip: 3.5, jitter: 0.02 }],
          [{ from: a.xylem ?? [], to: [...pal, ...sp], color: C.agua, count: 36, size: 0.042, trip: 3 }],
          [
            { paths: outPaths, color: C.o2, count: 30, size: 0.049, trip: 3.5, jitter: 0.02 },
            { from: pal, to: a.phloem ?? [], color: C.acucar, count: 30, size: 0.049, trip: 3 },
          ],
        ];
      }
      case 'transpiracao-folha': {
        const sp = a.spongy ?? [];
        const st = a.stomata ?? [];
        const ch = a.chambers ?? [];
        const below = a.below ?? [];
        return [
          [{ from: a.xylem ?? [], to: sp, color: C.agua, count: 36, size: 0.042, trip: 3 }],
          [{ from: sp, to: ch, color: C.vapor, count: 36, size: 0.056, trip: 3 }],
          [{ paths: st.map((s, i) => [ch[i], s, below[i]]), color: C.vapor, count: 36, size: 0.056, trip: 2.5, jitter: 0.05 }],
        ];
      }
      case 'transporte-caule': {
        const H = a.height?.[0]?.y ?? 1.25;
        const up: FlowSpec = { paths: (a.xylem ?? []).map((p) => [p.clone().setY(-H - 0.5), p.clone().setY(H + 0.5)]), color: C.agua, count: 50, size: 0.035, trip: 3, jitter: 0.06 };
        const down: FlowSpec = { paths: (a.phloem ?? []).map((p) => [p.clone().setY(H + 0.5), p.clone().setY(-H - 0.5)]), color: C.acucar, count: 40, size: 0.035, trip: 3.4, jitter: 0.04 };
        return [[up], [down], [up, down]];
      }
      case 'absorcao': {
        const tips = a.hairTips ?? [];
        const bases = a.hairBases ?? [];
        const ctx = a.cortex ?? [];
        const ctr = a.centre ?? [];
        const pair = (from: THREE.Vector3[], to: THREE.Vector3[]) => from.map((p, i) => [p, to[i]]);
        return [
          [{ paths: pair(around(tips, V(0, 0, 0), 0.2), tips).map((p, i) => [...p, bases[i]]), color: C.agua, count: 40, size: 0.03, trip: 3, jitter: 0.02 }],
          [{ paths: pair(bases, ctx), color: C.agua, count: 40, size: 0.03, trip: 2.6, jitter: 0.03 }],
          [{ paths: pair(ctx, ctr), color: C.agua, count: 40, size: 0.03, trip: 2.6, jitter: 0.02 }],
          [{ paths: ctr.map((p) => [p, V(0, (a.up?.[0]?.y ?? 2.4) + 0.3, 0)]), color: C.agua, count: 40, size: 0.03, trip: 3, jitter: 0.04 }],
        ];
      }
      case 'germinacao':
        return [[{ from: a.soil ?? [], to: a.seed ?? [], color: C.agua, count: 30, size: 0.04, trip: 2.6 }], [], [], [], []];
      default:
        return [];
    }
  }, [processId, a]);
}

function Particles({ processId, anchors }: { processId: string; anchors: Anchors }) {
  const steps = useFlows(processId, anchors);
  const step = useProcess((s) => s.step);
  return <>{steps.map((flows, si) => flows.map((f, fi) => <Flow key={`${si}-${fi}`} spec={f} active={si === step} />))}</>;
}

// ------------------------------------------------------------------ stomata opening / closing

function GuardCells() {
  useEffect(
    () => () => {
      for (const id of ['guarda-esq', 'guarda-dir']) {
        const m = meshRegistry.get(id);
        if (m) {
          m.position.set(0, 0, 0);
          m.updateMatrixWorld();
        }
      }
    },
    [],
  );
  const cur = useRef(0);
  useFrame((state, dt) => {
    const st = useProcess.getState();
    const u = stepProgress(PLANT_PROCESSES, 0.6);
    let target = 0;
    if (st.step === 0) target = 0.035 * u;
    else if (st.step === 1) target = 0.035 - 0.07 * u;
    else target = 0.0 + 0.035 * Math.sin(state.clock.elapsedTime * 1.5);
    cur.current += (target - cur.current) * Math.min(1, dt * 6);
    const l = meshRegistry.get('guarda-esq');
    const r = meshRegistry.get('guarda-dir');
    if (l) {
      l.position.x = -cur.current;
      l.updateMatrixWorld();
    }
    if (r) {
      r.position.x = cur.current;
      r.updateMatrixWorld();
    }
  });
  return null;
}

// ------------------------------------------------------------------ pollen tube and fertilisation

function Fertilisation({ anchors }: { anchors: Anchors }) {
  const path = useMemo(() => {
    const stigma = anchors.stigma?.[0] ?? V(0, 1.28, 0);
    const style = anchors.style ?? [];
    const ovule = anchors.ovules?.[2] ?? V(0, 0, 0);
    return new THREE.CatmullRomCurve3([stigma, ...style.slice(1), ovule.clone().add(V(0, 0.05, 0)), ovule]);
  }, [anchors]);
  const tube = useMemo(() => {
    const g = new THREE.TubeGeometry(path, 120, 0.022, 8, false);
    const mesh = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: '#F97316', emissive: '#F97316', emissiveIntensity: 0.8, depthTest: false, transparent: true }));
    mesh.renderOrder = 21;
    mesh.raycast = () => {};
    return mesh;
  }, [path]);
  const grain = useRef<THREE.Mesh>(null);
  const sperm = useRef<THREE.Group>(null);
  const flash = useRef<THREE.Mesh>(null);
  const total = useMemo(() => (tube.geometry.index ? tube.geometry.index.count : 0), [tube]);
  useEffect(
    () => () => {
      tube.geometry.dispose();
      (tube.material as THREE.Material).dispose();
      for (const [id, s] of [
        ['ovario', 1],
        ['ovulos', 1],
        ['petalas', 1],
        ['filete', 1],
        ['antera', 1],
        ['graos-de-polen', 1],
      ] as const) {
        const m = meshRegistry.get(id);
        if (m) {
          m.scale.setScalar(s);
          m.position.set(0, 0, 0);
          m.updateMatrixWorld();
        }
      }
    },
    [tube],
  );
  const O = anchors.ovary?.[0] ?? V(0, 0.12, 0);
  useFrame(() => {
    const st = useProcess.getState();
    const u = stepProgress(PLANT_PROCESSES, 0.85);
    const grow = st.step === 0 ? 0 : st.step === 1 ? u : 1;
    tube.geometry.setDrawRange(0, Math.floor((total * grow) / 3) * 3);
    if (grain.current) {
      grain.current.position.copy(path.getPointAt(0));
      grain.current.scale.setScalar(0.035 * (st.step === 0 ? 1 + 0.4 * u : 1.4));
    }
    if (sperm.current) {
      sperm.current.visible = st.step === 2;
      if (st.step === 2) {
        const t = Math.min(1, u * 1.15);
        sperm.current.children.forEach((c, i) => {
          c.position.copy(path.getPointAt(Math.min(1, Math.max(0, t - i * 0.06))));
        });
      }
    }
    if (flash.current) {
      const on = st.step === 2 ? THREE.MathUtils.smoothstep(u, 0.8, 1) : st.step === 3 ? 1 - u : 0;
      flash.current.visible = on > 0.01;
      flash.current.position.copy(path.getPointAt(1));
      flash.current.scale.setScalar(0.04 + 0.08 * on);
      (flash.current.material as THREE.MeshStandardMaterial).opacity = 0.7 * on;
    }
    // ovary swells into a young fruit; petals and stamens wither
    const f = st.step === 3 ? u : 0;
    const scaleAbout = (id: string, k: number, centre: THREE.Vector3) => {
      const m = meshRegistry.get(id);
      if (!m) return;
      m.scale.setScalar(k);
      m.position.copy(centre).multiplyScalar(1 - k);
      m.updateMatrixWorld();
    };
    scaleAbout('ovario', 1 + 0.45 * f, O);
    scaleAbout('ovulos', 1 + 0.45 * f, O);
    for (const id of ['petalas', 'filete', 'antera', 'graos-de-polen']) scaleAbout(id, 1 - 0.35 * f, O);
  });
  return (
    <>
      <primitive object={tube} />
      <mesh ref={grain} renderOrder={22} raycast={() => null}>
        <icosahedronGeometry args={[1, 2]} />
        <meshStandardMaterial color="#F59E0B" emissive="#F59E0B" emissiveIntensity={0.4} depthTest={false} transparent />
      </mesh>
      <group ref={sperm} visible={false}>
        {[0, 1].map((i) => (
          <mesh key={i} renderOrder={23} raycast={() => null} scale={0.025}>
            <icosahedronGeometry args={[1, 2]} />
            <meshStandardMaterial color="#EC4899" emissive="#EC4899" emissiveIntensity={0.7} depthTest={false} transparent />
          </mesh>
        ))}
      </group>
      <mesh ref={flash} renderOrder={22} raycast={() => null} visible={false}>
        <icosahedronGeometry args={[1, 2]} />
        <meshStandardMaterial color="#FDE047" emissive="#FDE047" emissiveIntensity={1} depthTest={false} transparent opacity={0} />
      </mesh>
    </>
  );
}

const PARTICLE_PROCESSES = new Set(['transporte', 'transpiracao', 'fotossintese', 'polinizacao', 'fotossintese-folha', 'transpiracao-folha', 'transporte-caule', 'absorcao', 'germinacao']);

/** Renders the animation for the active process inside the canvas. */
export function ProcessLayer({ anchors }: { anchors: Anchors; modelId?: string }) {
  const id = useProcess((s) => s.id);
  if (!id || !PLANT_PROCESSES[id]) return null;
  return (
    <group key={id}>
      {id === 'estomatos' && <GuardCells />}
      {id === 'fecundacao' && <Fertilisation anchors={anchors} />}
      {PARTICLE_PROCESSES.has(id) && <Particles processId={id} anchors={anchors} />}
    </group>
  );
}
