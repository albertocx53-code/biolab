'use client';

import { CameraControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useViewer, type CameraView } from '@/engine/store';
import { meshRegistry } from '@/engine/selection/registry';
import { interaction } from '@/engine/interaction';
import { QUALITY } from '@/engine/performance/quality';

export interface CameraPreset {
  position: [number, number, number];
  target: [number, number, number];
  /** Distance used for the 100 % zoom reference and for named views. */
  distance: number;
  minDistance: number;
  maxDistance: number;
}

const VIEW_DIR: Record<CameraView, [number, number, number]> = {
  frente: [0, 0, 1],
  costas: [0, 0, -1],
  esquerda: [1, 0, 0], // the subject's left side faces +X after glTF conversion
  direita: [-1, 0, 0],
  cima: [0, 1, 0.0001],
};

export function CameraRig({ preset }: { preset: CameraPreset }) {
  const ref = useRef<CameraControls>(null);
  const camera = useViewer((s) => s.camera);
  const setZoomPercent = useViewer((s) => s.setZoomPercent);
  const adaptive = useViewer((s) => QUALITY[s.quality].adaptive);
  const invalidate = useThree((s) => s.invalidate);
  const lastZoom = useRef(-1);
  const lastZoomAt = useRef(0);

  // Initial placement
  useEffect(() => {
    ref.current?.setLookAt(...preset.position, ...preset.target, false);
  }, [preset]);

  useEffect(() => {
    const c = ref.current;
    if (!c || !camera) return;
    const { cmd } = camera;
    if (cmd.type === 'reset') {
      void c.setLookAt(...preset.position, ...preset.target, true);
    } else if (cmd.type === 'view') {
      const target = new THREE.Vector3();
      c.getTarget(target);
      const d = VIEW_DIR[cmd.view];
      const dist = Math.max(c.distance, preset.minDistance * 2);
      void c.setLookAt(target.x + d[0] * dist, target.y + d[1] * dist, target.z + d[2] * dist, target.x, target.y, target.z, true);
    } else if (cmd.type === 'focus') {
      const box = meshRegistry.boundsOf(cmd.meshIds);
      if (box) {
        const size = box.getSize(new THREE.Vector3());
        // generous margin keeps anatomical context around small structures
        const pad = Math.max(0.07, Math.max(size.x, size.y, size.z) * 0.6);
        void c.fitToBox(box, true, { paddingTop: pad, paddingBottom: pad, paddingLeft: pad, paddingRight: pad });
      }
    } else if (cmd.type === 'zoom') {
      void c.dolly(c.distance * (1 - 1 / cmd.factor), true);
    }
    invalidate();
  }, [camera, preset, invalidate]);

  useEffect(
    () => () => {
      interaction.cameraMoving = false;
    },
    [],
  );

  return (
    <CameraControls
      ref={ref}
      makeDefault
      // lets <AdaptiveDpr> drop the resolution while the camera moves (restored at rest)
      regress={adaptive}
      minDistance={preset.minDistance}
      maxDistance={preset.maxDistance}
      smoothTime={0.35}
      draggingSmoothTime={0.08}
      dollyToCursor
      onStart={() => {
        interaction.cameraMoving = true;
      }}
      onEnd={() => {
        interaction.cameraMoving = false;
      }}
      onChange={() => {
        const c = ref.current;
        if (!c) return;
        // The zoom readout is UI state: update it at most ~8×/s and only when the integer changes,
        // so orbiting never re-renders the laboratory UI once per camera frame.
        const now = performance.now();
        if (now - lastZoomAt.current < 120) return;
        const pct = Math.round((preset.distance / Math.max(c.distance, 1e-3)) * 100);
        if (pct === lastZoom.current) return;
        lastZoom.current = pct;
        lastZoomAt.current = now;
        setZoomPercent(pct);
      }}
    />
  );
}
