'use client';

import { useGLTF } from '@react-three/drei';
import { useThree, type ThreeEvent } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { acceleratedRaycast, computeBoundsTree, disposeBoundsTree } from 'three-mesh-bvh';
import type { CatalogMesh, CatalogModel } from '@/engine/types';
import type { MaterialLibrary } from '@/engine/visibility/materials';
import { meshRegistry } from '@/engine/selection/registry';
import { useViewer } from '@/engine/store';

export const DRACO_PATH = '/draco/';
const disposeTimers = new Map<string, ReturnType<typeof setTimeout>>();

// BVH-accelerated raycasting (three-mesh-bvh, MIT): picking stays fast with thousands of meshes.
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

interface Props {
  model: CatalogModel;
  meshInfo: Map<string, CatalogMesh>;
  library: MaterialLibrary;
  hover: boolean;
  onPick: (meshId: string, point: THREE.Vector3) => void;
}

/**
 * Loads one GLB, assigns shared materials, registers its meshes and forwards
 * pointer interaction. Geometry is disposed when the model unmounts.
 */
export function GltfModel({ model, meshInfo, library, hover, onPick }: Props) {
  const gltf = useGLTF(model.url, DRACO_PATH);
  const setHover = useViewer((s) => s.hover);
  const invalidate = useThree((s) => s.invalidate);
  const lastHover = useRef(0);

  const root = useMemo(() => {
    const scene = gltf.scene;
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) {
        // Container nodes may carry an exporter visibility flag; mesh visibility is managed by SceneSync.
        o.visible = true;
        return;
      }
      const id = mesh.name;
      const info = meshInfo.get(id);
      const group = info?.group ?? 'outros';
      const mat = library.get(group, info?.material ?? 'default');
      mesh.userData.meshId = id;
      mesh.userData.group = group;
      mesh.userData.base = mat;
      mesh.material = mat;
      if (!mesh.geometry.boundsTree) mesh.geometry.computeBoundsTree();
      mesh.matrixAutoUpdate = false;
      mesh.updateMatrix();
    });
    scene.updateMatrixWorld(true);
    return scene;
  }, [gltf, meshInfo, library]);

  useEffect(() => {
    // A Suspense boundary may have hidden this subtree while a model was pending; mesh-level
    // visibility is owned by SceneSync, so the container itself must always be visible.
    root.visible = true;
    const registered: [string, THREE.Mesh][] = [];
    root.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh && mesh.userData.meshId) {
        meshRegistry.register(mesh.userData.meshId, mesh);
        registered.push([mesh.userData.meshId, mesh]);
      }
    });
    useViewer.getState().setModelState(model.id, 'ready');
    invalidate();
    return () => {
      for (const [id, mesh] of registered) meshRegistry.unregister(id, mesh);
    };
  }, [root, model.id, invalidate]);

  // Leaving the laboratory: free GPU/CPU memory held by this model. Disposal is deferred so a
  // quick remount (React StrictMode, fast navigation back) reuses the cached asset instead.
  useEffect(() => {
    const url = model.url;
    const pending = disposeTimers.get(url);
    if (pending) {
      clearTimeout(pending);
      disposeTimers.delete(url);
    }
    return () => {
      disposeTimers.set(
        url,
        setTimeout(() => {
          disposeTimers.delete(url);
          root.traverse((o) => {
            const mesh = o as THREE.Mesh;
            if (mesh.isMesh) {
              mesh.geometry.disposeBoundsTree();
              mesh.geometry.dispose();
            }
          });
          useGLTF.clear(url);
          useViewer.getState().setModelState(model.id, 'idle');
        }, 1500),
      );
    };
  }, [root, model.url, model.id]);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 6) return; // was a drag/orbit, not a click
    e.stopPropagation();
    const hit = pickHit(e.intersections, library);
    if (hit) onPick(hit.object.userData.meshId, hit.point.clone());
  };

  const handleMove = hover
    ? (e: ThreeEvent<PointerEvent>) => {
        const now = performance.now();
        if (now - lastHover.current < 50) return;
        lastHover.current = now;
        e.stopPropagation();
        const hit = pickHit(e.intersections, library);
        setHover(hit ? hit.object.userData.meshId : null);
      }
    : undefined;

  return (
    <primitive
      object={root}
      onClick={handleClick}
      onPointerMove={handleMove}
      onPointerOut={hover ? () => setHover(null) : undefined}
    />
  );
}


/**
 * Chooses what a click refers to: the nearest visible, non-ghosted mesh that is
 * reasonably opaque. A semi-transparent outer layer (e.g. skin at 20 %) is only
 * picked when nothing solid lies behind it, so inner organs stay clickable.
 */
export function pickHit(intersections: THREE.Intersection[], library: MaterialLibrary): THREE.Intersection | null {
  let fallback: THREE.Intersection | null = null;
  for (const i of intersections) {
    const m = i.object as THREE.Mesh;
    if (!m.isMesh || !m.visible || !m.userData.meshId || m.material === library.ghost) continue;
    const mat = m.material as THREE.Material;
    if (mat.transparent && mat.opacity < 0.5) {
      fallback ??= i;
      continue;
    }
    return i;
  }
  return fallback;
}
