'use client';

import { useThree, type ThreeEvent } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { pickHit } from '@/components/3d/GltfModel';
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

/**
 * Turns procedural mesh definitions into registered Three.js meshes that the
 * shared engine (SceneSync, CameraRig, selection, isolation) drives exactly
 * like the meshes of a GLB model.
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
      if (!dynamic?.has(def.id) && !def.geometry.boundsTree) def.geometry.computeBoundsTree();
      def.geometry.computeBoundingBox();
      def.geometry.computeBoundingSphere();
      g.add(mesh);
    }
    g.updateMatrixWorld(true);
    return g;
  }, [meshes, library, dynamic]);

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

  // free GPU/CPU memory when the model changes or the lab closes
  useEffect(
    () => () => {
      for (const def of meshes) {
        def.geometry.disposeBoundsTree?.();
        def.geometry.dispose();
      }
    },
    [meshes],
  );

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 6) return;
    e.stopPropagation();
    const hit = pickHit(e.intersections, library);
    if (hit) onPick(hit.object.userData.meshId);
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

  return <primitive object={group} onClick={handleClick} onPointerMove={handleMove} onPointerOut={hover ? () => setHover(null) : undefined} />;
}
