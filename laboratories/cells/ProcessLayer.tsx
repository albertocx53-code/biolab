'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { meshRegistry } from '@/engine/selection/registry';
import { CELL_PROCESSES, processClock, useProcess } from './processes';
import type { BuiltModel } from './models';

type Anchors = BuiltModel['anchors'];

/** Advances the process clock and moves through the steps while playing. */
export function ProcessDriver() {
  const invalidate = useThree((s) => s.invalidate);
  const id = useProcess((s) => s.id);
  const playing = useProcess((s) => s.playing);
  useEffect(() => {
    if (id) invalidate();
  }, [id, playing, invalidate]);
  useFrame((_, dt) => {
    const st = useProcess.getState();
    if (!st.id) return;
    const proc = CELL_PROCESSES[st.id];
    if (st.playing) {
      processClock.t += Math.min(dt, 0.1);
      const dur = proc.steps[st.step].seconds;
      if (processClock.t >= dur) {
        if (st.step < proc.steps.length - 1) st.setStep(st.step + 1);
        else if (proc.loop) st.setStep(0);
        else {
          processClock.t = dur;
          st.setPlaying(false);
        }
      }
    }
    invalidate(); // keep particles moving (also while paused, for a gentle idle motion)
  });
  return null;
}

// ------------------------------------------------------------------ particles

interface FlowSpec {
  from: THREE.Vector3[];
  to: THREE.Vector3[];
  color: string;
  count: number;
  size: number;
  /** Seconds for one trip. */
  trip: number;
  /** Arc height relative to the distance. */
  arc?: number;
}

/** Particles travelling from one set of points to another (molecules, light). */
function Flow({ spec, active }: { spec: FlowSpec; active: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const fade = useRef(0);
  const seeds = useMemo(
    () =>
      Array.from({ length: spec.count }, (_, i) => ({
        a: i % spec.from.length,
        b: (i * 7 + 3) % spec.to.length,
        phase: i / spec.count + Math.random() * 0.05,
        jitter: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(0.12),
      })),
    [spec],
  );
  const geo = useMemo(() => new THREE.IcosahedronGeometry(1, 1), []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: spec.color, emissive: spec.color, emissiveIntensity: 0.55, roughness: 0.4, transparent: true, depthWrite: false }), [spec.color]);
  useEffect(
    () => () => {
      geo.dispose();
      mat.dispose();
    },
    [geo, mat],
  );
  const m = useMemo(() => new THREE.Matrix4(), []);
  const p = useMemo(() => new THREE.Vector3(), []);
  const q = useMemo(() => new THREE.Quaternion(), []);
  const s = useMemo(() => new THREE.Vector3(), []);
  useFrame((state, dt) => {
    const mesh = ref.current;
    if (!mesh) return;
    fade.current = THREE.MathUtils.clamp(fade.current + (active ? dt : -dt) * 2.5, 0, 1);
    mat.opacity = fade.current;
    mesh.visible = fade.current > 0.01;
    if (!mesh.visible) return;
    const time = state.clock.elapsedTime;
    seeds.forEach((sd, i) => {
      const u = (time / spec.trip + sd.phase) % 1;
      const a = spec.from[sd.a];
      const b = spec.to[sd.b];
      p.copy(a).lerp(b, u).add(sd.jitter);
      const arc = (spec.arc ?? 0.15) * a.distanceTo(b) * Math.sin(Math.PI * u);
      p.y += arc;
      const k = spec.size * Math.min(1, Math.sin(Math.PI * u) * 3);
      s.setScalar(Math.max(k, 1e-4));
      m.compose(p, q, s);
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh ref={ref} args={[geo, mat, spec.count]} renderOrder={20} raycast={() => null} frustumCulled={false} />;
}

const C = {
  glicose: '#F59E0B',
  piruvato: '#EC4899',
  o2: '#2563EB',
  co2: '#64748B',
  atp: '#EAB308',
  agua: '#38BDF8',
  luz: '#FDE047',
  acucar: '#F97316',
  h: '#DC2626',
};

function randomInside(points: THREE.Vector3[], n: number, spread: number) {
  return Array.from({ length: n }, (_, i) => points[i % points.length].clone().add(new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(spread)));
}
const outward = (pts: THREE.Vector3[], k: number) => pts.map((p) => p.clone().multiplyScalar(k));

/** Flows active per step for the particle-based processes. */
function useFlows(processId: string, a: Anchors): FlowSpec[][] {
  return useMemo(() => {
    const mem = a.membrane ?? a.outside ?? [];
    const outside = a.outside ?? outward(mem, 1.35);
    const mito = a.mitochondria ?? [];
    const cyto = randomInside(mito.length ? mito : [new THREE.Vector3()], 16, 0.7);
    switch (processId) {
      case 'respiracao':
        return [
          [
            { from: outward(mem, 1.3), to: cyto, color: C.glicose, count: 18, size: 0.035, trip: 3.2 },
            { from: cyto, to: randomInside(cyto, 12, 0.3), color: C.atp, count: 6, size: 0.026, trip: 1.6, arc: 0.4 },
          ],
          [
            { from: cyto, to: mito, color: C.piruvato, count: 22, size: 0.03, trip: 2.4 },
            { from: outward(mem, 1.3), to: mito, color: C.o2, count: 22, size: 0.03, trip: 3 },
          ],
          [{ from: mito, to: outward(mem, 1.3), color: C.co2, count: 26, size: 0.032, trip: 3 }],
          [
            { from: mito, to: randomInside(mito, 30, 0.9), color: C.atp, count: 44, size: 0.028, trip: 1.8, arc: 0.3 },
            { from: outward(mem, 1.3), to: mito, color: C.o2, count: 14, size: 0.028, trip: 3 },
          ],
        ];
      case 'respiracao-mito': {
        const matrix = a.matrix ?? [];
        const cristae = a.cristae ?? matrix;
        const ims = cristae.map((p) => p.clone().add(new THREE.Vector3(0, 0.06, 0)));
        return [
          [
            { from: outside, to: matrix, color: C.piruvato, count: 20, size: 0.045, trip: 3 },
            { from: outside, to: matrix, color: C.o2, count: 16, size: 0.04, trip: 3.4 },
          ],
          [{ from: matrix, to: outside, color: C.co2, count: 24, size: 0.045, trip: 3 }],
          [{ from: matrix, to: ims, color: C.h, count: 40, size: 0.03, trip: 1.6, arc: 0.05 }],
          [
            { from: ims, to: matrix, color: C.h, count: 30, size: 0.03, trip: 1.6, arc: 0.05 },
            { from: cristae, to: randomInside(matrix, 20, 0.5), color: C.atp, count: 30, size: 0.04, trip: 2.2, arc: 0.2 },
          ],
        ];
      }
      case 'fotossintese': {
        const ch = a.chloroplasts ?? [];
        const sky = ch.map((p) => p.clone().add(new THREE.Vector3(0.4, 2.6, 0.6)));
        return [
          [{ from: sky, to: ch, color: C.luz, count: 40, size: 0.03, trip: 1.4, arc: 0 }],
          [
            { from: a.vacuole ? randomInside(a.vacuole, 12, 1.2) : ch, to: ch, color: C.agua, count: 20, size: 0.028, trip: 2.4 },
            { from: ch, to: outward(a.wall ?? mem, 1.25), color: C.o2, count: 24, size: 0.03, trip: 3 },
          ],
          [{ from: outward(a.wall ?? mem, 1.3), to: ch, color: C.co2, count: 26, size: 0.032, trip: 3 }],
          [{ from: ch, to: (a.mitochondria ?? []).length ? a.mitochondria : randomInside(ch, 10, 0.5), color: C.acucar, count: 26, size: 0.032, trip: 2.6 }],
        ];
      }
      case 'fotossintese-cloro': {
        const grana = a.grana ?? [];
        const stroma = a.stroma ?? grana;
        const sun = grana.map((p) => p.clone().add(new THREE.Vector3(-0.6, 2.4, 1.2)));
        return [
          [
            { from: sun, to: grana, color: C.luz, count: 40, size: 0.04, trip: 1.4, arc: 0 },
            { from: outside, to: grana, color: C.agua, count: 14, size: 0.04, trip: 3 },
            { from: grana, to: outside, color: C.o2, count: 18, size: 0.04, trip: 3 },
          ],
          [{ from: outside, to: stroma, color: C.co2, count: 22, size: 0.045, trip: 3 }],
          [{ from: stroma, to: outside, color: C.acucar, count: 22, size: 0.045, trip: 3 }],
        ];
      }
      case 'osmose': {
        const vac = randomInside(a.vacuole ?? [new THREE.Vector3()], 14, 1.2);
        const out = outward(a.wall ?? mem, 1.3);
        const inFlow = { from: out, to: vac, color: C.agua, count: 30, size: 0.03, trip: 2.6 };
        const outFlow = { from: vac, to: out, color: C.agua, count: 30, size: 0.03, trip: 2.6 };
        return [[inFlow], [outFlow], [], [inFlow]];
      }
      default:
        return [];
    }
  }, [processId, a]);
}

function ParticleProcess({ processId, anchors }: { processId: string; anchors: Anchors }) {
  const steps = useFlows(processId, anchors);
  const step = useProcess((s) => s.step);
  return (
    <>
      {steps.map((flows, si) => flows.map((f, fi) => <Flow key={`${si}-${fi}`} spec={f} active={si === step} />))}
    </>
  );
}

// ------------------------------------------------------------------ secretion pathway

function Secretion({ anchors }: { anchors: Anchors }) {
  const marker = useRef<THREE.Mesh>(null);
  const vesicle = useRef<THREE.Mesh>(null);
  const path = useMemo(() => {
    const nuc = anchors.nucleus?.[0] ?? new THREE.Vector3();
    const chrom = anchors.chromatin?.[0] ?? nuc;
    const rer = anchors.rer?.[0] ?? nuc;
    const pore = nuc.clone().lerp(rer, 0.42);
    const cis = anchors.golgiCis?.[0] ?? rer;
    const trans = anchors.golgiTrans?.[0] ?? cis;
    const exit = anchors.exit?.[0] ?? trans;
    const beyond = exit.clone().multiplyScalar(1.25);
    return [
      [chrom, pore],
      [pore, rer],
      [rer, rer],
      [rer, cis],
      [cis, trans],
      [trans, exit, beyond],
    ] as THREE.Vector3[][];
  }, [anchors]);
  const line = useMemo(() => {
    const pts = path.flat();
    const g = new THREE.BufferGeometry().setFromPoints(new THREE.CatmullRomCurve3(pts).getPoints(120));
    return new THREE.Line(g, new THREE.LineDashedMaterial({ color: '#0E7490', dashSize: 0.04, gapSize: 0.03, transparent: true, opacity: 0.7, depthTest: false }));
  }, [path]);
  useEffect(() => {
    line.computeLineDistances();
    line.renderOrder = 19;
    line.raycast = () => null;
    return () => {
      line.geometry.dispose();
      (line.material as THREE.Material).dispose();
    };
  }, [line]);
  const step = useProcess((s) => s.step);

  useFrame((state) => {
    const st = useProcess.getState();
    const seg = path[st.step];
    const dur = CELL_PROCESSES.secrecao.steps[st.step].seconds;
    const u = THREE.MathUtils.smoothstep(Math.min(1, processClock.t / (dur * 0.85)), 0, 1);
    const pos = new THREE.Vector3();
    if (seg.length === 3) {
      // fuse at the membrane, then the content is released outside
      if (u < 0.6) pos.copy(seg[0]).lerp(seg[1], u / 0.6);
      else pos.copy(seg[1]).lerp(seg[2], (u - 0.6) / 0.4);
    } else pos.copy(seg[0]).lerp(seg[1], u);
    const pulse = 1 + 0.12 * Math.sin(state.clock.elapsedTime * 6);
    if (marker.current) {
      marker.current.position.copy(pos);
      const protein = st.step >= 2;
      const grow = st.step === 2 ? 0.4 + 0.6 * u : 1;
      marker.current.scale.setScalar((protein ? 0.04 * grow : 0.032) * pulse);
      (marker.current.material as THREE.MeshStandardMaterial).color.set(protein ? '#EAB308' : '#D946EF');
      (marker.current.material as THREE.MeshStandardMaterial).emissive.set(protein ? '#EAB308' : '#D946EF');
    }
    if (vesicle.current) {
      const inVesicle = st.step >= 3 && !(st.step === 5 && u > 0.6);
      vesicle.current.visible = inVesicle;
      vesicle.current.position.copy(pos);
    }
  });

  return (
    <>
      <primitive object={line} />
      <mesh ref={marker} renderOrder={21} raycast={() => null}>
        <icosahedronGeometry args={[1, 2]} />
        <meshStandardMaterial color="#D946EF" emissive="#D946EF" emissiveIntensity={0.6} depthTest={false} transparent />
      </mesh>
      <mesh ref={vesicle} renderOrder={20} raycast={() => null} visible={step >= 3}>
        <icosahedronGeometry args={[0.075, 3]} />
        <meshStandardMaterial color="#F6CF72" transparent opacity={0.45} depthWrite={false} depthTest={false} />
      </mesh>
    </>
  );
}

// ------------------------------------------------------------------ osmosis (scales the protoplast)

const PROTOPLAST_EXCLUDE = new Set(['parede-celular']);

function Osmosis() {
  const current = useRef({ proto: 1, vac: 1 });
  useEffect(
    () => () => {
      meshRegistry.forEach((_, m) => {
        m.scale.setScalar(1);
        m.updateMatrixWorld();
      });
    },
    [],
  );
  useFrame((_, dt) => {
    const st = useProcess.getState();
    const dur = CELL_PROCESSES.osmose.steps[st.step].seconds;
    const u = THREE.MathUtils.smoothstep(Math.min(1, processClock.t / dur), 0, 1);
    let proto = 1;
    let vac = 1;
    if (st.step === 1) {
      proto = 1 - 0.12 * u;
      vac = 1 - 0.3 * u;
    } else if (st.step === 2) {
      proto = 0.88 - 0.1 * u;
      vac = 0.7 - 0.12 * u;
    } else if (st.step === 3) {
      proto = 0.78 + 0.22 * u;
      vac = 0.58 + 0.42 * u;
    }
    const c = current.current;
    const k = Math.min(1, dt * 6);
    c.proto += (proto - c.proto) * k;
    c.vac += (vac - c.vac) * k;
    meshRegistry.forEach((_, m) => {
      const s = m.userData.structure as string;
      if (!s || PROTOPLAST_EXCLUDE.has(s)) return;
      const target = s === 'vacuolo' ? c.vac : c.proto;
      if (Math.abs(m.scale.x - target) > 1e-4) {
        m.scale.setScalar(target);
        m.updateMatrixWorld();
      }
    });
  });
  return null;
}

// ------------------------------------------------------------------ flagellum

function FlagellumSpin({ anchors }: { anchors: Anchors }) {
  const [base, tip] = anchors.flagellumAxis ?? [new THREE.Vector3(), new THREE.Vector3(1, 0, 0)];
  const axis = useMemo(() => tip.clone().sub(base).normalize(), [base, tip]);
  const angle = useRef(0);
  useEffect(
    () => () => {
      const m = meshRegistry.get('flagelo-bacteriano');
      if (m) {
        m.position.set(0, 0, 0);
        m.quaternion.identity();
        m.updateMatrixWorld();
      }
    },
    [],
  );
  useFrame((_, dt) => {
    const m = meshRegistry.get('flagelo-bacteriano');
    if (!m) return;
    if (useProcess.getState().playing) angle.current += dt * 5;
    const q = new THREE.Quaternion().setFromAxisAngle(axis, angle.current);
    m.quaternion.copy(q);
    // rotate about the line through `base`, not about the origin
    m.position.copy(base).sub(base.clone().applyQuaternion(q));
    m.updateMatrixWorld();
  });
  return null;
}

/** Renders the animation for the active process inside the canvas. */
export function ProcessLayer({ anchors }: { anchors: Anchors }) {
  const id = useProcess((s) => s.id);
  if (!id || id === 'mitose') return null;
  return (
    <group key={id}>
      {id === 'secrecao' && <Secretion anchors={anchors} />}
      {id === 'osmose' && <Osmosis />}
      {id === 'flagelo' && <FlagellumSpin anchors={anchors} />}
      {['respiracao', 'respiracao-mito', 'fotossintese', 'fotossintese-cloro', 'osmose'].includes(id) && <ParticleProcess processId={id} anchors={anchors} />}
    </group>
  );
}
