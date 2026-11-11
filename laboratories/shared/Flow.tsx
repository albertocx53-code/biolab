'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

// ------------------------------------------------------------------ particles

export interface FlowSpec {
  from?: THREE.Vector3[];
  to?: THREE.Vector3[];
  /** Polylines followed by the particles instead of from → to (e.g. up a stem). */
  paths?: THREE.Vector3[][];
  /** Random offset of each particle (default 0.12). */
  jitter?: number;
  color: string;
  count: number;
  size: number;
  /** Seconds for one trip. */
  trip: number;
  /** Arc height relative to the distance. */
  arc?: number;
}

/** Particles travelling from one set of points to another (molecules, light). */
export function Flow({ spec, active }: { spec: FlowSpec; active: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const fade = useRef(0);
  const seeds = useMemo(
    () =>
      Array.from({ length: spec.count }, (_, i) => ({
        a: i % (spec.from?.length || 1),
        b: (i * 7 + 3) % (spec.to?.length || 1),
        phase: i / spec.count + Math.random() * 0.05,
        jitter: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(spec.jitter ?? 0.12),
      })),
    [spec],
  );
  const curves = useMemo(() => spec.paths?.map((pts) => new THREE.CatmullRomCurve3(pts, false, 'centripetal')), [spec]);
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
      if (curves) {
        curves[i % curves.length].getPointAt(u, p).add(sd.jitter);
      } else {
        const a = spec.from![sd.a];
        const b = spec.to![sd.b];
        p.copy(a).lerp(b, u).add(sd.jitter);
        const arc = (spec.arc ?? 0.15) * a.distanceTo(b) * Math.sin(Math.PI * u);
        p.y += arc;
      }
      const k = spec.size * Math.min(1, Math.sin(Math.PI * u) * 3);
      s.setScalar(Math.max(k, 1e-4));
      m.compose(p, q, s);
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh ref={ref} args={[geo, mat, spec.count]} renderOrder={20} raycast={() => null} frustumCulled={false} />;
}

/** Random points around the given ones (deterministic count, random spread). */
export function randomInside(points: THREE.Vector3[], n: number, spread: number) {
  return Array.from({ length: n }, (_, i) => points[i % points.length].clone().add(new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(spread)));
}
