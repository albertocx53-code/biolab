/**
 * Shared biological data model used by Explorer (3D labs) and, in phase 2,
 * by Studio (content generators). Every selectable structure has a stable id.
 */
import { z } from 'zod';

export const LABORATORY_IDS = ['anatomia-humana', 'plantas', 'animais', 'celulas', 'genetica', 'microrganismos'] as const;
export const LaboratoryIdSchema = z.enum(LABORATORY_IDS);
export type LaboratoryId = z.infer<typeof LaboratoryIdSchema>;

/** How faithfully a visualization represents reality — always shown to the user. */
export const RepresentationSchema = z.enum([
  'realista', // derived from real anatomical data
  'simplificado', // simplified educational model
  'esquematico', // schematic illustration
  'fora-de-escala', // not to scale
  'tempo-comprimido', // time-compressed animation
]);
export type Representation = z.infer<typeof RepresentationSchema>;

export const ReferenceSchema = z.object({
  title: z.string(),
  publisher: z.string(),
  url: z.string().url(),
  license: z.string().optional(),
});
export type Reference = z.infer<typeof ReferenceSchema>;

export const AttributionSchema = z.object({
  text: z.string(),
  license: z.string(),
  url: z.string().url(),
});
export type Attribution = z.infer<typeof AttributionSchema>;

export const StructureSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  laboratoryId: LaboratoryIdSchema,
  modelId: z.string(),
  parentStructureId: z.string().nullable(),
  namePtBR: z.string().min(1),
  scientificName: z.string().nullable(),
  /** English Terminologia Anatomica name, as in the source dataset. */
  sourceName: z.string(),
  category: z.string(),
  biologicalSystem: z.string(),
  description: z.string().nullable(),
  function: z.string().nullable(),
  relatedStructures: z.array(z.string()),
  educationalTopics: z.array(z.string()),
  modelMeshIds: z.array(z.string()),
  scientificReferences: z.array(ReferenceSchema),
  assetAttributions: z.array(AttributionSchema),
  /** True when description/function were written and reviewed for this structure. */
  contentReviewed: z.boolean(),
});
export type Structure = z.infer<typeof StructureSchema>;

export const LaboratoryStatusSchema = z.enum(['disponivel', 'em-desenvolvimento', 'planejado']);
export type LaboratoryStatus = z.infer<typeof LaboratoryStatusSchema>;
