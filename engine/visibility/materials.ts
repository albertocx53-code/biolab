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
  /** Self-illumination (glowing particles, light-emitting structures). */
  emissive?: string;
  emissiveIntensity?: number;
  /**
   * Organic look for living tissue: procedural fine-grain colour/roughness
   * variation and a soft translucent rim (fresnel) so surfaces read as wet,
   * slightly see-through membranes instead of plastic.
   */
  organic?: OrganicSpec;
}

export interface OrganicSpec {
  /** Strength of the colour/roughness grain, 0–1 (default 0.25). */
  noise?: number;
  /** Size of the grain in scene units (default 6 = ~0.17 units per cell). */
  scale?: number;
  /** Strength of the rim light, 0–1 (default 0.35). */
  rim?: number;
  rimColor?: string;
  /** Rim falloff exponent (default 3). */
  rimPower?: number;
}

/**
 * GLSL patch applied through onBeforeCompile: 3D value noise on the object
 * position (stable across frames, no textures) and a fresnel rim term.
 */
const ORGANIC_VERTEX = `
varying vec3 vOrgPos;
`;
const ORGANIC_FRAGMENT = `
uniform float uOrgNoise;
uniform float uOrgScale;
uniform float uOrgRim;
uniform float uOrgRimPower;
uniform vec3 uOrgRimColor;
varying vec3 vOrgPos;
float orgHash(vec3 p) {
  p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float orgNoise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(orgHash(i), orgHash(i + vec3(1, 0, 0)), f.x), mix(orgHash(i + vec3(0, 1, 0)), orgHash(i + vec3(1, 1, 0)), f.x), f.y),
    mix(mix(orgHash(i + vec3(0, 0, 1)), orgHash(i + vec3(1, 0, 1)), f.x), mix(orgHash(i + vec3(0, 1, 1)), orgHash(i + vec3(1, 1, 1)), f.x), f.y),
    f.z);
}
`;

export function applyOrganic(m: THREE.MeshStandardMaterial, o: OrganicSpec) {
  const uniforms = {
    uOrgNoise: { value: o.noise ?? 0.25 },
    uOrgScale: { value: o.scale ?? 6 },
    uOrgRim: { value: o.rim ?? 0.35 },
    uOrgRimPower: { value: o.rimPower ?? 3 },
    uOrgRimColor: { value: new THREE.Color(o.rimColor ?? '#ffffff') },
  };
  m.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${ORGANIC_VERTEX}`)
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvOrgPos = transformed;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${ORGANIC_FRAGMENT}`)
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
float orgN = orgNoise(vOrgPos * uOrgScale) * 0.62 + orgNoise(vOrgPos * uOrgScale * 3.7) * 0.38;
diffuseColor.rgb *= 1.0 + uOrgNoise * (orgN * 2.0 - 1.0);`,
      )
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = clamp(roughnessFactor + (orgN - 0.5) * uOrgNoise * 0.7, 0.04, 1.0);')
      .replace(
        '#include <opaque_fragment>',
        `float orgFres = pow(1.0 - saturate(dot(normalize(normal), normalize(vViewPosition))), uOrgRimPower);
outgoingLight += uOrgRimColor * orgFres * uOrgRim;
#include <opaque_fragment>`,
      );
  };
  m.customProgramCacheKey = () => 'biolab-organic';
  m.userData.organic = uniforms;
  return m;
}

export class MaterialLibrary {
  private base = new Map<string, THREE.MeshStandardMaterial>();
  private opacity = new Map<string, number>();
  private highlights = new WeakMap<THREE.Material, THREE.MeshStandardMaterial>();
  private hovers = new WeakMap<THREE.Material, THREE.MeshStandardMaterial>();
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
        emissive: new THREE.Color(spec.emissive ?? '#000000'),
        emissiveIntensity: spec.emissiveIntensity ?? 1,
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
      if (spec.organic) applyOrganic(m, spec.organic);
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

  /**
   * Selection material derived from a mesh's own material: same colour and
   * finish, lifted by a cyan glow and drawn with a depth test, so a selected
   * organ keeps its shape and detail instead of becoming a flat silhouette.
   */
  highlightFor(base: THREE.Material): THREE.MeshStandardMaterial {
    let h = this.highlights.get(base);
    if (!h) {
      h = (base as THREE.MeshStandardMaterial).clone();
      h.emissive = new THREE.Color('#0EA5C6');
      h.emissiveIntensity = 0.42;
      h.color = (base as THREE.MeshStandardMaterial).color.clone().lerp(new THREE.Color('#5DD5EA'), 0.35);
      h.transparent = false;
      h.opacity = 1;
      h.depthWrite = true;
      h.side = THREE.DoubleSide;
      h.polygonOffset = true;
      h.polygonOffsetFactor = -1;
      h.polygonOffsetUnits = -2;
      h.onBeforeCompile = (base as THREE.MeshStandardMaterial).onBeforeCompile;
      h.customProgramCacheKey = (base as THREE.MeshStandardMaterial).customProgramCacheKey;
      h.userData.biolabHighlight = true;
      this.highlights.set(base, h);
    }
    return h;
  }

  hoverFor(base: THREE.Material): THREE.MeshStandardMaterial {
    let h = this.hovers.get(base);
    if (!h) {
      h = (base as THREE.MeshStandardMaterial).clone();
      h.emissive = new THREE.Color('#0EA5C6');
      h.emissiveIntensity = 0.18;
      h.onBeforeCompile = (base as THREE.MeshStandardMaterial).onBeforeCompile;
      h.customProgramCacheKey = (base as THREE.MeshStandardMaterial).customProgramCacheKey;
      h.userData.biolabHover = true;
      this.hovers.set(base, h);
    }
    const b = base as THREE.MeshStandardMaterial;
    if (h.opacity !== b.opacity || h.transparent !== b.transparent) {
      h.opacity = b.opacity;
      h.transparent = b.transparent;
      h.depthWrite = b.depthWrite;
      h.needsUpdate = true;
    }
    return h;
  }

  isHighlight(m: THREE.Material) {
    return m === this.highlight || (m as THREE.MeshStandardMaterial).userData?.biolabHighlight === true;
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
    for (const m of this.base.values()) {
      this.highlights.get(m)?.dispose();
      this.hovers.get(m)?.dispose();
      m.dispose();
    }
    this.base.clear();
    this.highlight.dispose();
    this.hoverMat.dispose();
    this.ghost.dispose();
  }
}
