/**
 * Images rendered from the 3D laboratories for the Studio generators
 * (see scripts/studio-renders.ts). Pure data, shared by server and client.
 */

/** A structure visible in a render, at a fraction of the image width/height. */
export interface StudioLabel {
  id: string;
  x: number;
  y: number;
  /** Share of sampled points that were visible (rough on-screen size). */
  vis: number;
}

export interface StudioImage {
  /** Colour render of the 3D scene (webp, under /public). */
  src: string;
  /** Structure images: the whole model with this structure highlighted (others ghosted). */
  context?: string;
  /** Black-and-white line drawing of the same view (model views only). */
  line?: string;
  w: number;
  h: number;
  caption: string;
  kind: 'model' | 'structure' | 'process' | 'group';
  /** Model, structure, process or group shown. */
  ref?: string;
  /** Process step shown (process images). */
  step?: number;
  /** 3D model that was on screen. */
  model?: string;
  /** Structures visible in the view (model views only). */
  labels?: StudioLabel[];
}

export interface LessonRenders {
  cover: StudioImage;
  /** Images per lesson action, keyed `${sectionIndex}-${actionIndex}`. */
  actions: Record<string, StudioImage[]>;
}

export type StudioRenders = Record<string, LessonRenders>;
