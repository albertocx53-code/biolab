'use client';

import { useThree, type ThreeEvent } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { pickHit } from '@/components/3d/GltfModel';
import { interaction } from '@/engine/interaction';
import { meshRegistry } from '@/engine/selection/registry';
import { useViewer } from '@/engine/store';
import type { MaterialLibrary } from '@/engine/visibility/materials';
import type { MeshDef } from './types';

interface Props {
  modelId: string;
  meshes: MeshDef[];
  library: MaterialLibrary;
  hover: boolean;
  onPick: (meshId: string) => void;
  /** Meshes whose geometry deforms every frame (no BVH, bounds refreshed by the owner). */
  dynamic?: Set<string>;
}

const disposeTimers = new Map<MeshDef[], ReturnType<typeof setTimeout>>();

type IdleHandle = number;
const requestIdle: (cb: () => void) => IdleHandle =
  typeof window !== 'undefined' && 'requestIdleCallback' in window
    ? (cb) => (window as Window & { requestIdleCallback: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback(cb, { timeout: 400 })
    : (cb) => window.setTimeout(cb, 16) as unknown as IdleHandle;
const cancelIdle: (h: IdleHandle) => void =
  typeof window !== 'undefined' && 'cancelIdleCallback' in window ? (h) => (window as Window & { cancelIdleCallback: (h: number) => void }).cancelIdleCallback(h) : (h) => clearTimeout(h);

/**
 * Turns procedural mesh definitions into registered Three.js meshes that the
 * shared engine (SceneSync, CameraRig, selection, isolation) drives exactly
 * like the meshes of a GLB model.
 *
 * Picking acceleration (BVH) is built after the first paint, one mesh per idle
 * slice, so opening a model never blocks on it; until then picking falls back
 * to the plain raycast, which is fine for a few clicks.
 */
export function ProceduralModelView({ modelId, meshes, library, hover, onPick, dynamic }: Props) {
  const invalidate = useThree((s) => s.invalidate);
  const setHover = useViewer((s) => s.hover);
  const lastHover = useRef(0);

  const group = useMemo(() => {
    const g = new THREE.Group();
    for (const def of meshes) {
      const mat = library.get(def.structure, def.cls ?? def.structure);
      const mesh = new THREE.Mesh(def.geometry, mat);
      mesh.name = def.id;
      mesh.userData = { meshId: def.id, group: def.structure, base: mat, structure: def.structure };
      if (!def.geometry.boundingBox) def.geometry.computeBoundingBox();
      if (!def.geometry.boundingSphere) def.geometry.computeBoundingSphere();
      g.add(mesh);
    }
    g.updateMatrixWorld(true);
    return g;
  }, [meshes, library]);

  useEffect(() => {
    const registered: [string, THREE.Mesh][] = [];
    group.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh && m.userData.meshId) {
        meshRegistry.register(m.userData.meshId, m);
        registered.push([m.userData.meshId, m]);
      }
    });
    useViewer.getState().setModelState(modelId, 'ready');
    invalidate();
    return () => {
      for (const [id, m] of registered) meshRegistry.unregister(id, m);
    };
  }, [group, modelId, invalidate]);

  // deferred BVH build (largest meshes first: they are the ones a brute-force raycast would feel)
  useEffect(() => {
    const queue = meshes.filter((d) => !dynamic?.has(d.id) && !d.geometry.boundsTree).sort((a, b) => (b.geometry.index?.count ?? 0) - (a.geometry.index?.count ?? 0));
    let handle: IdleHandle | null = null;
    const next = () => {
      const def = queue.shift();
      if (!def) {
        handle = null;
        return;
      }
      if (!def.geometry.boundsTree) def.geometry.computeBoundsTree();
      handle = requestIdle(next);
    };
    if (queue.length) handle = requestIdle(next);
    return () => {
      if (handle !== null) cancelIdle(handle);
    };
  }, [meshes, dynamic]);

  // Free GPU/CPU memory when the model changes or the lab closes. Disposal is deferred so a quick
  // remount (React StrictMode in development, a cached scene shown again) keeps its buffers.
  useEffect(() => {
    const pending = disposeTimers.get(meshes);
    if (pending) {
      clearTimeout(pending);
      disposeTimers.delete(meshes);
    }
    return () => {
      disposeTimers.set(
        meshes,
        setTimeout(() => {
          disposeTimers.delete(meshes);
          for (const def of meshes) {
            def.geometry.disposeBoundsTree?.();
            def.geometry.dispose();
          }
        }, 1500),
      );
    };
  }, [meshes]);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 6) return;
    e.stopPropagation();
    const hit = pickHit(e.intersections, library);
    if (hit) onPick(hit.object.userData.meshId);
  };
  const handleMove = hover
    ? (e: ThreeEvent<PointerEvent>) => {
        if (interaction.cameraMoving) return; // orbiting: no hover work
        const now = performance.now();
        if (now - lastHover.current < 50) return;
        lastHover.current = now;
        e.stopPropagation();
        const hit = pickHit(e.intersections, library);
        setHover(hit ? hit.object.userData.meshId : null);
      }
    : undefined;

  return <primitive object={group} onClick={handleClick} onPointerMove={handleMove} onPointerOut={hover ? () => setHover(null) : undefined} />;
}
