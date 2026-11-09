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
  /** Soft velvet highlight (muscle fibres, skin). 0–1 */
  sheen?: number;
  sheenColor?: string;
  /** Thin wet coat (organs, cartilage, eyes). 0–1 */
  clearcoat?: number;
  clearcoatRoughness?: number;
  /** Pull an outer shell (skin) slightly towards the camera to avoid z-fighting. */
  polygonOffset?: boolean;
  /** Render both faces (open, cut-away shells). */
  doubleSide?: boolean;
  /** Use per-vertex colours baked into the geometry (multi-tone merged meshes). */
  vertexColors?: boolean;
}

export class MaterialLibrary {
  private base = new Map<string, THREE.MeshStandardMaterial>();
  private opacity = new Map<string, number>();
  readonly highlight: THREE.MeshStandardMaterial;
  readonly hoverMat: THREE.MeshStandardMaterial;
  readonly ghost: THREE.MeshStandardMaterial;

  constructor(private readonly specs: Record<string, MaterialSpec>, private readonly fallback: MaterialSpec) {
    // Drawn on top of everything (x-ray style) so a selected organ stays visible behind bones.
    this.highlight = new THREE.MeshStandardMaterial({ color: '#38C6E0', emissive: '#0E7490', emissiveIntensity: 0.25, roughness: 0.35, depthTest: false, transparent: true, opacity: 0.95, side: THREE.DoubleSide });
    this.hoverMat = new THREE.MeshStandardMaterial({ color: '#A5EEF8', emissive: '#0EA5C6', emissiveIntensity: 0.15, roughness: 0.45, side: THREE.DoubleSide });
    this.ghost = new THREE.MeshStandardMaterial({ color: '#9FB3C8', transparent: true, opacity: 0.06, depthWrite: false, roughness: 0.9 });
  }

  /** Material for a (group, class) pair; opacity is managed per group. */
  get(group: string, cls: string): THREE.MeshStandardMaterial {
    const key = `${group}::${cls}`;
    let m = this.base.get(key);
    if (!m) {
      const spec = this.specs[cls] ?? this.fallback;
      const physical = (spec.sheen ?? 0) > 0 || (spec.clearcoat ?? 0) > 0;
      const params = {
        color: new THREE.Color(spec.color),
        roughness: spec.roughness ?? 0.6,
        metalness: spec.metalness ?? 0,
        side: spec.doubleSide ? THREE.DoubleSide : THREE.FrontSide,
        vertexColors: !!spec.vertexColors,
      };
      m = physical
        ? new THREE.MeshPhysicalMaterial({
            ...params,
            sheen: spec.sheen ?? 0,
            sheenRoughness: 0.45,
            sheenColor: new THREE.Color(spec.sheenColor ?? '#ffffff'),
            clearcoat: spec.clearcoat ?? 0,
            clearcoatRoughness: spec.clearcoatRoughness ?? 0.35,
          })
        : new THREE.MeshStandardMaterial(params);
      if (spec.polygonOffset) {
        m.polygonOffset = true;
        m.polygonOffsetFactor = -2;
        m.polygonOffsetUnits = -4;
      }
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
