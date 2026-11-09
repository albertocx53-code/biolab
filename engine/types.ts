/** Catalog types shared by all laboratories (engine-facing, compact). */
export interface CatalogModel {
  id: string;
  /** Public URL of the GLB file. */
  url: string;
  bytes: number;
  label: string;
}

export interface CatalogGroup {
  id: string;
  name: string;
  /** Model files that must be loaded for this group to be shown. */
  modelId: string;
  color: string;
  defaultVisible: boolean;
  defaultOpacity: number;
  order: number;
}

export interface CatalogMesh {
  id: string;
  modelId: string;
  group: string;
  /** Material class used to pick a shared material. */
  material: string;
  center: [number, number, number];
  size: [number, number, number];
}
