'use client';

import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import * as THREE from 'three';
import { useViewer, type ViewerState } from '@/engine/store';
import { meshRegistry } from '@/engine/selection/registry';
import type { MaterialLibrary } from '@/engine/visibility/materials';

/**
 * Applies viewer state (visibility, transparency, isolation, selection and
 * hover highlights) to registered meshes. Runs only when state changes —
 * never per frame.
 */
export function SceneSync({ library, meshesOf }: { library: MaterialLibrary; meshesOf: (structureId: string) => string[] }) {
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    let prevOpacity: Record<string, number> = {};
    const apply = (s: ViewerState) => {
      for (const [g, o] of Object.entries(s.groupOpacity)) {
        if (prevOpacity[g] !== o) library.setGroupOpacity(g, o);
      }
      prevOpacity = s.groupOpacity;
      const selected = new Set(s.selectedId ? meshesOf(s.selectedId) : []);
      const isolated = s.isolatedMeshIds ? new Set(s.isolatedMeshIds) : null;
      meshRegistry.forEach((id, mesh) => {
        const group = mesh.userData.group as string;
        const groupOn = s.groupVisible[group] ?? false;
        const hidden = !!s.hiddenMeshIds[id] || !!s.excludedMeshIds[id];
        let visible = groupOn && !hidden;
        let mat: THREE.Material = mesh.userData.base;
        if (isolated) {
          if (isolated.has(id)) visible = !hidden;
          else if (visible) mat = library.ghost;
        }
        const base = mesh.userData.base as THREE.Material;
        if (visible && selected.has(id)) mat = library.highlightFor(base);
        else if (visible && s.hoveredMeshId === id && mat !== library.ghost) mat = library.hoverFor(base);
        mesh.visible = visible;
        mesh.renderOrder = library.isHighlight(mat) ? 10 : 0;
        if (mesh.material !== mat) mesh.material = mat;
        // Ghosted / transparent meshes must not steal clicks from what is behind them.
        mesh.userData.raycast ??= mesh.raycast;
        mesh.raycast = mat === library.ghost ? noRaycast : mesh.userData.raycast;
      });
      invalidate();
    };
    apply(useViewer.getState());
    const unsubStore = useViewer.subscribe(apply);
    const unsubReg = meshRegistry.subscribe(() => apply(useViewer.getState()));
    return () => {
      unsubStore();
      unsubReg();
    };
  }, [library, meshesOf, invalidate]);

  return null;
}

function noRaycast() {}

