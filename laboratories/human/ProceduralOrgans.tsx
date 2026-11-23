'use client';

import { useEffect, useState } from 'react';
import * as THREE from 'three';
import { ModelScene, prepareMesh } from '@/components/3d/GltfModel';
import type { CatalogMesh } from '@/engine/types';
import type { MaterialLibrary } from '@/engine/visibility/materials';
import { EXTRA_MESHES, EXTRA_MODEL_ID } from './extra-catalog';
import { buildExtraOrgans } from './organs';

/**
 * Kidneys, brain and female reproductive organs built in code (see organs.ts)
 * and shown through the same picking/visibility path as the GLB models.
 * Geometry is generated once, after the first paint, and freed on unmount.
 */
export function ProceduralOrgans({ meshInfo, library, hover, onPick }: { meshInfo: Map<string, CatalogMesh>; library: MaterialLibrary; hover: boolean; onPick: (meshId: string, point: THREE.Vector3) => void }) {
  const [root, setRoot] = useState<THREE.Group | null>(null);

  useEffect(() => {
    let group: THREE.Group | null = null;
    const t = setTimeout(() => {
      const geos = buildExtraOrgans();
      group = new THREE.Group();
      group.name = EXTRA_MODEL_ID;
      for (const m of EXTRA_MESHES) {
        const geo = geos.get(m.id);
        if (!geo) continue;
        const mesh = new THREE.Mesh(geo);
        prepareMesh(mesh, m.id, meshInfo, library);
        group.add(mesh);
      }
      group.updateMatrixWorld(true);
      setRoot(group);
    }, 0);
    return () => {
      clearTimeout(t);
      group?.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.isMesh) {
          mesh.geometry.disposeBoundsTree();
          mesh.geometry.dispose();
        }
      });
    };
  }, [meshInfo, library]);

  return root ? <ModelScene root={root} modelId={EXTRA_MODEL_ID} library={library} hover={hover} onPick={onPick} /> : null;
}
