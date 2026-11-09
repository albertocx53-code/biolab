/**
 * Shared material library. Thousands of meshes reuse a handful of materials
 * (one per material class × group), which keeps draw-state changes and GPU
 * memory low. Highlight/ghost materials are also shared.
 */
import * as THREE from 'three';

export interface MaterialSpec {
  color: string;
  roughness?: number;
  metalness?: number;
  sheen?: boolean;
}

export class MaterialLibrary {
  private base = new Map<string, THREE.MeshStandardMaterial>();
  private opacity = new Map<string, number>();
  readonly highlight: THREE.MeshStandardMaterial;
  readonly hoverMat: THREE.MeshStandardMaterial;
  readonly ghost: THREE.MeshStandardMaterial;

  constructor(private readonly specs: Record<string, MaterialSpec>, private readonly fallback: MaterialSpec) {
    // Drawn on top of everything (x-ray style) so a selected organ stays visible behind bones.
    this.highlight = new THREE.MeshStandardMaterial({ color: '#7DEBFA', emissive: '#22D3EE', emissiveIntensity: 0.55, roughness: 0.45, depthTest: false, transparent: true, opacity: 0.92 });
    this.hoverMat = new THREE.MeshStandardMaterial({ color: '#BDF4FC', emissive: '#22D3EE', emissiveIntensity: 0.18, roughness: 0.5 });
    this.ghost = new THREE.MeshStandardMaterial({ color: '#9FB3C8', transparent: true, opacity: 0.06, depthWrite: false, roughness: 0.9 });
  }

  /** Material for a (group, class) pair; opacity is managed per group. */
  get(group: string, cls: string): THREE.MeshStandardMaterial {
    const key = `${group}::${cls}`;
    let m = this.base.get(key);
    if (!m) {
      const spec = this.specs[cls] ?? this.fallback;
      m = new THREE.MeshStandardMaterial({
        color: new THREE.Color(spec.color),
        roughness: spec.roughness ?? 0.6,
        metalness: spec.metalness ?? 0,
        side: THREE.FrontSide,
      });
      m.userData.group = group;
      this.base.set(key, m);
      this.applyOpacity(m, this.opacity.get(group) ?? 1);
    }
    return m;
  }

  setGroupOpacity(group: string, opacity: number) {
    this.opacity.set(group, opacity);
    for (const m of this.base.values()) if (m.userData.group === group) this.applyOpacity(m, opacity);
  }

  private applyOpacity(m: THREE.MeshStandardMaterial, opacity: number) {
    const transparent = opacity < 0.999;
    if (m.transparent !== transparent) m.needsUpdate = true;
    m.transparent = transparent;
    m.opacity = opacity;
    m.depthWrite = !transparent;
  }

  dispose() {
    for (const m of this.base.values()) m.dispose();
    this.base.clear();
    this.highlight.dispose();
    this.hoverMat.dispose();
    this.ghost.dispose();
  }
}
