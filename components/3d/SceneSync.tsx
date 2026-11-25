'use client';

import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import * as THREE from 'three';
import { useViewer, type ViewerState } from '@/engine/store';
import { meshRegistry } from '@/engine/selection/registry';
import type { MaterialLibrary } from '@/engine/visibility/materials';

/**
 * Applies viewer state (visibility, transparency, isolation, selection and
 * hover highlights) to registered meshes. Runs only when the relevant slices
 * of the state change — never per frame — and a hover or selection change
 * touches only the meshes involved instead of the whole scene.
 */
export function SceneSync({ library, meshesOf }: { library: MaterialLibrary; meshesOf: (structureId: string) => string[] }) {
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    let prevOpacity: Record<string, number> = {};
    let prev: ViewerState | null = null;
    let selectedSet = new Set<string>();
    let isolatedSet: Set<string> | null = null;

    const applyMesh = (id: string, mesh: THREE.Mesh, s: ViewerState) => {
      const group = mesh.userData.group as string;
      const groupOn = (s.groupVisible[group] ?? false) || !!s.pinnedMeshIds[id];
      const hidden = !!s.hiddenMeshIds[id] || !!s.excludedMeshIds[id];
      let visible = groupOn && !hidden;
      const base = mesh.userData.base as THREE.Material;
      let mat: THREE.Material = base;
      if (isolatedSet) {
        if (isolatedSet.has(id)) visible = !hidden;
        else if (s.isolationMode === 'solo') visible = false; // "only this organ": nothing else is drawn
        else if (visible) mat = library.ghost;
      }
      // in "solo" the stage already singles the structure out: keep its natural colours instead of the glow
      const solo = !!isolatedSet && s.isolationMode === 'solo';
      if (visible && selectedSet.has(id) && !solo) mat = library.highlightFor(base);
      else if (visible && s.hoveredMeshId === id && mat !== library.ghost) mat = library.hoverFor(base);
      mesh.visible = visible;
      mesh.renderOrder = library.isHighlight(mat) ? 10 : 0;
      if (mesh.material !== mat) mesh.material = mat;
      // Ghosted / transparent meshes must not steal clicks from what is behind them.
      mesh.userData.raycast ??= mesh.raycast;
      mesh.raycast = mat === library.ghost ? noRaycast : mesh.userData.raycast;
    };

    const applyAll = (s: ViewerState) => {
      for (const [g, o] of Object.entries(s.groupOpacity)) {
        if (prevOpacity[g] !== o) library.setGroupOpacity(g, o);
      }
      prevOpacity = s.groupOpacity;
      selectedSet = new Set(s.selectedId ? meshesOf(s.selectedId) : []);
      isolatedSet = s.isolatedMeshIds ? new Set(s.isolatedMeshIds) : null;
      meshRegistry.forEach((id, mesh) => applyMesh(id, mesh, s));
      prev = s;
      invalidate();
    };

    /** Re-applies only the meshes named (hover / selection changes). */
    const applySome = (ids: Iterable<string>, s: ViewerState) => {
      for (const id of ids) {
        const mesh = meshRegistry.get(id);
        if (mesh) applyMesh(id, mesh, s);
      }
      prev = s;
      invalidate();
    };

    const onStore = (s: ViewerState) => {
      const p = prev;
      if (!p) return applyAll(s);
      const structural =
        p.groupVisible !== s.groupVisible ||
        p.groupOpacity !== s.groupOpacity ||
        p.hiddenMeshIds !== s.hiddenMeshIds ||
        p.excludedMeshIds !== s.excludedMeshIds ||
        p.pinnedMeshIds !== s.pinnedMeshIds ||
        p.isolatedMeshIds !== s.isolatedMeshIds ||
        p.isolationMode !== s.isolationMode;
      if (structural) return applyAll(s);
      if (p.selectedId !== s.selectedId) {
        const touched = new Set<string>(selectedSet);
        selectedSet = new Set(s.selectedId ? meshesOf(s.selectedId) : []);
        for (const id of selectedSet) touched.add(id);
        if (p.hoveredMeshId) touched.add(p.hoveredMeshId);
        if (s.hoveredMeshId) touched.add(s.hoveredMeshId);
        return applySome(touched, s);
      }
      if (p.hoveredMeshId !== s.hoveredMeshId) {
        const touched: string[] = [];
        if (p.hoveredMeshId) touched.push(p.hoveredMeshId);
        if (s.hoveredMeshId) touched.push(s.hoveredMeshId);
        return applySome(touched, s);
      }
      // zoom readout, camera commands, panels, model load state…: nothing to do on the meshes
      prev = s;
    };

    applyAll(useViewer.getState());
    const unsubStore = useViewer.subscribe(onStore);
    // registry notifications are batched per microtask (one pass per model loaded, not per mesh)
    const unsubReg = meshRegistry.subscribe(() => applyAll(useViewer.getState()));
    return () => {
      unsubStore();
      unsubReg();
    };
  }, [library, meshesOf, invalidate]);

  return null;
}

function noRaycast() {}
