/**
 * Runtime registry linking stable mesh ids to loaded Three.js meshes.
 * Used by camera focus, highlighting, isolation and labels without walking
 * the whole scene graph on every interaction.
 */
import * as THREE from 'three';

const meshes = new Map<string, THREE.Mesh>();
const listeners = new Set<() => void>();

export const meshRegistry = {
  register(id: string, mesh: THREE.Mesh) {
    meshes.set(id, mesh);
    listeners.forEach((l) => l());
  },
  unregister(id: string, mesh?: THREE.Mesh) {
    if (!mesh || meshes.get(id) === mesh) meshes.delete(id);
    listeners.forEach((l) => l());
  },
  get(id: string) {
    return meshes.get(id);
  },
  has(id: string) {
    return meshes.has(id);
  },
  forEach(cb: (id: string, mesh: THREE.Mesh) => void) {
    meshes.forEach((m, id) => cb(id, m));
  },
  size() {
    return meshes.size;
  },
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  /** World-space bounding box of the given meshes (only visible/loaded ones). */
  boundsOf(ids: string[]): THREE.Box3 | null {
    const box = new THREE.Box3();
    const tmp = new THREE.Box3();
    let any = false;
    for (const id of ids) {
      const m = meshes.get(id);
      if (!m) continue;
      if (!m.geometry.boundingBox) m.geometry.computeBoundingBox();
      tmp.copy(m.geometry.boundingBox!).applyMatrix4(m.matrixWorld);
      box.union(tmp);
      any = true;
    }
    return any ? box : null;
  },
};
