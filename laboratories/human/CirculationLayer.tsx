'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { meshRegistry } from '@/engine/selection/registry';
import { Flow, type FlowSpec } from '@/laboratories/shared/Flow';
import { processClock, useProcess } from '@/laboratories/shared/process';
import type { HumanIndex } from './catalog';
import { HUMAN_PROCESSES } from './processes';

const VENOUS = '#3B6FD6';
const ARTERIAL = '#E0352B';

/** Blood particle flows along the real vessel centres of the catalog. */
function useBloodFlows(index: HumanIndex): FlowSpec[][] {
  return useMemo(() => {
    const at = (id: string) => {
      const c = index.meshInfo.get(id)?.center;
      return c ? new THREE.Vector3(...c) : null;
    };
    const path = (...ids: string[]) => ids.map(at).filter((p): p is THREE.Vector3 => !!p);
    const heart = at('right-ventricle')?.clone().lerp(at('left-ventricle') ?? new THREE.Vector3(), 0.5) ?? new THREE.Vector3(0.02, 1.29, 0.03);
    const flow = (paths: THREE.Vector3[][], color: string, count = 26, trip = 2.8): FlowSpec => ({
      paths: paths.filter((p) => p.length >= 2),
      color,
      count,
      size: 0.0055,
      trip,
      jitter: 0.004,
    });
    const ra = at('right-atrium') ?? heart;
    const rv = at('right-ventricle') ?? heart;
    const la = at('left-atrium') ?? heart;
    const lv = at('left-ventricle') ?? heart;
    const cavaIn = [
      path('femoral-vein-dir', 'external-iliac-vein-dir', 'inferior-vena-cava-abdominal-part', 'inferior-vena-cava-thoracic-part').concat([ra]),
      path('femoral-vein-esq', 'external-iliac-vein-esq', 'inferior-vena-cava-abdominal-part', 'inferior-vena-cava-thoracic-part').concat([ra]),
      path('internal-jugular-vein-dir', 'right-brachiocephalic-vein', 'superior-vena-cava').concat([ra]),
      path('internal-jugular-vein-esq', 'left-brachiocephalic-vein', 'superior-vena-cava').concat([ra]),
      path('axillary-vein-dir', 'right-subclavian-vein', 'superior-vena-cava').concat([ra]),
      path('axillary-vein-esq', 'left-subclavian-vein', 'superior-vena-cava').concat([ra]),
    ];
    const raToRv = [[ra, ra.clone().lerp(rv, 0.5), rv]];
    const pulmArt = [
      [rv, ...path('pulmonary-trunk', 'bifurcation-of-pulmonary-trunk', 'right-pulmonary-artery', 'superior-lobar-artery-of-right-lung', 'apical-segmental-artery-of-right-lung')],
      [rv, ...path('pulmonary-trunk', 'bifurcation-of-pulmonary-trunk', 'right-pulmonary-artery', 'inferior-lobar-artery-of-right-lung', 'posterior-basal-segmental-artery-of-right-lung')],
      [rv, ...path('pulmonary-trunk', 'bifurcation-of-pulmonary-trunk', 'left-pulmonary-artery', 'apical-segmental-artery-of-left-lung')],
      [rv, ...path('pulmonary-trunk', 'bifurcation-of-pulmonary-trunk', 'left-pulmonary-artery', 'posterior-basal-segmental-artery-of-left-lung')],
    ];
    const pulmVeins = [
      path('apical-vein-of-right-lung', 'right-superior-pulmonary-vein').concat([la]),
      path('inferior-basal-vein-of-right-lung', 'right-inferior-pulmonary-vein').concat([la]),
      path('apicoposterior-vein-of-left-lung', 'left-superior-pulmonary-vein').concat([la]),
      path('inferior-basal-vein-of-left-lung', 'left-inferior-pulmonary-vein').concat([la]),
    ];
    const laToLv = [[la, la.clone().lerp(lv, 0.5), lv]];
    const aortaOut = [
      [lv, ...path('ascending-aorta', 'aortic-arch', 'thoracic-aorta', 'abdominal-aorta', 'common-iliac-artery-dir', 'external-iliac-artery-dir', 'femoral-artery-dir', 'popliteal-artery-dir', 'anterior-tibial-artery-dir')],
      [lv, ...path('ascending-aorta', 'aortic-arch', 'thoracic-aorta', 'abdominal-aorta', 'common-iliac-artery-esq', 'external-iliac-artery-esq', 'femoral-artery-esq', 'popliteal-artery-esq', 'anterior-tibial-artery-esq')],
      [lv, ...path('ascending-aorta', 'aortic-arch', 'brachiocephalic-trunk', 'right-common-carotid-artery', 'internal-carotid-artery-dir')],
      [lv, ...path('ascending-aorta', 'aortic-arch', 'left-common-carotid-artery', 'internal-carotid-artery-esq')],
      [lv, ...path('ascending-aorta', 'aortic-arch', 'brachiocephalic-trunk', 'right-subclavian-artery', 'axillary-artery-dir', 'brachial-artery-dir', 'radial-artery-dir')],
      [lv, ...path('ascending-aorta', 'aortic-arch', 'left-subclavian-artery', 'axillary-artery-esq', 'brachial-artery-esq', 'radial-artery-esq')],
      [lv, ...path('ascending-aorta', 'aortic-arch', 'thoracic-aorta', 'abdominal-aorta', 'left-renal-artery')],
      [lv, ...path('ascending-aorta', 'aortic-arch', 'thoracic-aorta', 'abdominal-aorta', 'superior-mesenteric-artery')],
    ];
    const venous = flow(cavaIn, VENOUS, 36, 4.5);
    const arterial = flow(aortaOut, ARTERIAL, 60, 5.5);
    return [
      [venous],
      [flow(raToRv, VENOUS, 14, 1.6), venous],
      [flow(pulmArt, VENOUS, 30, 3), flow(pulmVeins, ARTERIAL, 16, 3)],
      [flow(pulmVeins, ARTERIAL, 24, 2.6)],
      [flow(laToLv, ARTERIAL, 14, 1.6), flow(pulmVeins, ARTERIAL, 12, 2.6)],
      [arterial, venous],
    ];
  }, [index]);
}

function BloodFlow({ index }: { index: HumanIndex }) {
  const flows = useBloodFlows(index);
  const step = useProcess((s) => s.step);
  return (
    <>
      {flows.map((list, si) => list.map((f, fi) => <Flow key={`${si}-${fi}`} spec={f} active={si === step} />))}
    </>
  );
}

/** Rhythmic contraction of the heart meshes about the heart centre (GLB meshes keep their own matrices). */
function Heartbeat({ centre, meshIds }: { centre: THREE.Vector3; meshIds: string[] }) {
  const phase = useMemo(() => ({ t: 0 }), []);
  useEffect(
    () => () => {
      for (const id of meshIds) {
        const m = meshRegistry.get(id);
        if (m?.userData.restMatrix) {
          m.matrix.copy(m.userData.restMatrix);
          m.updateMatrixWorld(true);
        }
      }
    },
    [meshIds],
  );
  useFrame((_, dt) => {
    const st = useProcess.getState();
    if (!st.id) return;
    const cyclic = st.id === 'ciclo-cardiaco';
    let s = 1;
    if (cyclic) {
      // follow the step: fill in diastole, squeeze in ventricular systole
      const dur = HUMAN_PROCESSES['ciclo-cardiaco'].steps[st.step].seconds;
      const u = Math.min(1, processClock.t / dur);
      const target = st.step === 0 ? 1 + 0.03 * u : st.step === 1 ? 1.03 : st.step === 2 ? 1.03 - 0.09 * u : 0.94 + 0.06 * u;
      s = target;
    } else {
      if (st.playing) phase.t += dt;
      s = 1 + 0.028 * Math.sin(phase.t * 2 * Math.PI * 1.15);
    }
    const m4 = new THREE.Matrix4();
    const scale = new THREE.Matrix4().makeScale(s, s, s);
    const toC = new THREE.Matrix4().makeTranslation(centre.x, centre.y, centre.z);
    const fromC = new THREE.Matrix4().makeTranslation(-centre.x, -centre.y, -centre.z);
    for (const id of meshIds) {
      const m = meshRegistry.get(id);
      if (!m) continue;
      m.userData.restMatrix ??= m.matrix.clone();
      m4.copy(toC).multiply(scale).multiply(fromC).multiply(m.userData.restMatrix as THREE.Matrix4);
      m.matrix.copy(m4);
      m.updateMatrixWorld(true);
    }
  });
  return null;
}

/** Renders the circulation animations inside the canvas while one of them is active. */
export function CirculationLayer({ index }: { index: HumanIndex }) {
  const id = useProcess((s) => s.id);
  const heartMeshes = useMemo(() => index.meshesOf('coracao'), [index]);
  const centre = useMemo(() => heartCentre(index), [index]);
  if (!id) return null;
  return (
    <group key={id}>
      {id === 'circulacao' && <BloodFlow index={index} />}
      <Heartbeat centre={centre} meshIds={heartMeshes} />
    </group>
  );
}

/** Centre of the heart (mean of its chamber centres). */
export function heartCentre(index: HumanIndex) {
  const ids = ['right-atrium', 'left-atrium', 'right-ventricle', 'left-ventricle'];
  const c = new THREE.Vector3();
  let n = 0;
  for (const id of ids) {
    const m = index.meshInfo.get(id);
    if (m) {
      c.add(new THREE.Vector3(...m.center));
      n++;
    }
  }
  return n ? c.divideScalar(n) : new THREE.Vector3(0.02, 1.29, 0.03);
}
