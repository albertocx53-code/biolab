'use client';

import type * as THREE from 'three';
import type { MaterialLibrary } from '@/engine/visibility/materials';
import { PoseView as SharedPoseView } from '@/laboratories/shared/PoseView';
import type { MeshDef } from '@/laboratories/shared/types';
import { GENETICS_PROCESSES } from './processes';

/** Genetics scenes: one process per scene, posed by the shared PoseView. */
export function PoseView({
  processId,
  pose,
  ...rest
}: {
  modelId: string;
  processId: string;
  meshes: MeshDef[];
  pose: (P: number, get: (id: string) => THREE.Object3D | undefined) => void;
  probe: string;
  library: MaterialLibrary;
  hover: boolean;
  onPick: (meshId: string) => void;
}) {
  return <SharedPoseView processes={GENETICS_PROCESSES} poses={{ [processId]: pose }} {...rest} />;
}
