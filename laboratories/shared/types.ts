import type * as THREE from 'three';
import type { CameraPreset } from '@/components/3d/CameraRig';

/** One clickable mesh of a procedural model. */
export interface MeshDef {
  id: string;
  structure: string;
  /** Material class (defaults to the structure id). */
  cls?: string;
  geometry: THREE.BufferGeometry;
}

export interface BuiltModel {
  meshes: MeshDef[];
  /** Named points used by the process animations. */
  anchors: Record<string, THREE.Vector3[]>;
  preset: CameraPreset;
}

/** Camera preset looking at `target` from `dist`, elevated by `elev` rad, around the Y axis at `phi`. */
export function presetFor(dist: number, target: [number, number, number], elev: number, phi: number): CameraPreset {
  const p: [number, number, number] = [
    target[0] + Math.sin(phi) * Math.cos(elev) * dist,
    target[1] + Math.sin(elev) * dist,
    target[2] + Math.cos(phi) * Math.cos(elev) * dist,
  ];
  return { position: p, target, distance: dist, minDistance: 0.25, maxDistance: dist * 2.4 };
}
