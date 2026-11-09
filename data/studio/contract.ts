/**
 * Explorer → Studio integration contract (v1).
 * Explorer only sends stable identifiers; Studio resolves metadata server-side
 * from the shared catalog, so URLs cannot inject arbitrary content.
 */
import { z } from 'zod';
import { LaboratoryIdSchema } from '@/data/biology/schema';

export const StudioTopicRefSchema = z.object({
  v: z.literal(1),
  laboratoryId: LaboratoryIdSchema,
  structureId: z.string().regex(/^[a-z0-9-]+$/).max(120),
});
export type StudioTopicRef = z.infer<typeof StudioTopicRefSchema>;

export const STUDIO_GENERATORS = [
  { id: 'slides', name: 'Slides de apresentação' },
  { id: 'atividades', name: 'Atividades para alunos' },
  { id: 'mapas-mentais', name: 'Mapas mentais' },
  { id: 'planos-de-aula', name: 'Planos de aula' },
  { id: 'aulas-emergenciais', name: 'Aulas emergenciais' },
] as const;

export function studioUrl(ref: Omit<StudioTopicRef, 'v'>): string {
  const p = new URLSearchParams({ v: '1', lab: ref.laboratoryId, estrutura: ref.structureId });
  return `/studio?${p.toString()}`;
}

export function parseStudioParams(sp: Record<string, string | string[] | undefined>): StudioTopicRef | null {
  const r = StudioTopicRefSchema.safeParse({ v: Number(sp.v), laboratoryId: sp.lab, structureId: sp.estrutura });
  return r.success ? r.data : null;
}
